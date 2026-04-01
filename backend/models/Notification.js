import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "JOIN_APPROVED",
        "EVENT_REMINDER",
        "ORG_APPROVED",
        "NEW_MATCH",
        "CERTIFICATE_READY",
        // legacy types (kept for backward compatibility)
        "EVENT_JOIN_APPROVED",
        "ORG_REJECTED",
        "NEW_EVENT_MATCH",
        "HOURS_APPROVED",
      ],
      required: true,
    },
    message: { type: String, required: true },
    meta: { type: Object, default: {} },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
