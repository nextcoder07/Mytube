// src/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";

/** General API rate limiter — 100 req/min */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later", data: null, error: { code: "RATE_LIMIT" } },
});

/** Auth routes — 10 req/min */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many auth requests", data: null, error: { code: "RATE_LIMIT" } },
});

/** Search routes — 30 req/min */
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, message: "Too many search requests", data: null, error: { code: "RATE_LIMIT" } },
});

/** Chat routes — 20 req/min */
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many chat requests", data: null, error: { code: "RATE_LIMIT" } },
});

/** Summary routes — 10 req/min */
export const summaryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many summary requests", data: null, error: { code: "RATE_LIMIT" } },
});
