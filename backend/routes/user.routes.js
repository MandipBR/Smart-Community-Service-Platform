import express from "express";
import auth from "../middleware/auth.middleware.js";
import { getMe, getUserById, updateProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", auth, getMe);
router.get("/:id", auth, getUserById);
router.put("/profile", auth, updateProfile);

export default router;
