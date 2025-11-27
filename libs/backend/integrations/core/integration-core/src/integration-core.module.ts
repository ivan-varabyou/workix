import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { IntegrationRouter } from './router/integration.router';
import { CredentialManagerService } from './services/credential-manager.service';
import { CryptoService } from './services/crypto.service';
import { IntegrationEventLoggerService } from './services/integration-event-logger.service';
import { ProviderRegistryService } from './services/provider-registry.service';

@Module({
  imports: [ConfigModule],
  providers: [
    ProviderRegistryService,
    IntegrationRouter,
    CryptoService,
    CredentialManagerService,
    IntegrationEventLoggerService,
  ],
  exports: [
    ProviderRegistryService,
    IntegrationRouter,
    CryptoService,
    CredentialManagerService,
    IntegrationEventLoggerService,
  ],
})
export class IntegrationCoreModule {}
