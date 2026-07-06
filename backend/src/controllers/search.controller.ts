// src/controllers/search.controller.ts
import { Request, Response, NextFunction } from "express";
import SearchService from "../services/search.service";
import { success } from "../utils/response";
import { HttpError } from "../utils/errors";

export const search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const query = req.query.q as string;
    if (!query) {
      return next(new HttpError(400, "Query parameter 'q' is required"));
    }

    const providers = req.query.providers
      ? (req.query.providers as string).split(",")
      : undefined;

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

    const results = await SearchService.search(user.uid, query, { providers, limit });
    res.status(200).json(success(results, "Search completed"));
  } catch (err: any) {
    next(err);
  }
};

export const searchAI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const { query, providers } = req.body;
    if (!query) {
      return next(new HttpError(400, "Query body parameter is required"));
    }

    const options = {
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      pageToken: req.query.pageToken as string | undefined,
      after: req.query.after as string | undefined,
    };
    const results = await SearchService.search(user.uid, query, { ...options, providers });
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
