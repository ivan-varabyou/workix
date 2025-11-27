import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { AdminRequest } from '../interfaces/admin.types';

/**
 * Get current authenticated admin
 * Usage: @CurrentAdmin() admin or @CurrentAdmin('id') adminId
 */
// eslint-disable-next-line @typescript-eslint/typedef -- Type is inferred from createParamDecorator
export const CurrentAdmin = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): unknown => {
    const request: AdminRequest = ctx.switchToHttp().getRequest<AdminRequest>();
    const admin: { id: string; email: string; role: string } | undefined = request.admin;

    if (!admin) {
      return null;
    }

    if (data) {
      // Type assertion needed for dynamic property access
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-return
      return admin[data as keyof typeof admin];
    }
    return admin;
  }
);
