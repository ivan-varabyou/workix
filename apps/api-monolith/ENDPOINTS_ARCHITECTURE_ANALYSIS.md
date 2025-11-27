# 📊 Полный анализ эндпоинтов и архитектуры

**Date:** 2025-11-16
**Status:** 🔍 Анализ архитектуры и распределения эндпоинтов

---

## 🏗️ Архитектура systems

```
┌─────────────────────────────────────┐
│  CLIENT / BROWSER                    │
│  (localhost:4200/docs)              │
└────────────────┬────────────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │  API GATEWAY (Port 4200)   │
    │  Base: /api/v1/*           │
    │  ├─ Service Discovery      │
    │  ├─ Request Routing        │
    │  └─ Health Checks          │
    └────┬───────┬───────┬───────┘
         │       │       │
    ┌────┘       │       │
    │       ┌────┘       │
    │       │       ┌────┘
    ▼       ▼       ▼
┌─────────┬──────────┬──────────┐
│ Auth    │ Monolith │ Gateway  │
│ Service │ API      │ Only     │
│ (7200)  │ (7000)   │          │
└─────────┴──────────┴──────────┘
```

---

## 📋 Правильное распределение эндпоинтов

### 🔐 Auth API (Port 7200)
**Base Path:** `/api/v1/auth` (via Gateway) или `/api/auth` (напрямую)

**Должен содержать:**
- ✅ Регистрация, логин, logout
- ✅ Верификация токенов
- ✅ Refresh токенов
- ✅ OAuth2 (Google, GitHub, Apple)
- ✅ 2FA (двухфаwhoрная аутентификация)
- ✅ Phone OTP
- ✅ Email Verification
- ✅ Password Reset
- ✅ **Управление пользователями** (GET /users, GET /users/:id, PUT /users/:id, DELETE /users/:id)
- ✅ **Профили users** (UserProfile)

**Текущее status:**
- ✅ Регистрация, логин, верификация - ЕСТЬ
- ✅ OAuth2 - ЕСТЬ
- ✅ 2FA - ЕСТЬ
- ✅ Phone OTP - ЕСТЬ
- ✅ Email Verification - ЕСТЬ
- ✅ Password Reset - ЕСТЬ
- ❌ **Управление пользователями - ОТСУТСТВУЕТ (exists в монолите!)**

---

### 🏢 Monolith API (Port 7000)
**Base Path:** `/api/v1/*` (via Gateway) или `/api/v1/*` (напрямую)

**Должен содержать:**
- ✅ Pipelines (creation, управление, execution)
- ✅ RBAC (роли, разрешения)
- ✅ Workers (виртуальные воркеры)
- ✅ Integrations (провайдеры, credentials, конфигурация)
- ✅ Analytics (универсальная analytics)
- ✅ E-commerce (продукты, продавцы, категории)
- ✅ Generation (AI generation: текст, изображения, видео, speech, embeddings)
- ✅ A/B Testing
- ✅ Monitoring (health интеграций, metrics, алерты)
- ❌ **Управление пользователями - НЕ ДОЛЖНО БЫТЬ!**

**Текущее status:**
- ✅ Pipelines - ЕСТЬ
- ✅ RBAC - ЕСТЬ
- ✅ Workers - ЕСТЬ
- ✅ Integrations - ЕСТЬ
- ✅ Analytics - ЕСТЬ
- ✅ E-commerce - ЕСТЬ
- ✅ Generation - ЕСТЬ
- ✅ A/B Testing - ЕСТЬ
- ✅ Monitoring - ЕСТЬ
- ❌ **Users Controller - НЕПРАВИЛЬНО РАЗМЕЩЕН!**

---

### 🌐 API Gateway (Port 4200)
**Base Path:** `/api/v1/*`

**Functions:**
- ✅ Маршрутизация requestов к микроserviceам
- ✅ Service Discovery
- ✅ Health Checks
- ✅ Swagger documentация (агрегированная)

