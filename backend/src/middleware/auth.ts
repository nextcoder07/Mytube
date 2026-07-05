// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { firebaseAuth } from "../config/firebase";
import { HttpError } from "../utils/errors";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new HttpError(401, "Missing or invalid Authorization header"));
  }
  const idToken = authHeader.split(" ")[1];
  try {
    const decoded = await firebaseAuth.verifyIdToken(idToken);
    // Attach user info to request
    (req as any).user = { uid: decoded.uid, email: decoded.email };
    next();
  } catch (err) {
    console.error("Firebase auth error:", err);
    next(new HttpError(401, "Invalid Firebase ID token"));
  }
};
