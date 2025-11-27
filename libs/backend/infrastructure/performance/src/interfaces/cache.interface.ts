// Cache service interfaces

export interface RedisClient {
  get: (key: string) => Promise<string | null>;
  setex: (key: string, ttl: number, value: string) => Promise<void>;
  del: (key: string) => Promise<void>;
  flushdb: () => Promise<void>;
}

export interface CacheStats {
  size: number;
  items: number;
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
}
