"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStats = exports.logEvent = void 0;
const analytics_service_1 = __importDefault(require("../services/analytics.service"));
const response_1 = require("../utils/response");
const errors_1 = require("../utils/errors");
const logEvent = async (req, res, next) => {
    try {
        const user = req.user;
        const userId = user ? user.uid : null; // allow anonymous analytics if needed, but authenticated preferred
        const { eventType, eventData } = req.body;
        if (!eventType) {
            return next(new errors_1.HttpError(400, "eventType parameter is required"));
        }
        const saved = await analytics_service_1.default.logEvent(userId, eventType, eventData || {});
        res.status(201).json((0, response_1.success)({ saved }, "Analytics event logged"));
    }
    catch (err) {
        next(err);
    }
};
exports.logEvent = logEvent;
const getUserStats = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const stats = await analytics_service_1.default.getUserStats(user.uid);
        res.status(200).json((0, response_1.success)(stats, "User statistics retrieved"));
    }
    catch (err) {
        next(err);
    }
};
exports.getUserStats = getUserStats;
//# sourceMappingURL=analytics.controller.js.map