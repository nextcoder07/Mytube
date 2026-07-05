// src/jobs/index.ts — BullMQ queue definitions
import { Queue, Worker, QueueEvents } from 'bullmq';
import redis from '../config/redis';

const connection = redis as any;

export const summaryQueue        = new Queue('summary',        { connection });
export const embeddingsQueue     = new Queue('embeddings',     { connection });
export const recommendationsQueue = new Queue('recommendations', { connection });
export const emailsQueue         = new Queue('emails',         { connection });
export const analyticsQueue      = new Queue('analytics',      { connection });
export const notificationsQueue  = new Queue('notifications',  { connection });

export { Worker, QueueEvents };
