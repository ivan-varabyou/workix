import { Injectable, Logger } from '@nestjs/common';

import { ApiKey, ApiKeyPrismaService, ApiKeyUsage } from '../interfaces/api-key-prisma.interface';

@Injectable()
export class ApiKeyService {
  private logger = new Logger(ApiKeyService.name);
  private apiKeys: ApiKey[] = [];

  constructor(private readonly prisma: ApiKeyPrismaService) {}

  // Getters
  get activeKeys(): ApiKey[] {
    return this.apiKeys.filter((k) => k.active);
  }

  get expiredKeys(): ApiKey[] {
    return this.apiKeys.filter((k) => k.expiresAt && new Date() > k.expiresAt);
  }

  /**
   * Generate new API key
   */
  async generateApiKey(
    userId: string,
    name: string,
    permissions: string[] = [],
    expiresInDays?: number
  ): Promise<ApiKey> {
    const key = this.generateRandomKey();
    const secret = this.generateRandomSecret();

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    const createData: {
      userId: string;
      name: string;
      key: string;
      secret: string;
      permissions: string[];
      rateLimit: number;
      active: boolean;
      expiresAt?: Date;
    } = {
      userId,
      name,
      key,
      secret,
      permissions,
      rateLimit: 1000, // Default rate limit
      active: true,
    };
    if (expiresAt !== undefined) {
      createData.expiresAt = expiresAt;
    }
    const apiKey = await this.prisma.apiKey.create({
      data: createData,
    });

    this.apiKeys.push(apiKey);
    return apiKey;
  }

  /**
   * Get user API keys
   */
  async getUserApiKeys(userId: string): Promise<ApiKey[]> {
    try {
      const keys = await this.prisma.apiKey.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      this.apiKeys = keys;
      return keys;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate API key
   */
  async validateApiKey(key: string, secret: string): Promise<ApiKey | null> {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { key },
    });

    if (!apiKey || !apiKey.active) {
      return null;
    }

    // Check expiration
    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      return null;
    }

    // Verify secret
    // Hash calculation reserved for future use
    // const crypto = require('crypto');
    // const _hash = crypto.createHmac('sha256', apiKey.secret).update(key).digest('hex');

    // Compare secrets (in real implementation, would store hash)
    if (apiKey.secret !== secret) {
      return null;
    }

    return apiKey;
  }

  /**
   * Check if key has permission
   */
  hasPermission(apiKey: ApiKey, permission: string): boolean {
    return apiKey.permissions.includes(permission) || apiKey.permissions.includes('*');
  }

  /**
   * Revoke API key
   */
  async revokeApiKey(keyId: string): Promise<void> {
    await this.prisma.apiKey.update({
      where: { id: keyId },
      data: { active: false },
    });

    this.apiKeys = this.apiKeys.map((k) => (k.id === keyId ? { ...k, active: false } : k));
  }

  /**
   * Update API key
   */
  async updateApiKey(keyId: string, updates: Partial<ApiKey>): Promise<ApiKey> {
    const updateData: {
      name?: string;
      permissions?: string[];
      rateLimit?: number;
      expiresAt?: Date;
      active?: boolean;
      lastUsedAt?: Date;
    } = {};
    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }
    if (updates.permissions !== undefined) {
      updateData.permissions = updates.permissions;
    }
    if (updates.rateLimit !== undefined) {
      updateData.rateLimit = updates.rateLimit;
    }
    if (updates.expiresAt !== undefined && updates.expiresAt !== null) {
      updateData.expiresAt = updates.expiresAt;
    }
    if (updates.active !== undefined) {
      updateData.active = updates.active;
    }
    if (updates.lastUsedAt !== undefined && updates.lastUsedAt !== null) {
      updateData.lastUsedAt = updates.lastUsedAt;
    }
    const updated = await this.prisma.apiKey.update({
      where: { id: keyId },
      data: updateData,
    });

    this.apiKeys = this.apiKeys.map((k) => (k.id === keyId ? updated : k));

    return updated;
  }

  /**
   * Delete API key
   */
  async deleteApiKey(keyId: string): Promise<void> {
    await this.prisma.apiKey.delete({
      where: { id: keyId },
    });

    this.apiKeys = this.apiKeys.filter((k) => k.id !== keyId);
  }

  /**
   * Log API key usage
   */
  async logUsage(
    apiKeyId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    ipAddress: string,
    userAgent: string
  ): Promise<ApiKeyUsage> {
    const usage = await this.prisma.apiKeyUsage.create({
      data: {
        apiKeyId,
        endpoint,
        method,
        statusCode,
        ipAddress,
        userAgent,
      },
    });

    // Update lastUsedAt
    await this.prisma.apiKey.update({
      where: { id: apiKeyId },
      data: { lastUsedAt: new Date() },
    });

    return usage;
  }

  /**
   * Get API key usage
   */
  async getApiKeyUsage(apiKeyId: string, limit = 100): Promise<ApiKeyUsage[]> {
    return this.prisma.apiKeyUsage.findMany({
      where: { apiKeyId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  /**
   * Check rate limit
   */
  async checkRateLimit(
    apiKeyId: string,
    window = 60 // seconds
  ): Promise<boolean> {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { id: apiKeyId },
    });

    if (!apiKey) return false;

    const now = new Date();
    const windowStart = new Date(now.getTime() - window * 1000);

    const count = await this.prisma.apiKeyUsage.count({
      where: {
        apiKeyId,
        timestamp: {
          gte: windowStart,
          lte: now,
        },
      },
    });

    return count < apiKey.rateLimit;
  }

  /**
   * Get usage statistics
   */
  async getUsageStatistics(apiKeyId: string): Promise<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    topEndpoints: Array<{ endpoint: string; count: number }>;
  }> {
    const usages = await this.prisma.apiKeyUsage.findMany({
      where: { apiKeyId },
    });

    const totalRequests = usages.length;
    const successfulRequests = usages.filter(
      (u) => u.statusCode >= 200 && u.statusCode < 300
    ).length;
    const failedRequests = usages.filter((u) => u.statusCode >= 400).length;

    // Group by endpoint
    const endpointCounts: Record<string, number> = {};
    usages.forEach((u) => {
      endpointCounts[u.endpoint] = (endpointCounts[u.endpoint] || 0) + 1;
    });

    const topEndpoints = Object.entries(endpointCounts)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime: 0, // Would calculate from actual response times
      topEndpoints,
    };
  }

  /**
   * Rotate API key (generate new, keep old temporarily)
   */
  async rotateApiKey(keyId: string): Promise<{ oldKey: ApiKey; newKey: ApiKey }> {
    const oldKey = await this.prisma.apiKey.findUnique({
      where: { id: keyId },
    });

    if (!oldKey) {
      throw new Error('API key not found');
    }

    // Generate new key
    const newKey = await this.generateApiKey(
      oldKey.userId,
      `${oldKey.name} (rotated)`,
      oldKey.permissions,
      oldKey.expiresAt
        ? Math.ceil((oldKey.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
        : undefined
    );

    // Keep old key active for 24 hours for transition
    setTimeout(() => {
      this.revokeApiKey(keyId).catch((error) => {
        this.logger.error('Failed to revoke old API key:', error);
      });
    }, 24 * 60 * 60 * 1000);

    return { oldKey, newKey };
  }

  private generateRandomKey(): string {
    const crypto = require('crypto');
    return `sk_${crypto.randomBytes(24).toString('hex')}`;
  }

  private generateRandomSecret(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }
}
