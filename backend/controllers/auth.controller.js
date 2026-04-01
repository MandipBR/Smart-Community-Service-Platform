import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import sendEmail from "../utils/sendEmail.js";
import generateToken from "../utils/generateToken.js";
import { OAuth2Client } from "google-auth-library";
import {
  signupSchema,
  loginSchema,
  googleSchema,
  onboardingSchema,
} from "../validators/auth.schemas.js";
import { validate } from "../validators/validate.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const parseCookies = (cookieHeader = "") => {
  return cookieHeader.split(";").reduce((acc, pair) => {
    const [rawKey, ...rawVal] = pair.trim().split("=");
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rawVal.join("="));
    return acc;
  }, {});
};

const ensureOrganization = async (user, payload = {}) => {
  if (!user || user.role !== "organization") return null;

  const update = {
    name: payload.organizationName || payload.name || user.organizationName || user.name,
    type: payload.organizationType || user.organizationType || "",
    description: payload.bio || user.bio || "",
    location: payload.location || user.location || "",
    approvalStatus: user.orgApprovalStatus || "pending",
    teamMembers: Array.isArray(payload.teamMembers) ? payload.teamMembers : user.teamMembers || [],
  };

  let org = null;
  if (user.organizationId) {
    org = await Organization.findByIdAndUpdate(user.organizationId, update, {
      new: true,
    });
  } else {
    org = await Organization.findOneAndUpdate(
      { createdBy: user._id },
      { $set: update, $setOnInsert: { createdBy: user._id } },
      { new: true, upsert: true }
    );
    if (org && !user.organizationId) {
      user.organizationId = org._id;
      await user.save();
    }
  }
  return org;
};

export const signup = async (req, res) => {
  const parsed = validate(signupSchema, req.body, res);
  if (!parsed) return;
  const { name, email, password, role, organizationType, csrfToken } = parsed;

  const cookies = parseCookies(req.headers.cookie);
  if (!csrfToken || cookies.g_csrf_token !== csrfToken) {
    return res.status(403).json({ message: "CSRF validation failed" });
  }

  if (await User.findOne({ email }))
    return res.status(400).json({ message: "Email already exists" });

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const allowOrgSignup = process.env.ALLOW_ORG_SIGNUP === "true";
  if (role === "organization" && !allowOrgSignup) {
    return res
      .status(403)
      .json({ message: "Organization signup is currently disabled" });
  }
  const userRole =
    role === "organization" && allowOrgSignup ? "organization" : "volunteer";
  const orgApprovalStatus = userRole === "organization" ? "pending" : "approved";

  const createdUser = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role: userRole,
    organizationType: organizationType || "",
    orgApprovalStatus,
    verificationToken,
  });
  if (userRole === "organization") {
    await ensureOrganization(createdUser, {
      name,
      organizationName: name,
      organizationType,
    });
  }

  const frontendBase = process.env.FRONTEND_URL || process.env.API_URL || "";
  const link = `${frontendBase}/verify/${verificationToken}`;

  try {
    await sendEmail(
      email,
      "Verify your account",
      `<p>Click below to verify your account</p><a href="${link}">Verify Email</a>`
    );
    res.json({ message: "Verification email sent" });
  } catch (err) {
    console.error("Email send failed:", err);
    res.status(500).json({
      message: "Failed to send verification email",
    });
  }
};

export const verifyEmail = async (req, res) => {
  const user = await User.findOne({
    verificationToken: req.params.token,
  });

  if (!user)
    return res.redirect(`${process.env.FRONTEND_URL}/login?verified=false`);

  user.isVerified = true;
  user.verificationToken = null;
  await user.save();

  res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
};

