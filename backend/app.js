import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import volunteerRoutes from "./routes/volunteer.routes.js";
import orgRoutes from "./routes/org.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import certificateRoutes from "./routes/certificate.routes.js";
import orgPublicRoutes from "./routes/orgPublic.routes.js";
import impactRoutes from "./routes/impact.routes.js";
import userRoutes from "./routes/user.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.API_URL,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow tools/server-side requests without an Origin header
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS origin not allowed"), false);
    },
    credentials: true,
  })
);
app.use(express.json());

if (process.env.NODE_ENV !== "production") {
  const redactSensitive = (value) => {
    if (!value || typeof value !== "object") return value;
    const sensitive = new Set(["password", "currentPassword", "newPassword", "otp", "credential"]);
    if (Array.isArray(value)) return value.map((item) => redactSensitive(item));
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key,
        sensitive.has(key) ? "[REDACTED]" : redactSensitive(val),
      ])
    );
  };

  app.use((req, res, next) => {
    console.log("Incoming:", {
      method: req.method,
      url: req.originalUrl,
      body: redactSensitive(req.body),
    });
    next();
  });
}

const isDev = process.env.NODE_ENV !== "production";
const authLimiter = isDev
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 100,
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) =>
        req.path === "/me" || req.path.startsWith("/org-status"),
    });

app.use("/api/auth", authLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/orgs", orgRoutes);
app.use("/api/org", orgPublicRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/impact", impactRoutes);
app.use("/api/users", userRoutes);
app.use("/api/attendance", attendanceRoutes);

app.use(errorHandler);

export default app;
