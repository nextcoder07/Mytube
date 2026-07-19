// src/routes/history.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  recordWatch,
  getWatchHistory,
  recordFeedOpen,
  getFeedHistory,
} from "../controllers/history.controller";

const router = Router();

// Apply auth middleware to protect all history endpoints
router.use(authenticate);

// Watch history
router.post("/", recordWatch);
router.get("/", getWatchHistory);

// Feed history
router.post("/feed", recordFeedOpen);
router.get("/feed", getFeedHistory);

export default router;
