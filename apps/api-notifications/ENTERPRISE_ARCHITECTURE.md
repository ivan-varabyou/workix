# 🏢 Enterprise Architecture: Notifications Service

## 📊 Как это устроено в крупных компаниях

### Примеры из реальных компаний

#### 1. **Google (Firebase Cloud Messaging / FCM)**
```
┌─────────────────┐
│  Client Apps    │
│  (Mobile/Web)   │
└────────┬────────┘
         │
         │ Register Subscription
         ▼
┌─────────────────┐
│  FCM API        │ ← HTTP API для управления подписками
│  (Notifications)│
└────────┬────────┘
         │
         │ Process Events
         ▼
┌─────────────────┐
│  FCM Backend    │ ← Worker для отправки уведомлений
│  (Delivery)     │
└─────────────────┘
```

**Особенности:**
- ✅ Единый сервис с HTTP API + Worker
- ✅ API для регистрации подписок (`/v1/projects/{project}/subscriptions`)
- ✅ Асинхронная обработка через очереди
- ✅ Мультиканальная доставка (push, email, SMS)

#### 2. **Amazon (SNS - Simple Notification Service)**
```
┌─────────────────┐
│  Application    │
│  Services       │
└────────┬────────┘
         │
         │ Publish Events
         ▼
┌─────────────────┐
│  SNS API        │ ← HTTP API для управления подписками
│  (Topics/Subs)  │   и публикации событий
└────────┬────────┘
         │
         │ Process & Deliver
         ▼
┌─────────────────┐
│  SNS Delivery   │ ← Worker для доставки
│  (Multi-channel)│
└─────────────────┘
```

**Особенности:**
- ✅ Единый сервис с HTTP API + Worker
- ✅ API для управления подписками (`/subscriptions`, `/topics`)
- ✅ Асинхронная доставка через очереди
- ✅ Поддержка множества каналов (SNS, SQS, Email, SMS, Push)

#### 3. **Microsoft (Azure Notification Hubs)**
```
┌─────────────────┐
│  Client Apps    │
└────────┬────────┘
         │
         │ Register Device
         ▼
┌─────────────────┐
│  Notification   │ ← HTTP API для регистрации устройств
│  Hubs API       │   и управления подписками
└────────┬────────┘
         │
         │ Send Notifications
         ▼
┌─────────────────┐
│  Hub Backend    │ ← Worker для отправки
│  (Delivery)     │
└─────────────────┘
```

**Особенности:**
- ✅ Единый сервис с HTTP API + Worker
- ✅ REST API для управления (`/hubs/{hubName}/registrations`)
- ✅ Асинхронная обработка
- ✅ Мультиплатформенная доставка

#### 4. **Twilio (Notifications)**
```
┌─────────────────┐
│  Your App       │
└────────┬────────┘
         │
         │ API Calls
         ▼
┌─────────────────┐
│  Twilio API     │ ← HTTP API для всего
│  (Notifications)│   (подписки + отправка)
└────────┬────────┘
         │
         │ Process
         ▼
┌─────────────────┐
│  Twilio Backend │ ← Worker для доставки
│  (Delivery)     │
└─────────────────┘
```

## 🎯 Общие паттерны в Enterprise

### 1. **Гибридный сервис (Hybrid Service)**

**Правильная архитектура:**
```
Notifications Service
├── HTTP API (Port 7201)
│   ├── POST /subscriptions        → Регистрация подписки
│   ├── GET /subscriptions         → Получение подписок
│   ├── DELETE /subscriptions/:id   → Удаление подписки
│   └── GET /health                → Health check
│
└── Worker (Background)
    ├── EmailProcessor             → Обработка email событий
    ├── PushProcessor              → Обработка push событий
    └── SmsProcessor               → Обработка SMS событий
```

**Почему это правильно:**
- ✅ **Единая точка ответственности** - все уведомления в одном месте
- ✅ **Простота интеграции** - один сервис для всех операций
- ✅ **Масштабируемость** - можно масштабировать API и Worker отдельно
- ✅ **Консистентность** - единая БД для подписок и метаданных

### 2. **Разделение по ответственности**

#### ❌ НЕПРАВИЛЬНО (текущее состояние):
```
api-auth (7200)
├── /auth/*              ← Аутентификация ✅
└── /push-subscriptions  ← Управление подписками ❌ (не относится к auth!)

api-notifications (7201)
└── Worker only          ← Только обработка событий ❌ (нет API!)
```

