"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTL = exports.CacheKeys = void 0;
exports.cacheGet = cacheGet;
exports.cacheSet = cacheSet;
exports.cacheDel = cacheDel;
// cache/index.ts — Redis cache-aside wrapper
const redis_1 = __importDefault(require("../config/redis"));
async function cacheGet(key) {
    try {
        const val = await redis_1.default.get(key);
        return val ? JSON.parse(val) : null;
    }
    catch {
        return null;
    }
}
async function cacheSet(key, value, ttlSeconds) {
    try {
        await redis_1.default.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    }
    catch {
        // Non-fatal — cache failures should never crash the app
    }
}
async function cacheDel(key) {
    try {
        await redis_1.default.del(key);
    }
    catch {
        // Non-fatal
    }
}
var keys_1 = require("./keys");
Object.defineProperty(exports, "CacheKeys", { enumerable: true, get: function () { return keys_1.CacheKeys; } });
var ttl_1 = require("./ttl");
Object.defineProperty(exports, "TTL", { enumerable: true, get: function () { return ttl_1.TTL; } });
//# sourceMappingURL=index.js.map