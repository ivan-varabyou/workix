# План миграции libs/ai

## 📊 Анализ текущей структуры

### libs/ai/ai-core
- **Интерфейсы**: `AIProviderEntity`, `AIModelEntity`, `AIExecutionHistory`, `AIModelFeedback`
- **Сервисы**: `ModelRegistry`, `TokenTracker`, `PromptManager`
- **Провайдеры**: `OpenAIProvider`, `AnthropicProvider`, `GroqProvider`, и др.
- **Репозитории**: `AIExecutionRepository`
- **Router**: `AIRouter`

### libs/ai/generation
- **Сервисы**: `TextGenerationService`, `ImageGenerationService`, `VideoGenerationService`, `SpeechGenerationService`, `TranslationService`, `VisionAnalysisService`, `SearchService`, `EmbeddingService`, `ContextGenerationService`, `GenerationQueueService`, `GenerationCacheService`, `QualityScoringService`
- **Интерфейсы**: `Generation.interface.ts`

### libs/ai/ml-integration
- **Сервисы**: `MLIntegrationService`
- **Интерфейсы**: `MLIntegration.interface.ts`

## ✅ Уже перенесено

- ✅ `AIProviderEntity` → `libs/entities/backend/ai-provider`
- ✅ `AIModelEntity` → `libs/entities/backend/ai-model`

## 🎯 Что нужно перенести

### 1. Entities (модели данных с бизнес-логикой)

#### 1.1. AI Execution History Entity
**Источник**: `libs/ai/ai-core/src/interfaces/ai-prisma.interface.ts` → `AIExecutionHistory`
**Куда**: `libs/entities/backend/ai-execution-history`
**Причина**: Модель данных с бизнес-логикой (расчет стоимости, анализ производительности)

#### 1.2. AI Model Feedback Entity
**Источник**: `libs/ai/ai-core/src/interfaces/ai-prisma.interface.ts` → `AIModelFeedback`
**Куда**: `libs/entities/backend/ai-model-feedback`
**Причина**: Модель данных с бизнес-логикой (рейтинг, обратная связь)

### 2. Features (сервисы, использующие entities и domain services)

#### 2.1. AI Model Registry Feature
**Источник**: `libs/ai/ai-core/src/services/model-registry.service.ts` → `ModelRegistry`
**Куда**: `libs/features/backend/ai-model-registry`
**Причина**: Сервис управления моделями и провайдерами, использует entities

#### 2.2. AI Generation Features
**Источник**: `libs/ai/generation/src/services/*.service.ts`
**Куда**: `libs/features/backend/ai-generation`
**Сервисы**:
- `TextGenerationService`
- `ImageGenerationService`
- `VideoGenerationService`
- `SpeechGenerationService`
- `TranslationService`
- `VisionAnalysisService`
- `SearchService`
- `EmbeddingService`
- `ContextGenerationService`
- `GenerationQueueService`
- `GenerationCacheService`
- `QualityScoringService`
**Причина**: Сервисы генерации контента, используют entities и domain services

#### 2.3. AI Token Tracker Feature
**Источник**: `libs/ai/ai-core/src/services/token-tracker.service.ts`
**Куда**: `libs/features/backend/ai-token-tracker`
**Причина**: Сервис отслеживания токенов, использует entities

#### 2.4. AI Prompt Manager Feature
**Источник**: `libs/ai/ai-core/src/services/prompt-manager.service.ts`
**Куда**: `libs/features/backend/ai-prompt-manager`
**Причина**: Сервис управления промптами, использует entities

#### 2.5. ML Integration Feature
**Источник**: `libs/ai/ml-integration/src/services/ml-integration.service.ts`
**Куда**: `libs/features/backend/ml-integration`
**Причина**: Сервис ML интеграции, использует entities

## ❌ Что НЕ нужно переносить (оставить в libs/ai)

### 1. Провайдеры (Infrastructure)
**Остается**: `libs/ai/ai-core/src/providers/*.provider.ts`
**Причина**: Это инфраструктурный слой (интеграции с внешними API)

