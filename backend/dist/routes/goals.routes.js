"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/goals.routes.ts
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const goals_controller_1 = require("../controllers/goals.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Roadmaps (place specific subroutes BEFORE generic /:id parameter)
router.get("/roadmaps", goals_controller_1.getRoadmaps);
router.get("/roadmaps/:id", goals_controller_1.getRoadmap);
router.post("/:id/roadmap", goals_controller_1.generateRoadmap);
// Goals CRUD
router.get("/", goals_controller_1.getGoals);
router.post("/", goals_controller_1.createGoal);
router.put("/:id", goals_controller_1.updateGoal);
router.delete("/:id", goals_controller_1.deleteGoal);
exports.default = router;
//# sourceMappingURL=goals.routes.js.map