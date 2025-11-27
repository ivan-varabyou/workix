import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

import { AccountSecurityService } from './account-security.service';
import { InjectionDetectorService } from './injection-detector.service';
import { IpBlockingService } from './ip-blocking.service';

/**
 * Threat Detection Service
 * Orchestrates threat detection and response
 */
@Injectable()
export class ThreatDetectionService {
  private readonly logger: Logger = new Logger(ThreatDetectionService.name);

  constructor(
    private readonly injectionDetector: InjectionDetectorService,
    private readonly ipBlocking: IpBlockingService,
    private readonly accountSecurity: AccountSecurityService,
    @Optional() @Inject('PrismaService') private prisma?: PrismaClient
  ) {}

  /**
   * Analyze request for threats
   */
  async analyzeRequest(request: {
    ip: string;
    path: string;
    method: string;
    body?: unknown;
    query?: Record<string, unknown>;
    headers?: Record<string, string>;
    userId?: string;
    email?: string;
  }): Promise<{
    threatDetected: boolean;
    threatType?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    action?: 'block_ip' | 'lock_account' | 'log_only';
  }> {
    // 1. Check if IP is already blocked
    const isIpBlocked: boolean = await this.ipBlocking.isIpBlocked(request.ip);
    if (isIpBlocked) {
      return {
        threatDetected: true,
        threatType: 'ip_blocked',
        severity: 'high',
        action: 'block_ip',
      };
    }

    // 2. Check if account is locked
    if (request.userId) {
      const isAccountLocked: boolean = await this.accountSecurity.isAccountLocked(request.userId);
      if (isAccountLocked) {
        return {
          threatDetected: true,
          threatType: 'account_locked',
          severity: 'medium',
          action: 'lock_account',
        };
      }
    }

    // 3. Detect injections in request data
    let requestDataForInjection: string | object | undefined = undefined;
    if (request.body) {
      requestDataForInjection = typeof request.body === 'string' || typeof request.body === 'object' ? request.body : JSON.stringify(request.body);
    } else if (request.query) {
      requestDataForInjection = typeof request.query === 'string' || typeof request.query === 'object' ? request.query : JSON.stringify(request.query);
    } else if (request.path) {
      requestDataForInjection = request.path;
    } else if (request.headers) {
      requestDataForInjection = JSON.stringify(request.headers);
    }
    const injectionResult: ReturnType<typeof this.injectionDetector.detectInjection> = this.injectionDetector.detectInjection(requestDataForInjection);

    if (injectionResult.detected) {
      // Block IP immediately for injection attempts
      const blockDuration: number = this.ipBlocking.getBlockDuration(injectionResult.type || 'default');
      await this.ipBlocking.blockIp(request.ip, injectionResult.type || 'injection', blockDuration);

      // Log security event
      const eventData: {
        userId?: string;
        email?: string;
        ipAddress: string;
        eventType: string;
        severity: 'critical';
        details: {
          injectionType: string | undefined;
          pattern: string | undefined;
          path: string;
          method: string;
          sanitizedBody: string;
        };
      } = {
        ipAddress: request.ip,
        eventType: 'injection_attempt',
        severity: 'critical',
        details: {
          injectionType: injectionResult.type,
          pattern: injectionResult.pattern,
          path: request.path,
          method: request.method,
          sanitizedBody: this.injectionDetector.sanitizeForLogging(
            request.body !== null && (typeof request.body === 'string' || typeof request.body === 'object') ? request.body : undefined
          ),
        },
      };
      if (request.userId !== undefined) eventData.userId = request.userId;
      if (request.email !== undefined) eventData.email = request.email;
      await this.logSecurityEvent(eventData);

      // Log suspicious IP activity
      const activityData: {
        ipAddress: string;
        userId?: string;
        email?: string;
        activityType: string;
        requestPath?: string;
        requestBody?: string;
      } = {
        ipAddress: request.ip,
        activityType: injectionResult.type || 'injection',
        requestPath: request.path,
      };
      if (request.userId !== undefined) activityData.userId = request.userId;
      if (request.email !== undefined) activityData.email = request.email;
      if (request.body) activityData.requestBody = this.injectionDetector.sanitizeForLogging(request.body);
      await this.logSuspiciousIpActivity(activityData);

      return {
        threatDetected: true,
        threatType: injectionResult.type || 'injection',
        severity: 'critical',
        action: 'block_ip',
      };
    }

    return {
      threatDetected: false,
    };
  }

