// src/controllers/search.controller.ts
import { Request, Response, NextFunction } from "express";
import SearchService from "../services/search.service";
import providerManager from "../providers";
import { searchCache } from "../cache/search-cache";
import { success } from "../utils/response";
import { HttpError } from "../utils/errors";

export const search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const userId = user?.uid || "anonymous";

    const query = req.query.q as string;
    if (!query) {
      return next(new HttpError(400, "Query parameter 'q' is required"));
    }

      const providers = req.query.providers
        ? (req.query.providers as string).split(",").map((p) => p.trim())
        : undefined;

    // Enforce minimum limit of 70 results per source
    const limit = req.query.limit ? Math.max(parseInt(req.query.limit as string, 10), 70) : 70;

    // YouTube-optimized filter params
    const order = req.query.order as 'relevance' | 'date' | 'viewCount' | 'rating' | undefined;
    const videoDuration = req.query.videoDuration as 'any' | 'short' | 'medium' | 'long' | undefined;
    const videoCategoryId = req.query.videoCategoryId as string | undefined;
    const relevanceLanguage = req.query.relevanceLanguage as string | undefined;

      console.debug("[search.controller] userId=", userId, "query=", query, "providers=", providers, "limit=", limit);

    const results = await SearchService.search(userId, query, {
      providers,
      limit,
      order,
      videoDuration,
      videoCategoryId,
      relevanceLanguage,
    });
    const youtubeStatus = providerManager.getProvider("youtube")?.getStatus?.();
    console.debug("[search.controller] returning results count=", Array.isArray(results) ? results.length : 0);
    res.status(200).json(success(results, "Search completed", { youtubeStatus }));
  } catch (err: any) {
    next(err);
  }
};

export const searchAI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const userId = user?.uid || "anonymous";

    const { query, providers, aiContext } = req.body;
    if (!query) {
      return next(new HttpError(400, "Query body parameter is required"));
    }

    // YouTube-optimized filter params (from query string or body)
    const order = (req.body.order || req.query.order) as 'relevance' | 'date' | 'viewCount' | 'rating' | undefined;
    const videoDuration = (req.body.videoDuration || req.query.videoDuration) as 'any' | 'short' | 'medium' | 'long' | undefined;
    const videoCategoryId = (req.body.videoCategoryId || req.query.videoCategoryId) as string | undefined;
    const relevanceLanguage = (req.body.relevanceLanguage || req.query.relevanceLanguage) as string | undefined;

    // Enforce minimum limit of 70 results
    const limit = req.query.limit ? Math.max(parseInt(req.query.limit as string, 10), 70) : 70;

    const options = {
      limit,
      pageToken: req.query.pageToken as string | undefined,
      after: req.query.after as string | undefined,
      order,
      videoDuration,
      videoCategoryId,
      relevanceLanguage,
      aiContext: aiContext || undefined,
    };
    const results = await SearchService.searchAI(userId, query, { ...options, providers });
    const youtubeStatus = providerManager.getProvider("youtube")?.getStatus?.();
    res.status(200).json(success(results, "AI Search completed", { youtubeStatus }));
  } catch (err: any) {
    next(err);
  }
};

export const clearSearchCache = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string | undefined;
    const limitParam = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

    if (!query && limitParam !== undefined) {
      return next(new HttpError(400, "Limit may only be used with a query parameter."));
    }

    if (!query) {
      searchCache.clearAll();
      res.status(200).json(success(null, "Full search cache cleared."));
      return;
    }

    if (limitParam && limitParam > 0) {
      searchCache.trim(query, limitParam);
      res.status(200).json(success(null, `Search cache trimmed to top ${limitParam} results for query: ${query}`));
      return;
    }

    searchCache.clear(query);
    res.status(200).json(success(null, `Search cache cleared for query: ${query}`));
  } catch (err: any) {
    next(err);
  }
};

export const getSearchHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const history = await SearchService.getHistory(user.uid);
    res.status(200).json(success(history, "Search history fetched"));
  } catch (err: any) {
    next(err);
  }
};

export const suggestionsBefore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const userId = user?.uid || 'anonymous';

    const contentTitle = (req.query.contentTitle as string) || '';
    const q = (req.query.q as string) || '';
    const providers = req.query.providers ? (req.query.providers as string).split(',').map(p => p.trim()) : ['youtube'];
    const limit = req.query.limit ? Math.max(parseInt(req.query.limit as string, 10), 10) : 20;

    if (!contentTitle && !q) return next(new HttpError(400, "Either contentTitle or q is required"));

    // Build a general, query-driven "before" prompt that prefers prerequisites, introductions, or previous parts,
    // but is not limited to episodes. Always include the user's search query and the current content title.
    const base = [q, contentTitle].filter(Boolean).join(' ').trim();
    const beforeTerms = ['introduction', 'basics', 'prerequisite', 'part 1', 'previous', 'overview', 'beginner guide'];
    const beforeQuery = `${base} ${beforeTerms.join(' OR ')}`.trim();

    const results = await SearchService.search(userId, beforeQuery, { providers, limit });
    res.status(200).json(success(results, 'Suggestions (before) fetched'));
  } catch (err: any) {
    next(err);
  }
};

export const suggestionsAfter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const userId = user?.uid || 'anonymous';

    const contentTitle = (req.query.contentTitle as string) || '';
    const q = (req.query.q as string) || '';
    const providers = req.query.providers ? (req.query.providers as string).split(',').map(p => p.trim()) : ['youtube'];
    const limit = req.query.limit ? Math.max(parseInt(req.query.limit as string, 10), 10) : 20;

    if (!contentTitle && !q) return next(new HttpError(400, "Either contentTitle or q is required"));

    // Build a general, query-driven "after" prompt that prefers follow-ups, next parts, or deeper dives.
    const baseAfter = [q, contentTitle].filter(Boolean).join(' ').trim();
    const afterTerms = ['follow up', 'part 2', 'next', 'advanced', 'deep dive', 'continued'];
    const afterQuery = `${baseAfter} ${afterTerms.join(' OR ')}`.trim();

    const results = await SearchService.search(userId, afterQuery, { providers, limit });
    res.status(200).json(success(results, 'Suggestions (after) fetched'));
  } catch (err: any) {
    next(err);
  }
};

