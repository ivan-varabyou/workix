import { Injectable, Inject, Optional } from '@nestjs/common';
import { Counter, Gauge, Histogram } from 'prom-client';

/**
 * Admin Metrics Service
 * Provides Prometheus metrics for admin activity
 */
@Injectable()
export class AdminMetricsService {
  constructor(
    @Optional() @Inject('PROM_METRIC_ADMIN_LOGIN_ATTEMPTS_TOTAL')
    private readonly loginAttemptsCounter?: Counter<string>,
    @Optional() @Inject('PROM_METRIC_ADMIN_SESSIONS_ACTIVE')
    private readonly activeSessionsGauge?: Gauge<string>,
    @Optional() @Inject('PROM_METRIC_ADMIN_ACCOUNTS_LOCKED')
    private readonly lockedAccountsGauge?: Gauge<string>,
    @Optional() @Inject('PROM_METRIC_ADMIN_2FA_ENABLED')
    private readonly twoFactorEnabledGauge?: Gauge<string>,
    @Optional() @Inject('PROM_METRIC_ADMIN_PASSWORD_RESETS_TOTAL')
    private readonly passwordResetsCounter?: Counter<string>,
    @Optional() @Inject('PROM_METRIC_ADMIN_SESSIONS_REVOKED_TOTAL')
    private readonly sessionsRevokedCounter?: Counter<string>,
    @Optional() @Inject('PROM_METRIC_ADMIN_SECURITY_EVENTS_TOTAL')
    private readonly securityEventsCounter?: Counter<string>,
    @Optional() @Inject('PROM_METRIC_ADMIN_OPERATION_DURATION_SECONDS')
    private readonly operationDurationHistogram?: Histogram<string>,
  ) {}

  /**
   * Increment login attempts counter
   */
  recordLoginAttempt(status: 'success' | 'failure', role?: string): void {
    this.loginAttemptsCounter?.inc({
      status,
      ...(role && { role }),
    });
  }

  /**
   * Set active sessions gauge
   */
  setActiveSessions(count: number): void {
    this.activeSessionsGauge?.set(count);
  }

  /**
   * Set locked accounts gauge
   */
  setLockedAccounts(count: number): void {
    this.lockedAccountsGauge?.set(count);
  }

  /**
   * Set 2FA enabled gauge
   */
  set2FAEnabled(count: number): void {
    this.twoFactorEnabledGauge?.set(count);
  }

  /**
   * Increment password resets counter
   */
  recordPasswordReset(status: 'requested' | 'completed' | 'failed'): void {
    this.passwordResetsCounter?.inc({ status });
  }

  /**
   * Increment sessions revoked counter
   */
  recordSessionRevoked(reason: 'logout' | 'password_change' | 'manual'): void {
    this.sessionsRevokedCounter?.inc({ reason });
  }

  /**
   * Increment security events counter
   */
  recordSecurityEvent(
    event: 'ip_blocked' | 'account_locked' | 'suspicious_activity' | '2fa_failed',
  ): void {
    this.securityEventsCounter?.inc({ event });
  }

  /**
   * Record operation duration
   */
  recordOperationDuration(
    operation: 'login' | 'verify' | 'password_reset' | 'session_management',
    durationSeconds: number,
  ): void {
    this.operationDurationHistogram?.observe(
      {
        operation,
      },
      durationSeconds,
    );
  }
}
