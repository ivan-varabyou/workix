import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { IntegrationRouter } from './router/integration.router';
import { AdapterBuilderService } from './services/adapter-builder.service';
import { AdminApiManagementService } from './services/admin-api-management.service';
import { CredentialManagerService } from './services/credential-manager.service';
import { CryptoService } from './services/crypto.service';
import { DataSyncService } from './services/data-sync.service';
import { DataTransformerService } from './services/data-transformer.service';
import { IntegrationEventLoggerService } from './services/integration-event-logger.service';
import { ProviderRegistryService } from './services/provider-registry.service';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [
    ProviderRegistryService,
    IntegrationRouter,
    CryptoService,
    CredentialManagerService,
    IntegrationEventLoggerService,
    DataTransformerService,
    DataSyncService,
    AdminApiManagementService,
    AdapterBuilderService,
  ],
  exports: [
    ProviderRegistryService,
    IntegrationRouter,
    CryptoService,
    CredentialManagerService,
    IntegrationEventLoggerService,
    DataTransformerService,
    DataSyncService,
    AdminApiManagementService,
    AdapterBuilderService,
  ],
})
export class IntegrationCoreModule {}
