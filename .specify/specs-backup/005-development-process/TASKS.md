# 📋 Список задач разработки Workix

**Связанные fileы**:

- [INDEX.md](../INDEX.md) - Главный индекс спецификаций
- [spec.md](./spec.md) - Основной process разработки
- [INTERMEDIATE_TASKS.md](./INTERMEDIATE_TASKS.md) - Промежуточные задачи (чек-лист)
- [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) - Правила разработки
- [HISTORY_TRACKING.md](./HISTORY_TRACKING.md) - История разработки
- [../010-automation-mode/automation-rules.md](../010-automation-mode/automation-rules.md) - Правила автоматизации

## 🎯 Статусы

| Статус | Код      | Описание            |
| ------ | -------- | ------------------- |
| ⭕     | pending  | Ожидает начала      |
| 🟡     | in_prep  | В underготовке ТЗ     |
| ⏳     | awaiting | Ожидает утверждения |
| 🔨     | working  | В разработке        |
| ✅     | done     | Завершена           |

## 📂 Категории задач

| Категория                  | Описание               | Задачи                                       |
| -------------------------- | ---------------------- | -------------------------------------------- |
| 🤖 **Automation**          | Инфраstructure & CI/CD | DB Migrations, Pre-commit, MCP Tools, Config |
| 🔐 **Auth Extensions**     | OAuth2, OTP, Email     | T-002a, T-002b, T-002c, T-002                |
| 📦 **Pipeline Foundation** | Модель & CRUD          | T-003, T-004, T-005, T-006                   |
| 🚀 **Pipeline Advanced**   | Execution & Audit      | T-007, T-008                                 |
| ⚙️ **Optimization**        | Error & Observability  | T-009, T-010                                 |

## 📊 Таблица задач

