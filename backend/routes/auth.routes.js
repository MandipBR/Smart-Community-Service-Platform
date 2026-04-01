import express from "express";
import {
  signup,
  login,
  verifyEmail,
  googleSignIn,
  getMe,
  completeOnboarding,
  getOrgStatus,
  verifyOtp,
  changePassword,
} from "../controllers/auth.controller.js";
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
