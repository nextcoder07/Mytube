"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueEvents = exports.Worker = exports.notificationsQueue = exports.analyticsQueue = exports.emailsQueue = exports.recommendationsQueue = exports.embeddingsQueue = exports.summaryQueue = void 0;
// src/jobs/index.ts — BullMQ queue definitions
// TEMPORARILY DISABLED to remove Redis dependency
const dummyQueue = { add: async () => { } };
exports.summaryQueue = dummyQueue;
exports.embeddingsQueue = dummyQueue;
exports.recommendationsQueue = dummyQueue;
exports.emailsQueue = dummyQueue;
exports.analyticsQueue = dummyQueue;
exports.notificationsQueue = dummyQueue;
exports.Worker = class {
};
exports.QueueEvents = class {
};
//# sourceMappingURL=index.js.map