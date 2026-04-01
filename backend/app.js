import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

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

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.API_URL,
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

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
