import Attendance from "../models/Attendance.js";
import Event from "../models/Event.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import VolunteerLog from "../models/VolunteerLog.js";
import { sendNotification } from "../utils/notification.js";
import sendEmail from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";

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

  await User.updateOne(
    { _id: userId },
    [
      {
        $set: {
          points: { $add: [{ $ifNull: ["$points", 0] }, pointsEarned] },
          _badges: { $ifNull: ["$badges", []] },
        },
      },
      {
        $set: {
          level: { $add: [{ $floor: { $divide: ["$points", 100] } }, 1] },
          badges: {
            $cond: [
              {
                $and: [
                  { $gte: ["$points", 100] },
                  { $not: [{ $in: ["100 Points", "$_badges"] }] },
                ],
              },
              { $concatArrays: ["$_badges", ["100 Points"]] },
              "$_badges",
            ],
          },
        },
      },
      { $unset: "_badges" },
    ]
  );

  await sendNotification(
    userId,
    "CERTIFICATE_READY",
    "Your volunteer hours have been verified."
  );

  return log;
};

const isObjectId = (value) => mongoose.isValidObjectId(value);

const ensureOrgCanManageEvent = async (eventId, orgUserId) => {
  const event = await Event.findById(eventId).select(
    "_id organization hours title location date volunteers"
  );
  if (!event) return { error: { code: 404, message: "Event not found" } };
  if (event.organization.toString() !== orgUserId.toString()) {
    return {
      error: {
        code: 403,
        message: "Only the hosting organization can manage attendance",
      },
    };
  }
  return { event };
};

const validateVolunteerForEvent = (event, userId) => {
  const volunteer = (event.volunteers || []).find(
    (entry) => entry.user?.toString() === userId.toString()
  );
  if (!volunteer) {
    return {
      error: {
        code: 404,
        message: "Volunteer is not registered for this event",
      },
    };
  }
  if (!volunteer.approved) {
    return {
      error: {
        code: 403,
        message: "Volunteer must be approved before attendance can be marked",
      },
    };
  }
  return { volunteer };
};

