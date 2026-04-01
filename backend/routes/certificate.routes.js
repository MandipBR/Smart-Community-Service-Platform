import express from "express";
import auth from "../middleware/auth.middleware.js";
import role from "../middleware/role.middleware.js";
import { getCertificate } from "../controllers/certificate.controller.js";

const router = express.Router();

router.get("/:logId", auth, role("volunteer", "admin"), getCertificate);

export default router;
