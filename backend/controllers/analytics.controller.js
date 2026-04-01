import User from "../models/User.js";
import Event from "../models/Event.js";
import VolunteerLog from "../models/VolunteerLog.js";

export const getStats = async (req, res) => {
  const [volunteers, organizations, events, logs] = await Promise.all([
    User.countDocuments({ role: "volunteer" }),
    User.countDocuments({ role: "organization" }),
    Event.countDocuments(),
    VolunteerLog.find(),
  ]);

  const totalHours = logs.reduce((a, b) => a + (b.hours || 0), 0);

  const topCauses = await Event.aggregate([
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  res.json({
    totals: {
      volunteers,
      organizations,
      events,
      totalHours,
    },
    topCauses: topCauses.map((item) => ({
      cause: item._id,
      count: item.count,
    })),
  });
};

export const getEventsPerMonth = async (req, res) => {
  const data = await Event.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const labels = data.map(
    (item) => `${item._id.year}-${String(item._id.month).padStart(2, "0")}`
  );
  const series = data.map((item) => item.count);

  res.json({ labels, series });
};

export const getVolunteerGrowth = async (req, res) => {
  const data = await User.aggregate([
    { $match: { role: "volunteer" } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const labels = data.map(
    (item) => `${item._id.year}-${String(item._id.month).padStart(2, "0")}`
  );
  const series = data.map((item) => item.count);

  res.json({ labels, series });
};
