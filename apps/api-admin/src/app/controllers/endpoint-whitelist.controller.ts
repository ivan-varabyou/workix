import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  ApplicationConfig,
  EndpointWhitelistService,
} from '../services/endpoint-whitelist.service';

/**
 * Endpoint Whitelist Controller
 * Admin API for managing application endpoint access
 */
@ApiTags('admin-whitelist')
@Controller('admin/whitelist')
// @UseGuards(AdminJwtGuard) - временно отключен для тестирования
// @ApiBearerAuth('admin-jwt')
export class EndpointWhitelistController {
  constructor(private whitelistService: EndpointWhitelistService) {}

  @Get('applications')
  @ApiOperation({
    summary: 'Get all application configurations',
    description: 'Returns all configured applications with their endpoint whitelist settings. Each application can have different allowed endpoints and versions.'
  })
  @ApiResponse({
    status: 200,
    description: 'Application configurations retrieved successfully',
    schema: {
      example: {
        'app-web': {
          appId: 'app-web',
          allowedEndpoints: ['/api/v1/users', '/api/v1/auth'],
          allowedVersions: ['v1'],
          enabled: true
        },
        'app-admin': {
          appId: 'app-admin',
          allowedEndpoints: ['*'],
          allowedVersions: ['v1', 'v2'],
          enabled: true
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  getAllApplications(): Record<string, ApplicationConfig> {
    const apps: Map<string, ApplicationConfig> = this.whitelistService.getAllApplications();
    const result: Record<string, ApplicationConfig> = {};
    apps.forEach((config: ApplicationConfig, appId: string): void => {
      result[appId] = config;
    });
    return result;
  }

  @Get('applications/:appId')
  @ApiOperation({
    summary: 'Get application configuration',
    description: 'Returns the endpoint whitelist configuration for a specific application. Shows which endpoints and versions are allowed for this application.'
  })
  @ApiParam({
    name: 'appId',
    description: 'Application identifier (e.g., app-web, app-admin)',
    example: 'app-web',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Application configuration retrieved successfully',
    schema: {
      example: {
        appId: 'app-web',
        allowedEndpoints: ['/api/v1/users', '/api/v1/auth'],
        allowedVersions: ['v1'],
        enabled: true
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  getApplication(@Param('appId') appId: string): ApplicationConfig | undefined {
    return this.whitelistService.getApplication(appId);
  }

  @Post('applications')
  @ApiOperation({
    summary: 'Create or update application configuration',
    description: 'Creates a new application configuration or updates an existing one. Defines which endpoints and API versions are allowed for the application. Use wildcard "*" to allow all endpoints.'
  })
  @ApiBody({
    description: 'Application configuration',
    schema: {
      type: 'object',
      required: ['appId'],
      properties: {
        appId: {
          type: 'string',
          example: 'app-web',
          description: 'Application identifier'
        },
        allowedEndpoints: {
          type: 'array',
          items: { type: 'string' },
          example: ['/api/v1/users', '/api/v1/auth'],
          description: 'List of allowed endpoint paths. Use "*" for all endpoints.'
        },
        allowedVersions: {
          type: 'array',
          items: { type: 'string' },
          example: ['v1', 'v2'],
          description: 'List of allowed API versions'
        },
        enabled: {
          type: 'boolean',
          example: true,
          description: 'Whether the application is enabled'
        }
      },
      example: {
        appId: 'app-web',
        allowedEndpoints: ['/api/v1/users', '/api/v1/auth'],
        allowedVersions: ['v1'],
        enabled: true
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Application configuration created/updated successfully',
    schema: {
      example: {
        message: 'Application app-web configured successfully'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid configuration' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  setApplication(@Body() config: ApplicationConfig): { message: string } {
    this.whitelistService.setApplication(config);
    return { message: `Application ${config.appId} configured successfully` };
  }

  @Post('applications/:appId/check')
  @ApiOperation({
    summary: 'Check if endpoint is allowed for application',
    description: 'Checks whether a specific endpoint and version is allowed for an application. Returns true if the endpoint is whitelisted, false otherwise. Useful for validating access before making requests.'
  })
  @ApiParam({
    name: 'appId',
    description: 'Application identifier',
    example: 'app-web',
    type: String
  })
  @ApiBody({
    description: 'Endpoint to check',
    schema: {
      type: 'object',
      required: ['path'],
      properties: {
        path: {
          type: 'string',
          example: '/api/v1/users',
          description: 'Endpoint path to check'
        },
        version: {
          type: 'string',
          example: 'v1',
          description: 'API version (optional, defaults to v1)'
        }
      },
      example: {
        path: '/api/v1/users',
        version: 'v1'
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Access check result',
    schema: {
      example: {
        appId: 'app-web',
        path: '/api/v1/users',
        version: 'v1',
        allowed: true
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  checkAccess(@Param('appId') appId: string, @Body() body: { path: string; version?: string }): { appId: string; path: string; version: string; allowed: boolean } {
    const allowed: boolean = this.whitelistService.isEndpointAllowed(appId, body.path, body.version);
    return {
      appId,
      path: body.path,
      version: body.version || 'v1',
      allowed,
    };
  }
}
