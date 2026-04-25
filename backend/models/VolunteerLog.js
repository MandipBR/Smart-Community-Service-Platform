import mongoose from "mongoose";

const volunteerLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    hours: Number,
    pointsEarned: Number,
  },
  { timestamps: true }
);

volunteerLogSchema.index(
  { user: 1, event: 1 },
  {
    unique: true,
    partialFilterExpression: {
      user: { $type: "objectId" },
      event: { $type: "objectId" },
    },
  }
);

export default mongoose.model("VolunteerLog", volunteerLogSchema);
