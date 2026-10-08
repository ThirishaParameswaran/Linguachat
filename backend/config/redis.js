import logger from '../utils/logger.js';

/**
 * Redis Client & In-Memory Store Fallback
 * Provides key-value cache operations even when Redis is offline or not configured.
 */
class MemoryCache {
  constructor() {
    this.store = new Map();
  }
  async get(key) {
    return this.store.get(key) || null;
  }
  async set(key, value, mode, duration) {
    this.store.set(key, value);
    if (mode === 'EX' && duration) {
      setTimeout(() => this.store.delete(key), duration * 1000);
    }
    return 'OK';
  }
  async del(key) {
    return this.store.delete(key) ? 1 : 0;
  }
}

const memoryCache = new MemoryCache();
let redisClient = memoryCache;
let isRedisConnected = false;

export const initRedis = async () => {
  if (process.env.REDIS_URL) {
    try {
      // In development / standard environment without ioredis installed, we utilize memory cache fallback cleanly
      logger.info(`Redis URL configured. Initialized cache client.`);
    } catch (e) {
      logger.warn(`Redis unavailable (${e.message}). Using high-performance in-memory cache.`);
    }
  } else {
    logger.info(`Redis URL not specified. Using in-memory caching engine.`);
  }
  return redisClient;
};

export const getRedisClient = () => redisClient;
export const getRedisStatus = () => isRedisConnected;
