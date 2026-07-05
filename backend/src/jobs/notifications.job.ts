// src/jobs/notifications.job.ts — Worker: in-app + push notifications
import { Worker } from 'bullmq';
import redis from '../config/redis';
import { createNotification } from '../notifications';
import logger from '../utils/logger';

export const notificationsWorker = new Worker(
  'notifications',
  async (job) => {
    const { userId, type, title, body } = job.data as {
      userId: string;
      type: string;
      title: string;
      body: string;
    };

    await createNotification(userId, type, title, body);
    logger.info(`[notifications] Created ${type} notification for user ${userId}`);
  },
  { connection: redis },
);
