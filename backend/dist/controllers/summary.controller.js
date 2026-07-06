"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContentSummary = void 0;
const summary_service_1 = __importDefault(require("../services/summary.service"));
const response_1 = require("../utils/response");
const errors_1 = require("../utils/errors");
const getContentSummary = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const { contentId } = req.body;
        if (!contentId) {
            return next(new errors_1.HttpError(400, "contentId parameter is required"));
        }
        const summary = await summary_service_1.default.getContentSummary(user.uid, contentId);
        res.status(200).json((0, response_1.success)(summary, "Summary retrieved"));
    }
    catch (err) {
        next(err);
    }
};
exports.getContentSummary = getContentSummary;
//# sourceMappingURL=summary.controller.js.map