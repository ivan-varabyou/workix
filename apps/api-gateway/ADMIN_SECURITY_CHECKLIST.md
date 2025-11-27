# 📋 Чеклист улучшений безопасности админской аутентификации

## ✅ ФАЗА 1: Критичные улучшения безопасности (ЗАВЕРШЕНО)

### ✅ 1. Rate Limiting для админских эндпоинтов
- [x] Установлен `@nestjs/throttler`
- [x] Добавлен `ThrottlerModule` в `app.module.ts`
- [x] Настроены лимиты: 5 попыток/минуту для login
- [x] Добавлен `@Throttle({ short: { limit: 5, ttl: 60000 } })` к login эндпоинту
- [x] Добавлен `@UseGuards(ThrottlerGuard)` к login
- [x] Обновлена Swagger документация (429 Too Many Requests)

**Файлы:**
- `apps/api-gateway/src/app/app.module.ts`
- `apps/api-gateway/src/app/controllers/admin-auth.controller.ts`

---

### ✅ 2. Блокировка аккаунта после неудачных попыток
- [x] Добавлены поля в Prisma схему:
  - `failedLoginAttempts Int @default(0)`
  - `lockedUntil DateTime?`
- [x] Логика блокировки в `AdminAuthService.login()`:
  - Инкремент `failedLoginAttempts` при неудачной попытке
  - Блокировка на 15 минут после 5 неудачных попыток
  - Сброс счетчика при успешном входе
- [x] Проверка блокировки перед входом
- [x] Логирование неудачных попыток в `GatewayAuditLog`
- [x] Применена миграция БД

**Файлы:**
- `apps/api-gateway/prisma/schema.prisma`
- `apps/api-gateway/src/app/services/admin-auth.service.ts`

---

### ✅ 3. Проверка сессий при каждом запросе
- [x] Обновлен метод `verifyAdmin()`:
  - Проверка существования активной сессии в БД
  - Проверка соответствия токена сессии (bcrypt compare)
  - Проверка срока действия сессии (`expiresAt`)
- [x] Проверка блокировки аккаунта в `verifyAdmin()`
- [x] Логирование отсутствующих сессий

**Файлы:**
- `apps/api-gateway/src/app/services/admin-auth.service.ts`
- `apps/api-gateway/src/app/guards/admin-jwt.guard.ts`

---

## 🔴 ФАЗА 2: Критичные улучшения (В РАБОТЕ)

### 🔴 4. IP Whitelist для super_admin
- [ ] Создать модель `GatewayAdminIpWhitelist` в Prisma
- [ ] Добавить поля в `GatewayAdmin`:
  - `ipWhitelistEnabled Boolean @default(false)`
- [ ] Создать сервис `AdminIpWhitelistService`
- [ ] Проверка IP при входе super_admin
- [ ] Эндпоинты для управления IP whitelist:
  - `GET /api/v1/admin/auth/ip-whitelist` - список IP
  - `POST /api/v1/admin/auth/ip-whitelist` - добавить IP
  - `DELETE /api/v1/admin/auth/ip-whitelist/:id` - удалить IP
- [ ] Логирование попыток входа с неразрешенных IP

**Файлы:**
- `apps/api-gateway/prisma/schema.prisma`
- `apps/api-gateway/src/app/services/admin-ip-whitelist.service.ts` (новый)
- `apps/api-gateway/src/app/controllers/admin-auth.controller.ts`

---

### 🔴 5. Двухфакторная аутентификация (2FA/TOTP)
- [ ] Установить `speakeasy` и `qrcode`
- [ ] Добавить поля в `GatewayAdmin`:
  - `twoFactorEnabled Boolean @default(false)`
  - `twoFactorSecret String?`
  - `twoFactorBackupCodes String[]` (хешированные)
- [ ] Создать сервис `Admin2FAService`:
  - Генерация секрета
  - Генерация QR кода
  - Проверка TOTP кода
  - Генерация backup кодов
- [ ] Эндпоинты:
  - `POST /api/v1/admin/auth/2fa/setup` - настройка 2FA
  - `POST /api/v1/admin/auth/2fa/verify` - проверка при входе
  - `POST /api/v1/admin/auth/2fa/disable` - отключение
  - `GET /api/v1/admin/auth/2fa/qr` - получение QR кода
- [ ] Обязательно для super_admin

**Файлы:**
- `apps/api-gateway/prisma/schema.prisma`
- `apps/api-gateway/src/app/services/admin-2fa.service.ts` (новый)
- `apps/api-gateway/src/app/controllers/admin-auth.controller.ts`

---

### 🔴 6. Redis для токенов (опционально)
- [ ] Установить `@nestjs/cache-manager` и `cache-manager-redis-store`
- [ ] Настроить Redis модуль
- [ ] Хранить активные токены в Redis
- [ ] Проверка токенов в Redis при `verifyAdmin()`
- [ ] Инвалидация токенов при logout/change-password
- [ ] TTL для токенов = время жизни access token

**Файлы:**
- `apps/api-gateway/src/app/app.module.ts`
- `apps/api-gateway/src/app/services/admin-jwt.service.ts`
- `apps/api-gateway/src/app/services/admin-auth.service.ts`

---

## 🟡 ФАЗА 3: Важные функциональные улучшения

### 🟡 7. Восстановление пароля
- [ ] Создать модель `GatewayPasswordReset` в Prisma
- [ ] Эндпоинты:
  - `POST /api/v1/admin/auth/forgot-password` - запрос на сброс
  - `POST /api/v1/admin/auth/reset-password` - сброс по токену
