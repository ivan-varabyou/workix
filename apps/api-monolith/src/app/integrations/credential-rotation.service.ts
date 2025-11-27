import { Injectable, Logger } from '@nestjs/common';
import { extractRecordFromJson, PrismaService } from '@workix/infrastructure/prisma';
import { CredentialManagerService } from '@workix/integrations/core';

import {
  CredentialRotationItem,
  RotationError,
  RotationResult,
} from './interfaces/credential-rotation.interface';

@Injectable()
export class CredentialRotationService {
  private readonly logger = new Logger(CredentialRotationService.name);

  constructor(private prisma: PrismaService, private credentialManager: CredentialManagerService) {}

  /**
   * Rotate all credentials for a specific provider
   */
  async rotateProviderCredentials(providerId: string) {
    this.logger.log(`Starting credential rotation for provider: ${providerId}`);

    const results = await this.credentialManager.rotateCredentials(providerId);

    const successCount = results.filter((r) => r.status === 'rotated').length;
    const failedCount = results.filter((r) => r.status === 'failed').length;

    this.logger.log(
      `Credential rotation completed for provider ${providerId}: ${successCount} rotated, ${failedCount} failed`
    );

    return {
      providerId,
      total: results.length,
      rotated: successCount,
      failed: failedCount,
      results,
    };
  }

  /**
   * Rotate all credentials for all providers
   */
  async rotateAllCredentials() {
    this.logger.log('Starting credential rotation for all providers');

    const providers = await this.prisma.integrationProvider.findMany({
      select: { id: true, name: true, credentials: true },
    });

    const results: Array<RotationResult | RotationError> = [];
    for (const provider of providers) {
      try {
        const result = await this.rotateProviderCredentials(provider.id);
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to rotate credentials for provider ${provider.name}:`, error);
        results.push({
          providerId: provider.id,
          total: 0,
          rotated: 0,
          failed: 1,
          error: error instanceof Error ? error.message : String(error),
        } as RotationError);
      }
    }

    const totalRotated = results.reduce((sum, r) => sum + r.rotated, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);

    this.logger.log(
      `Credential rotation completed for all providers: ${totalRotated} rotated, ${totalFailed} failed`
    );

    return {
      totalProviders: providers.length,
      totalRotated,
      totalFailed,
      results,
    };
  }

  /**
   * Check for expired credentials and rotate them
   */
  async rotateExpiredCredentials() {
    this.logger.log('Checking for expired credentials');

    // Get all providers and check their credentials JSON field
    const providers = await this.prisma.integrationProvider.findMany({
      select: { id: true, name: true, credentials: true },
    });

    const expiredCredentials: CredentialRotationItem[] = [];
    for (const provider of providers) {
      const credentials = extractRecordFromJson(provider.credentials);
      for (const [key, cred] of Object.entries(credentials)) {
        if (typeof cred === 'object' && cred !== null && 'expiresAt' in cred) {
          const expiresAt =
            typeof cred.expiresAt === 'string' ? cred.expiresAt : String(cred.expiresAt);
          if (expiresAt && new Date(expiresAt) < new Date()) {
            expiredCredentials.push({
              providerId: provider.id,
              key,
              credential: cred,
            });
          }
        }
      }
    }

    if (expiredCredentials.length === 0) {
      return {
        total: 0,
        rotated: 0,
        failed: 0,
        results: [],
      };
    }

    // Rotate expired credentials
    const results: Array<RotationResult | RotationError> = [];
    for (const { providerId } of expiredCredentials) {
      try {
        const result = await this.rotateProviderCredentials(providerId);
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to rotate expired credential for provider ${providerId}:`, error);
        results.push({
          providerId,
          total: 0,
          rotated: 0,
          failed: 1,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      total: expiredCredentials.length,
      rotated: results.filter((r) => r.rotated > 0).length,
      failed: results.filter((r) => r.failed > 0).length,
      results,
    };
  }

  /**
   * Rotate credentials that are about to expire (within X days)
   */
  async rotateExpiringCredentials(daysBeforeExpiry = 7) {
    this.logger.log(`Checking for credentials expiring within ${daysBeforeExpiry} days`);

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysBeforeExpiry);

    // Get all providers and check their credentials JSON field
    const providers = await this.prisma.integrationProvider.findMany({
      select: { id: true, name: true, credentials: true },
    });

    const expiringCredentials: CredentialRotationItem[] = [];
    for (const provider of providers) {
      const credentials = extractRecordFromJson(provider.credentials);
      for (const [key, cred] of Object.entries(credentials)) {
        if (typeof cred === 'object' && cred !== null && 'expiresAt' in cred) {
          const expiresAtValue =
            typeof cred.expiresAt === 'string' ? cred.expiresAt : String(cred.expiresAt);
          if (expiresAtValue) {
            const expiresAt = new Date(expiresAtValue);
            if (expiresAt <= expiryDate && expiresAt >= new Date()) {
              expiringCredentials.push({
                providerId: provider.id,
                key,
                credential: cred,
              });
            }
          }
        }
      }
    }

    if (expiringCredentials.length === 0) {
      this.logger.log('No expiring credentials found');
      return {
        total: 0,
        rotated: 0,
        failed: 0,
        results: [],
      };
    }

    this.logger.log(`Found ${expiringCredentials.length} expiring credentials`);

    const results: Array<RotationResult | RotationError> = [];
    const processedProviders = new Set<string>();

    for (const cred of expiringCredentials) {
      if (processedProviders.has(cred.providerId)) {
        continue; // Already processed this provider
      }

      processedProviders.add(cred.providerId);

      try {
        const result = await this.rotateProviderCredentials(cred.providerId);
        results.push(result);
      } catch (error) {
        this.logger.error(
          `Failed to rotate expiring credentials for provider ${cred.providerId}:`,
          error
        );
        results.push({
          providerId: cred.providerId,
          total: 1,
          rotated: 0,
          failed: 1,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const totalRotated = results.reduce((sum, r) => sum + r.rotated, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);

    return {
      total: expiringCredentials.length,
      rotated: totalRotated,
      failed: totalFailed,
      results,
    };
  }
}