**Маршрутизация:**
```
/api/v1/auth/*          → Auth Service (7200)
/api/v1/users/*         → Auth Service (7200) - УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ
/api/v1/pipelines/*     → Monolith API (7000)
/api/v1/rbac/*          → Monolith API (7000)
/api/v1/workers/*        → Monolith API (7000)
/api/v1/integrations/*   → Monolith API (7000)
/api/v1/analytics/*      → Monolith API (7000)
/api/v1/generation/*     → Monolith API (7000)
/api/v1/ab-tests/*       → Monolith API (7000)
```

---

## 📊 Полный список allх эндпоинтов

### 🔐 Auth API (Port 7200) - 27 эндпоинтов

#### Authentication (6)
1. ✅ `POST /api/auth/register` - Регистрация
2. ✅ `POST /api/auth/login` - Вход
3. ✅ `POST /api/auth/verify` - Верификация токена
4. ✅ `POST /api/auth/refresh` - Обновление токена
5. ✅ `GET /api/auth/me` - Текущий пользователь
6. ✅ `GET /api/auth/health` - Health check

#### Password Reset (3)
7. ✅ `POST /api/auth/password-reset/request` - Запрос сброса
8. ✅ `POST /api/auth/password-reset/verify` - Проверка токена
9. ✅ `POST /api/auth/password-reset/confirm` - Подтверждение сброса

#### 2FA (6)
10. ✅ `POST /api/auth/2fa/generate` - Генерация секрета
11. ✅ `POST /api/auth/2fa/enable` - Включение 2FA
12. ✅ `POST /api/auth/2fa/verify` - Проверка кода
13. ✅ `DELETE /api/auth/2fa/disable` - Отключение 2FA
14. ✅ `GET /api/auth/2fa/status` - Статус 2FA
15. ✅ `POST /api/auth/2fa/regenerate-backup-codes` - Реgeneration кодов

#### OAuth2 (6)
16. ✅ `GET /api/auth/oauth/google` - Google OAuth2
17. ✅ `GET /api/auth/oauth/google/callback` - Google Callback
18. ✅ `GET /api/auth/oauth/github` - GitHub OAuth2
19. ✅ `GET /api/auth/oauth/github/callback` - GitHub Callback
20. ✅ `GET /api/auth/oauth/apple` - Apple Sign In
21. ✅ `GET /api/auth/oauth/apple/callback` - Apple Callback

#### Phone OTP (2)
22. ✅ `POST /api/auth/phone-otp/send` - Отправка OTP
23. ✅ `POST /api/auth/phone-otp/verify` - Проверка OTP

#### Email Verification (4)
24. ✅ `POST /api/auth/email-verification/send` - Отправка письма
25. ✅ `POST /api/auth/email-verification/verify` - Верификация email
26. ✅ `POST /api/auth/email-verification/resend` - Повторная отправка
27. ✅ `GET /api/auth/email-verification/status` - Статус верификации

#### ❌ Отсутствует: User Management (4)
28. ❌ `GET /api/users` - Список users (с пагинацией)
29. ❌ `GET /api/users/:userId` - Профиль пользователя
30. ❌ `PUT /api/users/:userId` - Обновление профиля
31. ❌ `DELETE /api/users/:userId` - Удаление пользователя
32. ❌ `POST /api/users/:userId/avatar` - Загрузка аватара

**Итого в Auth API:** 27 эндпоинтов (должно быть 32)

---

### 🏢 Monolith API (Port 7000) - 100+ эндпоинтов

#### App Controller (3)
1. ✅ `GET /api/v1/health` - Health check
2. ✅ `GET /api/v1/info` - Информация об API
3. ✅ `GET /api/v1/stats` - Статистика systems

#### ❌ Users Controller (4) - НЕПРАВИЛЬНО РАЗМЕЩЕН!
4. ❌ `GET /api/v1/users/:userId` - **ДОЛЖНО БЫТЬ В AUTH API**
5. ❌ `PUT /api/v1/users/:userId` - **ДОЛЖНО БЫТЬ В AUTH API**
6. ❌ `POST /api/v1/users/:userId/avatar` - **ДОЛЖНО БЫТЬ В AUTH API**
7. ❌ `DELETE /api/v1/users/:userId` - **ДОЛЖНО БЫТЬ В AUTH API**

