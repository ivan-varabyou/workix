# ⚡ Легковесное solution for Zero-Downtime Deployment

**Date:** 2025-11-16
**Goal:** Минимальное solution without избыточности, максимальная performance

---

## 🎯 Принципы

1. ✅ **Минимализм** - только необходимое
2. ✅ **Производительность** - without лишних проверок
3. ✅ **Просthatа** - легко понять и underдерживать
4. ✅ **Использовать Kubernetes** - если доступен (already exists in project!)

---

## ✅ Kubernetes already exists in project!

**Найдено:**
- ✅ `k8s/monolith-deployment.yml` - Kubernetes deployment
- ✅ Rolling Updates configured (`strategy.type: RollingUpdate`)
- ✅ Health Checks configured (`livenessProbe`, `readinessProbe`)
- ✅ Docker Compose for dev окрalreadyния

**Kubernetes already умеет:**
- ✅ Rolling Updates (плавное update without downtime)
- ✅ Health Checks (automaticallyе checks)
- ✅ Load Balancing (via Service)
- ✅ Auto-scaling (HorizontalPodAutoscaler)
- ✅ Graceful Shutdown (preStop hook)

---

## 🔍 Анализ: Kubernetes vs Наше solution

### Если usesся Kubernetes:

**Kubernetes already умеет:**
- ✅ Rolling Updates (плавное update)
- ✅ Health Checks (liveness/readiness probes)
- ✅ Service Discovery
- ✅ Load Balancing
- ✅ Auto-scaling

**Наше solution избыточно, если:**
- Используется Kubernetes
- Используется Docker Swarm
- Используется other оркестратор

**Что нужно в Gateway:**
- Только конфигурация URL serviceов
- Простая маршрутизация
- Без health checks (Kubernetes делает)
- Без circuit breaker (Kubernetes делает)

---

### Если НЕ usesся Kubernetes:

**Минимальное solution:**
1. ✅ Простое переключение версий (weight: 0% → 100%)
2. ✅ Базовые health checks (только before переключением)
3. ✅ Простой rollback (вернуть weight: 100% → 0%)
4. ❌ Без circuit breaker (избыточно)
5. ❌ Без сложных стратегий (только canary)

---

## ⚡ Упрощенная architecture (минимальная)

```
┌─────────────────────────────────────────┐
│         API GATEWAY                      │
│  ┌───────────────────────────────────┐ │
│  │  Service Routing (упрощенный)      │ │
│  │  - Weight-based selection          │ │
│  │  - Простое переключение            │ │
│  └───────────────────────────────────┘ │
└───────┬───────────┬─────────────────────┘
        │           │
    weight: 90%  weight: 10%
        │           │
        ▼           ▼
┌──────────┐  ┌──────────┐
│ Service  │  │ Service  │
│ v1.0     │  │ v1.1     │
│ (old)    │  │ (new)    │
└──────────┘  └──────────┘
```

**Без:**
- ❌ Health Check Service (избыточно, можно проверять вручную)
- ❌ Circuit Breaker (избыточно, можно добавить позже)
- ❌ Сложные стратегии (только canary)
- ❌ Automated Testing (можно делать вручную)

---

## 📋 Минимальный plan задач (3 задачи вместо 14)

### ✅ T-001: Weight-Based Routing (обновить существующий)

**Файлы for updates:**
- `apps/api-gateway/src/app/services/service-routing.service.ts`

**Changes:**
```typescript
// Добавить method выбора версии по весу
selectVersionByWeight(versions: ServiceVersion[]): ServiceVersion {
  const activeVersions = versions.filter(v => v.isActive && v.weight > 0);
  if (activeVersions.length === 0) {
    return versions.find(v => v.isActive) || versions[0];
  }

  const totalWeight = activeVersions.reduce((sum, v) => sum + v.weight, 0);
  const random = Math.random() * totalWeight;
  let current = 0;

  for (const version of activeVersions) {
    current += version.weight;
    if (random <= current) {
      return version;
    }
  }

  return activeVersions[0];
}

// Обновить getServiceUrl
getServiceUrl(serviceName: string): string {
  const config = this.serviceConfigs.get(serviceName);
  if (!config) {
    return this.configService.get<string>('MONOLITH_URL') || 'http://localhost:7000';
  }

  const selected = this.selectVersionByWeight(config.versions);
  return selected.url;
}
```

**Время:** 2-3 часа

---

### ✅ T-002: Database Schema (минимальная версия)

**Файлы for updates:**
- `apps/api-gateway/prisma/schema.prisma`

**Changes:**
```prisma
model GatewayServiceVersion {
  id            String   @id @default(uuid())
  serviceId     String
  version       String
  url           String
  weight        Int      @default(100) // 0-100, for плавного переключения
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  service       GatewayServiceConfig @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@unique([serviceId, version])
  @@map("gateway_service_version")
}
```

**Только добавить:**
- `weight: Int` в существующую таблицу

**Время:** 30 минут

