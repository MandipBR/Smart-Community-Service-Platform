import express from "express";
import auth from "../middleware/auth.middleware.js";
import {
  getMe,
  getUserById,
  updateProfile,
  upload,
  uploadAvatar,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", auth, getMe);
router.get("/:id", auth, getUserById);
router.put("/profile", auth, updateProfile);
router.post("/avatar", auth, upload.single("avatar"), uploadAvatar);

export default router;
