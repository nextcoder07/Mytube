// src/middleware/validate.ts
import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { HttpError } from "../utils/errors";

/**
 * Middleware factory: validates req.body against a Zod schema.
 * Usage: router.post("/", validate(myZodSchema), controller)
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        return next(
          Object.assign(new HttpError(400, "Validation error"), { details })
        );
      }
      next(err);
    }
  };
};
