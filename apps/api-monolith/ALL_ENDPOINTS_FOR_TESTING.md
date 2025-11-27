# 📋 Полный список allх эндпоинтов for тестирования

**Date:** 2025-11-16
**Goal:** Создание полного списка allх эндпоинтов for интеграционного тестирования

---

## 🏗️ Архитектура

```
Client → API Gateway (4200) → Auth API (7200) / Monolith API (7000)
```

**Base Path via Gateway:** `/api/v1/*`
**Base Path напрямую:**
- Auth API: `/api/auth/*` (текущий) или `/api/v1/auth/*` (рекомендуется)
- Monolith API: `/api/v1/*`

---

## 🔐 Auth API (Port 7200) - 27 эндпоинтов

### Authentication (6)
1. ✅ `POST /api/auth/register` - Регистрация пользователя
2. ✅ `POST /api/auth/login` - Вход пользователя
3. ✅ `POST /api/auth/verify` - Верификация JWT токена
4. ✅ `POST /api/auth/refresh` - Обновление access token
5. ✅ `GET /api/auth/me` - Получение текущего пользователя
6. ✅ `GET /api/auth/health` - Health check

### Password Reset (3)
7. ✅ `POST /api/auth/password-reset/request` - Запрос сброса пароля
8. ✅ `POST /api/auth/password-reset/verify` - Проверка токена сброса
9. ✅ `POST /api/auth/password-reset/confirm` - Подтверждение сброса пароля

### Two-Factor Authentication (6)
10. ✅ `POST /api/auth/2fa/generate` - Генерация 2FA секрета
11. ✅ `POST /api/auth/2fa/enable` - Включение 2FA
12. ✅ `POST /api/auth/2fa/verify` - Проверка 2FA кода
13. ✅ `DELETE /api/auth/2fa/disable` - Отключение 2FA
14. ✅ `GET /api/auth/2fa/status` - Статус 2FA
15. ✅ `POST /api/auth/2fa/regenerate-backup-codes` - Реgeneration резервных кодов

### OAuth2 (6)
16. ✅ `GET /api/auth/oauth/google` - Инициация Google OAuth2
17. ✅ `GET /api/auth/oauth/google/callback` - Google OAuth2 callback
18. ✅ `GET /api/auth/oauth/github` - Инициация GitHub OAuth2
19. ✅ `GET /api/auth/oauth/github/callback` - GitHub OAuth2 callback
20. ✅ `GET /api/auth/oauth/apple` - Инициация Apple Sign In
21. ✅ `GET /api/auth/oauth/apple/callback` - Apple Sign In callback

### Phone OTP (2)
22. ✅ `POST /api/auth/phone-otp/send` - Отправка OTP на телефон
23. ✅ `POST /api/auth/phone-otp/verify` - Проверка OTP и аутентификация

### Email Verification (4)
24. ✅ `POST /api/auth/email-verification/send` - Отправка письма верификации
25. ✅ `POST /api/auth/email-verification/verify` - Верификация email
26. ✅ `POST /api/auth/email-verification/resend` - Повторная отправка
27. ✅ `GET /api/auth/email-verification/status` - Статус верификации

### ❌ User Management (4) - ОТСУТСТВУЕТ (exists в монолите!)
28. ❌ `GET /api/users` - Список users (с пагинацией)
29. ❌ `GET /api/users/:userId` - Профиль пользователя
30. ❌ `PUT /api/users/:userId` - Обновление профиля
31. ❌ `DELETE /api/users/:userId` - Удаление пользователя
32. ❌ `POST /api/users/:userId/avatar` - Загрузка аватара

**Итого в Auth API:** 27 эндпоинтов (должно быть 32)

---

## 🏢 Monolith API (Port 7000) - 100 эндпоинтов

### App Controller (3)
1. ✅ `GET /api/v1/health` - Health check
2. ✅ `GET /api/v1/info` - Информация об API
3. ✅ `GET /api/v1/stats` - Статистика systems

