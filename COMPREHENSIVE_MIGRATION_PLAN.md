# Комплексный план миграции libs

## 🎯 Новая структура: libs/backend/*** и libs/frontend/***

### Новая организация по платформам:
```
libs/
  backend/
    entities/        # Модели данных с бизнес-логикой
    domain/          # Доменные сервисы (бизнес-логика)
    infrastructure/  # Инфраструктурный слой (Prisma, внешние API)
    shared/          # Общие библиотеки (утилиты, core функционал)
  frontend/
    entities/        # Frontend модели
    features/        # Frontend features
    shared/          # Общие frontend библиотеки
  integrations/     # Интеграции (AWS, Azure, GCP, GitHub, GitLab, Slack, Telegram, Jira, Salesforce, AI провайдеры)
    ai/              # AI интеграции (провайдеры нейронных сетей и агентов: OpenAI, Anthropic, Groq и др.)
  ai/               # AI библиотеки (domain сервисы, infrastructure, entities)
  shared/           # Общие библиотеки для обеих платформ (utils, types, exceptions, filters)
```

**Упрощения:**
- ❌ Убрали `features/` - путаница с `domain/`, используем только `domain/`
- ✅ `utilities/` → `backend/shared/utilities/` - технические утилиты в shared
- ✅ `ai/ai-core/providers/` → `integrations/ai/providers/` - AI провайдеры это интеграции с внешними сервисами
- ✅ `ai/` (domain, infrastructure, entities) → `ai/` - AI библиотеки отдельно (бизнес-логика, инфраструктура)
- ✅ `integrations/` → `integrations/` - Интеграции отдельно (могут использоваться и в backend, и во frontend)

## 🎯 Принципы разделения

### Entities (libs/backend/entities/)
- **Модели данных с бизнес-логикой**
- Без зависимостей от сервисов
- Чистые классы с методами валидации, проверки состояния
- Примеры: `UserEntity`, `PipelineEntity`, `RoleEntity`
- Группировка: `backend/entities/domain/` (все domain entities), `backend/entities/infrastructure/` (infrastructure entities)

### Domain (libs/backend/domain/)
- **Доменные сервисы (бизнес-логика)**
- Используют entities и infrastructure
- Специфичная бизнес-логика домена
- Примеры: `AuthService`, `PipelineService`, `RBACService`, `ABTestingService`, `SubscriptionService`
- Группировка: `backend/domain/auth/`, `backend/domain/pipelines/`, `backend/domain/ab-testing/`, `backend/domain/billing/`

### Domain (libs/backend/domain/)
- **Доменные сервисы (бизнес-логика среднего уровня)**
- Используют entities и infrastructure
- Специфичная бизнес-логика домена
- Примеры: `AuthService`, `PipelineService`, `RBACService`

### Infrastructure (libs/backend/infrastructure/)
- **Инфраструктурный слой**
- Prisma, API клиенты, внешние интеграции
- Репозитории, адаптеры
- Примеры: `PrismaService`, `I18nService`, `MessageBrokerService`

### Infrastructure (libs/backend/infrastructure/)
- **Инфраструктурный слой**
- Prisma, API клиенты, внешние интеграции, AI провайдеры
- Репозитории, адаптеры
- Примеры: `PrismaService`, `I18nService`, `MessageBrokerService`, `OpenAIProvider`, `AIExecutionRepository`, `AIRouter`
- Группировка: `backend/infrastructure/prisma/`, `backend/infrastructure/ai/`, `backend/infrastructure/api-keys/`

### Shared (libs/backend/shared/)
- **Общие backend библиотеки**
- Core функционал, используемый везде
- Технические утилиты
- Примеры: `SessionManagerService`, `TokenCacheService`, `AuthClientService`, `DataValidationService`, `CircuitBreakerService`, `FileStorageService`
- Группировка: `backend/shared/core/`, `backend/shared/utilities/`

---

## 📊 Анализ текущей структуры

### 1. Domain (libs/domain/*)

