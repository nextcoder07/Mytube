// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { firebaseAuth } from "../config/firebase";
import AuthService from "../services/auth.service";
import { success, error } from "../utils/response";
import { HttpError } from "../utils/errors";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return next(new HttpError(400, "Missing Firebase ID Token"));
    }

    const decoded = await firebaseAuth.verifyIdToken(idToken);
    const user = await AuthService.resolveUser(decoded);

    res.status(201).json(success({ user }, "User registered successfully"));
  } catch (err: any) {
    console.error("Register Error:", err.message);
    next(new HttpError(401, "Authentication failed", err.message));
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return next(new HttpError(400, "Missing Firebase ID Token"));
    }

    const decoded = await firebaseAuth.verifyIdToken(idToken);
    const user = await AuthService.resolveUser(decoded);

    res.status(200).json(success({ user, token: idToken }, "Login successful"));
  } catch (err: any) {
    console.error("Login Error:", err.message);
    next(new HttpError(401, "Invalid token or login failed", err.message));
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(success(null, "Logged out successfully"));
  } catch (err: any) {
    next(err);
  }
};

import UserService from "../services/user.service";

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const firebaseUser = (req as any).user;
    if (!firebaseUser) {
      return next(new HttpError(401, "Not authenticated"));
    }

    // Fetch user with profile from database
    const user = await UserService.getProfile(firebaseUser.uid);
    res.status(200).json(success(user, "Current user fetched"));
  } catch (err: any) {
    next(new HttpError(404, "User not found or database error", err.message));
  }
};
