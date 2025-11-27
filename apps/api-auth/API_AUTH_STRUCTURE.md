# 📁 Структура API Auth - Полный список файлов

**Дата создания**: 2025-01-XX
**Версия**: 1.0.0

---

## 🎯 Обзор

API Auth - это микросервис аутентификации и авторизации для платформы Workix.

- **Порт**: `7102`
- **База данных**: `workix_auth` (порт `5102`)
- **Swagger**: `http://localhost:7102/docs`
- **Global Prefix**: `api-auth/v1`

---

## 📂 Структура директорий и файлов

### 🏗️ Корневая структура приложения (`apps/api-auth/`)

```
apps/api-auth/
├── src/                          # Исходный код приложения
├── prisma/                       # Prisma схема и миграции
├── dist/                         # Скомпилированный код
├── scripts/                      # Скрипты для тестирования
├── Dockerfile                    # Docker образ для production
├── Dockerfile.dev                # Docker образ для development
├── package.json                  # Зависимости проекта
├── project.json                  # NX конфигурация
├── tsconfig.json                 # TypeScript конфигурация
├── vite.config.ts                # Vite конфигурация
├── vitest.config.ts              # Vitest конфигурация
├── env.example                   # Пример переменных окружения
├── start.sh                      # Скрипт запуска
├── test-all-endpoints.sh         # Скрипт тестирования endpoints
└── README.md                     # Документация сервиса
```

---

## 📁 Детальная структура исходного кода

### 1. 🎯 Главные файлы приложения

#### `src/main.ts`
- Точка входа приложения
- Настройка NestJS приложения
- Конфигурация Swagger
- Настройка CORS и security headers
- Подключение микросервиса (Redis transport)
- Глобальные пайпы и фильтры

#### `src/app.module.ts`
- Главный модуль приложения
- Импорт всех модулей и контроллеров
- Конфигурация провайдеров

#### `src/app.module.interfaces.ts`
- Интерфейсы для AppModule

#### `src/register-paths.js`
- Регистрация путей для Swagger

---

### 2. 🔐 Контроллеры аутентификации (`src/auth/controllers/`)

#### Основные контроллеры:

**`auth.controller.ts`**
- Основной контроллер аутентификации
- Регистрация, вход, выход
- Обновление токенов
- Управление сессиями

**`auth.controller.dtos.ts`**
- DTO для auth контроллера

**`auth.controller.request-dtos.ts`**
- Request DTO для auth контроллера

**`auth.controller.interfaces.ts`**
- Интерфейсы для auth контроллера

**`auth.controller.types.ts`**
- Типы для auth контроллера

**`auth.controller.integration.spec.ts`**
- Интеграционные тесты auth контроллера

**`auth-microservice.controller.ts`**
- Контроллер для микросервисной коммуникации (Redis transport)
- Внутренние вызовы между сервисами

**`auth-security.controller.ts`**
- Контроллер безопасности
- Верификация security codes
- Управление подозрительной активностью

**`auth-security.controller.dtos.ts`**
- DTO для security контроллера

**`users.controller.ts`**
- Контроллер управления пользователями
- Профиль пользователя
- Обновление данных

**`users.controller.interfaces.ts`**
- Интерфейсы для users контроллера

**`README.integration-tests.md`**
- Документация по интеграционным тестам

---

### 3. 📧 Email Verification (`src/auth/email-verification/`)

#### Контроллеры:
- **`controllers/email-verification.controller.ts`** - Контроллер верификации email
- **`controllers/email-verification.controller.dtos.ts`** - DTO для email verification
- **`controllers/email-verification.controller.interfaces.ts`** - Интерфейсы

#### Сервисы:
- **`services/email-verification.service.spec.ts`** - Тесты email verification сервиса

---

### 4. 🔑 OAuth2 (`src/auth/oauth2/`)

