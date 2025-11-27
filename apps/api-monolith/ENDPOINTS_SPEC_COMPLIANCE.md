# 📊 Соresponseствие эндпоинтов спецификации

**Date:** 2025-11-16
**Спецификация:** `.specify/specs/000-project/API_GATEWAY_ENDPOINTS.md`

---

## 🎯 Сравнение со спецификацией

### Phase 0-2: Base Backend (46 эндпоинтов по спецификации)

#### ✅ Auth Service (15 эндпоинтов по спецификации)

| Эндпоинт (спецификация) | Реализация | Статус |
|------------------------|-----------|--------|
| `POST /auth/register` | ✅ `POST /api/auth/register` | ✅ Есть |
| `POST /auth/login` | ✅ `POST /api/auth/login` | ✅ Есть |
| `GET /auth/me` | ✅ `GET /api/auth/me` | ✅ Есть |
| `POST /auth/refresh` | ✅ `POST /api/auth/refresh` | ✅ Есть |
| `POST /auth/verify` | ✅ `POST /api/auth/verify` | ✅ Есть |
| `GET /auth/oauth2/google` | ✅ `GET /api/auth/oauth/google` | ✅ Есть |
| `GET /auth/oauth2/google/callback` | ✅ `GET /api/auth/oauth/google/callback` | ✅ Есть |
| `GET /auth/oauth2/apple` | ✅ `GET /api/auth/oauth/apple` | ✅ Есть |
| `GET /auth/oauth2/apple/callback` | ✅ `GET /api/auth/oauth/apple/callback` | ✅ Есть |
| `GET /auth/oauth2/github` | ✅ `GET /api/auth/oauth/github` | ✅ Есть |
| `GET /auth/oauth2/github/callback` | ✅ `GET /api/auth/oauth/github/callback` | ✅ Есть |
| `POST /auth/phone-otp/send` | ✅ `POST /api/auth/phone-otp/send` | ✅ Есть |
| `POST /auth/phone-otp/verify` | ✅ `POST /api/auth/phone-otp/verify` | ✅ Есть |
| `POST /auth/email-verify/send` | ✅ `POST /api/auth/email-verification/send` | ✅ Есть |
| `POST /auth/email-verify/confirm` | ✅ `POST /api/auth/email-verification/verify` | ✅ Есть |

**Дополнительно реализовано (не в спецификации):**
- ✅ `POST /api/auth/password-reset/request` - Запрос сброса пароля
- ✅ `POST /api/auth/password-reset/verify` - Проверка токена
- ✅ `POST /api/auth/password-reset/confirm` - Подтверждение сброса
- ✅ `POST /api/auth/2fa/generate` - Генерация 2FA
- ✅ `POST /api/auth/2fa/enable` - Включение 2FA
- ✅ `POST /api/auth/2fa/verify` - Проверка 2FA
- ✅ `DELETE /api/auth/2fa/disable` - Отключение 2FA
- ✅ `GET /api/auth/2fa/status` - Статус 2FA
- ✅ `POST /api/auth/2fa/regenerate-backup-codes` - Реgeneration кодов
- ✅ `POST /api/auth/email-verification/resend` - Повторная отправка
- ✅ `GET /api/auth/email-verification/status` - Статус верификации

**Итого в Auth API:** 27 эндпоинтов (15 из спецификации + 12 дополнительных)

---

#### ✅ User Service (5 эндпоинтов по спецификации)

| Эндпоинт (спецификация) | Реализация | Статус |
|------------------------|-----------|--------|
| `GET /users/:userId` | ❌ `GET /api/v1/users/:userId` (в монолите!) | ⚠️ Неправильно размещен |
| `PUT /users/:userId` | ❌ `PUT /api/v1/users/:userId` (в монолите!) | ⚠️ Неправильно размещен |
| `POST /users/:userId/avatar` | ❌ `POST /api/v1/users/:userId/avatar` (в монолите!) | ⚠️ Неправильно размещен |
| `DELETE /users/:userId` | ❌ `DELETE /api/v1/users/:userId` (в монолите!) | ⚠️ Неправильно размещен |
| `GET /users` | ❌ Отсутствует | ❌ Не реализован |

**Проблема:** Все эндпоинты users находятся в монолите, а должны быть в Auth API!

---

#### ✅ Pipeline Service (12 эндпоинтов по спецификации)

| Эндпоинт (спецификация) | Реализация | Статус |
|------------------------|-----------|--------|
| `POST /pipelines` | ✅ `POST /api/v1/pipelines` | ✅ Есть |
| `GET /pipelines` | ✅ `GET /api/v1/pipelines` | ✅ Есть |
| `GET /pipelines/public` | ✅ `GET /api/v1/pipelines/marketplace/list` | ✅ Есть (other path) |
| `GET /pipelines/:id` | ✅ `GET /api/v1/pipelines/:id` | ✅ Есть |
| `PUT /pipelines/:id` | ✅ `PUT /api/v1/pipelines/:id` | ✅ Есть |
| `DELETE /pipelines/:id` | ✅ `DELETE /api/v1/pipelines/:id` | ✅ Есть |
| `POST /pipelines/:id/publish` | ❌ Отсутствует | ❌ Не реализован |
| `GET /pipelines/templates` | ❌ Отсутствует | ❌ Не реализован |
| `POST /pipelines/templates/:id/clone` | ❌ Отсутствует | ❌ Не реализован |
| `POST /executions` | ❌ Отсутствует | ❌ Не реализован |
| `GET /executions/:id` | ❌ Отсутствует | ❌ Не реализован |
| `GET /executions/:id/stats` | ❌ Отсутствует | ❌ Не реализован |

