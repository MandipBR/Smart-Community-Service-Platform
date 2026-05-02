import User from "../models/User.js";
import Organization from "../models/Organization.js";
import Event from "../models/Event.js";
import VolunteerLog from "../models/VolunteerLog.js";
import Notification from "../models/Notification.js";
import Review from "../models/Review.js";
import Attendance from "../models/Attendance.js";
import multer from "multer";
import path from "path";
import { updateProfileSchema } from "../validators/volunteer.schemas.js";
import { validate } from "../validators/validate.js";

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Fix: restrict to safe image MIME types only — image/svg+xml can contain XSS
  const SAFE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (SAFE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, WebP and GIF images are allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

export const getMe = async (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    avatar: req.user.avatar,
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
    "name email role bio location causes skills organizationName organizationType orgApprovalStatus avatar"
  );
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
};

export const updateProfile = async (req, res) => {
  const parsed = validate(updateProfileSchema, req.body, res);
  if (!parsed) return;

  const update = {
    name: parsed.name ?? req.user.name,
    phone: parsed.phone ?? req.user.phone,
    bio: parsed.bio ?? req.user.bio,
    location: parsed.location ?? req.user.location,
    causes: Array.isArray(parsed.causes) ? parsed.causes : req.user.causes,
    skills: Array.isArray(parsed.skills) ? parsed.skills : req.user.skills,
    availability: parsed.availability ?? req.user.availability,
  };

  if (req.user.role === "organization") {
    update.organizationName = parsed.organizationName ?? req.user.organizationName;
    update.organizationType = parsed.organizationType ?? req.user.organizationType;
    update.teamMembers = Array.isArray(parsed.teamMembers)
      ? parsed.teamMembers
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

export const uploadAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload a file" });
  }

  const avatarUrl = `/uploads/${req.file.filename}`;
  req.user.avatar = avatarUrl;
  await req.user.save();

  res.json({
    message: "Avatar uploaded successfully",
    avatar: avatarUrl,
  });
};

export const deleteMe = async (req, res) => {
  const userId = req.user._id;

  if (req.user.role === "organization") {
    const orgEvents = await Event.find({ organization: userId }).select("_id");
    const eventIds = orgEvents.map((event) => event._id);

    if (eventIds.length) {
      await VolunteerLog.deleteMany({ event: { $in: eventIds } });
      await Attendance.deleteMany({ eventId: { $in: eventIds } });
      await Event.deleteMany({ _id: { $in: eventIds } });
    }

    await Organization.deleteMany({
      $or: [{ createdBy: userId }, { _id: req.user.organizationId }].filter(
        (entry) => Object.values(entry)[0]
      ),
    });
    await Review.deleteMany({ organization: userId });
  } else {
    await Event.updateMany(
      { "volunteers.user": userId },
      { $pull: { volunteers: { user: userId } } }
    );
    await VolunteerLog.deleteMany({ user: userId });
    await Attendance.deleteMany({ userId });
    await Review.deleteMany({ volunteer: userId });
  }

  await Notification.deleteMany({ user: userId });
  await User.findByIdAndDelete(userId);

  res.json({ message: "Account deleted successfully" });
};
