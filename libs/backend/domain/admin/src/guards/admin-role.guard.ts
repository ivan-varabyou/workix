import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import type { AdminRequest } from '../interfaces/admin.types';

/**
 * Decorator key for admin roles
 */
export const ADMIN_ROLES_KEY: string = 'adminRoles';

/**
 * Admin Role Guard
 * Checks if admin has required role
 */
@Injectable()
export class AdminRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles: string[] | undefined = this.reflector.getAllAndOverride<string[]>(ADMIN_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No role requirement
    }

    const request: Request = context.switchToHttp().getRequest<Request>();
    // Type assertion needed because Express Request doesn't have admin property
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, no-restricted-syntax
    const adminRequest: AdminRequest = request as AdminRequest;
    const admin: { id: string; email: string; role: string } | undefined = adminRequest.admin;

    if (!admin) {
      throw new ForbiddenException('Admin not authenticated');
    }

    if (!requiredRoles.includes(admin.role)) {
      throw new ForbiddenException(`Required role: ${requiredRoles.join(' or ')}`);
    }

    return true;
  }
}
