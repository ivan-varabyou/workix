import { SetMetadata } from '@nestjs/common';

/**
 * @HasPermission() decorator
 * Marks endpoint to require specific permission
 *
 * Usage:
 * @HasPermission('users:create')
 * async myEndpoint() { ... }
 */
export const HasPermission = (permission: string) => SetMetadata('permission', permission);
