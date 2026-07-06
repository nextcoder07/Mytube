"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summaryWorker = void 0;
// src/jobs/summary.job.ts — Worker: pre-generate summaries for new content
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../config/redis"));
const gateway_1 = require("../ai/gateway");
const summary_1 = require("../ai/summary");
const supabase_1 = require("../config/supabase");
const gateway = new gateway_1.AIGateway();
exports.summaryWorker = new bullmq_1.Worker('summary', async (job) => {
    const { contentId, title, description, url } = job.data;
    const result = await (0, summary_1.generateSummary)(gateway, { title, description, url });
    await supabase_1.supabase.from('summaries').upsert({
        content_id: contentId,
        summary_text: result.summary,
        key_points: result.key_points,
        model_used: process.env.AI_PROVIDER ?? 'gemini',
    });
}, { connection: redis_1.default });
//# sourceMappingURL=summary.job.js.map