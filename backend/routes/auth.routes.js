import express from "express";
import {
  signup,
  login,
  googleSignIn,
  verifyEmail,
  completeOnboarding,
  getOrgStatus,
  verifyOtp,
  changePassword,
} from "../controllers/auth.controller.js";
// Fix: import getMe from user.controller (canonical version) — removed duplicate in auth.controller
import { getMe } from "../controllers/user.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleSignIn);
router.get("/verify/:token", verifyEmail);
router.get("/me", auth, getMe);
router.post("/onboarding", auth, completeOnboarding);
router.post("/verify-otp", verifyOtp);
router.post("/change-password", auth, changePassword);
router.get("/org-status", getOrgStatus);

export default router;
