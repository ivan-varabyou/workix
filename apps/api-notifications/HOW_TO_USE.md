# 📧 Руководство по работе с сервисом уведомлений

## 🎯 Что это за сервис?

`api-notifications` - это **worker-сервис** (не HTTP), который:
- Слушает Redis очереди `notifications:email` и `notifications:push`
- Обрабатывает события уведомлений асинхронно
- Отправляет email через SendGrid (или логирует в консоль, если SendGrid не настроен)
- Отправляет push-уведомления через Web Push API (или логирует, если VAPID не настроен)

## 🚀 Запуск сервиса

### Способ 1: Через npm (рекомендуется для разработки)

```bash
cd apps/api-notifications
npm run dev
```

### Способ 2: Через NX

```bash
npx nx serve api-notifications
```

### Способ 3: Через Docker Compose

```bash
docker-compose up api-notifications
```

## ✅ Проверка работы сервиса

### 1. Проверка процесса

```bash
ps aux | grep -E "(tsx.*api-notifications|NotificationsService)" | grep -v grep
```

### 2. Проверка логов

Сервис выводит логи в консоль. Должны быть видны:
```
[Nest] LOG [NotificationsService] 🚀 Starting Notifications Microservice...
[Nest] LOG [NotificationsService] ✅ Notifications Microservice started successfully
[Nest] LOG [NotificationsService] 📧 Listening for email events on queue: notifications:email
[Nest] LOG [NotificationsService] 📱 Listening for push events on queue: notifications:push
[Nest] LOG [NotificationsService] 🔗 Redis: localhost:5900
[Nest] LOG [NotificationsService] ✅ Push notifications enabled (VAPID configured)
```

### 3. Проверка Redis очереди

Если установлен `redis-cli`:
```bash
redis-cli -h localhost -p 5900
> KEYS notifications:email:*
> LLEN notifications:email:waiting
```

## 🔄 Как работает сервис

### Архитектура

```
Auth Service → EventPublisherService → Redis Queue → api-notifications → SendGrid
```

### Типы событий

Сервис обрабатывает следующие типы событий:

**Email события:**
1. **email_verification** - верификация email
2. **password_reset** - сброс пароля
3. **security_code** - код безопасности

**Push события:**
4. **push** - push-уведомления в браузер

### Как отправляются события

События отправляются автоматически из `api-auth` сервиса через `EventPublisherService`:

- При регистрации → `email_verification`
- При запросе сброса пароля → `password_reset`
- При подозрительной активности → `security_code`

## 🧪 Тестирование вручную

### Вариант 1: Через API auth сервиса

Просто используйте эндпоинты `api-auth`:
- `POST /auth/register` - автоматически отправит email verification
- `POST /auth/password-reset/request` - автоматически отправит password reset
- `POST /auth/login` (с подозрительной активностью) - автоматически отправит security code

### Вариант 2: Прямая отправка в Redis очередь

Если нужно протестировать напрямую, можно отправить событие в Redis:

```bash
# Установить redis-cli если нет
sudo apt install redis-tools

# Подключиться к Redis
redis-cli -h localhost -p 5900

# Отправить тестовое событие (пример)
LPUSH bull:notifications:email:wait "{\"id\":\"test-123\",\"name\":\"email_verification\",\"data\":{\"type\":\"email_verification\",\"email\":\"test@example.com\",\"token\":\"test-token-123\"}}"
```

## 📊 Мониторинг

### Логи сервиса

Сервис логирует все операции:
- ✅ Успешная отправка: `✅ Email verification sent to user@example.com`
- ❌ Ошибки: `❌ Failed to send email verification: ...`

### Проверка очереди

```bash
# Количество задач в очереди
redis-cli -h localhost -p 5900 LLEN bull:notifications:email:wait

# Просмотр задач
redis-cli -h localhost -p 5900 LRANGE bull:notifications:email:wait 0 -1
```

## ⚙️ Конфигурация

Переменные окружения (см. `env.example`):

```bash
# Redis
REDIS_HOST=localhost
REDIS_PORT=5900
REDIS_DB=0

# Database (для истории отправки)
DATABASE_URL_NOTIFICATIONS=postgresql://postgres:postgres@localhost:5201/workix_notifications

# Auth Database (для push подписок)
DATABASE_URL_AUTH=postgresql://postgres:postgres@localhost:5200/workix_auth

# SendGrid (опционально)
SENDGRID_API_KEY=your-api-key
EMAIL_FROM=noreply@workix.com

# Web Push / VAPID (опционально)
# Генерация ключей: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:noreply@workix.com

# Frontend URL (для ссылок в email)
FRONTEND_URL=http://localhost:7300
```

## 🔍 Отладка

