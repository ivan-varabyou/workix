# Карта миграции libs → libs/backend/, libs/frontend/, libs/shared/

## 🎯 Принципы разделения

- **backend/** - Backend-специфичная логика (NestJS сервисы, Prisma, API)
- **frontend/** - Frontend-специфичная логика (React компоненты, UI)
- **integrations/** - Интеграции (могут использоваться и в backend, и во frontend)
- **ai/** - AI библиотеки (могут использоваться и в backend, и во frontend)
- **shared/** - Переиспользуемая логика для обеих платформ (guards, utilities, типы, интерфейсы)

---

## 📋 Детальная карта миграции

### 1. entities/ → backend/entities/ + frontend/entities/

**Backend entities** (модели данных с бизнес-логикой):
- `entities/backend/user/` → `backend/entities/domain/user/`
- `entities/backend/admin/` → `backend/entities/domain/admin/`
- `entities/backend/pipeline/` → `backend/entities/domain/pipeline/`
- `entities/backend/role/` → `backend/entities/domain/role/`
- `entities/backend/worker/` → `backend/entities/domain/worker/`
- `entities/backend/ab-test/` → `backend/entities/domain/ab-test/` (entity для domain/ab-testing)
- `entities/backend/trial/` → `backend/entities/domain/trial/` (entity для domain/billing)
- `entities/backend/subscription/` → `backend/entities/domain/subscription/` (entity для domain/billing)
- `entities/backend/api-key/` → `backend/entities/infrastructure/api-key/`

**Frontend entities** (если есть):
- `entities/frontend/*` → `frontend/entities/*`

---

### 2. domain/ → backend/domain/

**Все domain сервисы - это backend бизнес-логика:**
- `domain/auth/` → `backend/domain/auth/`
- `domain/rbac/` → `backend/domain/rbac/`
- `domain/pipelines/` → `backend/domain/pipelines/`
- `domain/workers/` → `backend/domain/workers/`
- `domain/workflows/` → `backend/domain/workflows/`
- `domain/webhooks/` → `backend/domain/webhooks/`
- `domain/users/` → `backend/domain/users/`
- `domain/admin/` → `backend/domain/admin/`
- `domain/notifications/` → `backend/domain/notifications/`
- `utilities/ab-testing/` → `backend/domain/ab-testing/` (доменная логика A/B тестирования)
- `utilities/billing/` → `backend/domain/billing/` (доменная логика биллинга и подписок)

---

### 3. infrastructure/ → backend/infrastructure/

**Вся инфраструктура - это backend:**
- `infrastructure/prisma/` → `backend/infrastructure/prisma/`
- `infrastructure/database/` → `backend/infrastructure/database/`
- `infrastructure/i18n/` → `backend/infrastructure/i18n/`
- `infrastructure/message-broker/` → `backend/infrastructure/message-broker/`
- `infrastructure/service-discovery/` → `backend/infrastructure/service-discovery/`
- `infrastructure/notifications/` → `backend/infrastructure/notifications/`
- `infrastructure/performance/` → `backend/infrastructure/performance/`
- `infrastructure/testing/` → `backend/infrastructure/testing/`
- `infrastructure/api-keys/` → `backend/infrastructure/api-keys/`

---

### 4. ai/ → integrations/ai/ (провайдеры) + ai/ (domain, entities, router, repositories)

**AI Integrations** (интеграции с внешними AI сервисами - провайдеры):
- `ai/ai-core/providers/` → `integrations/ai/providers/` (OpenAI, Anthropic, Groq, Stability, Runway, ElevenLabs, Tavily)
- `ai/ai-core/interfaces/ai-provider.interface.ts` → `integrations/ai/interfaces/`

**AI Infrastructure** (внутренняя инфраструктура):
- `ai/ai-core/repositories/` → `ai/infrastructure/repositories/`
- `ai/ai-core/router/` → `ai/infrastructure/router/`

**AI Domain** (бизнес-логика):
- `ai/ai-core/services/model-registry.service.ts` → `ai/domain/model-registry/`
- `ai/ai-core/services/token-tracker.service.ts` → `ai/domain/token-tracker/`
- `ai/ai-core/services/prompt-manager.service.ts` → `ai/domain/prompt-manager/`
- `ai/generation/services/*.service.ts` → `ai/domain/generation/`
- `ai/ml-integration/services/ml-integration.service.ts` → `ai/domain/ml-integration/`

**AI Entities** (модели данных):
- `ai/ai-core/interfaces/ai-prisma.interface.ts` → `ai/entities/ai-execution-history/` и `ai/entities/ai-model-feedback/`
- `entities/backend/ai-provider/` → `ai/entities/ai-provider/`
- `entities/backend/ai-model/` → `ai/entities/ai-model/`

---

### 5. utilities/ → backend/shared/utilities/ + backend/domain/utilities/

**Utilities в shared** (технические утилиты, переиспользуемые):
- `utilities/data-validation/` → `backend/shared/utilities/data-validation/`
- `utilities/resilience/` → `backend/shared/utilities/resilience/`
- `utilities/file-storage/` → `backend/shared/utilities/file-storage/`
- `utilities/batch-processing/` → `backend/shared/utilities/batch-processing/`
- `utilities/custom-scripts/` → `backend/shared/utilities/custom-scripts/`

**Domain сервисы** (бизнес-логика, не utilities):
- `utilities/ab-testing/` → `backend/domain/ab-testing/`
  - **Структура библиотеки:**
    - `src/ab-testing.service.ts` - основной сервис A/B тестирования (создание тестов, выбор вариантов, анализ результатов)
    - `src/analytics-collection.service.ts` - сервис сбора аналитики для A/B тестов
    - `src/interfaces/ab-testing.interface.ts` - интерфейсы (ABTest, ABTestConfig, ABTestEntity, ABTestPrismaService)
    - `src/index.ts` - экспорты (ABTestingService, AnalyticsCollectionService, типы)
    - `project.json`, `tsconfig.json`, `vitest.config.ts` - конфигурация NX

- `utilities/billing/` → `backend/domain/billing/`
  - **Структура библиотеки:**
    - `src/subscription.service.ts` - сервис управления подписками (Stripe интеграция, планы, статусы)
    - `src/trial.service.ts` - сервис управления триалами (создание, отслеживание, конвертация)
    - `src/usage-tracking.service.ts` - сервис отслеживания использования (метрики, квоты, лимиты)
    - `src/interfaces/billing.interface.ts` - интерфейсы (BillingPrismaService, Stripe типы, Subscription типы)
    - `src/index.ts` - экспорты (SubscriptionService, TrialService, UsageTrackingService, типы)
    - `project.json`, `tsconfig.json`, `vitest.config.ts` - конфигурация NX

---

### 6. integrations/ → integrations/ (отдельно, может использоваться и в backend, и во frontend)

**Все integrations:**
- `integrations/core/` → `integrations/core/`
- `integrations/cloud/aws/` → `integrations/cloud/aws/`
- `integrations/cloud/azure/` → `integrations/cloud/azure/`
- `integrations/cloud/gcp/` → `integrations/cloud/gcp/`
- `integrations/code/github/` → `integrations/code/github/`
- `integrations/code/gitlab/` → `integrations/code/gitlab/`
- `integrations/communication/slack/` → `integrations/communication/slack/`
- `integrations/communication/telegram/` → `integrations/communication/telegram/`
- `integrations/project-management/jira/` → `integrations/project-management/jira/`
- `integrations/project-management/salesforce/` → `integrations/project-management/salesforce/`
- `integrations/e-commerce/` → `integrations/e-commerce/`

**Integrations Entities** (модели данных):
- `entities/backend/integration/` → `integrations/entities/integration/`

---

### 7. shared/ → backend/shared/ + frontend/shared/ + shared/

**Backend Shared** (переиспользуемая backend логика):
- `shared/backend/core/` → `backend/shared/core/`
  - Guards (GenericJwtGuard, ServiceAuthGuard) → `backend/shared/core/guards/`
  - Services (SessionManager, TokenCache, AuthClient) → `backend/shared/core/services/`
  - Utils (type-guards) → `backend/shared/core/utils/`
  - Adapters (Express, Fastify) → `backend/shared/core/adapters/`
  - Events → `backend/shared/core/events/`
- `shared/backend/api/` → `backend/shared/api/`
- `shared/backend/config/` → `backend/shared/config/`

**Frontend Shared** (переиспользуемая frontend логика):
- `shared/frontend/core/` → `frontend/shared/core/`
- `shared/frontend/api/` → `frontend/shared/api/`
- `shared/frontend/ui/` → `frontend/shared/ui/`

**Общий Shared** (переиспользуемая логика для обеих платформ):
- `shared/utils/` → `shared/utils/` (date, string, validation utils)
- `shared/src/exceptions/` → `shared/exceptions/` (общие исключения)
- `shared/src/filters/` → `shared/filters/` (общие фильтры)
- `shared/src/interceptors/` → `shared/interceptors/` (общие interceptors)
- `shared/src/lib/guards/` → `shared/guards/` (общие guards, если есть)
- `shared/src/types/` → `shared/types/` (общие типы)
- `shared/src/utils/` → `shared/utils/` (общие утилиты)

---

### 8. features/ → backend/domain/ (удалить features, использовать domain)

**Features были обертками над domain, удаляем:**
- `features/backend/auth/` → удалить (использовать `backend/domain/auth/`)
- `features/backend/pipelines/` → удалить (использовать `backend/domain/pipelines/`)
- `features/backend/rbac/` → удалить (использовать `backend/domain/rbac/`)

**Frontend Features** (если есть):
- `features/frontend/*` → `frontend/features/*`

---

## 📊 Итоговая структура

```
libs/
  backend/
    entities/
      domain/          # Domain entities (user, admin, pipeline, ab-test, trial, subscription)
      infrastructure/  # Infrastructure entities (api-key)
    domain/
      auth/            # Auth бизнес-логика
      rbac/            # RBAC бизнес-логика
      pipelines/      # Pipelines бизнес-логика
      workers/         # Workers бизнес-логика
      workflows/       # Workflows бизнес-логика
      webhooks/        # Webhooks бизнес-логика
      users/           # Users бизнес-логика
      admin/           # Admin бизнес-логика
      notifications/   # Notifications бизнес-логика
      ab-testing/      # A/B тестирование бизнес-логика
      billing/         # Биллинг бизнес-логика
    infrastructure/
      prisma/          # Prisma ORM
      database/        # Database утилиты
      i18n/            # Интернационализация
      message-broker/  # Message broker
      service-discovery/ # Service discovery
      notifications/   # Notification инфраструктура
      performance/     # Performance утилиты
      testing/         # Testing утилиты
      api-keys/        # API keys инфраструктура
    shared/
      core/            # Core переиспользуемая backend логика
        - guards/      # Guards (GenericJwtGuard, ServiceAuthGuard)
        - services/    # Services (SessionManager, TokenCache)
        - utils/       # Utils (type-guards)
        - adapters/    # Adapters (Express, Fastify)
        - events/      # Events
      api/             # Backend API клиент
      config/          # Backend конфигурация
      utilities/       # Технические утилиты
        - data-validation/
        - resilience/
        - file-storage/
        - batch-processing/
        - custom-scripts/

  frontend/
    entities/          # Frontend entities
      - user/
    features/          # Frontend features
      - auth/
      - pipelines/
    shared/            # Frontend shared
      - core/          # Frontend core (ApiClientService, I18nService)
      - api/           # Frontend API клиент
      - ui/            # UI компоненты (Angular)

  integrations/       # Интеграции (могут использоваться и в backend, и во frontend)
    core/             # Core интеграции
    cloud/            # Cloud интеграции
      - aws/
      - azure/
      - gcp/
    code/             # Code интеграции
      - github/
      - gitlab/
    communication/    # Communication интеграции
      - slack/
      - telegram/
    project-management/ # Project management интеграции
      - jira/
      - salesforce/
    e-commerce/       # E-commerce интеграции
      - marketplaces/
      - social-commerce/
      - video-commerce/
    ai/               # AI интеграции (провайдеры нейронных сетей и агентов)
      - providers/    # OpenAI, Anthropic, Groq, Stability, Runway, ElevenLabs, Tavily
      - interfaces/  # AI provider interfaces
    entities/         # Integration entities
      - integration/

  ai/                 # AI библиотеки (бизнес-логика, инфраструктура, entities)
    infrastructure/   # AI инфраструктура
      - repositories/ # AI репозитории
      - router/       # AI router
    domain/           # AI бизнес-логика
      - model-registry/
      - token-tracker/
      - prompt-manager/
      - generation/
      - ml-integration/
    entities/         # AI entities
      - ai-provider/
      - ai-model/
      - ai-execution-history/
      - ai-model-feedback/

  shared/             # Общая переиспользуемая логика для обеих платформ
    utils/            # Общие утилиты (date, string, validation)
    exceptions/       # Общие исключения
    filters/          # Общие фильтры
    interceptors/     # Общие interceptors
    guards/           # Общие guards (если есть)
    types/            # Общие типы
```

---

## ✅ Чек-лист миграции

### Этап 0: Реорганизация структуры
- [ ] Создать `libs/backend/`, `libs/frontend/`, `libs/shared/` черех nx
- [ ] Переместить все backend библиотеки черех nx по 1
- [ ] Переместить все frontend библиотеки черех nx по 1
- [ ] Обновить все импорты
- [ ] Обновить `tsconfig.base.json`
- [ ] Обновить все `project.json`

### Этап 1: Entities
- [ ] Переместить backend entities в `backend/entities/` черех nx по 1
- [ ] Переместить frontend entities в `frontend/entities/` (если есть) черех nx по 1

### Этап 2: Domain
- [ ] Переместить domain в `backend/domain/` черех nx по 1
- [ ] Перенести AI domain сервисы черех nx по 1
- [ ] Перенести Utilities domain сервисы черех nx по 1

### Этап 3: Infrastructure
- [ ] Переместить infrastructure в `backend/infrastructure/` черех nx по 1
- [ ] Перенести AI infrastructure черех nx по 1
- [ ] Перенести Integrations infrastructure черех nx по 1

### Этап 4: Shared
- [ ] Переместить shared/backend в `backend/shared/` черех nx по 1
- [ ] Переместить shared/frontend в `frontend/shared/` (если есть) черех nx по 1
- [ ] Перенести utilities в `backend/shared/utilities/` черех nx по 1
- [ ] Реорганизовать services в подпапки

### Этап 5: Features
- [ ] Удалить backend features (использовать domain)
- [ ] Переместить frontend features в `frontend/features/` (если есть) черех nx по 1

### Этап 6: Проверка
- [ ] Проверить компиляцию всех проектов
- [ ] Проверить работу всех сервисов
- [ ] Обновить документацию
