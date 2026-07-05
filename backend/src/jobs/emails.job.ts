// src/jobs/emails.job.ts — Worker: send transactional emails
import { Worker } from 'bullmq';
import redis from '../config/redis';
import logger from '../utils/logger';

export const emailsWorker = new Worker(
  'emails',
  async (job) => {
    const { to, subject, body, type } = job.data as {
      to: string;
      subject: string;
      body: string;
      type: 'welcome' | 'streak_reminder' | 'digest';
    };
    // TODO: integrate an email provider (e.g. Resend / SendGrid)
    logger.info(`[emails] Sending ${type} email to ${to}: ${subject}`);
  },
  { connection: redis },
);
