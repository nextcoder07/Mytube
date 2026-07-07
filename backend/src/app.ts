// backend/src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { json, urlencoded } from "body-parser";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// ── CORS ────────────────────────────────────────────
// In production FRONTEND_URL should be set to the Netlify domain
// e.g. https://mytube.netlify.app
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://*.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.some((allowed) => allowed === origin || allowed === "https://*.vercel.app")) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan("combined"));
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));

// ── Health check (used by Render) ────────────────────
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Register API routes
app.use("/api", routes);

// Global error handler
app.use(errorHandler);

export default app;

