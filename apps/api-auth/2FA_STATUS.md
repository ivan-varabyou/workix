# 🔐 Статус двухфаwhoрной аутентификации (2FA)

**Date:** 2025-11-16
**Сервис:** api-auth

---

## ✅ Текущий status

### Реализация
- ✅ **TwoFactorService** - полностью реализован
- ✅ **Эндпоинты** - all эндпоинты 2FA доступны
- ✅ **TOTP underдержка** - via speakeasy и qrcode
- ✅ **Backup codes** - generation и хранение резервных кодов
- ✅ **Swagger documentация** - all эндпоинты описаны

### Конфигурация
- ⚠️ **По умолчанию отключена** - `AUTH_ENABLE_2FA=false`
- ⚠️ **Нет checks в контроллере** - эндпоинты работают независимо от конфигурации

---

## 📋 Доступные эндпоинты

### 1. Генерация секрета и QR-кода
```
POST /api/auth/2fa/generate
Authorization: Bearer <token>
```

**Ответ:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,...",
  "manualEntryKey": "JBSWY3DPEHPK3PXP"
}
```

### 2. Включение 2FA
```
POST /api/auth/2fa/enable
Authorization: Bearer <token>
Body: {
  "secret": "JBSWY3DPEHPK3PXP",
  "totpCode": "123456"
}
```

**Ответ:**
```json
{
  "message": "2FA has been enabled successfully",
  "backupCodes": ["code1", "code2", ...]
}
```

### 3. Проверка 2FA кода (when входе)
```
POST /api/auth/2fa/verify
Body: {
  "userId": "uuid",
  "totpCode": "123456"
}
```

### 4. Отключение 2FA
```
DELETE /api/auth/2fa/disable
Authorization: Bearer <token>
```

### 5. Статус 2FA
```
GET /api/auth/2fa/status
Authorization: Bearer <token>
```

**Ответ:**
```json
{
  "enabled": true,
  "hasBackupCodes": true
}
```

### 6. Реgeneration резервных кодов
```
POST /api/auth/2fa/regenerate-backup-codes
Authorization: Bearer <token>
```

---

## 🔧 Как включить 2FA

### Шаг 1: Установить переменную окрalreadyния

```bash
# В .env fileе
AUTH_ENABLE_2FA=true
```

### Шаг 2: Перезапустить service

```bash
npm run start:auth
# или
npx nx serve api-auth
```

### Шаг 3: Проверить status

```bash
curl http://localhost:7200/api/auth/health
```

---

## ⚠️ Проблема: Нет checks конфигурации

**Текущая ситуация:**
- Эндпоинты 2FA работают даже если `AUTH_ENABLE_2FA=false`
- Нет checks `authFeatures.is2FAEnabled()` в контроллере

**Рекомендация:**
Добавить проверку конфигурации в контроллер for allх эндпоинтов 2FA.

---

## 📝 Пример usage

### 1. Пользователь генерирует секрет

```bash
curl -X POST http://localhost:7200/api/auth/2fa/generate \
  -H "Authorization: Bearer <token>"
```

### 2. Пользователь сканирует QR-код в whenложении (Google Authenticator, Authy)

### 3. Пользователь включает 2FA

```bash
curl -X POST http://localhost:7200/api/auth/2fa/enable \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "JBSWY3DPEHPK3PXP",
    "totpCode": "123456"
  }'
```

### 4. При входе пользователь вводит код из whenложения

```bash
curl -X POST http://localhost:7200/api/auth/2fa/verify \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "uuid",
    "totpCode": "123456"
  }'
```

---

## 🔒 Безопасность

### Текущие меры:
- ✅ TOTP коды (Time-based One-Time Password)
- ✅ Резервные коды for восстановления
- ✅ Хеширование резервных кодов
- ✅ Проверка кода before включением

### Рекомендации for production:
- ⚠️ **Шифрование секрета** - сейчас секрет хранится в открытом виде
- ⚠️ **Rate limiting** - ограничение попыток checks кода
- ⚠️ **Логирование** - logging allх операций с 2FA
- ⚠️ **Уведомления** - отправка email when включении/отключении 2FA

---

## ✅ Итог

**Status:** ✅ Реализована, но по умолчанию отключена

**Для включения:**
1. Установить `AUTH_ENABLE_2FA=true`
2. Перезапустить service
3. (Рекомендуется) Добавить проверку конфигурации в контроллер
