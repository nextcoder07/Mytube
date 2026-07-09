// src/routes/search.routes.ts
import { Router } from "express";
import { searchLimiter } from "../middleware/rateLimiter";
import { search, searchAI, clearSearchCache, getSearchHistory } from "../controllers/search.controller";

const router = Router();

router.use(searchLimiter);

router.get("/", search);
router.post("/ai", searchAI);
router.delete("/cache", clearSearchCache);
router.get("/history", getSearchHistory);

export default router;
