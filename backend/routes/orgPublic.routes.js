import express from "express";
import { getOrgReviews } from "../controllers/review.controller.js";

const router = express.Router();

router.get("/:id/reviews", getOrgReviews);

export default router;
