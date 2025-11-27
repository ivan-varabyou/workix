import { Injectable } from '@nestjs/common';

import {
  IntegrationProviderData,
  isRecord,
  ProviderConfig,
  ProviderCredential,
  ProviderRegistryPrismaService,
} from '../interfaces/provider-registry.interface';

@Injectable()
export class ProviderRegistryService {
  constructor(private readonly prisma: ProviderRegistryPrismaService) {}

  async listProviders(): Promise<IntegrationProviderData[]> {
    return this.prisma.integrationProvider.findMany();
  }

  async getProvider(providerId: string): Promise<IntegrationProviderData | null> {
    return this.prisma.integrationProvider.findUnique({
      where: { id: providerId },
    });
  }

  async upsertProvider(
    providerId: string,
    name: string,
    capabilities: string[]
  ): Promise<IntegrationProviderData> {
    return this.prisma.integrationProvider.upsert({
      where: { id: providerId },
      create: {
        id: providerId,
        name,
        type: 'unknown',
        config: {},
        credentials: {},
        isActive: true,
      },
      update: {
        name,
        config: { capabilities },
      },
    });
  }

  async getCredentials(providerId: string): Promise<ProviderCredential | null> {
    const provider = await this.prisma.integrationProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return null;
    }

    const credentials: Record<string, unknown> = isRecord(provider.credentials)
      ? provider.credentials
      : {};
    const keys = Object.keys(credentials);
    const firstKey = keys.length > 0 ? keys[0] : undefined;
    const defaultCredRaw = credentials['default'] || (firstKey ? credentials[firstKey] : undefined);
    const defaultCred: Record<string, unknown> | undefined = isRecord(defaultCredRaw)
      ? defaultCredRaw
      : undefined;

    if (!defaultCred) {
      return null;
    }

    const credential: ProviderCredential = {
      id: providerId,
      providerId,
    };
    if (defaultCred?.clientId && typeof defaultCred.clientId === 'string') {
      credential.clientId = defaultCred.clientId;
    }
    if (defaultCred?.clientSecretEnc && typeof defaultCred.clientSecretEnc === 'string') {
      credential.clientSecretEnc = defaultCred.clientSecretEnc;
    }
    if (defaultCred?.refreshTokenEnc && typeof defaultCred.refreshTokenEnc === 'string') {
      credential.refreshTokenEnc = defaultCred.refreshTokenEnc;
    }
    if (defaultCred?.accessTokenEnc && typeof defaultCred.accessTokenEnc === 'string') {
      credential.accessTokenEnc = defaultCred.accessTokenEnc;
    }
    if (defaultCred?.extra && isRecord(defaultCred.extra)) {
      credential.extra = defaultCred.extra;
    }
    return credential;
  }

  async setCredentials(
    providerId: string,
    data: Partial<ProviderCredential>
  ): Promise<IntegrationProviderData> {
    const provider: IntegrationProviderData | null =
      await this.prisma.integrationProvider.findUnique({
        where: { id: providerId },
      });

    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    const credentials: Record<string, unknown> = isRecord(provider.credentials)
      ? provider.credentials
      : {};
    credentials['default'] = {
      clientId: data.clientId || null,
      clientSecretEnc: data.clientSecretEnc || null,
      refreshTokenEnc: data.refreshTokenEnc || null,
      accessTokenEnc: data.accessTokenEnc || null,
      extra: data.extra || null,
      updatedAt: new Date().toISOString(),
    };

    return this.prisma.integrationProvider.update({
      where: { id: providerId },
      data: { credentials },
    });
  }

  async getConfig(providerId: string): Promise<ProviderConfig | null> {
    const provider: IntegrationProviderData | null =
      await this.prisma.integrationProvider.findUnique({
        where: { id: providerId },
      });

    if (!provider) {
      return null;
    }

    const config: Record<string, unknown> = isRecord(provider.config) ? provider.config : {};

    const providerConfig: ProviderConfig = {
      id: providerId,
      providerId,
      isActive: provider.isActive,
    };
    if (config.defaults && isRecord(config.defaults)) {
      providerConfig.defaults = config.defaults;
    }
    if (config.weights !== undefined && config.weights !== null) {
      providerConfig.weights = config.weights;
    }
    return providerConfig;
  }

  async setConfig(
    providerId: string,
    data: Partial<ProviderConfig>
  ): Promise<IntegrationProviderData> {
    const provider: IntegrationProviderData | null =
      await this.prisma.integrationProvider.findUnique({
        where: { id: providerId },
      });

    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    const config: Record<string, unknown> = isRecord(provider.config) ? provider.config : {};
    if (data.defaults) {
      config.defaults = data.defaults;
    }
    if (data.weights) {
      config.weights = data.weights;
    }

    return this.prisma.integrationProvider.update({
      where: { id: providerId },
      data: {
        config,
        isActive: data.isActive !== undefined ? data.isActive : provider.isActive,
      },
    });
  }
}
