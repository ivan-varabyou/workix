import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { SecurityModule, WorkixAuthModule } from '@workix/backend/domain/auth';
import { ServiceAuthGuard } from '@workix/backend/shared/core';

import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    PrismaModule,
    SecurityModule,
    WorkixAuthModule.forRoot(),
    WebhooksModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector, configService: ConfigService): ServiceAuthGuard => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        return new ServiceAuthGuard(reflector, configService);
      },
      inject: [Reflector, ConfigService],
    },
  ],
})
export class AppModule implements NestModule {
  constructor() {}
  configure(_consumer: MiddlewareConsumer): void {}
}
