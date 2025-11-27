/**
 * Circuit Breaker Interfaces
 * All interfaces for circuit breaker module
 */

/**
 * Circuit Breaker Configuration
 */
export interface CircuitBreakerConfig {
  failureThreshold?: number;
  successThreshold?: number;
  timeout?: number;
}

/**
 * Circuit Breaker State
 */
export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

/**
 * Circuit Breaker Status
 */
export interface CircuitBreakerStatus {
  name: string;
  state: CircuitBreakerState;
  failures: number;
  lastError: string | null;
}
