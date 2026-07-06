"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueEvents = exports.Worker = exports.notificationsQueue = exports.analyticsQueue = exports.emailsQueue = exports.recommendationsQueue = exports.embeddingsQueue = exports.summaryQueue = void 0;
// src/jobs/index.ts — BullMQ queue definitions
const bullmq_1 = require("bullmq");
Object.defineProperty(exports, "Worker", { enumerable: true, get: function () { return bullmq_1.Worker; } });
Object.defineProperty(exports, "QueueEvents", { enumerable: true, get: function () { return bullmq_1.QueueEvents; } });
const redis_1 = __importDefault(require("../config/redis"));
const connection = redis_1.default;
exports.summaryQueue = new bullmq_1.Queue('summary', { connection });
exports.embeddingsQueue = new bullmq_1.Queue('embeddings', { connection });
exports.recommendationsQueue = new bullmq_1.Queue('recommendations', { connection });
exports.emailsQueue = new bullmq_1.Queue('emails', { connection });
exports.analyticsQueue = new bullmq_1.Queue('analytics', { connection });
exports.notificationsQueue = new bullmq_1.Queue('notifications', { connection });
//# sourceMappingURL=index.js.map