import User from "../models/User.js";
import Organization from "../models/Organization.js";
import AdminLog from "../models/AdminLog.js";
import Event from "../models/Event.js";
import VolunteerLog from "../models/VolunteerLog.js";
import { sendNotification } from "../utils/notification.js";

export const listOrganizations = async (req, res) => {
  const status = req.query.status || "pending";
  const q = (req.query.q || "").trim();
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
  const sort = req.query.sort === "oldest" ? 1 : -1;
  const filter = {
    role: "organization",
    orgApprovalStatus: status,
  };
  if (q) {
    const regex = new RegExp(q, "i");
    filter.$or = [
      { name: regex },
      { email: regex },
      { organizationName: regex },
      { organizationType: regex },
    ];
  }

  const total = await User.countDocuments(filter);
  const orgs = await User.find(filter)
    .select("name email organizationName organizationType orgApprovalStatus")
    .sort({ createdAt: sort })
    .skip((page - 1) * limit)
    .limit(limit);
  res.json({ data: orgs, total, page, limit });
};

export const approveOrganization = async (req, res) => {
  const org = await User.findById(req.params.id);
  if (!org || org.role !== "organization") {
    return res.status(404).json({ message: "Organization not found" });
  }
  org.orgApprovalStatus = "approved";
  await org.save();

  if (org.organizationId) {
    await Organization.findByIdAndUpdate(org.organizationId, {
      approvalStatus: "approved",
    });
  } else {
    await Organization.findOneAndUpdate(
      { createdBy: org._id },
      { approvalStatus: "approved" }
    );
  }

  await AdminLog.create({
    adminId: req.user._id,
    action: "Approved organization",
    targetId: org._id,
    type: "ORG_APPROVED",
  });

  await sendNotification(
    org._id,
    "ORG_APPROVED",
    "Your organization has been approved. You can now post opportunities."
  );

  res.json({ message: "Organization approved" });
};

export const rejectOrganization = async (req, res) => {
  const org = await User.findById(req.params.id);
  if (!org || org.role !== "organization") {
    return res.status(404).json({ message: "Organization not found" });
  }
  org.orgApprovalStatus = "rejected";
  await org.save();

  if (org.organizationId) {
    await Organization.findByIdAndUpdate(org.organizationId, {
      approvalStatus: "rejected",
    });
  } else {
    await Organization.findOneAndUpdate(
      { createdBy: org._id },
      { approvalStatus: "rejected" }
    );
  }

  await AdminLog.create({
    adminId: req.user._id,
    action: "Rejected organization",
    targetId: org._id,
    type: "ORG_REJECTED",
  });

  await sendNotification(
    org._id,
    "ORG_REJECTED",
    "Your organization was rejected. Please update details and re-apply."
  );

  res.json({ message: "Organization rejected" });
};

export const listAdminLogs = async (req, res) => {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);

  const total = await AdminLog.countDocuments();
  const logs = await AdminLog.find()
    .populate("adminId", "name email role")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    data: logs.map((log) => ({
      id: log._id,
      action: log.action,
      type: log.type,
      targetId: log.targetId,
      createdAt: log.createdAt,
      admin: log.adminId
        ? { id: log.adminId._id, name: log.adminId.name, email: log.adminId.email }
        : null,
    })),
    total,
    page,
    limit,
  });
};

export const listUsers = async (req, res) => {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "12", 10), 1), 50);
  const role = req.query.role || "all";
  const q = (req.query.q || "").trim();
  const filter = {};

  if (role !== "all") {
    filter.role = role;
  }

  if (q) {
    const regex = new RegExp(q, "i");
    filter.$or = [{ name: regex }, { email: regex }, { organizationName: regex }];
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select("name email role isVerified orgApprovalStatus points level createdAt")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ data: users, total, page, limit });
};

export const listEventsForModeration = async (_req, res) => {
  const events = await Event.find()
    .populate("organization", "name organizationName")
    .sort({ createdAt: -1 })
    .limit(100);

  const eventIds = events.map((event) => event._id);
  const logs = await VolunteerLog.aggregate([
    { $match: { event: { $in: eventIds } } },
    { $group: { _id: "$event", totalHours: { $sum: "$hours" } } },
  ]);
  const hoursMap = new Map(logs.map((item) => [item._id.toString(), item.totalHours]));

  res.json({
    data: events.map((event) => ({
      id: event._id,
      title: event.title,
      date: event.date,
      location: event.location,
      organization: event.organization?.organizationName || event.organization?.name || "Organization",
      volunteerCount: event.volunteers?.length || 0,
      approvedCount: (event.volunteers || []).filter((entry) => entry.approved).length,
      hoursGenerated: hoursMap.get(event._id.toString()) || 0,
      status:
        new Date(event.date) < new Date()
          ? "completed"
          : (event.volunteers || []).some((entry) => !entry.approved)
          ? "reviewing"
          : "active",
    })),
  });
};
