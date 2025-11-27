import { Injectable, Logger } from '@nestjs/common';
import {
  extractRecordFromJson,
  PrismaService,
  toPrismaJsonValue,
} from '@workix/infrastructure/prisma';

@Injectable()
export class IntegrationTestService {
  private logger = new Logger(IntegrationTestService.name);

  constructor(private prisma: PrismaService) {}

  async testCRUD(): Promise<void> {
    try {
      // Test READ: Get all providers
      const providers = await this.prisma.integrationProvider.findMany();
      this.logger.log(`✅ Found ${providers.length} providers`);

      // Test CREATE: Add a test credential to JSON field
      if (providers.length > 0) {
        const provider = providers[0];
        if (!provider) {
          throw new Error('Provider not found');
        }
        const credentials = extractRecordFromJson(provider.credentials);
        credentials['test_credential'] = {
          type: 'OAUTH2',
          data: { accessToken: 'test_token_123', refreshToken: 'refresh_123' },
        };

        await this.prisma.integrationProvider.update({
          where: { id: provider.id },
          data: { credentials: toPrismaJsonValue(credentials) },
        });
        this.logger.log(`✅ Created credential in JSON field`);

        // Test READ: Get credentials from JSON field
        const updatedProvider = await this.prisma.integrationProvider.findUnique({
          where: { id: provider.id },
        });
        const creds = extractRecordFromJson(updatedProvider?.credentials);
        this.logger.log(`✅ Found ${Object.keys(creds).length} credentials for provider`);

        // Test UPDATE: Update config in JSON field
        const config = extractRecordFromJson(provider.config);
        config['TEST_CONFIG'] = { testValue: 'updated_123' };

        await this.prisma.integrationProvider.update({
          where: { id: provider.id },
          data: { config: toPrismaJsonValue(config) },
        });
        this.logger.log(`✅ Updated config in JSON field`);

        // Test DELETE: Remove credential from JSON field
        const updatedCredentials = { ...creds };
        delete updatedCredentials['test_credential'];
        await this.prisma.integrationProvider.update({
          where: { id: provider.id },
          data: { credentials: toPrismaJsonValue(updatedCredentials) },
        });
        this.logger.log(`✅ Deleted credential from JSON field`);
      }
    } catch (e) {
      this.logger.error('CRUD test failed:', e);
      throw e;
    }
  }
}
