// src/routes/summary.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { summaryLimiter } from "../middleware/rateLimiter";
import { getContentSummary } from "../controllers/summary.controller";

const router = Router();

router.use(authenticate);
router.use(summaryLimiter);

router.post("/", getContentSummary);

export default router;
