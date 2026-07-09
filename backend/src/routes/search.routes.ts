// src/routes/search.routes.ts
import { Router } from "express";
import { searchLimiter } from "../middleware/rateLimiter";
import { search, searchAI, clearSearchCache, getSearchHistory, suggestionsBefore, suggestionsAfter } from "../controllers/search.controller";

const router = Router();

router.use(searchLimiter);

router.get("/", search);
router.post("/ai", searchAI);
router.delete("/cache", clearSearchCache);
router.get("/history", getSearchHistory);
router.get("/suggestions/before", suggestionsBefore);
router.get("/suggestions/after", suggestionsAfter);

export default router;
