import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  constructor() {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHealth() {
    return {
      status: 'ok',
      service: 'workix-monolith',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('info')
  @ApiOperation({ summary: 'Get API information' })
  @ApiResponse({ status: 200, description: 'API information' })
  getInfo() {
    return {
      name: 'Workix AI-Powered Virtual Workers Platform',
      description: 'Complete monolith application with all services integrated',
      version: '2.0.0',
      services: [
        // Core Services
        // Note: auth is a separate microservice (api-auth on port 7200)
        { name: 'users', status: 'active', port: 7000 },
        { name: 'pipelines', status: 'active', port: 7000 },
        { name: 'rbac', status: 'active', port: 7000 },
        // Advanced Features
        { name: 'webhooks', status: 'active', port: 7000 },
        { name: 'api-keys', status: 'active', port: 7000 },
        { name: 'workflows', status: 'active', port: 7000 },
        { name: 'batch-processing', status: 'active', port: 7000 },
        { name: 'file-storage', status: 'active', port: 7000 },
        { name: 'data-validation', status: 'active', port: 7000 },
        { name: 'custom-scripts', status: 'active', port: 7000 },
        { name: 'ml-integration', status: 'active', port: 7000 },
        // AI & Generation
        { name: 'ai-core', status: 'active', port: 7000 },
        { name: 'generation', status: 'active', port: 7000 },
        // Universal Integrations
        { name: 'integration-core', status: 'active', port: 7000 },
        { name: 'analytics', status: 'active', port: 7000 },
        { name: 'integrations', status: 'active', port: 7000 },
        // Virtual Workers & A/B Testing
        { name: 'workers', status: 'active', port: 7000 },
        { name: 'ab-testing', status: 'active', port: 7000 },
        // Third-party Integrations
        { name: 'slack', status: 'active', port: 7000 },
        { name: 'github', status: 'active', port: 7000 },
        { name: 'gitlab', status: 'active', port: 7000 },
        { name: 'jira', status: 'active', port: 7000 },
        { name: 'aws', status: 'active', port: 7000 },
        { name: 'gcp', status: 'active', port: 7000 },
        { name: 'azure', status: 'active', port: 7000 },
        { name: 'salesforce', status: 'active', port: 7000 },
      ],
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get system statistics' })
  @ApiResponse({ status: 200, description: 'System statistics' })
  getStats() {
    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        usage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
