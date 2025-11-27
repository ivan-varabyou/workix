import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@workix/domain/auth';

import { IntegrationMonitoringService } from './integration-monitoring.service';

@ApiTags('integrations')
@Controller('integrations/monitoring')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class IntegrationMonitoringController {
  constructor(private monitoringService: IntegrationMonitoringService) {}

  @Get('health')
  @ApiOperation({ summary: 'Get overall health status of all providers' })
  @ApiResponse({
    status: 200,
    description: 'Health status retrieved successfully',
  })
  async getHealth() {
    return this.monitoringService.getOverallHealth();
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get alerts for integration events' })
  @ApiResponse({ status: 200, description: 'Alerts retrieved successfully' })
  async getAlerts(
    @Query('errorRate') errorRate?: string,
    @Query('latencyMs') latencyMs?: string,
    @Query('consecutiveFailures') consecutiveFailures?: string
  ) {
    const thresholds: {
      errorRate?: number;
      latencyMs?: number;
      consecutiveFailures?: number;
    } = {};
    if (errorRate !== undefined) {
      thresholds.errorRate = parseFloat(errorRate);
    }
    if (latencyMs !== undefined) {
      thresholds.latencyMs = parseInt(latencyMs, 10);
    }
    if (consecutiveFailures !== undefined) {
      thresholds.consecutiveFailures = parseInt(consecutiveFailures, 10);
    }
    return this.monitoringService.getAlerts(thresholds);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard data for integration metrics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
  })
  async getDashboard(@Query('period') period: '1h' | '24h' | '7d' | '30d' = '24h') {
    return this.monitoringService.getDashboardData(period);
  }
}
