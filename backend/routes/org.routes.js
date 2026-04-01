import express from "express";
import { getOrgPublic } from "../controllers/org.controller.js";

const router = express.Router();

router.get("/:id", getOrgPublic);

export default router;
