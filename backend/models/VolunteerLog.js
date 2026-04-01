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

export default mongoose.model("VolunteerLog", volunteerLogSchema);
