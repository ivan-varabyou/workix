# 📧 Архитектура сервиса уведомлений

## 🎯 Правильная архитектура

**Да, правильно!** Сервис `api-notifications` поддерживает **несколько каналов уведомлений**:

1. ✅ **Email** - реализовано и работает
2. ✅ **Push notifications** - реализовано и работает
3. ⏳ **SMS** - опционально, для будущего

## 🏗️ Текущая архитектура

```
┌─────────────────┐
│   Auth Service  │
│  (api-auth)     │
│                 │
│  Auth endpoints │ ✅ Только аутентификация
└────────┬─────────┘
         │
         │ EventPublisherService
         │ publishNotification()
         │ publishPushNotification()
         ▼
┌─────────────────┐
│  Redis Queue    │
│ notifications:  │
│  - email        │ ✅
│  - push         │ ✅
└────────┬─────────┘
         │
         │ Process jobs
         ▼
┌─────────────────┐
│ api-notifications│
│  (Hybrid)       │
│                 │
│  HTTP API       │ ✅ Push Subscription API
│  └─ /subscriptions│
│                 │
│  Worker         │
│  ├─ EmailProcessor │ ✅ Реализовано
│  └─ PushProcessor   │ ✅ Реализовано
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│SendGrid│ │Web Push │
│(Email) │ │(Push)   │ ✅
└────────┘ └──────────┘
```

## ✅ Реализованные компоненты

### 1. Push Notification Processor ✅

**Файл:** `libs/domain/notifications/src/processors/push.processor.ts`

- ✅ Обрабатывает события из очереди `notifications:push`
- ✅ Использует `PushNotificationService` для отправки
- ✅ Обрабатывает ошибки и повторные попытки
- ✅ Логирует результаты отправки

### 2. Push Notification Service ✅

**Файл:** `libs/infrastructure/notifications/src/services/push-notification.service.ts`

- ✅ Хранение подписок пользователей (endpoint, keys) через Prisma
- ✅ Отправка push через Web Push API (библиотека `web-push`)
- ✅ Поддержка VAPID ключей для аутентификации
- ✅ Автоматическое удаление невалидных подписок
- ✅ Обработка множественных подписок для одного пользователя

### 3. EventPublisherService ✅

**Файл:** `libs/shared/backend/core/src/events/event-publisher.service.ts`

- ✅ Метод `publishPushNotification()` реализован
- ✅ Очередь `notifications:push` зарегистрирована
- ✅ Поддержка retry и backoff стратегий
- ✅ Логирование событий

### 4. Notification Events ✅

**Файл:** `libs/shared/backend/core/src/events/notification-events.dto.ts`

- ✅ Тип `PushNotificationEvent` определен
- ✅ `NotificationType.PUSH` добавлен в enum
- ✅ Все типы событий экспортированы

### 5. Push Subscription Management ✅

**Файл:** `libs/domain/notifications/src/services/push-subscription.service.ts`

- ✅ Регистрация подписок (`registerSubscription`)
- ✅ Отмена подписок (`unregisterSubscription`)
- ✅ Получение подписок пользователя (`getUserSubscriptions`)

### 6. Push Subscription API ✅

**Файл:** `apps/api-notifications/src/controllers/push-subscription.controller.ts`

- ✅ `POST /api-notifications/v1/subscriptions` - регистрация подписки
- ✅ `GET /api-notifications/v1/subscriptions` - получение подписок пользователя
- ✅ `DELETE /api-notifications/v1/subscriptions/:id` - удаление подписки
- ✅ Защита через `JwtGuard`
- ✅ Swagger документация на `/docs`

### 7. Database Schema ✅

**Файл:** `apps/api-auth/prisma/schema.prisma`

- ✅ Модель `PushSubscription` с полями:
  - `id`, `userId`, `endpoint`, `p256dh`, `auth`
  - `userAgent`, `isActive`, `createdAt`, `updatedAt`
- ✅ Unique constraint на `userId + endpoint`
- ✅ Индексы для оптимизации запросов

## 🔄 Поток данных для Push

