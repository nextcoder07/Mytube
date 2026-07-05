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

    const feed = await FeedService.getFeed(user.uid, page, limit);
    res.status(200).json(success(feed, "Feed fetched successfully"));
  } catch (err: any) {
    next(err);
  }
};

export const getRecommended = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const recommendations = await FeedService.getRecommended(user.uid);
    res.status(200).json(success(recommendations, "Recommendations fetched successfully"));
  } catch (err: any) {
    next(err);
  }
};
