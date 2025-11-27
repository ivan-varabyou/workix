# 📦 Пример интеграции AuthClientModule в монолит

## Шаг 1: Импорт модуля в AppModule

```typescript
import { AuthClientModule } from '@workix/shared/backend/core';
import { WorkixAuthModule } from '@workix/domain/auth';

@Module({
  imports: [
    // ... другие импорты

    // Auth module for JWT стратегии (обязательно for HybridJwtGuard)
    WorkixAuthModule.forRoot({
      jwtExpiresIn: '1h',
    }),

    // Auth Client for взаимодействия с микроserviceом auth
    AuthClientModule.forRoot(),

    // ... остальные modules
  ],
})
export class AppModule {}
```

## Шаг 2: Usage в контроллерах

### Вариант 1: HybridJwtGuard (рекомендуется)

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { HybridJwtGuard } from '@workix/shared/backend/core';
import { CurrentUser } from '@workix/domain/auth';

@Controller('users')
@UseGuards(HybridJwtGuard) // Гибридная check
export class UsersController {
  @Get('me')
  getMe(@CurrentUser() user: { userId: string; email: string }) {
    return { user };
  }
}
```

### Вариант 2: Стандартный JwtGuard (только локальная check)

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard, CurrentUser } from '@workix/domain/auth';

@Controller('users')
@UseGuards(JwtGuard) // Только локальная check
export class UsersController {
  @Get('me')
  getMe(@CurrentUser() user: { userId: string; email: string }) {
    return { user };
  }
}
```

## Шаг 3: Конфигурация via переменные окрalreadyния

```bash
# .env
# Режим авторизации: local | remote | hybrid
AUTH_VERIFICATION_MODE=hybrid

# URL микроserviceа auth
AUTH_SERVICE_URL=http://localhost:7200

# Service key for внутренних requestов
SERVICE_KEY=your-service-key-minimum-32-characters-long

# JWT Secret (общий for allх serviceов)
JWT_SECRET=your-jwt-secret-minimum-32-characters-long
```

## Примечания

1. **WorkixAuthModule обязателен** - HybridJwtGuard наследуется от `AuthGuard('jwt')`, который требует `JwtStrategy` из `WorkixAuthModule`.

2. **Режимы работы:**
   - `local` - только локальная check (быстро)
   - `remote` - только удаленная check (централизовано)
   - `hybrid` - сначала локальная, потом удаленная (рекомендуется)

3. **Для production** рекомендуется use `hybrid` mode for баланса between скоростью и централизацией.
