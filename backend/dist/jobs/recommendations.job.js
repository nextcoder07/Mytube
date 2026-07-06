"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendationsWorker = void 0;
// src/jobs/recommendations.job.ts — Worker: refresh recommendations for all users (daily cron)
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../config/redis"));
const logger_1 = __importDefault(require("../utils/logger"));
exports.recommendationsWorker = new bullmq_1.Worker('recommendations', async (job) => {
    const { userId } = job.data;
    // TODO: call recommendation service to compute + upsert recommendations
    logger_1.default.info(`[recommendations] Refreshing recommendations for user ${userId}`);
}, { connection: redis_1.default });
//# sourceMappingURL=recommendations.job.js.map