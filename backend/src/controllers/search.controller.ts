// src/controllers/search.controller.ts
import { Request, Response, NextFunction } from "express";
import SearchService from "../services/search.service";
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

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

    // YouTube-optimized filter params
    const order = req.query.order as 'relevance' | 'date' | 'viewCount' | 'rating' | undefined;
    const videoDuration = req.query.videoDuration as 'any' | 'short' | 'medium' | 'long' | undefined;
    const videoCategoryId = req.query.videoCategoryId as string | undefined;
    const relevanceLanguage = req.query.relevanceLanguage as string | undefined;
    const after = req.query.after as string | undefined;

      console.debug("[search.controller] userId=", userId, "query=", query, "providers=", providers, "limit=", limit);

    const results = await SearchService.search(userId, query, {
      providers,
      limit,
      order,
      videoDuration,
      videoCategoryId,
      relevanceLanguage,
      after,
    });
      console.debug("[search.controller] returning results count=", Array.isArray(results) ? results.length : 0);
    res.status(200).json(success(results, "Search completed"));
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

    const options = {
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      pageToken: req.query.pageToken as string | undefined,
      after: req.query.after as string | undefined,
      order,
      videoDuration,
      videoCategoryId,
      relevanceLanguage,
      aiContext: aiContext || undefined,
    };
    const results = await SearchService.searchAI(userId, query, { ...options, providers });
    res.status(200).json(success(results, "AI Search completed"));
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

