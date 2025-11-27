import { Inject, Injectable, Logger, NotFoundException, Optional } from '@nestjs/common';
import * as crypto from 'crypto';

import { DeviceInfo } from '../interfaces/device.interface';
import { AuthPrismaService } from '../interfaces/prisma-auth.interface';

/**
 * Session Management Service
 * Tracks user sessions and device information
 */
@Injectable()
export class SessionService {
  private readonly logger: Logger = new Logger(SessionService.name);

  private prisma: AuthPrismaService;

  constructor(@Optional() @Inject('PrismaService') prisma: AuthPrismaService) {
    if (!prisma) {
      throw new Error('PrismaService must be provided. Ensure PrismaModule is imported and provides PrismaService globally.');
    }
    this.prisma = prisma;
  }

  private get prismaClient(): AuthPrismaService {
    return this.prisma;
  }

  /**
   * Create new session
   */
  async createSession(
    userId: string,
    deviceInfo: DeviceInfo
  ): Promise<{
    sessionId: string;
    createdAt: Date;
  }> {
    const sessionId: string = crypto.randomBytes(32).toString('hex');

    const sessionData: {
      userId: string;
      sessionId: string;
      deviceName?: string;
      deviceType?: string;
      userAgent?: string | null;
      ipAddress?: string | null;
      lastActivityAt?: Date;
    } = {
      userId,
      sessionId,
    };
    const deviceName: string = deviceInfo?.deviceName || 'Unknown Device';
    if (deviceName) {
      sessionData.deviceName = deviceName;
    }
    const deviceType: string = deviceInfo?.deviceType || 'desktop';
    if (deviceType) {
      sessionData.deviceType = deviceType;
    }
    if (deviceInfo?.userAgent !== undefined) {
      sessionData.userAgent = deviceInfo.userAgent;
    }
    if (deviceInfo?.ipAddress !== undefined) {
      sessionData.ipAddress = deviceInfo.ipAddress;
    }
    sessionData.lastActivityAt = new Date();
    const session: {
      sessionId: string;
      createdAt: Date;
    } = await this.prismaClient.session.create({
      data: sessionData,
    });

    this.logger.log(`Session created for user: ${userId}, session: ${sessionId}`);

    return {
      sessionId: session.sessionId,
      createdAt: session.createdAt,
    };
  }

