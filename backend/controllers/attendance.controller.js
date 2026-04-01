import Attendance from "../models/Attendance.js";
import Event from "../models/Event.js";
import User from "../models/User.js";
import VolunteerLog from "../models/VolunteerLog.js";
import { sendNotification } from "../utils/notification.js";

const awardHours = async ({ userId, eventId, hours }) => {
  const existing = await VolunteerLog.findOne({ user: userId, event: eventId });
  if (existing) return existing;

  const pointsEarned = hours * 10;
  const log = await VolunteerLog.create({
    user: userId,
    event: eventId,
    hours,
    pointsEarned,
  });

  const user = await User.findById(userId);
  if (user) {
    user.points += pointsEarned;
    user.level = Math.floor(user.points / 100) + 1;
    if (user.points >= 100 && !user.badges.includes("100 Points")) {
      user.badges.push("100 Points");
    }
    await user.save();
  }

  await sendNotification(
    userId,
    "CERTIFICATE_READY",
    "Your volunteer hours have been verified."
  );

  return log;
};

export const markAttendance = async (req, res) => {
  const { eventId, userId, status, verifiedByOrg } = req.body;
  if (!eventId || !userId) {
    return res.status(400).json({ message: "eventId and userId are required" });
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }
  if (event.organization.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Only the hosting organization can mark attendance" });
  }

  const update = {
    status: status === "present" ? "present" : "absent",
    verifiedByOrg: Boolean(verifiedByOrg),
    timestamp: new Date(),
  };

  const attendance = await Attendance.findOneAndUpdate(
    { eventId, userId },
    { $set: update },
    { new: true, upsert: true }
  );

  if (attendance.status === "present" && attendance.verifiedByOrg) {
    const hours = event.hours || 1;
    await awardHours({ userId, eventId, hours });
  }

  res.json({ message: "Attendance updated", attendance });
};

export const getAttendanceByEvent = async (req, res) => {
  const { eventId } = req.params;
  const event = await Event.findById(eventId).populate("volunteers.user", "name email");
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }
  if (event.organization.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Only the hosting organization can view attendance" });
  }

  const attendance = await Attendance.find({ eventId });
  const attendanceMap = new Map(
    attendance.map((item) => [item.userId.toString(), item])
  );

  const volunteers = (event.volunteers || []).map((entry) => {
    const user = entry.user;
    const record = attendanceMap.get(entry.user.toString());
    return {
      userId: entry.user.toString(),
      name: user?.name || "Volunteer",
      email: user?.email || "",
      approved: entry.approved,
      status: record?.status || "absent",
      verifiedByOrg: record?.verifiedByOrg || false,
      timestamp: record?.timestamp || null,
    };
  });

  res.json({ eventId, volunteers });
};
