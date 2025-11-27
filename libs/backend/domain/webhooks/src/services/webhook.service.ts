import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { Webhook, WebhookEvent, WebhookPayload } from '../interfaces/webhook.interface';
import { WebhookPrismaService, WebhookUpdateData } from '../interfaces/webhook-prisma.interface';

@Injectable()
export class WebhookService {
  private logger = new Logger(WebhookService.name);
  private webhooks: Webhook[] = [];
  private events: WebhookEvent[] = [];

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: WebhookPrismaService
  ) {}

  // Getters
  get activeWebhooks(): Webhook[] {
    return this.webhooks.filter((w) => w.active);
  }

  get failedEvents(): WebhookEvent[] {
    return this.events.filter((e) => e.status === 'failed');
  }

  get successRate(): number {
    if (this.events.length === 0) return 100;

    const successful = this.events.filter((e) => e.status === 'success').length;
    return Math.round((successful / this.events.length) * 100);
  }

  /**
   * Create a new webhook
   */
  async createWebhook(userId: string, url: string, events: string[]): Promise<Webhook> {
    const secret = this.generateSecret();

    const webhook = await this.prisma.webhook.create({
      data: {
        userId,
        url,
        events,
        secret,
        active: true,
        retries: 3,
        timeout: 30,
      },
    });

    this.webhooks.push(webhook);
    return webhook;
  }

  /**
   * Update webhook
   */
  async updateWebhook(webhookId: string, updates: WebhookUpdateData): Promise<Webhook> {
    const webhook = await this.prisma.webhook.update({
      where: { id: webhookId },
      data: updates,
    });

    this.webhooks = this.webhooks.map((wh) => (wh.id === webhookId ? webhook : wh));
    return webhook;
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    await this.prisma.webhook.delete({
      where: { id: webhookId },
    });

    this.webhooks = this.webhooks.filter((wh) => wh.id !== webhookId);
  }

  /**
   * Get user webhooks
   */
  async getUserWebhooks(userId: string): Promise<Webhook[]> {
    try {
      const webhooks = await this.prisma.webhook.findMany({
        where: { userId },
      });
      this.webhooks = webhooks;
      return webhooks;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get user webhooks: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Trigger webhook event
   */
  async triggerWebhook(
    webhookId: string,
    event: string,
    payload: WebhookPayload
  ): Promise<WebhookEvent> {
    const webhook = await this.prisma.webhook.findUnique({
      where: { id: webhookId },
    });

    if (!webhook || !webhook.active) {
      throw new Error('Webhook not found or inactive');
    }

    // Check if webhook is subscribed to this event
    if (!webhook.events.includes(event)) {
      throw new Error('Webhook not subscribed to this event');
    }

    // Create webhook event record
    const webhookEvent = await this.prisma.webhookEvent.create({
      data: {
        webhookId,
        event,
        payload,
        status: 'pending',
        attempt: 0,
      },
    });

    // Queue for delivery
    this.deliverWebhook(webhookEvent, webhook).catch((error) => {
      this.logger.error('Webhook delivery error:', error);
    });

    return webhookEvent;
  }

  /**
   * Deliver webhook with retries
   */
  private async deliverWebhook(event: WebhookEvent, webhook: Webhook): Promise<void> {
    const maxAttempts = webhook.retries + 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await firstValueFrom(
          this.httpService.post(webhook.url, {
            event: event.event,
            data: event.payload,
            timestamp: new Date().toISOString(),
            webhookId: webhook.id,
          })
        );

        // Update as successful
        await this.prisma.webhookEvent.update({
          where: { id: event.id },
          data: {
            status: 'success',
            statusCode: response.status || 200,
            attempt,
          },
        });

        this.events = this.events.map((ev) =>
          ev.id === event.id ? { ...ev, status: 'success', attempt } : ev
        );

        return;
      } catch (error: unknown) {
        const isLastAttempt = attempt === maxAttempts;

        if (isLastAttempt) {
          // Final failure
          const errorMessage: string =
            error instanceof Error
              ? error.message
              : typeof error === 'object' &&
                error !== null &&
                'message' in error &&
                typeof error.message === 'string'
              ? error.message
              : 'Unknown error';
          const statusCode: number =
            typeof error === 'object' &&
            error !== null &&
            'response' in error &&
            typeof error.response === 'object' &&
            error.response !== null &&
            'status' in error.response &&
            typeof error.response.status === 'number'
              ? error.response.status
              : 0;

          await this.prisma.webhookEvent.update({
            where: { id: event.id },
            data: {
              status: 'failed',
              error: errorMessage,
              statusCode: statusCode || 0,
              attempt,
            },
          });

          this.events = this.events.map((ev) =>
            ev.id === event.id
              ? {
                  ...ev,
                  status: 'failed',
                  error: errorMessage,
                  attempt,
                }
              : ev
          );
        } else {
          // Retry after delay
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await this.sleep(delay);
        }
      }
    }
  }

  /**
   * Get webhook events
   */
  async getWebhookEvents(webhookId: string, limit = 50): Promise<WebhookEvent[]> {
    const events = await this.prisma.webhookEvent.findMany({
      where: { webhookId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    this.events = events;
    return events;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const crypto = require('crypto');
    const hash = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    return hash === signature;
  }

  /**
   * Test webhook
   */
  async testWebhook(webhookId: string): Promise<boolean> {
    const webhook = await this.prisma.webhook.findUnique({
      where: { id: webhookId },
    });

    if (!webhook) {
      throw new Error('Webhook not found');
    }

    try {
      await firstValueFrom(
        this.httpService.post(webhook.url, {
          event: 'test',
          data: { timestamp: new Date().toISOString() },
          test: true,
        })
      );

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Retry failed event
   */
  async retryEvent(eventId: string): Promise<void> {
    const event = await this.prisma.webhookEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    const webhook = await this.prisma.webhook.findUnique({
      where: { id: event.webhookId },
    });

    if (!webhook) {
      throw new Error('Webhook not found');
    }

    // Reset event for retry
    await this.prisma.webhookEvent.update({
      where: { id: eventId },
      data: {
        status: 'pending',
        error: null,
        attempt: 0,
      },
    });

    // Redeliver
    this.deliverWebhook(event, webhook).catch((error) => {
      this.logger.error('Webhook retry error:', error);
    });
  }

  private generateSecret(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
