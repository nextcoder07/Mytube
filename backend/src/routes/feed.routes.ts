// src/routes/feed.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getFeed, getRecommended } from "../controllers/feed.controller";

const router = Router();

router.use(authenticate);

router.get("/", getFeed);
router.get("/recommended", getRecommended);

export default router;