#### Контроллеры:
- **`controllers/oauth2.controller.ts`** - Контроллер OAuth2 (Google, GitHub, Apple)
- **`controllers/oauth2.controller.type-guards.ts`** - Type guards для OAuth2

#### Сервисы:
- **`services/oauth2.service.spec.ts`** - Тесты OAuth2 сервиса

---

### 5. 📱 Phone OTP (`src/auth/phone-otp/`)

#### Контроллеры:
- **`controllers/phone-otp.controller.ts`** - Контроллер Phone OTP аутентификации
- **`controllers/phone-otp.controller.dtos.ts`** - DTO для Phone OTP
- **`controllers/phone-otp.controller.interfaces.ts`** - Интерфейсы

#### Сервисы:
- **`services/phone-otp.service.spec.ts`** - Тесты Phone OTP сервиса

---

### 6. 🛡️ Guards (`src/auth/guards/`)

- **`service-auth.guard.ts`** - Guard для аутентификации сервис-сервис вызовов

---

### 7. 🔒 Security (`src/auth/security/`)

- Директория для дополнительных security компонентов

---

### 8. 🧪 Тесты (`src/auth/`)

- **`auth.service.spec.ts`** - Тесты auth сервиса
- **`services/jwt.service.spec.ts`** - Тесты JWT сервиса
- **`services/password.service.spec.ts`** - Тесты password сервиса

---

### 9. 📨 Subscribers (`src/auth/services/`)

- **`user-registration-subscriber.service.ts`** - Подписчик на события регистрации пользователей

---

### 10. 🗄️ Prisma (`src/prisma/`)

- **`prisma.module.ts`** - Модуль Prisma (@Global)
- **`auth-prisma.service.ts`** - Сервис Prisma для auth

---

### 11. 🔐 RBAC (`src/rbac/`)

- **`rbac.controller.ts`** - Контроллер Role-Based Access Control

---

## 📚 Доменная библиотека (`libs/domain/auth/`)

### 🎯 Главные модули

#### `src/auth.module.ts`
- Главный модуль аутентификации
- Экспорт всех сервисов и компонентов
- Конфигурация JWT, Passport

#### `src/index.ts`
- Публичный API библиотеки
- Экспорт всех компонентов

---

### ⚙️ Конфигурация (`src/config/`)

- **`auth-config.schema.ts`** - Схема валидации конфигурации
- **`auth-config.service.ts`** - Сервис конфигурации аутентификации
- **`auth-features.config.ts`** - Конфигурация feature flags

---

### 🔧 Сервисы (`src/services/`)

#### Основные сервисы:

1. **`auth.service.ts`** - Основной сервис аутентификации
2. **`jwt.service.ts`** - Управление JWT токенами
3. **`password.service.ts`** - Хеширование и валидация паролей
4. **`password-reset.service.ts`** - Сброс пароля
5. **`password-reset.service.spec.ts`** - Тесты password reset
6. **`two-factor.service.ts`** - Двухфакторная аутентификация (TOTP)
7. **`two-factor.service.spec.ts`** - Тесты 2FA
8. **`session.service.ts`** - Управление сессиями
9. **`refresh-token-blacklist.service.ts`** - Черный список refresh токенов
10. **`jwt-blacklist.service.ts`** - Черный список JWT токенов
11. **`biometric.service.ts`** - Биометрическая аутентификация
12. **`biometric.service.spec.ts`** - Тесты biometric
13. **`oauth2-refresh.service.ts`** - Обновление OAuth2 токенов
14. **`password-breach.service.ts`** - Проверка паролей на утечки
15. **`audit-log.service.ts`** - Логирование аудита

---

### 🔒 Security сервисы (`src/security/services/`)

