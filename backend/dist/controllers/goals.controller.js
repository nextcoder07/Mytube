"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoadmap = exports.getRoadmaps = exports.generateRoadmap = exports.deleteGoal = exports.updateGoal = exports.createGoal = exports.getGoals = void 0;
const goals_service_1 = __importDefault(require("../services/goals.service"));
const response_1 = require("../utils/response");
const errors_1 = require("../utils/errors");
const getGoals = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const goals = await goals_service_1.default.getGoals(user.uid);
        res.status(200).json((0, response_1.success)(goals, "Goals fetched successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.getGoals = getGoals;
const createGoal = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const goal = await goals_service_1.default.createGoal(user.uid, req.body);
        res.status(201).json((0, response_1.success)(goal, "Goal created successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.createGoal = createGoal;
const updateGoal = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const goal = await goals_service_1.default.updateGoal(user.uid, req.params.id, req.body);
        res.status(200).json((0, response_1.success)(goal, "Goal updated successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.updateGoal = updateGoal;
const deleteGoal = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        await goals_service_1.default.deleteGoal(user.uid, req.params.id);
        res.status(200).json((0, response_1.success)(null, "Goal deleted successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.deleteGoal = deleteGoal;
const generateRoadmap = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const roadmap = await goals_service_1.default.generateRoadmap(user.uid, req.params.id, req.body);
        res.status(201).json((0, response_1.success)(roadmap, "AI learning roadmap generated successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.generateRoadmap = generateRoadmap;
const getRoadmaps = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const roadmaps = await goals_service_1.default.getRoadmaps(user.uid);
        res.status(200).json((0, response_1.success)(roadmaps, "Roadmaps fetched successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.getRoadmaps = getRoadmaps;
const getRoadmap = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const roadmap = await goals_service_1.default.getRoadmap(user.uid, req.params.id);
        res.status(200).json((0, response_1.success)(roadmap, "Roadmap details fetched"));
    }
    catch (err) {
        next(err);
    }
};
exports.getRoadmap = getRoadmap;
//# sourceMappingURL=goals.controller.js.map