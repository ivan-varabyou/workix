import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  ServiceConfig,
  ServiceRoutingService,
  ServiceVersion,
} from '../services/service-routing.service';
import { AdminJwtGuard } from '@workix/domain/admin';

/**
 * Service Routing Controller
 * Admin API for managing service routing and version switching
 * Allows switching between monolith and microservices without restart
 */
@ApiTags('admin')
@Controller('admin/routing')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
export class ServiceRoutingController {
  constructor(private routingService: ServiceRoutingService) {}

  @Get('services')
  @ApiOperation({ summary: 'Get all service routing configurations' })
  @ApiResponse({ status: 200, description: 'Service configurations retrieved' })
  getAllServices() {
    const configs = this.routingService.getAllServiceConfigs();
    const result: Record<string, ServiceConfig> = {};
    configs.forEach((config, service) => {
      result[service] = config;
    });
    return result;
  }

  @Get('services/:serviceName')
  @ApiOperation({ summary: 'Get service routing configuration' })
  @ApiResponse({ status: 200, description: 'Service configuration retrieved' })
  getService(@Param('serviceName') serviceName: string) {
    return this.routingService.getServiceConfig(serviceName);
  }

  @Post('services/:serviceName/versions')
  @ApiOperation({ summary: 'Add new service version (for testing)' })
  @ApiResponse({ status: 201, description: 'Version added successfully' })
  addVersion(@Param('serviceName') serviceName: string, @Body() version: ServiceVersion) {
    this.routingService.addServiceVersion(serviceName, version);
    return { message: `Version ${version.version} added for ${serviceName}` };
  }

  @Put('services/:serviceName/versions/:version/switch')
  @ApiOperation({ summary: 'Switch to new version (activate tested server)' })
  @ApiResponse({ status: 200, description: 'Version switched successfully' })
  switchVersion(@Param('serviceName') serviceName: string, @Param('version') version: string) {
    const success = this.routingService.switchServiceVersion(serviceName, version);
    if (success) {
      return { message: `Switched ${serviceName} to version ${version}` };
    }
    return { message: `Failed to switch ${serviceName} to version ${version}` };
  }

  @Put('services/:serviceName/config')
  @ApiOperation({ summary: 'Update service configuration' })
  @ApiResponse({
    status: 200,
    description: 'Configuration updated successfully',
  })
  updateConfig(@Param('serviceName') serviceName: string, @Body() config: Partial<ServiceConfig>) {
    this.routingService.updateServiceConfig(serviceName, config);
    return { message: `Configuration updated for ${serviceName}` };
  }
}
