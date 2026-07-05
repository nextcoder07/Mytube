// src/controllers/analytics.controller.ts
import { Request, Response, NextFunction } from "express";
import AnalyticsService from "../services/analytics.service";
import { success } from "../utils/response";
import { HttpError } from "../utils/errors";

export const logEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const userId = user ? user.uid : null; // allow anonymous analytics if needed, but authenticated preferred
    const { eventType, eventData } = req.body;

    if (!eventType) {
      return next(new HttpError(400, "eventType parameter is required"));
    }

    const saved = await AnalyticsService.logEvent(userId, eventType, eventData || {});
    res.status(201).json(success({ saved }, "Analytics event logged"));
  } catch (err: any) {
    next(err);
  }
};

export const getUserStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const stats = await AnalyticsService.getUserStats(user.uid);
    res.status(200).json(success(stats, "User statistics retrieved"));
  } catch (err: any) {
    next(err);
  }
};
