// src/middleware/admin.ts
import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/errors";
import { supabase } from "../utils/supabase";

/** Require the authenticated user to have role = 'admin' */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user?.uid) return next(new HttpError(401, "Not authenticated"));

    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.uid)
      .single();

    if (error || !data) return next(new HttpError(403, "User not found"));
    if (data.role !== "admin") return next(new HttpError(403, "Admin access required"));

    next();
  } catch (err) {
    next(new HttpError(500, "Failed to verify admin role"));
  }
};