### Проблема: Сервис не запускается

1. Проверьте Redis: `redis-cli -h localhost -p 5900 ping`
2. Проверьте логи на ошибки
3. Проверьте переменные окружения

### Проблема: Email не отправляются

1. Проверьте логи сервиса - должны быть сообщения об обработке
2. Если SendGrid не настроен - email логируются в консоль
3. Проверьте очередь Redis - есть ли задачи

### Проблема: События не обрабатываются

1. Проверьте, что сервис запущен
2. Проверьте подключение к Redis
3. Проверьте, что события публикуются в правильную очередь

## 📝 Примеры использования

### Email уведомления (автоматически)

События отправляются автоматически при использовании:
- `EmailVerificationService.sendVerificationEmail()` → `email_verification`
- `PasswordResetService.requestPasswordReset()` → `password_reset`
- `SecurityCodeService.generateAndSendCode()` → `security_code`

### Push уведомления

#### 1. Регистрация Push подписки (Frontend)

```typescript
// В Service Worker или основном коде
async function registerPushSubscription() {
  // Получить VAPID public key с сервера
  const response = await fetch('/api/push-subscriptions/vapid-key');
  const { publicKey } = await response.json();

  // Подписаться на push
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  // Отправить подписку на сервер
  await fetch('/api/push-subscriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
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
}
```

#### 2. Отправка Push уведомления (Backend)

```typescript
// В любом сервисе (например, api-auth)
import { EventPublisherService } from '@workix/shared/backend/core';

constructor(private readonly eventPublisher: EventPublisherService) {}

// Пример: Приветственное уведомление после регистрации
async sendWelcomePush(userId: string, userName: string): Promise<void> {
  await this.eventPublisher.publishPushNotification({
    userId,
    email: '', // Опционально, для логирования
    title: 'Добро пожаловать в Workix!',
    body: `Привет, ${userName}! Спасибо за регистрацию.`,
    icon: '/assets/icon-192x192.png',
    badge: '/assets/badge-72x72.png',
    url: '/dashboard',
    tag: 'welcome',
    requireInteraction: false,
    data: {
      type: 'welcome',
      userId,
    },
  });
}

// Пример: Уведомление о новом сообщении
async sendMessageNotification(
  userId: string,
  messageId: string,
  senderName: string,
  messagePreview: string
): Promise<void> {
  await this.eventPublisher.publishPushNotification({
    userId,
    email: '',
    title: `Новое сообщение от ${senderName}`,
    body: messagePreview,
    icon: '/assets/message-icon.png',
    badge: '/assets/badge-72x72.png',
    url: `/messages/${messageId}`,
    tag: `message-${messageId}`,
    requireInteraction: true,
    data: {
      type: 'message',
      messageId,
      senderName,
    },
  });
}

// Пример: Уведомление о важном событии
async sendAlertNotification(
  userId: string,
  alertType: string,
  message: string
): Promise<void> {
  await this.eventPublisher.publishPushNotification({
    userId,
    email: '',
    title: 'Важное уведомление',
    body: message,
    icon: '/assets/alert-icon.png',
    url: '/alerts',
    tag: `alert-${alertType}`,
    requireInteraction: true,
    silent: false,
    data: {
      type: 'alert',
      alertType,
    },
  });
}
```

#### 3. Управление подписками через API

```bash
# Получить все подписки пользователя
GET /api/push-subscriptions
Authorization: Bearer <token>

# Удалить подписку
DELETE /api/push-subscriptions/:subscriptionId
Authorization: Bearer <token>
```

### Проверка работы

#### Email уведомления

1. Запустите `api-notifications`
2. Запустите `api-auth`
3. Вызовите `POST /auth/register` с тестовыми данными
4. Проверьте логи `api-notifications` - должно появиться сообщение об обработке

#### Push уведомления

1. Запустите `api-notifications` (должен быть запущен)
2. Запустите `api-auth`
3. Зарегистрируйте push подписку через `POST /api/push-subscriptions`
4. Отправьте тестовое push уведомление:
   ```typescript
   await eventPublisher.publishPushNotification({
     userId: 'user-id',
     email: 'user@example.com',
     title: 'Тестовое уведомление',
     body: 'Это тестовое сообщение',
   });
   ```
5. Проверьте логи `api-notifications` - должно появиться сообщение об обработке
6. Проверьте браузер - должно появиться push уведомление

### Тестирование через скрипт

Используйте готовый скрипт для тестирования:

```bash
./scripts/test-notifications.sh
```

Скрипт проверяет:
- ✅ Redis подключение
- ✅ `api-notifications` запущен
- ✅ `api-auth` запущен
- ✅ Отправляет тестовое событие регистрации