| #     | Название                   | Описание                                                   | Статус     | История        | Est Time | Actual        | Комментарий                                                  |
| ----- | -------------------------- | ---------------------------------------------------------- | ---------- | -------------- | -------- | ------------- | ------------------------------------------------------------ |
| A-001 | db-migrations              | Database: migrations + seeds + runner                      | ✅ done    | TASK_DB_001.md | ~20m     | **~30m** ⚡   | ✅ 5 migrations + 2 integration tests                        |
| A-002 | pre-commit-hooks           | Husky: commit hooks + linting + coverage                   | ✅ done    | —              | ~30m     | **~15m** ⚡   | ✅ Husky configured, pre-commit работает                       |
| A-003 | mcp-tools-registry         | MCP: register all tools for Cursor                         | ✅ done    | —              | ~45m     | **~30m** ⚡   | ✅ 24/24 tools реализованы (100%)                            |
| A-004 | env-config-setup           | Environment: OAuth, Twilio, SendGrid config                | ✅ done    | —              | ~25m     | **~10m** ⚡   | ✅ .env.example создан                                       |
| A-005 | refactor-to-libs           | Refactoring: переместить логику в libs                     | ⭕ pending | —              | ~3-4h    | —             | 🏗️ Architecture: Вся логика в libs, apps только контроллеры  |
| A-006 | create-api-shared          | Создать libs/api-shared for общей логики API               | ⭕ pending | —              | ~1-2h    | —             | 🏗️ Architecture: Общие DTOs, Guards, Interceptors            |
| A-007 | create-monolith-api        | Создать apps/api how монолит со allми модулями             | ⭕ pending | —              | ~2-3h    | —             | 🏗️ Architecture: Единый API service с allми контроллерами     |
| A-008 | unified-database           | Создать единую Prisma schema for монолита                  | ⭕ pending | —              | ~1-2h    | —             | 🏗️ Architecture: Единая БД workix_main for монолита          |
| A-009 | update-api-gateway         | Обновить API Gateway for работы с монолитом                | ⭕ pending | —              | ~1h      | —             | 🏗️ Architecture: Маршрутизация к монолиту                    |
| A-010 | message-broker-setup       | Настроить Message Broker (Redis/RabbitMQ)                  | ⭕ pending | —              | ~2-3h    | —             | 🏗️ Architecture: Опциональный Message Broker for async задач |
| 1     | create-user-auth           | Auth Microservice: регистрация + вход (JWT)                | ✅ done    | TASK_001.md    | ~2h      | **~0.5h** ⚡  | 21 fileов, 6 endpoints, 82 tests passing - 4x faster!       |
| 2a    | oauth2-social-login        | OAuth2: Google, Apple, GitHub                              | ✅ done    | TASK_002a.md   | ~1-1.5h  | **~0.97h** ⚡ | 3 providers, 10 tests passing, account linking               |
| 2b    | phone-otp-auth             | Phone OTP Authentication                                   | ✅ done    | TASK_002b.md   | ~45m-1h  | **~1.03h** ⚡ | SMS OTP, rate limiting, auto-registration, 8 tests           |
| 2c    | email-verification         | Email Verification Flow                                    | ✅ done    | TASK_002c.md   | ~45m-1h  | **~1.01h** ⚡ | Email verification, resend, cooldown, 8 tests                |
| 2     | user-profile               | User Service: профиль (get, update, avatar)                | ✅ done    | TASK_002.md    | ~1-1.5h  | **~1.05h** ⚡ | Port 5001, avatar, preferences, CRUD, 8 tests                |
| 3     | role-based-access          | RBAC - роли и права доступа                                | ✅ done    | TASK_003.md    | ~40m     | **~25m** ⚡   | 4 roles, 13 permissions, role hierarchy, guards              |
| 4     | pipeline-entity            | Создать сущность Pipeline (workflow)                       | ✅ done    | TASK_004.md    | ~45m-1h  | **~20m** ⚡   | Graph model, config, migration, indexes                      |
| 5     | pipeline-crud              | CRUD операции for Pipeline                                 | ✅ done    | TASK_005.md    | ~1-1.5h  | **~18m** ⚡   | 15 methods, filters, templates, marketplace                  |
| 6     | step-entity                | Создать Step (шаг в pipeline)                              | ✅ done    | TASK_006.md    | ~30m     | **~12m** ⚡   | Step entity, migration, relationships                        |
| 7     | pipeline-execution         | Выполнение pipeline                                        | ✅ done    | TASK_007.md    | ~1.5-2h  | **~15m** ⚡⚡ | Execution engine, state management                           |
| 8     | audit-logging              | Аудит logging действий                                 | ✅ done    | TASK_008.md    | ~45m-1h  | **~10m** ⚡⚡ | AuditLog entity, AuditService                                |
| 9     | error-handling             | Централизованная обработка ошибок                          | ✅ done    | TASK_009.md    | ~30-45m  | **~8m** ⚡⚡  | Global exception filter, custom exceptions                   |
| 10    | observability              | Логирование, metrics, трейсинг                             | ✅ done    | TASK_010.md    | ~1-1.5h  | **~10m** ⚡⚡ | Logging interceptor, structured logger                       |
| 10a   | refactor-auth-to-libs      | Refactoring: переместить Auth логику в libs/auth           | ⭕ pending | —              | ~1-2h    | —             | 🏗️ Architecture: AuthService, JwtService, OAuth2 в libs      |
| 10b   | refactor-users-to-libs     | Refactoring: переместить Users логику в libs/users         | ⭕ pending | —              | ~1h      | —             | 🏗️ Architecture: UserProfileService в libs                   |
| 10c   | refactor-pipelines-to-libs | Refactoring: переместить Pipelines логику в libs/pipelines | ⭕ pending | —              | ~1h      | —             | 🏗️ Architecture: PipelineService, ExecutionService в libs    |
| 10d   | refactor-rbac-to-libs      | Refactoring: переместить RBAC логику в libs/rbac           | ⭕ pending | —              | ~1h      | —             | 🏗️ Architecture: RoleService, PermissionService в libs       |

## 🚀 РАСШИРЕННЫЕ BACKEND ЗАДАЧИ (Universal API + AI Workers)

Следующая волна - 25 задач for универсальной интеграции с любыми API + AI workers!

