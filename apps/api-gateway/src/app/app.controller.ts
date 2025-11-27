import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Put, Req } from '@nestjs/common';
import { ApiExcludeController, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';

import { ProxyService } from './services/proxy.service';

/**
 * API Gateway - Proxy Controller (Fallback)
 *
 * This controller handles any requests that don't match specific controllers.
 * Routes ALL requests to appropriate microservices:
 * - /auth/* → Auth Service (7102)
 * - /users/* → Auth Service (7102)
 * - /pipelines/* → Monolith Service (7101)
 * - /executions/* → Monolith Service (7101)
 * - /rbac/* → Monolith Service (7101)
 *
 * Note: Specific controllers (AuthController, UsersController, etc.) provide
 * full Swagger documentation. This controller is kept for backward compatibility
 * and should be hidden from Swagger documentation.
 */
@ApiExcludeController() // Hide from Swagger - use specific controllers instead
@Controller() // Empty controller - uses global prefix 'api/v1' from main.ts
export class AppController {
  private logger = new Logger(AppController.name);

  constructor(private proxyService: ProxyService) {}

  /**
   * Proxy GET - forward to microservices
   * Hidden from Swagger - use specific controllers instead
   */
  @Get('*path')
  @ApiOperation({
    summary: 'Proxy GET request',
    description: 'Forwards GET requests to appropriate microservices. Path should be in format: auth/health, users/me, etc.',
  })
  @ApiParam({
    name: 'path',
    description: 'Service path (e.g., auth/health, users/me, subscriptions)',
    type: String,
    example: 'auth/health',
  })
  @ApiResponse({ status: 200, description: 'Success from microservice' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 503, description: 'Microservice unavailable' })
  async proxyGet(@Param('path') pathParam: string, @Req() req: Request) {
    // req.path contains /api/v1/{path} due to global prefix
    // Use it directly as it's already in correct format
    const path = req.path;
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};

    this.logger.log(`[PROXY] GET ${path} (param: ${pathParam})`);
    return await this.proxyService.routeRequest(path, 'GET', null, headers);
  }

  /**
   * Proxy POST - forward to microservices
   * Hidden from Swagger - use specific controllers instead
   */
  @Post('*path')
  // @ApiExclude() - Hide this endpoint from Swagger
  async proxyPost(@Req() req: Request, @Body() body?: unknown) {
    const path = req.path;
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};

    this.logger.log(`[PROXY] POST ${path}`);
    return await this.proxyService.routeRequest(path, 'POST', body, headers);
  }

  /**
   * Proxy PUT - forward to microservices
   * Hidden from Swagger - use specific controllers instead
   */
  @Put('*path')
  // @ApiExclude() - Hide this endpoint from Swagger
  async proxyPut(@Req() req: Request, @Body() body?: unknown) {
    const path = req.path;
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};

    this.logger.log(`[PROXY] PUT ${path}`);
    return await this.proxyService.routeRequest(path, 'PUT', body, headers);
  }

  /**
   * Proxy PATCH - forward to microservices
   * Hidden from Swagger - use specific controllers instead
   */
  @Patch('*path')
  // @ApiExclude() - Hide this endpoint from Swagger
  async proxyPatch(@Req() req: Request, @Body() body?: unknown) {
    const path = req.path;
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};

    this.logger.log(`[PROXY] PATCH ${path}`);
    return await this.proxyService.routeRequest(path, 'PATCH', body, headers);
  }

  /**
   * Proxy DELETE - forward to microservices
   * Hidden from Swagger - use specific controllers instead
   */
  @Delete('*path')
  // @ApiExclude() - Hide this endpoint from Swagger
  async proxyDelete(@Req() req: Request) {
    const path = req.path;
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};

    this.logger.log(`[PROXY] DELETE ${path}`);
    return await this.proxyService.routeRequest(path, 'DELETE', null, headers);
  }
}
