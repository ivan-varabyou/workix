/**
 * Applications Structure Resource
 *
 * Provides information about apps/ directory structure, projects, and naming conventions
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { MCPResource } from '../types.js';

export function getAppsStructureResource(): MCPResource {
  return {
    uri: 'workix://apps-structure',
    name: 'Applications Structure',
    description: 'Workix apps/ directory structure, projects, ports, and naming conventions',
    mimeType: 'text/markdown',
    getContent: async () => {
      try {
        // Use optimized specs
        const appsSpecPath = join(process.cwd(), '.specify/specs-optimized/core/applications.md');
        const appsSpec = readFileSync(appsSpecPath, 'utf-8');

        // Добавляем информацию о реальной структуре apps/
        const realStructure = `
# 🚀 Workix Applications Structure

## 🎯 КРИТИЧЕСКОЕ ПРАВИЛО: APPS ТОЛЬКО ПОДКЛЮЧЕНИЕ

**🔴 CRITICAL RULE: apps/ - ТОЛЬКО подключение из libs!**
**❌ НИКОГДА бизнес-логика в apps!**
**✅ apps/ - ТОЛЬКО контроллеры, модули, main.ts**

### ✅ РАЗРЕШЕНО в apps/:
- Controllers (только HTTP endpoints, вызывают методы из libs)
- Modules (только импорты из libs и регистрация контроллеров)
- main.ts (entry point, настройка приложения)
- Проектно-специфичная логика (например, кастомная маршрутизация)
- Конфигурация приложения (порты, настройки деплоя)

### ❌ ЗАПРЕЩЕНО в apps/:
- Services (бизнес-логика) - ТОЛЬКО в libs/
- Entities (модели данных) - ТОЛЬКО в libs/
- DTOs (валидация) - ТОЛЬКО в libs/
- Guards (безопасность) - ТОЛЬКО в libs/
- Strategies (Passport) - ТОЛЬКО в libs/
- Repositories (доступ к данным) - ТОЛЬКО в libs/
- Любая переиспользуемая логика - ТОЛЬКО в libs/

## 📁 Структура apps/

\`\`\`
apps/
├── app-web/                    # 🎨 Frontend: Клиентское веб-приложение
│   ├── src/
│   │   ├── app/                # Angular приложение
│   │   │   ├── modules/        # Модули приложения
│   │   │   └── services/       # Только проектно-специфичные сервисы
│   │   └── main.ts             # Entry point
│   └── project.json
│   Порт: 7301
│   Технологии: Angular, PrimeNG, Zoneless
│
├── app-admin/                  # 🎨 Frontend: Административная панель
│   ├── src/
│   │   ├── app/                # Angular приложение
│   │   │   ├── modules/        # Модули админки
│   │   │   └── services/       # Только проектно-специфичные сервисы
│   │   └── main.ts             # Entry point
│   └── project.json
│   Порт: 7300
│   Технологии: Angular, PrimeNG, Zoneless
│
├── api-gateway/                # 🔌 Backend: API Gateway (маршрутизация)
│   ├── src/
│   │   ├── app/
│   │   │   ├── controllers/   # Контроллеры (вызывают libs)
│   │   │   ├── guards/         # Только проектно-специфичные guards
│   │   │   └── app.module.ts   # Импортирует все libs
│   │   └── main.ts             # Entry point
│   └── project.json
│   Порт: 7100
│   Назначение: Маршрутизация запросов к микросервисам
│
├── api-monolith/               # 🔌 Backend: Монолитное API (все сервисы)
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/           # Auth контроллер (вызывает @workix/domain/auth)
│   │   │   ├── users/          # Users контроллер (вызывает @workix/domain/users)
│   │   │   ├── pipelines/      # Pipelines контроллер (вызывает @workix/domain/pipelines)
│   │   │   ├── rbac/           # RBAC контроллер (вызывает @workix/domain/rbac)
│   │   │   ├── integrations/   # Integrations контроллеры
│   │   │   ├── workers/        # Workers контроллеры
│   │   │   └── app.module.ts   # Импортирует все libs
│   │   └── main.ts              # Entry point, порт 7000
│   ├── prisma/
│   │   └── schema.prisma       # Единая БД schema
│   └── project.json
│   Порт: 7000
│   Назначение: Все сервисы в одном приложении (Phase 1)
│
├── api-auth/                   # 🔌 Backend: Микросервис аутентификации
│   ├── src/
│   │   ├── app/
│   │   │   ├── controllers/    # Auth контроллер (вызывает @workix/domain/auth)
│   │   │   └── app.module.ts   # Импортирует @workix/domain/auth
│   │   └── main.ts             # Entry point
│   ├── prisma/
│   │   └── schema.prisma       # Локальная схема (если нужна)
│   └── project.json
│   Порт: 7200
│   Назначение: Отдельный микросервис для аутентификации
│
├── api-users/                  # 🔌 Backend: Микросервис пользователей
│   ├── src/
│   │   ├── app/
│   │   │   ├── controllers/    # Users контроллер (вызывает @workix/domain/users)
│   │   │   └── app.module.ts   # Импортирует @workix/domain/users
│   │   └── main.ts             # Entry point
│   └── project.json
│   Порт: 7201
│   Назначение: Отдельный микросервис для пользователей
│
├── api-pipelines/              # 🔌 Backend: Микросервис пайплайнов
│   ├── src/
│   │   ├── app/
│   │   │   ├── controllers/    # Pipelines контроллер (вызывает @workix/domain/pipelines)
│   │   │   └── app.module.ts   # Импортирует @workix/domain/pipelines
│   │   └── main.ts             # Entry point
│   ├── prisma/
│   │   └── schema.prisma       # Локальная схема (если нужна)
│   └── project.json
│   Порт: 7202
│   Назначение: Отдельный микросервис для пайплайнов
│
├── api-rbac/                   # 🔌 Backend: Микросервис RBAC
│   ├── src/
│   │   ├── app/
│   │   │   ├── controllers/    # RBAC контроллер (вызывает @workix/domain/rbac)
│   │   │   └── app.module.ts   # Импортирует @workix/domain/rbac
│   │   └── main.ts             # Entry point
│   ├── prisma/
│   │   └── schema.prisma       # Локальная схема (если нужна)
│   └── project.json
│   Порт: 7203
│   Назначение: Отдельный микросервис для RBAC
│
├── api-gateway-e2e/            # 🧪 Testing: E2E тесты для API Gateway
│   ├── src/
│   │   └── api/
│   │       └── api.spec.ts     # E2E тесты
│   └── project.json
│   Назначение: End-to-End тесты для API Gateway
│
└── mcp-server/                 # 🛠️ Utility: MCP Server для AI интеграции
    ├── src/
    │   ├── main.ts             # Entry point
    │   ├── resources/          # MCP resources (документация)
    │   ├── tools/              # MCP tools (API методы)
    │   └── utils/              # Утилиты
    └── project.json
    Назначение: Model Context Protocol сервер для AI агентов
    Transport: stdio
\`\`\`

## 🎯 Категории приложений

### 🎨 Frontend Applications (app-*)

**Формат**: \`app-{purpose}\`

| Приложение | Порт | Описание | Технологии |
|-----------|------|----------|------------|
| \`app-web\` | 7301 | Клиентское веб-приложение | Angular, PrimeNG, Zoneless |
| \`app-admin\` | 7300 | Административная панель | Angular, PrimeNG, Zoneless |

**Особенности:**
- Используют \`@workix/shared/frontend/ui\` для UI компонентов
- Используют \`@workix/shared/frontend/core\` для ApiClientService, I18nService
- Все бизнес-логика в libs/, apps только UI и роутинг

### 🔌 Backend API Applications (api-*)

**Формат**: \`api-{purpose}\`

| Приложение | Порт | Описание | Использует libs |
|-----------|------|----------|----------------|
| \`api-gateway\` | 7100 | API Gateway (маршрутизация) | Все domain libs |
| \`api-monolith\` | 7000 | Монолитное API (все сервисы) | Все domain libs |
| \`api-auth\` | 7200 | Микросервис аутентификации | @workix/domain/auth |
| \`api-users\` | 7201 | Микросервис пользователей | @workix/domain/users |
| \`api-pipelines\` | 7202 | Микросервис пайплайнов | @workix/domain/pipelines |
| \`api-rbac\` | 7203 | Микросервис RBAC | @workix/domain/rbac |

**Особенности:**
- Все контроллеры только вызывают методы из libs/
- Все бизнес-логика в libs/
- apps только HTTP endpoints и конфигурация

### 🧪 Testing Applications (*-e2e)

**Формат**: \`{original-name}-e2e\`

| Приложение | Описание |
|-----------|----------|
| \`api-gateway-e2e\` | E2E тесты для API Gateway |

**Особенности:**
- Используют Vitest для E2E тестирования
- Тестируют полный flow через HTTP

### 🛠️ Utility Applications

| Приложение | Описание | Transport |
|-----------|----------|-----------|
| \`mcp-server\` | MCP Server для AI интеграции | stdio |

## 📊 Порты приложений

### Frontend (7xxx)
- \`app-admin\`: **7300** - Административная панель
- \`app-web\`: **7301** - Клиентское веб-приложение

### Backend API (7xxx)
- \`api-monolith\`: **7000** - Монолитное API (основное)
- \`api-gateway\`: **7100** - API Gateway
- \`api-auth\`: **7200** - Микросервис аутентификации
- \`api-users\`: **7201** - Микросервис пользователей
- \`api-pipelines\`: **7202** - Микросервис пайплайнов
- \`api-rbac\`: **7203** - Микросервис RBAC

## 🔄 Монолит vs Микросервисы

### Phase 1: Монолит (Текущий)

**Используется**: \`api-monolith\` (порт 7000)

- Все сервисы в одном приложении
- Одна база данных
- Быстрый цикл разработки
- Легче отладка

**Структура:**
\`\`\`
apps/api-monolith/
├── src/app/
│   ├── auth/           # Контроллер → @workix/domain/auth
│   ├── users/          # Контроллер → @workix/domain/users
│   ├── pipelines/      # Контроллер → @workix/domain/pipelines
│   └── rbac/           # Контроллер → @workix/domain/rbac
└── prisma/schema.prisma # Единая БД
\`\`\`

### Phase 2: Микросервисы (Будущее)

**Используются**: Отдельные микросервисы (порты 7200-7203)

- Каждый сервис независим
- Своя база данных для каждого сервиса
- Горизонтальное масштабирование
- Независимое развертывание

**Структура:**
\`\`\`
apps/
├── api-auth/      # Порт 7200 → @workix/domain/auth
├── api-users/     # Порт 7201 → @workix/domain/users
├── api-pipelines/ # Порт 7202 → @workix/domain/pipelines
└── api-rbac/      # Порт 7203 → @workix/domain/rbac
\`\`\`

**Переключение:**
- Без изменений кода!
- Только обновить переменные окружения
- Все libs остаются теми же

## 🎯 Правила разработки для apps/

### 1. Контроллеры только вызывают libs

**✅ ПРАВИЛЬНО:**
\`\`\`typescript
// apps/api-monolith/src/app/auth/auth.controller.ts
import { AuthService } from '@workix/domain/auth';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    // Только вызов метода из libs
    return this.authService.login(dto);
  }
}
\`\`\`

**❌ НЕПРАВИЛЬНО:**
\`\`\`typescript
// ❌ НЕ ДЕЛАТЬ ТАК!
@Controller('auth')
export class AuthController {
  @Post('login')
  async login(@Body() dto: LoginDto) {
    // ❌ Бизнес-логика в контроллере!
    const user = await this.prisma.user.findUnique(...);
    const token = jwt.sign(...);
    return { token };
  }
}
\`\`\`

### 2. Модули только импортируют libs

**✅ ПРАВИЛЬНО:**
\`\`\`typescript
// apps/api-monolith/src/app/app.module.ts
import { AuthModule } from '@workix/domain/auth';
import { UsersModule } from '@workix/domain/users';
import { PipelinesModule } from '@workix/domain/pipelines';
import { RbacModule } from '@workix/domain/rbac';

@Module({
  imports: [
    AuthModule,      // ✅ Импорт из libs
    UsersModule,     // ✅ Импорт из libs
    PipelinesModule, // ✅ Импорт из libs
    RbacModule,      // ✅ Импорт из libs
  ],
  controllers: [AuthController, UsersController, ...]})
export class AppModule {}
\`\`\`

### 3. main.ts только настройка приложения

**✅ ПРАВИЛЬНО:**
\`\`\`typescript
// apps/api-monolith/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Только настройка приложения
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(7000);
}
bootstrap();
\`\`\`

## 📦 Импорты в apps/

### Backend приложения

\`\`\`typescript
// Импорт domain библиотек
import { AuthService } from '@workix/domain/auth';

// Импорт infrastructure библиотек
import { I18nService } from '@workix/infrastructure/i18n';

// Импорт shared библиотек
\`\`\`

### Frontend приложения

\`\`\`typescript
// Импорт shared frontend библиотек
import { ApiClientService } from '@workix/shared/frontend/core';
import { I18nService } from '@workix/shared/frontend/core';
\`\`\`

## 🚀 Команды запуска

### Frontend приложения

\`\`\`bash
# Запустить клиентское приложение
nx serve app-web          # Порт 7301

# Запустить админ панель
nx serve app-admin        # Порт 7300

# Собрать для production
nx build app-web
nx build app-admin
\`\`\`

### Backend приложения

\`\`\`bash
# Запустить монолит
nx serve api-monolith     # Порт 7000

# Запустить API Gateway
nx serve api-gateway      # Порт 7100

# Запустить микросервисы
nx serve api-auth         # Порт 7200
nx serve api-users        # Порт 7201
nx serve api-pipelines    # Порт 7202
nx serve api-rbac         # Порт 7203
\`\`\`

### Тесты

\`\`\`bash
# E2E тесты
nx test api-gateway-e2e
\`\`\`

## 🔍 Проверка перед разработкой

**Перед созданием нового кода в apps/:**
1. ✅ Проверить \`libs/\` - есть ли уже готовая библиотека?
2. ✅ Если нет - создать в \`libs/\`, НЕ в \`apps/\`
3. ✅ В \`apps/\` только контроллер, который вызывает метод из libs
4. ✅ Все бизнес-логика в libs/

**❌ НИКОГДА не создавать бизнес-логику в apps/**

---

${appsSpec}
`;

        return realStructure;
      } catch (error) {
        return `# Applications Structure\n\nError loading file: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    },
  };
}
