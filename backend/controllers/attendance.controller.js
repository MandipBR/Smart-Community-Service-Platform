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
  try {
    const { userId, eventId, status } = req.body;
    if (!userId || !eventId || !status) {
      return res.status(400).json({ message: "Missing required fields.", data: {} });
    }
    const attendance = await Attendance.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(userId), eventId },
      { status: status, verifiedByOrg: true },
      { upsert: true, new: true }
    );

    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found.", data: {} });
    }

    return res.json({ message: "Attendance updated.", data: attendance });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error.", data: {} });
  }
};

export const getAttendanceByEvent = async (req, res) => {
  const { eventId } = req.params;
  console.log("Event ID:", eventId);

  const event = await Event.findById(eventId).populate("volunteers.user", "name email");
  if (!event) {
    console.log("Event not found");
    return res.status(404).json({ message: "Event not found" });
  }
  console.log("Event:", event);

  if (event.organization.toString() !== req.user._id.toString()) {
    console.log("Unauthorized access");
    return res.status(403).json({ message: "Only the hosting organization can view attendance" });
  }

  const attendance = await Attendance.find({ eventId });
  console.log("Attendance:", attendance);

  const attendanceMap = new Map(
    attendance.map((item) => [item.userId.toString(), item])
  );
  console.log("Attendance Map:", attendanceMap);

  const volunteers = (event.volunteers || []).map((entry) => {
    const user = entry.user;
    const record = attendanceMap.get(entry.user.toString());
    console.log("Volunteer:", user);
    console.log("Record:", record);
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

  console.log("Volunteers:", volunteers);
  res.json({ eventId, volunteers });
};