1. **`account-security.service.ts`** - Безопасность аккаунта
2. **`threat-detection.service.ts`** - Обнаружение угроз
3. **`security-code.service.ts`** - Генерация и проверка security codes
4. **`ip-blocking.service.ts`** - Блокировка IP адресов
5. **`geolocation.service.ts`** - Геолокация и обнаружение аномалий
6. **`injection-detector.service.ts`** - Обнаружение инъекций (SQL, XSS, Command, Path Traversal)
7. **`data-cleanup.service.ts`** - Очистка данных
8. **`data-cleanup-scheduler.service.ts`** - Планировщик очистки данных

---

### 📧 Email Verification (`src/email-verification/`)

#### Модуль:
- **`email-verification.module.ts`** - Модуль верификации email

#### DTO:
- **`dto/email-verification.dto.ts`** - DTO для email verification

#### Сервисы:
- **`services/email-verification.service.ts`** - Сервис верификации email

---

### 🔑 OAuth2 (`src/oauth2/`)

#### Модуль:
- **`oauth2.module.ts`** - Модуль OAuth2

#### DTO:
- **`dto/oauth-callback.dto.ts`** - DTO для OAuth callback

#### Сервисы:
- **`services/oauth2.service.ts`** - Сервис OAuth2

#### Стратегии:
- **`strategies/google.strategy.ts`** - Стратегия Google OAuth
- **`strategies/github.strategy.ts`** - Стратегия GitHub OAuth
- **`strategies/apple.strategy.ts`** - Стратегия Apple OAuth

---

### 📱 Phone OTP (`src/phone-otp/`)

#### Модуль:
- **`phone-otp.module.ts`** - Модуль Phone OTP

#### DTO:
- **`dto/phone-otp.dto.ts`** - DTO для Phone OTP

#### Сервисы:
- **`services/phone-otp.service.ts`** - Сервис Phone OTP

---

### 🛡️ Security модуль (`src/security/`)

#### Модуль:
- **`security.module.ts`** - Модуль безопасности

#### Middleware:
- **`middleware/security-threat.middleware.ts`** - Middleware для обнаружения угроз

#### Интерфейсы:
- **`interfaces/`** - Интерфейсы для security

---

### 📝 DTO (`src/dto/`)

1. **`login.dto.ts`** - DTO для входа
2. **`register.dto.ts`** - DTO для регистрации
3. **`password-reset.dto.ts`** - DTO для сброса пароля
4. **`two-factor.dto.ts`** - DTO для 2FA
5. **`session.dto.ts`** - DTO для сессий
6. **`auth-response.dto.ts`** - DTO ответа аутентификации
7. **`biometric.dto.ts`** - DTO для биометрии

---

### 🔌 Интерфейсы (`src/interfaces/`)

1. **`jwt-payload.interface.ts`** - Интерфейс JWT payload
2. **`oauth-profile.interface.ts`** - Интерфейс OAuth профиля
3. **`prisma-auth.interface.ts`** - Интерфейс Prisma для auth
4. **`device.interface.ts`** - Интерфейс устройства
5. **`express.interface.ts`** - Интерфейсы Express
6. **`i18n-auth.interface.ts`** - Интерфейсы i18n для auth

---

### 🎭 Декораторы (`src/decorators/`)

1. **`current-user.decorator.ts`** - Декоратор для получения текущего пользователя
2. **`public.decorator.ts`** - Декоратор для публичных endpoints

---

### 🛡️ Guards (`src/guards/`)

1. **`jwt.guard.ts`** - Guard для JWT аутентификации

---

### 🎯 Стратегии (`src/strategies/`)

1. **`jwt.strategy.ts`** - Стратегия JWT для Passport

---

### 🔄 Middleware (`src/middleware/`)

1. **`rate-limit.middleware.ts`** - Middleware для rate limiting
2. **`security-headers.middleware.ts`** - Middleware для security headers

---

### ✅ Валидаторы (`src/validators/`)

1. **`email.validator.ts`** - Валидатор email

---

### 🛠️ Утилиты (`src/utils/`)

1. **`email-sanitizer.ts`** - Санитизация email

---

### 📊 Данные (`src/data/`)

1. **`common-passwords.ts`** - Список распространенных паролей

