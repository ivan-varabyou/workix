import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@workix/infrastructure/prisma';
import { IntegrationCoreModule } from '@workix/integrations/core';

// TODO: Create these integration providers
// import { YouTubeApiService } from '@workix/integrations/src/youtube/services/youtube-api.service';
// import { YouTubeAnalyticsService } from '@workix/integrations/src/youtube/services/youtube-analytics.service';
// import { YouTubeAnalyticsProvider } from '@workix/integrations/src/youtube/providers/youtube-analytics.provider';
// import { YouTubeUploadProvider } from '@workix/integrations/src/youtube/providers/youtube-upload.provider';
// import { TikTokAnalyticsProvider } from '@workix/integrations/src/tiktok/providers/tiktok-analytics.provider';
// import { InstagramAnalyticsProvider } from '@workix/integrations/src/instagram/providers/instagram-analytics.provider';
// import { OzonAnalyticsProvider } from '@workix/integrations/src/ozon/providers/ozon-analytics.provider';
// import { WildberriesAnalyticsProvider } from '@workix/integrations/src/wildberries/providers/wildberries-analytics.provider';
// import { EbayAnalyticsProvider } from '@workix/integrations/src/ebay/providers/ebay-analytics.provider';
// import { AmazonAnalyticsProvider } from '@workix/integrations/src/amazon/providers/amazon-analytics.provider';
// import { UniversalAnalyticsService } from '@workix/integrations/src/analytics/universal-analytics.service';
import { AnalyticsController } from './analytics.controller';
import { CredentialRotationController } from './credential-rotation.controller';
import { CredentialRotationService } from './credential-rotation.service';
import { EcommerceCrudController } from './e-commerce-crud.controller';
import { IntegrationCrudController } from './integration-crud.controller';
import { IntegrationHealthController } from './integration-health.controller';
import { IntegrationMetricsController } from './integration-metrics.controller';
import { IntegrationMonitoringController } from './integration-monitoring.controller';
import { IntegrationMonitoringService } from './integration-monitoring.service';
import { IntegrationSeedService } from './integration-seed.service';

@Module({
  imports: [ConfigModule, IntegrationCoreModule, PrismaModule],
  controllers: [
    AnalyticsController,
    IntegrationCrudController,
    EcommerceCrudController,
    IntegrationHealthController,
    IntegrationMetricsController,
    CredentialRotationController,
    IntegrationMonitoringController,
  ],
  providers: [
    // TODO: Add integration providers when they are created
    // YouTubeApiService,
    // YouTubeAnalyticsService,
    // YouTubeAnalyticsProvider,
    // YouTubeUploadProvider,
    // TikTokAnalyticsProvider,
    // InstagramAnalyticsProvider,
    // OzonAnalyticsProvider,
    // WildberriesAnalyticsProvider,
    // EbayAnalyticsProvider,
    // AmazonAnalyticsProvider,
    // UniversalAnalyticsService,
    IntegrationSeedService,
    CredentialRotationService,
    IntegrationMonitoringService,
    // TODO: Register integration providers when they are created
    // {
    //   provide: 'REGISTER_INTEGRATION_PROVIDERS',
    //   useFactory: (router: IntegrationRouter) => {
    //     // Register providers here
    //     return true;
    //   },
    //   inject: [IntegrationRouter],
    // },
  ],
})
export class IntegrationsModule {}
