"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommended = exports.getFeed = void 0;
const feed_service_1 = __importDefault(require("../services/feed.service"));
const response_1 = require("../utils/response");
const errors_1 = require("../utils/errors");
const getFeed = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const page = req.query.page ? parseInt(req.query.page, 10) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const providers = req.query.providers
            ? req.query.providers.split(",").map((provider) => provider.trim()).filter(Boolean)
            : undefined;
        const excludeIds = req.query.excludeIds
            ? req.query.excludeIds.split(",").map((id) => id.trim()).filter(Boolean)
            : undefined;
        const goalId = req.query.goalId ? String(req.query.goalId) : undefined;
        const useCache = req.query.useCache === "false" || req.query.clearCache === "true" || req.query.clearCache === "1" ? false : true;
        const feed = await feed_service_1.default.getFeed(user.uid, page, limit, providers, excludeIds, goalId, useCache);
        res.status(200).json((0, response_1.success)(feed, "Feed fetched successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.getFeed = getFeed;
const getRecommended = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const excludeIds = req.query.excludeIds
            ? req.query.excludeIds.split(",").map((id) => id.trim()).filter(Boolean)
            : undefined;
        const recommendations = await feed_service_1.default.getRecommended(user.uid, excludeIds);
        res.status(200).json((0, response_1.success)(recommendations, "Recommendations fetched successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.getRecommended = getRecommended;
//# sourceMappingURL=feed.controller.js.map