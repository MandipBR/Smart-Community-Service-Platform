import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
    },

    role: {
      type: String,
      enum: ["volunteer", "organization", "admin"],
      default: "volunteer",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: String,
    resetToken: String,

    // OTP for login
    loginOtp: String,
    loginOtpExpires: Date,

    // Gamification
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [{ type: String }],

    // Profile & identity
    avatar: { type: String, default: "" },
    phone: String,
    bio: String,
    location: String,
    organizationName: String,
    organizationType: String,
    registrationProofUrl: String,
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    orgApprovalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    causes: [{ type: String }],
    skills: [{ type: String }],
    availability: String,
    onboardingCompleted: { type: Boolean, default: false },

    teamMembers: [
      {
        name: String,
        email: String,
        role: {
          type: String,
          enum: ["admin", "editor", "viewer"],
          default: "viewer",
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
