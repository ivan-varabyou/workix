/**
 * App Module Interfaces
 * Интерфейсы для app.module.ts
 *
 * Правило: В интерфейсах НЕ используются импорты, только примитивные типы и другие интерфейсы
 */

/**
 * Rate Limit Configuration
 */
export interface RateLimitConfig {
  ttl: number;
  max: number;
  authMax: number;
  authTtl: number;
}

/**
 * Rate Limit Store Entry
 */
export interface RateLimitStoreEntry {
  count: number;
  resetTime: number;
}
