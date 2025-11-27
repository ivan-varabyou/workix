# 📋 План недостающих компонентов в Workix Platform

## 🔍 Анализ текущего состояния

### ✅ Что есть:
1. **HTTP-проксирование через API Gateway** - работает, но не использует официальный NestJS микросервисный транспорт
2. **Redis/Bull** - используется для очередей задач (не для межсервисного общения)
3. **Базовая структура микросервисов** - все сервисы запускаются как отдельные HTTP-приложения

### ❌ Что отсутствует:
1. **Официальный NestJS микросервисный транспорт** (`@nestjs/microservices`)
2. **Kafka** для межсервисного общения
3. **Полная функциональность в api-admin** - контроллеры и методы закомментированы

---

## 🎯 План 1: Что не хватает в api-admin сервисе

### 1.1. Контроллеры (закомментированы в app.module.ts)
- [ ] `AdminAuthController` - аутентификация и регистрация админов
- [ ] `ServiceRoutingController` - управление маршрутизацией сервисов
- [ ] `EndpointWhitelistController` - управление whitelist эндпоинтов

### 1.2. Сервисы (закомментированы в app.module.ts)
- [ ] `ServiceRoutingService` - маршрутизация между микросервисами
- [ ] `EndpointWhitelistService` - управление whitelist
- [ ] `Admin2FAService` - двухфакторная аутентификация
- [ ] `AdminAuth2FAService` - интеграция 2FA с аутентификацией
- [ ] `AdminPasswordResetService` - сброс пароля
- [ ] `AdminNotificationService` - уведомления для админов
- [ ] `PubSubPublisherService` - публикация событий
- [ ] `PubSubSubscriberService` - подписка на события
- [ ] `EndpointAccessGuard` - guard для проверки доступа к эндпоинтам

### 1.3. Методы в AdminAuthService (не реализованы)
- [ ] `register(adminRegisterDto: AdminRegisterDto)` - регистрация нового админа
- [ ] `login(adminLoginDto: AdminLoginDto, ipAddress?: string, userAgent?: string)` - вход админа
- [ ] `refreshToken(refreshToken: string)` - обновление access token
- [ ] `changePassword(adminId: string, oldPassword: string, newPassword: string)` - смена пароля
- [ ] `getSessions(adminId: string)` - получение списка активных сессий
- [ ] `revokeSession(sessionId: string, adminId: string)` - отзыв сессии
- [ ] `revokeAllSessions(adminId: string)` - отзыв всех сессий

### 1.4. Модули (закомментированы)
- [ ] `ThrottlerModule` - rate limiting
- [ ] `JwtModule` - уже есть в WorkixAdminModule, но может потребоваться дополнительная настройка

### 1.5. Guards
- [ ] `AdminJwtGuard` - ✅ уже добавлен
- [ ] `AdminRoleGuard` - ✅ уже добавлен
- [ ] `EndpointAccessGuard` - нужно добавить

---

## 🎯 План 2: NestJS микросервисы (официальный подход)

### 2.1. Установка зависимостей
```bash
npm install @nestjs/microservices
```

### 2.2. Транспорты для межсервисного общения

#### Вариант A: TCP (простой, для внутреннего общения)
```typescript
// В main.ts микросервиса
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.TCP,
  options: {
    host: 'localhost',
    port: 3001,
  },
});
```

#### Вариант B: Redis (рекомендуется, уже используется в проекте)
```typescript
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.REDIS,
  options: {
    host: 'localhost',
    port: 5900,
  },
});
```

#### Вариант C: Kafka (для production, масштабируемость)
```typescript
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'workix-service',
      brokers: ['localhost:9092'],
    },
    consumer: {
      groupId: 'workix-consumer',
    },
  },
});
```

### 2.3. Изменения в API Gateway

#### Текущий подход (HTTP-проксирование):
```typescript
// apps/api-gateway/src/app/services/proxy.service.ts
// Использует HttpService для проксирования запросов
```

#### Новый подход (NestJS микросервисы):
```typescript
// apps/api-gateway/src/app/services/microservice-client.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class MicroserviceClientService {
  private authClient: ClientProxy;
  private adminClient: ClientProxy;

  constructor() {
    this.authClient = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: { host: 'localhost', port: 5900 },
    });

    this.adminClient = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: { host: 'localhost', port: 5900 },
    });
  }

  async sendToAuth(pattern: string, data: any) {
    return this.authClient.send(pattern, data).toPromise();
  }
}
```

### 2.4. Изменения в микросервисах

