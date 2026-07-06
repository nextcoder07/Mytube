"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summaryLimiter = exports.chatLimiter = exports.searchLimiter = exports.authLimiter = exports.generalLimiter = void 0;
// src/middleware/rateLimiter.ts
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/** General API rate limiter — 100 req/min */
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later", data: null, error: { code: "RATE_LIMIT" } },
});
/** Auth routes — 10 req/min */
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 10,
    message: { success: false, message: "Too many auth requests", data: null, error: { code: "RATE_LIMIT" } },
});
/** Search routes — 30 req/min */
exports.searchLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 30,
    message: { success: false, message: "Too many search requests", data: null, error: { code: "RATE_LIMIT" } },
});
/** Chat routes — 20 req/min */
exports.chatLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 20,
    message: { success: false, message: "Too many chat requests", data: null, error: { code: "RATE_LIMIT" } },
});
/** Summary routes — 10 req/min */
exports.summaryLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 10,
    message: { success: false, message: "Too many summary requests", data: null, error: { code: "RATE_LIMIT" } },
});
//# sourceMappingURL=rateLimiter.js.map