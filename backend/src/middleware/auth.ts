// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { firebaseAuth } from "../config/firebase";
import { HttpError } from "../utils/errors";
import config from "../config";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  // Detect if Firebase setup is mock or placeholder
  const isPlaceholderKey =
    !config.firebasePrivateKey ||
    config.firebasePrivateKey.includes("YOUR_PRIVATE_KEY") ||
    config.firebaseProjectId.includes("your-firebase-project-id");

  if (!authHeader?.startsWith("Bearer ")) {
    if (config.nodeEnv === "development" || isPlaceholderKey) {
      // Auto-inject mock user for development ease
      (req as any).user = { uid: "mock-user-123", email: "mock@example.com" };
      return next();
    }
    return next(new HttpError(401, "Missing or invalid Authorization header"));
  }

  const idToken = authHeader.split(" ")[1];
  try {
    const decoded = await firebaseAuth.verifyIdToken(idToken);
    // Attach user info to request
    (req as any).user = { uid: decoded.uid, email: decoded.email };
    next();
  } catch (err) {
    if (config.nodeEnv === "development" || isPlaceholderKey) {
      console.warn("⚠️ Firebase ID Token verification failed. Falling back to mock user in development.");
      (req as any).user = { uid: "mock-user-123", email: "mock@example.com" };
      return next();
    }
    console.error("Firebase auth error:", err);
    next(new HttpError(401, "Invalid Firebase ID token"));
  }
};
