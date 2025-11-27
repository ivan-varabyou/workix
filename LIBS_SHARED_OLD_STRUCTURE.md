# 📁 Старая структура libs/shared

**Дата**: 2025-11-27

---

## 📂 Старая структура (до реорганизации)

```
libs/shared/
├── src/                          # Общие файлы (backend + frontend)
│   ├── exceptions/
│   │   └── app.exception.ts     # Общие исключения
│   ├── filters/
│   │   └── http-exception.filter.ts  # HTTP exception filter
│   ├── interceptors/
│   │   └── logging.interceptor.ts   # Logging interceptor
│   ├── lib/
│   │   ├── export/
│   │   │   └── export.service.ts    # Export service
│   │   └── guards/
│   │       ├── index.ts
│   │       └── service-auth.guard.ts # Service auth guard (старая версия)
│   ├── types/
│   │   └── prisma.types.ts       # Prisma types
│   ├── utils/
│   │   ├── error.utils.ts        # Error utilities
│   │   └── logger.ts             # Logger utility
│   └── index.ts                  # Главный экспорт
│
├── backend/
│   └── core/                     # Backend core (существующий)
│       ├── guards/
│       ├── services/
│       └── ...
│
└── frontend/
    ├── core/                     # Frontend core (существующий)
    └── ui/                       # Frontend UI (существующий)
```

---

## 📋 Содержимое libs/shared/src

### exceptions/app.exception.ts
- Общие исключения приложения

### filters/http-exception.filter.ts
- HTTP exception filter для обработки ошибок

### interceptors/logging.interceptor.ts
- Interceptor для логирования запросов

### lib/export/export.service.ts
- Сервис для экспорта данных

### lib/guards/service-auth.guard.ts
- **Старая версия** ServiceAuthGuard
- Проверяет X-Service-Key header
- Используется для защиты микросервисов от прямого доступа

### types/prisma.types.ts
- Общие Prisma типы (используются и в backend, и во frontend)

### utils/error.utils.ts
- Утилиты для работы с ошибками:
  - `getErrorMessage(error: unknown): string`
  - `getErrorStack(error: unknown): string | undefined`

### utils/logger.ts
- Кастомный Logger:
  - `AppLogger` класс
  - `createLogger(className: string): AppLogger`
  - Методы: `logMetric`, `logPerformance`, `logEvent`, `logTrace`

### index.ts
- Главный экспорт всех модулей из `libs/shared/src`

---

## 🔄 Что изменилось

### Создано:
1. ✅ `libs/shared/utils/` - новые общие утилиты (date, string, validation)
2. ✅ `libs/shared/backend/config/` - backend конфигурация (env, database)
3. ✅ `libs/shared/backend/api/` - backend API клиент
4. ✅ `libs/shared/frontend/api/` - frontend API клиент

### Осталось без изменений:
- ✅ `libs/shared/src/` - остается для обратной совместимости
- ✅ `libs/shared/backend/core/` - существующий (обновлен ServiceAuthGuard)
- ✅ `libs/shared/frontend/core/` - существующий
- ✅ `libs/shared/frontend/ui/` - существующий

---

## 📝 Пути импорта

### Старые пути (остаются рабочими):
```typescript
import { AppLogger } from '@workix/shared';
import { getErrorMessage } from '@workix/shared';
import { ServiceAuthGuard } from '@workix/shared';
```

### Новые пути:
```typescript
// Общие утилиты
import { formatDate, capitalize } from '@workix/shared/utils';

// Backend конфигурация
import { getRequiredEnv, getDatabaseConfig } from '@workix/shared/backend/config';

// Backend API
import { ApiClient } from '@workix/shared/backend/api';

// Frontend API
import { ApiClient } from '@workix/shared/frontend/api';
```

---

## ⚠️ Важно

1. **Обратная совместимость**: `libs/shared/src/` остается и продолжает работать
2. **Миграция**: Новый код должен использовать новые пути (`@workix/shared/utils`, `@workix/shared/backend/*`, `@workix/shared/frontend/*`)
3. **ServiceAuthGuard**: Обновленная версия находится в `libs/shared/backend/core/src/guards/service-auth.guard.ts`
