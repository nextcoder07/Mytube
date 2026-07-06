"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsWorker = void 0;
// src/jobs/analytics.job.ts — Worker: batch-write analytics events
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../config/redis"));
const supabase_1 = require("../config/supabase");
const logger_1 = __importDefault(require("../utils/logger"));
exports.analyticsWorker = new bullmq_1.Worker('analytics', async (job) => {
    const { events } = job.data;
    if (!events?.length)
        return;
    const rows = events.map(({ userId, event, metadata }) => ({
        user_id: userId,
        event,
        metadata: metadata ?? null,
    }));
    const { error } = await supabase_1.supabase.from('analytics').insert(rows);
    if (error) {
        logger_1.default.error('[analytics] Batch insert failed:', error.message);
    }
    else {
        logger_1.default.info(`[analytics] Wrote ${rows.length} events`);
    }
}, { connection: redis_1.default });
//# sourceMappingURL=analytics.job.js.map