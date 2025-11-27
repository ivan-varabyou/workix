# 🚀 Kubernetes + ArgoCD: Версионирование и Рефаwhoринг

**Date:** 2025-11-16
**Status:** ✅ Итоговая scheme for refactoringа

---

## 🎯 Ключевые вопросы

### 1. Нужно ли версионирование API (v1, v2) с Kubernetes + ArgoCD?

**Ответ: ДА, но по-другому!**

**Версионирование кода (Git tags) ≠ Версионирование API (v1, v2)**

| Тип версионирования | Управление | Наvalue |
|---------------------|-----------|------------|
| **API версии (v1, v2)** | Gateway + Сервисы | Обратная совместимость API |
| **Код версии (Git tags)** | ArgoCD | Deployment via Kubernetes |
| **Kubernetes Service** | Kubernetes | Service discovery (without версий в URL) |

---

## 📊 Архитектура версионирования

### Уровень 1: API Версионирование (for clientов)

```
Client → Gateway → Service
/api/v1/auth/login → Gateway → Auth API /api/v1/auth/login
/api/v2/auth/login → Gateway → Auth API /api/v2/auth/login (будущее)
```

**Наvalue:** Обратная совместимость for clientов

### Уровень 2: Код Версионирование (for deployment)

```
Git Tag: v1.0.0 → ArgoCD → Kubernetes Deployment → Service URL
```

**Наvalue:** Управление версиями кода via ArgoCD

### Уровень 3: Kubernetes Service (for маршрутизации)

```
Gateway → Kubernetes Service (monolith-service) → Pods (v1.0.0, v1.1.0)
```

**Наvalue:** Service discovery и load balancing

---

## 🔧 Текущая problem

### Проблема маршрутизации:

```
Gateway получает: /api/v1/auth/login
Gateway убирает: /api/v1 → /auth/login
Gateway отправляет: http://auth-service:7200/auth/login
Auth API ожидает: /api/auth/login (globalPrefix = 'api')
❌ ОШИБКА: 404 Not Found
```

### Проблема версионирования:

- ✅ Gateway: `/api/v1/*` (правильно)
- ❌ Auth API: `/api/*` (without версии)
- ✅ Monolith API: `/api/v1/*` (правильно)
- ❌ Несогласованность!

---

## ✅ Решение: Единое версионирование

### Схема refactoringа:

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT                                    │
│              /api/v1/auth/login                              │
│              /api/v2/auth/login (будущее)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              API GATEWAY (Port 4200)                         │
│  Global Prefix: /api/v1 (по умолчанию)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ProxyService                                         │  │
│  │  - Определяет service по пути                         │  │
│  │  - Сохраняет версию API (v1, v2)                     │  │
│  │  - Добавляет правильный префикс for serviceа          │  │
│  └──────────────────────────────────────────────────────┘  │
└───────┬───────────┬───────────┬───────────┬───────────────┘
        │           │           │           │
        │ v1       │ v1       │ v1       │ v1
        ▼           ▼           ▼           ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Auth API │  │ Monolith │  │ Pipeline │  │   RBAC   │
│ /api/v1  │  │ /api/v1  │  │ /api/v1  │  │ /api/v1  │
│ (7200)   │  │ (7000)   │  │ (7202)   │  │ (7203)   │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

---

## 📋 План refactoringа

### Phase 1: Унификация версионирования (КРИТИЧНО)

#### 1.1. Обновить Auth API

**Файл:** `apps/api-auth/src/main.ts`

```typescript
// БЫЛО:
app.setGlobalPrefix('api');

// СТАНЕТ:
app.setGlobalPrefix('api/v1');
```

**Result:**
- ✅ Все эндпоинты: `/api/v1/auth/*`
- ✅ Согласованность с Gateway и Monolith

#### 1.2. Обновить Gateway маршрутизацию

**Файл:** `apps/api-gateway/src/app/services/proxy.service.ts`

```typescript
// БЫЛО:
const cleanPath = path.replace(/^\/api\/v\d+/, '').replace(/^\/api/, '');

// СТАНЕТ:
private buildServicePath(path: string, service: string): string {
  // Извлекаем версию API (v1, v2)
  const versionMatch = path.match(/^\/api\/(v\d+)/);
  const apiVersion = versionMatch ? versionMatch[1] : 'v1';

  // Убираем /api/v1 или /api/v2
  const cleanPath = path.replace(/^\/api\/v\d+/, '');

  // Определяем нужный префикс for serviceа
  const servicePrefix = this.getServicePrefix(service, apiVersion);

  return `${servicePrefix}${cleanPath}`;
}

private getServicePrefix(service: string, apiVersion: string): string {
  // Все serviceы используют /api/v1 (или /api/v2 в будущем)
  return `/api/${apiVersion}`;
}
```

