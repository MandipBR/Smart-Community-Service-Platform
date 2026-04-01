import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    location: String,
    locationLat: Number,
    locationLng: Number,
    hours: { type: Number, required: true, min: 0.5 },
    difficultyFactor: { type: Number, default: 1 },
    tags: [{ type: String, default: [] }],
    skills: [{ type: String, default: [] }],

    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    volunteers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        approved: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
