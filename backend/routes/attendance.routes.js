import express from "express";
import auth from "../middleware/auth.middleware.js";
import role from "../middleware/role.middleware.js";
import {
  markAttendance,
  getAttendanceByEvent,
  bulkMarkAttendance,
  exportAttendanceCSV,
  downloadCertificate,
  bulkDownloadCertificates,
  getParticipationSummary,
  getNotificationHistory,
} from "../controllers/attendance.controller.js";

const router = express.Router();

router.post("/mark", auth, role("organization"), markAttendance);
router.post("/markAttendance", auth, role("organization"), markAttendance); // alias for legacy frontend path
router.post("/bulk-mark", auth, role("organization"), bulkMarkAttendance);
router.get("/event/:eventId", auth, role("organization"), getAttendanceByEvent);
router.get("/event/:eventId/export", auth, role("organization"), exportAttendanceCSV);
router.get("/certificate/:eventId/:userId", auth, role("organization"), downloadCertificate);
router.get("/certificates/:eventId", auth, role("organization"), bulkDownloadCertificates);
router.get("/summary", auth, getParticipationSummary); // org or admin
router.get("/notifications/history", auth, getNotificationHistory); // org or admin

export default router;
