// src/controllers/user.controller.ts
import { Request, Response, NextFunction } from "express";
import UserService from "../services/user.service";
import { success } from "../utils/response";
import { HttpError } from "../utils/errors";

export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const profile = await UserService.getProfile(user.uid);
    res.status(200).json(success(profile, "Profile fetched"));
  } catch (err: any) {
    next(err);
  }
};

export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const updated = await UserService.updateProfile(user.uid, req.body);
    res.status(200).json(success(updated, "Profile updated successfully"));
  } catch (err: any) {
    next(err);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    await UserService.deleteUser(user.uid);
    res.status(200).json(success(null, "User deleted successfully"));
  } catch (err: any) {
    next(err);
  }
};