### ❌ Users Controller (4) - НЕПРАВИЛЬНО РАЗМЕЩЕН!
4. ❌ `GET /api/v1/users/:userId` - **ДОЛЖНО БЫТЬ В AUTH API**
5. ❌ `PUT /api/v1/users/:userId` - **ДОЛЖНО БЫТЬ В AUTH API**
6. ❌ `POST /api/v1/users/:userId/avatar` - **ДОЛЖНО БЫТЬ В AUTH API**
7. ❌ `DELETE /api/v1/users/:userId` - **ДОЛЖНО БЫТЬ В AUTH API**

### Pipelines Controller (6)
8. ✅ `POST /api/v1/pipelines` - Создание пайплайна
9. ✅ `GET /api/v1/pipelines` - Список пайплайнов пользователя
10. ✅ `GET /api/v1/pipelines/:id` - Получение пайплайна
11. ✅ `PUT /api/v1/pipelines/:id` - Обновление пайплайна
12. ✅ `DELETE /api/v1/pipelines/:id` - Удаление пайплайна
13. ✅ `GET /api/v1/pipelines/marketplace/list` - Публичные пайплайны

### RBAC Controller (9)
14. ✅ `POST /api/v1/rbac/roles` - Создание роли
15. ✅ `GET /api/v1/rbac/roles` - Список ролей
16. ✅ `GET /api/v1/rbac/roles/:id` - Получение роли
17. ✅ `PUT /api/v1/rbac/roles/:id` - Обновление роли
18. ✅ `DELETE /api/v1/rbac/roles/:id` - Удаление роли
19. ✅ `POST /api/v1/rbac/permissions` - Создание разрешения
20. ✅ `GET /api/v1/rbac/permissions` - Список разрешений
21. ✅ `POST /api/v1/rbac/assign-role` - Наvalue роли пользователю
22. ✅ `DELETE /api/v1/rbac/assign-role` - Удаление роли у пользователя

### Workers Controller (13)
23. ✅ `POST /api/v1/workers` - Создание виртуального воркера
24. ✅ `GET /api/v1/workers` - Список воркеров
25. ✅ `GET /api/v1/workers/:workerId` - Получение воркера
26. ✅ `PUT /api/v1/workers/:workerId` - Обновление воркера
27. ✅ `DELETE /api/v1/workers/:workerId` - Удаление воркера
28. ✅ `POST /api/v1/workers/:workerId/tasks` - Наvalue задачи воркеру
29. ✅ `GET /api/v1/workers/:workerId/tasks` - Список задач воркера
30. ✅ `GET /api/v1/workers/:workerId/tasks/:taskId` - Получение задачи
31. ✅ `PUT /api/v1/workers/:workerId/tasks/:taskId/cancel` - Отмена задачи
32. ✅ `GET /api/v1/workers/:workerId/status` - Статус воркера
33. ✅ `PUT /api/v1/workers/:workerId/pause` - Пауза воркера
34. ✅ `PUT /api/v1/workers/:workerId/resume` - Возupdate воркера
35. ✅ `GET /api/v1/workers/:workerId/metrics` - Меthreeки воркера

### A/B Testing Controller (8)
36. ✅ `POST /api/v1/ab-tests` - Создание A/B теста
37. ✅ `GET /api/v1/ab-tests` - Список A/B тестов
38. ✅ `GET /api/v1/ab-tests/:testId` - Получение A/B теста
39. ✅ `POST /api/v1/ab-tests/:testId/track` - Трекинг события
40. ✅ `GET /api/v1/ab-tests/:testId/results` - Результаты теста
41. ✅ `PUT /api/v1/ab-tests/:testId/end` - Завершение теста
42. ✅ `PUT /api/v1/ab-tests/:testId/pause` - Пауза теста
43. ✅ `PUT /api/v1/ab-tests/:testId/resume` - Возupdate теста

### Integration CRUD Controller (13)
44. ✅ `GET /api/v1/integrations/providers` - Список провайдеров интеграций
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

