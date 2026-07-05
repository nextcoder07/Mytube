// src/routes/analytics.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { logEvent, getUserStats } from "../controllers/analytics.controller";

const router = Router();

// Allow optional auth for event logging, but stats require auth
router.post("/", (req, res, next) => {
  if (req.headers.authorization) {
    return authenticate(req, res, next);
  }
  next();
}, logEvent);

router.get("/stats", authenticate, getUserStats);

export default router;
