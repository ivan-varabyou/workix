# 🏗️ Правила разработки Workix

## 📋 Таблица содержания

1. [SOLID whenнципы](#solid-whenнципы)
2. [DRY - Don't Repeat Yourself](#dry---dont-repeat-yourself)
3. [KISS - Keep It Simple](#kiss---keep-it-simple)
4. [Архитектура](#architecture)
5. [Безопасность](#withoutопасность)
6. [Тестирование](#тестирование)
7. [Документация](#documentация)
8. [Расширяемость](#расширяемость)

---

## SOLID whenнципы

### 1️⃣ Single Responsibility Principle (SRP)

**Правило**: Класс должен иметь одну whenчину for изменения.

❌ **ПЛОХО**

```typescript
class UserManager {
  // Слишком many responseственности!
  createUser() {}
  updateUser() {}
  deleteUser() {}
  validateEmail() {}
  sendEmail() {}
  logEvent() {}
  hashPassword() {}
}
```

✅ **ХОРОШО**

```typescript
// Каждый класс отвечает за одно
class UserService {
  createUser(dto: CreateUserDto) {}
  updateUser(id: string, dto: UpdateUserDto) {}
  deleteUser(id: string) {}
}

class UserValidator {
  validateEmail(email: string) {}
}

class EmailService {
  sendEmail(to: string, subject: string, body: string) {}
}

class PasswordService {
  hashPassword(password: string) {}
}

class AuditService {
  logEvent(event: AuditEvent) {}
}
```

### 2️⃣ Open/Closed Principle (OCP)

**Правило**: Открыто for расширения, закрыто for изменения.

❌ **ПЛОХО**

```typescript
class Validator {
  validate(type: string, value: any) {
    if (type === 'email') {
      // email logic
    } else if (type === 'phone') {
      // phone logic
    } else if (type === 'url') {
      // url logic
    }
    // Нужно изменять класс for каждого нового typeа!
  }
}
```

✅ **ХОРОШО**

```typescript
interface IValidator {
  validate(value: any): ValidationResult;
}

class EmailValidator implements IValidator {
  validate(email: string) {}
}

class PhoneValidator implements IValidator {
  validate(phone: string) {}
}

class URLValidator implements IValidator {
  validate(url: string) {}
}

// Легко добавить new валидатор without изменения существующего кода!
```

### 3️⃣ Liskov Substitution Principle (LSP)

**Правило**: Подклассы должны полностью заменять родителей.

❌ **ПЛОХО**

```typescript
class Repository {
  find(id: string): Entity | null {}
  create(entity: Entity): Entity {}
}

class CachedRepository extends Repository {
  find(id: string): Entity | null {
    // Может вернуть null из кэша, но это не ожидается!
    return super.find(id);
  }
}
```

✅ **ХОРОШО**

```typescript
abstract class Repository<T> {
  abstract find(id: string): Promise<T>;
  abstract create(entity: T): Promise<T>;
  abstract update(id: string, entity: T): Promise<T>;
}

class DatabaseRepository<T> extends Repository<T> {
  async find(id: string): Promise<T> {}
  async create(entity: T): Promise<T> {}
  async update(id: string, entity: T): Promise<T> {}
}

class CachedRepository<T> extends Repository<T> {
  // Полностью совместима с Repository
  async find(id: string): Promise<T> {}
  async create(entity: T): Promise<T> {}
  async update(id: string, entity: T): Promise<T> {}
}
```

### 4️⃣ Interface Segregation Principle (ISP)

**Правило**: Много специфичных interfaceов better чем one большой.

❌ **ПЛОХО**

```typescript
// Один большой interface
interface IEntity {
  getId(): string;
  getName(): string;
  setName(name: string): void;
  getDescription(): string;
  setDescription(desc: string): void;
  getCreatedAt(): Date;
  getUpdatedAt(): Date;
  save(): Promise<void>;
  delete(): Promise<void>;
  validate(): boolean;
  // ... еще 20 methodов
}
```

✅ **ХОРОШО**

```typescript
// Много маленьких специфичных interfaceов
interface IIdentifiable {
  getId(): string;
}

interface INameable {
  getName(): string;
  setName(name: string): void;
}

interface ITimestamped {
  getCreatedAt(): Date;
  getUpdatedAt(): Date;
}

interface IPersistable {
  save(): Promise<void>;
  delete(): Promise<void>;
}

// Используй только нужные interfaceы
class User implements IIdentifiable, INameable, ITimestamped, IPersistable {}
```

### 5️⃣ Dependency Inversion Principle (DIP)

**Правило**: Зависимости от абстракций, а не конкретных реализаций.

❌ **ПЛОХО**

```typescript
// Прямая зависимость от конкретного класса
class UserService {
  constructor() {
    this.repository = new UserRepository(); // Жесткая связанность!
    this.emailService = new SendgridEmailService();
  }
}
```

✅ **ХОРОШО**

```typescript
// Зависимость от interfaceов
interface IUserRepository {
  find(id: string): Promise<User>;
  save(user: User): Promise<void>;
}

interface IEmailService {
  send(to: string, subject: string, body: string): Promise<void>;
}

class UserService {
  constructor(private repository: IUserRepository, private emailService: IEmailService) {}
}

// Легко заменить реализацию!
const service = new UserService(new UserRepository(), new SendgridEmailService());

// Или for тестов:
const service = new UserService(new MockUserRepository(), new MockEmailService());
```

---

## DRY - Don't Repeat Yourself

### ❌ ПЛОХО: Дублирование кода

```typescript
class UserService {
  validateUserEmail(email: string) {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error('Invalid email');
    }
  }

  validateAdminEmail(email: string) {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error('Invalid email');
    }
  }

  validateGuest Email(email: string) {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error('Invalid email');
    }
  }
}
```

### ✅ ХОРОШО: Переusage

```typescript
@Injectable()
class EmailValidator {
  validate(email: string) {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error('Invalid email');
    }
  }
}

class UserService {
  constructor(private emailValidator: EmailValidator) {}

  validateUserEmail(email: string) {
    this.emailValidator.validate(email);
  }

  validateAdminEmail(email: string) {
    this.emailValidator.validate(email);
  }

  validateGuestEmail(email: string) {
    this.emailValidator.validate(email);
  }
}
```

---

## KISS - Keep It Simple

### ❌ ПЛОХО: Сложно

```typescript
const result = data
  .map((x) => x.items)
  .flat()
  .filter((x) => x.active && x.parent && !x.deleted && x.status === 'approved')
  .map((x) => ({
    ...x,
    calculated: x.value * x.multiplier * (x.taxRate || 1),
    formatted: `${x.currency} ${(x.value * x.multiplier * (x.taxRate || 1)).toFixed(2)}`,
  }))
  .sort((a, b) => b.calculated - a.calculated)
  .slice(0, 10);
```

### ✅ ХОРОШО: Просто

```typescript
// 1. Разложить на понятные шаги
const items = this.flattenItems(data);
const activeItems = this.filterActiveItems(items);
const itemsWithCalculations = this.calculateItems(activeItems);
const sortedItems = this.sortByCalculation(itemsWithCalculations);
const topItems = this.getTop10(sortedItems);

// 2. Каждый method делает одно
private flattenItems(data: any[]): any[] {
  return data.flatMap(x => x.items);
}

private filterActiveItems(items: any[]): any[] {
  return items.filter(x =>
    x.active &&
    x.parent &&
    !x.deleted &&
    x.status === 'approved'
  );
}
```

---

## Архитектура

### 🏗️ Монорепо structure (Nx)

```
workix/
├── apps/                          # Точки входа whenложений
│   ├── api/                       # Backend API (NestJS)
│   │   └── src/
│   │       ├── main.ts           # Entry point
│   │       └── app/
│   │           ├── app.controller.ts
│   │           └── app.module.ts
│   ├── admin/                     # Admin Dashboard (Angular)
│   ├── client/                    # Client App (Angular)
│   └── mcp-server/                # Workix MCP Server
│
├── libs/                          # Бизнес-логика (переиспользуемая)
│   ├── auth/                      # Authentication & Authorization
│   │   └── src/
│   │       ├── entities/
│   │       ├── dtos/
│   │       ├── services/
│   │       ├── guards/
│   │       └── auth.module.ts
│   ├── users/                     # User management
│   ├── pipelines/                 # Pipeline logic
│   ├── shared/                    # Общая логика (usesся везде)
│   │   └── src/
│   │       ├── validators/
│   │       ├── decorators/
│   │       ├── pipes/
│   │       ├── filters/
│   │       └── utils/
│   ├── database/                  # Database configuration
│   ├── config/                    # Configuration management
│   └── models/                    # Entities & Interfaces
```

### 📌 Правила структуры - ВСЕ В LIBS (ПРАВИЛО #1)

**🔴 CRITICAL RULE: Вся реализация ТОЛЬКО в libs!**
**❌ НИКОГДА реализация в apps!**
**✅ apps/ - ТОЛЬКО connection из libs + projectно-специфичная логика**

**ОШИБКА, которую мы чинили:**

```
❌ НЕПРАВИЛЬНО:
├── apps/
│   ├── auth-service/src/auth/services/ ← ЗДЕСЬ БЫЛА БИЗНЕС ЛОГИКА
│   ├── user-service/src/app/services/  ← ЗДЕСЬ БЫЛА БИЗНЕС ЛОГИКА
│   └── ...

✅ ПРАВИЛЬНО:
├── libs/
│   ├── auth/src/services/              ← ВСЯ БИЗНЕС ЛОГИКА ЗДЕСЬ (библиотека)
│   ├── users/src/services/             ← ВСЯ БИЗНЕС ЛОГИКА ЗДЕСЬ (библиотека)
│   └── ...
├── apps/
│   ├── api/src/controllers/            ← ТОЛЬКО контроллеры (вызывают libs)
│   ├── api/src/app.module.ts           ← ТОЛЬКО импорты из libs
│   └── ...
```

**1. ✅ LIBS - ВСЯ РЕАЛИЗАЦИЯ (99% разработки here!)**

**libs/** - это libraries с полной реализацией:

- ✅ Services (вся business-логика)
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

**libs/** должны быть:

- ✅ Независимыми библиотеками
- ✅ Переиспользуемыми between projectами
- ✅ Имеющими четкий public API (index.ts)
- ✅ Имеющими свои тесты
- ✅ Не зависящими от apps/

**2. ✅ APPS - ТОЛЬКО ПОДКЛЮЧЕНИЕ ИЗ LIBS (~1% интеграции)**

**apps/** - ТОЛЬКО connection из libs:

- ✅ Controllers (только HTTP маршруты, вызывают methodы из libs)
- ✅ Modules (только импорты из libs и регистрация контроллеров)
- ✅ main.ts (entry point, setup whenложения)
- ✅ HTTP endpoints (Request/response)
- ✅ Request handling
- ✅ Response formatting
- ✅ Swagger setup
- ⚠️ Проектно-специфичная логика (не переиспользуемая)
- ⚠️ Integration tests (связывают неhow much libs)

**❌ ЗАПРЕЩЕНО в apps/:**

- Services (business-логика) - ТОЛЬКО в libs/
- Entities (модели данных) - ТОЛЬКО в libs/
- DTOs (валидация) - ТОЛЬКО в libs/
- Guards (withoutопасность) - ТОЛЬКО в libs/
- Strategies (Passport) - ТОЛЬКО в libs/
- Repositories (доступ к данным) - ТОЛЬКО в libs/
- Любая переиспользуемая логика - ТОЛЬКО в libs/

**✅ ПРИМЕРЫ projectно-специфичной логики в apps/:**

- Конфигурация whenложения (порты, настройки деплоя)
- Кастомная маршрутизация for конкретного serviceа
- Проектно-специфичная обработка responseов
- Настройки Swagger for конкретного whenложения

**Максимально переиспользуемо!**

**3. ✅ SHARED LIBS - Общая логика (when one код usesся в разных libs)**

Когда видишь what one код нalreadyн в разных библиотеках:

❌ **ПЛОХО** - дублирование

```
libs/auth/src/validators/email.validator.ts
libs/users/src/validators/email.validator.ts
libs/pipelines/src/validators/email.validator.ts
```

✅ **ХОРОШО** - в shared

```
libs/shared/backend/core/src/validators/email.validator.ts

# И usesся везде:
import { EmailValidator } from '@workix/shared/backend/core';
```

**📁 НОВАЯ СТРУКТУРА БИБЛИОТЕК (РЕАЛИЗОВАНО ✅):**

```
libs/
├── domain/                          # 🏢 Доменные libraries (business-логика)
│   ├── auth/                        # Аутентификация
│   ├── users/                       # Пользователи
│   ├── pipelines/                   # Пайплайны
│   ├── rbac/                        # Роли и права
│   ├── webhooks/                    # Webhooks
│   ├── workflows/                   # Workflows
│   └── workers/                     # Workers
│
├── infrastructure/                  # 🔧 Инфраструктурные libraries
│   ├── database/                    # База данных
│   ├── prisma/                      # Prisma client
│   ├── message-broker/              # Message broker (Redis/Bull)
│   ├── i18n/                        # Интернационализация
│   ├── notifications/               # Уведомления
│   ├── api-keys/                    # API ключи
│   ├── testing/                     # Тестовые утилиты
│   ├── service-discovery/           # Service discovery
│   └── performance/                 # Производительность
│
├── integrations/                    # 🔌 Интеграции с внешними serviceами
│   ├── cloud/                       # Облачные провайдеры (AWS, Azure, GCP)
│   ├── code/                        # Системы контроля версий (GitHub, GitLab)
│   ├── communication/               # Коммуникации (Slack, Telegram)
│   ├── project-management/          # Управление projectами (Jira, Salesforce)
│   ├── e-commerce/                  # E-commerce platforms (Amazon, eBay, Ozon, etc.)
│   └── core/                        # Ядро интеграций
│
├── ai/                              # 🤖 AI libraries
│   ├── ai-core/                     # Ядро AI
│   ├── generation/                  # Генерация контента
│   └── ml-integration/              # Machine Learning
│
├── shared/                          # 📚 Общие libraries
│   ├── frontend/
│   │   ├── ui/                      # UI componentы (PrimeNG абстракция)
│   │   └── core/                    # Frontend core (ApiClientService, I18nService)
│   └── backend/
│       └── core/                    # Backend core (guards, exceptions, filters)
│
└── utilities/                       # 🛠️ Утилиты
    ├── ab-testing/                  # A/B тестирование
    ├── billing/                     # Биллинг
    ├── batch-processing/            # Пакетная обработка
    ├── custom-scripts/              # Кастомные scriptы
    ├── data-validation/             # Валидация данных
    ├── file-storage/                # Хранение fileов
    └── resilience/                   # Отказоустойчивость
```

**Правила:**

- ✅ **Domain логика** → `libs/domain/*`
- ✅ **Infrastructure логика** → `libs/infrastructure/*`
- ✅ **Integrations** → `libs/integrations/*` (с underкатегориями)
- ✅ **AI логика** → `libs/ai/*`
- ✅ **Backend логика** → `libs/shared/backend/core`
- ✅ **Frontend логика** → `libs/shared/frontend/core`
- ✅ **UI componentы** → `libs/shared/frontend/ui`
- ✅ **Utilities** → `libs/utilities/*`
- ✅ **Импорты**: `@workix/domain/*`, `@workix/infrastructure/*`, `@workix/integrations/*`, `@workix/ai/*`, `@workix/shared/*`, `@workix/utilities/*`

### 📂 Типичная structure lib

```
libs/auth/
├── src/
│   ├── entities/
│   │   ├── user.entity.ts
│   │   └── role.entity.ts
│   ├── dtos/
│   │   ├── login.dto.ts
│   │   ├── register.dto.ts
│   │   └── auth-response.dto.ts
│   ├── interfaces/
│   │   ├── auth.interface.ts
│   │   └── user.interface.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── password.service.ts
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── jwt.guard.ts
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   ├── auth.module.ts
│   └── index.ts                   # ⭐ Экспортирует публичный API
└── tsconfig.json
```

### 📤 Экспортирование из lib (index.ts)

```typescript
// libs/auth/src/index.ts
export * from './entities/user.entity';
export * from './services/auth.service';
export * from './guards/auth.guard';
export * from './auth.module';

// ⭐ ВАЖНО: Только публичный API
// Приватные details остаются inside lib
```

### 🎯 Когда создавать новую lib

Создай новую lib when:

1. ✅ Есть самостоятельная домен/фича (auth, users, pipelines)
2. ✅ Код может переuseся в разных apps
3. ✅ Есть свои entities, services, guards
4. ✅ Нужна инкапсуляция

Не создавай lib for:

- ❌ Единственного componentа
- ❌ Простых утилит (используй shared)
- ❌ Специфичного for одного app

---

## Безопасность

### ✅ Что ОБЯЗАТЕЛЬНО делать

1. **Ниwhen не логируй пароли**

   ```typescript
   // ❌ ПЛОХО
   console.log(user); // содержит пароль!

   // ✅ ХОРОШО
   const userWithoutPassword = _.omit(user, 'password');
   console.log(userWithoutPassword);
   ```

2. **Хеши пароли**

   ```typescript
   // ✅ ВСЕГДА используй bcrypt
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

3. **Валидируй входные data**

   ```typescript
   // ✅ Используй class-validator
   class CreateUserDto {
     @IsEmail()
     email: string;

     @MinLength(8)
     password: string;
   }
   ```

4. **Защити от SQL Injection**

   ```typescript
   // ❌ ПЛОХО - SQL Injection!
   const query = `SELECT * FROM users WHERE email = '${email}'`;

   // ✅ ХОРОШО - parameterизованные requestы
   const query = 'SELECT * FROM users WHERE email = $1';
   db.query(query, [email]);
   ```

---

## Тестирование

### 🔴 CRITICAL RULE: Использовать правильный тестовый фреймворк!

**Frontend (Angular):**

- ✅ Использовать Jest (`@nx/jest:jest`) for Angular whenложений
- ✅ Использовать базовый конфиг: `libs/shared/frontend/jest.config.base.ts`
- ✅ Расширять `libs/shared/frontend/tsconfig.spec.base.json` for TypeScript

**Backend (NestJS):**

- ✅ Использовать Vitest (`@nx/vite:test`) for NestJS whenложений
- ✅ Использовать базовый конфиг: `libs/shared/backend/vitest.config.base.ts`
- ✅ Расширять `libs/shared/backend/tsconfig.spec.base.json` for TypeScript

**❌ ЗАПРЕЩЕНО:**

- ❌ Дублировать конфигурацию тестов в каждом projectе
- ❌ Создавать конфиги с нуля - allгда use базовые

**✅ ОБЯЗАТЕЛЬНО:**

- ✅ Все frontend projectы используют `createJestConfig()` из `libs/shared/frontend/jest.config.base.ts`
- ✅ Все backend projectы используют `createVitestConfig()` из `libs/shared/backend/vitest.config.base.ts`
- ✅ Все shared libraries ОБЯЗАНЫ иметь тесты (см. раздел lower)

**Пример `project.json`:**

```json
{
  "targets": {
    "test": {
      "executor": "@nx/vite:test",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "passWithNoTests": true
      }
    }
  }
}
```

### 🔴 CRITICAL RULE: Тестирование Shared библиотек

**✅ ОБЯЗАТЕЛЬНО for allх shared библиотек:**

1. **Все serviceы должны иметь тесты:**

   - `libs/shared/frontend/core/src/lib/api-client.service.spec.ts`
   - `libs/shared/frontend/core/src/lib/i18n.service.spec.ts`
   - `libs/shared/frontend/core/src/lib/i18n.pipe.spec.ts`

2. **Все UI componentы должны иметь тесты:**

   - `libs/shared/frontend/ui/src/lib/components/button/button.component.spec.ts`
   - `libs/shared/frontend/ui/src/lib/components/card/card.component.spec.ts`
   - И т.д. for allх componentов

3. **Минимальное покрытие:**

   - ✅ **85% for shared библиотек** (критично! используются везде)
   - ✅ 70% for обычного кода
   - ✅ 90%+ for критичных componentов (ApiClientService, I18nService)
   - ✅ 100% for утилит, валидаторов и pipe
   - ✅ **Интеграционные тесты обязательны** for serviceов с внешними зависимостями

4. **Структура тестов:**

   ```
   libs/shared/frontend/core/src/lib/
   ├── api-client.service.ts
   └── api-client.service.spec.ts          ✅ Обязательно!
   ```

5. **Использовать Angular Testing Utilities:**
   ```typescript
   import { TestBed } from '@angular/core/testing';
   import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
   ```

**Подробнее см. `.specify/specs/000-project/SHARED_FRONTEND_LIBRARY.md` - раздел "Тестирование"**

### Правило: TDD (Test-Driven Development)

1. **Напиши тесты первыми**
2. **Потом реализацию**
3. **Потом refactoring**

### Типы тестов

```typescript
// Unit tests
describe('UserService', () => {
  it('should hash password', async () => {
    const result = await service.hashPassword('test123');
    expect(result).not.toBe('test123');
  });
});

// Integration tests
describe('User Registration', () => {
  it('should create user and save to database', async () => {
    const user = await service.register(dto);
    expect(user.id).toBeDefined();
  });
});

// Error cases
describe('User Validation', () => {
  it('should throw on invalid email', async () => {
    expect(() => service.validateEmail('invalid')).toThrow();
  });
});
```

---

## Документация

### ✅ Обязательная documentация

```typescript
/**
 * Creates a new user in the system
 * @param dto - User creation data
 * @returns Created user (without password)
 * @throws UserAlreadyExistsException if email is taken
 * @example
 * const user = await userService.create({
 *   email: 'user@example.com',
 *   password: 'secure123'
 * });
 */
async create(dto: CreateUserDto): Promise<UserResponseDto> {
  // implementation
}
```

---

## Расширяемость

### ✅ Как сделать код расширяемым

1. **Используй interfaceы**

   ```typescript
   interface IPaymentGateway {
     process(amount: number): Promise<void>;
   }
   ```

2. **Инъекция зависимостей**

   ```typescript
   class OrderService {
     constructor(private gateway: IPaymentGateway) {}
   }
   ```

3. **Конфигурация вместо hardcoda**

   ```typescript
   // ❌ ПЛОХО
   const TAX_RATE = 0.1;

   // ✅ ХОРОШО
   @Injectable()
   class ConfigService {
     getTaxRate() {
       return this.configService.get('TAX_RATE');
     }
   }
   ```

4. **Мультиязычность вместо хардкода текста**

   ```typescript
   // ❌ ПЛОХО - хардкод текста
   const message = 'Welcome to Workix!';
   const error = 'User not found';

   // ✅ ХОРОШО - via i18n
   @Injectable()
   class NotificationService {
     constructor(private i18n: I18nService) {}

     sendWelcome(userId: string) {
       const message = this.i18n.translate('notifications.welcome', { userId });
       // ...
     }
   }
   ```

---

## 🌐 Мультиязычность (i18n) - ОБЯЗАТЕЛЬНО!

### 🔴 CRITICAL RULE: Ниhowого хардкода текста!

**❌ ЗАПРЕЩЕНО:**

```typescript
// ❌ ПЛОХО - хардкод текста
const message = 'Welcome to Workix!';
const error = 'User not found';
const subject = 'Alert: Pipeline failed';
```

**✅ ОБЯЗАТЕЛЬНО:**

```typescript
// ✅ ХОРОШО - via i18n
const message = this.i18n.translate('common.welcome');
const error = this.i18n.translate('errors.user_not_found');
const subject = this.i18n.translate('alerts.pipeline_failed', { pipelineId });
```

### Правила usage i18n:

1. **Backend (NestJS):**

   ```typescript
   // В serviceах
   constructor(private i18n: I18nService) {}

   async sendNotification(userId: string) {
     const message = this.i18n.translate('notifications.welcome', { userId });
     // ...
   }
   ```

2. **Frontend (Angular):**

   ```typescript
   // В componentах
   constructor(private i18n: I18nService) {}

   get title() {
     return this.i18n.translate('dashboard.title');
   }
   ```

3. **Структура ключей:**

   ```
   common.welcome
   common.save
   common.cancel
   errors.user_not_found
   errors.validation_failed
   notifications.pipeline_completed
   notifications.approval_requested
   ```

4. **Файлы переводов:**

   ```
   libs/i18n/src/locales/
   ├── en/translations.json
   ├── ru/translations.json
   └── ar/translations.json
   ```

5. **Поддерживаемые языки:**
   - `en` - English (default)
   - `ru` - Русский
   - `ar` - العربية (Arabic, RTL support)

### ❌ НАРУШЕНИЕ = COMMIT REJECTED!

Если найден хардкод текста:

- ❌ Cannot commit
- ❌ Cannot merge
- ❌ Will cause code review rejection
- ❌ Blocks next task

### ✅ Чек-лист before коммитом:

```bash
# Проверка на хардкод текста
grep -r "['\"].*[А-Яа-я].*['\"]" libs/  # Русский текст
grep -r "Welcome\|Error\|Success\|Failed" libs/ --include="*.ts"  # Английский хардкод
# Все должно быть via i18n!
```

---

## 🎨 Angular componentы - ОБЯЗАТЕЛЬНО разделение!

### 🔴 CRITICAL RULE: Ниhowих inline template/styles!

**❌ ЗАПРЕЩЕНО:**

```typescript
// ❌ ПЛОХО - inline template и styles
@Component({
  selector: 'app-example',
  template: `
    <div class="container">
      <h1>{{ title }}</h1>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 20px;
      }
    `,
  ],
})
export class ExampleComponent {}
```

**✅ ОБЯЗАТЕЛЬНО:**

```typescript
// ✅ ХОРОШО - departmentьные fileы
@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrl: './example.component.scss',
})
export class ExampleComponent {}
```

### Структура fileов componentа:

```
component-name/
├── component-name.component.ts    # Логика componentа
├── component-name.component.html  # Шаблон (template)
└── component-name.component.scss  # Стили (styles)
```

### Правила разделения:

1. **Template (HTML):**

   - ✅ Всегда в departmentьном `.html` fileе
   - ✅ Использовать `templateUrl: './component-name.component.html'`
   - ❌ НЕ use `template: \`...\``

2. **Styles (SCSS/CSS):**

   - ✅ Всегда в departmentьном `.scss` fileе
   - ✅ Использовать `styleUrl: './component-name.component.scss'`
   - ❌ НЕ use `styles: [\`...\`]`

3. **Логика componentа:**
   - ✅ Только TypeScript код в `.ts` fileе
   - ✅ Без HTML и CSS кода
   - ✅ Чистая логика componentа

### Преимущества разделения:

- ✅ Лучшая читаемость кода
- ✅ Поддержка IDE (автодополнение, underсветка синтаксиса)
- ✅ Легче refactoring
- ✅ Удобнее работать в команде
- ✅ Лучшая performance (кеширование, минификация)

### ❌ НАРУШЕНИЕ = COMMIT REJECTED!

Если найден inline template или styles:

- ❌ Cannot commit
- ❌ Cannot merge
- ❌ Will cause code review rejection
- ❌ Blocks next task

### ✅ Чек-лист before коммитом:

```bash
# Проверка на inline template/styles
grep -r "template:\s*\`" apps/ --include="*.ts"  # Inline template
grep -r "styles:\s*\[" apps/ --include="*.ts"    # Inline styles
# Все должно быть в departmentьных fileах!
```

---

## 🔴 CRITICAL RULE: UI componentы только из shared/frontend/ui!

**❌ ЗАПРЕЩЕНО:**

```typescript
// ❌ ПЛОХО - прямая зависимость от UI libraries в apps
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-example',
  imports: [MatButtonModule, MatCardModule],
  // ...
})
export class ExampleComponent {}
```

**✅ ОБЯЗАТЕЛЬНО:**

```typescript
// ✅ ХОРОШО - usage componentов из shared/frontend/ui
import { WorkixButtonComponent, WorkixCardComponent } from '@workix/shared/frontend/ui';

@Component({
  selector: 'app-example',
  imports: [WorkixButtonComponent, WorkixCardComponent],
  // ...
})
export class ExampleComponent {}
```

### Правила usage UI componentов:

1. **Все UI componentы в shared/frontend/ui:**

   - ✅ Использовать только componentы из `@workix/shared/frontend/ui`
   - ✅ НЕ импортировать напрямую PrimeNG в apps
   - ✅ Все componentы обернуты в абстракцию провайдеров

2. **Система версионирования UI:**

   - ✅ Использовать версионирование UI (v1 - текущая версия)
   - ✅ Версия UI настраивается via конфигурацию
   - ✅ Легко расширять в будущем when необходимости
   - ✅ По умолчанию usesся PrimeNG

3. **Абстракция UI провайдеров:**

   - ✅ Использовать абстракцию провайдеров (PrimeNG, Custom)
   - ✅ Провайдер настраивается via конфигурацию
   - ✅ По умолчанию usesся PrimeNG

4. **Конфигурация UI:**

   ```typescript
   // apps/admin-dashboard/src/app.config.ts
   import { UIProvider, UIVersion } from '@workix/shared/frontend/ui';

   export const uiConfig = {
     provider: UIProvider.PRIMENG, // По умолчанию PrimeNG
     version: UIVersion.V1, // Текущая версия
   };
   ```

### Преимущества:

- ✅ Независимость от конкретной UI libraries
- ✅ Легкая замена UI libraries
- ✅ Версионирование UI componentов
- ✅ Единый style componentов
- ✅ Централизованное управление UI
- ✅ Легкое тестирование и documentирование (Storybook)

### Миграция componentов:

Все componentы из `apps/` должны быть мигрированы в `libs/shared/frontend/ui`:

- ✅ Базовые componentы (button, card, input, etc.)
- ✅ Сложные componentы (table, form, dialog, etc.)
- ✅ Специфичные componentы (pipeline-builder, etc.)

**План миграции**: См. [UI_MIGRATION_PLAN.md](../../000-project/UI_MIGRATION_PLAN.md)

### 🔴 CRITICAL RULE: Разделение fileов when миграции componentов!

**❌ ЗАПРЕЩЕНО:**

```typescript
// ❌ ПЛОХО - all в одном fileе
// component.ts
export interface MyInterface {}
export class MyComponent {}
// template, styles, interfaces - all в одном fileе
```

**✅ ОБЯЗАТЕЛЬНО:**

```typescript
// ✅ ХОРОШО - разделение на departmentьные fileы
// component.ts - только логика componentа
// component.html - только template
// component.scss - только стили
// component.types.ts - только interfaceы и typeы
// component.service.ts - только serviceы (если нужны)
```

### Структура fileов componentа when миграции:

```
component-name/
├── component-name.component.ts      # Логика componentа
├── component-name.component.html    # Шаблон (template)
├── component-name.component.scss    # Стили (styles)
├── component-name.component.types.ts # Интерфейсы и typeы
├── component-name.component.spec.ts # Тесты
├── component-name.component.stories.ts # Storybook stories
└── component-name.service.ts        # Сервисы (если нужны)
```

### Правила разделения:

1. **TypeScript логика (component.ts):**

   - ✅ Только класс componentа
   - ✅ Только methodы и свойства
   - ✅ Импорты и зависимости
   - ❌ НЕ interfaceы/typeы (в .types.ts)
   - ❌ НЕ HTML template (в .html)
   - ❌ НЕ CSS стили (в .scss)

2. **HTML template (component.html):**

   - ✅ Только HTML разметка
   - ✅ Директивы и биндинги
   - ❌ НЕ TypeScript код
   - ❌ НЕ стили

3. **SCSS стили (component.scss):**

   - ✅ Только стили
   - ✅ CSS/SCSS код
   - ❌ НЕ HTML
   - ❌ НЕ TypeScript

4. **Интерфейсы и typeы (component.types.ts):**

   - ✅ Только interfaceы
   - ✅ Только typeы
   - ✅ Только enums
   - ❌ НЕ классы componentов
   - ❌ НЕ логика

5. **Сервисы (component.service.ts):**
   - ✅ Только serviceы
   - ✅ Только business-логика
   - ❌ НЕ componentы

### Преимущества разделения:

- ✅ Лучшая читаемость кода
- ✅ Легче навигация по fileам
- ✅ Удобнее работать в команде
- ✅ Лучшая performance IDE
- ✅ Легче refactoring
- ✅ Четкое разделение responseственности

### ❌ НАРУШЕНИЕ = COMMIT REJECTED!

Если found прямые зависимости от UI библиотек в apps:

- ❌ Cannot commit
- ❌ Cannot merge
- ❌ Will cause code review rejection
- ❌ Blocks next task

---

## 🌐 Public API Principles (Принципы публичного API)

### 🔴 CRITICAL RULE: Все публичные API должны следовать whenнципам стабильности и обратной совместимости!

**❌ ЗАПРЕЩЕНО:**

```typescript
// ❌ ПЛОХО - breaking changes without версионирования
@Controller('users')
export class UserController {
  @Get(':id')
  getUser(@Param('id') id: string) {
    // Изменили структуру responseа without версионирования!
    return { userId: id, name: '...' }; // Было: { id, fullName }
  }
}
```

**✅ ОБЯЗАТЕЛЬНО:**

```typescript
// ✅ ХОРОШО - версионирование и обратная совместимость
@Controller('users')
export class UserController {
  @Get(':id')
  @Version('1')
  getUserV1(@Param('id') id: string) {
    // Старая версия - сохраняем обратную совместимость
    return { id, fullName: '...' };
  }

  @Get(':id')
  @Version('2')
  getUserV2(@Param('id') id: string) {
    // Новая версия - можем изменить структуру
    return { userId: id, name: '...' };
  }
}
```

### Принципы публичного API:

#### 1. Версионирование API

**✅ ОБЯЗАТЕЛЬНО:**

- ✅ Все публичные endpoints используют версионирование: `/api/v1/`, `/api/v2/`
- ✅ Версия указывается в URL: `/api/v1/users/:id`
- ✅ Старые версии underдерживаются минимум 12 месяцев
- ✅ Новая версия создается when breaking changes
- ✅ Документация for каждой версии departmentьно

**Формат URL:**

```
/api/v1/{service}/{endpoint}
/api/v2/{service}/{endpoint}
```

**Пример:**

```typescript
@Controller('users')
export class UserController {
  // v1 - старая версия (underдерживается)
  @Get(':id')
  @Version('1')
  getUserV1(@Param('id') id: string) {
    return { id, fullName: 'John Doe' };
  }

  // v2 - новая версия (breaking change)
  @Get(':id')
  @Version('2')
  getUserV2(@Param('id') id: string) {
    return { userId: id, name: 'John Doe', firstName: 'John', lastName: 'Doe' };
  }
}
```

#### 2. Обратная совместимость (Backward Compatibility)

**✅ ОБЯЗАТЕЛЬНО:**

- ✅ Старые версии API работают without изменений
- ✅ Не удалять поля из responseов (только добавлять новые)
- ✅ Не изменять typeы существующих полей
- ✅ Не изменять обязательность полей (required → optional OK, optional → required NO)
- ✅ Не изменять HTTP methodы и пути endpoints
- ✅ Не изменять коды statusов for успешных responseов

**❌ ЗАПРЕЩЕНО:**

- ❌ Удалять поля из DTOs
- ❌ Изменять typeы полей (string → number)
- ❌ Делать опциональные поля обязательными
- ❌ Изменять HTTP methodы (GET → POST)
- ❌ Изменять пути endpoints

**Пример:**

```typescript
// ✅ ХОРОШО - обратная совместимость
export class UserResponseV1 {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  fullName!: string; // Старое поле - сохраняем
}

export class UserResponseV2 {
  @ApiProperty()
  userId!: string; // Новое поле

  @ApiProperty()
  fullName!: string; // Старое поле - сохраняем for совместимости

  @ApiProperty()
  name!: string; // Новое поле
}
```

#### 3. Breaking Changes

**Когда создавать новую версию:**

- ✅ Изменение структуры responseа
- ✅ Удаление поля из DTO
- ✅ Изменение typeа поля
- ✅ Изменение обязательности поля (optional → required)
- ✅ Изменение HTTP methodа
- ✅ Изменение пути endpoint
- ✅ Изменение кода statusа for успешных responseов

**Процесс миграции:**

1. Создать новую версию API (v2)
2. Поддерживать старую версию (v1) минимум 12 месяцев
3. Уведомить clientов о deprecation за 6 месяцев
4. После 12 месяцев можно удалить старую версию

**Пример:**

```typescript
// v1 - старая версия (deprecated, но работает)
@Get(':id')
@Version('1')
@ApiOperation({
  summary: 'Get user by ID (v1)',
  description: '⚠️ DEPRECATED: Use v2 instead. Will be removed in 2025-12-31'
})
getUserV1(@Param('id') id: string) {
  return { id, fullName: 'John Doe' };
}

// v2 - новая версия
@Get(':id')
@Version('2')
@ApiOperation({ summary: 'Get user by ID (v2)' })
getUserV2(@Param('id') id: string) {
  return { userId: id, name: 'John Doe' };
}
```

#### 4. Не-breaking Changes (withoutопасные изменения)

**✅ РАЗРЕШЕНО without версионирования:**

- ✅ Добавление новых полей в response
- ✅ Добавление новых endpoints
- ✅ Добавление новых query parameterов (опциональных)
- ✅ Изменение обязательности поля (required → optional)
- ✅ Уbetterние валидации (более строгая)
- ✅ Добавление новых кодов ошибок

**Пример:**

```typescript
// ✅ Безопасное change - добавление нового поля
export class UserResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  fullName!: string;

  @ApiPropertyOptional() // Новое поле - опциональное
  avatar?: string; // Можно добавить without версионирования
}
```

#### 5. Стабильность API

**✅ ОБЯЗАТЕЛЬНО:**

- ✅ API контракт не изменяется without версионирования
- ✅ Документация актуальна и синхронизирована с кодом
- ✅ Примеры requestов/responseов в documentации
- ✅ Changelog for каждой версии
- ✅ Deprecation policy (минимум 6 месяцев warnings)

**Структура documentации:**

```
docs/
├── api/
│   ├── v1/
│   │   ├── endpoints.md
│   │   ├── changelog.md
│   │   └── migration-guide.md
│   └── v2/
│       ├── endpoints.md
│       ├── changelog.md
│       └── migration-guide.md
```

#### 6. Обработка ошибок

**✅ ОБЯЗАТЕЛЬНО:**

- ✅ Единый format ошибок for allх версий
- ✅ Коды ошибок не изменяются between версиями
- ✅ Сообщения об errorх понятны и инformatивны
- ✅ Документация allх возможных ошибок

**Формат errors:**

```typescript
export class ApiErrorResponse {
  @ApiProperty()
  statusCode!: number;

  @ApiProperty()
  message!: string;

  @ApiPropertyOptional()
  error?: string;

  @ApiPropertyOptional()
  details?: Record<string, any>;
}
```

#### 7. Тестирование совместимости

**✅ ОБЯЗАТЕЛЬНО:**

- ✅ Тесты for allх версий API
- ✅ Тесты обратной совместимости
- ✅ Интеграционные тесты for каждой версии
- ✅ E2E тесты for публичных endpoints

**Пример:**

```typescript
describe('User API v1', () => {
  it('should return user in v1 format', async () => {
    const response = await request(app).get('/api/v1/users/123').expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('fullName');
  });
});

describe('User API v2', () => {
  it('should return user in v2 format', async () => {
    const response = await request(app).get('/api/v2/users/123').expect(200);

    expect(response.body).toHaveProperty('userId');
    expect(response.body).toHaveProperty('name');
  });
});
```

### Чек-лист for публичного API:

- [ ] Версионирование: `/api/v1/`, `/api/v2/`
- [ ] Обратная совместимость: старые версии работают
- [ ] Breaking changes: создана новая версия
- [ ] Documentation: актуальна for каждой версии
- [ ] Deprecation policy: минимум 6 месяцев warnings
- [ ] Changelog: обновлен for каждой версии
- [ ] Тесты: for allх версий API
- [ ] Примеры: requestы/responseы в documentации
- [ ] Обработка ошибок: единый format
- [ ] Миграция: guide for перехода between версиями

### ❌ НАРУШЕНИЕ = COMMIT REJECTED!

Если публичный API нарушает whenнципы:

- ❌ Breaking changes without версионирования
- ❌ Удаление полей из DTOs
- ❌ Изменение typeов полей
- ❌ Изменение обязательности полей (optional → required)
- ❌ Отсутствие documentации for новой версии

**Проверка:**

```bash
# Все версии API должны работать
curl http://localhost:7100/api/v1/users/123
curl http://localhost:7100/api/v2/users/123
```

---

## 📚 OpenAPI / Swagger Документация

### 🔴 CRITICAL RULE: Все API endpoints должны быть documentированы!

**❌ ЗАПРЕЩЕНО:**

```typescript
// ❌ ПЛОХО - нет documentации
@Controller('users')
export class UserController {
  @Get(':id')
  getUser(@Param('id') id: string) {
    // Нет @ApiOperation, @ApiResponse, @ApiTags!
  }
}
```

**✅ ОБЯЗАТЕЛЬНО:**

```typescript
// ✅ ХОРОШО - полная documentация
@ApiTags('Users')
@Controller('users')
export class UserController {
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID', description: 'Retrieves detailed user information' })
  @ApiParam({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'User found', type: UserDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBearerAuth()
  getUser(@Param('id') id: string) {
    // ...
  }
}
```

### Правила documentации API:

#### 1. Контроллеры (Controllers)

**✅ ОБЯЗАТЕЛЬНО:**

- ✅ `@ApiTags('TagName')` - группировка endpoints
- ✅ `@ApiOperation({ summary, description })` - description каждого endpoint
- ✅ `@ApiResponse({ status, description, type })` - all возможные responseы
- ✅ `@ApiBearerAuth()` - for защищенных endpoints
- ✅ `@ApiParam()` - for path parameterов
- ✅ `@ApiQuery()` - for query parameterов
- ✅ `@ApiBody()` - for body parameterов (если нужно)

**Пример:**

```typescript
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  @Post('login')
  @Public()
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticates user and returns JWT tokens',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() loginDto: LoginDto) {
    // ...
  }
}
```

#### 2. DTOs (Data Transfer Objects)

**✅ ОБЯЗАТЕЛЬНО:**

- ✅ `@ApiProperty()` - for allх обязательных полей
- ✅ `@ApiPropertyOptional()` - for опциональных полей
- ✅ `description` - description поля
- ✅ `example` - example значения
- ✅ `type` - type данных (если не whenмитив)
- ✅ `enum` - for enum значений

**Пример:**

```typescript
export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123!',
    minLength: 8,
    maxLength: 100,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;

  @ApiPropertyOptional({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  fullName?: string;
}
```

#### 3. Response DTOs

**✅ ОБЯЗАТЕЛЬНО:**

- ✅ Отдельные DTO for каждого typeа responseа
- ✅ `@ApiProperty()` for allх полей responseа
- ✅ Типы for успешных и ошибочных responseов

**Пример:**

```typescript
export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'User creation date',
    example: '2024-01-01T00:00:00Z',
  })
  createdAt!: Date;
}
```

#### 4. Swagger Configuration

**✅ ОБЯЗАТЕЛЬНО в main.ts:**

- ✅ `DocumentBuilder` с полной конфигурацией
- ✅ `setTitle()` - название API
- ✅ `setDescription()` - description API
- ✅ `setVersion()` - версия API
- ✅ `addBearerAuth()` - setup JWT аутентификации
- ✅ `addTag()` - теги for группировки
- ✅ `addServer()` - serverы (dev, prod)

**Пример:**

```typescript
const config = new DocumentBuilder()
  .setTitle('Workix API')
  .setDescription('AI-Powered Virtual Workers Platform API')
  .setVersion('2.0.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth'
  )
  .addTag('auth', 'Authentication endpoints')
  .addTag('users', 'User management endpoints')
  .addServer('http://localhost:7100', 'Development')
  .addServer('https://api.workix.com', 'Production')
  .build();
```

### Структура fileов for OpenAPI:

```
feature/
├── controllers/
│   └── feature.controller.ts      # Контроллер с @ApiTags, @ApiOperation
├── dto/
│   ├── create-feature.dto.ts      # DTO с @ApiProperty
│   ├── update-feature.dto.ts      # DTO с @ApiProperty
│   └── feature-response.dto.ts    # Response DTO с @ApiProperty
└── services/
    └── feature.service.ts         # Бизнес-логика
```

### Правила именования:

1. **Tags**: PascalCase, множественное number

   - ✅ `@ApiTags('Users')`
   - ✅ `@ApiTags('Pipelines')`
   - ❌ `@ApiTags('user')`
   - ❌ `@ApiTags('User')`

2. **Operation summaries**: Начинаются с глагола, lowercase

   - ✅ `@ApiOperation({ summary: 'Get user by ID' })`
   - ✅ `@ApiOperation({ summary: 'Create new pipeline' })`
   - ❌ `@ApiOperation({ summary: 'User by ID' })`
   - ❌ `@ApiOperation({ summary: 'GET user' })`

3. **Descriptions**: Полные предложения, заканчиваются точкой
   - ✅ `description: 'Retrieves detailed user information.'`
   - ❌ `description: 'Get user'`

### Чек-лист for каждого endpoint:

- [ ] `@ApiTags()` добавлен на контроллер
- [ ] `@ApiOperation({ summary, description })` добавлен
- [ ] `@ApiResponse()` for allх statusов (200, 201, 400, 401, 403, 404, 500)
- [ ] `@ApiBearerAuth()` for защищенных endpoints
- [ ] `@ApiParam()` for path parameterов
- [ ] `@ApiQuery()` for query parameterов
- [ ] `@ApiBody()` for body parameterов
- [ ] Все DTOs имеют `@ApiProperty()` или `@ApiPropertyOptional()`
- [ ] Примеры значений в `@ApiProperty({ example })`
- [ ] Описания for allх полей

### ❌ НАРУШЕНИЕ = COMMIT REJECTED!

Если endpoint не documentирован:

- ❌ Cannot commit
- ❌ Cannot merge
- ❌ Will cause code review rejection
- ❌ Blocks next task

**Проверка:**

```bash
# Все endpoints должны быть доступны в Swagger UI
# http://localhost:7100/docs
```

---

## 🎯 Чек-лист for каждого коммита

- [ ] **🔴 КОД ТОЛЬКО В LIBS?** (не в apps!)
- [ ] Services/Entities/DTOs в libs/, не в apps/
- [ ] Apps импортирует только из libs/
- [ ] Следует SOLID?
- [ ] DRY соблюдается?
- [ ] KISS whenменен?
- [ ] Нет hardcoda?
- [ ] **🔴 Нет замены реальной логики хардкодом? (all вызовы к БД/API реализованы)**
- [ ] **🌐 Нет хардкода текста? (usesся i18n)**
- [ ] **🎨 Angular componentы: departmentьные .html и .scss fileы? (NO inline template/styles)**
- [ ] **🌐 Public API: версионирование usesся? (/api/v1/, /api/v2/)**
- [ ] **🌐 Public API: обратная совместимость сохранена? (старые версии работают)**
- [ ] **🌐 Public API: breaking changes создают новую версию? (не изменяют существующую)**
- [ ] **📚 OpenAPI/Swagger: all endpoints documentированы? (@ApiTags, @ApiOperation, @ApiResponse)**
- [ ] **📚 OpenAPI/Swagger: all DTOs имеют @ApiProperty() или @ApiPropertyOptional()?**
- [ ] **📦 Установка пакетов: used Nx генератор (если доступен)?**
- [ ] **📦 Установка пакетов: НЕТ --force и --legacy-peer-deps?**
- [ ] Безопасность OK?
- [ ] Тесты написаны?
- [ ] Документация exists?
- [ ] Расширяемо?

---

## ⏱️ Отслеживание времени выполнения

### Эстимация vs Фактическое время

**ВСЕГДА добавляй обе колонки в TASKS.md:**

```markdown
| #   | Название | Est Time | Actual | Notes         |
| --- | -------- | -------- | ------ | ------------- |
| 1   | Task     | ~2h      | ~0.5h  | ⚡ 4x faster |
| 2   | Task     | ~1.5h    | —      | TBD           |
```

### Правило корректировки эстимации

**🔥 ВАЖНО: Корректируй эстимацию after каждой задачи!**

1. **Если задача делается faster:**

   - Уменьши эстимацию for похожих задач
   - Обнови TASK_TIMING_TEMPLATE.md
   - Пример: T-001 заняла 0.5h вместо 2h → all OAuth/OTP будут ~1h вместо 1.5h

2. **Если задача делается дольше:**

   - Увеличь эстимацию
   - Проанализируй why (complexity, dependencies, fixes)
   - Обнови оценки for оставшихся

3. **После завершения задачи:**
   ```
   1. Заполни ACTUAL TIME в TASK_XXX.md
   2. Обнови TASKS.md колонку "Actual"
   3. Корректируй эстимацию for следующих похожих задач
   4. Обнови PROJECT_METRICS.md
   ```

### Пример корректировки

```
T-001 фактически ~0.5h (было ~2h)
Коэффициент: 0.5/2 = 0.25 (в 4 раза faster!)

Новые эстимации:
- T-002a: было ~1.5h → новая ~45m
- T-002b: было ~1h → новая ~20m
- T-002c: было ~1h → новая ~20m
- T-002:  было ~1.5h → новая ~45m
```

### Для planирования на 24 часа:

- Смоthree "Целевые оценки времени" в TASK_TIMING_TEMPLATE.md
- Используй актуальные (а не первоначальные) эстимации
- Каждая новая задача уточняет performance
- Базовая скорость (T-001): 42 fileа/час, 164 теста/час

---

**Версия**: 1.1
**Обновлено**: 2025-11-07 (Added history tracking and continuous work rules)

---

## 🧪 ОБЯЗАТЕЛЬНЫЕ ТРЕБОВАНИЯ ДЛЯ КАЖДОЙ ФИЧИ (НОВОЕ!)

### ✅ MUST DO - Невозможно пропустить!

**1. ТЕСТЫ (ОБЯЗАТЕЛЬНЫ)**

```
✅ Unit tests for каждого methodа (min 3-5 tests)
   └─ Файл: libs/feature/src/services/*.spec.ts
✅ Integration тесты (если работает с БД)
   └─ Файл: libs/feature/src/services/*.integration.spec.ts
✅ Controller тесты (если exists HTTP endpoints)
   └─ Файл: apps/service/src/app/controllers/*.spec.ts
✅ E2E тесты for API Gateway routes (for новых endpoints)
   └─ Файл: apps/api-e2e/src/api/api.spec.ts (ТОЛЬКО here!)
✅ Все тесты ДОЛЖНЫ PASS before коммитом
✅ Минимум 70% покрытие новым кодом
✅ npm run test:run - NO FAILURES
✅ nx run api-e2e:e2e - NO FAILURES (when serviceы запущены)
```

**2. SWAGGER (ОБЯЗАТЕЛЕН for allх endpoints)**

```
✅ @ApiTags('FeatureName')
✅ @ApiOperation({ summary: '...', description?: '...' })
✅ @ApiResponse({ status: 200, type: ResponseDto })
✅ @ApiResponse({ status: 400, description: 'Validation error' })
✅ @ApiResponse({ status: 401, description: 'Unauthorized' })
✅ @ApiResponse({ status: 403, description: 'Forbidden' })
✅ @ApiResponse({ status: 404, description: 'Not found' })
✅ @ApiParam / @ApiQuery (for parameterов)
✅ @ApiBearerAuth() (for защищённых endpoints)
✅ @ApiProperty() на allх DTO классах с exampleами
```

**3. ДОКУМЕНТАЦИЯ (ОБЯЗАТЕЛЬНА)**

```
✅ JSDoc комментарии: @param, @returns, @throws
✅ TASK file с результаthereи и временем
✅ Обновлённый README в каждой lib
✅ Inline comments for сложной логики
```

**4. КАЧЕСТВО КОДА (ОБЯЗАТЕЛЬНО)**

```
✅ ESLint pass (npm run lint)
✅ ПОЛНОЕ ПОКРЫТИЕ ТИПАМИ: all переменные, parameterы, возвращаемые значения имеют явные typeы
✅ Strict TypeScript types (NO any, NO unknown without обоснования)
✅ Явные возвращаемые typeы for allх функций и methodов (ОБЯЗАТЕЛЬНО!)
✅ Явные typeы for allх const/let переменных (ОБЯЗАТЕЛЬНО!)
✅ Явные typeы for allх parameterов функций (ОБЯЗАТЕЛЬНО!)
✅ Явные typeы for allх сигналов и computed (Angular) (ОБЯЗАТЕЛЬНО!)
✅ Разделение interfaceов: выносить в departmentьные fileы (НЕ inline в коде)
✅ Proper error handling (try-catch, guards)
✅ Правильное logging (Logger, не console)
✅ Ниhowих хардкода (env variables)
✅ Ниhowих sensitive data в логах/комментариях
✅ Ниhowих хардкода текста (use i18n)
✅ **🔴 Нет замены реальной логики хардкодом (all вызовы к БД/API реализованы)**
✅ Все текстовые строки via I18nService
✅ Angular componentы: departmentьные .html и .scss fileы (NO inline template/styles)
✅ Angular 2025: use signals (signal, computed, effect)
✅ Angular 2025: use input()/output() вместо @Input/@Output
✅ Angular 2025: use child() вместо @ViewChild
✅ Angular 2025: use new control flow (@if, @for, @switch, @empty)
✅ Angular 2025: use [ngTemplateOutlet] вместо *ngTemplateOutlet
✅ UI componentы: use только из `@workix/shared/frontend/ui` (NO прямых зависимостей от PrimeNG в apps)
✅ UI версионирование: use систему версионирования UI (v1, v2, v3)
✅ UI провайдеры: use абстракцию провайдеров (PrimeNG, Custom)
```

### ❌ НАРУШЕНИЕ = COMMIT REJECTED!

Если what-то из списка higher пропущено:

- ❌ Cannot commit
- ❌ Cannot merge
- ❌ Will cause code review rejection
- ❌ Blocks next task

---

## ✅ ПРАВИЛО: ПРОВЕРКА КОМАНД ПЕРЕД ВЫПОЛНЕНИЕМ

**Перед executionм ЛЮБОЙ команды:**

1. **Проверить наличие команды:**

   - ✅ Проверить в `package.json` (scripts)
   - ✅ Проверить в `project.json` (for Nx projects)
   - ✅ Проверить в documentации (START_ALL.md, README.md)

2. **Проверить правильность пути:**

   - ✅ Проверить существование fileа/диреwhoрии
   - ✅ Проверить рабочую диреwhoрию
   - ✅ Проверить контекст выполнения

3. **Если team неизвестна:**
   - ✅ НЕ вызывать команду наугад
   - ✅ Проверить documentацию
   - ✅ Использовать правильную команду сразу
   - ✅ НЕ исправлять after errors

**Примеры:**

```bash
# ❌ НЕПРАВИЛЬНО: Вызвать команду наугад
npm run start:all  # Может не существовать

# ✅ ПРАВИЛЬНО: Проверить сначала
grep "start:all" package.json  # Проверить наличие
# Если не found → проверить START_ALL.md
# Если found → use правильную команду
```

## 🔴 CRITICAL RULE: Работа только на своей ветке задачи!

**❌ ЗАПРЕЩЕНО:**

- ❌ Переключаться на другие ветки во время разработки
- ❌ Делать `git checkout` на другие ветки
- ❌ Работать на нескольких ветках одновременно
- ❌ Переключаться between ветками without завершения текущей задачи

**✅ ОБЯЗАТЕЛЬНО:**

- ✅ Работать только на своей ветке задачи (task-{номер})
- ✅ Все изменения делать только на текущей ветке задачи
- ✅ Не уходить на другие ветки до завершения текущей задачи
- ✅ Завершить задачу, создать коммиты, затем переключиться на другую ветку

## 🔴 CRITICAL RULE: Установка пакетов - сначала Nx, потом npm!

**✅ ОБЯЗАТЕЛЬНО: Использовать Nx в первую очередь!**

```bash
# ✅ ХОРОШО - installation via Nx (ПРИОРИТЕТ #1)
nx g @nx/js:library my-lib
nx g @nx/angular:component my-component
nx g @nx/storybook:configuration my-lib

# ✅ ХОРОШО - installation via npm (если Nx не underдерживает)
npm install package-name
npm install --save-dev package-name
```

**❌ ЗАПРЕЩЕНО:**

```bash
# ❌ ПЛОХО - usage --force
npm install package-name --force

# ❌ ПЛОХО - usage --legacy-peer-deps
npm install package-name --legacy-peer-deps

# ❌ ПЛОХО - usage обоих флагов
npm install package-name --force --legacy-peer-deps

# ❌ ПЛОХО - use npm напрямую, если exists Nx генератор
npm install @storybook/angular  # ❌ Используй: nx g @nx/storybook:configuration
```

### Правила установки пакетов:

1. **Приоритет #1: Использовать Nx генераторы:**

   - ✅ Проверить наличие Nx генератора for пакета/libraries
   - ✅ Использовать `nx g @nx/*:generator-name` for установки
   - ✅ Nx automatically настроит зависимости и конфигурацию
   - ✅ Nx обеспечивает правильную интеграцию с монорепо

2. **Приоритет #2: Использовать npm (если Nx не underдерживает):**

   - ✅ Использовать `npm install` только если нет Nx генератора
   - ✅ Использовать стандартную установку without флагов
   - ✅ Разрешать npm automatically разрешать конфликты зависимостей
   - ✅ Использовать правильные версии пакетов, совместимые друг с другом

3. **Процесс установки:**

   ```bash
   # Шаг 1: Проверить наличие Nx генератора
   nx list | grep package-name
   # или
   nx g @nx/*:generator-name --help

   # Шаг 2a: Если exists Nx генератор - use его
   nx g @nx/storybook:configuration shared-frontend-ui

   # Шаг 2b: Если нет Nx генератора - use npm
   npm install package-name
   ```

4. **Примеры usage Nx:**

   ```bash
   # Storybook
   nx g @nx/storybook:configuration shared-frontend-ui

   # Angular component
   nx g @nx/angular:component my-component --project=shared-frontend-ui

   # NestJS module
   nx g @nx/nest:module my-module --project=api

   # TypeScript библиотека
   nx g @nx/js:library my-lib
   ```

5. **Примеры usage npm (when Nx не underдерживает):**

   ```bash
   # Утилиты, которые не имеют Nx генераторов
   npm install lodash
   npm install --save-dev @types/lodash

   # Специфичные packages without Nx underдержки
   npm install axios
   ```

### Правила установки пакетов:

1. **Стандартная installation:**

   - ✅ Использовать `npm install` without дополнительных флагов
   - ✅ Разрешать npm automatically разрешать конфликты зависимостей
   - ✅ Использовать правильные версии пакетов, совместимые друг с другом

2. **Если exists конфликты зависимостей:**

   - ✅ Проверить совместимость версий пакетов
   - ✅ Обновить версии пакетов до совместимых
   - ✅ Использовать `npm install` с явным указанием версий
   - ✅ Обновить `package.json` с правильными версиями

3. **Если пакет несовместим:**
   - ✅ Найти альтернативный пакет
   - ✅ Обновить версию пакета до совместимой
   - ✅ Использовать other approach/solution
   - ❌ НЕ use `--force` или `--legacy-peer-deps`

### Почему это важно:

- ✅ **Безопасность**: `--force` может установить несовместимые версии, what whenведет к errorм
- ✅ **Стабильность**: `--legacy-peer-deps` обходит checks совместимости, what может вызвать проблемы
- ✅ **Предсказуемость**: Стандартная installation гарантирует совместимость зависимостей
- ✅ **Поддержка**: Легче underдерживать project с правильными зависимостями
- ✅ **Отладка**: Проще найти и исправить проблемы с зависимостями

### Процесс установки пакетов:

1. **Проверить наличие Nx генератора:**

   ```bash
   # Проверить доступные генераторы
   nx list | grep package-name

   # Или проверить конкретный генератор
   nx g @nx/storybook:configuration --help
   ```

2. **Если exists Nx генератор:**

   ```bash
   # Использовать Nx генератор
   nx g @nx/storybook:configuration shared-frontend-ui
   # Nx automatically установит зависимости и настроит конфигурацию
   ```

3. **Если нет Nx генератора:**

   ```bash
   # Использовать npm напрямую
   npm install package-name
   # Если exists error - прочитать message об ошибке
   ```

4. **При конфликтах зависимостей (только for npm):**

   ```bash
   # Найти совместимые версии
   npm view package-name versions
   # Найти версию, совместимую с текущими зависимостями

   # Обновить package.json
   {
     "dependencies": {
       "package-name": "^1.2.3"  // Совместимая версия
     }
   }

   # Установить
   npm install
   ```

### ❌ НАРУШЕНИЕ = COMMIT REJECTED!

Если found:

- ❌ Usage `--force` или `--legacy-peer-deps`
- ❌ Usage npm напрямую, when exists Nx генератор
- ❌ Пропуск checks Nx генераторов before установкой

**Последствия:**

- ❌ Cannot commit
- ❌ Cannot merge
- ❌ Will cause code review rejection
- ❌ Blocks next task

**Проверка:**

```bash
# Проверка на usage запрещенных флагов
grep -r "--force\|--legacy-peer-deps" package.json scripts/ *.sh
# Не должно быть found!

# Проверка на usage npm for пакетов с Nx генераторами
# (нужно проверять вручную when code review)
```

**Пример:**

```bash
# ✅ ПРАВИЛЬНО:
git checkout -b task-1
# Работаем на task-1, делаем коммиты
git commit -m "T #1 - feat(api): add feature"
# Завершили задачу, теперь можно переключиться
git checkout develop

# ❌ НЕПРАВИЛЬНО:
git checkout -b task-1
# Работаем на task-1
git checkout task-2  # ❌ Переключились на другую ветку!
# Продолжаем работу на task-2
```

## 📋 QUICK CHECKLIST ПЕРЕД КОММИТОМ

```bash
# Запусти before КАЖДЫМ коммитом:
npm run test:run          # ✅ Все тесты pass?
npm run lint              # ✅ ESLint pass?
npm run test:coverage     # ✅ Coverage > 70%?
curl http://localhost:4200/docs  # ✅ Swagger работает?
grep -r "console\.log" apps/     # ✅ Нет console.log?
grep -r ":\s*any\b\|:\s*unknown\b" libs/ apps/ --include="*.ts" --exclude-dir="node_modules" --exclude="*.spec.ts"  # ✅ Нет 'any'/'unknown' types?
# Проверка: all функции имеют явные возвращаемые typeы? (нужно проверять вручную)
# Проверка: interfaceы вынесены в departmentьные fileы? (нужно проверять вручную)
grep -r "TODO\|FIXME\|HACK" apps/ # ⚠️ Нет неоконченных задач?
grep -r "--force\|--legacy-peer-deps" package.json scripts/ *.sh  # ✅ Нет запрещенных флагов?
# Проверка: used ли Nx генератор before npm install? (нужно проверять вручную)
```

## 🎯 BEST PRACTICES CHECK ПЕРЕД КОММИТОМ

**Перед каждым коммитом проверяй созданный материал на best practices:**

### 1️⃣ DRY (Don't Repeat Yourself)

```bash
# Проверка на дублирование кода
# Ищи повторяющиеся паттерны, функции, логику
# Если found дублирование → refactoring before коммитом
```

**Что проверять:**

- ✅ Нет повторяющихся функций/methodов
- ✅ Общая логика вынесена в утилиты/serviceы
- ✅ Нет дублирования валидации
- ✅ Нет дублирования обработки ошибок

**Если found дублирование:**

1. Вынести общую логику в departmentьный method/класс
2. Использовать наследование или композицию
3. Использовать утилиты/хелперы
4. Только after refactoringа → коммит

### 2️⃣ SOLID Principles

```bash
# Проверка на соresponseствие SOLID whenнципам
```

**S - Single Responsibility Principle:**

- ✅ Класс/module имеет одну responseственность
- ✅ Нет "God classes" (классов, делающих всё)
- ✅ Методы делают одну вещь

**O - Open/Closed Principle:**

- ✅ Код открыт for расширения, закрыт for изменения
- ✅ Используются interfaceы/абстракции
- ✅ Новый функционал добавляется without изменения существующего

**L - Liskov Substitution Principle:**

- ✅ Подклассы могут заменять родительские классы
- ✅ Наследование usesся правильно

**I - Interface Segregation Principle:**

- ✅ Интерфейсы специфичны, не перегрalreadyны
- ✅ Клиенты не зависят от неиспользуемых methodов

**D - Dependency Inversion Principle:**

- ✅ Зависимости от абстракций, не от конкретных реализаций
- ✅ Dependency Injection usesся правильно

**Если нарушены whenнципы:**

1. Рефаwhoринг for соresponseствия whenнципам
2. Разделение responseственности
3. Usage interfaceов
4. Только after исправления → коммит

### 3️⃣ YAGNI (You Aren't Gonna Need It)

```bash
# Проверка на избыточный код
```

**Что проверять:**

- ✅ Нет неиспользуемого кода
- ✅ Нет "на будущее" функционала
- ✅ Нет избыточной абстракции
- ✅ Код решает текущую задачу, не more

**Если найден избыточный код:**

1. Удалить неиспользуемый код
2. Упростить избыточные абстракции
3. Убрать "на будущее" функционал
4. Только after очистки → коммит

### 4️⃣ KISS (Keep It Simple, Stupid)

```bash
# Проверка на просthatу кода
```

**Что проверять:**

- ✅ Код простой и понятный
- ✅ Нет излишней сложности
- ✅ Легко читать и понимать
- ✅ Нет "умных" решений, которые сложно понять

**Если код слишком сложный:**

1. Упростить логику
2. Разбить на более мелкие функции
3. Добавить комментарии for сложных частей
4. Только after упрощения → коммит

### 5️⃣ Процесс checks

**Порядок checks:**

1. ✅ **DRY** - check на дублирование
2. ✅ **SOLID** - check whenнципов
3. ✅ **YAGNI** - check на избыточность
4. ✅ **KISS** - check на просthatу
5. ✅ **Исправление** - если found проблемы
6. ✅ **Повторная check** - after исправления
7. ✅ **Коммит** - только если all checks пройдены

**Автоматизация:**

```bash
# Скрипт for checks best practices
npm run check:best-practices
```

**ТОЛЬКО ЕСЛИ ВСЕ ✅ → коммит!**

---

## 📊 CURRENT COVERAGE STATUS

| Component    | Tests         | Coverage | Status            |
| ------------ | ------------- | -------- | ----------------- |
| auth-service | 98 tests      | 95%      | ✅ Complete       |
| user-service | 8 tests       | 60%      | ⚠️ Partial        |
| RBAC         | 0 tests       | 0%       | ❌ Missing        |
| Pipelines    | 0 tests       | 0%       | ❌ Missing        |
| **OVERALL**  | **122 tests** | **65%**  | **⚠️ Needs work** |

**Goal**: 85% coverage by end of Phase 2!

---

---

## 🔧 MICROSERVICES CHECKLIST (НОВОЕ!)

**При создании НОВОЙ ФИЧИ нужно проверить:**

```
📝 Этап 1: Планирование
├─ [ ] Определена ли фича departmentьным микроserviceом или частью существующего?
├─ [ ] Есть ли новая lib for business-логики (@workix/*)
├─ [ ] Определены ли entities, DTOs, types
├─ [ ] Созданы ли test fileы (*.spec.ts)
└─ [ ] Создан ли file TASK_XXX.md

📦 Этап 2: Разработка
├─ [ ] Service реализован в libs (business logic)
│   └─ Тесты: libs/*/src/services/*.spec.ts
├─ [ ] Controller создан в apps/SERVICE-service (if needed)
│   └─ Тесты: apps/*/src/app/controllers/*.spec.ts
├─ [ ] Все DTOs определены с @ApiProperty
├─ [ ] Swagger documentация добавлена (@ApiTags, @ApiOperation, etc.)
├─ [ ] Тесты написаны for allх methodов
└─ [ ] Покрытие минимум 70% по новому коду

🔗 Этап 3: Интеграция
├─ [ ] Добавлена ли новая маршрута в API Gateway (apps/api)?
│   └─ Через ProxyService на основе path
├─ [ ] Добавлены ли E2E тесты?
│   └─ Файл: apps/api-e2e/src/api/api.spec.ts
├─ [ ] Обновлён ли MCP Server с новыми tools?
├─ [ ] Обновлён ли README.md в каждой lib?
├─ [ ] Обновлены ли ports в .env.example?
└─ [ ] Все микроserviceы доступны via API Gateway

🧪 Этап 4: Тестирование
├─ [ ] npm run test:run - ALL PASS ✓
├─ [ ] npm run lint - NO ERRORS ✓
├─ [ ] npm run start:all - БЕЗ ОШИБОК ✓
├─ [ ] nx run api-e2e:e2e - ALL PASS ✓
└─ [ ] Swagger доступен на http://localhost:4200/docs ✓

📊 Этап 5: Документирование
├─ [ ] Все endpoints в API_GATEWAY_ENDPOINTS.md
├─ [ ] Статус обновлён в ENDPOINT_STATUS_TRACKING.md
├─ [ ] JSDoc комментарии на allх публичных methodах
├─ [ ] TASK file заполнен с результаthereи и временем
└─ [ ] Обновлена спецификация если нужны изменения

❌ НАРУШЕНИЕ = COMMIT REJECTED!
```

### ✅ Контрольный список по fileам

```
ФАЙЛЫ КОТОРЫЕ ОБЯЗАТЕЛЬНЫ ДЛЯ КАЖДОЙ ФИЧИ:

1️⃣ BUSINESS LOGIC (в libs)
   ├─ service.ts               ← Основная логика
   ├─ service.spec.ts          ← Unit тесты (70%+ coverage)
   ├─ dto.ts                   ← Data Transfer Objects
   ├─ entity.ts                ← TypeORM/Database Entity
   └─ README.md                ← Документация

2️⃣ ENDPOINT (в apps/SERVICE-service)
   ├─ controller.ts            ← HTTP Controller
   ├─ controller.spec.ts       ← Controller тесты
   └─ app.module.ts            ← Модуль регистрации

3️⃣ E2E ТЕСТЫ (в apps/api-e2e)
   └─ src/api/api.spec.ts      ← ТОЛЬКО ЗДЕСЬ! E2E тесты
                                 (добавить description serviceа и тесты)

4️⃣ ДОКУМЕНТИРОВАНИЕ
   ├─ Swagger декораторы       ← @ApiTags, @ApiOperation, etc.
   ├─ API_GATEWAY_ENDPOINTS.md ← Описание эндпоинта
   ├─ ENDPOINT_STATUS_TRACKING.md ← Статус реализации
   └─ TASK_XXX.md              ← Результаты разработки

ЕСЛИ ЧТО-ТО ПРОПУЩЕНО = COMMIT REJECTED ❌
```

### Текущие микроserviceы:

| Сервис           | Port | Lib               | Статус    |
| ---------------- | ---- | ----------------- | --------- |
| API Gateway      | 4200 | —                 | ✅ Active |
| Auth Service     | 5000 | @workix/auth      | ✅ Active |
| User Service     | 5001 | @workix/users     | ✅ Active |
| Pipeline Service | 5002 | @workix/pipelines | ✅ Active |
| RBAC Service     | 5003 | @workix/rbac      | ✅ Active |
| MCP Server       | 9000 | apps/mcp-server   | ✅ Active |

---

## 🔴 CRITICAL RULE: TypeScript typeизация - ПОЛНОЕ ПОКРЫТИЕ ТИПАМИ!

### ⚠️ КРИТИЧЕСКОЕ ПРАВИЛО: 100% покрытие typeами - ОБЯЗАТЕЛЬНО!

**🔴 ВСЕ переменные, parameterы, возвращаемые значения и свойства ДОЛЖНЫ иметь явные typeы!**

**✅ ОБЯЗАТЕЛЬНО:**

- ✅ Все `const` переменные имеют явные typeы
- ✅ Все `let` переменные имеют явные typeы
- ✅ Все parameterы функций имеют typeы
- ✅ Все возвращаемые значения имеют typeы
- ✅ Все свойства interfaceов имеют typeы
- ✅ Все methodы классов имеют typeы
- ✅ Все сигналы (Angular) имеют typeы
- ✅ Все computed свойства имеют typeы
- ✅ Все callback функции имеют typeы
- ✅ Все generic typeы явно определены
- ✅ Все arrayы имеют typeы элементов
- ✅ Все objectы имеют typeы

**❌ ЗАПРЕЩЕНО use `any` и `unknown`, кроме случаев острой необходимости!**

**✅ ОБЯЗАТЕЛЬНО: В первую очередь allгда искать пути via creation конкретных typeов и interfaceов.**

**Порядок priorityов:**

1. **ВСЕГДА ПРЕДПОЧИТАТЬ КОНКРЕТНЫЕ ИНТЕРФЕЙСЫ И ТИПЫ** (высший priority)
2. Использовать `unknown` ТОЛЬКО в крайних случаях (с type guards)
3. Избегать `any` - use ТОЛЬКО в исключительных случаях (с обоснованием)

**Подробнее см. `.specify/specs/005-development-process/TYPESCRIPT_TYPE_COVERAGE.md`** - **ПОЛНОЕ ПОКРЫТИЕ ТИПАМИ**
**Также см. `.specify/specs/005-development-process/TYPESCRIPT_ANY_VS_UNKNOWN.md`** - Разница between `any` и `unknown`

### 🔴 CRITICAL RULE: Явные возвращаемые typeы for allх функций!

**❌ ЗАПРЕЩЕНО:**

```typescript
// ❌ ПЛОХО - нет явного возвращаемого typeа
async getUser(id: string) {
  return await this.prisma.user.findUnique({ where: { id } });
}

function calculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

const processData = (data: Data) => {
  return data.map(item => transform(item));
};
```

**✅ ОБЯЗАТЕЛЬНО:**

```typescript
// ✅ ХОРОШО - явный возвращаемый type
async getUser(id: string): Promise<User | null> {
  return await this.prisma.user.findUnique({ where: { id } });
}

function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

const processData = (data: Data): ProcessedData[] => {
  return data.map(item => transform(item));
};
```

**Правила:**

- ✅ **Все функции и methodы** должны иметь явный возвращаемый type
- ✅ **Асинхронные функции** должны иметь `Promise<T>` или `Promise<void>`
- ✅ **Геттеры** должны иметь явный type возврата
- ✅ **Arrow functions** должны иметь явный type возврата
- ✅ **Конструwhoры** могут не иметь явного typeа (но better указать)
- ✅ **Void функции** должны иметь `: void`

**Примеры:**

```typescript
// ✅ Методы serviceов
async createUser(dto: CreateUserDto): Promise<UserResponseDto> { }
async updateUser(id: string, dto: UpdateUserDto): Promise<UserResponseDto> { }
async deleteUser(id: string): Promise<void> { }

// ✅ Геттеры
get users(): User[] { }
get isAuthenticated(): boolean { }

// ✅ Arrow functions
const validateEmail = (email: string): boolean => { }
const formatDate = (date: Date): string => { }

// ✅ Callback функции
function onSuccess(callback: (data: Data) => void): void { }
```

### 🔴 CRITICAL RULE: Разделение interfaceов - выносить в departmentьные fileы!

**❌ ЗАПРЕЩЕНО:**

```typescript
// ❌ ПЛОХО - interfaceы inline в коде
// user.service.ts
interface CreateUserDto {
  email: string;
  password: string;
}

interface UserResponse {
  id: string;
  email: string;
}

@Injectable()
export class UserService {
  async create(dto: CreateUserDto): Promise<UserResponse> {}
}
```

**✅ ОБЯЗАТЕЛЬНО:**

```typescript
// ✅ ХОРОШО - interfaceы в departmentьных fileах
// interfaces/user.interface.ts
export interface CreateUserDto {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
}

// user.service.ts
import { CreateUserDto, UserResponse } from './interfaces/user.interface';

@Injectable()
export class UserService {
  async create(dto: CreateUserDto): Promise<UserResponse> {}
}
```

**Структура fileов:**

```
feature/
├── services/
│   └── feature.service.ts        # Только логика, НЕ interfaceы
├── interfaces/
│   ├── feature.interface.ts      # Основные interfaceы
│   ├── feature-dto.interface.ts  # DTO interfaceы (если many)
│   └── feature-response.interface.ts  # Response interfaceы (если many)
└── types/
    └── feature.types.ts          # Типы и type aliases
```

**Правила разделения:**

1. **Интерфейсы в `interfaces/` диреwhoрии:**

   - ✅ Все interfaceы в departmentьных fileах
   - ✅ Один file на домен/фичу (наexample, `user.interface.ts`)
   - ✅ Или разделение по назначению (DTO, Response, Config)
   - ✅ Экспортировать via `index.ts` если нужно

2. **Типы в `types/` диреwhoрии:**

   - ✅ Type aliases в departmentьных fileах
   - ✅ Union types, Intersection types
   - ✅ Utility types

3. **НЕ inline в коде:**
   - ❌ НЕ определять interfaceы в fileах serviceов
   - ❌ НЕ определять interfaceы в fileах componentов
   - ❌ НЕ определять interfaceы в fileах контроллеров
   - ❌ НЕ определять interfaceы в середине кода

**Пример структуры:**

```typescript
// libs/domain/users/src/interfaces/user.interface.ts
export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  fullName?: string;
}

export interface UpdateUserDto {
  email?: string;
  fullName?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  createdAt: Date;
}

// libs/domain/users/src/services/user.service.ts
import { User, CreateUserDto, UpdateUserDto, UserResponse } from '../interfaces/user.interface';

@Injectable()
export class UserService {
  async create(dto: CreateUserDto): Promise<UserResponse> {}
  async update(id: string, dto: UpdateUserDto): Promise<UserResponse> {}
  async findById(id: string): Promise<User | null> {}
}
```

**Преимущества:**

- ✅ Переusage interfaceов between модулями
- ✅ Легче найти и изменить interfaceы
- ✅ Чище код serviceов/componentов
- ✅ Лучшая organization projectа
- ✅ Легче тестировать (можно мокировать interfaceы)

### 🔴 CRITICAL RULE: Запрет на usage `any`, `as`, `unknown` и других methodов отключения typeизации!

**❌ ЗАПРЕЩЕНО use for исправления ошибок typeизации:**

- ❌ `any` - отключает проверку typeов
- ❌ `as` (type assertion) - обход checks typeов
- ❌ `unknown` - without type guards отключает проверку typeов
- ❌ `!:` (definite assignment assertion) - игнорирует проверку инициализации
- ❌ Присваивание пустых значений (`= ''`, `= 0`, `= []`, `= {}`) for исправления ошибок typeизации
- ❌ Inline typeы в parameterах функций - нужно выносить в interfaceы for переusage

**✅ ОБЯЗАТЕЛЬНО:**

- ✅ Создавать конкретные interfaceы for allх структур данных
- ✅ Выносить all typeы parameterов в departmentьные interfaceы for переusage
- ✅ Использовать type guards вместо `as` утверждений
- ✅ Использовать конкретные typeы вместо `unknown`
- ✅ Выносить all inline typeы в departmentьные interfaceы

### 🔴 CRITICAL RULE: Запрет на замену реальной логики хардкодом!

**❌ ЗАПРЕЩЕНО:**

- ❌ Заменять вызовы к базе данных на хардкод (`null`, `0`, `[]`, `{}`)
- ❌ Заменять реальные вычисления на фиксированные значения
- ❌ Заменять вызовы API на моки without обоснования
- ❌ Заменять business-логику на заглушки
- ❌ Использовать `TODO` комментарии вместо реальной реализации

**✅ ОБЯЗАТЕЛЬНО:**

- ✅ Реализовывать полную логику с правильной typeизацией
- ✅ Добавлять недостающие methodы/interfaceы в serviceы
- ✅ Использовать правильные typeы и interfaceы
- ✅ Если функционал временно недоступен - use checks с понятными сообщениями
- ✅ Если нужно временно отключить функционал - use feature flags или конфигурацию

**Примеры:**

❌ **ПЛОХО - замена реальной логики хардкодом:**

```typescript
// ❌ ПЛОХО - заменили вызов к БД на хардкод
async getProviderStats(providerId: string): Promise<ProviderStats> {
  // TODO: integrationEvent is not available
  const stats = null; // ❌ Хардкод вместо реального вызова
  const failures = 0; // ❌ Хардкод вместо реального вызова

  return {
    totalRequests: stats?._count?.id || 0, // ❌ Всегда будет 0
    // ...
  };
}
```

✅ **ХОРОШО - правильная реализация:**

```typescript
// ✅ ХОРОШО - правильная реализация с checkми
async getProviderStats(providerId: string): Promise<ProviderStats> {
  if (!this.prisma.integrationEvent) {
    // Если функционал недоступен - возвращаем понятный результат
    this.logger.warn('integrationEvent is not available, returning default stats');
    return {
      providerId,
      period,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLatency: 0,
      successRate: 0,
    };
  }

  // Реальная логика с правильными typeами
  const stats = await this.prisma.integrationEvent.aggregate({
    where: {
      providerId,
      timestamp: { gte: startDate },
    },
    _count: { id: true },
    _avg: { latencyMs: true },
    _sum: { success: true },
  });

  const failures = await this.prisma.integrationEvent.count({
    where: {
      providerId,
      timestamp: { gte: startDate },
      success: false,
    },
  });

  return {
    providerId,
    period,
    totalRequests: stats._count.id || 0,
    successfulRequests: stats._sum.success || 0,
    failedRequests: failures || 0,
    averageLatency: stats._avg.latencyMs || 0,
    successRate: stats._count.id > 0 ? ((stats._sum.success || 0) / stats._count.id) * 100 : 0,
  };
}
```

✅ **ХОРОШО - добавление недостающих methodов в interface:**

```typescript
// ✅ ХОРОШО - добавили недостающий method в interface
export interface ProviderRegistryPrismaService {
  integrationProvider: {
    /* ... */
  };
  integrationEvent?: {
    aggregate: (args: {
      /* ... */
    }) => Promise<{
      /* ... */
    }>;
    count: (args: {
      /* ... */
    }) => Promise<number>;
  };
}
```

**Правила:**

1. **Если method/свойство отсутствует в interfaceе:**

   - ✅ Добавить его в interface с правильными typeами
   - ✅ Использовать опциональные typeы (`?`) если функционал может быть недоступен
   - ✅ Добавить checks на availability функционала

2. **Если функционал временно недоступен:**

   - ✅ Использовать checks (`if (!service.method)`)
   - ✅ Возвращать понятные значения по умолчанию
   - ✅ Логировать warnings о недоступности функционала
   - ✅ Добавить TODO комментарий с descriptionм, what нужно сделать

3. **Если нужно временно отключить функционал:**
   - ✅ Использовать feature flags или конфигурацию
   - ✅ Не заменять логику на хардкод
   - ✅ Сохранять возможность включения функционала

**❌ НАРУШЕНИЕ = COMMIT REJECTED!**

Если found:

- ❌ Замена реальной логики на хардкод (`null`, `0`, `[]`, `{}`)
- ❌ Замена вызовов к БД на фиксированные значения
- ❌ Замена вычислений на константы
- ❌ Замена business-логики на заглушки without обоснования

**Последствия:**

- ❌ Cannot commit
- ❌ Cannot merge
- ❌ Will cause code review rejection
- ❌ Blocks next task

**✅ ОБЯЗАТЕЛЬНО:**

- ✅ Правильно typeизировать all переменные, parameterы, возвращаемые значения
- ✅ Использовать конкретные typeы и interfaceы
- ✅ Использовать type guards for checks typeов
- ✅ Использовать конструwhoры for инициализации DTO классов
- ✅ Использовать опциональные typeы (`?`) when value может отсутствовать
- ✅ Использовать union types (`|`) for множественных typeов
- ✅ Использовать `null` или `undefined` с checkми вместо `!`

**Примеры:**

❌ **ПЛОХО - usage `any`:**

```typescript
// ❌ ПЛОХО
function processData(data: any) {
  return data.map((item) => item.value);
}

// ✅ ХОРОШО
interface DataItem {
  value: string;
}
function processData(data: DataItem[]): string[] {
  return data.map((item) => item.value);
}
```

❌ **ПЛОХО - usage `as`:**

```typescript
// ❌ ПЛОХО
const user = getUser() as User;
const value = (data as unknown as MyType).property;

// ✅ ХОРОШО
const user = getUser();
if (!user) {
  throw new Error('User not found');
}
// Теперь TypeScript знает, what user не null

// Или с type guard
function isMyType(data: unknown): data is MyType {
  return typeof data === 'object' && data !== null && 'property' in data;
}
if (isMyType(data)) {
  const value = data.property; // TypeScript знает type
}
```

❌ **ПЛОХО - usage `!:`:**

```typescript
// ❌ ПЛОХО
export class LoginDto {
  email!: string; // Игнорирует проверку инициализации
  password!: string;
}

// ✅ ХОРОШО - for Request DTO (without конструwhoра, ValidationPipe заполнит)
export class LoginDto {
  @IsEmail()
  email: string; // ValidationPipe заполнит when валидации

  @IsString()
  @MinLength(8)
  password: string;
}

// ✅ ХОРОШО - for Response DTO (с конструwhoром)
export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;

  constructor(accessToken: string, refreshToken: string, expiresIn: number) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresIn = expiresIn;
  }
}
```

❌ **ПЛОХО - whenсваивание пустых значений for исправления ошибок:**

```typescript
// ❌ ПЛОХО - whenсваивание пустых значений for исправления errors typeизации
export class LoginDto {
  email: string = ''; // Неправильно! Пустое value не решает проблему typeизации
  password: string = '';
}

// ✅ ХОРОШО - правильная typeизация without whenсваивания пустых значений
export class LoginDto {
  @IsEmail()
  email: string; // ValidationPipe заполнит when валидации

  @IsString()
  @MinLength(8)
  password: string;
}
```

**Правила for DTO классов:**

1. **Request DTO (входящие data):**

   - ✅ Не инициализировать свойства (ValidationPipe заполнит)
   - ✅ Не use `!:` (definite assignment assertion)
   - ✅ Не whenсваивать пустые значения
   - ✅ Использовать `class-validator` декораторы for валидации

2. **Response DTO (исходящие data):**

   - ✅ Использовать конструwhoры for инициализации
   - ✅ Или use опциональные typeы (`?`) если value может отсутствовать
   - ✅ Не use `!:` (definite assignment assertion)

3. **Проверки на null/undefined:**
   - ✅ Использовать type guards
   - ✅ Использовать checks `if (value === null || value === undefined)`
   - ✅ Использовать опциональные typeы (`?`) и nullish coalescing (`??`)

**Примеры правильной обработки null/undefined:**

```typescript
// ✅ ХОРОШО - check на null
const user = await this.prisma.user.findUnique({ where: { id } });
if (!user) {
  throw new NotFoundException('User not found');
}
// Теперь TypeScript знает, what user не null

// ✅ ХОРОШО - usage опциональных typeов
interface User {
  id: string;
  email: string;
  name: string | null; // Может быть null
}

// ✅ ХОРОШО - usage nullish coalescing
const userName = user.name ?? 'Unknown';

// ✅ ХОРОШО - type guard
function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'id' in value && 'email' in value;
}
```

### ❌ НАРУШЕНИЕ = COMMIT REJECTED!

Если found:

- ❌ Usage `any` или `unknown` without обоснования
- ❌ Usage `as` (type assertion) for обхода checks typeов
- ❌ Usage `!:` (definite assignment assertion)
- ❌ Присваивание пустых значений (`= ''`, `= 0`, `= []`, `= {}`) for исправления ошибок typeизации
- ❌ Отсутствие явных возвращаемых typeов
- ❌ Интерфейсы inline в коде (не в departmentьных fileах)
- ❌ Отсутствие typeов for parameterов функций

**Последствия:**

- ❌ Cannot commit
- ❌ Cannot merge
- ❌ Will cause code review rejection
- ❌ Blocks next task

**Проверка:**

```bash
# Проверка на any/unknown
grep -r ":\s*any\b\|:\s*unknown\b" libs/ apps/ --include="*.ts" --exclude-dir="node_modules" --exclude="*.spec.ts"

# Проверка на usage 'as' (type assertion)
grep -r "\sas\s" libs/ apps/ --include="*.ts" --exclude-dir="node_modules" --exclude="*.spec.ts"

# Проверка на usage '!:' (definite assignment assertion)
grep -r "!:" libs/ apps/ --include="*.ts" --exclude-dir="node_modules" --exclude="*.spec.ts"

# Проверка на whenсваивание пустых значений for исправления ошибок typeизации
# (нужно проверять вручную - искать паттерны: = '', = 0, = [], = {} в DTO классах)

# Проверка на отсутствие возвращаемых typeов (нужно проверять вручную)
# Искать функции without явного typeа возврата

# Проверка на inline interfaceы (нужно проверять вручную)
# Искать interface в fileах serviceов/componentов

# Проверка на переменные without typeов (нужно проверять вручную)
# Искать const/let without явного typeа

# Проверка на parameterы without typeов (нужно проверять вручную)
# Искать parameterы функций without typeов
```

**Подробнее о полном покрытии typeами см. `.specify/specs/005-development-process/TYPESCRIPT_TYPE_COVERAGE.md`**

---

## 🔗 Usage готовых библиотек typeов for интеграций

### 🔴 CRITICAL RULE: Использовать готовые typeы where возможно!

**✅ ОБЯЗАТЕЛЬНО:**

- ✅ Перед creationм собственных typeов проверять наличие готовых библиотек typeов
- ✅ Использовать официальные SDK с underдержкой TypeScript
- ✅ Использовать typeы из DefinitelyTyped (`@types/*`)
- ✅ Документировать используемые libraries typeов

**❌ ЗАПРЕЩЕНО:**

- ❌ Создавать собственные typeы, если exists готовые официальные typeы
- ❌ Дублировать typeы из официальных SDK
- ❌ Использовать `any` вместо установки готовых typeов

### 📦 Рекомендуемые libraries typeов по integrationм

#### 1. **Slack** - ✅ ОБЯЗАТЕЛЬНО use готовые typeы

**Пакеты:**

```bash
npm install @slack/web-api @slack/types
```

**Usage:**

```typescript
import { WebClient, ChatPostMessageArguments, UsersInfoResponse } from '@slack/web-api';

import { SlackEvent, MessageEvent, AppMentionEvent } from '@slack/types';
```

**Status:** ✅ Официальная underдержка, полное покрытие API

**Файлы for миграции:**

- `libs/integrations/communication/slack/src/interfaces/slack-events.interface.ts`
- `libs/integrations/communication/slack/src/interfaces/slack-api.interface.ts`

---

#### 2. **GitLab** - ✅ РЕКОМЕНДУЕТСЯ use готовые typeы

**Пакеты:**

```bash
npm install @gitbeaker/rest
```

**Usage:**

```typescript
import { Gitlab } from '@gitbeaker/rest';
import type { ProjectSchema, IssueSchema, MergeRequestSchema, UserSchema } from '@gitbeaker/rest';
```

**Status:** ✅ Активная underдержка, полное покрытие API

**Файлы for миграции:**

- `libs/integrations/code/gitlab/src/interfaces/gitlab-config.interface.ts`
- `libs/integrations/code/gitlab/src/interfaces/gitlab-api.interface.ts`

---

#### 3. **GitHub** - ✅ РЕКОМЕНДУЕТСЯ use готовые typeы

**Пакеты:**

```bash
npm install @octokit/types @octokit/rest
```

**Usage:**

```typescript
import { Octokit } from '@octokit/rest';
import type {
  ReposGetResponseData,
  IssuesGetResponseData,
  PullsGetResponseData,
} from '@octokit/types';
```

**Status:** ✅ Официальная underдержка, полное покрытие API

**Файлы for миграции:**

- `libs/integrations/code/github/src/interfaces/github-api.interface.ts`
- `libs/integrations/code/github/src/interfaces/github-config.interface.ts`

---

#### 4. **Jira** - ⚠️ ЧАСТИЧНО (оценить качество typeов)

**Пакеты:**

```bash
npm install jira-client
npm install --save-dev @types/jira-client
```

**Usage:**

```typescript
import JiraClient from 'jira-client';
// Типы могут быть неполными, может потребоваться дополнение
```

**Status:** ⚠️ Типы могут быть неполными, оценить before usageм

**Рекомендация:**

- Если typeы хорошие - use how основу
- Дополнять собственными typeами for недостающих частей
- Или продолжать use собственные typeы (текущий approach)

**Файлы for миграции:**

- `libs/integrations/project-management/jira/src/interfaces/jira-config.interface.ts`
- `libs/integrations/project-management/jira/src/interfaces/jira-api.interface.ts`

---

#### 5. **Telegram** - ✅ РЕКОМЕНДУЕТСЯ use готовые typeы

**Пакеты:**

```bash
npm install node-telegram-bot-api
npm install --save-dev @types/node-telegram-bot-api
```

**Usage:**

```typescript
import TelegramBot from 'node-telegram-bot-api';
import type { Message, Update, CallbackQuery } from 'node-telegram-bot-api';
```

**Status:** ✅ Типы доступны via DefinitelyTyped

**Файлы for миграции:**

- `libs/integrations/communication/telegram/src/interfaces/telegram-api.interface.ts`
- `libs/integrations/communication/telegram/src/interfaces/telegram-config.interface.ts`

---

#### 6. **Salesforce** - ✅ РЕКОМЕНДУЕТСЯ use готовые typeы

**Пакеты:**

```bash
npm install jsforce
npm install --save-dev @types/jsforce
```

**Usage:**

```typescript
import { Connection } from 'jsforce';
import type { QueryResult, Record } from 'jsforce';
```

**Status:** ✅ Типы доступны via DefinitelyTyped

**Файлы for миграции:**

- `libs/integrations/project-management/salesforce/src/interfaces/salesforce-api.interface.ts`
- `libs/integrations/project-management/salesforce/src/interfaces/salesforce-config.interface.ts`

---

#### 7. **AWS** - ✅ ОБЯЗАТЕЛЬНО use готовые typeы

**Пакеты:**

```bash
npm install @aws-sdk/client-s3 @aws-sdk/client-lambda
# и другие необходимые clientы
```

**Usage:**

```typescript
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import type { GetObjectCommandOutput } from '@aws-sdk/client-s3';
```

**Status:** ✅ Официальная underдержка, полное покрытие AWS SDK

**Файлы for миграции:**

- `libs/integrations/cloud/aws/src/interfaces/aws-client.interface.ts`
- `libs/integrations/cloud/aws/src/interfaces/aws-config.interface.ts`

---

#### 8. **Azure** - ✅ ОБЯЗАТЕЛЬНО use готовые typeы

**Пакеты:**

```bash
npm install @azure/identity @azure/storage-blob
# и другие необходимые packages
```

**Usage:**

```typescript
import { BlobServiceClient } from '@azure/storage-blob';
import type { BlobItem } from '@azure/storage-blob';
```

**Status:** ✅ Официальная underдержка, полное покрытие Azure SDK

**Файлы for миграции:**

- `libs/integrations/cloud/azure/src/interfaces/azure-service.interface.ts`
- `libs/integrations/cloud/azure/src/interfaces/azure-config.interface.ts`

---

#### 9. **GCP (Google Cloud)** - ✅ ОБЯЗАТЕЛЬНО use готовые typeы

**Пакеты:**

```bash
npm install @google-cloud/storage @google-cloud/functions
# и другие необходимые packages
```

**Usage:**

```typescript
import { Storage } from '@google-cloud/storage';
import type { Bucket, File } from '@google-cloud/storage';
```

**Status:** ✅ Официальная underдержка, полное покрытие GCP SDK

**Файлы for миграции:**

- `libs/integrations/cloud/gcp/src/interfaces/gcp-service.interface.ts`
- `libs/integrations/cloud/gcp/src/interfaces/gcp-config.interface.ts`

---

#### 10. **YouTube** - ✅ РЕКОМЕНДУЕТСЯ use готовые typeы

**Пакеты:**

```bash
npm install googleapis
```

**Usage:**

```typescript
import { youtube_v3, google } from 'googleapis';
import type { youtube_v3.Schema$Video, youtube_v3.Schema$Channel } from 'googleapis';
```

**Status:** ✅ Официальная underдержка Google, typeы включены

**Файлы for миграции:**

- `libs/integrations/e-commerce/video-commerce/youtube/src/interfaces/youtube-api.interface.ts`

---

#### 11. **E-commerce platforms** (Amazon, eBay, Ozon, Wildberries, Instagram, TikTok)

**Status:** ⚠️ Готовые typeы могут отсутствовать

**Рекомендация:**

- Проверить наличие официальных SDK с typeами
- Если нет - use собственные typeы на основе OpenAPI спецификаций
- Генерировать typeы из OpenAPI/Swagger спецификаций where возможно

**Пакеты for checks:**

```bash
# Amazon
npm search @amzn/selling-partner-api

# eBay
npm search ebay-api

# Instagram/TikTok
# Проверить официальные SDK
```

---

### 📋 Процесс выбора typeов

**Порядок priorityов:**

1. **Официальные SDK с TypeScript** (высший priority)

   - ✅ `@slack/web-api`, `@aws-sdk/*`, `@azure/*`, `@google-cloud/*`
   - ✅ Полная underдержка, регулярные updates

2. **DefinitelyTyped (`@types/*`)**

   - ✅ `@types/node-telegram-bot-api`, `@types/jsforce`
   - ✅ Поддерживается сообществом

3. **Сторонние libraries с typeами**

   - ✅ `@gitbeaker/rest`, `@octokit/rest`
   - ⚠️ Проверить актуальность и underдержку

4. **Генерация typeов из OpenAPI**

   - ✅ Использовать `openapi-typescript` for генерации
   - ✅ Если API предоставляет OpenAPI спецификацию

5. **Собственные typeы** (afterдний вариант)
   - ✅ Только если готовые typeы отсутствуют или неполные
   - ✅ Создавать на основе официальной documentации API

---

### ✅ Чек-лист before creationм собственных typeов

- [ ] Проверено наличие официальных SDK с TypeScript
- [ ] Проверено наличие typeов в DefinitelyTyped (`@types/*`)
- [ ] Проверено наличие сторонних библиотек с typeами
- [ ] Проверена возможность генерации typeов из OpenAPI
- [ ] Оценено качество готовых typeов (если exists)
- [ ] Документировано solution об usedии собственных typeов

---

### 🔄 Миграция на готовые typeы

**План миграции:**

1. **Установить необходимые packages**
2. **Заменить собственные interfaceы на typeы из библиотек**
3. **Обновить all usage старых typeов**
4. **Удалить дублирующиеся interfaceы**
5. **Обновить тесты**
6. **Проверить, what all работает**
7. **Обновить documentацию**

**Приоритет миграции:**

1. Slack (высший priority - официальные typeы)
2. AWS, Azure, GCP (официальные SDK)
3. GitHub, GitLab (активная underдержка)
4. Telegram, Salesforce (typeы из DefinitelyTyped)
5. Jira (оценить качество typeов)
6. E-commerce platforms (проверить наличие)

---

**Подробнее см. `.specify/specs/005-development-process/INTEGRATION_TYPES_STRATEGY.md`**

**Версия**: 3.5 (Added usage готовых библиотек typeов for интеграций)
**Обновлено**: 2025-01-XX
**Статус**: ACTIVE - ENFORCE IMMEDIATELY

---

## 📚 Дополнительные documentы по typeизации

### 1. Полное покрытие typeами

**Файл**: [`.specify/specs/005-development-process/TYPESCRIPT_TYPE_COVERAGE.md`](./TYPESCRIPT_TYPE_COVERAGE.md)

**Описание**: Детальные правила for обеспечения 100% покрытия typeами allго production кода.

**Ключевые правила**:

- ✅ Все переменные (`const`, `let`) должны иметь явные typeы
- ✅ Все parameterы функций должны иметь typeы
- ✅ Все возвращаемые значения должны иметь typeы
- ✅ Все свойства interfaceов должны иметь typeы
- ✅ Все сигналы (Angular) должны иметь typeы
- ✅ Все computed свойства должны иметь typeы
- ✅ Все callback функции должны иметь typeы
- ✅ Все generic typeы должны быть явными
- ✅ Все arrayы должны иметь typeы элементов
- ✅ Все objectы должны иметь typeы

**Чек-лист**: Полный чек-лист for каждого fileа и модуля

**Примеры**: Примеры правильной typeизации for serviceов, componentов, контроллеров

### 2. Any vs Unknown

**Файл**: [`.specify/specs/005-development-process/TYPESCRIPT_ANY_VS_UNKNOWN.md`](./TYPESCRIPT_ANY_VS_UNKNOWN.md)

**Описание**: Разница between `any` и `unknown`, when и how use.

**Ключевые правила**:

- ✅ Приоритет: конкретные typeы > `unknown` с type guards > `any` (только в исключительных случаях)
- ✅ `unknown` требует type guards for withoutопасного usage
- ✅ `any` отключает проверку typeов - use ТОЛЬКО с обоснованием

### 3. Прогресс исправления typeов

**Файл**: [`.specify/specs/005-development-process/TODO_TYPESCRIPT_TYPES_FIXES.md`](./TODO_TYPESCRIPT_TYPES_FIXES.md)

**Описание**: Текущий прогресс исправления allх `any` и `unknown` in project.

**Статус**: 🔄 In Progress - активная работа по исправлению typeов
