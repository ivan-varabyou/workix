import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

import type { AdminRequest } from '../interfaces/admin.types';

/**
 * Admin Auth Service Interface
 * Used for dependency injection in guards
 */
export interface AdminAuthServiceInterface {
  verifyAdmin(token: string): Promise<{ id: string; email: string; role: string } | null>;
}

/**
 * Admin JWT Guard
 * Validates admin JWT tokens from Authorization header
 */
@Injectable()
export class AdminJwtGuard implements CanActivate {
  constructor(
    @Inject('AdminAuthService') private adminAuthService: AdminAuthServiceInterface,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest<Request>();
    const token: string | undefined = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const admin: { id: string; email: string; role: string } | null = await this.adminAuthService.verifyAdmin(token);
    if (!admin) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Attach admin to request
    // Type assertion needed because Express Request doesn't have admin property
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, no-restricted-syntax
    const adminRequest: AdminRequest = request as AdminRequest;
    adminRequest.admin = admin;
    adminRequest.adminToken = token;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader: string | undefined = request.headers.authorization;
    const parts: string[] = authHeader?.split(' ') ?? [];
    const type: string | undefined = parts[0];
    const token: string | undefined = parts[1];
    return type === 'Bearer' ? token : undefined;
  }
}