#### ✅ Остается в domain (доменные сервисы):
- `auth/` - `AuthService`, `JwtService`, `PasswordService`, `AccountLockService` и др.
- `rbac/` - `RBACService`, `RoleService`, `PermissionService`
- `pipelines/` - `PipelineService`, `ExecutionService`, `PipelineExecutorService`, `AdvancedExecutorService`
- `workers/` - `WorkerFrameworkService`, `VirtualWorkerService`, `WorkerTemplatesService`
- `workflows/` - `WorkflowService`
- `webhooks/` - `WebhookService`
- `users/` - `UserProfileService`, `AvatarService`
- `admin/` - `AdminAuthService`, `AdminJwtService`, `AdminTokenCacheService`
- `notifications/` - `PushSubscriptionService`
- `utilities/ab-testing/` → `ab-testing/` - `ABTestingService`, `AnalyticsCollectionService` (доменная логика A/B тестирования)
- `utilities/billing/` → `billing/` - `SubscriptionService`, `TrialService`, `UsageTrackingService` (доменная логика биллинга)

#### ⚠️ Возможно перенести в features (высокоуровневые сервисы):
- **НЕТ** - все domain сервисы остаются в domain, так как это доменная бизнес-логика
- **Примечание**: Существующие features (auth, pipelines, rbac) - это просто обертки/адаптеры над domain сервисами
- **Рекомендация**: Features должны содержать только высокоуровневую бизнес-логику, оркестрацию нескольких domain сервисов, а не просто обертки
- **Текущие features можно оставить** как примеры, но в большинстве случаев лучше использовать domain сервисы напрямую

#### ⚠️ Возможно перенести в entities (модели данных):
- НЕТ - в domain нет моделей, только сервисы

---

### 2. Infrastructure (libs/infrastructure/*)

#### ✅ Остается в infrastructure (инфраструктурный слой):
- `prisma/` - `PrismaService` (ORM)
- `database/` - `SeederService`, `MigrationService`, `AuditService` (DB утилиты)
- `i18n/` - `I18nService` (интернационализация)
- `message-broker/` - Message broker интеграция
- `service-discovery/` - `ServiceRegistryService`, `ServiceLocatorService` (service discovery)
- `notifications/` - `EmailNotificationService`, `PushNotificationService` (внешние интеграции)
- `performance/` - `LoadTestingService`, `DatabaseOptimizerService` (инфраструктурные утилиты)
- `testing/` - тестовые утилиты

#### ⚠️ Возможно перенести в entities (модели данных):
- `api-keys/` - `ApiKeyEntity` → `libs/backend/entities/infrastructure/api-key`
  - **Причина**: Модель данных с бизнес-логикой (валидация, проверка прав)

---

### 3. Utilities (libs/utilities/*)

#### ✅ Перенести в shared/utilities (технические утилиты):
- `data-validation/` - `DataValidationService`, `SchemaRegistryService` → `libs/backend/shared/utilities/data-validation`
- `resilience/` - `CircuitBreakerService` → `libs/backend/shared/utilities/resilience`
- `file-storage/` - `FileStorageService` → `libs/backend/shared/utilities/file-storage`
- `batch-processing/` - `BatchService` → `libs/backend/shared/utilities/batch-processing`
- `custom-scripts/` - `CustomScriptsService` → `libs/backend/shared/utilities/custom-scripts`

#### ⚠️ Возможно перенести в entities (модели данных):
- `ab-testing/` - `ABTestEntity` → `libs/backend/entities/utilities/ab-test` ✅ **УЖЕ ПЕРЕНЕСЕНО** (нужно переместить)
- `billing/` - `TrialEntity`, `SubscriptionEntity` → `libs/backend/entities/utilities/trial`, `libs/backend/entities/utilities/subscription` ✅ **УЖЕ ПЕРЕНЕСЕНО** (нужно переместить)

#### ⚠️ Возможно перенести в domain (бизнес-логика):
- `ab-testing/` - `ABTestingService` → `libs/backend/domain/utilities/ab-testing`
  - **Причина**: Бизнес-логика A/B тестирования, использует `ABTestEntity`
- `billing/` - `SubscriptionService`, `TrialService`, `UsageTrackingService` → `libs/backend/domain/utilities/billing`
  - **Причина**: Бизнес-логика биллинга, использует `TrialEntity`, `SubscriptionEntity`

---

### 4. AI (libs/ai/*)

