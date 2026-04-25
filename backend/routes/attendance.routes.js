import express from "express";
import auth from "../middleware/auth.middleware.js";
import role from "../middleware/role.middleware.js";
import {
  markAttendance,
  getAttendanceByEvent,
  scanAttendance,
} from "../controllers/attendance.controller.js";

const router = express.Router();

router.post("/mark", auth, role("organization"), markAttendance);
router.post("/scan", auth, role("organization"), scanAttendance);
router.get("/event/:eventId", auth, role("organization"), getAttendanceByEvent);

export default router;