**Result:**
- ✅ Gateway сохраняет версию API
- ✅ Gateway добавляет правильный префикс for каждого serviceа
- ✅ Поддержка будущих версий (v2, v3)

#### 1.3. Обновить ServiceRoutingService

**Файл:** `apps/api-gateway/src/app/services/service-routing.service.ts`

```typescript
// Добавить underдержку версий API
interface ServiceConfig {
  service: string;
  defaultUrl: string;
  versions: ServiceVersion[];
  apiVersions: string[]; // ['v1', 'v2']
  currentApiVersion: string; // 'v1'
  // ...
}

// Обновить getServiceUrl
getServiceUrl(serviceName: string, apiVersion?: string): string {
  const config = this.serviceConfigs.get(serviceName);
  const version = apiVersion || config?.currentApiVersion || 'v1';

  // Для Kubernetes: use Service URL
  if (process.env.KUBERNETES_SERVICE_HOST) {
    return this.getKubernetesServiceUrl(serviceName);
  }

  // Для Docker Compose: use env переменные
  return this.getDockerServiceUrl(serviceName, version);
}

private getKubernetesServiceUrl(serviceName: string): string {
  // Kubernetes Service URL (without версии в URL)
  const serviceMap: Record<string, string> = {
    'auth': 'http://auth-service.workix.svc.cluster.local',
    'monolith': 'http://monolith-service.workix.svc.cluster.local',
    // ...
  };

  return serviceMap[serviceName] || `http://${serviceName}-service.workix.svc.cluster.local`;
}
```

---

### Phase 2: Новые эндпоинты for ArgoCD/Kubernetes

#### 2.1. Deployment Management Controller

**Файл:** `apps/api-gateway/src/app/controllers/deployment.controller.ts`

```typescript
@Controller('admin/deployment')
@UseGuards(JwtGuard, AdminGuard)
@ApiBearerAuth()
@ApiTags('deployment')
export class DeploymentController {
  constructor(
    private deploymentService: DeploymentService,
    private kubernetesService: KubernetesService,
  ) {}

  /**
   * Получить status deployment via Kubernetes API
   */
  @Get('services/:serviceName/status')
  @ApiOperation({ summary: 'Get deployment status from Kubernetes' })
  async getDeploymentStatus(@Param('serviceName') serviceName: string) {
    // Через Kubernetes API или ArgoCD API
    return this.kubernetesService.getDeploymentStatus(serviceName);
  }

  /**
   * Получить историю версий (из ArgoCD)
   */
  @Get('services/:serviceName/history')
  @ApiOperation({ summary: 'Get deployment history from ArgoCD' })
  async getDeploymentHistory(@Param('serviceName') serviceName: string) {
    return this.kubernetesService.getDeploymentHistory(serviceName);
  }

  /**
   * Откатить deployment (via ArgoCD)
   */
  @Post('services/:serviceName/rollback')
  @ApiOperation({ summary: 'Rollback deployment via ArgoCD' })
  async rollbackDeployment(
    @Param('serviceName') serviceName: string,
    @Body() body: { revision?: number },
  ) {
    return this.kubernetesService.rollbackDeployment(serviceName, body.revision);
  }

  /**
   * Получить информацию о версиях API (v1, v2)
   */
  @Get('api-versions')
  @ApiOperation({ summary: 'Get supported API versions' })
  async getApiVersions() {
    return {
      current: 'v1',
      supported: ['v1'],
      deprecated: [],
      endpoints: {
        v1: '/api/v1/*',
        // v2: '/api/v2/*' (будущее)
      },
    };
  }
}
```

#### 2.2. Kubernetes Service Integration

**Файл:** `apps/api-gateway/src/app/services/kubernetes.service.ts`

```typescript
@Injectable()
export class KubernetesService {
  private k8sApi: K8sApi;

  constructor(private configService: ConfigService) {
    // Инициализация Kubernetes API client
    if (process.env.KUBERNETES_SERVICE_HOST) {
      this.k8sApi = new K8sApi({
        // Использовать service account или kubeconfig
      });
    }
  }

  async getDeploymentStatus(serviceName: string): Promise<DeploymentStatus> {
    if (!this.k8sApi) {
      throw new BadRequestException('Kubernetes API not available');
    }

    const deployment = await this.k8sApi.appsV1.readNamespacedDeployment(
      `${serviceName}-deployment`,
      'workix',
    );

    return {
      name: deployment.body.metadata.name,
      replicas: deployment.body.spec.replicas,
      readyReplicas: deployment.body.status.readyReplicas,
      image: deployment.body.spec.template.spec.containers[0].image,
      status: this.getDeploymentStatus(deployment.body.status),
    };
  }

