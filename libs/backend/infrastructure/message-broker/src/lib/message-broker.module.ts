import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Message Broker Module
 * Provides Redis-based message queue using Bull
 *
 * Usage:
 * - Import MessageBrokerModule in your app module
 * - Inject Queue in your services
 * - Use @Process() decorator for processors
 */
@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): {
        redis: {
          host: string;
          port: number;
          db: number;
          password?: string;
          lazyConnect?: boolean;
          retryStrategy?: (times: number) => number | null;
        };
        defaultJobOptions: {
          attempts: number;
          backoff: {
            type: string;
            delay: number;
          };
          removeOnComplete: {
            age: number;
            count: number;
          };
          removeOnFail: {
            age: number;
          };
        };
      } => {
        const redisConfig: {
          host: string;
          port: number;
          db: number;
          password?: string;
          lazyConnect?: boolean;
          retryStrategy?: (times: number) => number | null;
        } = {
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 5900,
          db: configService.get<number>('REDIS_DB') || 0,
          lazyConnect: true, // Don't connect immediately, wait for first use
          retryStrategy: (times: number): number | null => {
            // Retry with exponential backoff, max 3 seconds
            const delay: number = Math.min(times * 50, 3000);
            return delay;
          },
        };
        const password = configService.get<string>('REDIS_PASSWORD');
        if (password !== undefined) {
          redisConfig.password = password;
        }
        return {
          redis: redisConfig,
          defaultJobOptions: {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
            removeOnComplete: {
              age: 3600, // Keep completed jobs for 1 hour
              count: 1000, // Keep last 1000 completed jobs
            },
            removeOnFail: {
              age: 86400, // Keep failed jobs for 24 hours
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [BullModule],
})
export class MessageBrokerModule {}