  /**
   * Get all user sessions
   */
  async getUserSessions(userId: string): Promise<Array<{
    id: string;
    userId: string;
    sessionId: string;
    deviceName: string | null;
    deviceType: string | null;
    userAgent: string | null;
    ipAddress: string | null;
    lastActivityAt: Date;
    createdAt: Date;
    revokedAt: Date | null;
  }>> {
    return await this.prismaClient.session.findMany({
      where: { userId, revokedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get session details
   */
  async getSession(sessionId: string): Promise<{
    id: string;
    userId: string;
    sessionId: string;
    deviceName: string | null;
    deviceType: string | null;
    userAgent: string | null;
    ipAddress: string | null;
    lastActivityAt: Date;
    createdAt: Date;
    revokedAt: Date | null;
  }> {
    const session: {
      id: string;
      userId: string;
      sessionId: string;
      deviceName: string | null;
      deviceType: string | null;
      userAgent: string | null;
      ipAddress: string | null;
      lastActivityAt: Date;
      createdAt: Date;
      revokedAt: Date | null;
    } | null = await this.prismaClient.session.findFirst({
      where: { sessionId, revokedAt: null },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.prismaClient.session.update({
      where: { sessionId },
      data: { lastActivityAt: new Date() },
    });
  }

  /**
   * Revoke session
   */
  async revokeSession(sessionId: string): Promise<void> {
    await this.prismaClient.session.update({
      where: { sessionId },
      data: { revokedAt: new Date() },
    });

    this.logger.log(`Session revoked: ${sessionId}`);
  }

  /**
   * Revoke all sessions for user
   */
  async revokeAllSessions(userId: string): Promise<number> {
    const result: { count: number } = await this.prismaClient.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    this.logger.log(`All sessions revoked for user: ${userId}, count: ${result.count}`);

    return result.count;
  }

  /**
   * Revoke other sessions (keep current)
   */
  async revokeOtherSessions(userId: string, currentSessionId: string): Promise<number> {
    const result: { count: number } = await this.prismaClient.session.updateMany({
      where: {
        userId,
        sessionId: { not: currentSessionId },
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    this.logger.log(
      `Other sessions revoked for user: ${userId}, kept: ${currentSessionId}, count: ${result.count}`
    );

    return result.count;
  }

  /**
   * Track device
   */
  async trackDevice(
    userId: string,
    deviceInfo: DeviceInfo
  ): Promise<{
    deviceId: string;
    isNewDevice: boolean;
  }> {
    const deviceFingerprint: string = this.generateDeviceFingerprint(deviceInfo);

    const existingDevice: {
      id: string;
    } | null = await this.prismaClient.device.findFirst({
      where: { userId, fingerprint: deviceFingerprint },
    });

    if (existingDevice) {
      // Update last seen
      await this.prismaClient.device.update({
        where: { id: existingDevice.id },
        data: { lastSeenAt: new Date() },
      });

      return {
        deviceId: existingDevice.id,
        isNewDevice: false,
      };
    }

    // Create new device record
    const deviceData: {
      userId: string;
      fingerprint: string;
      deviceName?: string | null;
      deviceType?: string | null;
      osName?: string | null;
      osVersion?: string | null;
      browserName?: string | null;
      browserVersion?: string | null;
      userAgent?: string | null;
      lastSeenAt?: Date;
    } = {
      userId,
      fingerprint: deviceFingerprint,
    };
    const deviceName: string = deviceInfo?.deviceName || 'Unknown Device';
    if (deviceName) {
      deviceData.deviceName = deviceName;
    }
    const deviceType: string = deviceInfo?.deviceType || 'desktop';
    if (deviceType) {
      deviceData.deviceType = deviceType;
    }
    if (deviceInfo?.osName !== undefined) {
      deviceData.osName = deviceInfo.osName;
    }
    if (deviceInfo?.osVersion !== undefined) {
      deviceData.osVersion = deviceInfo.osVersion;
    }
    if (deviceInfo?.browserName !== undefined) {
      deviceData.browserName = deviceInfo.browserName;
    }
    if (deviceInfo?.browserVersion !== undefined) {
      deviceData.browserVersion = deviceInfo.browserVersion;
    }
    if (deviceInfo?.userAgent !== undefined) {
      deviceData.userAgent = deviceInfo.userAgent;
    }
    deviceData.lastSeenAt = new Date();
    const device: {
      id: string;
    } = await this.prismaClient.device.create({
      data: deviceData,
    });

    this.logger.log(`New device tracked for user: ${userId}, device: ${device.id}`);

    return {
      deviceId: device.id,
      isNewDevice: true,
    };
  }

  /**
   * Get user devices
   */
  async getUserDevices(userId: string): Promise<
    Array<{
      id: string;
      deviceName: string;
      deviceType: string;
      lastSeenAt: Date;
      createdAt: Date;
      fingerprint: string;
    }>
  > {
    const devices: Array<{
      id: string;
      deviceName: string | null;
      deviceType: string | null;
      lastSeenAt: Date | null;
      createdAt: Date;
      fingerprint: string;
    }> = await this.prismaClient.device.findMany({
      where: { userId },
      orderBy: { lastSeenAt: 'desc' },
    });
    return devices.map((d: {
      id: string;
      deviceName: string | null;
      deviceType: string | null;
      lastSeenAt: Date | null;
      createdAt: Date;
      fingerprint: string;
    }): {
      id: string;
      deviceName: string;
      deviceType: string;
      lastSeenAt: Date;
      createdAt: Date;
      fingerprint: string;
    } => ({
      id: d.id,
      deviceName: d.deviceName || 'Unknown Device',
      deviceType: d.deviceType || 'unknown',
      lastSeenAt: d.lastSeenAt || d.createdAt,
      createdAt: d.createdAt,
      fingerprint: d.fingerprint,
    }));
  }

  /**
   * Revoke device
   */
  async revokeDevice(userId: string, deviceId: string): Promise<void> {
    const device: {
      id: string;
    } | null = await this.prismaClient.device.findFirst({
      where: { id: deviceId, userId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    await this.prismaClient.device.delete({
      where: { id: deviceId },
    });

    this.logger.log(`Device revoked for user: ${userId}, device: ${deviceId}`);
  }

  /**
   * Clean up old sessions (older than 30 days)
   */
  async cleanupOldSessions(): Promise<number> {
    const thirtyDaysAgo: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result: { count: number } = await this.prismaClient.session.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
      },
    });

    this.logger.log(`Cleaned up ${result.count} old sessions`);

    return result.count;
  }

  /**
   * Generate device fingerprint
   */
  private generateDeviceFingerprint(deviceInfo: DeviceInfo): string {
    const data: string = [deviceInfo?.userAgent, deviceInfo?.osName, deviceInfo?.browserName].join('|');

    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Detect suspicious activity
   */
  async detectSuspiciousActivity(
    userId: string,
    newSessionInfo: DeviceInfo
  ): Promise<{
    suspicious: boolean;
    reason?: string;
  }> {
    // Get last 5 sessions
    const recentSessions: Array<{
      ipAddress: string | null;
      lastActivityAt: Date;
    }> = await this.prismaClient.session.findMany({
      where: { userId, revokedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Check if new session from unknown device
    const devices: Array<{
      fingerprint: string;
    }> = await this.getUserDevices(userId);
    const knownDevices: string[] = devices.map((d: { fingerprint: string }): string => d.fingerprint);
    const newFingerprint: string = this.generateDeviceFingerprint(newSessionInfo);

    if (!knownDevices.includes(newFingerprint) && knownDevices.length > 0) {
      return {
        suspicious: true,
        reason: 'Login from new/unknown device',
      };
    }

    // Check for impossible travel (IP change in short time)
    if (recentSessions.length > 0) {
      const lastSession: {
        ipAddress: string | null;
        lastActivityAt: Date;
      } | undefined = recentSessions[0];
      if (lastSession && lastSession.ipAddress !== newSessionInfo?.ipAddress) {
        const lastActivityAt: Date = lastSession.lastActivityAt;
        if (lastActivityAt) {
          const timeDiff: number = Date.now() - lastActivityAt.getTime();
          if (timeDiff < 60000) {
            // Less than 1 minute
            return {
              suspicious: true,
              reason: 'Impossible travel (IP change in < 1 minute)',
            };
          }
        }
      }
    }

    return { suspicious: false };
  }
}
