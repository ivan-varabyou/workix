# 🔧 

**Date:** 2025-11-16
**

---

## 🎯 

1. 
2. 
3. 
4. 

---

## 📋 

### Phase 1: 

#### T-001: 

**

**Changes:**
```typescript
// 
app.setGlobalPrefix('api');

// 
app.setGlobalPrefix('api/v1');
```

**Result:**
- ✅ 
- ✅ 

**

---

#### T-002: 

**

**
```typescript
// 
const cleanPath = path.replace(/^\/api\/v\d+/, '').replace(/^\/api/, '');
```

**
```typescript
/**
 * Build service path with correct API version prefix
 */
private buildServicePath(path: string, service: string): string {
  // Extract API version (v1, v2, etc.)
  const versionMatch = path.match(/^\/api\/(v\d+)/);
  const apiVersion = versionMatch ? versionMatch[1] : 'v1';

  // Remove /api/v1 or /api/v2 prefix
  const cleanPath = path.replace(/^\/api\/v\d+/, '');

  // All services use /api/v1 (or /api/v2 in future)
  const servicePrefix = `/api/${apiVersion}`;

  return `${servicePrefix}${cleanPath}`;
}

// Update routeRequest method
async routeRequest(...) {
  const service = this.detectService(path);
  const baseUrl = this.routingService.getServiceUrl(service);

  // Build path with correct prefix
  const servicePath = this.buildServicePath(path, service);
  const url = `${baseUrl}${servicePath}`;

  // ... rest of the code
}
```

**Result:**
- ✅ Gateway 
- ✅ Gateway 
- ✅ 

**

---

#### T-003: 

**

**Changes:**
```typescript
interface ServiceConfig {
  service: string;
  defaultUrl: string;
  versions: ServiceVersion[];
  apiVersions: string[]; // ['v1', 'v2']
  currentApiVersion: string; // 'v1'
  // ...
}

/**
 * Get service URL - supports Kubernetes Service discovery
 */
getServiceUrl(serviceName: string, apiVersion?: string): string {
  const config = this.serviceConfigs.get(serviceName);
  const version = apiVersion || config?.currentApiVersion || 'v1';

  // For Kubernetes: use Service URL (without version in URL)
  if (process.env.KUBERNETES_SERVICE_HOST) {
    return this.getKubernetesServiceUrl(serviceName);
  }

  // For Docker Compose: use environment variables
  return this.getDockerServiceUrl(serviceName, version);
}

private getKubernetesServiceUrl(serviceName: string): string {
  const namespace = process.env.KUBERNETES_NAMESPACE || 'workix';

  const serviceMap: Record<string, string> = {
    'auth': `http://auth-service.${namespace}.svc.cluster.local`,
    'monolith': `http://monolith-service.${namespace}.svc.cluster.local`,
    'users': `http://auth-service.${namespace}.svc.cluster.local`, // Users in Auth API
    'pipelines': `http://monolith-service.${namespace}.svc.cluster.local`,
    'rbac': `http://monolith-service.${namespace}.svc.cluster.local`,
    'integrations': `http://monolith-service.${namespace}.svc.cluster.local`,
    'analytics': `http://monolith-service.${namespace}.svc.cluster.local`,
    'workers': `http://monolith-service.${namespace}.svc.cluster.local`,
    'abTests': `http://monolith-service.${namespace}.svc.cluster.local`,
  };

  return serviceMap[serviceName] || `http://${serviceName}-service.${namespace}.svc.cluster.local`;
}

private getDockerServiceUrl(serviceName: string, apiVersion: string): string {
  // Docker Compose environment variables
  const envMap: Record<string, string> = {
    'auth': process.env.AUTH_SERVICE_URL || 'http://localhost:7200',
    'monolith': process.env.MONOLITH_URL || 'http://localhost:7000',
    // ...
  };

  return envMap[serviceName] || 'http://localhost:7000';
}
```

**Result:**
- ✅ 
- ✅ 
- ✅ Fallback 

**

---

### Phase 2: 

#### T-004: 

**

**
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

  @Get('services/:serviceName/status')
  @ApiOperation({ summary: 'Get deployment status from Kubernetes' })
  async getDeploymentStatus(@Param('serviceName') serviceName: string) {
    return this.kubernetesService.getDeploymentStatus(serviceName);
  }

  @Get('services/:serviceName/history')
  @ApiOperation({ summary: 'Get deployment history' })
  async getDeploymentHistory(@Param('serviceName') serviceName: string) {
    return this.kubernetesService.getDeploymentHistory(serviceName);
  }

  @Post('services/:serviceName/rollback')
  @ApiOperation({ summary: 'Rollback deployment' })
  async rollbackDeployment(
    @Param('serviceName') serviceName: string,
    @Body() body: { revision?: number },
  ) {
    return this.kubernetesService.rollbackDeployment(serviceName, body.revision);
  }

  @Get('api-versions')
  @ApiOperation({ summary: 'Get supported API versions' })
  async getApiVersions() {
    return {
      current: 'v1',
      supported: ['v1'],
      deprecated: [],
      endpoints: {
        v1: '/api/v1/*',
      },
    };
  }
}
```

**

---

#### T-005: 

**

**
- 
- 
- Rollback deployment
- 

**

---

#### T-006: 

**

**Changes:**
```typescript
import { DeploymentController } from './controllers/deployment.controller';
import { KubernetesService } from './services/kubernetes.service';

@Module({
  // ...
  controllers: [
    // ...
    DeploymentController,
  ],
  providers: [
    // ...
    KubernetesService,
  ],
})
```

**

---

### Phase 3: 

#### T-007: 

**

**
- 
- Kubernetes Service URL
- Docker Compose fallback

**

---

## 📊 

### Client Endpoints (via Gateway)

```
GET  /api/v1/auth/me
POST /api/v1/auth/login
POST /api/v1/auth/register
GET  /api/v1/users
GET  /api/v1/pipelines
POST /api/v1/pipelines
GET  /api/v1/rbac/roles
```

### Admin Endpoints (

```
GET  /api/v1/admin/deployment/services/:serviceName/status
GET  /api/v1/admin/deployment/services/:serviceName/history
POST /api/v1/admin/deployment/services/:serviceName/rollback
GET  /api/v1/admin/deployment/api-versions
```

---

## ✅ 

- [ ] T-001: 
- [ ] T-002: 
- [ ] T-003: 
- [ ] T-004: 
- [ ] T-005: 
- [ ] T-006: 
- [ ] T-007: 

---

## ⏱️ 

- Phase 1: 2 
- Phase 2: 5 
- Phase 3: 2 
- **

---

**
**Status:** ✅ 
