import express from "express";
import auth from "../middleware/auth.middleware.js";
import { listNotifications, markRead } from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", auth, listNotifications);
router.put("/:id/read", auth, markRead);

export default router;
