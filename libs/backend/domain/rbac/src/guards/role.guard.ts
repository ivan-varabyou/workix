import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { I18nService } from '@workix/infrastructure/i18n';

import { RoleService } from '../services/role.service';

/**
 * RoleGuard
 * Checks if user has required roles
 * Usage: @UseGuards(RoleGuard) @Roles('admin', 'moderator')
 */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private roleService: RoleService,
    private i18n: I18nService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!requiredRoles) {
      return true; // No roles required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.id) {
      throw new ForbiddenException(this.i18n.translate('errors.unauthorized'));
    }

    const hasRole = await this.roleService.hasAnyRole(user.id, requiredRoles);

    if (!hasRole) {
      throw new ForbiddenException(
        `User does not have required roles: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}
