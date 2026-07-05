// src/controllers/goals.controller.ts
import { Request, Response, NextFunction } from "express";
import GoalsService from "../services/goals.service";
import { success } from "../utils/response";
import { HttpError } from "../utils/errors";

export const getGoals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const goals = await GoalsService.getGoals(user.uid);
    res.status(200).json(success(goals, "Goals fetched successfully"));
  } catch (err: any) {
    next(err);
  }
};

export const createGoal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const goal = await GoalsService.createGoal(user.uid, req.body);
    res.status(201).json(success(goal, "Goal created successfully"));
  } catch (err: any) {
    next(err);
  }
};

export const updateGoal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const goal = await GoalsService.updateGoal(user.uid, req.params.id, req.body);
    res.status(200).json(success(goal, "Goal updated successfully"));
  } catch (err: any) {
    next(err);
  }
};

export const deleteGoal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    await GoalsService.deleteGoal(user.uid, req.params.id);
    res.status(200).json(success(null, "Goal deleted successfully"));
  } catch (err: any) {
    next(err);
  }
};

export const generateRoadmap = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const roadmap = await GoalsService.generateRoadmap(user.uid, req.params.id, req.body);
    res.status(201).json(success(roadmap, "AI learning roadmap generated successfully"));
  } catch (err: any) {
    next(err);
  }
};

export const getRoadmaps = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const roadmaps = await GoalsService.getRoadmaps(user.uid);
    res.status(200).json(success(roadmaps, "Roadmaps fetched successfully"));
  } catch (err: any) {
    next(err);
  }
};

export const getRoadmap = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const roadmap = await GoalsService.getRoadmap(user.uid, req.params.id);
    res.status(200).json(success(roadmap, "Roadmap details fetched"));
  } catch (err: any) {
    next(err);
  }
};
