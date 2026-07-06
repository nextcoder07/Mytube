"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailsWorker = void 0;
// src/jobs/emails.job.ts — Worker: send transactional emails
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../config/redis"));
const logger_1 = __importDefault(require("../utils/logger"));
exports.emailsWorker = new bullmq_1.Worker('emails', async (job) => {
    const { to, subject, body, type } = job.data;
    // TODO: integrate an email provider (e.g. Resend / SendGrid)
    logger_1.default.info(`[emails] Sending ${type} email to ${to}: ${subject}`);
}, { connection: redis_1.default });
//# sourceMappingURL=emails.job.js.map