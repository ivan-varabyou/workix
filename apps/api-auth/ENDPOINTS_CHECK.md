# 🔍 Проверка всех endpoints API Auth

**Дата**: 2025-01-XX

---

## 📋 Список всех endpoints

### AuthController (`/auth`)

#### Публичные endpoints:
1. `POST /auth/register` - Регистрация нового пользователя
2. `POST /auth/login` - Вход в систему
3. `POST /auth/verify` - Проверка токена
4. `POST /auth/refresh` - Обновление токена
5. `POST /auth/logout` - Выход из системы
6. `POST /auth/password-reset/request` - Запрос сброса пароля
7. `POST /auth/password-reset/verify` - Проверка токена сброса пароля
8. `POST /auth/password-reset/confirm` - Подтверждение сброса пароля
9. `GET /auth/health` - Проверка здоровья сервиса

#### Защищенные endpoints (требуют JWT):
10. `GET /auth/me` - Получить текущего пользователя
11. `POST /auth/2fa/generate` - Генерация секрета 2FA
12. `POST /auth/2fa/enable` - Включение 2FA
13. `POST /auth/2fa/verify` - Проверка 2FA кода
14. `DELETE /auth/2fa/disable` - Отключение 2FA
15. `GET /auth/2fa/status` - Статус 2FA
16. `POST /auth/2fa/regenerate-backup-codes` - Регенерация резервных кодов

### AuthSecurityController (`/auth/security`)

17. `POST /auth/security/verify-code` - Проверка кода безопасности
18. `POST /auth/security/resend-code` - Повторная отправка кода

### UsersController (`/users`)

19. `GET /users/me` - Получить текущего пользователя
20. `GET /users/:userId` - Получить пользователя по ID
21. `GET /users` - Список пользователей
22. `GET /users/search` - Поиск пользователей
23. `PUT /users/:userId` - Обновить пользователя
24. `POST /users/:userId/avatar` - Загрузить аватар
25. `DELETE /users/:userId` - Удалить пользователя

### OAuth2Controller (`/auth/oauth2`)

26. `GET /auth/oauth2/:provider` - Инициация OAuth2
27. `GET /auth/oauth2/:provider/callback` - Callback OAuth2

### PhoneOtpController (`/auth/phone-otp`)

28. `POST /auth/phone-otp/send` - Отправить OTP код
29. `POST /auth/phone-otp/verify` - Проверить OTP код

### EmailVerificationController (`/auth/email-verification`)

30. `POST /auth/email-verification/send` - Отправить код верификации
31. `POST /auth/email-verification/verify` - Проверить код верификации

---

## ✅ Проверка компиляции

```bash
nx run api-auth:build
```

---

## 🧪 Проверка через тесты

```bash
# Unit тесты
nx test api-auth

# Интеграционные тесты
nx test api-auth --testPathPattern=integration
```

---

## 🚀 Проверка через запуск сервиса

```bash
# Запуск в dev режиме
nx serve api-auth

# Проверка health endpoint
curl http://localhost:3000/auth/health
```

---

## 📝 Статус проверки

- [ ] Компиляция успешна
- [ ] Unit тесты проходят
- [ ] Интеграционные тесты проходят
- [ ] Сервис запускается
- [ ] Health endpoint отвечает
- [ ] Все endpoints доступны