---

### ✅ T-003: Deployment Controller (минимальная версия)

**Файлы for создания:**
- `apps/api-gateway/src/app/controllers/deployment.controller.ts`

**Эндпоинты (только 3):**
```typescript
// 1. Установить вес версии (0-100)
PUT /api/v1/admin/deployment/services/:serviceName/versions/:version/weight
Body: { weight: 10 }

// 2. Переключить на версию (установить weight: 100%, остальные: 0%)
POST /api/v1/admin/deployment/services/:serviceName/versions/:version/switch

// 3. Получить status версий
GET /api/v1/admin/deployment/services/:serviceName/versions
```

**Логика:**
```typescript
@Put('services/:serviceName/versions/:version/weight')
async setWeight(
  @Param('serviceName') serviceName: string,
  @Param('version') version: string,
  @Body() body: { weight: number }
) {
  // 1. Найти версию
  // 2. Обновить weight в БД
  // 3. Обновить остальные версии (whatбы сумма была 100%)
  // 4. Обновить in-memory cache
}
```

**Время:** 2-3 часа

---

## 🚀 Процесс Deployment (упрощенный)

### Шаг 1: Развернуть новую версию

```bash
# Развернуть new service
docker run -d -p 7201:7200 auth-service:v1.1
```

### Шаг 2: Зарегисthreeровать в Gateway

```typescript
// Через существующий API
POST /api/v1/admin/routing/services/auth/versions
{
  "version": "v1.1",
  "url": "http://localhost:7201",
  "weight": 0, // начинаем с 0%
  "active": true
}
```

### Шаг 3: Плавное переключение (вручную или scriptом)

```typescript
// Этап 1: 10% trafficа на новую версию
PUT /api/v1/admin/deployment/services/auth/versions/v1.1/weight
{ "weight": 10 }
// Автоматически: v1.0: 90%, v1.1: 10%

// Подождать 5 минут, проверить логи

// Этап 2: 50% trafficа
PUT /api/v1/admin/deployment/services/auth/versions/v1.1/weight
{ "weight": 50 }
// Автоматически: v1.0: 50%, v1.1: 50%

// Подождать 10 минут, проверить логи

// Этап 3: 100% trafficа
PUT /api/v1/admin/deployment/services/auth/versions/v1.1/weight
{ "weight": 100 }
// Автоматически: v1.0: 0%, v1.1: 100%

// Этап 4: Отключить старую версию
PUT /api/v1/admin/routing/services/auth/versions/v1.0
{ "active": false }
```

### Шаг 4: Rollback (если нужно)

```typescript
// Вернуть на старую версию
POST /api/v1/admin/deployment/services/auth/versions/v1.0/switch
// Автоматически: v1.0: 100%, v1.1: 0%
```

---

## 📊 Сравнение решений

| Компонент | Полное solution | Минимальное solution | Kubernetes |
|-----------|---------------|---------------------|------------|
| **Health Checks** | ✅ Автоматические | ❌ Ручные | ✅ Встроенные |
| **Circuit Breaker** | ✅ Есть | ❌ Нет | ✅ Встроенный |
| **Load Balancing** | ✅ Weight-based | ✅ Weight-based | ✅ Встроенный |
| **Deployment** | ✅ Автоматический | ⚠️ Ручной/script | ✅ Rolling Update |
| **Rollback** | ✅ Автоматический | ✅ Ручной (1 team) | ✅ Встроенный |
| **Сложность** | ⭐⭐⭐ Высокая | ⭐ Низкая | ⭐⭐ Средняя |
| **Время реализации** | 2-3 недели | 1 день | 0 (если exists) |

---

## 🎯 Рекомендация

### Если usesся Kubernetes:

**Использовать Kubernetes Rolling Updates:**
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

**Gateway только:**
- Хранит URL serviceов (из Kubernetes Service)
- Простая маршрутизация
- Без health checks (Kubernetes делает)
- Без weight-based (Kubernetes делает)

**Время:** 0 часов (already работает)

---

### Если НЕ usesся Kubernetes:

**Минимальное solution (3 задачи):**
1. ✅ Weight-Based Routing (обновить существующий)
2. ✅ Database Schema (добавить weight)
3. ✅ Deployment Controller (3 эндпоинта)

**Время:** 1 день

**Процесс:**
- Ручное переключение весов via API
- Или простой script for автоматизации
- Мониторинг via логи/metrics

---

## 📝 Минимальный код (T-003)

