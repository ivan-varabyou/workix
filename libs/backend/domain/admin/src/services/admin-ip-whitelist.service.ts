import { ForbiddenException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

import type { AdminIpWhitelistEntry, AdminIpWhitelistResponse } from '../interfaces/admin.types';

/**
 * Gateway Prisma Service Interface
 * Defines the interface for Prisma service used by admin services
 * Uses 'any' for Prisma types to avoid complex type definitions
 * In production, you might want to use Prisma generated types directly
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma types are complex, using any for simplicity
type PrismaResult = any;

export interface GatewayPrismaServiceInterface {
  gatewayAdmin: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma types
    findUnique: (args: { where: { id: string } | { email: string }; select?: Record<string, unknown> }) => Promise<PrismaResult>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma types
    findFirst: (args: { where: Record<string, unknown> }) => Promise<PrismaResult>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma types
    create: (args: { data: Record<string, unknown> }) => Promise<PrismaResult>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma types
    update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<PrismaResult>;
    updateMany: (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => Promise<{ count: number }>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma types
    delete: (args: { where: { id: string } }) => Promise<PrismaResult>;
    deleteMany: (args: { where: Record<string, unknown> }) => Promise<{ count: number }>;
  };
  gatewayAdminIpWhitelist: {
    findFirst: (args: { where: Record<string, unknown> }) => Promise<{ id: string; ipAddress: string } | null>;
    findMany: (args: { where: Record<string, unknown>; select?: Record<string, unknown>; orderBy?: Record<string, string> }) => Promise<AdminIpWhitelistEntry[]>;
    create: (args: { data: Record<string, unknown> }) => Promise<{ id: string; ipAddress: string }>;
    delete: (args: { where: { id: string } }) => Promise<unknown>;
  };
  gatewayAdminSession: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma types
    findMany: (args: { where: Record<string, unknown>; select?: Record<string, unknown>; orderBy?: Record<string, string> }) => Promise<PrismaResult[]>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma types
    findFirst: (args: { where: Record<string, unknown> }) => Promise<PrismaResult>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma types
    create: (args: { data: Record<string, unknown> }) => Promise<PrismaResult>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma types
    delete: (args: { where: { id: string } }) => Promise<PrismaResult>;
    deleteMany: (args: { where: Record<string, unknown> }) => Promise<{ count: number }>;
  };
  gatewayAuditLog: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma types
    create: (args: { data: Record<string, unknown> }) => Promise<PrismaResult>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma types
    findMany: (args: { where: Record<string, unknown>; select?: Record<string, unknown>; orderBy?: Record<string, string>; skip?: number; take?: number }) => Promise<PrismaResult[]>;
    count: (args: { where: Record<string, unknown> }) => Promise<number>;
  };
  gatewayPasswordReset: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma types
    findUnique: (args: { where: { token: string }; include?: { admin: boolean } }) => Promise<PrismaResult>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma types
    findFirst: (args: { where: Record<string, unknown> }) => Promise<PrismaResult>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma types
    create: (args: { data: Record<string, unknown> }) => Promise<PrismaResult>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma types
    update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<PrismaResult>;
    updateMany: (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => Promise<{ count: number }>;
  };
}

/**
 * Admin IP Whitelist Service
 * Manages IP whitelist for super_admin accounts
 */
@Injectable()
export class AdminIpWhitelistService {
  private readonly logger = new Logger(AdminIpWhitelistService.name);

  constructor(
    @Inject('PrismaService') private prisma: GatewayPrismaServiceInterface
  ) {}

  /**
   * Check if IP is allowed for admin
   */
  async isIpAllowed(adminId: string, ipAddress: string): Promise<boolean> {
    const admin = await this.prisma.gatewayAdmin.findUnique({
      where: { id: adminId },
      select: { role: true, ipWhitelistEnabled: true },
    });

    if (!admin) {
      return false;
    }

    // IP whitelist only applies to super_admin
    if (admin.role !== 'super_admin') {
      return true; // Regular admins don't need IP whitelist
    }

    // If IP whitelist is disabled, allow all IPs
    if (!admin.ipWhitelistEnabled) {
      return true;
    }

    // Check if IP is in whitelist
    // Using findFirst with composite unique constraint
    const whitelistEntry = await this.prisma.gatewayAdminIpWhitelist.findFirst({
      where: {
        adminId,
        ipAddress,
      },
    });

    return !!whitelistEntry;
  }

  /**
   * Get all whitelisted IPs for admin
   */
  async getWhitelistedIps(adminId: string): Promise<AdminIpWhitelistEntry[]> {
    return this.prisma.gatewayAdminIpWhitelist.findMany({
      where: { adminId },
      select: {
        id: true,
        ipAddress: true,
        description: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Add IP to whitelist
   */
  async addIp(adminId: string, ipAddress: string, description?: string): Promise<AdminIpWhitelistResponse> {
    // Validate IP address format
    if (!this.isValidIpAddress(ipAddress)) {
      throw new ForbiddenException('Invalid IP address format');
    }

    try {
      const createData: {
        adminId: string;
        ipAddress: string;
        description?: string;
      } = {
        adminId,
        ipAddress,
      };
      if (description !== undefined && description !== null) {
        createData.description = description;
      }
      const entry = await this.prisma.gatewayAdminIpWhitelist.create({
        data: createData,
      });

      this.logger.log(`IP ${ipAddress} added to whitelist for admin ${adminId}`);
      return { id: entry.id, ipAddress: entry.ipAddress };
    } catch (error: unknown) {
      // Type guard for Prisma error
      if (this.isPrismaError(error) && error.code === 'P2002') {
        throw new ForbiddenException('IP address already in whitelist');
      }
      throw error;
    }
  }

  /**
   * Type guard for Prisma errors
   */
  private isPrismaError(error: unknown): error is { code: string; message: string } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as { code: unknown }).code === 'string'
    );
  }

  /**
   * Remove IP from whitelist
   */
  async removeIp(adminId: string, ipId: string): Promise<void> {
    const entry = await this.prisma.gatewayAdminIpWhitelist.findFirst({
      where: { id: ipId, adminId },
    });

    if (!entry) {
      throw new NotFoundException('IP address not found in whitelist');
    }

    await this.prisma.gatewayAdminIpWhitelist.delete({
      where: { id: ipId },
    });

    this.logger.log(`IP ${entry.ipAddress} removed from whitelist for admin ${adminId}`);
  }

  /**
   * Enable/disable IP whitelist for admin
   */
  async setIpWhitelistEnabled(adminId: string, enabled: boolean): Promise<void> {
    await this.prisma.gatewayAdmin.update({
      where: { id: adminId },
      data: { ipWhitelistEnabled: enabled },
    });

    this.logger.log(`IP whitelist ${enabled ? 'enabled' : 'disabled'} for admin ${adminId}`);
  }

  /**
   * Validate IP address format (IPv4 or IPv6)
   */
  private isValidIpAddress(ip: string): boolean {
    // IPv4 regex
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    // IPv6 regex (simplified)
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

    if (ipv4Regex.test(ip)) {
      // Validate IPv4 octets
      const parts = ip.split('.');
      return parts.every((part) => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
      });
    }

    return ipv6Regex.test(ip) || ip === '::1' || ip === '::';
  }
}
