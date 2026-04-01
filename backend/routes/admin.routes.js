import express from "express";
import auth from "../middleware/auth.middleware.js";
import role from "../middleware/role.middleware.js";
import {
  listOrganizations,
  approveOrganization,
  rejectOrganization,
  listAdminLogs,
  listUsers,
  listEventsForModeration,
} from "../controllers/admin.controller.js";
import {
  getStats,
  getEventsPerMonth,
  getVolunteerGrowth,
} from "../controllers/analytics.controller.js";

const router = express.Router();

router.use(auth, role("admin"));

router.get("/orgs", listOrganizations);
router.put("/orgs/:id/approve", approveOrganization);
router.put("/orgs/:id/reject", rejectOrganization);

router.get("/analytics/stats", getStats);
router.get("/analytics/events-per-month", getEventsPerMonth);
router.get("/analytics/volunteer-growth", getVolunteerGrowth);
router.get("/logs", listAdminLogs);
router.get("/users", listUsers);
router.get("/events", listEventsForModeration);

export default router;
