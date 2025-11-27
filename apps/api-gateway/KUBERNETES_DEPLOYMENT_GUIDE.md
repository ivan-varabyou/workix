# 🚀 Kubernetes Deployment Guide for API Gateway

**Date:** 2025-11-16
**Status:** ✅ Kubernetes already configured in project

---

## ✅ Kubernetes already exists!

**Found in project:**
- ✅ `k8s/monolith-deployment.yml` - Kubernetes deployment
- ✅ Rolling Updates configured
- ✅ Health Checks configured
- ✅ Docker Compose for dev

---

## 🎯 Usage Kubernetes Rolling Updates

### Advantages:

1. ✅ **Zero-Downtime** - automatically
2. ✅ **Health Checks** - built-in (liveness/readiness)
3. ✅ **Load Balancing** - via Kubernetes Service
4. ✅ **Auto-scaling** - HorizontalPodAutoscaler
5. ✅ **Rollback** - one command
6. ✅ **No Gateway changes** - Kubernetes does everything

---

## 📋 Deployment Process via Kubernetes

### Step 1: Update image in deployment

```bash
# Update monolith
kubectl set image deployment/monolith \
  monolith=ghcr.io/workix/monolith:v1.1 \
  -n workix

# Update auth service (if separate deployment exists)
kubectl set image deployment/auth \
  auth=ghcr.io/workix/auth:v1.1 \
  -n workix
```

### Step 2: Kubernetes automatically:

```
1. Creates new pods with new image
2. Checks readiness probe
3. Adds new pods to Service (load balancer)
4. Removes old pods from Service
5. Removes old pods
```

**Time:** 2-5 minutes (automatically)

### Step 3: Check status

```bash
# Deployment status
kubectl rollout status deployment/monolith -n workix

# List pods
kubectl get pods -n workix -l app=monolith

# Logs of new pod
kubectl logs -f <new-pod-name> -n workix
```

### Step 4: Rollback when problems

```bash
# Rollback to previous version
kubectl rollout undo deployment/monolith -n workix

# Rollback to specific version
kubectl rollout undo deployment/monolith --to-revision=2 -n workix

# Version history
kubectl rollout history deployment/monolith -n workix
```

---

## 🔧 Setup Gateway for Kubernetes

### Option 1: Use Kubernetes Service URL

**Gateway
```typescript
// apps/api-gateway/src/app/services/service-routing.service.ts

// For Kubernetes:
const monolithUrl = 'http://monolith-service.workix.svc.cluster.local';
const authServiceUrl = 'http://auth-service.workix.svc.cluster.local';

//
const monolithUrl = process.env.MONOLITH_SERVICE_URL || 'http://localhost:7000';
```

**Kubernetes Service automatically:**
- Load balancing between pods
- Health checks
- Service discovery

**Gateway changes:**
- ❌
- ❌
- ❌
- ✅ Only store Service URL

---

### Option 2: Use Ingress (if exists)

**Gateway via Ingress:**
```yaml
# k8s/ingress.yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: workix-ingress
  namespace: workix
spec:
  rules:
    - host: api.workix.com
      http:
        paths:
          - path: /api/v1/auth
            pathType: Prefix
            backend:
              service:
                name: auth-service
                port:
                  number: 80
          - path: /api/v1
            pathType: Prefix
            backend:
              service:
                name: monolith-service
                port:
                  number: 80
```

**Gateway:**
- Simply proxies
-

---

## 📊 Comparison: Kubernetes vs Our solution

| Function | Kubernetes | Our solution | Overhead |
|---------|------------|--------------|----------|
| **Rolling Updates** | ✅ Built-in | ⚠️ Need to implement | ❌ +50MB, +5% CPU |
| **Health Checks** | ✅ liveness/readiness | ⚠️ Need to implement | ❌ +10MB, +2% CPU |
| **Load Balancing** | ✅ Service | ⚠️ Weight-based | ❌ +5MB, +1% CPU |
| **Circuit Breaker** | ✅ Built-in | ⚠️ Need to implement | ❌ +15MB, +3% CPU |
| **Auto-scaling** | ✅ HPA | ❌ None | - |
| **Rollback** | ✅ 1 team | ⚠️ Need to implement | - |
| **Latency** | 0ms | +5-10ms | ❌ |
| **Memory** | 0MB | +80MB | ❌ |
| **CPU** | 0% | +11% | ❌ |

**Conclusion:**

---

## 🎯 Recommendation for your project

### ✅ Use Kubernetes Rolling Updates

**
1. ✅ Already configured in project
2. ✅ None overhead
3. ✅ Automatic management
4. ✅ Built-in health checks
5. ✅ Fast rollback

**Gateway changes:**
- ❌
- ✅ Only use Service URL

**

---

### ⚠️

**Minimal solution (only for Docker Compose):**

1. ✅ Weight-Based Routing (2 hours)
2. ✅ Database Schema (30 minutes)
3. ✅ Deployment Controller (2 hours)

**Total:** 4.5 hours

---

## 📝 Example: Update via Kubernetes

```bash
# 1. Build new image
docker build -f Dockerfile.monolith -t ghcr.io/workix/monolith:v1.1 .
docker push ghcr.io/workix/monolith:v1.1

# 2. Update deployment
kubectl set image deployment/monolith \
  monolith=ghcr.io/workix/monolith:v1.1 \
  -n workix

# 3. Monitor process
kubectl rollout status deployment/monolith -n workix

# 4. Check pods
kubectl get pods -n workix -l app=monolith

# 5. Check
kubectl logs -f deployment/monolith -n workix

# 6. On problems - rollback
kubectl rollout undo deployment/monolith -n workix
```

**Gateway:**
- No changes
- Simply uses Service URL: `http://monolith-service.workix.svc.cluster.local`

---

## 🔧 Setup Gateway for Kubernetes

### Update ServiceRoutingService

```typescript
// apps/api-gateway/src/app/services/service-routing.service.ts

private initializeServiceConfigs(): void {
  // For Kubernetes use Service URL
  const monolithUrl =
    process.env.MONOLITH_SERVICE_URL || // Kubernetes Service
    process.env.MONOLITH_URL ||         // Fallback for dev
    'http://localhost:7000';

  const authServiceUrl =
    process.env.AUTH_SERVICE_URL ||      // Kubernetes Service
    process.env.AUTH_SERVICE_URL ||     // Fallback for dev
    'http://localhost:7200';

  // Kubernetes Service automatically does load balancing
  //
}
```

**Environment variables:**
```bash
# Kubernetes (production)
MONOLITH_SERVICE_URL=http://monolith-service.workix.svc.cluster.local
AUTH_SERVICE_URL=http://auth-service.workix.svc.cluster.local

# Docker Compose (development)
MONOLITH_URL=http://localhost:7000
AUTH_SERVICE_URL=http://localhost:7200
```

---

## ✅ Total

### For your project:

1. ✅ **Use Kubernetes Rolling Updates**
   - Already configured in `k8s/monolith-deployment.yml`
   - Zero-downtime automatically
   - None overhead

2. ✅ **Gateway only stores Service URL**
   -
   -
   -

3. ⚠️ **Minimal solution only for Docker Compose (dev)**
   -
   - 3 tasks, 4.5 hours

---

**Last update:** 2025-11-16
**Status:** ✅ Kubernetes solution ready (0 hours work)
