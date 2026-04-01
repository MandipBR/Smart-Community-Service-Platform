import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "editor", "viewer"],
      default: "viewer",
    },
  },
  { _id: false }
);

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, default: "" },
    description: { type: String, default: "" },
    location: { type: String, default: "" },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    teamMembers: { type: [teamMemberSchema], default: [] },
    rating: { type: Number, default: 0 },
    totalEvents: { type: Number, default: 0 },
    totalImpactHours: { type: Number, default: 0 },
  },
  { timestamps: true }
);

organizationSchema.index({ createdBy: 1 }, { unique: true });

export default mongoose.model("Organization", organizationSchema);
