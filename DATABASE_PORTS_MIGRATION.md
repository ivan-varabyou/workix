# 🔄 Миграция на новые порты баз данных

**Date:** 2025-01-XX
**Цель:** Перевести сервисы на логическую привязку портов БД к портам API

---

## 📋 Логика привязки портов

**Правило:** Меняется только первая цифра: 7 → 5

| API Сервис | API Порт | БД Порт (Production) | База данных |
|------------|----------|----------------------|-------------|
| api-monolith | 7000 | **5000** | workix_monolith |
| api-auth | 7200 | **5200** | workix_auth |
| api-notifications | 7201 | **5201** | workix_notifications |

---

## 🔧 Development (текущая конфигурация)

**Один PostgreSQL инстанс на порту 5432** с несколькими базами данных:

```yaml
postgres:
  ports:
    - "5432:5432"
```

**Базы данных:**
- `workix_monolith` → API 7000
- `workix_auth` → API 7200
- `workix_notifications` → API 7201

**Connection strings:**
- `postgresql://postgres:postgres@localhost:5432/workix_monolith`
- `postgresql://postgres:postgres@localhost:5432/workix_auth`
- `postgresql://postgres:postgres@localhost:5432/workix_notifications`

---

## 🚀 Production (будущая конфигурация)

**Отдельные PostgreSQL инстансы** с портами, соответствующими API портам:

```yaml
postgres-monolith:
  ports:
    - "5000:5432"  # API 7000 → DB 5000

postgres-auth:
  ports:
    - "5200:5432"  # API 7200 → DB 5200

postgres-notifications:
  ports:
    - "5201:5432"  # API 7201 → DB 5201
```

**Connection strings:**
- `postgresql://postgres:postgres@localhost:5000/workix_monolith`
- `postgresql://postgres:postgres@localhost:5200/workix_auth`
- `postgresql://postgres:postgres@localhost:5201/workix_notifications`

---

## ✅ Обновленные файлы

1. **docker-compose.yml**
   - Добавлен Redis сервис
   - Добавлен api-notifications сервис
   - Комментарии о логической привязке портов

2. **scripts/init-databases.sql**
   - Добавлена `workix_notifications` база данных
   - Добавлена `workix_monolith` база данных

3. **apps/api-notifications/env.example**
   - Создан пример конфигурации

4. **apps/api-notifications/Dockerfile.dev**
   - Создан Dockerfile для development

---

## 📝 Переменные окружения

### api-monolith
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/workix_monolith
```

### api-auth
```bash
DATABASE_URL_AUTH=postgresql://postgres:postgres@localhost:5432/workix_auth
```

### api-notifications
```bash
DATABASE_URL_NOTIFICATIONS=postgresql://postgres:postgres@localhost:5432/workix_notifications
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 🎯 Следующие шаги

1. ✅ Обновлены конфигурации для Development
2. ⏳ При необходимости создать Prisma schema для api-notifications (если нужна БД для истории/статистики)
3. ⏳ Обновить Production конфигурации при деплое