#### ✅ Перенести в infrastructure/ai (инфраструктурный слой):
- `ai-core/providers/` - `OpenAIProvider`, `AnthropicProvider`, и др. → `libs/backend/infrastructure/ai/providers/`
- `ai-core/repositories/` - `AIExecutionRepository` → `libs/backend/infrastructure/ai/repositories/`
- `ai-core/router/` - `AIRouter` → `libs/backend/infrastructure/ai/router/`
- `ai-core/interfaces/ai-provider.interface.ts` → `libs/backend/infrastructure/ai/interfaces/`
- `ai-core/interfaces/ai-prisma.interface.ts` → `libs/backend/infrastructure/ai/interfaces/`

#### ⚠️ Перенести в entities (модели данных):
- `ai-core/interfaces/ai-prisma.interface.ts` → `AIExecutionHistory`, `AIModelFeedback`
  - `AIExecutionHistory` → `libs/backend/entities/ai/ai-execution-history`
  - `AIModelFeedback` → `libs/backend/entities/ai/ai-model-feedback`

#### ⚠️ Перенести в domain (бизнес-логика):
- `ai-core/services/model-registry.service.ts` → `libs/backend/domain/ai/model-registry`
- `ai-core/services/token-tracker.service.ts` → `libs/backend/domain/ai/token-tracker`
- `ai-core/services/prompt-manager.service.ts` → `libs/backend/domain/ai/prompt-manager`
- `generation/services/*.service.ts` → `libs/backend/domain/ai/generation`
- `ml-integration/services/ml-integration.service.ts` → `libs/backend/domain/ai/ml-integration`

---

### 5. Shared/backend/core/services

#### ⚠️ Проблема: перемешаны ts и spec файлы
**Текущая структура:**
```
libs/shared/backend/core/src/services/
  - session-manager.service.ts
  - session-manager.service.spec.ts  ❌
  - token-cache.service.ts
  - token-cache.service.spec.ts  ❌
  - auth-client.service.ts
  - user-client.service.ts
```

**Новая структура (после миграции в libs/backend/shared/):**
```
libs/backend/shared/core/src/services/
  - session-manager/
    - session-manager.service.ts
    - session-manager.service.spec.ts
    - session-manager.interface.ts
  - token-cache/
    - token-cache.service.ts
    - token-cache.service.spec.ts
    - token-cache.interface.ts
    - token-cache-backends/
      - memory-cache.backend.ts
      - redis-cache.backend.ts
  - auth-client/
    - auth-client.service.ts
  - user-client/
    - user-client.service.ts
```

**Решение**: Создать подпапки с названием сервиса для лучшей организации и навигации.

---

## 📋 План миграции

### Этап 0: Реорганизация структуры libs/ → libs/backend/, libs/frontend/, libs/integrations/, libs/ai/, libs/shared/

**Задача**: Переместить все библиотеки в новую структуру по платформам

**Действия**:
1. Создать структуру `libs/backend/`, `libs/frontend/`, `libs/integrations/`, `libs/ai/`, `libs/shared/`

2. Переместить все backend библиотеки:
   - `libs/entities/backend/*` → `libs/backend/entities/*` (кроме AI и integration entities)
   - `libs/features/backend/*` → удалить (путаница с domain, использовать только domain)
   - `libs/domain/*` → `libs/backend/domain/*`
   - `libs/infrastructure/*` → `libs/backend/infrastructure/*` (кроме AI)
   - `libs/utilities/*` → `libs/backend/shared/utilities/*` (технические утилиты в shared)
   - `libs/shared/backend/*` → `libs/backend/shared/*`

3. Переместить все frontend библиотеки:
   - `libs/entities/frontend/*` → `libs/frontend/entities/*`
   - `libs/features/frontend/*` → `libs/frontend/features/*`
   - `libs/shared/frontend/*` → `libs/frontend/shared/*`

4. Переместить integrations отдельно:
   - `libs/integrations/*` → `libs/integrations/*`
   - `libs/entities/backend/integration/` → `libs/integrations/entities/integration/`

5. Переместить AI отдельно:
   - `libs/ai/ai-core/providers/` → `libs/ai/providers/`
   - `libs/ai/ai-core/repositories/` → `libs/ai/repositories/`
   - `libs/ai/ai-core/router/` → `libs/ai/router/`
   - `libs/ai/ai-core/interfaces/` → `libs/ai/interfaces/`
   - `libs/ai/ai-core/services/` → `libs/ai/domain/` (бизнес-логика)
   - `libs/ai/generation/` → `libs/ai/domain/generation/`
   - `libs/ai/ml-integration/` → `libs/ai/domain/ml-integration/`
   - `libs/entities/backend/ai-provider/` → `libs/ai/entities/ai-provider/`
   - `libs/entities/backend/ai-model/` → `libs/ai/entities/ai-model/`

