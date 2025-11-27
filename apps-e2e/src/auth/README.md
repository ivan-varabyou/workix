# 🧪 Auth Service E2E Tests

Comprehensive End-to-End tests for the Auth Service with real database.

## 📋 Overview

These E2E tests validate the complete authentication flow:

- ✅ User Registration
- ✅ User Login
- ✅ Token Generation and Verification
- ✅ Token Refresh
- ✅ Protected Routes (Get Current User)
- ✅ Password Reset Flow
- ✅ Error Handling (Validation, Unauthorized, etc.)

## 🏗️ Test Structure

```
apps-e2e/src/auth/
├── auth.spec.ts              # Main E2E test suite
└── README.md                 # This file

apps-e2e/src/support/
└── auth-test-setup.ts        # Test setup configuration
```

## 🚀 Quick Start

### Prerequisites

1. **Docker** - for launchа PostgreSQL
2. **Auth Service** - должен быть запущен на порту 7200

### Option 1: Автоматический launch (рекомендуется)

```bash
# Автоматически настраивает окрalreadyние и launchает тесты
npm run test:auth:e2e:full
```

### Option 2: Ручной launch

#### Шаг 1: Настройка окрalreadyния

```bash
# Запускает Docker с PostgreSQL и настраивает переменные окрalreadyния
npm run test:auth:e2e:setup
```

#### Шаг 2: Запуск Auth Service

```bash
# В departmentьном terminalе
npm run api:auth
```

#### Шаг 3: Запуск тестов

```bash
# Запуск allх тестов
npm run test:auth:e2e

# Запуск в watch modeе
npm run test:auth:e2e:watch
```

## 📊 Test Coverage

### 1. Health Check (1 test)
- ✅ Health endpoint availability

### 2. Registration (5 tests)
- ✅ Successful registration
- ✅ Invalid email validation
- ✅ Weak password validation
- ✅ Duplicate email handling
- ✅ Missing fields validation

### 3. Login (4 tests)
- ✅ Successful login with correct credentials
- ✅ Wrong password handling
- ✅ Non-existent email handling
- ✅ Missing credentials validation

### 4. Token Verification (3 tests)
- ✅ Valid token verification
- ✅ Invalid token handling
- ✅ Empty token handling

### 5. Get Current User (3 tests)
- ✅ Get user with valid token
- ✅ Unauthorized without token
- ✅ Unauthorized with invalid token

### 6. Token Refresh (3 tests)
- ✅ Successful token refresh
- ✅ Invalid refresh token handling
- ✅ Missing refresh token validation

### 7. Password Reset Flow (3 tests)
- ✅ Request password reset
- ✅ Non-existent user handling
- ✅ Missing email validation

### 8. Error Handling (2 tests)
- ✅ Validation error format
- ✅ Unauthorized error format

**Total: 24 E2E tests**

## 🔧 Configuration

### Environment Variables

```bash
# Auth Service URL
export AUTH_SERVICE_URL="http://localhost:7200"
export AUTH_SERVICE_PORT="7200"

# Database
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/workix_monolith"
export DATABASE_URL_AUTH="postgresql://postgres:postgres@localhost:5432/workix_monolith"
```

### Test Timeout

- Default: 30 seconds per test
- Can be adjusted in `vitest.config.auth.ts`

## 📝 Test Data

Tests use dynamic test data:
- Email: `test-{timestamp}@example.com`
- Password: `TestPassword123!@#`
- Name: `Test User`

Each test run creates a new user to avoid conflicts.

## 🐛 Troubleshooting

### Auth Service не запущен

```bash
# Проверьте, запущен ли service
curl http://localhost:7200/api/auth/health

# Запустите service
npm run api:auth
```

### База данных не доступна

```bash
# Проверьте Docker контейнер
docker ps | grep workix-postgres

# Запустите базу данных
docker-compose up -d postgres

# Проверьте connection
docker exec workix-postgres pg_isready -U postgres
```

### Ошибки миграций Prisma

```bash
cd apps/api-auth
npx prisma migrate deploy
npx prisma generate
```

## 📚 Related Documentation

- [E2E Testing Guide](../../.specify/specs/000-project/E2E_TESTING_GUIDE.md)
- [Testing Architecture](../../.specify/specs/005-development-process/TESTING_ARCHITECTURE.md)
- [Auth Service README](../../apps/api-auth/README.md)

## ✅ Best Practices

1. **Изоляция тестов**: Каждый тест должен быть независимым
2. **Очистка данных**: Тесты создают временных users
3. **Реальная БД**: Используется реальная PostgreSQL via Docker
4. **Валидация ошибок**: Проверяются не только успешные сpriceрии, но и errors
5. **Таймауты**: Достаточные таймауты for e2e тестов (30 сек)
