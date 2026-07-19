// src/routes/history.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { recordWatch, getWatchHistory } from "../controllers/history.controller";

const router = Router();

// Apply auth middleware to protect all history endpoints
router.use(authenticate);

router.post("/", recordWatch);
router.get("/", getWatchHistory);

export default router;
