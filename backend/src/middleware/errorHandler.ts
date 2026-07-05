// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/errors";

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ success: false, message: err.message, data: null, error: err.details });
  }
  return res.status(500).json({ success: false, message: "Internal Server Error", data: null, error: { code: "INTERNAL_ERROR" } });
};