### E-commerce Controller (7)
57. ✅ `GET /api/v1/integrations/ecommerce/products/search` - Поиск продуwhoв
58. ✅ `POST /api/v1/integrations/ecommerce/products/upload` - Загрузка продукта
59. ✅ `GET /api/v1/integrations/ecommerce/products/:provider/:productId` - Статистика продукта
60. ✅ `PUT /api/v1/integrations/ecommerce/products/:provider/:productId` - Обновление продукта
61. ✅ `POST /api/v1/integrations/ecommerce/products/bulk-upload` - Массовая загрузка продуwhoв
62. ✅ `GET /api/v1/integrations/ecommerce/sellers/:provider/metrics` - Меthreeки продавца
63. ✅ `GET /api/v1/integrations/ecommerce/categories/:provider` - Категории продуwhoв

### Analytics Controller (4)
64. ✅ `POST /api/v1/analytics/universal/analyze` - Анализ данных
65. ✅ `POST /api/v1/analytics/universal/retention` - Анализ удержания
66. ✅ `POST /api/v1/analytics/universal/predict` - Прогнозирование
67. ✅ `POST /api/v1/analytics/universal/compare` - Сравнение данных

### Integration Monitoring Controller (3)
68. ✅ `GET /api/v1/integrations/monitoring/health` - Здоровье allх провайдеров
69. ✅ `GET /api/v1/integrations/monitoring/alerts` - Алерты интеграций
70. ✅ `GET /api/v1/integrations/monitoring/dashboard` - Дашборд monitoringа

### Integration Metrics Controller (3)
71. ✅ `GET /api/v1/integrations/metrics` - Общие metrics интеграций
72. ✅ `GET /api/v1/integrations/metrics/provider/:providerId` - Меthreeки провайдера
73. ✅ `GET /api/v1/integrations/metrics/errors` - Ошибки интеграций

### Integration Health Controller (2)
74. ✅ `GET /api/v1/integrations/health` - Общее health интеграций
75. ✅ `GET /api/v1/integrations/health/:providerId` - Здоровье конкретного провайдера

### Credential Rotation Controller (4)
76. ✅ `POST /api/v1/integrations/credentials/rotate/all` - Ротация allх credentials
77. ✅ `POST /api/v1/integrations/credentials/rotate/provider/:providerId` - Ротация credentials провайдера
78. ✅ `POST /api/v1/integrations/credentials/rotate/expired` - Ротация истекших credentials
79. ✅ `POST /api/v1/integrations/credentials/rotate/expiring` - Ротация истекающих credentials

### Generation Controller (13)
80. ✅ `POST /api/v1/generation/text` - Генерация текста
81. ✅ `POST /api/v1/generation/text/variations` - Генерация вариаций текста
82. ✅ `POST /api/v1/generation/image` - Генерация изображения
83. ✅ `POST /api/v1/generation/image/variations` - Генерация вариаций изображения
84. ✅ `POST /api/v1/generation/video` - Генерация видео
85. ✅ `POST /api/v1/generation/speech` - Генерация речи
86. ✅ `POST /api/v1/generation/vision/analyze` - Анализ изображения
87. ✅ `POST /api/v1/generation/search` - Поиск в интернете
88. ✅ `POST /api/v1/generation/embedding` - Генерация эмбеддинга
89. ✅ `POST /api/v1/generation/context` - Генерация контекста
90. ✅ `POST /api/v1/generation/translate` - Перевод текста
91. ✅ `POST /api/v1/generation/translate/detect` - Определение языка
92. ✅ `POST /api/v1/generation/quality/score` - Оценка качества контента

**Итого в Monolith API:** 100 эндпоинтов (4 неправильно размещены)

---

## 📊 Статистика

| Сервис | Эндпоинтов | POST/PUT | GET | DELETE | Статус |
|--------|-----------|----------|-----|--------|--------|
| **Auth API** | 27 | 19 | 7 | 1 | ⚠️ Неполный |
| **Monolith API** | 100 | 35 | 58 | 7 | ⚠️ Требует исправления |
| **ИТОГО** | **127** | **54** | **65** | **8** | ⚠️ Требует refactoringа |

