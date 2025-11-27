# 📋 Полный список allх эндпоинтов API Monolith

**Date:** 2025-11-16
**Базовый path:** `/api-monolith/v1`
**Всего эндпоинтов:** 100+

---

## 🔧 Pipelines (9 эндпоинтов)

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| `POST` | `/api-monolith/v1/pipelines` | Создать пайплайн | ✅ JWT |
| `GET` | `/api-monolith/v1/pipelines` | Список пайплайнов пользователя | ✅ JWT |
| `GET` | `/api-monolith/v1/pipelines/templates` | Список templateов | ✅ JWT |
| `GET` | `/api-monolith/v1/pipelines/marketplace/list` | Публичные пайплайны | ✅ JWT |
| `POST` | `/api-monolith/v1/pipelines/templates/:id/clone` | Клонировать template | ✅ JWT |
| `GET` | `/api-monolith/v1/pipelines/:id` | Получить пайплайн | ✅ JWT |
| `PUT` | `/api-monolith/v1/pipelines/:id` | Обновить пайплайн | ✅ JWT |
| `DELETE` | `/api-monolith/v1/pipelines/:id` | Удалить пайплайн | ✅ JWT |
| `POST` | `/api-monolith/v1/pipelines/:id/publish` | Опубликовать пайплайн | ✅ JWT |

---

## ⚙️ Executions (4 эндпоинта)

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| `POST` | `/api-monolith/v1/executions` | Запустить execution | ✅ JWT |
| `GET` | `/api-monolith/v1/executions` | Список выполнений пользователя | ✅ JWT |
| `GET` | `/api-monolith/v1/executions/:id` | Получить execution | ✅ JWT |
| `GET` | `/api-monolith/v1/executions/:id/stats` | Статистика выполнения | ✅ JWT |

---

## 🔐 RBAC (11 эндпоинтов)

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| `POST` | `/api-monolith/v1/rbac/roles` | Создать роль | ✅ JWT |
| `GET` | `/api-monolith/v1/rbac/roles` | Список ролей | ✅ JWT |
| `GET` | `/api-monolith/v1/rbac/roles/:id` | Получить роль | ✅ JWT |
| `PUT` | `/api-monolith/v1/rbac/roles/:id` | Обновить роль | ✅ JWT |
| `DELETE` | `/api-monolith/v1/rbac/roles/:id` | Удалить роль | ✅ JWT |
| `POST` | `/api-monolith/v1/rbac/permissions` | Создать permission | ✅ JWT |
| `GET` | `/api-monolith/v1/rbac/permissions` | Список permissions | ✅ JWT |
| `GET` | `/api-monolith/v1/rbac/permissions/:id` | Получить permission | ✅ JWT |
| `POST` | `/api-monolith/v1/rbac/permissions/grant` | Выдать permission роли | ✅ JWT |
| `DELETE` | `/api-monolith/v1/rbac/permissions/:roleId/:id` | Отозвать permission | ✅ JWT |
| `POST` | `/api-monolith/v1/rbac/assign-role` | Назначить роль пользователю | ✅ JWT |
| `DELETE` | `/api-monolith/v1/rbac/assign-role` | Удалить роль у пользователя | ✅ JWT |

---

