import Event from "../models/Event.js";
import VolunteerLog from "../models/VolunteerLog.js";
import User from "../models/User.js";

export const getImpactStats = async (req, res) => {
  const [volunteers, organizations, events] = await Promise.all([
    User.countDocuments({ role: "volunteer" }),
    User.countDocuments({ role: "organization" }),
    Event.countDocuments(),
  ]);

  const logs = await VolunteerLog.find();
  const totalHours = logs.reduce((a, b) => a + (b.hours || 0), 0);

  const hoursByCause = await Event.aggregate([
    { $unwind: "$tags" },
    {
      $lookup: {
        from: "volunteerlogs",
        localField: "_id",
        foreignField: "event",
        as: "logs",
      },
    },
    { $unwind: "$logs" },
    {
      $group: {
        _id: "$tags",
        hours: { $sum: "$logs.hours" },
      },
    },
    { $sort: { hours: -1 } },
    { $limit: 8 },
  ]);

  const eventsPerMonth = await Event.aggregate([
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

  const volunteerGrowth = await User.aggregate([
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

  res.json({
    totals: {
      volunteers,
      organizations,
      events,
      totalHours,
      communitiesHelped: hoursByCause.length,
    },
    eventsPerMonth: {
      labels: eventsPerMonth.map(
        (item) => `${item._id.year}-${String(item._id.month).padStart(2, "0")}`
      ),
      series: eventsPerMonth.map((item) => item.count),
    },
    volunteerGrowth: {
      labels: volunteerGrowth.map(
        (item) => `${item._id.year}-${String(item._id.month).padStart(2, "0")}`
      ),
      series: volunteerGrowth.map((item) => item.count),
    },
    hoursByCause: hoursByCause.map((item) => ({
      cause: item._id,
      hours: item.hours,
    })),
  });
};
