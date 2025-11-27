import { SetMetadata } from '@nestjs/common';

/**
 * Mark route as public (no JWT required)
 */
export const Public: () => MethodDecorator & ClassDecorator = (): MethodDecorator & ClassDecorator => SetMetadata('isPublic', true);
