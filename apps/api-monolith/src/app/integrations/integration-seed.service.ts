import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@workix/infrastructure/prisma';

@Injectable()
export class IntegrationSeedService implements OnModuleInit {
  private logger = new Logger(IntegrationSeedService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.seedProviders();
  }

  private async seedProviders(): Promise<void> {
    try {
      // Seed YouTube provider
      await this.prisma.integrationProvider.upsert({
        where: { name: 'youtube' },
        update: {},
        create: {
          name: 'youtube',
          type: 'youtube',
          config: {
            ANALYTICS_WEIGHT: { weight: 0.9, priority: 1 },
            baseApiUrl: 'https://www.googleapis.com/youtube/v3',
          },
          credentials: {},
        },
      });

      // Seed TikTok provider
      await this.prisma.integrationProvider.upsert({
        where: { name: 'tiktok' },
        update: {},
        create: {
          name: 'tiktok',
          type: 'tiktok',
          config: {
            ANALYTICS_WEIGHT: { weight: 0.8, priority: 2 },
            baseApiUrl: 'https://open.tiktok.com/v1',
          },
          credentials: {},
        },
      });

      // Seed Instagram provider
      await this.prisma.integrationProvider.upsert({
        where: { name: 'instagram' },
        update: {},
        create: {
          name: 'instagram',
          type: 'instagram',
          config: {
            ANALYTICS_WEIGHT: { weight: 0.85, priority: 3 },
            baseApiUrl: 'https://graph.instagram.com/v20.0',
          },
          credentials: {},
        },
      });

      // Seed Ozon provider
      await this.prisma.integrationProvider.upsert({
        where: { name: 'ozon' },
        update: {},
        create: {
          name: 'ozon',
          type: 'ozon',
          config: {
            ANALYTICS_WEIGHT: { weight: 0.75, priority: 4 },
            baseApiUrl: 'https://api-seller.ozon.ru',
          },
          credentials: {},
        },
      });

      // Seed Wildberries provider
      await this.prisma.integrationProvider.upsert({
        where: { name: 'wildberries' },
        update: {},
        create: {
          name: 'wildberries',
          type: 'wildberries',
          config: {
            ANALYTICS_WEIGHT: { weight: 0.8, priority: 5 },
            baseApiUrl: 'https://suppliers-api.wildberries.ru',
          },
          credentials: {},
        },
      });

      // Seed eBay provider
      await this.prisma.integrationProvider.upsert({
        where: { name: 'ebay' },
        update: {},
        create: {
          name: 'ebay',
          type: 'ebay',
          config: {
            ANALYTICS_WEIGHT: { weight: 0.7, priority: 6 },
            baseApiUrl: 'https://api.ebay.com',
          },
          credentials: {},
        },
      });

      // Seed Amazon provider
      await this.prisma.integrationProvider.upsert({
        where: { name: 'amazon' },
        update: {},
        create: {
          name: 'amazon',
          type: 'amazon',
          config: {
            ANALYTICS_WEIGHT: { weight: 0.9, priority: 1 },
            baseApiUrl: 'https://sellingpartnerapi-na.amazon.com',
          },
          credentials: {},
        },
      });

      this.logger.log('✅ Integration providers seeded successfully');
    } catch (e) {
      this.logger.error('Failed to seed providers:', e);
    }
  }
}