### 2. Репозитории (Infrastructure)
**Остается**: `libs/ai/ai-core/src/repositories/ai-execution.repository.ts`
**Причина**: Это инфраструктурный слой (работа с БД через Prisma)

### 3. Router (Infrastructure)
**Остается**: `libs/ai/ai-core/src/router/ai.router.ts`
**Причина**: Это инфраструктурный слой (маршрутизация запросов)

### 4. Интерфейсы провайдеров (Infrastructure)
**Остается**: `libs/ai/ai-core/src/interfaces/ai-provider.interface.ts`
**Причина**: Это интерфейсы для инфраструктурного слоя

### 5. Prisma интерфейсы (Infrastructure)
**Остается**: `libs/ai/ai-core/src/interfaces/ai-prisma.interface.ts` (частично)
**Причина**: Это интерфейсы для работы с Prisma, используются репозиториями

## 📋 План миграции (пошагово)

### Этап 1: Entities
1. ✅ `AIProviderEntity` - уже перенесено
2. ✅ `AIModelEntity` - уже перенесено
3. ⏳ `AIExecutionHistoryEntity` → `libs/entities/backend/ai-execution-history`
4. ⏳ `AIModelFeedbackEntity` → `libs/entities/backend/ai-model-feedback`

### Этап 2: Features
1. ⏳ `ModelRegistry` → `libs/features/backend/ai-model-registry`
2. ⏳ `TokenTracker` → `libs/features/backend/ai-token-tracker`
3. ⏳ `PromptManager` → `libs/features/backend/ai-prompt-manager`
4. ⏳ `Generation Services` → `libs/features/backend/ai-generation`
5. ⏳ `MLIntegrationService` → `libs/features/backend/ml-integration`

### Этап 3: Обновление импортов
1. Обновить импорты в `apps/*` для использования новых путей
2. Обновить импорты в других `libs/*` для использования новых путей
3. Удалить старые экспорты из `libs/ai/*/src/index.ts`

## 🔍 Детальный анализ каждого компонента

### AIExecutionHistory → Entity
**Поля**: `id`, `requestId`, `providerId`, `modelId`, `success`, `responseTimeMs`, `cost`, `userRating`, `feedback`, `timestamp`, `metadata`
**Бизнес-логика**:
- Расчет стоимости использования
- Анализ производительности
- Проверка успешности выполнения

### AIModelFeedback → Entity
**Поля**: `id`, `modelId`, `providerId`, `rating`, `feedback`, `createdAt`
**Бизнес-логика**:
- Валидация рейтинга
- Обработка обратной связи

### ModelRegistry → Feature
**Зависимости**: `AIProviderEntity`, `AIModelEntity`, `ModelRegistryPrismaService`
**Функционал**: Управление моделями и провайдерами, кэширование, инициализация

### Generation Services → Feature
**Зависимости**: `AIRouter`, `AIExecutionRepository`, entities
**Функционал**: Генерация контента различных типов

## ⚠️ Важные замечания

1. **Провайдеры остаются в ai-core** - это инфраструктурный слой
2. **Репозитории остаются в ai-core** - это инфраструктурный слой
3. **Router остается в ai-core** - это инфраструктурный слой
4. **Features используют entities** - нужно обновить импорты
5. **Features используют domain services** - нужно проверить зависимости

## ✅ Итоговое решение

**НУЖНО ПЕРЕНЕСТИ**:
- ✅ 2 Entities (AIExecutionHistory, AIModelFeedback)
- ✅ 5 Feature Services (ModelRegistry, TokenTracker, PromptManager, Generation Services, MLIntegration)

**НЕ НУЖНО ПЕРЕНЕСТИ**:
- ❌ Провайдеры (Infrastructure)
- ❌ Репозитории (Infrastructure)
- ❌ Router (Infrastructure)
- ❌ Prisma интерфейсы (Infrastructure)
