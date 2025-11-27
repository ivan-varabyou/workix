# 🎯 Service-Specific Versioning - Реализация

**Date:** 2025-11-16
**Status:** ✅ Реализовано

---

## 📊 Итоговая structure

### Gateway (for clientов)

```
/api/v1/* - единая точка входа
```

### Auth API (внутренний)

```
/api-auth/v1/* - all эндпоинты Auth API
```

### Monolith API (внутренний)

```
/api-monolith/v1/* - all эндпоинты Monolith API
```

---

## 🔄 Маппинг Gateway

### Примеры маршрутизации:

```
Client:  /api/v1/auth/login
    ↓
Gateway: определяет service 'auth'
    ↓
Gateway: маппит path /api-auth/v1/auth/login
    ↓
Auth API: /api-auth/v1/auth/login ✅
```

```
Client:  /api/v1/pipelines
    ↓
Gateway: определяет service 'pipelines'
    ↓
Gateway: маппит path /api-monolith/v1/pipelines
    ↓
Monolith API: /api-monolith/v1/pipelines ✅
```

---

## 📋 Полный список маппингов

| Gateway Endpoint | Сервис | Внутренний path |
|-----------------|--------|----------------|
| `/api/v1/auth/*` | auth | `/api-auth/v1/auth/*` |
| `/api/v1/users/*` | auth | `/api-auth/v1/users/*` |
| `/api/v1/pipelines/*` | pipelines | `/api-monolith/v1/pipelines/*` |
| `/api/v1/executions/*` | executions | `/api-monolith/v1/executions/*` |
| `/api/v1/rbac/*` | rbac | `/api-monolith/v1/rbac/*` |
| `/api/v1/integrations/*` | integrations | `/api-monolith/v1/integrations/*` |
| `/api/v1/analytics/*` | analytics | `/api-monolith/v1/analytics/*` |
| `/api/v1/workers/*` | workers | `/api-monolith/v1/workers/*` |
| `/api/v1/ab-tests/*` | abTests | `/api-monolith/v1/ab-tests/*` |

---

## ✅ Преимущества

1. ✅ **Явное разделение serviceов**
   - Легко понять, howой service обрабатывает request
   - Удобно for monitoringа и логирования

2. ✅ **Меньше конфлиwhoв**
   - Каждый service имеет свой префикс
   - Нет пересечений путей

3. ✅ **Независимое версионирование**
   - Каждый service может иметь свою версию
   - Легко вводить breaking changes

4. ✅ **Удобная трассировка**
   - По префиксу сразу видно service
   - Упрощает отладку

---

## 🔧 Реализация

### 1. Auth API

**Файл:** `apps/api-auth/src/main.ts`

```typescript
const globalPrefix = 'api-auth/v1';
app.setGlobalPrefix(globalPrefix);
```

**Result:**
- `/api-auth/v1/auth/login`
- `/api-auth/v1/auth/register`
- `/api-auth/v1/users/*`

### 2. Monolith API

**Файл:** `apps/api-monolith/src/main.ts`

```typescript
app.setGlobalPrefix('api-monolith/v1');
```

**Result:**
- `/api-monolith/v1/pipelines`
- `/api-monolith/v1/rbac/roles`
- `/api-monolith/v1/integrations/*`

### 3. Gateway

**Файл:** `apps/api-gateway/src/app/services/proxy.service.ts`

```typescript
private buildServicePath(path: string, service: string): string {
  const versionMatch = path.match(/^\/api\/(v\d+)/);
  const apiVersion = versionMatch ? versionMatch[1] : 'v1';

  const cleanPath = path.replace(/^\/api\/v\d+/, '').replace(/^\/api/, '');

  const servicePrefixMap: Record<string, string> = {
    auth: `/api-auth/${apiVersion}`,
    users: `/api-auth/${apiVersion}`,
    pipelines: `/api-monolith/${apiVersion}`,
    // ... остальные serviceы
  };

  const servicePrefix = servicePrefixMap[service] || `/api/${apiVersion}`;
  return `${servicePrefix}${cleanPath}`;
}
```

---

## 🚀 Тестирование

### 1. Запустить Auth API

```bash
nx serve api-auth
```

**Проверить:**
```bash
curl http://localhost:7200/api-auth/v1/health
curl http://localhost:7200/docs
```

### 2. Запустить Monolith API

```bash
nx serve api-monolith
```

**Проверить:**
```bash
curl http://localhost:7000/api-monolith/v1/health
curl http://localhost:7000/api-monolith/docs
```

### 3. Запустить Gateway

```bash
nx serve api-gateway
```

**Проверить маршрутизацию:**
```bash
# Через Gateway → Auth API
curl http://localhost:4200/api/v1/auth/health

# Через Gateway → Monolith API
curl http://localhost:4200/api/v1/pipelines
```

---

## 📝 Заметки

- ✅ Все изменения совместимы с существующим кодом
- ✅ Линтер ошибок не обнарalreadyно
- ✅ Поддержка будущих версий (v2, v3) already заложена
- ✅ Kubernetes Service discovery работает automatically

---

**Последнее update:** 2025-11-16
**Status:** ✅ Реализовано и ready к тестированию