---

## 📊 Статистика

### Всего файлов:

#### В приложении (`apps/api-auth/src/`):
- **Контроллеры**: 8
- **Модули**: 2
- **Сервисы**: 2 (в приложении)
- **Guards**: 1
- **Prisma**: 2
- **Тесты**: 6+

#### В библиотеке (`libs/domain/auth/src/`):
- **Модули**: 5
- **Сервисы**: 24
- **DTO**: 7 основных + подмодули
- **Стратегии**: 4
- **Guards**: 1
- **Декораторы**: 2
- **Middleware**: 2
- **Интерфейсы**: 6
- **Валидаторы**: 1
- **Утилиты**: 1

---

## 🔗 Зависимости

### Используемые библиотеки:
- `@workix/domain/auth` - Доменная логика аутентификации
- `@workix/domain/users` - Управление пользователями
- `@workix/infrastructure/i18n` - Интернационализация
- `@workix/infrastructure/message-broker` - Message broker
- `@workix/shared/backend/core` - Общие backend компоненты

---

## 🎯 Основные функции

1. ✅ Регистрация и вход пользователей
2. ✅ JWT токены (access & refresh)
3. ✅ Сброс пароля
4. ✅ Двухфакторная аутентификация (2FA/TOTP)
5. ✅ OAuth2 (Google, GitHub, Apple)
6. ✅ Верификация email
7. ✅ Phone OTP аутентификация
8. ✅ Security code verification
9. ✅ Управление профилем пользователя
10. ✅ Управление сессиями
11. ✅ Биометрическая аутентификация
12. ✅ Обнаружение угроз и блокировка IP
13. ✅ Обнаружение инъекций
14. ✅ Геолокация и обнаружение аномалий
15. ✅ Аудит логирование

---

## 📋 Полный список всех TypeScript файлов

### Приложение (`apps/api-auth/src/`)

```
apps/api-auth/src/
├── app.module.interfaces.ts
├── app.module.ts
├── main.ts
├── register-paths.js
├── auth/
│   ├── auth.service.spec.ts
│   ├── controllers/
│   │   ├── auth.controller.dtos.ts
│   │   ├── auth.controller.integration.spec.ts
│   │   ├── auth.controller.interfaces.ts
│   │   ├── auth.controller.request-dtos.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.controller.types.ts
│   │   ├── auth-microservice.controller.ts
│   │   ├── auth-security.controller.dtos.ts
│   │   ├── auth-security.controller.ts
│   │   ├── users.controller.interfaces.ts
│   │   ├── users.controller.ts
│   │   └── README.integration-tests.md
│   ├── email-verification/
│   │   ├── controllers/
│   │   │   ├── email-verification.controller.dtos.ts
│   │   │   ├── email-verification.controller.interfaces.ts
│   │   │   └── email-verification.controller.ts
│   │   └── services/
│   │       └── email-verification.service.spec.ts
│   ├── guards/
│   │   └── service-auth.guard.ts
│   ├── oauth2/
│   │   ├── controllers/
│   │   │   ├── oauth2.controller.ts
│   │   │   └── oauth2.controller.type-guards.ts
│   │   └── services/
│   │       └── oauth2.service.spec.ts
│   ├── phone-otp/
│   │   ├── controllers/
│   │   │   ├── phone-otp.controller.dtos.ts
│   │   │   ├── phone-otp.controller.interfaces.ts
│   │   │   └── phone-otp.controller.ts
│   │   └── services/
│   │       └── phone-otp.service.spec.ts
│   ├── security/
│   └── services/
│       ├── jwt.service.spec.ts
│       ├── password.service.spec.ts
│       └── user-registration-subscriber.service.ts
├── prisma/
│   ├── auth-prisma.service.ts
│   └── prisma.module.ts
└── rbac/
    └── rbac.controller.ts
```

**Всего файлов в приложении**: 35 TypeScript файлов

---

