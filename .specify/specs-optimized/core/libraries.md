# Libraries Structure

**Version**: 3.1
**Last Updated**: 2025-11-27

## Overview

All business logic in `libs/`. Apps only connect modules from libs.

**New Structure**: Libraries organized by platform (`backend/`, `frontend/`) and purpose (`domain/`, `infrastructure/`, `entities/`, `shared/`, `integrations/`).

## Critical Rule

**🔴 CRITICAL: All implementation ONLY in libs!**
**❌ NEVER implementation in apps!**
**✅ apps/ - ONLY connection from libs + app-specific logic**

## Library Organization

```
libs/
├── backend/              # Backend-specific libraries
│   ├── domain/          # Business logic
│   ├── entities/       # Data models with business logic
│   ├── infrastructure/   # Infrastructure layer
│   ├── integrations/    # External service integrations
│   └── shared/         # Backend shared utilities
├── frontend/            # Frontend-specific libraries
│   ├── entities/       # Frontend data models
│   ├── features/       # Frontend features
│   └── shared/         # Frontend shared libraries
└── shared/              # Platform-agnostic shared libraries
    └── utils/           # Common utilities
```

## Backend Domain Libraries (`libs/backend/domain/`)

Business logic libraries - no framework dependencies.

### auth
- Services: AuthService, JwtService, PasswordService, TwoFactorService
- OAuth2: Google, GitHub, Apple strategies
- Phone OTP: SMS verification
- Email verification
- Guards: JwtGuard
- Decorators: CurrentUser, Public
- DTOs: Register, Login, PasswordReset, etc.

### users
- Services: UserProfileService, AvatarService
- DTOs: UserProfile, Avatar
- Interfaces: User, File

### pipelines
- Services: PipelineService, ExecutionService, PipelineExecutorService
- DTOs: CreatePipeline, UpdatePipeline
- Types: PipelineGraph

### rbac
- Services: RoleService, PermissionService, RbacService
- Guards: RoleGuard
- Decorators: Roles, HasPermission
- DTOs: CreateRole, CreatePermission, AssignRole

### webhooks
- Services: WebhookService
- Controllers: WebhookController
- Interfaces: Webhook, WebhookDTO

### workflows
- Services: WorkflowService
- Controllers: WorkflowController
- Interfaces: Workflow

### workers
- Services: WorkerService
- Interfaces: Worker, WorkerConfig

### admin
- Services: AdminAuthService, AdminService
- Guards: AdminJwtGuard
- DTOs: AdminLogin, AdminRegister

### notifications
- Services: NotificationService
- Processors: EmailProcessor, PushProcessor
- DTOs: NotificationDto

### ab-testing
- Services: ABTestService
- Interfaces: ABTest, ABTestResult

### billing
- Services: SubscriptionService, TrialService
- Interfaces: Subscription, Trial

### ai
- Services: AI generation services (text, image, video, speech, etc.)
- Interfaces: AI provider interfaces
- Model registry, prompt manager, token tracker

## Backend Entities (`libs/backend/entities/`)

Data models with business logic, organized by domain and infrastructure.