## 👷 Workers (13 эндпоинтов)

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| `POST` | `/api-monolith/v1/workers` | Создать воркера | ✅ JWT |
| `GET` | `/api-monolith/v1/workers` | Список воркеров | ✅ JWT |
| `GET` | `/api-monolith/v1/workers/:workerId` | Получить воркера | ✅ JWT |
| `PUT` | `/api-monolith/v1/workers/:workerId` | Обновить воркера | ✅ JWT |
| `DELETE` | `/api-monolith/v1/workers/:workerId` | Удалить воркера | ✅ JWT |
| `POST` | `/api-monolith/v1/workers/:workerId/tasks` | Назначить задачу | ✅ JWT |
| `GET` | `/api-monolith/v1/workers/:workerId/tasks` | Список задач воркера | ✅ JWT |
| `GET` | `/api-monolith/v1/workers/:workerId/tasks/:taskId` | Получить задачу | ✅ JWT |
| `PUT` | `/api-monolith/v1/workers/:workerId/tasks/:taskId/cancel` | Отменить задачу | ✅ JWT |
| `GET` | `/api-monolith/v1/workers/:workerId/status` | Статус воркера | ✅ JWT |
| `PUT` | `/api-monolith/v1/workers/:workerId/pause` | Приостановить воркера | ✅ JWT |
| `PUT` | `/api-monolith/v1/workers/:workerId/resume` | Возобновить воркера | ✅ JWT |
| `GET` | `/api-monolith/v1/workers/:workerId/metrics` | Меthreeки воркера | ✅ JWT |

---

## 🔌 Integrations - Providers (13 эндпоинтов)

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| `GET` | `/api-monolith/v1/integrations/providers` | Список провайдеров | ✅ JWT |
| `GET` | `/api-monolith/v1/integrations/providers/:id` | Получить провайдера | ✅ JWT |
| `POST` | `/api-monolith/v1/integrations/providers` | Создать провайдера | ✅ JWT |
| `PUT` | `/api-monolith/v1/integrations/providers/:id` | Обновить провайдера | ✅ JWT |
| `DELETE` | `/api-monolith/v1/integrations/providers/:id` | Удалить провайдера | ✅ JWT |
| `POST` | `/api-monolith/v1/integrations/providers/:id/credentials` | Добавить credential | ✅ JWT |
| `GET` | `/api-monolith/v1/integrations/providers/:id/credentials` | Список credentials | ✅ JWT |
| `GET` | `/api-monolith/v1/integrations/providers/credentials/:credentialId` | Получить credential | ✅ JWT |
| `PUT` | `/api-monolith/v1/integrations/providers/credentials/:credentialId` | Обновить credential | ✅ JWT |
| `DELETE` | `/api-monolith/v1/integrations/providers/credentials/:credentialId` | Удалить credential | ✅ JWT |
| `POST` | `/api-monolith/v1/integrations/providers/:id/credentials/rotate` | Ротация credentials | ✅ JWT |
| `POST` | `/api-monolith/v1/integrations/providers/:id/config` | Установить config | ✅ JWT |
| `GET` | `/api-monolith/v1/integrations/providers/:id/config` | Получить config | ✅ JWT |

---

## 🛒 Integrations - E-commerce (7 эндпоинтов)

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| `GET` | `/api-monolith/v1/integrations/ecommerce/products/search` | Поиск продуwhoв | ✅ JWT |
| `POST` | `/api-monolith/v1/integrations/ecommerce/products/upload` | Загрузить продукт | ✅ JWT |
| `GET` | `/api-monolith/v1/integrations/ecommerce/products/:provider/:productId` | Статистика продукта | ✅ JWT |
| `PUT` | `/api-monolith/v1/integrations/ecommerce/products/:provider/:productId` | Обновить продукт | ✅ JWT |
| `POST` | `/api-monolith/v1/integrations/ecommerce/products/bulk-upload` | Массовая загрузка | ✅ JWT |
| `GET` | `/api-monolith/v1/integrations/ecommerce/sellers/:provider/metrics` | Меthreeки продавца | ✅ JWT |
| `GET` | `/api-monolith/v1/integrations/ecommerce/categories/:provider` | Список категорий | ✅ JWT |

---

## 📊 Integrations - Metrics (3 эндпоинта)

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| `GET` | `/api-monolith/v1/integrations/metrics` | Общие metrics | ✅ JWT |
| `GET` | `/api-monolith/v1/integrations/metrics/provider/:providerId` | Меthreeки провайдера | ✅ JWT |
| `GET` | `/api-monolith/v1/integrations/metrics/errors` | Последние errors | ✅ JWT |

---

