// src/controllers/history.controller.ts
import { Request, Response, NextFunction } from "express";
import HistoryService from "../services/history.service";
import { success } from "../utils/response";
import { HttpError } from "../utils/errors";

export const recordWatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return next(new HttpError(401, "Unauthorized"));
    }

    const { content, goalId } = req.body;
    if (!content || !content.id) {
      return next(new HttpError(400, "content and content.id parameters are required"));
    }

    const saved = await HistoryService.recordWatch(user.uid, content, goalId);
    res.status(201).json(success(saved, "Watch history recorded successfully"));
  } catch (err: any) {
    next(err);
  }
};

export const getWatchHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return next(new HttpError(401, "Unauthorized"));
    }

    const goalId = req.query.goalId ? String(req.query.goalId) : undefined;
    const history = await HistoryService.getWatchHistory(user.uid, goalId);

    res.status(200).json(success(history, "Watch history fetched successfully"));
  } catch (err: any) {
    next(err);
  }
};
