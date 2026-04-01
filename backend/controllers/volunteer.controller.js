import VolunteerLog from "../models/VolunteerLog.js";
import User from "../models/User.js";
import Event from "../models/Event.js";
import { logHoursSchema } from "../validators/volunteer.schemas.js";
import { validate } from "../validators/validate.js";
import { sendNotification } from "../utils/notification.js";

const impactLevel = (score) => {
  if (score >= 700) return "Impact Leader";
  if (score >= 300) return "Community Hero";
  if (score >= 100) return "Active Volunteer";
  return "Beginner Volunteer";
};

export const logHours = async (req, res) => {
  const parsed = validate(logHoursSchema, req.body, res);
  if (!parsed) return;
  const { eventId, hours } = parsed;

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  const hoursNum = Number(hours);
  const pointsEarned = hoursNum * 10;

  await VolunteerLog.create({
    user: req.user._id,
    event: eventId,
    hours: hoursNum,
    pointsEarned,
  });

  const user = await User.findById(req.user._id);
  user.points += pointsEarned;
  user.level = Math.floor(user.points / 100) + 1;

  if (user.points >= 100 && !user.badges.includes("100 Points")) {
    user.badges.push("100 Points");
  }

  await user.save();

  await sendNotification(
    user._id,
    "CERTIFICATE_READY",
    `Your ${hoursNum} hours for ${event.title} were recorded.`
  );

  res.json({ message: "Volunteer hours logged" });
};

export const getStats = async (req, res) => {
  const logs = await VolunteerLog.find({ user: req.user._id });
  const totalHours = logs.reduce((a, b) => a + b.hours, 0);
  const eventsCompleted = new Set(logs.map((log) => log.event?.toString())).size;
  const impactScore =
    totalHours * 2 + eventsCompleted * 5 + req.user.points * 1 + (req.user.badges?.length || 0) * 10;
  res.json({
    totalHours,
    points: req.user.points,
    level: req.user.level,
    badges: req.user.badges,
    impactScore,
    impactLevel: impactLevel(impactScore),
    eventsCompleted,
  });
};

export const getPublicProfile = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== "volunteer") {
    return res.status(404).json({ message: "Volunteer not found" });
  }

  const logs = await VolunteerLog.find({ user: user._id }).populate({
    path: "event",
    populate: { path: "organization", select: "name organizationName" },
  });

  const totalHours = logs.reduce((a, b) => a + (b.hours || 0), 0);
  const events = logs
    .map((log) => log.event)
    .filter(Boolean)
    .map((event) => ({
      id: event._id,
      title: event.title,
      date: event.date,
      organization: event.organization?.organizationName || event.organization?.name,
    }));

  const orgs = new Map();
  logs.forEach((log) => {
    const org = log.event?.organization;
    if (org) {
      orgs.set(org._id.toString(), org.organizationName || org.name);
    }
  });

  const recommendedEvents = await Event.find({
    $or: [
      { tags: { $in: user.causes || [] } },
      { skills: { $in: user.skills || [] } },
    ],
  })
    .sort({ date: 1 })
    .limit(6)
    .select("title date location tags skills");

  res.json({
    id: user._id,
    name: user.name,
    bio: user.bio || "",
    causes: user.causes || [],
    skills: user.skills || [],
    points: user.points,
    badges: user.badges || [],
    totalHours,
    eventsParticipated: events,
    organizationsWorkedWith: Array.from(orgs.values()),
    recommendedEvents,
  });
};

export const getLeaderboard = async (req, res) => {
  const leaderboard = await VolunteerLog.aggregate([
    {
      $group: {
        _id: "$user",
        totalHours: { $sum: "$hours" },
        points: { $sum: "$pointsEarned" },
        eventsCompleted: { $addToSet: "$event" },
      },
    },
    {
      $addFields: {
        eventsCompleted: { $size: "$eventsCompleted" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $match: { "user.role": "volunteer" } },
    {
      $project: {
        _id: 0,
        id: "$user._id",
        name: "$user.name",
        totalHours: 1,
        points: 1,
        eventsCompleted: 1,
        badges: "$user.badges",
      },
    },
    { $sort: { totalHours: -1, points: -1 } },
    { $limit: 50 },
  ]);

  res.json(leaderboard);
};

export const getImpactProfile = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== "volunteer") {
    return res.status(404).json({ message: "Volunteer not found" });
  }

  const logs = await VolunteerLog.find({ user: user._id }).populate("event");
  const totalHours = logs.reduce((a, b) => a + (b.hours || 0), 0);
  const eventsCompleted = new Set(logs.map((log) => log.event?._id?.toString())).size;
  const impactScore =
    totalHours * 2 + eventsCompleted * 5 + user.points * 1 + (user.badges?.length || 0) * 10;

  const timeline = logs.map((log) => ({
    id: log._id,
    hours: log.hours,
    eventTitle: log.event?.title || "Event",
    date: log.createdAt,
  }));

  const skillGaps = new Set();
  const eventSkills = logs
    .map((log) => log.event?.skills || [])
    .flat()
    .filter(Boolean);
  eventSkills.forEach((skill) => {
    if (!user.skills?.includes(skill)) skillGaps.add(skill);
  });

  res.json({
    id: user._id,
    name: user.name,
    impactScore,
    impactLevel: impactLevel(impactScore),
    totalHours,
    eventsCompleted,
    badges: user.badges || [],
    timeline,
    skillGaps: Array.from(skillGaps).slice(0, 5),
  });
};
