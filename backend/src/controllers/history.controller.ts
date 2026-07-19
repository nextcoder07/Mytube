// src/controllers/history.controller.ts
import { Request, Response, NextFunction } from "express";
import HistoryService from "../services/history.service";
import { success } from "../utils/response";
import { HttpError } from "../utils/errors";

export const recordWatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const { content, goalId } = req.body;
    if (!content || !content.id) {
      return next(new HttpError(400, "content with id is required"));
    }

    const result = await HistoryService.recordWatch(user.uid, content, goalId);
    res.status(201).json(success(result, "Watch history recorded"));
  } catch (err: any) {
    next(err);
  }
};

export const getWatchHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const goalId = req.query.goalId as string | undefined;
    const history = await HistoryService.getWatchHistory(user.uid, goalId);
    res.status(200).json(success(history, "Watch history fetched"));
  } catch (err: any) {
    next(err);
  }
};

export const recordFeedOpen = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const { content, goalId } = req.body;
    if (!content || !content.id) {
      return next(new HttpError(400, "content with id is required"));
    }

    const result = await HistoryService.recordFeedOpen(user.uid, content, goalId);
    res.status(201).json(success(result, "Feed history recorded"));
  } catch (err: any) {
    next(err);
  }
};

export const getFeedHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const goalId = req.query.goalId as string | undefined;
    const history = await HistoryService.getFeedHistory(user.uid, goalId);
    res.status(200).json(success(history, "Feed history fetched"));
  } catch (err: any) {
    next(err);
  }
};