### Domain Entities (`libs/backend/entities/domain/`)
- **user/**: UserEntity
- **admin/**: AdminEntity
- **pipeline/**: PipelineEntity
- **role/**: RoleEntity
- **worker/**: WorkerEntity
- **ab-test/**: ABTestEntity
- **trial/**: TrialEntity
- **subscription/**: SubscriptionEntity
- **pipelines/**: ExecutionEntity, StepEntity
- **rbac/**: PermissionEntity, UserRoleEntity
- **auth/**: EmailVerificationEntity, PhoneOtpEntity, SocialAccountEntity
- **ai/**: AIExecutionEntity, AIModelEntity, AIProviderEntity

### Infrastructure Entities (`libs/backend/entities/infrastructure/`)
- **api-key/**: ApiKeyEntity
- **integrations/**: IntegrationProviderEntity, IntegrationEventEntity

## Backend Infrastructure Libraries (`libs/backend/infrastructure/`)

Framework integrations and shared infrastructure.

### database
- Services: MigrationService, SeederService, AuditService
- Config: TypeORM config, DatabaseModule
- Entities: Database entities

### prisma
- Services: PrismaService
- Module: PrismaModule
- Interfaces: DatabaseAdapter, DatabaseInterface
- Helpers: Prisma JSON helpers

### message-broker
- Module: MessageBrokerModule
- Queue names: QueueNames constants
- Redis/Bull integration

### i18n
- Services: I18nService
- Module: I18nModule
- Locales: en, ru, ar translations
- Interfaces: I18nConfig

### notifications
- Services: EmailNotificationService, PushNotificationService
- Module: NotificationsModule
- Interfaces: Email, PushSubscription

### api-keys
- Services: ApiKeyService
- Controllers: ApiKeyController
- Guards: ApiKeyGuard
- Decorators: RequirePermission

### testing
- E2E testing spec
- Integration testing spec
- Unit testing spec

### service-discovery
- Services: ServiceLocatorService, ServiceRegistryService
- Interfaces: ServiceDiscovery

### performance
- Services: CacheService, CDNService, DatabaseOptimizerService, LoadTestingService
- Interfaces: Cache, LoadTesting

### ai
- Router: AIRouter with weighted selection, failover, A/B testing
- Repositories: Metrics repository
- AI provider infrastructure

## Backend Integrations (`libs/backend/integrations/`)

External service integrations.

### cloud
- **aws**: AWS services integration
- **azure**: Azure services integration
- **gcp**: GCP services integration

### code
- **github**: GitHub API integration
- **gitlab**: GitLab API integration

### communication
- **slack**: Slack integration
- **telegram**: Telegram integration

### e-commerce
- **marketplaces**: Marketplace integrations (Amazon, eBay, Ozon, Wildberries)
- **shared**: Shared e-commerce utilities
- **social-commerce**: Social commerce platforms (Instagram, TikTok)
- **video-commerce**: Video commerce platforms (YouTube)

### project-management
- **jira**: Jira integration
- **salesforce**: Salesforce integration

### core
- **integration-core**: Universal integration abstraction
- Services: CryptoService
- Interfaces: Integration interfaces

### ai
- **providers/**: AI provider integrations (OpenAI, Groq, Anthropic, Stability AI, Runway, ElevenLabs, Tavily)

## Backend Shared Libraries (`libs/backend/shared/`)

Backend-specific shared utilities and core functionality.

### core
- Guards: ServiceAuthGuard, GenericJwtGuard
- Services: SessionManagerService, TokenCacheService, PubSubPublisherService, PubSubSubscriberService
- Types: HttpRequest, HttpResponse, HttpNextFunction
- Utils: Express adapters, type guards
- Exceptions: AppException, ResourceNotFoundException
- Filters: HttpExceptionFilter
- Interceptors: LoggingInterceptor

### utilities
- **batch-processing/**: Batch processing utilities
- **custom-scripts/**: Custom script utilities
- **data-validation/**: Data validation utilities
- **file-storage/**: File storage utilities
- **resilience/**: Resilience utilities (circuit breaker, retry)

## Frontend Libraries (`libs/frontend/`)

Frontend-specific libraries.

### entities (`libs/frontend/entities/`)
- Frontend data models (to be populated)

### features (`libs/frontend/features/`)
- Frontend features (to be populated)

### shared (`libs/frontend/shared/`)
- **core/**: Frontend core services (ApiClientService, I18nService)
- **api/**: Frontend API client
- **ui/**: UI components (Button, Card, Input, Modal, Table, etc.)

## Shared Libraries (`libs/shared/`)

Platform-agnostic shared libraries.

### utils
- Date utilities
- String utilities
- Validation utilities

## Migration Notes

**Changed from previous structure:**
- `libs/domain/` → `libs/backend/domain/`
- `libs/infrastructure/` → `libs/backend/infrastructure/`
- `libs/shared/backend/` → `libs/backend/shared/`
- `libs/shared/frontend/` → `libs/frontend/shared/`
- `libs/integrations/` → `libs/backend/integrations/`
- `libs/ai/` → integrated into `libs/backend/domain/ai/` and `libs/backend/infrastructure/ai/`
- `libs/utilities/` → `libs/backend/shared/utilities/`
- Added `libs/backend/entities/` and `libs/frontend/entities/`

## Rules

1. **All business logic in libs/**
2. **Apps only connect libs**
3. **No business logic in apps**
4. **Use dependency injection**
5. **Test coverage: 85%+ for shared libraries**
6. **Backend/Frontend separation**: Clear separation between backend and frontend libraries

## Related

- [Architecture](./architecture.md)
- [Development Process](./development.md)
