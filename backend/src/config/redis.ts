// src/config/redis.ts
// TEMPORARILY DISABLED REDIS to stabilize the app
class MockRedis {
  on() {}
  async get() { return null; }
  async set() { return "OK"; }
  async del() { return 1; }
}

const redis = new MockRedis() as any;
export default redis;
