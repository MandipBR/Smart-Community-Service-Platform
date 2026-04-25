import express from "express";
import auth from "../middleware/auth.middleware.js";
import role from "../middleware/role.middleware.js";

import {
  createEvent,
  getEvents,
  getEventById,
  joinEvent,
  approveVolunteer,
  deleteEvent,
  getRecommendedEvents,
  getNearbyEvents,
} from "../controllers/event.controller.js";

const router = express.Router();

router.post("/", auth, role("organization"), createEvent);
router.get("/recommended", auth, getRecommendedEvents);
router.get("/nearby", getNearbyEvents);
router.get("/", getEvents);
router.post("/:id/join", auth, role("volunteer"), joinEvent);
router.put("/:eventId/approve/:userId", auth, role("organization"), approveVolunteer);
router.delete("/:id", auth, role("organization"), deleteEvent);
router.get("/:id", getEventById);

export default router;
