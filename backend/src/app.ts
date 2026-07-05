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

// Middleware stack
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(helmet());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan("combined"));
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));

// Register API routes
app.use("/api", routes);

// Global error handler
app.use(errorHandler);

export default app;