#### Pipelines Controller (6)
8. ✅ `POST /api/v1/pipelines` - Создание пайплайна
9. ✅ `GET /api/v1/pipelines` - Список пайплайнов пользователя
10. ✅ `GET /api/v1/pipelines/:id` - Получение пайплайна
11. ✅ `PUT /api/v1/pipelines/:id` - Обновление пайплайна
12. ✅ `DELETE /api/v1/pipelines/:id` - Удаление пайплайна
13. ✅ `GET /api/v1/pipelines/marketplace/list` - Публичные пайплайны

#### RBAC Controller (9)
14. ✅ `POST /api/v1/rbac/roles` - Создание роли
15. ✅ `GET /api/v1/rbac/roles` - Список ролей
16. ✅ `GET /api/v1/rbac/roles/:id` - Получение роли
17. ✅ `PUT /api/v1/rbac/roles/:id` - Обновление роли
18. ✅ `DELETE /api/v1/rbac/roles/:id` - Удаление роли
19. ✅ `POST /api/v1/rbac/permissions` - Создание разрешения
20. ✅ `GET /api/v1/rbac/permissions` - Список разрешений
21. ✅ `POST /api/v1/rbac/assign-role` - Наvalue роли
22. ✅ `DELETE /api/v1/rbac/assign-role` - Удаление роли

#### Workers Controller (13)
23. ✅ `POST /api/v1/workers` - Создание воркера
24. ✅ `GET /api/v1/workers` - Список воркеров
25. ✅ `GET /api/v1/workers/:workerId` - Получение воркера
26. ✅ `PUT /api/v1/workers/:workerId` - Обновление воркера
27. ✅ `DELETE /api/v1/workers/:workerId` - Удаление воркера
28. ✅ `POST /api/v1/workers/:workerId/tasks` - Наvalue задачи
29. ✅ `GET /api/v1/workers/:workerId/tasks` - Список задач
30. ✅ `GET /api/v1/workers/:workerId/tasks/:taskId` - Получение задачи
31. ✅ `PUT /api/v1/workers/:workerId/tasks/:taskId/cancel` - Отмена задачи
32. ✅ `GET /api/v1/workers/:workerId/status` - Статус воркера
33. ✅ `PUT /api/v1/workers/:workerId/pause` - Пауза воркера
34. ✅ `PUT /api/v1/workers/:workerId/resume` - Возupdate воркера
35. ✅ `GET /api/v1/workers/:workerId/metrics` - Меthreeки воркера

#### A/B Testing Controller (8)
36. ✅ `POST /api/v1/ab-tests` - Создание A/B теста
37. ✅ `GET /api/v1/ab-tests` - Список A/B тестов
38. ✅ `GET /api/v1/ab-tests/:testId` - Получение A/B теста
39. ✅ `POST /api/v1/ab-tests/:testId/track` - Трекинг события
40. ✅ `GET /api/v1/ab-tests/:testId/results` - Результаты теста
41. ✅ `PUT /api/v1/ab-tests/:testId/end` - Завершение теста
42. ✅ `PUT /api/v1/ab-tests/:testId/pause` - Пауза теста
43. ✅ `PUT /api/v1/ab-tests/:testId/resume` - Возupdate теста

#### Integration CRUD Controller (13)
44. ✅ `GET /api/v1/integrations/providers` - Список провайдеров
45. ✅ `GET /api/v1/integrations/providers/:id` - Получение провайдера
46. ✅ `POST /api/v1/integrations/providers` - Создание провайдера
47. ✅ `PUT /api/v1/integrations/providers/:id` - Обновление провайдера
48. ✅ `DELETE /api/v1/integrations/providers/:id` - Удаление провайдера
49. ✅ `POST /api/v1/integrations/providers/:id/credentials` - Добавление credentials
50. ✅ `GET /api/v1/integrations/providers/:id/credentials` - Список credentials
51. ✅ `GET /api/v1/integrations/providers/credentials/:credentialId` - Получение credential
52. ✅ `PUT /api/v1/integrations/providers/credentials/:credentialId` - Обновление credential
53. ✅ `DELETE /api/v1/integrations/providers/credentials/:credentialId` - Удаление credential
54. ✅ `POST /api/v1/integrations/providers/:id/credentials/rotate` - Ротация credentials
55. ✅ `POST /api/v1/integrations/providers/:id/config` - Установка конфигурации
56. ✅ `GET /api/v1/integrations/providers/:id/config` - Получение конфигурации