## 🔍 Integrations - Monitoring (3 эндпоинта)

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| `GET` | `/api-monolith/v1/integrations/monitoring/health` | Общее health | ✅ JWT |
| `GET` | `/api-monolith/v1/integrations/monitoring/alerts` | Алерты | ✅ JWT |
| `GET` | `/api-monolith/v1/integrations/monitoring/dashboard` | Дашборд | ✅ JWT |

---

## 🏥 Integrations - Health (2 эндпоинта)

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| `GET` | `/api-monolith/v1/integrations/health` | Общее health провайдеров | ✅ JWT |
| `GET` | `/api-monolith/v1/integrations/health/:providerId` | Здоровье провайдера | ✅ JWT |

---

## 🔑 Integrations - Credentials (4 эндпоинта)

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| `POST` | `/api-monolith/v1/integrations/credentials/rotate/all` | Ротация allх credentials | ✅ JWT |
| `POST` | `/api-monolith/v1/integrations/credentials/rotate/provider/:providerId` | Ротация провайдера | ✅ JWT |
| `POST` | `/api-monolith/v1/integrations/credentials/rotate/expired` | Ротация истекших | ✅ JWT |
| `POST` | `/api-monolith/v1/integrations/credentials/rotate/expiring` | Ротация истекающих | ✅ JWT |

---

## 📈 Analytics (4 эндпоинта)

| Метод | Путь | Описание | Авторизация | Статус |
|-------|------|----------|-------------|--------|
| `POST` | `/api-monolith/v1/analytics/universal/analyze` | Анализ | ✅ JWT | ⚠️ TODO |
| `POST` | `/api-monolith/v1/analytics/universal/retention` | Анализ удержания | ✅ JWT | ⚠️ TODO |
| `POST` | `/api-monolith/v1/analytics/universal/predict` | Прогнозирование | ✅ JWT | ⚠️ TODO |
| `POST` | `/api-monolith/v1/analytics/universal/compare` | Сравнение | ✅ JWT | ⚠️ TODO |

---

## 🧪 A/B Testing (8 эндпоинтов)

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| `POST` | `/api-monolith/v1/ab-tests` | Создать тест | ✅ JWT |
| `GET` | `/api-monolith/v1/ab-tests` | Список тестов | ✅ JWT |
| `GET` | `/api-monolith/v1/ab-tests/:testId` | Получить тест | ✅ JWT |
| `POST` | `/api-monolith/v1/ab-tests/:testId/track` | Отследить событие | ✅ JWT |
| `GET` | `/api-monolith/v1/ab-tests/:testId/results` | Результаты теста | ✅ JWT |
| `PUT` | `/api-monolith/v1/ab-tests/:testId/end` | Завершить тест | ✅ JWT |
| `PUT` | `/api-monolith/v1/ab-tests/:testId/pause` | Приостановить тест | ✅ JWT |
| `PUT` | `/api-monolith/v1/ab-tests/:testId/resume` | Возобновить тест | ✅ JWT |

---

## 🏥 Health & Info (3 эндпоинта)

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| `GET` | `/api-monolith/v1/health` | Health check | ❌ Public |
| `GET` | `/api-monolith/v1/info` | Информация об API | ❌ Public |
| `GET` | `/api-monolith/v1/stats` | Статистика systems | ❌ Public |

---

## 📊 Итоговая statistics

| Категория | Количество |
|-----------|------------|
| **Pipelines** | 9 |
| **Executions** | 4 |
| **RBAC** | 11 |
| **Workers** | 13 |
| **Integrations - Providers** | 13 |
| **Integrations - E-commerce** | 7 |
| **Integrations - Metrics** | 3 |
| **Integrations - Monitoring** | 3 |
| **Integrations - Health** | 2 |
| **Integrations - Credentials** | 4 |
| **Analytics** | 4 |
| **A/B Testing** | 8 |
| **Health & Info** | 3 |
| **ИТОГО** | **88** |

---

**Последнее update:** 2025-11-16

