# 📋 Сводка по созданным эндпоинthere

**Date:** 2025-11-16
**Сервис:** api-monolith
**Базовый path:** `/api-monolith/v1`

---

## ✅ Созdata эндпоинты

### 🔧 Pipelines (3 эндпоинта)

1. **POST `/api-monolith/v1/pipelines/:id/publish`**
   - Публикация пайплайна в marketplace
   - Требует авторизации (только владелец)
   - Использует: `PipelineService.publish()`

2. **GET `/api-monolith/v1/pipelines/templates`**
   - Список templateов пайплайнов
   - Query parameterы: `category`, `limit`, `offset`
   - Использует: `PipelineService.findTemplates()`

3. **POST `/api-monolith/v1/pipelines/templates/:id/clone`**
   - Клонирование templateа пайплайна
   - Body (optional): `{ name?: string, description?: string }`
   - Использует: `PipelineService.cloneTemplate()`

---

### ⚙️ Executions (4 эндпоинта)

1. **POST `/api-monolith/v1/executions`**
   - Запуск выполнения пайплайна
   - Body: `{ pipelineId: string, input?: object, options?: { async?: boolean } }`
   - Использует: `ExecutionService.create()` и `PipelineExecutorService.executePipeline()`

2. **GET `/api-monolith/v1/executions/:id`**
   - Получение выполнения по ID
   - Требует авторизации (только владелец)
   - Использует: `ExecutionService.findById()`

3. **GET `/api-monolith/v1/executions/:id/stats`**
   - Статистика выполнения
   - Возвращает: status, длительность, количество шагов, errors
   - Использует: `ExecutionService.findById()`

4. **GET `/api-monolith/v1/executions`** (бонус)
   - Список выполнений пользователя
   - Query parameterы: `limit`, `offset`
   - Использует: `ExecutionService.findByUserId()`

---

### 🔐 RBAC (3 эндпоинта)

1. **GET `/api-monolith/v1/rbac/permissions/:id`**
   - Получение permission по ID
   - Требует авторизации
   - Использует: `PermissionService.findById()`

2. **POST `/api-monolith/v1/rbac/permissions/grant`**
   - Выдача permission роли
   - Body: `{ roleId: string, permissionId: string }`
   - Требует авторизации (только админ)
   - Использует: `PermissionService.grantToRole()`

3. **DELETE `/api-monolith/v1/rbac/permissions/:roleId/:id`**
   - Отзыв permission у роли
   - Параметры: `roleId`, `id` (permissionId)
   - Требует авторизации (только админ)
   - Использует: `PermissionService.revokeFromRole()`

---

## 📊 Статистика

- **Всего создано:** 10 новых эндпоинтов
- **Pipelines:** 3 эндпоинта
- **Executions:** 4 эндпоинта (включая бонусный)
- **RBAC:** 3 эндпоинта

---

## 🔄 Архитектурные изменения

### Перемещение Users в Auth API

- ✅ `UsersController` перемещен из монолита в Auth API
- ✅ `UsersModule` удален из монолита
- ✅ Создан `UserClientService` for получения данных via HTTP
- ✅ Обновлена маршрутизация Gateway: `/users` → Auth API
- ✅ Обновлена scheme Auth API (добавлены поля профиля)

### Новые fileы

**Monolith:**
- `apps/api-monolith/src/app/executions/executions.controller.ts`
- `apps/api-monolith/src/app/executions/executions.module.ts`

**Auth API:**
- `apps/api-auth/src/auth/controllers/users.controller.ts`
- `apps/api-auth/USERS_MIGRATION_TO_AUTH.md`

**Shared:**
- `libs/shared/backend/core/src/services/user-client.service.ts`

---

## ⚠️ Требуется выполнить

1. **Миграция БД Auth API:**
   ```bash
   cd apps/api-auth
   npx prisma migrate deploy
   # или в dev modeе:
   npx prisma migrate dev
   ```

2. **Testing:**
   - Проверить all новые эндпоинты via Swagger
   - Проверить маршрутизацию via Gateway
   - Проверить работу `UserClientService` в монолите

3. **Обновление documentации:**
   - Обновить `API_GATEWAY_ENDPOINTS.md`
   - Обновить README fileы serviceов

---

## 📝 Примечания

- Все эндпоинты защищены `JwtGuard`
- Все эндпоинты documentированы в Swagger
- Проверка прав доступа реализована (пользователь может изменять только свои resources)
- Используются существующие serviceы из `@workix/domain/*`
