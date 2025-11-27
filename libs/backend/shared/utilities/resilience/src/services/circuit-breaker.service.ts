import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

import {
  CircuitBreakerConfig,
  CircuitBreakerState,
  CircuitBreakerStatus,
} from '../interfaces/circuit-breaker.interface';

/**
 * Circuit Breaker Service
 * Implements the Circuit Breaker Pattern for resilience
 */
@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private circuits = new Map<string, CircuitBreaker>();

  /**
   * Create circuit breaker for service
   */
  createCircuit(serviceName: string, config?: CircuitBreakerConfig): CircuitBreaker {
    const circuit = new CircuitBreaker(serviceName, config);
    this.circuits.set(serviceName, circuit);
    this.logger.log(`Circuit breaker created for: ${serviceName}`);
    return circuit;
  }

  /**
   * Get circuit breaker
   */
  getCircuit(serviceName: string): CircuitBreaker {
    if (!this.circuits.has(serviceName)) {
      return this.createCircuit(serviceName);
    }
    const circuit = this.circuits.get(serviceName);
    if (circuit === undefined) {
      return this.createCircuit(serviceName);
    }
    return circuit;
  }

  /**
   * Execute with circuit breaker protection
   */
  async execute<T>(serviceName: string, fn: () => Promise<T>): Promise<T> {
    const circuit = this.getCircuit(serviceName);
    return await circuit.execute(fn);
  }

  /**
   * Get all circuit statuses
   */
  getAllCircuits(): CircuitBreakerStatus[] {
    return Array.from(this.circuits.entries()).map(([name, circuit]) => ({
      name,
      state: circuit.getState() as CircuitBreakerState,
      failures: circuit.getFailureCount(),
      lastError: circuit.getLastError(),
    }));
  }

  /**
   * Reset circuit
   */
  resetCircuit(serviceName: string): void {
    const circuit = this.getCircuit(serviceName);
    circuit.reset();
    this.logger.log(`Circuit reset for: ${serviceName}`);
  }
}

class CircuitBreaker {
  private state: CircuitBreakerState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private lastError: string | null = null;

  private readonly _failureThreshold: number;
  private readonly successThreshold: number;
  private readonly timeout: number;

  constructor(private serviceName: string, config?: CircuitBreakerConfig) {
    this._failureThreshold = config?.failureThreshold || 5;
    this.successThreshold = config?.successThreshold || 3;
    this.timeout = config?.timeout || 60000; // 1 minute
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if should transition to HALF_OPEN
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        throw new ServiceUnavailableException(
          `Service ${this.serviceName} is unavailable. ${this.lastError}`
        );
      }
    }

    try {
      const result = await fn();

      // Success
      if (this.state === 'HALF_OPEN') {
        this.successCount++;
        if (this.successCount >= this.successThreshold) {
          this.state = 'CLOSED';
          this.failureCount = 0;
          this.successCount = 0;
        }
      } else if (this.state === 'CLOSED') {
        this.failureCount = Math.max(0, this.failureCount - 1);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.failureCount++;
      this.lastFailureTime = Date.now();
      this.lastError = errorMessage;

      // Transition to OPEN if failure threshold is reached
      if (this.failureCount >= this._failureThreshold) {
        this.state = 'OPEN';
      }

      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  getLastError(): string | null {
    return this.lastError;
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
    this.lastError = null;
  }
}
