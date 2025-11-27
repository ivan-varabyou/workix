/**
 * Event Publisher Service
 * Generic event publisher interface
 */

import { Injectable, Logger, Optional } from '@nestjs/common';
import { PubSubPublisherService } from './pubsub/pubsub-publisher.service';

export interface EventPublisherService {
  publish(event: string, data: unknown): Promise<void>;
  publishEmailVerification(event: Omit<EmailVerificationEvent, 'type' | 'timestamp'> & { type?: EmailVerificationEvent['type']; timestamp?: Date }): Promise<void>;
  publishSecurityCode(event: Omit<SecurityCodeEvent, 'type' | 'timestamp'> & { type?: SecurityCodeEvent['type']; timestamp?: Date }): Promise<void>;
  publishPasswordReset(event: Omit<PasswordResetEvent, 'type' | 'timestamp'> & { type?: PasswordResetEvent['type']; timestamp?: Date }): Promise<void>;
}

/**
 * Default Event Publisher Service Implementation
 */
@Injectable()
export class DefaultEventPublisherService implements EventPublisherService {
  private readonly logger = new Logger(DefaultEventPublisherService.name);

  constructor(@Optional() private readonly pubSub?: PubSubPublisherService) {
    void this.pubSub;
  }

  async publish(event: string, data: unknown): Promise<void> {
    this.logger.debug(`[EventPublisher] Would publish event: ${event}`);
    if (this.pubSub) {
      // Extract channel from event name (e.g., 'email.verification' -> 'email.*')
      const channel = event.split('.')[0] + '.*';
      await this.pubSub.publish(channel, event, data);
    }
  }

  async publishEmailVerification(event: Omit<EmailVerificationEvent, 'type' | 'timestamp'> & { type?: EmailVerificationEvent['type']; timestamp?: Date }): Promise<void> {
    const fullEvent: EmailVerificationEvent = {
      ...event,
      type: event.type || 'email.verification.sent',
      timestamp: event.timestamp || new Date(),
    };
    await this.publish('email.verification', fullEvent);
  }

  async publishSecurityCode(event: Omit<SecurityCodeEvent, 'type' | 'timestamp'> & { type?: SecurityCodeEvent['type']; timestamp?: Date }): Promise<void> {
    const fullEvent: SecurityCodeEvent = {
      ...event,
      type: event.type || 'security.code.generated',
      timestamp: event.timestamp || new Date(),
    };
    await this.publish('security.code', fullEvent);
  }

  async publishPasswordReset(event: Omit<PasswordResetEvent, 'type' | 'timestamp'> & { type?: PasswordResetEvent['type']; timestamp?: Date }): Promise<void> {
    const fullEvent: PasswordResetEvent = {
      ...event,
      type: event.type || 'password.reset.requested',
      timestamp: event.timestamp || new Date(),
    };
    await this.publish('password.reset', fullEvent);
  }
}

/**
 * Event Types
 */
export interface EmailVerificationEvent {
  type: 'email.verification.sent' | 'email.verification.verified' | 'email.verification.failed';
  userId?: string;
  email: string;
  token?: string;
  expiresAt?: Date;
  verificationLink?: string;
  timestamp: Date;
}

export interface SecurityCodeEvent {
  type: 'security.code.generated' | 'security.code.verified' | 'security.code.failed';
  userId?: string;
  email?: string;
  code?: string;
  reason?: 'location_change' | 'suspicious_activity' | 'new_device';
  expiresAt?: Date;
  ipAddress?: string;
  country?: string;
  countryName?: string;
  timestamp: Date;
}

export interface PasswordResetEvent {
  type: 'password.reset.requested' | 'password.reset.completed' | 'password.reset.failed';
  userId?: string;
  email: string;
  token?: string;
  expiresAt?: Date;
  resetLink?: string;
  timestamp: Date;
}
