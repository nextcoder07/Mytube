"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsWorker = void 0;
// src/jobs/notifications.job.ts — Worker: in-app + push notifications
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../config/redis"));
const notifications_1 = require("../notifications");
const logger_1 = __importDefault(require("../utils/logger"));
exports.notificationsWorker = new bullmq_1.Worker('notifications', async (job) => {
    const { userId, type, title, body } = job.data;
    await (0, notifications_1.createNotification)(userId, type, title, body);
    logger_1.default.info(`[notifications] Created ${type} notification for user ${userId}`);
}, { connection: redis_1.default });
//# sourceMappingURL=notifications.job.js.map