"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestionsAfter = exports.suggestionsBefore = exports.getSearchHistory = exports.clearSearchCache = exports.searchAI = exports.search = void 0;
const search_service_1 = __importDefault(require("../services/search.service"));
const providers_1 = __importDefault(require("../providers"));
const search_cache_1 = require("../cache/search-cache");
const response_1 = require("../utils/response");
const errors_1 = require("../utils/errors");
const search = async (req, res, next) => {
    try {
        const user = req.user;
        const userId = user?.uid || "anonymous";
        const query = req.query.q;
        if (!query) {
            return next(new errors_1.HttpError(400, "Query parameter 'q' is required"));
        }
        const providers = req.query.providers
            ? req.query.providers.split(",").map((p) => p.trim())
            : undefined;
        // Enforce minimum limit of 70 results per source
        const limit = req.query.limit ? Math.max(parseInt(req.query.limit, 10), 70) : 70;
        // YouTube-optimized filter params
        const order = req.query.order;
        const videoDuration = req.query.videoDuration;
        const videoCategoryId = req.query.videoCategoryId;
        const relevanceLanguage = req.query.relevanceLanguage;
        console.debug("[search.controller] userId=", userId, "query=", query, "providers=", providers, "limit=", limit);
        const results = await search_service_1.default.search(userId, query, {
            providers,
            limit,
            order,
            videoDuration,
            videoCategoryId,
            relevanceLanguage,
        });
        const youtubeStatus = providers_1.default.getProvider("youtube")?.getStatus?.();
        console.debug("[search.controller] returning results count=", Array.isArray(results) ? results.length : 0);
        res.status(200).json((0, response_1.success)(results, "Search completed", { youtubeStatus }));
    }
    catch (err) {
        next(err);
    }
};
exports.search = search;
const searchAI = async (req, res, next) => {
    try {
        const user = req.user;
        const userId = user?.uid || "anonymous";
        const { query, providers, aiContext } = req.body;
        if (!query) {
            return next(new errors_1.HttpError(400, "Query body parameter is required"));
        }
        // YouTube-optimized filter params (from query string or body)
        const order = (req.body.order || req.query.order);
        const videoDuration = (req.body.videoDuration || req.query.videoDuration);
        const videoCategoryId = (req.body.videoCategoryId || req.query.videoCategoryId);
        const relevanceLanguage = (req.body.relevanceLanguage || req.query.relevanceLanguage);
        // Enforce minimum limit of 70 results
        const limit = req.query.limit ? Math.max(parseInt(req.query.limit, 10), 70) : 70;
        const options = {
            limit,
            pageToken: req.query.pageToken,
            after: req.query.after,
            order,
            videoDuration,
            videoCategoryId,
            relevanceLanguage,
            aiContext: aiContext || undefined,
        };
        const results = await search_service_1.default.searchAI(userId, query, { ...options, providers });
        const youtubeStatus = providers_1.default.getProvider("youtube")?.getStatus?.();
        res.status(200).json((0, response_1.success)(results, "AI Search completed", { youtubeStatus }));
    }
    catch (err) {
        next(err);
    }
};
exports.searchAI = searchAI;
const clearSearchCache = async (req, res, next) => {
    try {
        const query = req.query.q;
        const limitParam = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        if (!query && limitParam !== undefined) {
            return next(new errors_1.HttpError(400, "Limit may only be used with a query parameter."));
        }
        if (!query) {
            search_cache_1.searchCache.clearAll();
            res.status(200).json((0, response_1.success)(null, "Full search cache cleared."));
            return;
        }
        if (limitParam && limitParam > 0) {
            search_cache_1.searchCache.trim(query, limitParam);
            res.status(200).json((0, response_1.success)(null, `Search cache trimmed to top ${limitParam} results for query: ${query}`));
            return;
        }
        search_cache_1.searchCache.clear(query);
        res.status(200).json((0, response_1.success)(null, `Search cache cleared for query: ${query}`));
    }
    catch (err) {
        next(err);
    }
};
exports.clearSearchCache = clearSearchCache;
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
const suggestionsBefore = async (req, res, next) => {
    try {
        const user = req.user;
        const userId = user?.uid || 'anonymous';
        const contentTitle = req.query.contentTitle || '';
        const q = req.query.q || '';
        const providers = req.query.providers ? req.query.providers.split(',').map(p => p.trim()) : ['youtube'];
        const limit = req.query.limit ? Math.max(parseInt(req.query.limit, 10), 10) : 20;
        if (!contentTitle && !q)
            return next(new errors_1.HttpError(400, "Either contentTitle or q is required"));
        // Build a general, query-driven "before" prompt that prefers prerequisites, introductions, or previous parts,
        // but is not limited to episodes. Always include the user's search query and the current content title.
        const base = [q, contentTitle].filter(Boolean).join(' ').trim();
        const beforeTerms = ['introduction', 'basics', 'prerequisite', 'part 1', 'previous', 'overview', 'beginner guide'];
        const beforeQuery = `${base} ${beforeTerms.join(' OR ')}`.trim();
        let results = await search_service_1.default.search(userId, beforeQuery, { providers, limit });
        // Boost items that match both the user's search query and the content title
        const qTokens = q.toLowerCase().split(/\s+/).filter(Boolean);
        const titleTokens = contentTitle.toLowerCase().split(/\s+/).filter(Boolean);
        results = results.map((item) => {
            const txt = (item.title + ' ' + (item.description || '')).toLowerCase();
            const matchesQ = qTokens.some(t => txt.includes(t));
            const matchesTitle = titleTokens.some(t => txt.includes(t));
            return { item, boost: matchesQ && matchesTitle ? 1 : 0 };
        }).sort((a, b) => b.boost - a.boost).map(r => r.item);
        res.status(200).json((0, response_1.success)(results, 'Suggestions (before) fetched'));
    }
    catch (err) {
        next(err);
    }
};
exports.suggestionsBefore = suggestionsBefore;
const suggestionsAfter = async (req, res, next) => {
    try {
        const user = req.user;
        const userId = user?.uid || 'anonymous';
        const contentTitle = req.query.contentTitle || '';
        const q = req.query.q || '';
        const providers = req.query.providers ? req.query.providers.split(',').map(p => p.trim()) : ['youtube'];
        const limit = req.query.limit ? Math.max(parseInt(req.query.limit, 10), 10) : 20;
        if (!contentTitle && !q)
            return next(new errors_1.HttpError(400, "Either contentTitle or q is required"));
        // Build a general, query-driven "after" prompt that prefers follow-ups, next parts, or deeper dives.
        const baseAfter = [q, contentTitle].filter(Boolean).join(' ').trim();
        const afterTerms = ['follow up', 'part 2', 'next', 'advanced', 'deep dive', 'continued'];
        const afterQuery = `${baseAfter} ${afterTerms.join(' OR ')}`.trim();
        let results = await search_service_1.default.search(userId, afterQuery, { providers, limit });
        // Boost items that match both the user's search query and the content title
        const qTokens = q.toLowerCase().split(/\s+/).filter(Boolean);
        const titleTokens = contentTitle.toLowerCase().split(/\s+/).filter(Boolean);
        results = results.map((item) => {
            const txt = (item.title + ' ' + (item.description || '')).toLowerCase();
            const matchesQ = qTokens.some(t => txt.includes(t));
            const matchesTitle = titleTokens.some(t => txt.includes(t));
            return { item, boost: matchesQ && matchesTitle ? 1 : 0 };
        }).sort((a, b) => b.boost - a.boost).map(r => r.item);
        res.status(200).json((0, response_1.success)(results, 'Suggestions (after) fetched'));
    }
    catch (err) {
        next(err);
    }
};
exports.suggestionsAfter = suggestionsAfter;
//# sourceMappingURL=search.controller.js.map