| #   | Название                 | Описание                                            | Статус     | История | Est   | Комментарий                                                |
| --- | ------------------------ | --------------------------------------------------- | ---------- | ------- | ----- | ---------------------------------------------------------- |
| 101 | multi-tenant-arch        | Multi-tenant: DB strategy, tenant isolation         | ⭕ pending | —       | ~2h   | 🏗️ Core: Гибкое хранилище for разных clientов              |
| 102 | api-integration-fw       | API Framework: adapter pattern for любых API        | ⭕ pending | —       | ~2.5h | 🔌 Core: YouTube, Ozon, eBay и другие                      |
| 103 | schema-registry          | Flexible schema registry for динамических сущностей | ⭕ pending | —       | ~1.5h | 📋 Core: JSON Schema validation                            |
| 104 | event-webhook-sys        | Event system & webhooks for real-time sync          | ⭕ pending | —       | ~1.5h | 📡 Core: Real-time data updates                            |
| 105 | oauth-creds-mgmt         | OAuth2 & API Keys management + encryption           | ⭕ pending | —       | ~1h   | 🔐 Core: Secure credential storage                         |
| 106 | data-transformer         | Transform YouTube/Ozon/eBay data to generic format  | ⭕ pending | —       | ~2h   | 🔄 Data: Normalize all API responses                       |
| 107 | data-sync-pipeline       | Data ingestion & incremental sync engine            | ⭕ pending | —       | ~2h   | 📥 Data: Pull & push data from APIs                        |
| 108 | analytics-collection     | Metrics collection for A/B testing                  | ⭕ pending | —       | ~1.5h | 📊 Data: Collect performance metrics                       |
| 109 | export-reporting-api     | Data export (CSV/JSON/Excel) + reports              | ⭕ pending | —       | ~1h   | 📤 Data: Export for анализа                                |
| 110 | pipeline-graph-model     | Advanced pipeline graph с промпthereи + nodes         | ⭕ pending | —       | ~2h   | 📐 Pipeline: DataSource, Transform, Worker, Decision nodes |
| 111 | advanced-executor        | Pipeline executor с LLM prompts & workers           | ⭕ pending | —       | ~2.5h | ⚙️ Pipeline: Execute complex workflows                     |
| 112 | worker-framework         | Base worker framework & registry                    | ⭕ pending | —       | ~2h   | 🤖 Workers: Plugin system for AI agents                    |
| 113 | prompt-manager           | Prompt templates + variable binding                 | ⭕ pending | —       | ~1.5h | 📝 Workers: Render prompts for LLM                         |
| 114 | ab-testing-fw            | A/B testing framework + statistics                  | ⭕ pending | —       | ~2h   | 🧪 Testing: Variant comparison & analysis                  |
| 115 | worker-templates         | Domain templates: Content, E-commerce, Support      | ⭕ pending | —       | ~1h   | 🏭 Workers: Pre-built worker templates                     |
| 116 | token-system             | Token ledger + cost calculator                      | ⭕ pending | —       | ~2h   | 💰 Billing: Usage tracking system                          |
| 117 | billing-subscription     | Subscription management + Stripe integration        | ⭕ pending | —       | ~2.5h | 💳 Billing: Payment processing                             |
| 118 | usage-tracking-metrics   | Detailed usage tracking + quotas                    | ⭕ pending | —       | ~1.5h | 📈 Billing: Daily/monthly limits                           |
| 119 | freemium-trial           | Trial system + upgrade flow                         | ⭕ pending | —       | ~1.5h | 🎁 Billing: 14-day free trial                              |
| 120 | telegram-bot-integration | Telegram: semi-automatic approvals                  | ⭕ pending | —       | ~2h   | 📱 Integration: User approval via Telegram                 |
| 121 | slack-integration        | Slack: notifications + approvals                    | ⭕ pending | —       | ~1.5h | 💬 Integration: Slack bot                                  |
| 122 | email-notifications      | Email alerts + digest reports                       | ⭕ pending | —       | ~1h   | 📧 Integration: Email notifications                        |
| 123 | admin-api-management     | Admin API management + adapter builder              | ⭕ pending | —       | ~1.5h | 🛠️ Admin: Create new API integrations                      |
| 124 | worker-management-ui     | Worker editor + testing + deployment                | ⭕ pending | —       | ~1.5h | 🎮 Admin: Manage workers                                   |
| 125 | monitoring-alerting      | Health checks + error alerts + monitoring           | ⭕ pending | —       | ~1.5h | 🔔 Admin: System monitoring                                |

## 🤖 ФАЗА AI WORKERS: Conversational Builder + Multi-Model + Marketplace

Система for создания, управления и whenменения AI Workers via интерактивный чат.

