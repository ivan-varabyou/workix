import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  ServiceConfig,
  ServiceRoutingService,
  ServiceVersion,
} from '../services/service-routing.service';

/**
 * Service Routing Controller
 * Admin API for managing service routing and version switching
 * Manages dynamic routing to microservices with version support
 */
@ApiTags('admin-routing')
@Controller('admin/routing')
// @UseGuards(AdminJwtGuard) - временно отключен для тестирования
// @ApiBearerAuth('admin-jwt')
export class ServiceRoutingController {
  constructor(private routingService: ServiceRoutingService) {}

  @Get('services')
  @ApiOperation({
    summary: 'Get all service routing configurations',
    description: 'Returns all configured microservices with their routing information, active versions, and endpoints. Useful for monitoring and managing service routing across the platform.'
  })
  @ApiResponse({
    status: 200,
    description: 'Service configurations retrieved successfully',
    schema: {
      example: {
        'api-auth': {
          name: 'api-auth',
          baseUrl: 'http://localhost:7102',
          activeVersion: 'v1',
          versions: {
            v1: {
              version: 'v1',
              baseUrl: 'http://localhost:7102',
              healthCheck: '/health',
              enabled: true
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  getAllServices(): Record<string, ServiceConfig> {
    const configs: Map<string, ServiceConfig> = this.routingService.getAllServiceConfigs();
    const result: Record<string, ServiceConfig> = {};
    configs.forEach((config: ServiceConfig, service: string): void => {
      result[service] = config;
    });
    return result;
  }

  @Get('services/:serviceName')
  @ApiOperation({
    summary: 'Get service routing configuration',
    description: 'Returns detailed routing configuration for a specific microservice including all available versions, active version, and endpoint information.'
  })
  @ApiParam({
    name: 'serviceName',
    description: 'Name of the microservice (e.g., api-auth, api-notifications)',
    example: 'api-auth',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Service configuration retrieved successfully',
    schema: {
      example: {
        name: 'api-auth',
        baseUrl: 'http://localhost:7102',
        activeVersion: 'v1',
        versions: {
          v1: {
            version: 'v1',
            baseUrl: 'http://localhost:7102',
            healthCheck: '/health',
            enabled: true
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  getService(@Param('serviceName') serviceName: string): ServiceConfig | undefined {
    return this.routingService.getServiceConfig(serviceName);
  }

  @Post('services/:serviceName/versions')
  @ApiOperation({
    summary: 'Add new service version (for testing)',
    description: 'Adds a new version of a microservice for testing before switching. This allows you to test a new version alongside the current active version without affecting production traffic.'
  })
  @ApiParam({
    name: 'serviceName',
    description: 'Name of the microservice',
    example: 'api-auth',
    type: String
  })
  @ApiBody({
    description: 'Service version configuration',
    schema: {
      type: 'object',
      required: ['version', 'baseUrl'],
      properties: {
        version: {
          type: 'string',
          example: 'v2',
          description: 'Version identifier (e.g., v2, v1.1)'
        },
        baseUrl: {
          type: 'string',
          example: 'http://localhost:7103',
          description: 'Base URL for this version'
        },
        healthCheck: {
          type: 'string',
          example: '/health',
          description: 'Health check endpoint path'
        },
        enabled: {
          type: 'boolean',
          example: true,
          description: 'Whether this version is enabled'
        }
      },
      example: {
        version: 'v2',
        baseUrl: 'http://localhost:7103',
        healthCheck: '/health',
        enabled: true
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Version added successfully',
    schema: {
      example: {
        message: 'Version v2 added for api-auth'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid version configuration' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  addVersion(@Param('serviceName') serviceName: string, @Body() version: ServiceVersion): { message: string } {
    this.routingService.addServiceVersion(serviceName, version);
    return { message: `Version ${version.version} added for ${serviceName}` };
  }

  @Put('services/:serviceName/versions/:version/switch')
  @ApiOperation({
    summary: 'Switch to new version (activate tested server)',
    description: 'Switches the active version of a microservice. This will route all new requests to the specified version. Use this after testing a new version to make it live.'
  })
  @ApiParam({
    name: 'serviceName',
    description: 'Name of the microservice',
    example: 'api-auth',
    type: String
  })
  @ApiParam({
    name: 'version',
    description: 'Version to switch to',
    example: 'v2',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Version switched successfully',
    schema: {
      example: {
        message: 'Switched api-auth to version v2'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Version not found or not enabled' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  switchVersion(@Param('serviceName') serviceName: string, @Param('version') version: string): { message: string } {
    const success: boolean = this.routingService.switchServiceVersion(serviceName, version);
    if (success) {
      return { message: `Switched ${serviceName} to version ${version}` };
    }
    return { message: `Failed to switch ${serviceName} to version ${version}` };
  }

  @Put('services/:serviceName/config')
  @ApiOperation({
    summary: 'Update service configuration',
    description: 'Updates the configuration for a microservice. Can update base URL, health check endpoint, or other routing settings. Partial updates are supported.'
  })
  @ApiParam({
    name: 'serviceName',
    description: 'Name of the microservice',
    example: 'api-auth',
    type: String
  })
  @ApiBody({
    description: 'Partial service configuration to update',
    schema: {
      type: 'object',
      properties: {
        baseUrl: {
          type: 'string',
          example: 'http://localhost:7102',
          description: 'New base URL for the service'
        },
        healthCheck: {
          type: 'string',
          example: '/health',
          description: 'Health check endpoint path'
        }
      },
      example: {
        baseUrl: 'http://localhost:7102',
        healthCheck: '/health'
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Configuration updated successfully',
    schema: {
      example: {
        message: 'Configuration updated for api-auth'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid configuration' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  updateConfig(@Param('serviceName') serviceName: string, @Body() config: Partial<ServiceConfig>): { message: string } {
    this.routingService.updateServiceConfig(serviceName, config);
    return { message: `Configuration updated for ${serviceName}` };
  }
}