### Доменная библиотека (`libs/domain/auth/src/`)

```
libs/domain/auth/src/
├── auth.module.ts
├── index.ts
├── config/
│   ├── auth-config.schema.ts
│   ├── auth-config.service.ts
│   └── auth-features.config.ts
├── data/
│   └── common-passwords.ts
├── decorators/
│   ├── current-user.decorator.ts
│   └── public.decorator.ts
├── dto/
│   ├── auth-response.dto.ts
│   ├── biometric.dto.ts
│   ├── login.dto.ts
│   ├── password-reset.dto.ts
│   ├── register.dto.ts
│   ├── session.dto.ts
│   └── two-factor.dto.ts
├── email-verification/
│   ├── dto/
│   │   └── email-verification.dto.ts
│   ├── email-verification.module.ts
│   └── services/
│       └── email-verification.service.ts
├── guards/
│   └── jwt.guard.ts
├── interfaces/
│   ├── device.interface.ts
│   ├── express.interface.ts
│   ├── i18n-auth.interface.ts
│   ├── jwt-payload.interface.ts
│   ├── oauth-profile.interface.ts
│   └── prisma-auth.interface.ts
├── middleware/
│   ├── rate-limit.middleware.ts
│   └── security-headers.middleware.ts
├── oauth2/
│   ├── dto/
│   │   └── oauth-callback.dto.ts
│   ├── oauth2.module.ts
│   ├── services/
│   │   └── oauth2.service.ts
│   └── strategies/
│       ├── apple.strategy.ts
│       ├── github.strategy.ts
│       └── google.strategy.ts
├── phone-otp/
│   ├── dto/
│   │   └── phone-otp.dto.ts
│   ├── phone-otp.module.ts
│   └── services/
│       └── phone-otp.service.ts
├── security/
│   ├── middleware/
│   │   └── security-threat.middleware.ts
│   ├── security.module.ts
│   └── services/
│       ├── account-security.service.ts
│       ├── data-cleanup-scheduler.service.ts
│       ├── data-cleanup.service.ts
│       ├── geolocation.service.ts
│       ├── injection-detector.service.ts
│       ├── ip-blocking.service.ts
│       ├── security-code.service.ts
│       └── threat-detection.service.ts
├── services/
│   ├── audit-log.service.ts
│   ├── auth.service.ts
│   ├── biometric.service.spec.ts
│   ├── biometric.service.ts
│   ├── jwt-blacklist.service.ts
│   ├── jwt.service.ts
│   ├── oauth2-refresh.service.ts
│   ├── password-breach.service.ts
│   ├── password-reset.service.spec.ts
│   ├── password-reset.service.ts
│   ├── password.service.ts
│   ├── refresh-token-blacklist.service.ts
│   ├── session.service.ts
│   ├── two-factor.service.spec.ts
│   └── two-factor.service.ts
├── strategies/
│   └── jwt.strategy.ts
├── utils/
│   └── email-sanitizer.ts
└── validators/
    └── email.validator.ts
```

**Всего файлов в библиотеке**: 65 TypeScript файлов

---

## 📊 Итоговая статистика

- **Всего TypeScript файлов**: 100
- **В приложении (`apps/api-auth/src/`)**: 35 файлов
- **В библиотеке (`libs/domain/auth/src/`)**: 65 файлов
- **Контроллеры**: 8
- **Сервисы**: 26
- **Модули**: 7
- **DTO**: 14
- **Стратегии**: 4
- **Guards**: 2
- **Middleware**: 3
- **Интерфейсы**: 6
- **Декораторы**: 2
- **Валидаторы**: 1
- **Утилиты**: 1

---

## 📝 Примечания

- Все бизнес-логика находится в `libs/domain/auth`
- Приложение (`apps/api-auth`) содержит только контроллеры и конфигурацию
- Используется Prisma для работы с БД
- Поддерживается микросервисная коммуникация через Redis
- Полная поддержка Swagger документации
