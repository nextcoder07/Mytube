// src/controllers/feed.controller.ts
import { Request, Response, NextFunction } from "express";
import FeedService from "../services/feed.service";
import { success } from "../utils/response";
import { HttpError } from "../utils/errors";

export const getFeed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const providers = req.query.providers
      ? (req.query.providers as string).split(",").map((provider) => provider.trim()).filter(Boolean)
      : undefined;
    const excludeIds = req.query.excludeIds
      ? (req.query.excludeIds as string).split(",").map((id) => id.trim()).filter(Boolean)
      : undefined;
    const goalId = req.query.goalId ? String(req.query.goalId) : undefined;
    const useCache = req.query.useCache === "false" || req.query.clearCache === "true" || req.query.clearCache === "1" ? false : true;

    const feed = await FeedService.getFeed(user.uid, page, limit, providers, excludeIds, goalId, useCache);
    res.status(200).json(success(feed, "Feed fetched successfully"));
  } catch (err: any) {
    next(err);
  }
};

export const getRecommended = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const excludeIds = req.query.excludeIds
      ? (req.query.excludeIds as string).split(",").map((id) => id.trim()).filter(Boolean)
      : undefined;

    const recommendations = await FeedService.getRecommended(user.uid, excludeIds);
    res.status(200).json(success(recommendations, "Recommendations fetched successfully"));
  } catch (err: any) {
    next(err);
  }
};
