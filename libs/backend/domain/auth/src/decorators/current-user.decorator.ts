import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Get current authenticated user
 */
// eslint-disable-next-line @typescript-eslint/typedef -- Type is inferred from createParamDecorator
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): unknown => {
    const request: { user?: Record<string, unknown> } = ctx.switchToHttp().getRequest();
    const user: Record<string, unknown> | undefined = request.user;

    if (!user) {
      return null;
    }

    if (data) {
      return user[data];
    }
    return user;
  }
);