| #   | Название              | Описание                               | Статус     | История | Est   | Комментарий                           |
| --- | --------------------- | -------------------------------------- | ---------- | ------- | ----- | ------------------------------------- |
| 301 | llm-model-abstraction | LLM Abstraction: GPT-4, Claude, Ollama | ⭕ pending | —       | ~2h   | 🧠 AI: Route по cost/latency/accuracy |
| 302 | conversational-agent  | Multi-turn conversational agent        | ⭕ pending | —       | ~2.5h | 💬 AI: Не теряет контекст в диалоге   |
| 303 | worker-builder-engine | Guided worker creation via chat        | ⭕ pending | —       | ~2h   | 🏗️ AI: No-code worker creation        |
| 304 | worker-context-memory | RAG + Knowledge base for context       | ⭕ pending | —       | ~1.5h | 📚 AI: Система памяти + знания        |
| 305 | worker-marketplace    | Discovery + Rating + Deployment        | ⭕ pending | —       | ~1.5h | 🛒 AI: Worker marketplace             |
| 306 | avatar-generation     | AI-generated avatars for workers       | ⭕ pending | —       | ~1h   | 🎨 AI: Virtual worker faces           |
| 307 | chat-ui-backend       | Chat API backend                       | ⭕ pending | —       | ~1.5h | 🔌 UI: Chat interface API             |
| 308 | admin-panel-workers   | Admin panel for worker management      | ⭕ pending | —       | ~1.5h | 🛠️ Admin: Worker moderation           |
| 309 | i18n-framework        | i18n support: EN, RU, AR ready         | ⭕ pending | —       | ~1h   | 🌐 i18n: Multi-language framework     |
| 310 | rtl-support-arabic    | RTL layout support for Arabic          | ⭕ pending | —       | ~45m  | 📝 i18n: Right-to-left support        |
| 311 | prompt-localization   | Разные prompts for разных языков       | ⭕ pending | —       | ~1h   | 📦 i18n: Language-specific prompts    |

## 📝 Как добавить новую задачу

1. Добавь строку в таблицу higher
2. Заполни all поля
3. Статус начинается с ⭕ pending

## 🔄 Цикл выполнения задачи

```
⭕ PENDING
    ↓
🟡 IN_PREPARATION (создается history/TASK_XXX.md с ТЗ)
    ↓
⏳ AWAITING_APPROVAL (ТЗ отправлено на одобрение)
    ↓
🔨 WORKING (разработка, тесты, checks)
    ↓
✅ DONE (завершена и закоммичена)
```

## 📂 Структура истории

Когда начинаешь работать over задачей:

```
.specify/specs/005-development-process/history/
├── TASK_001.md   (User Auth)
├── TASK_002.md   (User Profile)
└── TASK_XXX.md   (Новая задача)
```

Каждый file содержит:

- 📝 Техническое задание
- ✅ Чек-лист выполнения
- 📊 Что было сделано
- 🧪 Результаты тестов
- 🔗 Коммит

## 🚀 Команды for управления

```bash
# Посмотреть текущие задачи
cat .specify/specs/005-development-process/TASKS.md

# Создать историю новой задачи
touch .specify/specs/005-development-process/history/TASK_001.md

# Редактировать задачу
nano .specify/specs/005-development-process/TASKS.md

# Посмотреть завершенные
grep "✅" .specify/specs/005-development-process/TASKS.md
```

## 📈 Меthreeки

### 📊 Статистика projectа

| Меthreeка          | Значение     |
| ---------------- | ------------ |
| **Всего задач**  | 13           |
| **Завершено**    | 1 (7.7%) ✅  |
| **В underготовке** | 2 (15.4%) 🟡 |
| **В работе**     | 0 (0%)       |
| **Ожидает**      | 10 (76.9%)   |

### ⏱️ Временная statistics

| Меthreeка                       | Значение     |
| ----------------------------- | ------------ |
| **Всего часов потрачено**     | **~0.5h** ✅ |
| **Эстимация на оставшиеся**   | **~4.5-6h**  |
| **Эстимация на ВСЕ 13 задач** | **~5-6.5h**  |
| **Файлов создано**            | 21           |
| **Тестов написано**           | 82           |
| **Commits**                   | 36           |

### 📈 Статистика по задачам

- **T-001**: ✅ DONE (0.5h) - Auth Microservice
- **T-002a**: 🟡 PREP (~1-1.5h est)
- **T-002b**: ⭕ PENDING (~45m-1h est)
- **T-002c**: ⭕ PENDING (~45m-1h est)
- **T-002**: 🟡 PREP (~1-1.5h est)
- **T-003...T-010**: ⭕ PENDING (~2-3h est)

---

**Обновлено**: 2025-11-06
**Версия**: 1.0