#### E-commerce Controller (7)
57. ✅ `GET /api/v1/integrations/ecommerce/products/search` - Поиск продуwhoв
58. ✅ `POST /api/v1/integrations/ecommerce/products/upload` - Загрузка продукта
59. ✅ `GET /api/v1/integrations/ecommerce/products/:provider/:productId` - Статистика продукта
60. ✅ `PUT /api/v1/integrations/ecommerce/products/:provider/:productId` - Обновление продукта
61. ✅ `POST /api/v1/integrations/ecommerce/products/bulk-upload` - Массовая загрузка
62. ✅ `GET /api/v1/integrations/ecommerce/sellers/:provider/metrics` - Меthreeки продавца
63. ✅ `GET /api/v1/integrations/ecommerce/categories/:provider` - Категории

#### Analytics Controller (4)
64. ✅ `POST /api/v1/analytics/universal/analyze` - Анализ данных
65. ✅ `POST /api/v1/analytics/universal/retention` - Анализ удержания
66. ✅ `POST /api/v1/analytics/universal/predict` - Прогнозирование
67. ✅ `POST /api/v1/analytics/universal/compare` - Сравнение данных

#### Integration Monitoring Controller (3)
68. ✅ `GET /api/v1/integrations/monitoring/health` - Здоровье провайдеров
69. ✅ `GET /api/v1/integrations/monitoring/alerts` - Алерты
70. ✅ `GET /api/v1/integrations/monitoring/dashboard` - Дашборд

#### Integration Metrics Controller (3)
71. ✅ `GET /api/v1/integrations/metrics` - Общие metrics
72. ✅ `GET /api/v1/integrations/metrics/provider/:providerId` - Меthreeки провайдера
73. ✅ `GET /api/v1/integrations/metrics/errors` - Ошибки

#### Integration Health Controller (2)
74. ✅ `GET /api/v1/integrations/health` - Общее health
75. ✅ `GET /api/v1/integrations/health/:providerId` - Здоровье провайдера

#### Credential Rotation Controller (4)
76. ✅ `POST /api/v1/integrations/credentials/rotate/all` - Ротация allх
77. ✅ `POST /api/v1/integrations/credentials/rotate/provider/:providerId` - Ротация провайдера
78. ✅ `POST /api/v1/integrations/credentials/rotate/expired` - Ротация истекших
79. ✅ `POST /api/v1/integrations/credentials/rotate/expiring` - Ротация истекающих

#### Generation Controller (13)
80. ✅ `POST /api/v1/generation/text` - Генерация текста
81. ✅ `POST /api/v1/generation/text/variations` - Вариации текста
82. ✅ `POST /api/v1/generation/image` - Генерация изображения
83. ✅ `POST /api/v1/generation/image/variations` - Вариации изображения
84. ✅ `POST /api/v1/generation/video` - Генерация видео
85. ✅ `POST /api/v1/generation/speech` - Генерация речи
86. ✅ `POST /api/v1/generation/vision/analyze` - Анализ изображения
87. ✅ `POST /api/v1/generation/search` - Поиск в интернете
88. ✅ `POST /api/v1/generation/embedding` - Генерация эмбеддинга
89. ✅ `POST /api/v1/generation/context` - Генерация контекста
90. ✅ `POST /api/v1/generation/translate` - Перевод
91. ✅ `POST /api/v1/generation/translate/detect` - Определение языка
92. ✅ `POST /api/v1/generation/quality/score` - Оценка качества

**Итого в Monolith API:** 100 эндпоинтов (4 неправильно размещены)

---

## 🚨 Проблемы архитектуры

### 1. ❌ Users Controller в монолите

**Проблема:**
- `UsersController` находится в `apps/api-monolith/src/app/users/users.controller.ts`
- Управление пользователями должно быть в Auth API

