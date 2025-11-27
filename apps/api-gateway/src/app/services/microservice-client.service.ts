import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

/**
 * Microservice Client Service
 * Provides NestJS microservices client for Kafka/Redis transport
 * According to NestJS documentation: https://docs.nestjs.com/microservices/basics
 *
 * Usage:
 * - Inject MicroserviceClientService in your services
 * - Use send() for request-response pattern (MessagePattern)
 * - Use emit() for event pattern (EventPattern)
 *
 * Example:
 * ```typescript
 * // Request-response pattern
 * const result = await this.microserviceClient.send('auth.login', { email, password });
 *
 * // Event pattern (fire and forget)
 * this.microserviceClient.emit('user.created', { userId, email });
 * ```
 */
@Injectable()
export class MicroserviceClientService {
  private readonly logger: Logger = new Logger(MicroserviceClientService.name);

  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy
  ) {
    this.logger.log('MicroserviceClientService initialized with NestJS microservices clients');
  }

  /**
   * Send message to auth service (request-response pattern)
   * Uses @MessagePattern in microservice
   */
  async sendToAuth(pattern: string, data: unknown): Promise<unknown> {
    try {
      this.logger.debug(`Sending to AUTH_SERVICE: ${pattern}`);
      return await firstValueFrom(
        this.authClient.send(pattern, data).pipe(timeout(10000))
      );
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error sending to AUTH_SERVICE: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Emit event to auth service (event pattern, fire and forget)
   * Uses @EventPattern in microservice
   */
  emitToAuth(pattern: string, data: unknown): void {
    try {
      this.logger.debug(`Emitting to AUTH_SERVICE: ${pattern}`);
      this.authClient.emit(pattern, data);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error emitting to AUTH_SERVICE: ${errorMessage}`);
    }
  }

  /**
   * Send message to admin service (request-response pattern)
   */
  async sendToAdmin(pattern: string, data: unknown): Promise<unknown> {
    try {
      this.logger.debug(`Sending to ADMIN_SERVICE: ${pattern}`);
      return await firstValueFrom(
        this.adminClient.send(pattern, data).pipe(timeout(10000))
      );
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error sending to ADMIN_SERVICE: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Emit event to admin service (event pattern, fire and forget)
   */
  emitToAdmin(pattern: string, data: unknown): void {
    try {
      this.logger.debug(`Emitting to ADMIN_SERVICE: ${pattern}`);
      this.adminClient.emit(pattern, data);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error emitting to ADMIN_SERVICE: ${errorMessage}`);
    }
  }

  /**
   * Connect all microservice clients
   * Should be called on module initialization
   */
  async connect(): Promise<void> {
    try {
      await Promise.all([
        this.authClient.connect(),
        this.adminClient.connect(),
      ]);
      this.logger.log('All microservice clients connected');
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error connecting microservice clients: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Close all microservice client connections
   * Should be called on module destruction
   */
  async close(): Promise<void> {
    try {
      await Promise.all([
        this.authClient.close(),
        this.adminClient.close(),
      ]);
      this.logger.log('All microservice clients closed');
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error closing microservice clients: ${errorMessage}`);
    }
  }
}
