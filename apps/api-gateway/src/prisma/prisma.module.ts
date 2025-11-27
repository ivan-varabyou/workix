import { Global, Module } from '@nestjs/common';

import { GatewayPrismaService } from './gateway-prisma.service';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_URL_OVERRIDE',
      useFactory: () => {
        // Приоритет: переменная окружения > дефолтное значение
        const dbUrl = process.env.DATABASE_URL_GATEWAY ||
                     process.env.DATABASE_URL ||
                     'postgresql://postgres:postgres@localhost:5000/workix_gateway';
        console.log('🔌 Gateway Prisma DB URL:', dbUrl.replace(/:[^:@]+@/, ':****@')); // Логируем без пароля
        return dbUrl;
      },
    },
    {
      provide: GatewayPrismaService,
      useFactory: (databaseUrlOverride: string): GatewayPrismaService => {
        return new GatewayPrismaService(databaseUrlOverride);
      },
      inject: ['DATABASE_URL_OVERRIDE'],
    },
    {
      provide: 'PrismaService',
      useExisting: GatewayPrismaService,
    },
    {
      provide: 'IDatabaseService',
      useExisting: GatewayPrismaService,
    },
    {
      provide: 'IDatabaseAdapter',
      useExisting: GatewayPrismaService,
    },
  ] as const,
  exports: [GatewayPrismaService, 'PrismaService', 'IDatabaseService', 'IDatabaseAdapter'] as const,
})
export class PrismaModule {}
