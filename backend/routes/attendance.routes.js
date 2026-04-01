import express from "express";
import auth from "../middleware/auth.middleware.js";
import role from "../middleware/role.middleware.js";
import {
  markAttendance,
  getAttendanceByEvent,
} from "../controllers/attendance.controller.js";

const router = express.Router();

router.post("/mark", auth, role("organization"), markAttendance);
router.get("/event/:eventId", auth, role("organization"), getAttendanceByEvent);

export default router;
