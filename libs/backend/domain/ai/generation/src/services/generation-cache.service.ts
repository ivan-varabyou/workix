import { Injectable } from '@nestjs/common';

import { CacheValue } from '../interfaces/generation.interface';

/**
 * Simple in-memory cache service for generation results
 * In production, should use Redis
 */
@Injectable()
export class GenerationCacheService {
  private cache = new Map<string, CacheValue>();

  async get<T = unknown>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (item.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set<T = unknown>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const expiry = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiry });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async has(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) return false;
    return item.expiry > Date.now();
  }
}