  async rollbackDeployment(serviceName: string, revision?: number): Promise<void> {
    // Использовать kubectl или Kubernetes API
    // Или ArgoCD API for rollback
  }
}
```

---

### Phase 3: ArgoCD Integration (опционально)

#### 3.1. ArgoCD Application Controller

**Файл:** `apps/api-gateway/src/app/controllers/argocd.controller.ts`

```typescript
@Controller('admin/argocd')
@UseGuards(JwtGuard, AdminGuard)
@ApiBearerAuth()
@ApiTags('argocd')
export class ArgoCDController {
  constructor(private argocdService: ArgoCDService) {}

  /**
   * Синхронизировать application via ArgoCD
   */
  @Post('applications/:appName/sync')
  @ApiOperation({ summary: 'Sync ArgoCD application' })
  async syncApplication(@Param('appName') appName: string) {
    return this.argocdService.syncApplication(appName);
  }

  /**
   * Получить status ArgoCD whenложения
   */
  @Get('applications/:appName/status')
  @ApiOperation({ summary: 'Get ArgoCD application status' })
  async getApplicationStatus(@Param('appName') appName: string) {
    return this.argocdService.getApplicationStatus(appName);
  }
}
```

---

## 🎯 Итоговая scheme эндпоинтов

### Gateway Endpoints (for clientов)

```
/api/v1/auth/*          → Auth API /api/v1/auth/*
/api/v1/users/*         → Auth API /api/v1/users/* (или Monolith)
/api/v1/pipelines/*     → Monolith API /api/v1/pipelines/*
/api/v1/rbac/*         → Monolith API /api/v1/rbac/*
/api/v1/integrations/* → Monolith API /api/v1/integrations/*
```

### Admin Endpoints (for управления)

```
GET  /api/v1/admin/deployment/services/:serviceName/status
GET  /api/v1/admin/deployment/services/:serviceName/history
POST /api/v1/admin/deployment/services/:serviceName/rollback
GET  /api/v1/admin/deployment/api-versions

# ArgoCD (опционально)
POST /api/v1/admin/argocd/applications/:appName/sync
GET  /api/v1/admin/argocd/applications/:appName/status
```

---

## 📊 Сравнение: С версионированием vs Без версионирования

| Аспект | С версионированием API | Без версионирования API |
|--------|----------------------|------------------------|
| **Обратная совместимость** | ✅ Легко underдерживать старые версии | ❌ Сложно |
| **Breaking changes** | ✅ Можно вводить постепенно | ❌ Требует миграции allх clientов |
| **Kubernetes** | ✅ Не влияет (Service URL without версий) | ✅ Не влияет |
| **ArgoCD** | ✅ Не влияет (управляет кодом) | ✅ Не влияет |
| **Сложность** | ⚠️ Средняя (нужно underдерживать v1, v2) | ✅ Низкая |
| **Рекомендация** | ✅ **Использовать** (for production) | ⚠️ Только for dev |

---

## ✅ Рекомендация

### Для вашего projectа:

1. ✅ **Использовать версионирование API (v1, v2)**
   - Обратная совместимость
   - Возможность вводить breaking changes постепенно
   - Не влияет на Kubernetes/ArgoCD

2. ✅ **Kubernetes Service URL without версий**
   - `http://auth-service.workix.svc.cluster.local`
   - Версия API в пути: `/api/v1/auth/login`
   - Версия кода via ArgoCD: Git tags

3. ✅ **ArgoCD управляет deployment**
   - Git tags: `v1.0.0`, `v1.1.0`
   - ArgoCD синхронизирует с Kubernetes
   - Gateway не управляет deployment

4. ✅ **Gateway только маршрутизация**
   - Определяет service по пути
   - Сохраняет версию API (v1, v2)
   - Добавляет правильный префикс

---

## 📝 План задач

### Критичные (Phase 1):

1. ✅ Обновить Auth API: `app.setGlobalPrefix('api/v1')`
2. ✅ Обновить Gateway ProxyService: правильная маршрутизация с версиями
3. ✅ Обновить ServiceRoutingService: underдержка версий API
4. ✅ Исправить маршрутизацию: Gateway добавляет `/api/v1` for allх serviceов

### Важные (Phase 2):

5. ✅ Создать DeploymentController: status, история, rollback
6. ✅ Создать KubernetesService: integration с Kubernetes API
7. ✅ Добавить эндпоинты for управления deployment

### Опциональные (Phase 3):

8. ⚠️ Создать ArgoCDController: синхронизация via ArgoCD
9. ⚠️ Создать ArgoCDService: integration с ArgoCD API

---

**Последнее update:** 2025-11-16
**Status:** ✅ Итоговая scheme готова
