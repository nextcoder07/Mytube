// src/jobs/recommendations.job.ts — Worker: refresh recommendations for all users (daily cron)
import { Worker } from 'bullmq';
import redis from '../config/redis';
import logger from '../utils/logger';

export const recommendationsWorker = new Worker(
  'recommendations',
  async (job) => {
    const { userId } = job.data as { userId: string };
    // TODO: call recommendation service to compute + upsert recommendations
    logger.info(`[recommendations] Refreshing recommendations for user ${userId}`);
  },
  { connection: redis as any },
);
