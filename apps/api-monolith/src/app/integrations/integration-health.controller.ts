import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@workix/domain/auth';
import { PrismaService } from '@workix/infrastructure/prisma';
import { IntegrationRouter } from '@workix/integrations/core';

import {
  extractConfig,
  extractCredentials,
  OverallHealthResponse,
  ProviderHealthCheckResult,
} from './interfaces/integration-health.interface';

@ApiTags('integrations')
@Controller('integrations/health')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class IntegrationHealthController {
  constructor(private prisma: PrismaService, private router: IntegrationRouter) {}

  @Get()
  @ApiOperation({ summary: 'Get overall health status of all integration providers' })
  @ApiResponse({ status: 200, description: 'Overall health status retrieved successfully' })
  async getOverallHealth(): Promise<OverallHealthResponse> {
    const providers = await this.prisma.integrationProvider.findMany();
    const healthChecks: ProviderHealthCheckResult[] = await Promise.all(
      providers.map((p: { id: string }) => this.checkProviderHealth(p.id))
    );

    const healthy = healthChecks.filter((h: ProviderHealthCheckResult) => h.status === 'healthy').length;
    const degraded = healthChecks.filter((h: ProviderHealthCheckResult) => h.status === 'degraded').length;
    const unhealthy = healthChecks.filter((h: ProviderHealthCheckResult) => h.status === 'unhealthy').length;

    return {
      overall: unhealthy > 0 ? 'unhealthy' : degraded > 0 ? 'degraded' : 'healthy',
      summary: {
        total: providers.length,
        healthy,
        degraded,
        unhealthy,
      },
      providers: healthChecks,
    };
  }

  @Get(':providerId')
  @ApiOperation({ summary: 'Get health status for a specific integration provider' })
  @ApiParam({ name: 'providerId', type: 'string', description: 'Integration provider ID' })
  @ApiResponse({ status: 200, description: 'Provider health status retrieved successfully' })
  async getProviderHealth(@Param('providerId') providerId: string): Promise<ProviderHealthCheckResult> {
    return this.checkProviderHealth(providerId);
  }

  private async checkProviderHealth(providerId: string): Promise<ProviderHealthCheckResult> {
    const provider = await this.prisma.integrationProvider.findUnique({
      where: { id: providerId },
      include: {
        events: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!provider) {
      return {
        providerId,
        status: 'unhealthy',
        reason: 'Provider not found',
      };
    }

    // Check credentials from JSON field (безопасное извлечение без as)
    const credentials = extractCredentials(provider.credentials);
    const hasValidCredentials = Object.keys(credentials).length > 0;

    // Check recent events for errors
    const recentErrors = provider.events.filter(
      (e: { status: string; createdAt: Date }) => e.status === 'FAILED' && e.createdAt > new Date(Date.now() - 3600000) // Last hour
    ).length;

    // Check provider status from config (безопасное извлечение без as)
    const config = extractConfig(provider.config);
    const dbStatus = config.healthStatus || 'UNKNOWN';

    // Determine health status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    const issues: string[] = [];

    if (!hasValidCredentials) {
      status = 'unhealthy';
      issues.push('No valid credentials');
    }

    if (recentErrors > 5) {
      status = status === 'unhealthy' ? 'unhealthy' : 'degraded';
      issues.push(`${recentErrors} errors in the last hour`);
    }

    if (dbStatus === 'OUTAGE') {
      status = 'unhealthy';
      issues.push('Provider marked as OUTAGE');
    } else if (dbStatus === 'DEGRADED') {
      status = status === 'unhealthy' ? 'unhealthy' : 'degraded';
      issues.push('Provider marked as DEGRADED');
    }

    // Check if provider is registered in router
    const registered = this.router.get(providerId) !== undefined;

    return {
      providerId,
      name: provider.name,
      status,
      registered,
      hasValidCredentials,
      recentErrors,
      dbStatus,
      issues: issues.length > 0 ? issues : [],
      lastChecked: new Date(),
    };
  }
}
