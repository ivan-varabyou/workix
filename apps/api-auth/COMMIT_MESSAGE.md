# 💬 Сообщение коммита для рефакторинга

## Формат коммита (по правилам репозитория):
```
T #{номер} - {тип}({область}): описание
```

## Рекомендуемое сообщение:

```
T #0 - refactor(auth): extract reusable components to shared libraries

- Extract AccountLockService to domain/auth for account locking logic
- Create GenericJwtGuard in shared/backend/core for reusable JWT validation
- Unify ServiceAuthGuard - remove duplicate from api-auth
- Create SessionManagerService for session management abstraction
- Create TokenCacheService with Memory and Redis backends
- Extend AuditLogService to support both users and admins
- Update AuthService and AdminAuthService to use AccountLockService
- Update AdminJwtGuard to extend GenericJwtGuard
- Remove duplicate ServiceAuthGuard from api-auth

Created reusable components:
- libs/domain/auth/src/services/account-lock.service.ts
- libs/shared/backend/core/src/guards/generic-jwt.guard.ts
- libs/shared/backend/core/src/services/session-manager.service.ts
- libs/shared/backend/core/src/services/token-cache.service.ts

Updated components:
- libs/domain/auth/src/services/auth.service.ts
- libs/domain/admin/src/services/admin-auth.service.ts
- libs/domain/admin/src/guards/admin-jwt.guard.ts
- apps/api-auth/src/app.module.ts

Removed:
- apps/api-auth/src/auth/guards/service-auth.guard.ts (duplicate)

All components are ready for reuse in api-admin and other services.
Build successful, all endpoints verified.
```

## Альтернативные варианты:

### Вариант 1 (краткий):
```
T #0 - refactor(auth): extract reusable auth components
```

### Вариант 2 (с деталями):
```
T #0 - refactor(auth): extract shared auth components

Extract common authentication logic into reusable libraries:
- AccountLockService for account locking
- GenericJwtGuard for JWT validation
- SessionManagerService for session management
- TokenCacheService for token caching
- Extended AuditLogService for audit logging

All components ready for reuse in api-admin and other services.
```

## Файлы для коммита:

### Новые файлы:
- libs/domain/auth/src/services/account-lock.service.ts
- libs/domain/auth/src/services/account-lock.interface.ts
- libs/shared/backend/core/src/guards/generic-jwt.guard.ts
- libs/shared/backend/core/src/services/session-manager.service.ts
- libs/shared/backend/core/src/services/session-manager.interface.ts
- libs/shared/backend/core/src/services/token-cache.service.ts
- libs/shared/backend/core/src/services/token-cache.interface.ts
- libs/shared/backend/core/src/services/token-cache-backends/memory-cache.backend.ts
- libs/shared/backend/core/src/services/token-cache-backends/redis-cache.backend.ts

### Обновленные файлы:
- libs/domain/auth/src/services/auth.service.ts
- libs/domain/auth/src/services/audit-log.service.ts
- libs/domain/auth/src/auth.module.ts
- libs/domain/auth/src/index.ts
- libs/domain/admin/src/services/admin-auth.service.ts
- libs/domain/admin/src/guards/admin-jwt.guard.ts
- libs/shared/backend/core/src/guards/service-auth.guard.ts
- libs/shared/backend/core/src/index.ts
- apps/api-auth/src/app.module.ts

### Удаленные файлы:
- apps/api-auth/src/auth/guards/service-auth.guard.ts

### Документация:
- apps/api-auth/REFACTORING_*.md
- apps/api-auth/ENDPOINTS_*.md