- [ ] Генерация токена сброса (JWT или UUID)
- [ ] Отправка email с токеном (интеграция с email сервисом)
- [ ] Токен действителен 1 час
- [ ] Инвалидация всех сессий при сбросе

**Файлы:**
- `apps/api-gateway/prisma/schema.prisma`
- `apps/api-gateway/src/app/services/admin-auth.service.ts`
- `apps/api-gateway/src/app/controllers/admin-auth.controller.ts`

---

### 🟡 8. Смена пароля
- [ ] Эндпоинт `POST /api/v1/admin/auth/change-password`
- [ ] Требует текущий пароль
- [ ] Валидация нового пароля (мин 12 символов)
- [ ] Инвалидация всех сессий при смене
- [ ] Логирование в audit log

**Файлы:**
- `apps/api-gateway/src/app/services/admin-auth.service.ts`
- `apps/api-gateway/src/app/controllers/admin-auth.controller.ts`
- `apps/api-gateway/src/app/controllers/dto/admin-change-password.dto.ts` (новый)

---

### 🟡 9. Управление сессиями
- [ ] Эндпоинты:
  - `GET /api/v1/admin/auth/sessions` - список активных сессий
  - `DELETE /api/v1/admin/auth/sessions/:sessionId` - закрыть сессию
  - `DELETE /api/v1/admin/auth/sessions/all` - закрыть все сессии
- [ ] Информация о сессиях: IP, User-Agent, время создания, последняя активность
- [ ] Отметка текущей сессии

**Файлы:**
- `apps/api-gateway/src/app/services/admin-auth.service.ts`
- `apps/api-gateway/src/app/controllers/admin-auth.controller.ts`

---

### 🟡 10. История входов
- [ ] Расширить `GatewayAuditLog` или создать `GatewayAdminLoginHistory`
- [ ] Хранить: IP, User-Agent, успешность, время, причина отказа
- [ ] Эндпоинт `GET /api/v1/admin/auth/login-history`
- [ ] Фильтрация по дате, IP, успешности
- [ ] Пагинация

**Файлы:**
- `apps/api-gateway/prisma/schema.prisma`
- `apps/api-gateway/src/app/services/admin-auth.service.ts`
- `apps/api-gateway/src/app/controllers/admin-auth.controller.ts`

---

### 🟡 11. Уведомления о подозрительной активности
- [ ] Создать сервис `AdminNotificationService`
- [ ] События для уведомлений:
  - Вход с нового IP
  - Множественные неудачные попытки
  - Смена критичных настроек
  - Смена пароля
  - Отключение 2FA
- [ ] Интеграция с email/telegram/slack
- [ ] Настройки уведомлений в профиле админа

**Файлы:**
- `apps/api-gateway/src/app/services/admin-notification.service.ts` (новый)
- `apps/api-gateway/src/app/services/admin-auth.service.ts`

---

## 🟢 ФАЗА 4: Оптимизация и мониторинг

### 🟢 12. Кэширование проверки токенов
- [ ] Кэшировать результат `verifyAdmin()` в Redis
- [ ] TTL кэша = 5 минут
- [ ] Инвалидация при logout/change-password/block

**Файлы:**
- `apps/api-gateway/src/app/services/admin-auth.service.ts`

---

### 🟢 13. Оптимизация БД запросов
- [ ] Объединить проверку админа и сессии в один запрос
- [ ] Использовать `select` для минимизации данных
- [ ] Индексы на часто используемые поля

**Файлы:**
- `apps/api-gateway/src/app/services/admin-auth.service.ts`
- `apps/api-gateway/prisma/schema.prisma`

---

### 🟢 14. Структурированное логирование
- [ ] Установить `winston` или `pino`
- [ ] Настроить JSON формат логов
- [ ] Разные уровни для разных событий
- [ ] Логирование в файл + консоль

**Файлы:**
- `apps/api-gateway/src/app/services/admin-auth.service.ts`
- `apps/api-gateway/src/app/logger.module.ts` (новый)

---

### 🟢 15. Метрики Prometheus
- [ ] Установить `@willsoto/nestjs-prometheus`
- [ ] Метрики:
  - `admin_login_attempts_total{status="success|failure"}`
  - `admin_sessions_active`
  - `admin_accounts_locked`
  - `admin_2fa_enabled`
- [ ] Эндпоинт `/metrics`

**Файлы:**
- `apps/api-gateway/src/app/app.module.ts`
- `apps/api-gateway/src/app/services/admin-metrics.service.ts` (новый)

---

### 🟢 16. Health check для админов
- [ ] Эндпоинт `GET /api/v1/admin/health`
- [ ] Проверки:
  - Подключение к БД
  - Подключение к Redis (если используется)
  - Валидность JWT секрета
  - Статус сервисов

**Файлы:**
- `apps/api-gateway/src/app/controllers/admin-auth.controller.ts`

---

## 📊 Прогресс

**Завершено:** 3 / 16 задач (18.75%)
- ✅ Фаза 1: 3/3 (100%)
- 🔴 Фаза 2: 0/3 (0%)
- 🟡 Фаза 3: 0/5 (0%)
- 🟢 Фаза 4: 0/5 (0%)

---

## 🎯 Приоритеты

1. **Сейчас:** Фаза 1 завершена ✅
2. **Далее:** Фаза 2 (критичные улучшения)
3. **Потом:** Фаза 3 (функциональность)
4. **В конце:** Фаза 4 (оптимизация)

---

## 📝 Заметки

- Все изменения проходят через MCP серверы (TypeScript, ESLint)
- Тестирование через Swagger UI после каждого этапа
- Документация обновляется автоматически

