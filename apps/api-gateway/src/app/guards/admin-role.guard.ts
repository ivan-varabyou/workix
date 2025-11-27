import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

export const ADMIN_ROLES_KEY = 'adminRoles';

/**
 * Admin Role Guard
 * Checks if admin has required role
 */
@Injectable()
export class AdminRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ADMIN_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No role requirement
    }

    const request = context.switchToHttp().getRequest<Request>();
    const admin = (request as any).admin;

    if (!admin) {
      throw new ForbiddenException('Admin not authenticated');
    }

    if (!requiredRoles.includes(admin.role)) {
      throw new ForbiddenException(`Required role: ${requiredRoles.join(' or ')}`);
    }

    return true;
  }
}
