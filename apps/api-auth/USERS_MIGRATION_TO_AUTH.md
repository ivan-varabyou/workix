# 🔄 Миграция эндпоинтов users в Auth API

**Date:** 2025-11-16
**Status:** ✅ Завершено

---

## 📋 Что было сделано

### 1. ✅ Создан UsersController в Auth API

**Файл:** `apps/api-auth/src/auth/controllers/users.controller.ts`

**Эндпоинты:**
- `GET /api-auth/v1/users/me` - Получить текущего пользователя
- `GET /api-auth/v1/users` - Список users (с пагинацией)
- `GET /api-auth/v1/users/search` - Поиск users
- `GET /api-auth/v1/users/:userId` - Профиль пользователя по ID
- `PUT /api-auth/v1/users/:userId` - Обновление профиля
- `POST /api-auth/v1/users/:userId/avatar` - Обновление аватара
- `DELETE /api-auth/v1/users/:userId` - Удаление профиля

**Особенности:**
- Все эндпоинты защищены `JwtGuard`
- Проверка прав доступа: пользователь может изменять только свой профиль
- Использует `UserProfileService` из `@workix/domain/users`

---

### 2. ✅ Обновлена scheme Auth API

**Файл:** `apps/api-auth/prisma/schema.prisma`

**Добавлены поля в model User:**
```prisma
// User Profile fields
firstName         String?   @db.VarChar(50)
lastName          String?   @db.VarChar(50)
bio               String?   @db.Text
avatarUrl         String?   @db.Text
phoneNumber       String?   @db.VarChar(20)
twoFactorEnabled  Boolean   @default(false)
lastLoginAt       DateTime? @db.Timestamp
```

**Миграция:**
- Требуется создать миграцию: `npx prisma migrate dev --name add_user_profile_fields`
- Требуется переменная окрalreadyния `DATABASE_URL_AUTH`

---

### 3. ✅ Удален UsersController из монолита

**Удалены fileы:**
- `apps/api-monolith/src/app/users/users.controller.ts`
- `apps/api-monolith/src/app/users/users.module.ts`

**Обновлен:** `apps/api-monolith/src/app/app.module.ts`
- Удален импорт `UsersModule`
- Добавлен комментарий о том, what users теперь в Auth API

---

### 4. ✅ Создан UserClientService

**Файл:** `libs/shared/backend/core/src/services/user-client.service.ts`

**Методы:**
- `getUserProfile(userId, accessToken?)` - Получить профиль пользователя
- `getCurrentUser(accessToken)` - Получить текущего пользователя
- `listUsers(limit, offset, accessToken?)` - Список users
- `searchUsers(query, limit, accessToken?)` - Поиск users

**Usage в монолите:**
```typescript
import { UserClientService } from '@workix/shared/backend/core';

constructor(private userClient: UserClientService) {}

async someMethod(accessToken: string) {
  const user = await this.userClient.getCurrentUser(accessToken);
  // ...
}
```

---

### 5. ✅ Обновлена маршрутизация Gateway

**Файл:** `apps/api-gateway/src/app/services/proxy.service.ts`

**Changes:**
```typescript
// Было:
if (cleanPath.startsWith('/users')) return 'users';

// Стало:
if (cleanPath.startsWith('/users')) return 'auth'; // Users endpoints are in Auth API
```

**Файл:** `apps/api-gateway/src/app/services/service-routing.service.ts`

**Changes:**
- `/users` теперь маршрутизируется на `auth-service` (Auth API)
- Обновлены комментарии

---

## 🎯 Итоговая architecture

### Auth API (порт 7200)
- ✅ Все эндпоинты users: `/api-auth/v1/users/*`
- ✅ Работает напрямую с БД users via Prisma
- ✅ Использует `UserProfileService` из `@workix/domain/users`

### Monolith API (порт 7000)
- ❌ НЕТ эндпоинтов users
- ✅ Использует `UserClientService` for получения данных via HTTP
- ✅ Получает `userId` из JWT токена via `@CurrentUser('userId')`

### Gateway (порт 4200)
- ✅ `/api/v1/users/*` → Auth API
- ✅ `/api/v1/auth/*` → Auth API
- ✅ `/api/v1/pipelines/*` → Monolith API

---

## 📝 Следующие шаги

1. **Создать миграцию Prisma:**
   ```bash
   cd apps/api-auth
   export DATABASE_URL_AUTH="postgresql://..."
   npx prisma migrate dev --name add_user_profile_fields
   ```

2. **Обновить documentацию:**
   - Обновить `API_GATEWAY_ENDPOINTS.md` (если exists)
   - Обновить Swagger documentацию

3. **Протестировать:**
   - Проверить all эндпоинты `/api-auth/v1/users/*`
   - Проверить маршрутизацию via Gateway
   - Проверить работу `UserClientService` в монолите

---

## ⚠️ Важные замечания

1. **Монолит НЕ должен работать с БД users напрямую**
   - Все data users получаются via Auth API
   - Используется `UserClientService` for HTTP requestов

2. **JWT токены**
   - Монолит получает `userId` из JWT токена via `@CurrentUser('userId')`
   - Токен верифицируется via `HybridJwtGuard` (локально или via Auth API)

3. **Миграция БД**
   - Требуется создать миграцию for добавления полей профиля
   - Поля опциональные, существующие data не затронуты

---

## ✅ Чек-лист

- [x] Создан `UsersController` в Auth API
- [x] Добавлен `UsersModule` в Auth API
- [x] Обновлена scheme Prisma (добавлены поля профиля)
- [x] Удален `UsersController` из монолита
- [x] Удален `UsersModule` из монолита
- [x] Создан `UserClientService` for монолита
- [x] Обновлена маршрутизация Gateway
- [ ] Создана миграция Prisma (требует DATABASE_URL_AUTH)
- [ ] Обновлена documentация
- [ ] Протестированы all эндпоинты
