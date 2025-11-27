// Module
export { RBACModule } from './rbac.module';

// Services
export type { AuditLog, AuditLogFilters, AuditLogListResponse } from './services/audit-log.service';
export { AuditLogService } from './services/audit-log.service';
export { PermissionService } from './services/permission.service';
export { RoleService } from './services/role.service';

// Guards
export { RoleGuard } from './guards/role.guard';

// Decorators
export { HasPermission } from './decorators/has-permission.decorator';
export { Roles } from './decorators/roles.decorator';

// Interfaces
export { RBACPrismaService } from './interfaces/rbac-prisma.interface';

// DTOs
export { AssignRoleDto } from './dtos/assign-role.dto';
export { CreatePermissionDto } from './dtos/create-permission.dto';
export { CreateRoleDto } from './dtos/create-role.dto';