6. Переместить общий shared:
   - `libs/shared/utils/` → `libs/shared/utils/`
   - `libs/shared/src/*` → `libs/shared/*` (exceptions, filters, interceptors, types, utils)

7. Обновить все импорты в проекте
8. Обновить `tsconfig.base.json` с новыми путями
9. Обновить все `project.json` файлы

### Этап 1: Исправление структуры тестов в shared/backend/core

**Задача**: Реорганизовать структуру services с подпапками по названию сервиса

**Действия**:
1. Создать подпапки для каждого сервиса:
   - `services/session-manager/` - session-manager.service.ts, session-manager.service.spec.ts, session-manager.interface.ts
   - `services/token-cache/` - token-cache.service.ts, token-cache.service.spec.ts, token-cache.interface.ts, token-cache-backends/
   - `services/auth-client/` - auth-client.service.ts
   - `services/user-client/` - user-client.service.ts
2. Переместить файлы в соответствующие подпапки
3. Обновить импорты в index.ts и других файлах

---

### Этап 2: Перенос Entities из Infrastructure

**Задача**: Перенести модели данных в entities

**Действия**:
1. `libs/infrastructure/api-keys/` → `libs/backend/entities/infrastructure/api-key`
   - Создать `ApiKeyEntity` класс
   - Перенести бизнес-логику валидации
   - Обновить импорты в `backend/infrastructure/api-keys`

---

### Этап 3: Перенос Domain сервисов из Utilities

**Задача**: Перенести бизнес-логику в domain

**Действия**:
1. Переместить существующие entities в новую структуру:
   - `libs/entities/backend/ab-test` → `libs/backend/entities/domain/ab-test` (entity для domain/ab-testing)
   - `libs/entities/backend/trial` → `libs/backend/entities/domain/trial` (entity для domain/billing)
   - `libs/entities/backend/subscription` → `libs/backend/entities/domain/subscription` (entity для domain/billing)
   - `libs/entities/backend/ai-provider` → `libs/backend/entities/ai/ai-provider`
   - `libs/entities/backend/ai-model` → `libs/backend/entities/ai/ai-model`
   - `libs/entities/backend/user` → `libs/backend/entities/domain/user`
   - `libs/entities/backend/admin` → `libs/backend/entities/domain/admin`
   - `libs/entities/backend/pipeline` → `libs/backend/entities/domain/pipeline`
   - `libs/entities/backend/role` → `libs/backend/entities/domain/role`
   - `libs/entities/backend/worker` → `libs/backend/entities/domain/worker`

2. Переместить domain в новую структуру:
   - `libs/domain/*` → `libs/backend/domain/*`

3. Переместить infrastructure в новую структуру:
   - `libs/infrastructure/*` → `libs/backend/infrastructure/*`

4. Переместить utilities в новую структуру:
   - `libs/utilities/*` → `libs/backend/utilities/*`

5. Переместить ai в новую структуру:
   - `libs/ai/*` → `libs/backend/ai/*`

6. Переместить shared в новую структуру:
   - `libs/shared/backend/*` → `libs/backend/shared/*`

7. `libs/utilities/ab-testing/services/ab-testing.service.ts` → `libs/backend/features/utilities/ab-testing`
   - Использовать `ABTestEntity` из `backend/entities/utilities/ab-test`
   - Обновить импорты

8. `libs/utilities/billing/services/*.service.ts` → `libs/backend/features/utilities/billing`
   - `SubscriptionService` → использовать `SubscriptionEntity`
   - `TrialService` → использовать `TrialEntity`
   - `UsageTrackingService` → оставить в utilities или перенести в features (решить)

---

### Этап 4: Перенос Entities и Domain сервисов из AI

**Задача**: Перенести модели и сервисы согласно AI_MIGRATION_PLAN.md

**Действия**:
1. Переместить AI entities в `libs/ai/entities/`:
   - `libs/entities/backend/ai-provider/` → `libs/ai/entities/ai-provider/`
   - `libs/entities/backend/ai-model/` → `libs/ai/entities/ai-model/`
