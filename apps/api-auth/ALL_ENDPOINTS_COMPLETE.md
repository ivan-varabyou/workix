# 📋 Полный список allх эндпоинтов API Auth

**Date:** 2025-11-16
**Базовый path:** `/api-auth/v1`
**Всего эндпоинтов:** 30+

---

## 🔐 Authentication (13 эндпоинтов)

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| `POST` | `/api-auth/v1/auth/register` | Регистрация пользователя | ❌ Public |
| `POST` | `/api-auth/v1/auth/login` | Вход в систему | ❌ Public |
| `POST` | `/api-auth/v1/auth/verify` | Проверка JWT токена | ❌ Public |
| `POST` | `/api-auth/v1/auth/refresh` | Обновление access token | ❌ Public |
| `GET` | `/api-auth/v1/auth/me` | Текущий пользователь | ✅ JWT |
| `POST` | `/api-auth/v1/auth/password-reset/request` | Запрос сброса пароля | ❌ Public |
| `POST` | `/api-auth/v1/auth/password-reset/verify` | Проверка токена сброса | ❌ Public |
| `POST` | `/api-auth/v1/auth/password-reset/confirm` | Подтверждение сброса пароля | ❌ Public |
| `POST` | `/api-auth/v1/auth/2fa/generate` | Генерация 2FA секрета | ✅ JWT |
| `POST` | `/api-auth/v1/auth/2fa/enable` | Включение 2FA | ✅ JWT |
| `POST` | `/api-auth/v1/auth/2fa/verify` | Проверка 2FA кода | ❌ Public |
| `DELETE` | `/api-auth/v1/auth/2fa/disable` | Отключение 2FA | ✅ JWT |
| `GET` | `/api-auth/v1/auth/2fa/status` | Статус 2FA | ✅ JWT |
| `POST` | `/api-auth/v1/auth/2fa/regenerate-backup-codes` | Реgeneration backup кодов | ✅ JWT |
| `GET` | `/api-auth/v1/auth/health` | Health check | ❌ Public |

---

## 👥 Users (7 эндпоинтов)

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| `GET` | `/api-auth/v1/users/me` | Текущий пользователь | ✅ JWT |
| `GET` | `/api-auth/v1/users` | Список users | ✅ JWT |
| `GET` | `/api-auth/v1/users/search` | Поиск users | ✅ JWT |
| `GET` | `/api-auth/v1/users/:userId` | Профиль пользователя | ✅ JWT |
| `PUT` | `/api-auth/v1/users/:userId` | Обновить профиль | ✅ JWT |
| `POST` | `/api-auth/v1/users/:userId/avatar` | Обновить аватар | ✅ JWT |
| `DELETE` | `/api-auth/v1/users/:userId` | Удалить профиль | ✅ JWT |

---

## 🔗 OAuth2 (8 эндпоинтов)

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| `GET` | `/api-auth/v1/auth/oauth/google` | Инициация Google OAuth | ❌ Public |
| `GET` | `/api-auth/v1/auth/oauth/google/callback` | Google OAuth callback | ❌ Public |
| `GET` | `/api-auth/v1/auth/oauth/github` | Инициация GitHub OAuth | ❌ Public |
| `GET` | `/api-auth/v1/auth/oauth/github/callback` | GitHub OAuth callback | ❌ Public |
| `GET` | `/api-auth/v1/auth/oauth/apple` | Инициация Apple Sign-In | ❌ Public |
| `GET` | `/api-auth/v1/auth/oauth/apple/callback` | Apple Sign-In callback | ❌ Public |
| `GET` | `/api-auth/v1/auth/oauth/me/accounts` | Социальные аккаунты пользователя | ✅ JWT |
| `POST` | `/api-auth/v1/auth/oauth/:provider/unlink` | Отвязать социальный аккаунт | ✅ JWT |

---

## 📱 Phone OTP (2 эндпоинта)

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| `POST` | `/api-auth/v1/auth/phone-otp/send` | Отправить OTP на телефон | ❌ Public |
| `POST` | `/api-auth/v1/auth/phone-otp/verify` | Проверить OTP и войти | ❌ Public |

---

## ✉️ Email Verification (4 эндпоинта)

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| `POST` | `/api-auth/v1/auth/email-verification/send` | Отправить письмо underтверждения | ❌ Public |
| `POST` | `/api-auth/v1/auth/email-verification/verify` | Подтвердить email | ❌ Public |
| `POST` | `/api-auth/v1/auth/email-verification/resend` | Повторно отправить письмо | ❌ Public |
| `GET` | `/api-auth/v1/auth/email-verification/status` | Статус underтверждения | ❌ Public |

---

## 📊 Итоговая statistics

| Категория | Количество |
|-----------|------------|
| **Authentication** | 15 |
| **Users** | 7 |
| **OAuth2** | 8 |
| **Phone OTP** | 2 |
| **Email Verification** | 4 |
| **ИТОГО** | **36** |

---

## 🔒 Авторизация

- **Public** (❌): Эндпоинты доступны without авторизации
- **JWT** (✅): Требуется JWT токен в заголовке `Authorization: Bearer <token>`

---

## 📝 Примечания

1. **Users эндпоинты** были перемещены из Monolith API в Auth API for централизации управления пользователями
2. **OAuth2** underдерживает Google, GitHub и Apple Sign-In
3. **2FA** uses TOTP (Time-based One-Time Password)
4. **Phone OTP** и **Email Verification** работают независимо от основной авторизации

---

**Последнее update:** 2025-11-16

