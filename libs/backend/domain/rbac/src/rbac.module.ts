import { DynamicModule, Module, Type } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { I18nModule } from '@workix/infrastructure/i18n';

import { RoleGuard } from './guards/role.guard';
import { AuditLogService } from './services/audit-log.service';
import { PermissionService } from './services/permission.service';
import { RoleService } from './services/role.service';

/**
 * RBACModule
 * Provides role-based access control functionality
 *
 * Usage in your app module:
 * @Module({
 *   imports: [RBACModule.forRoot(PrismaService)],
 * })
 * export class AppModule {}
 */
@Module({})
export class RBACModule {
  static forRoot(PrismaServiceClass: Type<PrismaClient>): DynamicModule {
    return {
      module: RBACModule,
      imports: [I18nModule],
      providers: [
        {
          provide: 'PrismaService',
          useClass: PrismaServiceClass,
        },
        RoleService,
        PermissionService,
        AuditLogService,
        RoleGuard,
      ],
      exports: [RoleService, PermissionService, AuditLogService, RoleGuard],
    };
  }
}