**Решение:**
1. Переместить `UsersController` в `apps/api-auth/src/auth/controllers/users.controller.ts`
2. Обновить маршрутизацию в API Gateway
3. Удалить `UsersController` из монолита

### 2. ❌ Версионирование API

**Проблема:**
- API Gateway uses `/api/v1/*`
- Auth API uses `/api/auth/*` (without версии)
- Monolith API uses `/api/v1/*` (с версией)

**Решение:**
- **API Gateway:** `/api/v1/*` - единая точка входа
- **Auth API (напрямую):** `/api/v1/auth/*` - версионирование
- **Monolith API (напрямую):** `/api/v1/*` - версионирование
- **API Gateway маршрутизация:**
  - `/api/v1/auth/*` → `http://localhost:7200/api/v1/auth/*`
  - `/api/v1/users/*` → `http://localhost:7200/api/v1/users/*`
  - `/api/v1/pipelines/*` → `http://localhost:7000/api/v1/pipelines/*`

### 3. ❌ Отсутствующие эндпоинты в Auth API

**Согласно спецификации должны быть:**
- `GET /api/users` - Список users (с пагинацией)
- `GET /api/users/me` - Текущий пользователь (удобнее чем `/:userId`)
- `GET /api/users/search?q=...` - Поиск users

---

## ✅ Рекомендации

### 1. Переместить Users Controller в Auth API

**Шаги:**
1. Создать `apps/api-auth/src/auth/controllers/users.controller.ts`
2. Переместить логику из `apps/api-monolith/src/app/users/users.controller.ts`
3. Обновить импорты (use `UserProfileService` из `@workix/domain/users`)
4. Удалить `UsersController` из монолита
5. Обновить маршрутизацию в API Gateway

### 2. Добавить версионирование в Auth API

**Шаги:**
1. Обновить `apps/api-auth/src/main.ts`:
   ```typescript
   app.setGlobalPrefix('api/v1');
   ```
2. Обновить all контроллеры:
   - `@Controller('auth')` → `@Controller('auth')` (path останется `/api/v1/auth`)
   - `@Controller('users')` → `@Controller('users')` (path будет `/api/v1/users`)

### 3. Обновить API Gateway маршрутизацию

**Шаги:**
1. Обновить `apps/api-gateway/src/app/services/proxy.service.ts`:
   ```typescript
   if (cleanPath.startsWith('/auth')) return 'auth';
   if (cleanPath.startsWith('/users')) return 'auth'; // Users тоже в Auth API
   ```
2. Обновить конфигурацию serviceов:
   ```typescript
   AUTH_SERVICE_URL=http://localhost:7200/api/v1
   MONOLITH_URL=http://localhost:7000/api/v1
   ```

### 4. Добавить недостающие эндпоинты

**В Auth API:**
- `GET /api/v1/users` - Список users
- `GET /api/v1/users/me` - Текущий пользователь
- `GET /api/v1/users/search?q=...` - Поиск users

---

## 📊 Итоговая statistics

| Сервис | Эндпоинтов | Статус |
|--------|-----------|--------|
| **Auth API** | 27 (должно быть 32) | ⚠️ Неполный |
| **Monolith API** | 100 (4 неправильно) | ⚠️ Требует исправления |
| **API Gateway** | Маршрутизация | ✅ Работает |
| **ИТОГО** | **127** | ⚠️ Требует refactoringа |

---

## 🎯 План действий

### Приоритет 1: Критические исправления
1. ✅ Переместить `UsersController` из монолита в Auth API
2. ✅ Добавить версионирование в Auth API (`/api/v1/*`)
3. ✅ Обновить маршрутизацию в API Gateway

### Приоритет 2: Дополнительные эндпоинты
4. ✅ Добавить `GET /api/v1/users` в Auth API
5. ✅ Добавить `GET /api/v1/users/me` в Auth API
6. ✅ Добавить `GET /api/v1/users/search` в Auth API

### Приоритет 3: Документация
7. ✅ Обновить Swagger documentацию
8. ✅ Обновить README fileы
9. ✅ Создать архитектурную диаграмму

---

**Последнее update:** 2025-11-16
**Status:** 🔍 Требует refactoringа
