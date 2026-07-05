// src/routes/goals.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  generateRoadmap,
  getRoadmaps,
  getRoadmap,
} from "../controllers/goals.controller";

const router = Router();

router.use(authenticate);

// Roadmaps (place specific subroutes BEFORE generic /:id parameter)
router.get("/roadmaps", getRoadmaps);
router.get("/roadmaps/:id", getRoadmap);
router.post("/:id/roadmap", generateRoadmap);

// Goals CRUD
router.get("/", getGoals);
router.post("/", createGoal);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);

export default router;
