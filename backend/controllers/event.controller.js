import Event from "../models/Event.js";
import User from "../models/User.js";
import VolunteerLog from "../models/VolunteerLog.js";
import Attendance from "../models/Attendance.js";
import Notification from "../models/Notification.js";
import jwt from "jsonwebtoken";
import { createEventSchema } from "../validators/event.schemas.js";
import { validate } from "../validators/validate.js";
import { sendNotification } from "../utils/notification.js";
import sendEmail from "../utils/sendEmail.js";

const toRad = (value) => (value * Math.PI) / 180;
const distanceKm = (lat1, lng1, lat2, lng2) => {
  const earthKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthKm * c;
};

const normalizeDistanceScore = (distance) => {
  if (distance == null) return 0.5;
  const maxKm = 20;
  return Math.max(0, 1 - Math.min(distance, maxKm) / maxKm);
};

export const createEvent = async (req, res, next) => {
  try {
    if (req.user.role === "organization" && req.user.orgApprovalStatus !== "approved") {
      return res.status(403).json({
        message: "Organization account is pending admin approval",
      });
    }
    const parsed = validate(createEventSchema, req.body, res);
    if (!parsed) return;
    let event;
    try {
      event = await Event.create({
        ...parsed,
        organization: req.user._id,
      });
    } catch (err) {
      if (err?.code === 11000) {
        return res.status(409).json({
          message:
            "A similar event already exists for the same organization, date, and location",
        });
      }
      throw err;
    }

    const matchSkills = Array.isArray(event.skills) ? event.skills : [];
    const matchTags = Array.isArray(event.tags) ? event.tags : [];
    if (matchSkills.length || matchTags.length) {
      const volunteers = await User.find({
        role: "volunteer",
        $or: [
          { skills: { $in: matchSkills } },
          { causes: { $in: matchTags } },
        ],
      })
        .select("_id")
        .limit(100);

      await Promise.all(
        volunteers.map((vol) =>
          sendNotification(
            vol._id,
            "NEW_MATCH",
            `New opportunity: ${event.title} matches your interests.`,
            { eventId: event._id }
          )
        )
      );
    }

    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const {
      q,
      cause,
      location,
      skills,
      from,
      to,
      lat,
      lng,
      radiusKm,
    } = req.query;

    const filter = {};

    const escape = (str) =>
      (str || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    if (q) {
      const regex = new RegExp(escape(q), "i");
      filter.$or = [
        { title: regex },
        { description: regex },
        { location: regex },
      ];
    }

    if (location) {
      filter.location = new RegExp(escape(location), "i");
    }

    if (cause && cause !== "all") {
      filter.tags = { $elemMatch: { $regex: cause, $options: "i" } };
    }

    if (skills) {
      const list = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (list.length) {
        filter.skills = {
          $all: list.map((s) => new RegExp(escape(s), "i")),
        };
      }
    }

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    let events = await Event.find(filter)
      .sort({ date: 1 })
      .populate("organization", "name organizationName");

    if (lat && lng && radiusKm) {
      const latNum = Number(lat);
      const lngNum = Number(lng);
      const radius = Number(radiusKm);
      if (!Number.isNaN(latNum) && !Number.isNaN(lngNum) && !Number.isNaN(radius)) {
        events = events.filter((event) => {
          if (event.locationLat == null || event.locationLng == null) return false;
          const dist = distanceKm(latNum, lngNum, event.locationLat, event.locationLng);
          return dist <= radius;
        });
      }
    }

    res.json(events);
  } catch (err) {
    next(err);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organization",
      "name organizationName"
    );
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (err) {
    next(err);
  }
};

export const joinEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organization",
      "name organizationName"
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const updated = await Event.findOneAndUpdate(
      {
        _id: event._id,
        "volunteers.user": { $ne: req.user._id },
      },
      {
        $push: { volunteers: { user: req.user._id } },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(400).json({ message: "Already requested to join" });
    }

    const qrToken = jwt.sign(
      {
        userId: req.user._id.toString(),
        eventId: event._id.toString(),
        type: "attendance_qr",
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    const qrPayload = JSON.stringify({
      userId: req.user._id.toString(),
      eventId: event._id.toString(),
      qrToken,
    });
    const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
      qrPayload
    )}&size=240`;

    const eventDate = event.date ? new Date(event.date) : null;
    const formattedDate = eventDate
      ? eventDate.toLocaleString()
      : "To be announced";

    try {
      await sendEmail(
        req.user.email,
        `Event Join Confirmation: ${event.title}`,
        `<div style="font-family: sans-serif; max-width: 640px;">
          <h2>You're registered for ${event.title}</h2>
          <p>Your join request has been submitted successfully.</p>
          <p><strong>When:</strong> ${formattedDate}</p>
          <p><strong>Where:</strong> ${event.location || "Location TBD"}</p>
          <p>Please keep this QR for attendance verification at the event.</p>
          <img src="${qrCodeUrl}" alt="Attendance QR code" style="width:240px;height:240px;border:1px solid #ddd;padding:8px;border-radius:8px;" />
        </div>`
      );
    } catch (emailErr) {
      console.error("Join confirmation email failed:", emailErr?.message || emailErr);
    }

    await sendNotification(
      req.user._id,
      "EVENT_REMINDER",
      `Reminder: ${event.title} is scheduled for ${formattedDate}. Bring your attendance QR.`,
      { eventId: event._id }
    );

    res.json({ message: "Request sent to organization" });
  } catch (err) {
    next(err);
  }
};

export const approveVolunteer = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organization.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const volunteer = event.volunteers.find(
      (v) => v.user.toString() === req.params.userId
    );

    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    volunteer.approved = true;
    await event.save();

    await sendNotification(
      volunteer.user,
      "JOIN_APPROVED",
      `Your request to join ${event.title} was approved.`,
      { eventId: event._id }
    );

    res.json({ message: "Volunteer approved" });
  } catch (err) {
    next(err);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id).select("_id organization");
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organization.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Promise.all([
      Attendance.deleteMany({ eventId: event._id }),
      VolunteerLog.deleteMany({ event: event._id }),
      Notification.deleteMany({ "meta.eventId": event._id }),
      Event.deleteOne({ _id: event._id }),
    ]);

    return res.json({ message: "Event deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const getRecommendedEvents = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const events = await Event.find().populate("organization", "name organizationName");

    const logs = await VolunteerLog.find({ user: user._id }).populate("event");
    const pastTags = new Set();
    logs.forEach((log) => {
      const evt = log.event;
      if (!evt) return;
      (evt.tags || []).forEach((tag) => pastTags.add(tag));
      (evt.skills || []).forEach((skill) => pastTags.add(skill));
    });

    const lat = req.query.lat ? Number(req.query.lat) : null;
    const lng = req.query.lng ? Number(req.query.lng) : null;

    const scored = events.map((event) => {
      const skills = event.skills || [];
      const tags = event.tags || [];
      const skillMatch = skills.length
        ? skills.filter((s) => (user.skills || []).includes(s)).length / skills.length
        : 0.4;
      const causeMatch = tags.length
        ? tags.filter((t) => (user.causes || []).includes(t)).length / tags.length
        : 0.3;
      const distance =
        lat != null && lng != null && event.locationLat != null && event.locationLng != null
          ? distanceKm(lat, lng, event.locationLat, event.locationLng)
          : null;
      const locationScore = normalizeDistanceScore(distance);
      const previousInterest = tags.length
        ? tags.filter((t) => pastTags.has(t)).length / tags.length
        : 0.1;
      const score =
        skillMatch * 0.4 +
        causeMatch * 0.3 +
        locationScore * 0.2 +
        previousInterest * 0.1;
      return {
        ...event.toObject(),
        matchScore: Math.round(score * 100),
        distanceKm: distance,
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    res.json(scored.slice(0, 30));
  } catch (err) {
    next(err);
  }
};

export const getNearbyEvents = async (req, res, next) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ message: "lat and lng are required" });
    }
    const events = await Event.find().populate("organization", "name organizationName");
    const enriched = events
      .filter((event) => event.locationLat != null && event.locationLng != null)
      .map((event) => ({
        ...event.toObject(),
        distanceKm: distanceKm(lat, lng, event.locationLat, event.locationLng),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json(enriched);
  } catch (err) {
    next(err);
  }
};
