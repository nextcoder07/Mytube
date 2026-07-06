"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSearchHistory = exports.searchAI = exports.search = void 0;
const search_service_1 = __importDefault(require("../services/search.service"));
const response_1 = require("../utils/response");
const errors_1 = require("../utils/errors");
const search = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const query = req.query.q;
        if (!query) {
            return next(new errors_1.HttpError(400, "Query parameter 'q' is required"));
        }
        const providers = req.query.providers
            ? req.query.providers.split(",")
            : undefined;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const results = await search_service_1.default.search(user.uid, query, { providers, limit });
        res.status(200).json((0, response_1.success)(results, "Search completed"));
    }
    catch (err) {
        next(err);
    }
};
exports.search = search;
const searchAI = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const { query, providers } = req.body;
        if (!query) {
            return next(new errors_1.HttpError(400, "Query body parameter is required"));
        }
        const options = {
            limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
            pageToken: req.query.pageToken,
            after: req.query.after,
        };
        const results = await search_service_1.default.search(user.uid, query, { ...options, providers });
        res.status(200).json((0, response_1.success)(results, "AI Search completed"));
    }
    catch (err) {
        next(err);
    }
};
exports.searchAI = searchAI;
const getSearchHistory = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const history = await search_service_1.default.getHistory(user.uid);
        res.status(200).json((0, response_1.success)(history, "Search history fetched"));
    }
    catch (err) {
        next(err);
    }
};
exports.getSearchHistory = getSearchHistory;
//# sourceMappingURL=search.controller.js.map