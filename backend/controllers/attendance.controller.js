import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import Event from "../models/Event.js";
import User from "../models/User.js";
import VolunteerLog from "../models/VolunteerLog.js";
import Notification from "../models/Notification.js";
import { sendNotification } from "../utils/notification.js";
import sendEmail from "../utils/sendEmail.js";
import { createObjectCsvWriter } from 'csv-writer';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

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

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid userId or eventId.", data: {} });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found.", data: {} });
    }

    // Optional: verify only organization hosting the event can mark attendance.
    if (event.organization.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the hosting organization can mark attendance.", data: {} });
    }

    const attendance = await Attendance.findOneAndUpdate(
      {
        eventId,
        userId,
      },
      {
        status,
        verifiedByOrg: true,
        timestamp: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate("userId", "name email");

    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found.", data: {} });
    }

    return res.json({ message: "Attendance updated.", data: attendance });
  } catch (error) {
    console.error("markAttendance error", error);
    return res.status(500).json({ message: "Internal Server Error.", data: {} });
  }
};
export const bulkMarkAttendance = async (req, res) => {
  try {
    const { eventId, updates } = req.body;

    if (!eventId || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: "eventId and updates required.", data: [] });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid eventId.", data: [] });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found.", data: [] });
    }

    if (!event.organization || event.organization.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the hosting organization can mark attendance.", data: [] });
    }

    const validStatuses = ["present", "absent"];
    const payload = updates
      .filter(u => u?.userId && u?.status && validStatuses.includes(u.status))
      .map(u => ({
        userId: u.userId,
        status: u.status,
      }));

    if (payload.length === 0) {
      return res.status(400).json({ message: "No valid updates provided.", data: [] });
    }

    const bulkOps = payload.map((item) => ({
      updateOne: {
        filter: { eventId, userId: item.userId },
        update: {
          $set: {
            status: item.status,
            verifiedByOrg: true,
            timestamp: new Date(),
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(bulkOps, { ordered: false });

    // update from DB and notify
    const userIds = payload.map((item) => item.userId);
    const attendanceResults = await Attendance.find({ eventId, userId: { $in: userIds } }).populate("userId", "name email");

    const presentUsers = attendanceResults.filter((item) => item.status === "present" && item.userId && item.userId.email);

    await Promise.all(presentUsers.map(async (item) => {
      try {
        await sendNotification(item.userId._id, "HOURS_APPROVED", `Attendance confirmed for ${event.title}.` , {eventId: event._id});
        await sendEmail({
          to: item.userId.email,
          subject: `Attendance confirmed for ${event.title}`,
          html: `<p>Dear ${item.userId.name || "Volunteer"},</p><p>Thank you for attending <strong>${event.title}</strong> on ${new Date(event.date).toLocaleString()} at ${event.location || "(location not set)"}.</p><p>Your participation is important and confirmed as <strong>Present</strong>.</p><p>Best regards,<br/>Smart Community Team</p>`,
        });
      } catch (notifyError) {
        console.error("bulkMarkAttendance notification error", notifyError);
      }
    }));

    return res.json({ message: "Attendance bulk updated.", data: attendanceResults });
  } catch (error) {
    console.error("bulkMarkAttendance error", error);
    return res.status(500).json({ message: error?.message || "Internal Server Error.", data: [] });
  }
};
export const getAttendanceByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid eventId.", data: [] });
    }

    const event = await Event.findById(eventId).populate("volunteers.user", "name email");

    if (!event) {
      return res.status(404).json({ message: "Event not found.", data: [] });
    }

    if (!event.organization || event.organization.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the hosting organization can view attendance.", data: [] });
    }

    const attendanceRecords = await Attendance.find({ eventId }).populate("userId", "name email");

    const attendanceMap = new Map(
      attendanceRecords.map((item) => {
        const userIdString = item?.userId?._id
          ? item.userId._id.toString()
          : item?.userId
            ? item.userId.toString()
            : null;
        return [userIdString, item];
      })
    );

    const volunteersFromEvent = (event.volunteers || []).map((entry) => {
      const user = entry.user;
      const userIdString = user?._id
        ? user._id.toString()
        : user
          ? user.toString()
          : null;
      const record = userIdString ? attendanceMap.get(userIdString) : null;

      return {
        userId: userIdString,
        name: user?.name || "Volunteer",
        email: user?.email || "",
        approved: !!entry.approved,
        status: record?.status || "absent",
        verifiedByOrg: record?.verifiedByOrg || false,
        timestamp: record?.timestamp || null,
      };
    });

    const attendanceOnly = attendanceRecords
      .filter((item) => {
        const userIdString = item?.userId?._id
          ? item.userId._id.toString()
          : item?.userId
            ? item.userId.toString()
            : null;
        return userIdString && !volunteersFromEvent.some((vol) => vol.userId === userIdString);
      })
      .map((item) => {
        const user = item.userId || {};
        const userIdString = user?._id
          ? user._id.toString()
          : user
            ? user.toString()
            : null;
        return {
          userId: userIdString,
          name: user?.name || "Volunteer",
          email: user?.email || "",
          approved: false,
          status: item.status || "absent",
          verifiedByOrg: item.verifiedByOrg || false,
          timestamp: item.timestamp || null,
        };
      });

    const volunteers = [...volunteersFromEvent, ...attendanceOnly];

    return res.json({ message: "Attendance fetched.", data: volunteers });
  } catch (error) {
    console.error("getAttendanceByEvent error", error);
    return res.status(500).json({ message: error?.message || "Internal Server Error.", data: [] });
  }
};

// Export attendance for an event as CSV
export const exportAttendanceCSV = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid eventId.", data: {} });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found.", data: {} });
    }

    if (!event.organization || event.organization.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the hosting organization can export attendance.", data: {} });
    }

    const attendanceRecords = await Attendance.find({ eventId }).populate("userId", "name email");

    const csvData = attendanceRecords.map((record) => ({
      Name: record.userId?.name || "Volunteer",
      Email: record.userId?.email || "",
      Status: record.status,
      VerifiedByOrg: record.verifiedByOrg ? "Yes" : "No",
      Timestamp: record.timestamp ? new Date(record.timestamp).toISOString() : "",
    }));

    const csvWriter = createObjectCsvWriter({
      path: '/tmp/attendance.csv',
      header: [
        { id: 'Name', title: 'Name' },
        { id: 'Email', title: 'Email' },
        { id: 'Status', title: 'Status' },
        { id: 'VerifiedByOrg', title: 'VerifiedByOrg' },
        { id: 'Timestamp', title: 'Timestamp' },
      ],
    });

    await csvWriter.writeRecords(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendance_${eventId}.csv"`);
    res.sendFile('/tmp/attendance.csv');
  } catch (error) {
    console.error("exportAttendanceCSV error", error);
    return res.status(500).json({ message: "Internal Server Error.", data: {} });
  }
};

