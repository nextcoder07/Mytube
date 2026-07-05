// src/routes/search.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { searchLimiter } from "../middleware/rateLimiter";
import { search, searchAI, getSearchHistory } from "../controllers/search.controller";

const router = Router();

router.use(authenticate);
router.use(searchLimiter);

router.get("/", search);
router.post("/ai", searchAI);
router.get("/history", getSearchHistory);

export default router;