```typescript
// apps/api-gateway/src/app/controllers/deployment.controller.ts

@Controller('admin/deployment')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class DeploymentController {
  constructor(
    private routingService: ServiceRoutingService,
    private prisma: PrismaService,
  ) {}

  @Put('services/:serviceName/versions/:version/weight')
  @ApiOperation({ summary: 'Set version weight (0-100)' })
  async setWeight(
    @Param('serviceName') serviceName: string,
    @Param('version') version: string,
    @Body() body: { weight: number },
  ) {
    // 1. Найти версию
    const versionRecord = await this.prisma.gatewayServiceVersion.findFirst({
      where: {
        service: { serviceName },
        version,
      },
    });

    if (!versionRecord) {
      throw new NotFoundException(`Version ${version} not found`);
    }

    // 2. Обновить weight новой версии
    await this.prisma.gatewayServiceVersion.update({
      where: { id: versionRecord.id },
      data: { weight: body.weight },
    });

    // 3. Обновить остальные версии (whatбы сумма была 100%)
    const otherVersions = await this.prisma.gatewayServiceVersion.findMany({
      where: {
        service: { serviceName },
        id: { not: versionRecord.id },
        isActive: true,
      },
    });

    const totalOtherWeight = otherVersions.reduce((sum, v) => sum + v.weight, 0);
    const remainingWeight = 100 - body.weight;

    if (totalOtherWeight !== remainingWeight) {
      // Распределить оставшийся вес пропорционально
      for (const otherVersion of otherVersions) {
        const newWeight = Math.round(
          (otherVersion.weight / totalOtherWeight) * remainingWeight
        );
        await this.prisma.gatewayServiceVersion.update({
          where: { id: otherVersion.id },
          data: { weight: newWeight },
        });
      }
    }

    // 4. Обновить in-memory cache
    this.routingService.refreshCache();

    return { success: true, weight: body.weight };
  }

  @Post('services/:serviceName/versions/:version/switch')
  @ApiOperation({ summary: 'Switch to version (set weight: 100%, others: 0%)' })
  async switchVersion(
    @Param('serviceName') serviceName: string,
    @Param('version') version: string,
  ) {
    // 1. Установить новую версию на 100%
    await this.setWeight(serviceName, version, { weight: 100 });

    // 2. Установить остальные на 0%
    const otherVersions = await this.prisma.gatewayServiceVersion.findMany({
      where: {
        service: { serviceName },
        version: { not: version },
        isActive: true,
      },
    });

    for (const otherVersion of otherVersions) {
      await this.prisma.gatewayServiceVersion.update({
        where: { id: otherVersion.id },
        data: { weight: 0 },
      });
    }

    this.routingService.refreshCache();

    return { success: true, switchedTo: version };
  }

  @Get('services/:serviceName/versions')
  @ApiOperation({ summary: 'Get all versions with weights' })
  async getVersions(@Param('serviceName') serviceName: string) {
    const versions = await this.prisma.gatewayServiceVersion.findMany({
      where: {
        service: { serviceName },
      },
      select: {
        id: true,
        version: true,
        url: true,
        weight: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { versions };
  }
}
```

---

## 🎯 Итоговая рекомендация

### Вариант 1: Если usesся Kubernetes ✅

**Использовать Kubernetes Rolling Updates:**
- Gateway только хранит URL serviceов
- Kubernetes управляет deployment
- Время: 0 часов

### Вариант 2: Если НЕ usesся Kubernetes ✅

**Минимальное solution (3 задачи, 1 день):**
1. Обновить `ServiceRoutingService` for weight-based selection
2. Добавить `weight` в Prisma schema
3. Создать `DeploymentController` с 3 эндпоинthereи

**Процесс:**
- Ручное переключение via API
- Или простой bash/Python script for автоматизации

---

## 📊 Сравнение производительности

| Решение | Overhead | Latency | Memory | CPU |
|---------|----------|---------|--------|-----|
| **Полное (14 задач)** | ⚠️ Высокий | +5-10ms | +50MB | +5% |
| **Минимальное (3 задачи)** | ✅ Низкий | +0-1ms | +5MB | +0.5% |
| **Kubernetes** | ✅ Нет (в Gateway) | 0ms | 0MB | 0% |

---

## ✅ Финальный plan

### 🎯 Если usesе Kubernetes (РЕКОМЕНДУЕТСЯ)

**Время:** 0 часов (already работает!)

**Что делать:**
1. ✅ Использовать `kubectl set image` for updates
2. ✅ Использовать `kubectl rollout` for управления
3. ✅ Gateway просто uses Service URL

**Gateway изменения:**
- ❌ НЕ нужны (Kubernetes all делает)

---

### ⚠️ Если НЕ usesе Kubernetes

**Минимальное solution (3 задачи, 4.5 часа):**

#### Задача 1: Weight-Based Routing (2 часа)
- Обновить `ServiceRoutingService.selectVersionByWeight()`
- Обновить `ServiceRoutingService.getServiceUrl()`

#### Задача 2: Database Schema (30 минут)
- Добавить `weight: Int` в `GatewayServiceVersion`
- Миграция Prisma

#### Задача 3: Deployment Controller (2 часа)
- 3 эндпоинта: setWeight, switchVersion, getVersions
- Простая логика переключения весов

**Итого:** 4.5 часа работы

---

**Последнее update:** 2025-11-16
**Status:** ⚡ Минимальное solution ready