**Итого:** 6 из 12 эндпоинтов реализованы

---

#### ✅ RBAC Service (11 эндпоинтов по спецификации)

| Эндпоинт (спецификация) | Реализация | Статус |
|------------------------|-----------|--------|
| `POST /rbac/roles` | ✅ `POST /api/v1/rbac/roles` | ✅ Есть |
| `GET /rbac/roles` | ✅ `GET /api/v1/rbac/roles` | ✅ Есть |
| `GET /rbac/roles/:id` | ✅ `GET /api/v1/rbac/roles/:id` | ✅ Есть |
| `PUT /rbac/roles/:id` | ✅ `PUT /api/v1/rbac/roles/:id` | ✅ Есть |
| `DELETE /rbac/roles/:id` | ✅ `DELETE /api/v1/rbac/roles/:id` | ✅ Есть |
| `POST /rbac/roles/assign` | ✅ `POST /api/v1/rbac/assign-role` | ✅ Есть (other path) |
| `POST /rbac/permissions` | ✅ `POST /api/v1/rbac/permissions` | ✅ Есть |
| `GET /rbac/permissions` | ✅ `GET /api/v1/rbac/permissions` | ✅ Есть |
| `GET /rbac/permissions/:id` | ❌ Отсутствует | ❌ Не реализован |
| `POST /rbac/permissions/grant` | ❌ Отсутствует | ❌ Не реализован |
| `DELETE /rbac/permissions/:roleId/:id` | ❌ Отсутствует | ❌ Не реализован |

**Итого:** 8 из 11 эндпоинтов реализованы

---

## 📊 Итоговая statistics соresponseствия

| Сервис | По спецификации | Реализовано | Статус |
|--------|----------------|-------------|--------|
| **Auth** | 15 | 15 + 12 доп. | ✅ Превышает спецификацию |
| **Users** | 5 | 0 (all в монолите!) | ❌ Неправильно размещены |
| **Pipelines** | 12 | 6 | ⚠️ 50% реализовано |
| **RBAC** | 11 | 8 | ⚠️ 73% реализовано |
| **ИТОГО Phase 0-2** | **46** | **29** | ⚠️ 63% соresponseствие |

---

## 🚨 Критические проблемы

### 1. Users Controller в монолите
**Проблема:** Все эндпоинты управления пользователями находятся в монолите, а должны быть в Auth API.

**Решение:**
1. Переместить `UsersController` из `apps/api-monolith/src/app/users/` в `apps/api-auth/src/auth/controllers/`
2. Обновить маршрутизацию в API Gateway: `/users/*` → Auth API
3. Удалить `UsersController` из монолита

### 2. Отсутствующие эндпоинты

**Pipelines:**
- ❌ `POST /api/v1/pipelines/:id/publish` - Публикация пайплайна
- ❌ `GET /api/v1/pipelines/templates` - Список templateов
- ❌ `POST /api/v1/pipelines/templates/:id/clone` - Клонирование templateа
- ❌ `POST /api/v1/executions` - Запуск выполнения
- ❌ `GET /api/v1/executions/:id` - Получение выполнения
- ❌ `GET /api/v1/executions/:id/stats` - Статистика выполнения

**RBAC:**
- ❌ `GET /api/v1/rbac/permissions/:id` - Получение permission
- ❌ `POST /api/v1/rbac/permissions/grant` - Выдача permission
- ❌ `DELETE /api/v1/rbac/permissions/:roleId/:id` - Отзыв permission

**Users:**
- ❌ `GET /api/v1/users` - Список users
- ❌ `GET /api/v1/users/me` - Текущий пользователь

### 3. Версионирование API

**Проблема:**
- Auth API: `/api/auth/*` (without версии)
- Monolith API: `/api/v1/*` (с версией)
- API Gateway: `/api/v1/*` (с версией)

**Решение:**
- Добавить версионирование в Auth API: `/api/v1/auth/*`

---

## ✅ Рекомендации

### Приоритет 1: Критические исправления
1. ✅ Переместить `UsersController` в Auth API
2. ✅ Добавить версионирование в Auth API
3. ✅ Обновить маршрутизацию в API Gateway

### Приоритет 2: Реализация недостающих эндпоинтов
4. ✅ Добавить эндпоинты for executions (3 эндпоинта)
5. ✅ Добавить эндпоинты for templates (2 эндпоинта)
6. ✅ Добавить эндпоинты for permissions (3 эндпоинта)
7. ✅ Добавить `GET /api/v1/users` и `GET /api/v1/users/me` в Auth API

### Приоритет 3: Дополнительные уbetterния
8. ✅ Обновить Swagger documentацию
9. ✅ Обновить тесты
10. ✅ Обновить README fileы

---

**Последнее update:** 2025-11-16
**Status:** ⚠️ Требует refactoringа и доработки
