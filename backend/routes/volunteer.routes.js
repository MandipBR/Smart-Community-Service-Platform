import express from "express";
import auth from "../middleware/auth.middleware.js";
import role from "../middleware/role.middleware.js";
import {
  logHours,
  getStats,
  getPublicProfile,
  getLeaderboard,
  getImpactProfile,
} from "../controllers/volunteer.controller.js";

const router = express.Router();

router.get("/leaderboard", getLeaderboard);
router.post("/log", auth, role("volunteer"), logHours);
router.get("/stats", auth, role("volunteer"), getStats);
router.get("/:id/profile", getPublicProfile);
router.get("/:id/impact", getImpactProfile);

export default router;
