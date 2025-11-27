import { SetMetadata } from '@nestjs/common';

/**
 * @Roles() decorator
 * Marks endpoint to require specific roles
 *
 * Usage:
 * @Roles('admin', 'moderator')
 * async myEndpoint() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