---

## 🧪 Эндпоинты for тестирования создания данных

### Auth API (POST эндпоинты)
1. ✅ `POST /api/auth/register` - Создание пользователя
2. ✅ `POST /api/auth/login` - Вход (creation сессии)
3. ✅ `POST /api/auth/password-reset/request` - Создание requestа сброса
4. ✅ `POST /api/auth/2fa/generate` - Генерация 2FA секрета
5. ✅ `POST /api/auth/2fa/enable` - Включение 2FA
6. ✅ `POST /api/auth/email-verification/send` - Отправка письма

### Monolith API (POST/PUT эндпоинты)
7. ✅ `POST /api/v1/pipelines` - Создание пайплайна
8. ✅ `POST /api/v1/rbac/roles` - Создание роли
9. ✅ `POST /api/v1/rbac/permissions` - Создание разрешения
10. ✅ `POST /api/v1/rbac/assign-role` - Наvalue роли
11. ✅ `POST /api/v1/workers` - Создание воркера
12. ✅ `POST /api/v1/workers/:workerId/tasks` - Наvalue задачи
13. ✅ `POST /api/v1/ab-tests` - Создание A/B теста
14. ✅ `POST /api/v1/integrations/providers` - Создание провайдера
15. ✅ `POST /api/v1/integrations/providers/:id/credentials` - Добавление credentials
16. ✅ `POST /api/v1/integrations/providers/:id/config` - Установка конфигурации
17. ✅ `POST /api/v1/integrations/ecommerce/products/upload` - Загрузка продукта
18. ✅ `POST /api/v1/integrations/ecommerce/products/bulk-upload` - Массовая загрузка
19. ✅ `POST /api/v1/integrations/credentials/rotate/all` - Ротация credentials
20. ✅ `POST /api/v1/analytics/universal/analyze` - Анализ данных
21. ✅ `POST /api/v1/generation/text` - Генерация текста
22. ✅ `PUT /api/v1/pipelines/:id` - Обновление пайплайна
23. ✅ `PUT /api/v1/rbac/roles/:id` - Обновление роли
24. ✅ `PUT /api/v1/workers/:workerId` - Обновление воркера
25. ✅ `PUT /api/v1/integrations/providers/:id` - Обновление провайдера

**Итого for тестирования:** 25 POST/PUT эндпоинтов

---

## 🚨 Проблемы

### 1. Users Controller в монолите
- ❌ `GET /api/v1/users/:userId` - должно быть в Auth API
- ❌ `PUT /api/v1/users/:userId` - должно быть в Auth API
- ❌ `POST /api/v1/users/:userId/avatar` - должно быть в Auth API
- ❌ `DELETE /api/v1/users/:userId` - должно быть в Auth API

### 2. Версионирование
- ❌ Auth API uses `/api/auth/*` (without версии)
- ✅ Monolith API uses `/api/v1/*` (с версией)
- ✅ API Gateway uses `/api/v1/*` (с версией)

**Рекомендация:** Добавить версионирование в Auth API: `/api/v1/auth/*`

### 3. Отсутствующие эндпоинты в Auth API
- ❌ `GET /api/users` - список users
- ❌ `GET /api/users/me` - текущий пользователь (удобнее чем `/:userId`)
- ❌ `GET /api/users/search?q=...` - поиск users

---

## ✅ Рекомендации

1. **Переместить Users Controller в Auth API**
2. **Добавить версионирование в Auth API** (`/api/v1/auth/*`)
3. **Обновить маршрутизацию в API Gateway** (users → auth)
4. **Добавить недостающие эндпоинты** в Auth API
5. **Обновить тесты** after refactoringа

---

**Последнее update:** 2025-11-16
**Status:** 🔍 Готово for тестирования (after refactoringа)