const upsertAttendance = async ({ userId, eventId, status }) => {
  return Attendance.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId), eventId },
    {
      $set: {
        status,
        verifiedByOrg: true,
        timestamp: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

export const markAttendance = async (req, res) => {
  try {
    const { userId, eventId, status } = req.body;
    if (process.env.NODE_ENV !== "production") {
      console.log("[attendance/mark] req.body:", req.body);
      console.log("[attendance/mark] req.user:", {
        id: req.user?._id?.toString?.(),
        role: req.user?.role,
      });
      console.log("[attendance/mark] payload ids:", { userId, eventId, status });
    }
    if (!userId || !eventId || !status) {
      return res.status(400).json({
        message: "Invalid attendance data",
        details: { userId, eventId, status, reason: "Missing required fields" },
        data: {},
      });
    }
    if (!isObjectId(userId) || !isObjectId(eventId)) {
      return res.status(400).json({
        message: "Invalid attendance data",
        details: { userId, eventId, status, reason: "Invalid userId/eventId" },
        data: {},
      });
    }
    if (!["present", "absent"].includes(status)) {
      return res.status(400).json({
        message: "Invalid attendance data",
        details: { userId, eventId, status, reason: "Invalid status" },
        data: {},
      });
    }

    const { event, error: eventError } = await ensureOrgCanManageEvent(
      eventId,
      req.user._id
    );
    if (eventError) {
      return res
        .status(eventError.code)
        .json({ message: eventError.message, data: {} });
    }

    const { error: volunteerError } = validateVolunteerForEvent(event, userId);
    if (volunteerError) {
      return res
        .status(volunteerError.code)
        .json({ message: volunteerError.message, data: {} });
    }

    const attendance = await upsertAttendance({ userId, eventId, status });

    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found.", data: {} });
    }

    const volunteerUser = await User.findById(userId).select("name email");
    await sendNotification(
      userId,
      "EVENT_REMINDER",
      `Attendance marked as ${status} for ${event.title}.`,
      { eventId }
    );

    if (volunteerUser?.email) {
      try {
        await sendEmail(
          volunteerUser.email,
          `Attendance Updated: ${event.title}`,
          `<div style="font-family: sans-serif; max-width: 640px;">
            <h2>Attendance marked as ${status}</h2>
            <p><strong>Event:</strong> ${event.title}</p>
            <p><strong>Date:</strong> ${event.date ? new Date(event.date).toLocaleString() : "TBD"}</p>
            <p><strong>Location:</strong> ${event.location || "Location TBD"}</p>
          </div>`
        );
      } catch (emailErr) {
        console.error("Attendance update email failed:", emailErr?.message || emailErr);
      }
    }

    if (status === "present") {
      const log = await awardHours({
        userId,
        eventId,
        hours: Number(event.hours) || 1,
      });

      if (volunteerUser?.email) {
        try {
          await sendEmail(
            volunteerUser.email,
            `Certificate Eligibility Updated: ${event.title}`,
            `<div style="font-family: sans-serif; max-width: 640px;">
              <h2>Your participation has been verified</h2>
              <p>You can now access your certificate from your dashboard.</p>
              <p><strong>Event:</strong> ${event.title}</p>
              <p><strong>Hours credited:</strong> ${log?.hours || event.hours || 1}</p>
            </div>`
          );
        } catch (emailErr) {
          console.error(
            "Certificate eligibility email failed:",
            emailErr?.message || emailErr
          );
        }
      }
    }

    return res.json({ message: "Attendance updated.", data: attendance });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error.", data: {} });
  }
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
    const volunteerId =
      typeof user === "string"
        ? user
        : user?._id?.toString?.() || entry.user?.toString?.() || "";
    const record = attendanceMap.get(volunteerId);
    return {
      userId: volunteerId,
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

export const scanAttendance = async (req, res) => {
  try {
    const { userId, eventId, qrToken } = req.body;
    if (!userId || !eventId || !qrToken) {
      return res.status(400).json({ message: "Missing required fields.", data: {} });
    }
    if (!isObjectId(userId) || !isObjectId(eventId)) {
      return res.status(400).json({ message: "Invalid userId/eventId.", data: {} });
    }

    let decoded;
    try {
      decoded = jwt.verify(qrToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid QR token.", data: {} });
    }

    if (
      decoded?.type !== "attendance_qr" ||
      decoded?.userId !== userId ||
      decoded?.eventId !== eventId
    ) {
      return res.status(401).json({ message: "QR token does not match request.", data: {} });
    }

    const { event, error: eventError } = await ensureOrgCanManageEvent(
      eventId,
      req.user._id
    );
    if (eventError) {
      return res
        .status(eventError.code)
        .json({ message: eventError.message, data: {} });
    }

    const { error: volunteerError } = validateVolunteerForEvent(event, userId);
    if (volunteerError) {
      return res
        .status(volunteerError.code)
        .json({ message: volunteerError.message, data: {} });
    }

    const attendance = await upsertAttendance({
      userId,
      eventId,
      status: "present",
    });

    const volunteerUser = await User.findById(userId).select("email");
    await awardHours({
      userId,
      eventId,
      hours: Number(event.hours) || 1,
    });

    await sendNotification(
      userId,
      "EVENT_REMINDER",
      `Attendance scanned and marked present for ${event.title}.`,
      { eventId }
    );

    if (volunteerUser?.email) {
      try {
        await sendEmail(
          volunteerUser.email,
          `Attendance Scanned: ${event.title}`,
          `<div style="font-family: sans-serif; max-width: 640px;">
            <h2>Attendance successfully verified</h2>
            <p><strong>Event:</strong> ${event.title}</p>
            <p>Your hours have been recorded for this event.</p>
          </div>`
        );
      } catch (emailErr) {
        console.error("Attendance scan email failed:", emailErr?.message || emailErr);
      }
    }

    return res.json({ message: "Attendance scanned and updated.", data: attendance });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error.", data: {} });
  }
};
