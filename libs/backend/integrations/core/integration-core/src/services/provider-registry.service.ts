import { Injectable } from '@nestjs/common';

import {
  isRecord,
  ProviderRegistryPrismaService,
} from '../../../src/interfaces/provider-registry.interface';

export interface ProviderCredential {
  id: string;
  providerId: string;
  clientId?: string;
  clientSecretEnc?: string;
  refreshTokenEnc?: string;
  accessTokenEnc?: string;
  extra?: Record<string, unknown>;
}

export interface ProviderConfig {
  id: string;
  providerId: string;
  defaults?: Record<string, unknown>;
  weights?: { quality?: number; speed?: number; cost?: number };
  isActive: boolean;
}

@Injectable()
export class ProviderRegistryService {
  constructor(private readonly prisma: ProviderRegistryPrismaService) {}

  async listProviders() {
    return this.prisma.integrationProvider.findMany();
  }

  async getProvider(providerId: string) {
    return this.prisma.integrationProvider.findUnique({
      where: { id: providerId },
    });
  }

  async upsertProvider(providerId: string, name: string, capabilities: string[]) {
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

    const credentials = isRecord(provider.credentials) ? provider.credentials : {};
    const keys = Object.keys(credentials);
    const firstKey = keys.length > 0 ? keys[0] : undefined;
    const defaultCredRaw: unknown =
      credentials['default'] || (firstKey ? credentials[firstKey] : undefined);
    const defaultCred = isRecord(defaultCredRaw) ? defaultCredRaw : null;

    if (!defaultCred) {
      return null;
    }

    const credential: ProviderCredential = {
      id: providerId,
      providerId,
    };
    if (defaultCred.clientId && typeof defaultCred.clientId === 'string') {
      credential.clientId = defaultCred.clientId;
    }
    if (defaultCred.clientSecretEnc && typeof defaultCred.clientSecretEnc === 'string') {
      credential.clientSecretEnc = defaultCred.clientSecretEnc;
    }
    if (defaultCred.refreshTokenEnc && typeof defaultCred.refreshTokenEnc === 'string') {
      credential.refreshTokenEnc = defaultCred.refreshTokenEnc;
    }
    if (defaultCred.accessTokenEnc && typeof defaultCred.accessTokenEnc === 'string') {
      credential.accessTokenEnc = defaultCred.accessTokenEnc;
    }
    if (defaultCred.extra && isRecord(defaultCred.extra)) {
      credential.extra = defaultCred.extra;
    }
    return credential;
  }

  async setCredentials(providerId: string, data: Partial<ProviderCredential>) {
    const provider = await this.prisma.integrationProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    const credentials = isRecord(provider.credentials) ? provider.credentials : {};
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
    const provider = await this.prisma.integrationProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return null;
    }

    const config = isRecord(provider.config) ? provider.config : {};
    const defaultsRaw: unknown = config.defaults;
    const defaults: Record<string, unknown> | undefined = isRecord(defaultsRaw)
      ? defaultsRaw
      : undefined;

    const providerConfig: ProviderConfig = {
      id: providerId,
      providerId,
      isActive: provider.isActive,
    };
    if (defaults !== undefined) {
      providerConfig.defaults = defaults;
    }
    if (config.weights !== undefined && config.weights !== null) {
      providerConfig.weights = config.weights;
    }
    return providerConfig;
  }

  async setConfig(providerId: string, data: Partial<ProviderConfig>) {
    const provider = await this.prisma.integrationProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    const config = isRecord(provider.config) ? provider.config : {};
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