#### Добавить MessagePattern handlers:
```typescript
// apps/api-admin/src/app/controllers/admin-auth.controller.ts
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AdminAuthController {
  @MessagePattern('admin.auth.login')
  async login(@Payload() data: AdminLoginDto) {
    return this.adminAuthService.login(data);
  }

  @MessagePattern('admin.auth.register')
  async register(@Payload() data: AdminRegisterDto) {
    return this.adminAuthService.register(data);
  }
}
```

### 2.5. Гибридный подход (HTTP + микросервисы)
- HTTP для внешних запросов (через API Gateway)
- Микросервисы для внутреннего общения между сервисами

---

## 🎯 План 3: Kafka интеграция

### 3.1. Установка зависимостей
```bash
npm install kafkajs
# или
npm install @nestjs/microservices  # уже включает Kafka транспорт
```

### 3.2. Настройка Kafka в docker-compose.yml
```yaml
kafka:
  image: confluentinc/cp-kafka:latest
  ports:
    - "9092:9092"
  environment:
    KAFKA_BROKER_ID: 1
    KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
    KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
    KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

zookeeper:
  image: confluentinc/cp-zookeeper:latest
  ports:
    - "2181:2181"
  environment:
    ZOOKEEPER_CLIENT_PORT: 2181
```

### 3.3. Конфигурация Kafka транспорта
```typescript
// libs/infrastructure/message-broker/src/lib/kafka.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'workix-service',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'workix-consumer-group',
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class KafkaModule {}
```

### 3.4. Использование EventPattern для событий
```typescript
// apps/api-auth/src/app/controllers/user-events.controller.ts
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class UserEventsController {
  @EventPattern('user.created')
  async handleUserCreated(@Payload() data: { userId: string; email: string }) {
    // Отправить welcome email
    await this.notificationService.sendWelcomeEmail(data.email);
  }

  @EventPattern('user.deleted')
  async handleUserDeleted(@Payload() data: { userId: string }) {
    // Очистить связанные данные
    await this.cleanupService.cleanupUserData(data.userId);
  }
}
```

### 3.5. Публикация событий
```typescript
// libs/shared/backend/core/src/events/kafka-publisher.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaPublisherService {
  constructor(
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,
  ) {}

  async publishUserCreated(userId: string, email: string) {
    this.kafkaClient.emit('user.created', { userId, email });
  }
}
```

---

## 📊 Сравнение подходов

### Текущий подход (HTTP-проксирование):
✅ **Плюсы:**
- Простота реализации
- Легко отлаживать (стандартные HTTP запросы)
- Не требует дополнительной инфраструктуры
- Работает через API Gateway

❌ **Минусы:**
- Нет официальной поддержки NestJS микросервисов
- Синхронное общение (блокирующее)
- Нет встроенной поддержки событий
- Сложнее масштабировать

### NestJS микросервисы (TCP/Redis):
✅ **Плюсы:**
- Официальная поддержка NestJS
- Асинхронное общение
- Встроенная поддержка событий (EventPattern)
- Легко масштабировать

❌ **Минусы:**
- Требует настройки транспорта
- Сложнее отлаживать
- Нужна дополнительная инфраструктура (Redis/Kafka)

### Kafka:
✅ **Плюсы:**
- Высокая производительность
- Отличная масштабируемость
- Гарантия доставки сообщений
- Поддержка событийной архитектуры
- Production-ready

❌ **Минусы:**
- Сложная настройка (требует Zookeeper)
- Больше ресурсов
- Сложнее отлаживать

---

## 🚀 Рекомендации

### Для текущего проекта:
1. **Краткосрочно**: Завершить реализацию `api-admin` сервиса (добавить контроллеры и методы)
2. **Среднесрочно**: Добавить NestJS микросервисы с Redis транспортом (уже используется в проекте)
3. **Долгосрочно**: Мигрировать на Kafka для production

### Приоритеты:
1. **Высокий**: Завершить `api-admin` сервис
2. **Средний**: Добавить Redis транспорт для межсервисного общения
3. **Низкий**: Kafka для production (когда потребуется масштабирование)

---

## 📝 Следующие шаги

1. ✅ Составить план (этот документ)
2. ⏳ Реализовать методы в `AdminAuthService`
3. ⏳ Включить контроллеры в `app.module.ts`
4. ⏳ Включить сервисы в `app.module.ts`
5. ⏳ Протестировать `api-admin` сервис
6. ⏳ Добавить NestJS микросервисы с Redis транспортом
7. ⏳ Добавить Kafka для production
