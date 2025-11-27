# 🌐 API Gateway - Схема маршрутизации и конфигурации

**Date:** 2025-11-16
**Version:** 1.0

---

## 📊 Архитектура маршрутизации

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT / BROWSER                          │
│                    (localhost:4200/docs)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS
                             │ /api/v1/*
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Port 4200)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Routing Engine                                          │  │
│  │  - Path Detection                                        │  │
│  │  - Service Routing (from DB Config)                       │  │
│  │  - Version Selection                                     │  │
│  │  - Load Balancing                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Access Control                                          │  │
│  │  - Endpoint Whitelist (from DB)                          │  │
│  │  - API Key Validation                                    │  │
│  │  - Rate Limiting                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Message Broker Integration (Optional)                    │  │
│  │  - RabbitMQ / Redis Pub/Sub                               │  │
│  │  - Async Task Routing                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────┬───────────┬───────────┬───────────┬───────────┬────────┘
        │           │           │           │           │
    ┌───┴───┐   ┌───┴───┐   ┌───┴───┐   ┌───┴───┐   ┌───┴───┐
    │ HTTP  │   │ HTTP  │   │ HTTP  │   │ Queue │   │ Queue │
    │ REST  │   │ REST  │   │ REST  │   │ Async │   │ Async │
    └───┬───┘   └───┬───┘   └───┬───┘   └───┬───┘   └───┬───┘
        │           │           │           │           │
        ▼           ▼           ▼           ▼           ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Auth API │  │ Monolith │  │ Pipeline │  │ Workers  │  │ Workers  │
│ (7200)   │  │ API      │  │ Service  │  │ (Email)  │  │ (SMS)    │
│          │  │ (7000)   │  │ (7202)   │  │          │  │          │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
```

---

## 📋 Полный список эндпоинтов Gateway

### ⚠️ Важно: Логика маршрутизации

**Gateway получает:** `/api/v1/auth/login`
**Gateway убирает:** `/api/v1` → `/auth/login`
**Gateway отправляет на Auth API:** `http://localhost:7200/auth/login`
**НО Auth API ожидает:** `/api/auth/login` (globalPrefix = 'api')

**Проблема:** Gateway убирает `/api/v1`, но Auth API нalreadyн `/api`!
**Решение:** Gateway должен добавлять `/api` for Auth API или изменить логику.

**Для Monolith API:**
- Gateway получает: `/api/v1/pipelines`
- Gateway убирает: `/api/v1` → `/pipelines`
- Gateway отправляет: `http://localhost:7000/pipelines`
- Monolith API ожидает: `/api/v1/pipelines` (globalPrefix = 'api/v1')
- **Проблема:** Gateway убирает `/api/v1`, но Monolith нalreadyн `/api/v1`!

**Текущая реализация требует исправления!**

---

### 🔐 Auth Endpoints (`/api/v1/auth/*`)

**Логика маршрутизации:**
- Gateway: `/api/v1/auth/login` → убирает `/api/v1` → `/auth/login`
- Отправляет на: `http://localhost:7200/auth/login`
- **ПРОБЛЕМА:** Auth API ожидает `/api/auth/login` (globalPrefix = 'api')
- **Нужно исправить:** Gateway должен отправлять на `/api/auth/login`

| Gateway Endpoint | Метод | Что Gateway отправляет | Что ожидает Auth API | Сервис | Статус |
|-----------------|-------|------------------------|---------------------|--------|--------|
| `/api/v1/auth/register` | POST | `/auth/register` ❌ | `/api/auth/register` ✅ | Auth API (7200) | ⚠️ Требует исправления |
| `/api/v1/auth/login` | POST | `/auth/login` ❌ | `/api/auth/login` ✅ | Auth API (7200) | ⚠️ Требует исправления |
| `/api/v1/auth/verify` | POST | `/auth/verify` ❌ | `/api/auth/verify` ✅ | Auth API (7200) | ⚠️ Требует исправления |
| `/api/v1/auth/refresh` | POST | `/auth/refresh` ❌ | `/api/auth/refresh` ✅ | Auth API (7200) | ⚠️ Требует исправления |
| `/api/v1/auth/me` | GET | `/auth/me` ❌ | `/api/auth/me` ✅ | Auth API (7200) | ⚠️ Требует исправления |
| `/api/v1/auth/logout` | POST | `/auth/logout` ❌ | `/api/auth/logout` ✅ | Auth API (7200) | ⚠️ Требует исправления |
| `/api/v1/auth/health` | GET | `/auth/health` ❌ | `/api/auth/health` ✅ | Auth API (7200) | ⚠️ Требует исправления |

**OAuth2:**
| `/api/v1/auth/oauth/google` | GET | `/auth/oauth/google` ❌ | `/api/auth/oauth/google` ✅ | Auth API (7200) | ⚠️ |
| `/api/v1/auth/oauth/google/callback` | GET | `/auth/oauth/google/callback` ❌ | `/api/auth/oauth/google/callback` ✅ | Auth API (7200) | ⚠️ |
| `/api/v1/auth/oauth/github` | GET | `/auth/oauth/github` ❌ | `/api/auth/oauth/github` ✅ | Auth API (7200) | ⚠️ |
| `/api/v1/auth/oauth/github/callback` | GET | `/auth/oauth/github/callback` ❌ | `/api/auth/oauth/github/callback` ✅ | Auth API (7200) | ⚠️ |
| `/api/v1/auth/oauth/apple` | GET | `/auth/oauth/apple` ❌ | `/api/auth/oauth/apple` ✅ | Auth API (7200) | ⚠️ |
| `/api/v1/auth/oauth/apple/callback` | GET | `/auth/oauth/apple/callback` ❌ | `/api/auth/oauth/apple/callback` ✅ | Auth API (7200) | ⚠️ |

**2FA:**
| `/api/v1/auth/2fa/generate` | POST | `/auth/2fa/generate` ❌ | `/api/auth/2fa/generate` ✅ | Auth API (7200) | ⚠️ |
| `/api/v1/auth/2fa/enable` | POST | `/auth/2fa/enable` ❌ | `/api/auth/2fa/enable` ✅ | Auth API (7200) | ⚠️ |
| `/api/v1/auth/2fa/verify` | POST | `/auth/2fa/verify` ❌ | `/api/auth/2fa/verify` ✅ | Auth API (7200) | ⚠️ |
| `/api/v1/auth/2fa/disable` | DELETE | `/auth/2fa/disable` ❌ | `/api/auth/2fa/disable` ✅ | Auth API (7200) | ⚠️ |
| `/api/v1/auth/2fa/status` | GET | `/auth/2fa/status` ❌ | `/api/auth/2fa/status` ✅ | Auth API (7200) | ⚠️ |

**Password Reset:**
| `/api/v1/auth/password-reset/request` | POST | `/auth/password-reset/request` ❌ | `/api/auth/password-reset/request` ✅ | Auth API (7200) | ⚠️ |
| `/api/v1/auth/password-reset/verify` | POST | `/auth/password-reset/verify` ❌ | `/api/auth/password-reset/verify` ✅ | Auth API (7200) | ⚠️ |
| `/api/v1/auth/password-reset/confirm` | POST | `/auth/password-reset/confirm` ❌ | `/api/auth/password-reset/confirm` ✅ | Auth API (7200) | ⚠️ |

**Email Verification:**
| `/api/v1/auth/email-verification/send` | POST | `/auth/email-verification/send` ❌ | `/api/auth/email-verification/send` ✅ | Auth API (7200) | ⚠️ |
| `/api/v1/auth/email-verification/verify` | POST | `/auth/email-verification/verify` ❌ | `/api/auth/email-verification/verify` ✅ | Auth API (7200) | ⚠️ |

**Phone OTP:**
| `/api/v1/auth/phone-otp/send` | POST | `/auth/phone-otp/send` ❌ | `/api/auth/phone-otp/send` ✅ | Auth API (7200) | ⚠️ |
| `/api/v1/auth/phone-otp/verify` | POST | `/auth/phone-otp/verify` ❌ | `/api/auth/phone-otp/verify` ✅ | Auth API (7200) | ⚠️ |

---

### 👤 Users Endpoints (`/api/v1/users/*`)

| Gateway Endpoint | Метод | Что Gateway отправляет | Что ожидает Auth API | Сервис | Статус |
|-----------------|-------|------------------------|---------------------|--------|--------|
| `/api/v1/users` | GET | `/users` ❌ | `/api/users` ✅ | Auth API (7200) | ⚠️ |
| `/api/v1/users/me` | GET | `/users/me` ❌ | `/api/users/me` ✅ | Auth API (7200) | ⚠️ |
| `/api/v1/users/search` | GET | `/users/search` ❌ | `/api/users/search` ✅ | Auth API (7200) | ⚠️ |
| `/api/v1/users/:userId` | GET | `/users/:userId` ❌ | `/api/users/:userId` ✅ | Auth API (7200) | ⚠️ |
| `/api/v1/users/:userId` | PUT | `/users/:userId` ❌ | `/api/users/:userId` ✅ | Auth API (7200) | ⚠️ |
| `/api/v1/users/:userId` | DELETE | `/users/:userId` ❌ | `/api/users/:userId` ✅ | Auth API (7200) | ⚠️ |
| `/api/v1/users/:userId/avatar` | POST | `/users/:userId/avatar` ❌ | `/api/users/:userId/avatar` ✅ | Auth API (7200) | ⚠️ |

---

### 📦 Pipelines Endpoints (`/api/v1/pipelines/*`)

**Логика маршрутизации:**
- Gateway: `/api/v1/pipelines` → убирает `/api/v1` → `/pipelines`
- Отправляет на: `http://localhost:7000/pipelines`
- **ПРОБЛЕМА:** Monolith API ожидает `/api/v1/pipelines` (globalPrefix = 'api/v1')
- **Нужно исправить:** Gateway должен отправлять на `/api/v1/pipelines`

| Gateway Endpoint | Метод | Что Gateway отправляет | Что ожидает Monolith | Сервис | Статус |
|-----------------|-------|------------------------|---------------------|--------|--------|
| `/api/v1/pipelines` | POST | `/pipelines` ❌ | `/api/v1/pipelines` ✅ | Monolith API (7000) | ⚠️ Требует исправления |
| `/api/v1/pipelines` | GET | `/pipelines` ❌ | `/api/v1/pipelines` ✅ | Monolith API (7000) | ⚠️ Требует исправления |
| `/api/v1/pipelines/:id` | GET | `/pipelines/:id` ❌ | `/api/v1/pipelines/:id` ✅ | Monolith API (7000) | ⚠️ Требует исправления |
| `/api/v1/pipelines/:id` | PUT | `/pipelines/:id` ❌ | `/api/v1/pipelines/:id` ✅ | Monolith API (7000) | ⚠️ Требует исправления |
| `/api/v1/pipelines/:id` | DELETE | `/pipelines/:id` ❌ | `/api/v1/pipelines/:id` ✅ | Monolith API (7000) | ⚠️ Требует исправления |
| `/api/v1/pipelines/public` | GET | `/pipelines/public` ❌ | `/api/v1/pipelines/marketplace/list` ✅ | Monolith API (7000) | ⚠️ Требует исправления |
| `/api/v1/pipelines/:id/publish` | POST | `/pipelines/:id/publish` ❌ | `/api/v1/pipelines/:id/publish` ✅ | Monolith API (7000) | ⚠️ Требует исправления |
| `/api/v1/pipelines/templates` | GET | `/pipelines/templates` ❌ | `/api/v1/pipelines/templates` ✅ | Monolith API (7000) | ⚠️ Требует исправления |
| `/api/v1/pipelines/templates/:id/clone` | POST | `/pipelines/templates/:id/clone` ❌ | `/api/v1/pipelines/templates/:id/clone` ✅ | Monolith API (7000) | ⚠️ Требует исправления |

---

### ⚙️ Executions Endpoints (`/api/v1/executions/*`)

| Gateway Endpoint | Метод | Что Gateway отправляет | Что ожидает Monolith | Сервис | Статус |
|-----------------|-------|------------------------|---------------------|--------|--------|
| `/api/v1/executions` | POST | `/executions` ❌ | `/api/v1/executions` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/executions/:id` | GET | `/executions/:id` ❌ | `/api/v1/executions/:id` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/executions/:id/stats` | GET | `/executions/:id/stats` ❌ | `/api/v1/executions/:id/stats` ✅ | Monolith API (7000) | ⚠️ |

---

### 🛡️ RBAC Endpoints (`/api/v1/rbac/*`)

| Gateway Endpoint | Метод | Что Gateway отправляет | Что ожидает Monolith | Сервис | Статус |
|-----------------|-------|------------------------|---------------------|--------|--------|
| `/api/v1/rbac/roles` | POST | `/rbac/roles` ❌ | `/api/v1/rbac/roles` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/rbac/roles` | GET | `/rbac/roles` ❌ | `/api/v1/rbac/roles` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/rbac/roles/:id` | GET | `/rbac/roles/:id` ❌ | `/api/v1/rbac/roles/:id` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/rbac/roles/:id` | PUT | `/rbac/roles/:id` ❌ | `/api/v1/rbac/roles/:id` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/rbac/roles/:id` | DELETE | `/rbac/roles/:id` ❌ | `/api/v1/rbac/roles/:id` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/rbac/roles/assign` | POST | `/rbac/roles/assign` ❌ | `/api/v1/rbac/assign-role` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/rbac/permissions` | POST | `/rbac/permissions` ❌ | `/api/v1/rbac/permissions` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/rbac/permissions` | GET | `/rbac/permissions` ❌ | `/api/v1/rbac/permissions` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/rbac/permissions/:id` | GET | `/rbac/permissions/:id` ❌ | `/api/v1/rbac/permissions/:id` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/rbac/permissions/grant` | POST | `/rbac/permissions/grant` ❌ | `/api/v1/rbac/permissions/grant` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/rbac/permissions/:roleId/:id` | DELETE | `/rbac/permissions/:roleId/:id` ❌ | `/api/v1/rbac/permissions/:roleId/:id` ✅ | Monolith API (7000) | ⚠️ |

---

### 🤖 Workers Endpoints (`/api/v1/workers/*`)

| Gateway Endpoint | Метод | Что Gateway отправляет | Что ожидает Monolith | Сервис | Статус |
|-----------------|-------|------------------------|---------------------|--------|--------|
| `/api/v1/workers` | POST | `/workers` ❌ | `/api/v1/workers` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/workers` | GET | `/workers` ❌ | `/api/v1/workers` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/workers/:workerId` | GET | `/workers/:workerId` ❌ | `/api/v1/workers/:workerId` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/workers/:workerId` | PUT | `/workers/:workerId` ❌ | `/api/v1/workers/:workerId` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/workers/:workerId` | DELETE | `/workers/:workerId` ❌ | `/api/v1/workers/:workerId` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/workers/:workerId/tasks` | POST | `/workers/:workerId/tasks` ❌ | `/api/v1/workers/:workerId/tasks` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/workers/:workerId/tasks` | GET | `/workers/:workerId/tasks` ❌ | `/api/v1/workers/:workerId/tasks` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/workers/:workerId/status` | GET | `/workers/:workerId/status` ❌ | `/api/v1/workers/:workerId/status` ✅ | Monolith API (7000) | ⚠️ |

---

### 🔗 Integrations Endpoints (`/api/v1/integrations/*`)

| Gateway Endpoint | Метод | Что Gateway отправляет | Что ожидает Monolith | Сервис | Статус |
|-----------------|-------|------------------------|---------------------|--------|--------|
| `/api/v1/integrations/providers` | GET | `/integrations/providers` ❌ | `/api/v1/integrations/providers` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/integrations/providers` | POST | `/integrations/providers` ❌ | `/api/v1/integrations/providers` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/integrations/providers/:id` | GET | `/integrations/providers/:id` ❌ | `/api/v1/integrations/providers/:id` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/integrations/providers/:id` | PUT | `/integrations/providers/:id` ❌ | `/api/v1/integrations/providers/:id` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/integrations/providers/:id/credentials` | POST | `/integrations/providers/:id/credentials` ❌ | `/api/v1/integrations/providers/:id/credentials` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/integrations/providers/:id/credentials/rotate` | POST | `/integrations/providers/:id/credentials/rotate` ❌ | `/api/v1/integrations/providers/:id/credentials/rotate` ✅ | Monolith API (7000) | ⚠️ |

---

### 📊 Analytics Endpoints (`/api/v1/analytics/*`)

| Gateway Endpoint | Метод | Что Gateway отправляет | Что ожидает Monolith | Сервис | Статус |
|-----------------|-------|------------------------|---------------------|--------|--------|
| `/api/v1/analytics/universal/analyze` | POST | `/analytics/universal/analyze` ❌ | `/api/v1/analytics/universal/analyze` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/analytics/universal/retention` | POST | `/analytics/universal/retention` ❌ | `/api/v1/analytics/universal/retention` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/analytics/universal/predict` | POST | `/analytics/universal/predict` ❌ | `/api/v1/analytics/universal/predict` ✅ | Monolith API (7000) | ⚠️ |

---

### 🎨 Generation Endpoints (`/api/v1/generation/*`)

| Gateway Endpoint | Метод | Что Gateway отправляет | Что ожидает Monolith | Сервис | Статус |
|-----------------|-------|------------------------|---------------------|--------|--------|
| `/api/v1/generation/text` | POST | `/generation/text` ❌ | `/api/v1/generation/text` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/generation/image` | POST | `/generation/image` ❌ | `/api/v1/generation/image` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/generation/video` | POST | `/generation/video` ❌ | `/api/v1/generation/video` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/generation/embedding` | POST | `/generation/embedding` ❌ | `/api/v1/generation/embedding` ✅ | Monolith API (7000) | ⚠️ |

---

### 🧪 A/B Testing Endpoints (`/api/v1/ab-tests/*`)

| Gateway Endpoint | Метод | Что Gateway отправляет | Что ожидает Monolith | Сервис | Статус |
|-----------------|-------|------------------------|---------------------|--------|--------|
| `/api/v1/ab-tests` | POST | `/ab-tests` ❌ | `/api/v1/ab-tests` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/ab-tests/:testId/track` | POST | `/ab-tests/:testId/track` ❌ | `/api/v1/ab-tests/:testId/track` ✅ | Monolith API (7000) | ⚠️ |
| `/api/v1/ab-tests/:testId/results` | GET | `/ab-tests/:testId/results` ❌ | `/api/v1/ab-tests/:testId/results` ✅ | Monolith API (7000) | ⚠️ |

---

### 🔧 Admin Endpoints (`/api/v1/admin/*`)

| Gateway Endpoint | Метод | Реальный Endpoint | Сервис | Тип | Описание |
|-----------------|-------|-------------------|--------|-----|----------|
| `/api/v1/admin/routing/services` | GET | Gateway Internal | Gateway (4200) | HTTP | Список конфигураций serviceов |
| `/api/v1/admin/routing/services/:serviceName` | GET | Gateway Internal | Gateway (4200) | HTTP | Конфигурация serviceа |
| `/api/v1/admin/routing/services/:serviceName/versions` | POST | Gateway Internal | Gateway (4200) | HTTP | Добавление версии serviceа |
| `/api/v1/admin/routing/services/:serviceName/versions/:version/switch` | PUT | Gateway Internal | Gateway (4200) | HTTP | Переключение версии |
| `/api/v1/admin/whitelist/applications` | GET | Gateway Internal | Gateway (4200) | HTTP | Список whenложений |
| `/api/v1/admin/whitelist/applications` | POST | Gateway Internal | Gateway (4200) | HTTP | Создание/update whenложения |
| `/api/v1/admin/whitelist/applications/:appId/check` | POST | Gateway Internal | Gateway (4200) | HTTP | Проверка доступа |

---

### 🏥 Gateway Health Endpoints

| Gateway Endpoint | Метод | Реальный Endpoint | Сервис | Тип | Описание |
|-----------------|-------|-------------------|--------|-----|----------|
| `/api/health` | GET | Gateway Internal | Gateway (4200) | HTTP | Health check Gateway |
| `/api/status` | GET | Gateway Internal | Gateway (4200) | HTTP | Статус allх serviceов |
| `/api/endpoints` | GET | Gateway Internal | Gateway (4200) | HTTP | Список allх эндпоинтов |

---

## 🔄 Типы маршрутизации

### 1. HTTP REST (Синхронный) ✅

**Используется for:**
- CRUD операции
- Запросы-responseы
- Простые операции
- Получение данных

**Примеры:**
- `GET /api/v1/users/:userId` → Auth API
- `POST /api/v1/pipelines` → Monolith API
- `GET /api/v1/rbac/roles` → Monolith API

---

### 2. HTTP → Queue (Асинхронный) 🚀

**Используется for:**
- Долгие операции
- Фоновая обработка
- Отправка уведомлений
- Обработка fileов

**Примеры:**
- `POST /api/v1/auth/password-reset/request` → Email Queue
- `POST /api/v1/auth/email-verification/send` → Email Queue
- `POST /api/v1/auth/phone-otp/send` → SMS Queue
- `POST /api/v1/executions` → Execution Queue
- `POST /api/v1/generation/text` → AI Queue
- `POST /api/v1/analytics/universal/analyze` → Analytics Queue

**Схема:**
```
Client → Gateway → HTTP Request → Service → Queue → Worker → Result (via Webhook/Callback)
```

---

## 🗄️ Конфигурация via админ панель

### Схема хранения конфигурации

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN PANEL                              │
│              (app-admin, Port 4201)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Gateway Configuration UI                            │  │
│  │  - Service Routing Config                            │  │
│  │  - Endpoint Whitelist                                │  │
│  │  - API Keys Management                               │  │
│  │  - Rate Limiting Rules                               │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP API
                        │ /api/v1/admin/*
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              API GATEWAY (Port 4200)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Admin Controllers                                    │  │
│  │  - ServiceRoutingController                          │  │
│  │  - EndpointWhitelistController                       │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Prisma ORM
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (PostgreSQL)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  gateway_service_config                              │  │
│  │  - service_name                                       │  │
│  │  - default_url                                       │  │
│  │  - current_version                                   │  │
│  │  - fallback_url                                      │  │
│  │  - is_active                                         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  gateway_service_version                             │  │
│  │  - service_id                                        │  │
│  │  - version                                           │  │
│  │  - url                                               │  │
│  │  - weight                                            │  │
│  │  - is_active                                         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  gateway_endpoint_whitelist                          │  │
│  │  - application_id                                    │  │
│  │  - endpoint_path                                     │  │
│  │  - allowed_methods                                  │  │
│  │  - allowed_versions                                  │  │
│  │  - rate_limit                                        │  │
│  │  - is_public                                         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  gateway_api_key                                     │  │
│  │  - application_id                                    │  │
│  │  - api_key_hash                                      │  │
│  │  - expires_at                                        │  │
│  │  - is_active                                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Безопасность хранения конфигурации в БД

### ✅ Безопасно хранить в БД:

1. **Service Routing Config**
   - ✅ URLs serviceов (публичные)
   - ✅ Версии serviceов
   - ✅ Веса for load balancing
   - ✅ Флаги активности

2. **Endpoint Whitelist**
   - ✅ Пути эндпоинтов
   - ✅ Разрешенные methodы
   - ✅ Разрешенные версии
   - ✅ Rate limiting правила

3. **Application Config**
   - ✅ Application IDs
   - ✅ Разрешенные serviceы
   - ✅ Разрешенные версии

### ❌ НЕ withoutопасно хранить в БД (или хранить зашифрованными):

1. **API Keys**
   - ❌ Хранить how plain text
   - ✅ Хранить how hash (bcrypt/argon2)
   - ✅ Использовать `api_key_hash` вместо `api_key`

2. **Service Keys**
   - ❌ НЕ хранить в БД вообще
   - ✅ Хранить в переменных окрalreadyния
   - ✅ Использовать secrets manager (Vault, AWS Secrets Manager)

3. **Credentials**
   - ❌ НЕ хранить в БД
   - ✅ Хранить в secrets manager
   - ✅ Использовать for межserviceной аутентификации

---

## 📊 Схема Prisma for Gateway Config

```prisma
// apps/api-gateway/prisma/schema.prisma

model GatewayServiceConfig {
  id            String   @id @default(uuid())
  serviceName   String   @unique
  defaultUrl    String
  currentVersion String?
  fallbackUrl   String?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  versions      GatewayServiceVersion[]

  @@map("gateway_service_config")
}

model GatewayServiceVersion {
  id            String   @id @default(uuid())
  serviceId     String
  version       String
  url           String
  weight        Int      @default(100)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  service       GatewayServiceConfig @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@unique([serviceId, version])
  @@map("gateway_service_version")
}

model GatewayEndpointWhitelist {
  id              String   @id @default(uuid())
  applicationId   String
  endpointPath    String
  allowedMethods  String[] // ['GET', 'POST', 'PUT', 'DELETE']
  allowedVersions String[] // ['v1', 'v2']
  rateLimit       Int?     // requests per minute
  isPublic        Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  application     GatewayApplication @relation(fields: [applicationId], references: [id], onDelete: Cascade)

  @@unique([applicationId, endpointPath])
  @@map("gateway_endpoint_whitelist")
}

model GatewayApplication {
  id              String   @id @default(uuid())
  name            String
  description     String?
  allowedServices String[] // ['auth', 'users', 'pipelines']
  allowedVersions String[] // ['v1', 'v2']
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  whitelist       GatewayEndpointWhitelist[]
  apiKeys         GatewayApiKey[]

  @@map("gateway_application")
}

model GatewayApiKey {
  id            String   @id @default(uuid())
  applicationId String
  apiKeyHash    String   // bcrypt hash
  name          String?
  expiresAt     DateTime?
  isActive      Boolean  @default(true)
  lastUsedAt    DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  application   GatewayApplication @relation(fields: [applicationId], references: [id], onDelete: Cascade)

  @@map("gateway_api_key")
}
```

---

## 🔄 Обновление конфигурации в реальном времени

### Схема updates:

```
Admin Panel → API Gateway Admin API → Database → ServiceRoutingService (in-memory cache) → Routing
```

**Реализация:**

1. **In-Memory Cache** (ServiceRoutingService)
   - Кэширует конфигурацию в памяти
   - Обновляется when изменении via Admin API
   - Fallback на БД when переlaunchе

2. **Database** (Source of Truth)
   - Хранит актуальную конфигурацию
   - Используется for восстановления after переlaunchа

3. **Admin API** (Update Interface)
   - Обновляет БД
   - Обновляет in-memory cache
   - Возвращает результат

**Пример кода:**

```typescript
// apps/api-gateway/src/app/controllers/service-routing.controller.ts

@Put('services/:serviceName/config')
async updateServiceConfig(
  @Param('serviceName') serviceName: string,
  @Body() config: UpdateServiceConfigDto
) {
  // 1. Обновить БД
  await this.prisma.gatewayServiceConfig.update({
    where: { serviceName },
    data: config,
  });

  // 2. Обновить in-memory cache
  this.routingService.updateServiceConfig(serviceName, config);

  return { success: true };
}
```

---

## 📈 Статистика

| Тип маршрутизации | Количество эндпоинтов | Процент | Статус |
|-------------------|----------------------|---------|--------|
| **HTTP REST** | 95 | 75% | ⚠️ Требует исправления |
| **HTTP → Queue** | 15 | 12% | ⚠️ Требует исправления |
| **Gateway Internal** | 16 | 13% | ✅ Работает |
| **ИТОГО** | **126** | **100%** | ⚠️ **110 эндпоинтов требуют исправления** |

---

## 🔧 Рекомендации по исправлению

### Вариант 1: Изменить логику Gateway (рекомендуется)

**Файл:** `apps/api-gateway/src/app/services/proxy.service.ts`

```typescript
// Текущий код (НЕПРАВИЛЬНО):
const cleanPath = path.replace(/^\/api\/v\d+/, '').replace(/^\/api/, '');
const url = `${baseUrl}${cleanPath}`;

// Правильный код:
let cleanPath = path.replace(/^\/api\/v\d+/, '').replace(/^\/api/, '');

// Для Auth API: добавлять /api
if (service === 'auth') {
  cleanPath = `/api${cleanPath}`;
}
// Для Monolith API и других: добавлять /api/v1
else {
  cleanPath = `/api/v1${cleanPath}`;
}

const url = `${baseUrl}${cleanPath}`;
```

### Вариант 2: Изменить globalPrefix в serviceах

**Auth API:** `apps/api-auth/src/main.ts`
```typescript
// Убрать globalPrefix
// app.setGlobalPrefix(globalPrefix); // Закомментировать
// Использовать только @Controller('auth')
```

**Monolith API:** `apps/api-monolith/src/main.ts`
```typescript
// Убрать globalPrefix
// app.setGlobalPrefix('api/v1'); // Закомментировать
// Использовать только @Controller('pipelines')
```

**Рекомендация:** Использовать Вариант 1 (изменить Gateway), так how это централизованное solution.

---

## ✅ Рекомендации

### 1. Хранение конфигурации
- ✅ **БД for публичных данных** (URLs, пути, версии)
- ❌ **Переменные окрalreadyния for секретов** (Service Keys, API Keys hash)
- ✅ **In-memory cache** for производительности

### 2. Безопасность
- ✅ Хранить API Keys how hash (bcrypt/argon2)
- ✅ Service Keys только в переменных окрalreadyния
- ✅ Использовать RBAC for Admin API
- ✅ Логировать all изменения конфигурации

### 3. Производительность
- ✅ Кэшировать конфигурацию в памяти
- ✅ Обновлять кэш when изменении via Admin API
- ✅ Fallback на БД when переlaunchе

---

**Последнее update:** 2025-11-16
**Status:** ✅ Готово к реализации
