/**
 * Libraries Structure Resource
 *
 * Provides information about libs/ directory structure and organization
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { MCPResource } from '../types.js';

export function getLibsStructureResource(): MCPResource {
  return {
    uri: 'workix://libs-structure',
    name: 'Libraries Structure',
    description: 'Workix libs/ directory structure, organization, and shared libraries',
    mimeType: 'text/markdown',
    getContent: async () => {
      try {
        // Use optimized specs
        const libsSpecPath = join(process.cwd(), '.specify/specs-optimized/core/libraries.md');
        const libsSpec = readFileSync(libsSpecPath, 'utf-8');

        // Добавляем информацию о реальной структуре libs/
        const realStructure = `
# 📚 Workix Libraries Structure

## 🎯 КРИТИЧЕСКОЕ ПРАВИЛО: ВСЯ РЕАЛИЗАЦИЯ ТОЛЬКО В LIBS!

**🔴 CRITICAL RULE: Вся реализация ТОЛЬКО в libs!**
**❌ НИКОГДА реализация в apps!**
**✅ apps/ - ТОЛЬКО подключение из libs + проектно-специфичная логика**

## 📁 Структура libs/

\`\`\`
libs/
├── domain/                          # 🏢 Доменные библиотеки (бизнес-логика)
│   ├── auth/                        # ✅ Аутентификация
│   │   ├── services/                # AuthService, JwtService, PasswordService
│   │   ├── oauth2/                  # OAuth2 логика
│   │   ├── phone-otp/               # Phone OTP логика
│   │   ├── email-verification/      # Email verification логика
│   │   ├── guards/                  # JwtGuard
│   │   ├── decorators/              # CurrentUser, Public
│   │   └── dto/                     # All DTOs
│   ├── users/                       # ✅ Пользователи
│   │   ├── services/                # UserProfileService
│   │   └── dto/                     # User DTOs
│   ├── pipelines/                   # ✅ Пайплайны
│   │   ├── services/                # PipelineService, ExecutionService
│   │   └── entities/                 # Pipeline entities
│   ├── rbac/                        # ✅ Роли и права
│   │   ├── services/                # RoleService, PermissionService
│   │   └── guards/                  # RBAC guards
│   ├── webhooks/                    # Webhooks
│   ├── workflows/                   # Workflows
│   └── workers/                     # Workers
│
├── infrastructure/                  # 🔧 Инфраструктурные библиотеки
│   ├── database/                    # База данных
│   ├── prisma/                      # Prisma клиент
│   ├── message-broker/              # Message broker (Redis/Bull)
│   ├── i18n/                        # Интернационализация
│   ├── notifications/               # Уведомления
│   ├── api-keys/                    # API ключи
│   ├── testing/                     # Тестовые утилиты
│   ├── service-discovery/           # Service discovery
│   └── performance/                 # Производительность
│
├── integrations/                    # 🔌 Интеграции с внешними сервисами
│   ├── cloud/                       # Облачные провайдеры (AWS, Azure, GCP)
│   ├── code/                        # Системы контроля версий (GitHub, GitLab)
│   ├── communication/               # Коммуникации (Slack, Telegram)
│   ├── project-management/          # Управление проектами (Jira, Salesforce)
│   ├── e-commerce/                  # E-commerce платформы (Amazon, eBay, Ozon, etc.)
│   └── core/                        # Ядро интеграций
│
├── ai/                              # 🤖 AI библиотеки
│   ├── ai-core/                     # Ядро AI
│   ├── generation/                   # Генерация контента
│   └── ml-integration/              # Machine Learning
│
├── shared/                          # 📚 Общие библиотеки
│   ├── frontend/
│   │   ├── ui/                      # UI компоненты (PrimeNG абстракция)
│   │   │   └── components/          # WorkixButton, WorkixCard, etc.
│   │   └── core/                    # Frontend core (ApiClientService, I18nService)
│   └── backend/
│       └── core/                    # Backend core (guards, exceptions, filters)
│
└── utilities/                       # 🛠️ Утилиты
    ├── ab-testing/                  # A/B тестирование
    ├── billing/                     # Биллинг
    ├── batch-processing/            # Пакетная обработка
    ├── custom-scripts/              # Кастомные скрипты
    ├── data-validation/             # Валидация данных
    ├── file-storage/                # Хранение файлов
    └── resilience/                  # Отказоустойчивость
\`\`\`

## 🔴 Правила использования libs/

### 1. ВСЯ РЕАЛИЗАЦИЯ В LIBS

**libs/** - это библиотеки с полной реализацией:
- ✅ Services (вся бизнес-логика)
- ✅ Repositories (data access)
- ✅ Entities (models)
- ✅ DTOs (validation)
- ✅ Guards (security)
- ✅ Strategies (Passport)
- ✅ Decorators (custom)
- ✅ Interfaces (contracts)
- ✅ Interceptors, Filters, Pipes
- ✅ Business logic (ALL!)
- ✅ Unit tests (в libs!)
- ✅ Database configuration (в libs)
- ✅ Вся переиспользуемая логика

### 2. APPS ТОЛЬКО ПОДКЛЮЧЕНИЕ

**apps/** - ТОЛЬКО подключение из libs:
- ✅ Controllers (только HTTP endpoints, вызывают методы из libs)
- ✅ Modules (только импорты из libs и регистрация контроллеров)
- ✅ main.ts (entry point, настройка приложения)
- ⚠️ Проектно-специфичная логика (не переиспользуемая)

**❌ ЗАПРЕЩЕНО в apps/:**
- Services (бизнес-логика) - ТОЛЬКО в libs/
- Entities (модели данных) - ТОЛЬКО в libs/
- DTOs (валидация) - ТОЛЬКО в libs/
- Guards (безопасность) - ТОЛЬКО в libs/
- Strategies (Passport) - ТОЛЬКО в libs/
- Repositories (доступ к данным) - ТОЛЬКО в libs/
- Любая переиспользуемая логика - ТОЛЬКО в libs/

### 3. ПРОВЕРКА ПЕРЕД РАЗРАБОТКОЙ

**Перед написанием нового кода:**
1. ✅ Проверить \`libs/shared/\` - есть ли уже готовый код?
2. ✅ Проверить другие \`libs/*\` - может быть уже реализовано?
3. ✅ Если нет - создать в соответствующей \`libs/*\`
4. ✅ Если есть - использовать существующий код

**❌ НИКОГДА не дублировать код между apps/ и libs/**

## 📦 Импорты из libs/

### Domain Libraries
\`\`\`typescript
import { AuthService } from '@workix/domain/auth';
import { PipelineService } from '@workix/domain/pipelines';
import { RoleService } from '@workix/domain/rbac';
\`\`\`

### Infrastructure Libraries
\`\`\`typescript
import { I18nService } from '@workix/infrastructure/i18n';
\`\`\`

### Shared Libraries
\`\`\`typescript
// Frontend
import { ApiClientService } from '@workix/shared/frontend/core';
import { I18nService } from '@workix/shared/frontend/core';

// Backend
\`\`\`

### Integrations
\`\`\`typescript
\`\`\`

## 🎯 Категории библиотек

### Domain (Бизнес-логика)
- \`libs/domain/auth\` - Аутентификация
- \`libs/domain/users\` - Пользователи
- \`libs/domain/pipelines\` - Пайплайны
- \`libs/domain/rbac\` - Роли и права

### Infrastructure (Инфраструктура)
- \`libs/infrastructure/prisma\` - Prisma клиент
- \`libs/infrastructure/i18n\` - Интернационализация
- \`libs/infrastructure/message-broker\` - Message broker

### Integrations (Интеграции)
- \`libs/integrations/e-commerce/\` - E-commerce платформы
- \`libs/integrations/cloud/\` - Облачные провайдеры
- \`libs/integrations/code/\` - Системы контроля версий

### AI (AI библиотеки)
- \`libs/ai/ai-core\` - Ядро AI
- \`libs/ai/generation\` - Генерация контента

### Shared (Общие библиотеки)
- \`libs/shared/frontend/ui\` - UI компоненты
- \`libs/shared/frontend/core\` - Frontend core
- \`libs/shared/backend/core\` - Backend core

### Utilities (Утилиты)
- \`libs/utilities/billing\` - Биллинг
- \`libs/utilities/data-validation\` - Валидация данных

---

${libsSpec}
`;

        return realStructure;
      } catch (error) {
        return `# Libraries Structure\n\nError loading file: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    },
  };
}
