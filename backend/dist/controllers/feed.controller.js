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
        const feed = await feed_service_1.default.getFeed(user.uid, page, limit);
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
        const recommendations = await feed_service_1.default.getRecommended(user.uid);
        res.status(200).json((0, response_1.success)(recommendations, "Recommendations fetched successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.getRecommended = getRecommended;
//# sourceMappingURL=feed.controller.js.map