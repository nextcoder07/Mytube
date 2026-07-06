"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/config/redis.ts
const ioredis_1 = __importDefault(require("ioredis"));
const index_1 = __importDefault(require("./index"));
const redis = new ioredis_1.default(index_1.default.redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 200, 2000);
        return delay;
    },
});
redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis error:", err.message));
exports.default = redis;
//# sourceMappingURL=redis.js.map