# 🔐 Архитектура авторизации монолита

**Date:** 2025-11-16
**Сервис:** api-monolith
**Микроservice auth:** api-auth (порт 7200)

---

## 📋 Обзор

Монолит uses **гибридный approach** for авторизации:
- **Локальная check JWT** (быстро, uses общий `JWT_SECRET`)
- **Удаленная check via микроservice auth** (централизовано, опционально)

---

## 🎯 Режимы авторизации

### 1. **Local Mode** (по умолчанию)
- ✅ Локальная check JWT токенов
- ✅ Использует общий `JWT_SECRET` из переменных окрalreadyния
- ✅ Быстро (without HTTP requestов)
- ⚠️ Не централизовано (each service проверяет локально)

**Usage:**
```bash
AUTH_VERIFICATION_MODE=local
```

### 2. **Remote Mode**
- ✅ Централизованная check via микроservice auth
- ✅ Всегда актуальная information о токенах
- ⚠️ Медленнее (HTTP requestы)
- ⚠️ Требует доступности микроserviceа auth

**Usage:**
```bash
AUTH_VERIFICATION_MODE=remote
AUTH_SERVICE_URL=http://localhost:7200
SERVICE_KEY=your-service-key
```

### 3. **Hybrid Mode** (рекомендуется)
- ✅ Локальная check сначала (быстро)
- ✅ Удаленная check for дополнительной валидации
- ✅ Лучшее из обоих миров
- ⚠️ Неmany slower, чем local mode

**Usage:**
```bash
AUTH_VERIFICATION_MODE=hybrid
AUTH_SERVICE_URL=http://localhost:7200
SERVICE_KEY=your-service-key
```

---

## 🔧 Конфигурация

### Переменные окрalreadyния

```bash
# Режим авторизации (local | remote | hybrid)
AUTH_VERIFICATION_MODE=local

# URL микроserviceа auth
AUTH_SERVICE_URL=http://localhost:7200

# Service key for внутренних requestов
SERVICE_KEY=your-service-key-minimum-32-characters-long

# Таймаут for HTTP requestов (мс)
AUTH_CLIENT_TIMEOUT=5000

# JWT Secret (общий for allх serviceов)
JWT_SECRET=your-jwt-secret-minimum-32-characters-long
```

---

## 📦 Компоненты

### 1. **AuthClientService**
HTTP client for взаимодействия с микроserviceом auth.

**Методы:**
- `verifyToken(token: string): Promise<VerifyTokenResponse>` - Проверка токена via auth service
- `isRemoteVerificationEnabled(): boolean` - Проверка, включена ли удаленная check
- `getAuthServiceUrl(): string` - Получить URL auth serviceа

### 2. **HybridJwtGuard**
Гибридный guard for checks JWT токенов.

**Поведение:**
- Наследуется от `AuthGuard('jwt')` for локальной checks
- Опционально вызывает `AuthClientService` for удаленной checks
- Поддерживает 3 modeа: local, remote, hybrid

### 3. **AuthClientModule**
NestJS module for экспорта serviceов и guards.

---

## 🚀 Usage

### В контроллерах

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { HybridJwtGuard } from '@workix/shared/backend/core';

@Controller('users')
@UseGuards(HybridJwtGuard) // Используем гибридный guard
export class UsersController {
  // ...
}
```

### Или используйте стандартный JwtGuard (local mode)

```typescript
import { JwtGuard } from '@workix/domain/auth';

@Controller('users')
@UseGuards(JwtGuard) // Локальная check только
export class UsersController {
  // ...
}
```

---

## 🔄 Поток авторизации

### Local Mode
```
1. Клиент → Монолит (с JWT токеном)
2. Монолит → JwtGuard → JwtStrategy → Проверка локально
3. ✅/❌ Результат
```

### Remote Mode
```
1. Клиент → Монолит (с JWT токеном)
2. Монолит → HybridJwtGuard → AuthClientService
3. AuthClientService → HTTP POST /api/auth/verify → Микроservice auth
4. Микроservice auth → Проверка токена → Ответ
5. ✅/❌ Результат
```

### Hybrid Mode
```
1. Клиент → Монолит (с JWT токеном)
2. Монолит → HybridJwtGuard → Локальная check (быстро)
3. Если локальная check успешна → Удаленная check (опционально)
4. ✅/❌ Результат
```

---

## 📊 Сравнение modeов

| Режим | Скорость | Централизация | Надежность | Рекомендация |
|-------|----------|---------------|------------|--------------|
| **Local** | ⚡⚡⚡ Быстро | ❌ Нет | ⚠️ Средняя | Для разработки |
| **Remote** | ⚡ Медленно | ✅ Да | ✅ Высокая | Для продакшена |
| **Hybrid** | ⚡⚡ Средне | ✅ Да | ✅ Высокая | **Рекомендуется** |

---

## 🔒 Безопасность

### Service Key
- Используется for внутренних requestов between serviceами
- Должен быть минимум 32 символа
- Хранится в переменных окрalreadyния
- Передается в заголовке `X-Service-Key`

### JWT Secret
- Общий секрет for underписи и checks JWT
- Должен быть минимум 32 символа
- Одинаковый for allх serviceов
- Хранится в переменных окрalreadyния

---

## 🧪 Тестирование

### Проверка local mode
```bash
curl -H "Authorization: Bearer <token>" http://localhost:7000/api/v1/users/me
```

### Проверка remote mode
```bash
# Установить mode
export AUTH_VERIFICATION_MODE=remote
export AUTH_SERVICE_URL=http://localhost:7200
export SERVICE_KEY=your-service-key

# Запустить монолит
npm run start:monolith

# Проверить
curl -H "Authorization: Bearer <token>" http://localhost:7000/api/v1/users/me
```

---

## 📝 Примеры

### Полная конфигурация for production

```bash
# .env
AUTH_VERIFICATION_MODE=hybrid
AUTH_SERVICE_URL=http://api-auth:7200
SERVICE_KEY=production-service-key-minimum-32-characters-long
AUTH_CLIENT_TIMEOUT=5000
JWT_SECRET=production-jwt-secret-minimum-32-characters-long
```

### Конфигурация for development

```bash
# .env
AUTH_VERIFICATION_MODE=local
JWT_SECRET=dev-jwt-secret-minimum-32-characters-long-for-development-only
```

---

## ✅ Итог

- ✅ Монолит **не содержит** логику авторизации (регистрация, login)
- ✅ Монолит **uses** JWT токены, выdata микроserviceом auth
- ✅ Монолит **проверяет** токены локально или via микроservice auth
- ✅ Поддерживается **3 modeа** авторизации for разных сpriceриев

**Рекомендация:** Используйте `hybrid` mode for production for баланса between скоростью и централизацией.
