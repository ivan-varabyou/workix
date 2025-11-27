import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Counter, Gauge, Histogram } from 'prom-client';
import { AdminMetricsService } from './admin-metrics.service';

/**
 * Admin Metrics Module
 * Configures Prometheus metrics for admin activity
 */
@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
      defaultLabels: {
        app: 'api-gateway',
        service: 'admin',
      },
    }),
  ],
  providers: [
    {
      provide: 'PROM_METRIC_ADMIN_LOGIN_ATTEMPTS_TOTAL',
      useFactory: () => {
        return new Counter({
          name: 'admin_login_attempts_total',
          help: 'Total number of admin login attempts',
          labelNames: ['status', 'role'],
        });
      },
    },
    {
      provide: 'PROM_METRIC_ADMIN_SESSIONS_ACTIVE',
      useFactory: () => {
        return new Gauge({
          name: 'admin_sessions_active',
          help: 'Number of active admin sessions',
        });
      },
    },
    {
      provide: 'PROM_METRIC_ADMIN_ACCOUNTS_LOCKED',
      useFactory: () => {
        return new Gauge({
          name: 'admin_accounts_locked',
          help: 'Number of locked admin accounts',
        });
      },
    },
    {
      provide: 'PROM_METRIC_ADMIN_2FA_ENABLED',
      useFactory: () => {
        return new Gauge({
          name: 'admin_2fa_enabled',
          help: 'Number of admin accounts with 2FA enabled',
        });
      },
    },
    {
      provide: 'PROM_METRIC_ADMIN_PASSWORD_RESETS_TOTAL',
      useFactory: () => {
        return new Counter({
          name: 'admin_password_resets_total',
          help: 'Total number of admin password reset requests',
          labelNames: ['status'],
        });
      },
    },
    {
      provide: 'PROM_METRIC_ADMIN_SESSIONS_REVOKED_TOTAL',
      useFactory: () => {
        return new Counter({
          name: 'admin_sessions_revoked_total',
          help: 'Total number of admin sessions revoked',
          labelNames: ['reason'],
        });
      },
    },
    {
      provide: 'PROM_METRIC_ADMIN_SECURITY_EVENTS_TOTAL',
      useFactory: () => {
        return new Counter({
          name: 'admin_security_events_total',
          help: 'Total number of admin security events',
          labelNames: ['event'],
        });
      },
    },
    {
      provide: 'PROM_METRIC_ADMIN_OPERATION_DURATION_SECONDS',
      useFactory: () => {
        return new Histogram({
          name: 'admin_operation_duration_seconds',
          help: 'Duration of admin operations in seconds',
          labelNames: ['operation'],
          buckets: [0.1, 0.5, 1, 2, 5, 10],
        });
      },
    },
    AdminMetricsService,
  ],
  exports: [AdminMetricsService],
})
export class AdminMetricsModule {}