  /**
   * Handle failed login attempt
   */
  async handleFailedLogin(userId: string | undefined, email: string, ipAddress: string): Promise<void> {
    // Track suspicious IP activity for distributed attack detection (will find userId if needed)
    const distributedAttackResult: Awaited<ReturnType<typeof this.accountSecurity.trackSuspiciousIpActivity>> = await this.accountSecurity.trackSuspiciousIpActivity(userId, email, ipAddress);

    // Record failed login attempt if userId is available
    if (userId) {
      await this.accountSecurity.recordFailedLogin(userId, email, ipAddress);
    }

    // Handle distributed attack
    if (distributedAttackResult.isDistributedAttack) {
      // Get userId if not provided (from distributed attack result)
      const finalUserId: string | undefined = userId || await this.accountSecurity.getUserIdByEmail(email);

      if (finalUserId) {
        // Lock account and block all participating IPs
        await this.accountSecurity.lockAccount(finalUserId, 24 * 60 * 60 * 1000); // 24 hours

        const uniqueIps: string[] = await this.accountSecurity.getUniqueIpsForAccount(finalUserId);
        for (const ip of uniqueIps) {
          await this.ipBlocking.blockIp(ip, 'distributed_attack', 24 * 60 * 60 * 1000);
        }

        // Log critical event
        await this.logSecurityEvent({
          userId: finalUserId,
          email,
          ipAddress,
          eventType: 'distributed_attack',
          severity: 'critical',
          details: {
            uniqueIpCount: distributedAttackResult.uniqueIpCount,
            blockedIps: uniqueIps,
          },
        });
      }
    }

    // Log failed login event
    const finalUserId: string | undefined = userId || await this.accountSecurity.getUserIdByEmail(email);
    const eventData: {
      userId?: string;
      email?: string;
      ipAddress: string;
      eventType: string;
      severity: 'low' | 'medium';
      details: Record<string, never>;
    } = {
      ipAddress,
      eventType: 'failed_login',
      severity: userId ? 'medium' : 'low',
      details: {},
    };
    if (finalUserId !== undefined) eventData.userId = finalUserId;
    if (email !== undefined) eventData.email = email;
    await this.logSecurityEvent(eventData);
  }

  /**
   * Log security event
   */
  private async logSecurityEvent(event: {
    userId?: string;
    email?: string;
    ipAddress: string;
    eventType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    details?: Record<string, unknown>;
  }): Promise<void> {
    if (!this.prisma) {
      this.logger.warn('PrismaService not available, skipping security event logging');
      return;
    }

    try {
      const createData: Prisma.AccountSecurityEventCreateInput = {
        ipAddress: event.ipAddress,
        eventType: event.eventType,
        severity: event.severity,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Prisma JSON type conversion
        details: (event.details || {}) as Prisma.InputJsonValue,
      };
      if (event.userId !== undefined && event.userId !== null) {
        createData.userId = event.userId;
      }
      if (event.email !== undefined && event.email !== null) {
        createData.email = event.email;
      }
      await this.prisma.accountSecurityEvent.create({
        data: createData,
      });
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to log security event: ${errorMessage}`);
    }
  }

  /**
   * Log suspicious IP activity
   */
  private async logSuspiciousIpActivity(activity: {
    ipAddress: string;
    userId?: string;
    email?: string;
    activityType: string;
    requestPath?: string;
    requestBody?: string;
    userAgent?: string;
  }): Promise<void> {
    if (!this.prisma) {
      this.logger.warn('PrismaService not available, skipping suspicious IP activity logging');
      return;
    }

    try {
      const createData: {
        ipAddress: string;
        activityType: string;
        userId?: string;
        email?: string;
        requestPath?: string;
        requestBody?: Prisma.InputJsonValue;
        userAgent?: string;
      } = {
        ipAddress: activity.ipAddress,
        activityType: activity.activityType,
      };
      if (activity.userId !== undefined && activity.userId !== null) {
        createData.userId = activity.userId;
      }
      if (activity.email !== undefined && activity.email !== null) {
        createData.email = activity.email;
      }
      if (activity.requestPath !== undefined && activity.requestPath !== null) {
        createData.requestPath = activity.requestPath;
      }
      if (activity.requestBody !== undefined && activity.requestBody !== null) {
        if (typeof activity.requestBody === 'string') {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Prisma JSON type conversion
          createData.requestBody = JSON.parse(activity.requestBody) as Prisma.InputJsonValue;
        } else {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Prisma JSON type conversion
          createData.requestBody = activity.requestBody as Prisma.InputJsonValue;
        }
      }
      if (activity.userAgent !== undefined && activity.userAgent !== null) {
        createData.userAgent = activity.userAgent;
      }
      await this.prisma.suspiciousIpActivity.create({
        data: createData,
      });
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to log suspicious IP activity: ${errorMessage}`);
    }
  }
}
