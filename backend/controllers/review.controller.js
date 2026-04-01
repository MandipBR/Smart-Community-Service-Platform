import Review from "../models/Review.js";
import VolunteerLog from "../models/VolunteerLog.js";
import User from "../models/User.js";
import { createReviewSchema } from "../validators/review.schemas.js";
import { validate } from "../validators/validate.js";

export const createReview = async (req, res) => {
  const parsed = validate(createReviewSchema, req.body, res);
  if (!parsed) return;
  const { organizationId, rating, comment } = parsed;

  const org = await User.findById(organizationId);
  if (!org || org.role !== "organization") {
    return res.status(404).json({ message: "Organization not found" });
  }

  const logs = await VolunteerLog.find({ user: req.user._id }).populate("event");
  const hasWorked = logs.some(
    (log) => log.event && log.event.organization.toString() === organizationId
  );
  if (!hasWorked) {
    return res.status(403).json({
      message: "You can only review organizations you have worked with",
    });
  }

  const existing = await Review.findOne({
    volunteer: req.user._id,
    organization: organizationId,
  });
  if (existing) {
    return res.status(400).json({ message: "Review already submitted" });
  }

  await Review.create({
    volunteer: req.user._id,
    organization: organizationId,
    rating,
    comment: comment || "",
  });

  res.status(201).json({ message: "Review submitted" });
};

export const getOrgReviews = async (req, res) => {
  const org = await User.findById(req.params.id);
  if (!org || org.role !== "organization") {
    return res.status(404).json({ message: "Organization not found" });
  }

  const reviews = await Review.find({ organization: org._id })
    .populate("volunteer", "name")
    .sort({ createdAt: -1 });

  const averageRating = reviews.length
    ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length
    : 0;

  res.json({
    averageRating,
    count: reviews.length,
    reviews: reviews.map((review) => ({
      id: review._id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      volunteer: review.volunteer?.name || "Volunteer",
    })),
  });
};
