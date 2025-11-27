import { Inject, Injectable } from '@nestjs/common';

import { RedisClient } from './interfaces/cache.interface';

/**
 * Cache Entry
 */
interface CacheEntry<T = unknown> {
  value: T;
  expiry: number;
}

@Injectable()
export class CacheService {
  private cache = new Map<string, CacheEntry>();

  constructor(@Inject('REDIS') private redis?: RedisClient) {}

  /**
   * Get cached value
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    if (this.redis) {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    }

    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.value as T;
    }

    this.cache.delete(key);
    return null;
  }

  /**
   * Set cached value
   */
  async set<T = unknown>(key: string, value: T, ttl = 3600): Promise<void> {
    if (this.redis) {
      await this.redis.setex(key, ttl, JSON.stringify(value));
      return;
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl * 1000,
    });
  }

  /**
   * Delete cached value
   */
  async delete(_key: string): Promise<void> {}
}