export const login = async (req, res) => {
  const parsed = validate(loginSchema, req.body, res);
  if (!parsed) return;
  const { email, password, csrfToken } = parsed;

  const cookies = parseCookies(req.headers.cookie);
  if (!csrfToken || cookies.g_csrf_token !== csrfToken) {
    return res.status(403).json({ message: "CSRF validation failed" });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  if (!user.isVerified)
    return res.status(403).json({ message: "Please verify email first" });
  if (user.role === "organization" && user.orgApprovalStatus !== "approved") {
    return res.status(403).json({
      message: "Organization account is pending admin approval",
    });
  }

  if (!user.password) {
    return res
      .status(400)
      .json({ message: "Use Google sign-in for this account" });
  }

  try {
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });
  } catch (err) {
    console.error("Password hash error:", err);
    return res
      .status(400)
      .json({ message: "Invalid password hash for this account" });
  }

  res.json({
    token: generateToken(user),
    user: {
      id: user._id,
      name: user.name,
      role: user.role,
    },
  });
};

export const googleSignIn = async (req, res) => {
  const parsed = validate(googleSchema, req.body, res);
  if (!parsed) return;
  const { credential, csrfToken, role } = parsed;

  const cookies = parseCookies(req.headers.cookie);
  if (!csrfToken || cookies.g_csrf_token !== csrfToken) {
    return res.status(403).json({ message: "CSRF validation failed" });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const googleId = payload?.sub;
    const email = payload?.email;
    const name = payload?.name || "Google User";

    if (!googleId || !email) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    const allowOrgSignup = process.env.ALLOW_ORG_SIGNUP === "true";
    if (role === "organization" && !allowOrgSignup) {
      return res
        .status(403)
        .json({ message: "Organization signup is currently disabled" });
    }
    const userRole =
      role === "organization" && allowOrgSignup ? "organization" : "volunteer";
    const orgApprovalStatus =
      userRole === "organization" ? "pending" : "approved";

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: "",
        role: userRole,
        orgApprovalStatus,
        isVerified: true,
      });
      if (userRole === "organization") {
        await ensureOrganization(user, {
          name,
          organizationName: name,
          organizationType: user.organizationType || "",
        });
      }
    } else if (!user.isVerified) {
      user.isVerified = true;
      user.verificationToken = null;
      await user.save();
    }
    if (user.role === "organization" && user.orgApprovalStatus !== "approved") {
      return res.status(403).json({
        message: "Organization account is pending admin approval",
      });
    }

    res.json({
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Google sign-in failed:", err);
    res.status(401).json({ message: "Google sign-in failed" });
  }
};

export const getMe = async (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    onboardingCompleted: req.user.onboardingCompleted,
    profile: {
      phone: req.user.phone,
      bio: req.user.bio,
      location: req.user.location,
      organizationName: req.user.organizationName,
      organizationType: req.user.organizationType,
      causes: req.user.causes,
      skills: req.user.skills,
      availability: req.user.availability,
      teamMembers: req.user.teamMembers,
    },
    orgApprovalStatus: req.user.orgApprovalStatus,
  });
};

export const getOrgStatus = async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  const org = await User.findOne({ email, role: "organization" }).select(
    "orgApprovalStatus"
  );
  if (!org) {
    return res.status(404).json({ message: "Organization not found" });
  }
  res.json({ orgApprovalStatus: org.orgApprovalStatus });
};

export const completeOnboarding = async (req, res) => {
  const parsed = validate(onboardingSchema, req.body, res);
  if (!parsed) return;
  const {
    phone,
    bio,
    location,
    organizationName,
    causes,
    skills,
    availability,
    teamMembers,
  } = parsed;

  const update = {
    phone: phone || "",
    bio: bio || "",
    location: location || "",
    causes: Array.isArray(causes) ? causes : [],
    skills: Array.isArray(skills) ? skills : [],
    availability: availability || "",
  };

  if (req.user.role === "organization") {
    if (!organizationName) {
      return res
        .status(400)
        .json({ message: "Organization name is required" });
    }
    update.organizationName = organizationName;
    update.teamMembers = Array.isArray(teamMembers) ? teamMembers : [];
  }

  req.user.set(update);
  req.user.onboardingCompleted = true;
  await req.user.save();
  if (req.user.role === "organization") {
    await ensureOrganization(req.user, {
      organizationName,
      organizationType: req.user.organizationType,
      bio,
      location,
      teamMembers,
    });
  }

  res.json({ message: "Onboarding completed" });
};
