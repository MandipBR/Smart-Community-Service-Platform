import User from "../models/User.js";
import Organization from "../models/Organization.js";

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

export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "name email role bio location causes skills organizationName organizationType orgApprovalStatus"
  );
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
};

export const updateProfile = async (req, res) => {
  const update = {
    name: req.body.name ?? req.user.name,
    phone: req.body.phone ?? req.user.phone,
    bio: req.body.bio ?? req.user.bio,
    location: req.body.location ?? req.user.location,
    causes: Array.isArray(req.body.causes) ? req.body.causes : req.user.causes,
    skills: Array.isArray(req.body.skills) ? req.body.skills : req.user.skills,
    availability: req.body.availability ?? req.user.availability,
  };

  if (req.user.role === "organization") {
    update.organizationName =
      req.body.organizationName ?? req.user.organizationName;
    update.organizationType =
      req.body.organizationType ?? req.user.organizationType;
    update.teamMembers = Array.isArray(req.body.teamMembers)
      ? req.body.teamMembers
      : req.user.teamMembers;
  }

  req.user.set(update);
  await req.user.save();

  if (req.user.role === "organization") {
    const orgUpdate = {
      name: update.organizationName || req.user.name,
      type: update.organizationType || "",
      description: update.bio || "",
      location: update.location || "",
      teamMembers: update.teamMembers || [],
      approvalStatus: req.user.orgApprovalStatus,
      createdBy: req.user._id,
    };
    await Organization.findOneAndUpdate(
      { createdBy: req.user._id },
      { $set: orgUpdate },
      { new: true, upsert: true }
    );
  }

  res.json({ message: "Profile updated" });
};
