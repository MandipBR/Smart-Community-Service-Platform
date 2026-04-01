import express from "express";
import auth from "../middleware/auth.middleware.js";
import role from "../middleware/role.middleware.js";
import { createReview } from "../controllers/review.controller.js";

const router = express.Router();

router.post("/", auth, role("volunteer"), createReview);

export default router;
