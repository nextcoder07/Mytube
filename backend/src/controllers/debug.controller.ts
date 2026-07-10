import { Request, Response, NextFunction } from "express";
import { supabase } from "../utils/supabase";
import { success } from "../utils/response";

export const debugStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user || null;

    // quick DB smoke-test
    const { data, error } = await supabase.from("users").select("id").limit(1);
    if (error) {
      return next(error);
    }

    res.status(200).json(success({ user, db: { ok: true, sample: data } }, "Debug ok"));
  } catch (err: any) {
    next(err);
  }
};

export default { debugStatus };
