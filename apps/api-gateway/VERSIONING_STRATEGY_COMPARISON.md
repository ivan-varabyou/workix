# 🔄 Сравнение стратегий версионирования

**Date:** 2025-11-16

---

## 📊 Вариант 1: Текущий (единый префикс)

```
Gateway:     /api/v1/*
Auth API:    /api/v1/auth/*
Monolith:    /api/v1/pipelines/*
```

**Плюсы:**
- ✅ Стандартный approach (REST API best practices)
- ✅ Единообразие for clientов
- ✅ Простая маршрутизация в Gateway

**Минусы:**
- ⚠️ Все serviceы используют one префикс
- ⚠️ Может быть сложнее определить, howой service обрабатывает request

---

## 📊 Вариант 2: Предложенный (префикс по serviceу)

```
Gateway:     /api/v1/*
Auth API:    /api-auth/v1/*
Monolith:    /api-monolith/v1/*
```

**Плюсы:**
- ✅ Явное разделение serviceов
- ✅ Легче понять, howой service обрабатывает request
- ✅ Меньше конфлиwhoв when маршрутизации
- ✅ Удобно for monitoringа и логирования

**Минусы:**
- ⚠️ Нестандартный approach (обычно `/api/v1/service/*`)
- ⚠️ Gateway должен правильно маппить пути
- ⚠️ Может быть сложнее for clientов (нужно знать префиксы)

---

## 🎯 Рекомендация

### Для вашего projectа:

**Вариант 2 (предложенный) имеет смысл, если:**
1. ✅ Хотите явное разделение serviceов
2. ✅ Планируете независимое версионирование serviceов
3. ✅ Нужна лучшая трассировка requestов

**Реализация:**

```
Client → Gateway /api/v1/auth/login
    → Gateway маппит: /api/v1/auth/* → Auth API /api-auth/v1/auth/*
    → Gateway маппит: /api/v1/pipelines/* → Monolith /api-monolith/v1/pipelines/*
```

**Или более явно:**

```
Client → Gateway /api/v1/auth/login
    → Gateway определяет service: 'auth'
    → Gateway маппит path: /api-auth/v1/auth/login
    → Отправляет на: http://localhost:7200/api-auth/v1/auth/login
```

---

## 🔧 План реализации

### 1. Auth API

```typescript
// apps/api-auth/src/main.ts
const globalPrefix = 'api-auth/v1';
app.setGlobalPrefix(globalPrefix);
```

**Result:**
- `/api-auth/v1/auth/login`
- `/api-auth/v1/auth/register`
- `/api-auth/v1/users/*`

### 2. Monolith API

```typescript
// apps/api-monolith/src/main.ts
const globalPrefix = 'api-monolith/v1';
app.setGlobalPrefix(globalPrefix);
```

**Result:**
- `/api-monolith/v1/pipelines`
- `/api-monolith/v1/rbac/roles`
- `/api-monolith/v1/integrations/*`

### 3. Gateway маршрутизация

```typescript
// apps/api-gateway/src/app/services/proxy.service.ts
private buildServicePath(path: string, service: string): string {
  const versionMatch = path.match(/^\/api\/(v\d+)/);
  const apiVersion = versionMatch ? versionMatch[1] : 'v1';

  const cleanPath = path.replace(/^\/api\/v\d+/, '').replace(/^\/api/, '');

  // Маппинг префиксов по serviceам
  const servicePrefixMap: Record<string, string> = {
    'auth': `/api-auth/${apiVersion}`,
    'users': `/api-auth/${apiVersion}`, // Users в Auth API
    'monolith': `/api-monolith/${apiVersion}`,
    'pipelines': `/api-monolith/${apiVersion}`,
    'rbac': `/api-monolith/${apiVersion}`,
    'integrations': `/api-monolith/${apiVersion}`,
    'analytics': `/api-monolith/${apiVersion}`,
    'workers': `/api-monolith/${apiVersion}`,
    'abTests': `/api-monolith/${apiVersion}`,
  };

  const servicePrefix = servicePrefixMap[service] || `/api/${apiVersion}`;

  return `${servicePrefix}${cleanPath}`;
}
```

---

## 📊 Сравнение URL

### Вариант 1 (текущий):

```
Client:  /api/v1/auth/login
Gateway: /api/v1/auth/login → Auth API /api/v1/auth/login
```

### Вариант 2 (предложенный):

```
Client:  /api/v1/auth/login
Gateway: /api/v1/auth/login → Auth API /api-auth/v1/auth/login
```

---

## ✅ Итоговая рекомендация

**Использовать Вариант 2 (предложенный), если:**
- ✅ Хотите явное разделение serviceов
- ✅ Планируете независимое версионирование
- ✅ Нужна лучшая трассировка

**Использовать Вариант 1 (текущий), если:**
- ✅ Хотите стандартный REST approach
- ✅ Единообразие важнее явности
- ✅ Просthatа for clientов

---

**Последнее update:** 2025-11-16