1. **Frontend** регистрирует push подписку → `POST /api-notifications/v1/subscriptions` → сохраняет в БД ✅
2. **Backend** создает событие → `EventPublisherService.publishPushNotification()` ✅
3. **Redis Queue** → очередь `notifications:push` ✅
4. **api-notifications** → `PushProcessor` обрабатывает ✅
5. **PushNotificationService** → отправляет через Web Push API ✅
6. **Browser** → показывает уведомление ✅

## 🔄 Поток данных для Email

1. **Backend** создает событие → `EventPublisherService.publishEmailVerification()` ✅
2. **Redis Queue** → очередь `notifications:email` ✅
3. **api-notifications** → `EmailProcessor` обрабатывает ✅
4. **EmailNotificationService** → отправляет через SendGrid ✅
5. **User** → получает email ✅

## 📋 Конфигурация

### Environment Variables

**Для api-notifications:**

```env
# VAPID Keys для Web Push
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_SUBJECT=mailto:noreply@workix.com

# Database
DATABASE_URL_NOTIFICATIONS=postgresql://postgres:postgres@localhost:5201/workix_notifications
DATABASE_URL_AUTH=postgresql://postgres:postgres@localhost:5200/workix_auth

# Redis
REDIS_HOST=localhost
REDIS_PORT=5900
```

### Генерация VAPID ключей

```bash
npx web-push generate-vapid-keys
```

## 💡 Примеры использования

### Отправка Push уведомления

```typescript
// В любом сервисе (например, api-auth)
import { EventPublisherService } from '@workix/shared/backend/core';

constructor(private readonly eventPublisher: EventPublisherService) {}

async sendWelcomePush(userId: string): Promise<void> {
  await this.eventPublisher.publishPushNotification({
    userId,
    title: 'Добро пожаловать!',
    body: 'Спасибо за регистрацию в Workix',
    icon: '/assets/icon-192x192.png',
    url: '/dashboard',
  });
}
```

### Регистрация Push подписки (Frontend)

```typescript
// Frontend код
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: VAPID_PUBLIC_KEY,
});

await fetch('/api/push-subscriptions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    subscription: {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
        auth: arrayBufferToBase64(subscription.getKey('auth')),
      },
    },
  }),
});
```

## ✅ Преимущества мультиканальной архитектуры

- **Гибкость**: Пользователь выбирает каналы уведомлений
- **Надежность**: Если один канал недоступен, используется другой
- **Масштабируемость**: Каждый канал обрабатывается отдельно
- **Разделение ответственности**: Один сервис для всех уведомлений
- **Асинхронность**: Уведомления не блокируют основной поток

## 📝 Статус реализации

### ✅ Реализовано

1. **Email notifications** - полностью работает
   - Email verification
   - Password reset
   - Security codes

2. **Push notifications** - полностью работает
   - Регистрация подписок
   - Отправка уведомлений
   - Управление подписками через API

### ⏳ Будущие улучшения

1. **SMS notifications** - опционально
   - Интеграция с SMS провайдерами (Twilio, AWS SNS)
   - SMS Processor аналогично Email/Push

2. **Telegram notifications** - опционально
   - Интеграция с Telegram Bot API
   - Telegram Processor

3. **WebSocket real-time** - опционально
   - Real-time уведомления через WebSocket
   - Интеграция с существующим notification service

## 🔗 Связанные компоненты

- **Frontend**: `apps/app-web/src/service-worker.ts` - Service Worker для push
- **Frontend**: `apps/app-web/src/app/services/notification.service.ts` - WebSocket для real-time
- **Backend**: `libs/shared/backend/core/src/events/event-publisher.service.ts` - публикация событий
- **Backend**: `apps/api-auth/src/auth/controllers/push-subscription.controller.ts` - API управления подписками
- **Database**: `apps/api-auth/prisma/schema.prisma` - модель PushSubscription

## 🚀 Запуск и тестирование

### Запуск сервиса

```bash
cd apps/api-notifications
npm run dev
```

### Тестирование

```bash
# Проверка работы очередей
redis-cli
> KEYS notifications:*

# Проверка логов
# Смотрите логи api-notifications для обработки событий
```

## 📚 Дополнительная документация

- `apps/api-notifications/HOW_TO_USE.md` - подробное руководство по использованию
- `NOTIFICATIONS_MICROSERVICE_ARCHITECTURE.md` - общая архитектура микросервиса
