// src/jobs/index.ts — BullMQ queue definitions
// TEMPORARILY DISABLED to remove Redis dependency
const dummyQueue = { add: async () => {} } as any;

export const summaryQueue        = dummyQueue;
export const embeddingsQueue     = dummyQueue;
export const recommendationsQueue = dummyQueue;
export const emailsQueue         = dummyQueue;
export const analyticsQueue      = dummyQueue;
export const notificationsQueue  = dummyQueue;

export const Worker = class {} as any;
export const QueueEvents = class {} as any;
