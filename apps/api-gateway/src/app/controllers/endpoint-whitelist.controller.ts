import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  ApplicationConfig,
  EndpointWhitelistService,
} from '../services/endpoint-whitelist.service';
import { AdminJwtGuard } from '@workix/domain/admin';

/**
 * Endpoint Whitelist Controller
 * Admin API for managing application endpoint access
 */
@ApiTags('admin')
@Controller('admin/whitelist')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
export class EndpointWhitelistController {
  constructor(private whitelistService: EndpointWhitelistService) {}

  @Get('applications')
  @ApiOperation({ summary: 'Get all application configurations' })
  @ApiResponse({
    status: 200,
    description: 'Application configurations retrieved',
  })
  getAllApplications() {
    const apps = this.whitelistService.getAllApplications();
    const result: Record<string, ApplicationConfig> = {};
    apps.forEach((config, appId) => {
      result[appId] = config;
    });
    return result;
  }

  @Get('applications/:appId')
  @ApiOperation({ summary: 'Get application configuration' })
  @ApiResponse({
    status: 200,
    description: 'Application configuration retrieved',
  })
  getApplication(@Param('appId') appId: string) {
    return this.whitelistService.getApplication(appId);
  }

  @Post('applications')
  @ApiOperation({ summary: 'Create or update application configuration' })
  @ApiResponse({
    status: 201,
    description: 'Application configuration created/updated',
  })
  setApplication(@Body() config: ApplicationConfig) {
    this.whitelistService.setApplication(config);
    return { message: `Application ${config.appId} configured successfully` };
  }

  @Post('applications/:appId/check')
  @ApiOperation({ summary: 'Check if endpoint is allowed for application' })
  @ApiResponse({ status: 200, description: 'Access check result' })
  checkAccess(@Param('appId') appId: string, @Body() body: { path: string; version?: string }) {
    const allowed = this.whitelistService.isEndpointAllowed(appId, body.path, body.version);
    return {
      appId,
      path: body.path,
      version: body.version || 'v1',
      allowed,
    };
  }
}