**Проблемы:**
- Нарушение Single Responsibility Principle
- `api-auth` знает о push-подписках (не его зона ответственности)
- `api-notifications` не может управлять подписками (нет API)

#### ✅ ПРАВИЛЬНО (как в Enterprise):
```
api-auth (7200)
└── /auth/*              ← Только аутентификация ✅

api-notifications (7201)
├── HTTP API
│   └── /subscriptions   ← Управление подписками ✅
└── Worker
    └── Processors       ← Обработка событий ✅
```

**Преимущества:**
- Четкое разделение ответственности
- `api-auth` - только auth
- `api-notifications` - все про уведомления (API + Worker)

### 3. **Хранение данных**

#### Вариант A: Подписки в Auth БД (текущий)
```
auth-db (5200)
├── users
└── push_subscriptions  ← Связано с users через userId
```

**Плюсы:**
- Простая связь с пользователями
- Нет необходимости в синхронизации

**Минусы:**
- Нарушение границ сервисов (auth БД используется notifications сервисом)

#### Вариант B: Подписки в Notifications БД (рекомендуется)
```
auth-db (5200)
└── users

notifications-db (5201)
└── push_subscriptions  ← userId как внешний ключ (без FK)
```

**Плюсы:**
- Четкие границы сервисов
- Каждый сервис владеет своими данными
- Независимое масштабирование БД

**Минусы:**
- Нужна синхронизация userId (но это нормально для микросервисов)

### 4. **API Gateway Pattern**

В крупных компаниях часто используется API Gateway:

```
┌─────────────────┐
│  API Gateway    │ ← Единая точка входа
│  (Kong/Nginx)   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│ api-   │ │ api-         │
│ auth   │ │ notifications│
└────────┘ └──────────────┘
```

**Преимущества:**
- Единый URL для всех сервисов
- Централизованная аутентификация
- Rate limiting, logging, monitoring

## 📋 Рекомендации для Workix

### Текущее состояние → Целевое состояние

#### Шаг 1: Перенести Push Subscription API в `api-notifications`

```typescript
// apps/api-notifications/src/controllers/push-subscription.controller.ts
@Controller('subscriptions')
export class PushSubscriptionController {
  // Управление подписками
}
```

#### Шаг 2: Добавить HTTP сервер в `api-notifications`

```typescript
// apps/api-notifications/src/main.ts
const app = await NestFactory.create(AppModule); // Не createApplicationContext!
await app.listen(7201);
```

#### Шаг 3: Добавить Swagger в `api-notifications`

```typescript
SwaggerModule.setup('docs', app, document);
// Доступно на http://localhost:7201/docs
```

#### Шаг 4: Удалить из `api-auth`

```typescript
// Удалить PushSubscriptionController из api-auth
// api-auth должен заниматься только аутентификацией
```

### Итоговая архитектура

```
api-auth (7200)
├── /auth/*              ← Аутентификация
└── /users/*             ← Управление пользователями
    └── Swagger: /docs

api-notifications (7201)
├── HTTP API
│   ├── /subscriptions   ← Управление push подписками
│   └── /health         ← Health check
│   └── Swagger: /docs  ← Документация API
└── Worker
    ├── EmailProcessor  ← Обработка email
    └── PushProcessor   ← Обработка push
```

## ✅ Преимущества правильной архитектуры

1. **Разделение ответственности**
   - `api-auth` - только аутентификация
   - `api-notifications` - все уведомления (API + Worker)

2. **Масштабируемость**
   - API и Worker можно масштабировать отдельно
   - Независимое развертывание компонентов

3. **Простота интеграции**
   - Один сервис для всех операций с уведомлениями
   - Единая точка входа для подписок

4. **Соответствие best practices**
   - Как в Google, Amazon, Microsoft
   - Гибридный сервис (API + Worker)

## 🔗 Ссылки на документацию

- [Google FCM API](https://firebase.google.com/docs/cloud-messaging)
- [Amazon SNS API](https://docs.aws.amazon.com/sns/latest/api/)
- [Azure Notification Hubs](https://docs.microsoft.com/azure/notification-hubs/)
- [Twilio Notifications API](https://www.twilio.com/docs/notify)