2. Создать новые AI entities:
   - `libs/ai/entities/ai-execution-history/`
   - `libs/ai/entities/ai-model-feedback/`
3. Переместить AI infrastructure в `libs/ai/`:
   - `libs/ai/ai-core/providers/` → `libs/ai/providers/`
   - `libs/ai/ai-core/repositories/` → `libs/ai/repositories/`
   - `libs/ai/ai-core/router/` → `libs/ai/router/`
   - `libs/ai/ai-core/interfaces/` → `libs/ai/interfaces/`
4. Создать AI domain сервисы в `libs/ai/domain/`:
   - `libs/ai/domain/model-registry/`
   - `libs/ai/domain/token-tracker/`
   - `libs/ai/domain/prompt-manager/`
   - `libs/ai/domain/generation/`
   - `libs/ai/domain/ml-integration/`

---

### Этап 5: Обновление импортов

**Задача**: Обновить все импорты после миграции

**Действия**:
1. Обновить импорты в `apps/*`
2. Обновить импорты в `libs/*`
3. Удалить старые экспорты из `libs/*/src/index.ts`
4. Проверить компиляцию

---

## 🎯 Итоговая структура

### Новая структура (libs/backend/*** и libs/frontend/***)

#### Entities (libs/backend/entities/)
**Domain entities:**
- `domain/user/` ✅ (нужно переместить)
- `domain/admin/` ✅ (нужно переместить)
- `domain/pipeline/` ✅ (нужно переместить)
- `domain/role/` ✅ (нужно переместить)
- `domain/worker/` ✅ (нужно переместить)

**AI entities** (переносятся в `libs/ai/entities/`):
- `ai-provider/` ✅ (нужно переместить в `libs/ai/entities/ai-provider/`)
- `ai-model/` ✅ (нужно переместить в `libs/ai/entities/ai-model/`)
- `ai-execution-history/` ⏳ (новый в `libs/ai/entities/ai-execution-history/`)
- `ai-model-feedback/` ⏳ (новый в `libs/ai/entities/ai-model-feedback/`)

**Domain entities (из utilities, но это domain entities):**
- `entities/backend/ab-test/` → `backend/entities/domain/ab-test/` ✅ (entity для domain/ab-testing)
- `entities/backend/trial/` → `backend/entities/domain/trial/` ✅ (entity для domain/billing)
- `entities/backend/subscription/` → `backend/entities/domain/subscription/` ✅ (entity для domain/billing)

**Infrastructure entities:**
- `infrastructure/api-key/` ⏳ (новый)

#### Domain (libs/backend/domain/)
**Domain сервисы:**
- `auth/` ✅ (нужно переместить)
- `rbac/` ✅ (нужно переместить)
- `pipelines/` ✅ (нужно переместить)
- `workers/` ✅ (нужно переместить)
- `workflows/` ✅ (нужно переместить)
- `webhooks/` ✅ (нужно переместить)
- `users/` ✅ (нужно переместить)
- `admin/` ✅ (нужно переместить)
- `notifications/` ✅ (нужно переместить)

**AI domain сервисы** (переносятся в `libs/ai/domain/`):
- `model-registry/` ⏳ (новый в `libs/ai/domain/model-registry/`)
- `token-tracker/` ⏳ (новый в `libs/ai/domain/token-tracker/`)
- `prompt-manager/` ⏳ (новый в `libs/ai/domain/prompt-manager/`)
- `generation/` ⏳ (новый в `libs/ai/domain/generation/`)
- `ml-integration/` ⏳ (новый в `libs/ai/domain/ml-integration/`)

**Domain сервисы (из utilities, но это доменная логика):**
- `utilities/ab-testing/` → `backend/domain/ab-testing/` ⏳ (доменная логика A/B тестирования)
- `utilities/billing/` → `backend/domain/billing/` ⏳ (доменная логика биллинга и подписок)

