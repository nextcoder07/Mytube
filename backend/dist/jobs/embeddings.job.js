"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.embeddingsWorker = void 0;
// src/jobs/embeddings.job.ts — Worker: create vector embeddings (placeholder)
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../config/redis"));
const logger_1 = __importDefault(require("../utils/logger"));
exports.embeddingsWorker = new bullmq_1.Worker('embeddings', async (job) => {
    const { contentId } = job.data;
    // TODO: integrate a vector embedding service (e.g. Supabase pgvector / Pinecone)
    logger_1.default.info(`[embeddings] Embedding job for content ${contentId} — placeholder`);
}, { connection: redis_1.default });
//# sourceMappingURL=embeddings.job.js.map