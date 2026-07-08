// src/jobs/analytics.job.ts — Worker: batch-write analytics events
import { Worker } from 'bullmq';
import redis from '../config/redis';
import { supabase } from '../config/supabase';
import logger from '../utils/logger';

export const analyticsWorker = new Worker(
  'analytics',
  async (job: any) => {
    const { events } = job.data as { events: Array<{ userId: string; event: string; metadata?: unknown }> };
    if (!events?.length) return;

    const rows = events.map(({ userId, event, metadata }) => ({
      user_id: userId,
      event,
      metadata: metadata ?? null,
    }));

    const { error } = await supabase.from('analytics').insert(rows);
    if (error) {
      logger.error('[analytics] Batch insert failed:', error.message);
    } else {
      logger.info(`[analytics] Wrote ${rows.length} events`);
    }
  },
  { connection: redis as any },
);