#### Domain (libs/backend/domain/)
- `auth/` ✅ (нужно переместить)
- `rbac/` ✅ (нужно переместить)
- `pipelines/` ✅ (нужно переместить)
- `workers/` ✅ (нужно переместить)
- `workflows/` ✅ (нужно переместить)
- `webhooks/` ✅ (нужно переместить)
- `users/` ✅ (нужно переместить)
- `admin/` ✅ (нужно переместить)
- `notifications/` ✅ (нужно переместить)
- `ab-testing/` ✅ (нужно переместить из `utilities/ab-testing/`)
- `billing/` ✅ (нужно переместить из `utilities/billing/`)

#### Infrastructure (libs/backend/infrastructure/)
- `prisma/` ✅ (нужно переместить)
- `database/` ✅ (нужно переместить)
- `i18n/` ✅ (нужно переместить)
- `message-broker/` ✅ (нужно переместить)
- `service-discovery/` ✅ (нужно переместить)
- `notifications/` ✅ (нужно переместить)
- `performance/` ✅ (нужно переместить)
- `testing/` ✅ (нужно переместить)
- `api-keys/` ✅ (нужно переместить, обновить для использования `ApiKeyEntity`)
- `ai/providers/` ✅ (нужно переместить из `libs/ai/ai-core/providers/`)
- `ai/repositories/` ✅ (нужно переместить из `libs/ai/ai-core/repositories/`)
- `ai/router/` ✅ (нужно переместить из `libs/ai/ai-core/router/`)
- `ai/interfaces/` ✅ (нужно переместить из `libs/ai/ai-core/interfaces/`)

#### Integrations (libs/backend/integrations/)
- `core/` ✅ (нужно переместить из `libs/integrations/core/`)
- `cloud/aws/` ✅ (нужно переместить)
- `cloud/azure/` ✅ (нужно переместить)
- `cloud/gcp/` ✅ (нужно переместить)
- `code/github/` ✅ (нужно переместить)
- `code/gitlab/` ✅ (нужно переместить)
- `communication/slack/` ✅ (нужно переместить)
- `communication/telegram/` ✅ (нужно переместить)
- `project-management/jira/` ✅ (нужно переместить)
- `project-management/salesforce/` ✅ (нужно переместить)
- `e-commerce/` ✅ (нужно переместить)

#### Shared (libs/backend/shared/)
- `core/` ✅ (нужно переместить из `libs/shared/backend/core/`)
- `utilities/data-validation/` ✅ (нужно переместить из `libs/utilities/data-validation/`)
- `utilities/resilience/` ✅ (нужно переместить из `libs/utilities/resilience/`)
- `utilities/file-storage/` ✅ (нужно переместить из `libs/utilities/file-storage/`)
- `utilities/batch-processing/` ✅ (нужно переместить из `libs/utilities/batch-processing/`)
- `utilities/custom-scripts/` ✅ (нужно переместить из `libs/utilities/custom-scripts/`)

#### Shared (libs/backend/shared/)
- `core/` ✅ (нужно переместить из `libs/shared/backend/core/`)

---

## ⚠️ Важные замечания

1. **Не превращать в свалку** - логично разделять по назначению
2. **Тесты рядом с кодом** - стандарт NX, spec файлы рядом с исходными
3. **Обновлять импорты** - после каждого переноса обновлять импорты
4. **Проверять компиляцию** - после каждого этапа проверять компиляцию
5. **Не ломать существующий функционал** - миграция должна быть безопасной

---

## ✅ Чек-лист миграции

- [ ] Этап 0: Реорганизация структуры libs/ → libs/backend/ и libs/frontend/
- [ ] Этап 1: Реорганизация структуры services в backend/shared/core (подпапки по названию сервиса)
- [ ] Этап 2: Перенос Entities из Infrastructure
- [ ] Этап 3: Перенос Features из Utilities
- [ ] Этап 4: Перенос Entities и Features из AI
- [ ] Этап 5: Обновление импортов
- [ ] Проверка компиляции всех проектов
- [ ] Проверка работы всех сервисов

---

## 📝 Примечания по Domain/Features

**Важно**:
- `libs/domain/*` - доменные сервисы (бизнес-логика среднего уровня) - **ОСТАЮТСЯ В DOMAIN**
- `libs/features/*` - высокоуровневые сервисы (оркестрация, композиция domain сервисов)
- Существующие features (auth, pipelines, rbac) - это примеры оберток, но в большинстве случаев лучше использовать domain сервисы напрямую
- Features должны содержать реальную бизнес-логику высокого уровня, а не просто делегировать вызовы
