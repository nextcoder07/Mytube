"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/config/redis.ts
// TEMPORARILY DISABLED REDIS to stabilize the app
class MockRedis {
    on() { }
    async get() { return null; }
    async set() { return "OK"; }
    async del() { return 1; }
}
const redis = new MockRedis();
exports.default = redis;
//# sourceMappingURL=redis.js.map