// Generate certificate PDF for a volunteer
const generateCertificatePDF = (volunteerName, eventTitle, eventDate, eventLocation, orgName) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    doc.on('error', reject);

    // Certificate design
    doc.fontSize(30).text('Certificate of Participation', { align: 'center' });
    doc.moveDown();
    doc.fontSize(20).text('This is to certify that', { align: 'center' });
    doc.moveDown();
    doc.fontSize(25).text(volunteerName, { align: 'center', underline: true });
    doc.moveDown();
    doc.fontSize(18).text(`has participated in the event "${eventTitle}"`, { align: 'center' });
    doc.text(`held on ${new Date(eventDate).toLocaleDateString()} at ${eventLocation || 'Location not specified'}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`Organized by: ${orgName}`, { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(14).text('Thank you for your valuable contribution!', { align: 'center' });

    doc.end();
  });
};

// Download certificate for a volunteer
export const downloadCertificate = async (req, res) => {
  try {
    const { eventId, userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid eventId or userId.", data: {} });
    }

    const event = await Event.findById(eventId).populate("organization", "name");
    if (!event) {
      return res.status(404).json({ message: "Event not found.", data: {} });
    }

    if (!event.organization || event.organization._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the hosting organization can download certificates.", data: {} });
    }

    const attendance = await Attendance.findOne({ eventId, userId, status: "present" }).populate("userId", "name");
    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found or volunteer not present.", data: {} });
    }

    const pdfBuffer = await generateCertificatePDF(
      attendance.userId.name || "Volunteer",
      event.title,
      event.date,
      event.location,
      event.organization.name || "Organization"
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate_${userId}_${eventId}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("downloadCertificate error", error);
    return res.status(500).json({ message: "Internal Server Error.", data: {} });
  }
};

// Bulk download certificates (zip or individual)
export const bulkDownloadCertificates = async (req, res) => {
  // For simplicity, return JSON with download links; in production, create zip
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid eventId.", data: [] });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found.", data: [] });
    }

    if (!event.organization || event.organization.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the hosting organization can download certificates.", data: [] });
    }

    const presentAttendances = await Attendance.find({ eventId, status: "present" }).populate("userId", "name");

    const certificates = presentAttendances.map((att) => ({
      userId: att.userId._id,
      name: att.userId.name || "Volunteer",
      downloadUrl: `/attendance/certificate/${eventId}/${att.userId._id}`,
    }));

    return res.json({ message: "Certificate download links generated.", data: certificates });
  } catch (error) {
    console.error("bulkDownloadCertificates error", error);
    return res.status(500).json({ message: "Internal Server Error.", data: [] });
  }
};

// Participation summary
export const getParticipationSummary = async (req, res) => {
  try {
    const { eventId, userId } = req.query; // optional filters

    let matchConditions = {};
    if (eventId && mongoose.Types.ObjectId.isValid(eventId)) {
      matchConditions.eventId = mongoose.Types.ObjectId(eventId);
    }
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      matchConditions.userId = mongoose.Types.ObjectId(userId);
    }

    // Only allow org to see their events' summaries
    if (req.user.role === "organization") {
      const orgEvents = await Event.find({ organization: req.user._id }).select('_id');
      const eventIds = orgEvents.map(e => e._id);
      matchConditions.eventId = { $in: eventIds };
    }

    const summary = await Attendance.aggregate([
      { $match: matchConditions },
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$event'
      },
      {
        $unwind: '$user'
      },
      {
        $group: {
          _id: '$userId',
          name: { $first: '$user.name' },
          email: { $first: '$user.email' },
          totalHours: { $sum: '$event.hours' },
          eventsAttended: { $sum: 1 },
          presentCount: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absentCount: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
        }
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: 1,
          email: 1,
          totalHours: 1,
          eventsAttended: 1,
          presentCount: 1,
          absentCount: 1,
        }
      }
    ]);

    return res.json({ message: "Participation summary fetched.", data: summary });
  } catch (error) {
    console.error("getParticipationSummary error", error);
    return res.status(500).json({ message: "Internal Server Error.", data: [] });
  }
};

// Notification history
export const getNotificationHistory = async (req, res) => {
  try {
    let matchConditions = {};

    // Only show notifications triggered by this org or admin
    if (req.user.role === "organization") {
      // For org, find events they own and notifications related to those events
      const orgEvents = await Event.find({ organization: req.user._id }).select('_id');
      const eventIds = orgEvents.map(e => e._id);
      matchConditions['meta.eventId'] = { $in: eventIds };
    } else if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied.", data: [] });
    }

    const notifications = await Notification.find(matchConditions)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(100); // limit for performance

    const history = notifications.map((notif) => ({
      id: notif._id,
      volunteerName: notif.user?.name || "Volunteer",
      volunteerEmail: notif.user?.email || "",
      type: notif.type,
      message: notif.message,
      timestamp: notif.createdAt,
      eventId: notif.meta?.eventId || null,
    }));

    return res.json({ message: "Notification history fetched.", data: history });
  } catch (error) {
    console.error("getNotificationHistory error", error);
    return res.status(500).json({ message: "Internal Server Error.", data: [] });
  }
};