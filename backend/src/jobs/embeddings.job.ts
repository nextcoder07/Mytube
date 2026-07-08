// src/jobs/embeddings.job.ts — Worker: create vector embeddings (placeholder)
import { Worker } from 'bullmq';
import redis from '../config/redis';
import logger from '../utils/logger';

export const embeddingsWorker = new Worker(
  'embeddings',
  async (job: any) => {
    const { contentId } = job.data as { contentId: string };
    // TODO: integrate a vector embedding service (e.g. Supabase pgvector / Pinecone)
    logger.info(`[embeddings] Embedding job for content ${contentId} — placeholder`);
  },
  { connection: redis as any },
);
