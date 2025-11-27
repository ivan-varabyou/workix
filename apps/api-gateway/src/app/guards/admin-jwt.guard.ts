import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

import { AdminAuthService } from '../services/admin-auth.service';

/**
 * Admin JWT Guard
 * Validates admin JWT tokens from Authorization header
 */
@Injectable()
export class AdminJwtGuard implements CanActivate {
  constructor(private adminAuthService: AdminAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const admin = await this.adminAuthService.verifyAdmin(token);
    if (!admin) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Attach admin to request
    (request as any).admin = admin;
    (request as any).adminToken = token;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
