// src/controllers/summary.controller.ts
import { Request, Response, NextFunction } from "express";
import SummaryService from "../services/summary.service";
import { success } from "../utils/response";
import { HttpError } from "../utils/errors";

export const getContentSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const { contentId } = req.body;
    if (!contentId) {
      return next(new HttpError(400, "contentId parameter is required"));
    }

    const summary = await SummaryService.getContentSummary(user.uid, contentId);
    res.status(200).json(success(summary, "Summary retrieved"));
  } catch (err: any) {
    next(err);
  }
};
