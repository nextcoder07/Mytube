// src/routes/search.routes.ts
import { Router } from "express";
import { searchLimiter } from "../middleware/rateLimiter";
import { authenticate } from "../middleware/auth";
import {
  search,
  searchAI,
  clearSearchCache,
  getSearchHistory,
  deleteSearchHistoryEntry,
  clearSearchHistory,
  suggestionsBefore,
  suggestionsAfter,
} from "../controllers/search.controller";

const router = Router();

router.use(searchLimiter);

router.get("/", search);
router.post("/ai", searchAI);
router.delete("/cache", clearSearchCache);

// Search history – read & delete (require auth)
router.get("/history", authenticate, getSearchHistory);
router.delete("/history", authenticate, clearSearchHistory);
router.delete("/history/:id", authenticate, deleteSearchHistoryEntry);

router.get("/suggestions/before", suggestionsBefore);
router.get("/suggestions/after", suggestionsAfter);

export default router;
