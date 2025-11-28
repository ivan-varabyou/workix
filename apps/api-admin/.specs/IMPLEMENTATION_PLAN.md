# Admin API - План внедрения

**Версия**: 1.0
**Дата**: 2025-11-27
**Статус**: Планирование (ожидает утверждения)

## Обзор

Этот документ описывает план поэтапного внедрения функциональности Admin API. Admin API имеет доступ ко всем базам данных и сервисам платформы Workix и настраивает их.

## Принципы разработки

### 1. Архитектура

- **Логика в библиотеках**: Вся бизнес-логика должна быть в `libs/backend/domain/`
- **API только связывает**: `apps/api-admin` только импортирует из библиотек и вызывает код
- **Переиспользование**: Используем существующие библиотеки, расширяем при необходимости
- **Типизация**: Полная типизация без `as`, `any`, использование type guards

### 2. Процесс разработки

1. **Разработка фичи/логики**:
   - Создаем библиотеку в `libs/backend/domain/` или расширяем существующую
   - Вся логика в библиотеке
   - В `api-admin` только импорты и вызовы

2. **Проверка качества**:
   - TypeScript проверка (`nx run api-admin:typecheck`)
   - Линтер (`nx run api-admin:lint`)
   - Ревью на сквозную типизацию
   - Проверка на хардкодные утверждения типов
   - Использование type guards (проверяем в libs, возможно уже есть)

3. **Тестирование**:
   - Запускаем сервер (`nx serve api-admin`)
   - Проверяем что все работает
   - Если эндпоинт - проверяем что отвечает как заложено
   - Если все ок - делаем коммит

4. **Коммит**:
   - Формат: `T #{номер} - {type}({scope}): description`
   - Английский, lowercase
   - Идем к следующему шагу

### 3. Управление задачами

- Задачи регистрируются в `TASKS.md`
- Ветки создаются от `develop`: `task-{номер}` или `t{номер}`
- Если ветка занята, делаем `+1` (t1 → t2 → t3...)
- Команды: `/task {номер}` для начала работы, `/commit {message}` для коммита

## Фазы внедрения

### Фаза 0: Подготовка (✅ Завершено)

- ✅ Создан `api-admin` как копия `api-auth`
- ✅ Настроена база данных `workix_admin` (порт 5100)
- ✅ Настроен порт сервиса (7100)
- ✅ Интегрирован `WorkixAuthModule` из `libs/backend/domain/auth`
- ✅ Создан план функциональности (`ADMIN_API_PLAN.md`)
- ✅ Создан план безопасности (`ADMIN_API_SECURITY.md`)

### Фаза 1: Управление серверами (P1)

**Цель**: Реализовать мониторинг и управление всеми сервисами Workix.

**Задачи**:
1. Создать библиотеку `libs/backend/domain/admin-services/`
2. Реализовать сервис мониторинга сервисов
3. Создать контроллер `services.controller.ts`
4. Реализовать эндпоинты:
   - `GET /api-admin/v1/services` - Список всех сервисов
   - `GET /api-admin/v1/services/:serviceId/status` - Статус сервиса
   - `GET /api-admin/v1/services/health` - Health check
   - `GET /api-admin/v1/services/metrics` - Метрики
   - `POST /api-admin/v1/services/:serviceId/restart` - Перезапуск (super_admin)
   - `GET /api-admin/v1/services/:serviceId/config` - Конфигурация
   - `GET /api-admin/v1/services/:serviceId/logs` - Логи

**Библиотеки**:
- `libs/backend/domain/admin-services/` - логика управления сервисами
- Использовать существующие библиотеки для мониторинга

**Безопасность**:
- Все эндпоинты требуют `AdminJwtGuard`
- Перезапуск только для `super_admin`
- Нельзя перезапустить `api-admin` (сам себя)
- Секреты маскируются в конфигурации

**Тесты**:
- Unit тесты для сервисов
- Integration тесты для эндпоинтов
- Security тесты (проверка прав доступа)

**Оценка**: 2-3 дня

---

### Фаза 2: Управление админами (P1)

**Цель**: Реализовать CRUD операции для управления админами с полной проверкой безопасности.

**Задачи**:
1. Расширить `libs/backend/domain/admin/` или создать `libs/backend/domain/admin-management/`
2. Реализовать сервис управления админами
3. Создать контроллер `admins.controller.ts`
4. Реализовать эндпоинты:
   - `GET /api-admin/v1/admins` - Список админов
   - `GET /api-admin/v1/admins/:id` - Детали админа
   - `PUT /api-admin/v1/admins/:id` - Обновление
   - `PUT /api-admin/v1/admins/:id/role` - Изменение роли (super_admin)
   - `DELETE /api-admin/v1/admins/:id` - Удаление (super_admin)
   - `POST /api-admin/v1/admins/:id/block` - Блокировка
   - `POST /api-admin/v1/admins/:id/unblock` - Разблокировка
   - `GET /api-admin/v1/admins/:id/sessions` - Сессии
   - `DELETE /api-admin/v1/admins/:id/sessions/:sessionId` - Отзыв сессии

**Библиотеки**:
- Использовать `libs/backend/domain/admin` для базовой логики
- Расширить функциональность

**Безопасность**:
- Нельзя удалить/заблокировать самого себя
- Нельзя удалить/заблокировать последнего super_admin
- Нельзя изменить роль последнего super_admin
- Обычный admin не видит super_admin в списке
- Audit log всех действий

**Тесты**:
- Unit тесты для всех проверок безопасности
- Integration тесты для CRUD операций
- Security тесты (защита от самоуничтожения)

**Оценка**: 3-4 дня

---

### Фаза 3: Управление пользователями (P2)

**Цель**: Реализовать просмотр и управление пользователями платформы.

**Задачи**:
1. Создать `libs/backend/domain/admin-users/`
2. Реализовать сервис управления пользователями
3. Создать контроллер `users.controller.ts`
4. Реализовать эндпоинты:
   - `GET /api-admin/v1/users` - Список пользователей
   - `GET /api-admin/v1/users/:id` - Детали пользователя
   - `POST /api-admin/v1/users/:id/block` - Блокировка
   - `POST /api-admin/v1/users/:id/unblock` - Разблокировка
   - `GET /api-admin/v1/users/:id/activity` - Активность
   - `GET /api-admin/v1/users/:id/subscriptions` - Подписки

**Библиотеки**:
- Использовать `libs/backend/domain/auth` для доступа к пользователям
- Создать `libs/backend/domain/admin-users/` для админской логики

**Безопасность**:
- Требуется авторизация
- `admin` и выше могут просматривать
- `super_admin` может блокировать
- Audit log всех действий

**Тесты**:
- Unit тесты
- Integration тесты
- Security тесты

**Оценка**: 2-3 дня

---

### Фаза 4: Управление базами данных (P2)

**Цель**: Реализовать мониторинг и управление базами данных (read-only).

**Задачи**:
1. Создать `libs/backend/infrastructure/database-admin/`
2. Реализовать сервис работы с БД
3. Создать контроллер `databases.controller.ts`
4. Реализовать эндпоинты:
   - `GET /api-admin/v1/databases` - Список БД
   - `GET /api-admin/v1/databases/:dbName/status` - Статус БД
   - `GET /api-admin/v1/databases/:dbName/tables` - Список таблиц
   - `GET /api-admin/v1/databases/:dbName/tables/:tableName` - Структура таблицы
   - `POST /api-admin/v1/databases/:dbName/backup` - Создание бэкапа (super_admin)

**Библиотеки**:
- Создать `libs/backend/infrastructure/database-admin/` для работы с БД
- Использовать Prisma для подключения к разным БД

**Безопасность**:
- Только `super_admin` может просматривать БД
- Только read-only операции через API
- Connection strings маскируются
- Нельзя выполнять произвольные SQL запросы

**Тесты**:
- Unit тесты
- Integration тесты (с тестовой БД)
- Security тесты

**Оценка**: 3-4 дня

---

### Фаза 5: Управление платежами (P2)

**Цель**: Реализовать просмотр подписок, блокировку платежей, управление планами.

**Задачи**:
1. Создать `libs/backend/domain/admin-billing/`
2. Реализовать сервис управления платежами
3. Создать контроллер `billing.controller.ts`
4. Реализовать эндпоинты:
   - `GET /api-admin/v1/billing/subscriptions` - Список подписок
   - `GET /api-admin/v1/billing/subscriptions/:id` - Детали подписки
   - `GET /api-admin/v1/billing/users/:userId/subscriptions` - Подписки пользователя
   - `POST /api-admin/v1/billing/users/:userId/payments/block` - Блокировка (super_admin)
   - `PUT /api-admin/v1/billing/subscriptions/:id/plan` - Изменение плана (super_admin)
   - `GET /api-admin/v1/billing/payments` - История платежей

**Библиотеки**:
- Использовать существующие библиотеки для billing
- Создать `libs/backend/domain/admin-billing/` для админской логики

**Безопасность**:
- `admin` и выше могут просматривать
- Только `super_admin` может блокировать/изменять
- Данные карт маскируются
- Audit log всех действий

**Тесты**:
- Unit тесты
- Integration тесты
- Security тесты

**Оценка**: 2-3 дня

---

### Фаза 6: RBAC управление (P2)

**Цель**: Реализовать создание и управление ролями и правами доступа.

**Задачи**:
1. Расширить существующие библиотеки для RBAC
2. Создать `libs/backend/domain/admin-rbac/`
3. Реализовать сервис управления RBAC
4. Создать контроллер `rbac.controller.ts`
5. Реализовать эндпоинты:
   - `GET /api-admin/v1/rbac/roles` - Список ролей
   - `POST /api-admin/v1/rbac/roles` - Создание роли (super_admin)
   - `GET /api-admin/v1/rbac/roles/:id` - Детали роли
   - `PUT /api-admin/v1/rbac/roles/:id/permissions` - Изменение прав (super_admin)
   - `DELETE /api-admin/v1/rbac/roles/:id` - Удаление роли (super_admin)

**Библиотеки**:
- Использовать существующие библиотеки для RBAC
- Расширить в `libs/backend/domain/admin-rbac/`

**Безопасность**:
- Только `super_admin` может создавать/изменять роли
- Нельзя изменить права роли `super_admin`
- Нельзя удалить все права у роли `admin`
- Валидация прав

**Тесты**:
- Unit тесты
- Integration тесты
- Security тесты

**Оценка**: 2-3 дня

---

### Фаза 7: Мониторинг и аналитика (P3)

**Цель**: Интегрировать с Grafana, Prometheus для мониторинга и аналитики.

**Задачи**:
1. Создать `libs/backend/infrastructure/monitoring/`
2. Реализовать экспорт метрик
3. Создать контроллер `metrics.controller.ts`
4. Реализовать эндпоинты:
   - `GET /api-admin/v1/metrics/prometheus` - Prometheus метрики
   - `GET /api-admin/v1/metrics/grafana` - Данные для Grafana
   - `GET /api-admin/v1/metrics/realtime` - Real-time метрики
   - `GET /api-admin/v1/dashboard` - Dashboard данные

**Библиотеки**:
- Создать `libs/backend/infrastructure/monitoring/` для мониторинга
- Интеграция с Prometheus и Grafana

**Безопасность**:
- Требуется авторизация
- Метрики могут быть публичными (опционально)

**Тесты**:
- Unit тесты
- Integration тесты

**Оценка**: 3-4 дня

---

### Фаза 8: Управление интеграциями (P3)

**Цель**: Реализовать просмотр и управление интеграциями платформы.

**Задачи**:
1. Создать `libs/backend/domain/admin-integrations/`
2. Реализовать сервис управления интеграциями
3. Создать контроллер `integrations.controller.ts`
4. Реализовать эндпоинты:
   - `GET /api-admin/v1/integrations` - Список интеграций
   - `GET /api-admin/v1/integrations/:id/status` - Статус интеграции
   - `PUT /api-admin/v1/integrations/:id/config` - Обновление конфигурации
   - `GET /api-admin/v1/integrations/:id/logs` - Логи интеграции

**Библиотеки**:
- Использовать существующие библиотеки для интеграций
- Расширить в `libs/backend/domain/admin-integrations/`

**Безопасность**:
- Требуется авторизация
- `admin` и выше могут просматривать
- Только `super_admin` может изменять конфигурацию

**Тесты**:
- Unit тесты
- Integration тесты

**Оценка**: 2-3 дня

---

### Фаза 9: Pipelines/Workflows/Workers (P3)

**Цель**: Реализовать управление пайплайнами, воркфлоу и воркерами.

**Задачи**:
1. Создать `libs/backend/domain/admin-automation/`
2. Реализовать сервис управления automation
3. Создать контроллеры `pipelines.controller.ts`, `workflows.controller.ts`, `workers.controller.ts`
4. Реализовать эндпоинты:
   - `GET /api-admin/v1/pipelines` - Список пайплайнов
   - `GET /api-admin/v1/workflows` - Список воркфлоу
   - `GET /api-admin/v1/workers` - Список воркеров
   - `POST /api-admin/v1/pipelines/:id/stop` - Остановка пайплайна
   - `GET /api-admin/v1/pipelines/:id/logs` - Логи пайплайна

**Библиотеки**:
- Использовать существующие библиотеки для pipelines/workflows/workers
- Расширить в `libs/backend/domain/admin-automation/`

**Безопасность**:
- Требуется авторизация
- `admin` и выше могут просматривать
- Только `super_admin` может останавливать

**Тесты**:
- Unit тесты
- Integration тесты

**Оценка**: 3-4 дня

---

### Фаза 10: Безопасность и аудит (P1)

**Цель**: Реализовать audit logs, IP блокировку, события безопасности.

**Задачи**:
1. Создать `libs/backend/domain/admin-security/`
2. Реализовать сервис безопасности и аудита
3. Создать контроллеры `audit.controller.ts`, `security.controller.ts`
4. Реализовать эндпоинты:
   - `GET /api-admin/v1/audit/logs` - Список audit logs
   - `GET /api-admin/v1/audit/export` - Экспорт (super_admin)
   - `POST /api-admin/v1/security/ip-blocks` - Блокировка IP (super_admin)
   - `GET /api-admin/v1/security/events` - События безопасности

**Библиотеки**:
- Использовать существующие библиотеки для audit
- Расширить в `libs/backend/domain/admin-security/`

**Безопасность**:
- `admin` и выше могут просматривать
- Только `super_admin` может экспортировать/блокировать IP
- Нельзя заблокировать IP текущего админа

**Тесты**:
- Unit тесты
- Integration тесты
- Security тесты

**Оценка**: 2-3 дня

---

## Чек-лист внедрения

### Общий чек-лист для каждой фазы:

- [ ] Создать/расширить библиотеку в `libs/backend/domain/` или `libs/backend/infrastructure/`
- [ ] Реализовать сервис с полной типизацией (без `as`, `any`)
- [ ] Использовать type guards для проверки типов
- [ ] Создать контроллер в `apps/api-admin/src/app/controllers/`
- [ ] Реализовать эндпоинты с Swagger документацией
- [ ] Добавить guards и проверки безопасности
- [ ] Написать unit тесты (минимум 85% покрытие для библиотек)
- [ ] Написать integration тесты для эндпоинтов
- [ ] Написать security тесты
- [ ] Проверить TypeScript (`nx run api-admin:typecheck`)
- [ ] Проверить линтер (`nx run api-admin:lint`)
- [ ] Запустить сервер и проверить работу
- [ ] Обновить Swagger документацию
- [ ] Создать коммит с правильным форматом

### Чек-лист перед началом работы:

- [ ] Проверить MCP серверы (`make mcp-status`)
- [ ] Создать ветку от `develop` (`task-{номер}`)
- [ ] Зарегистрировать задачу в `TASKS.md`
- [ ] Прочитать план фазы
- [ ] Изучить существующие библиотеки для переиспользования

### Чек-лист перед коммитом:

- [ ] Все тесты проходят
- [ ] TypeScript проверка прошла
- [ ] Линтер проверка прошла
- [ ] Нет `as`, `any` (кроме документированных исключений)
- [ ] Использованы type guards
- [ ] Swagger документация обновлена
- [ ] Коммит в правильном формате: `T #{номер} - {type}({scope}): description`

---

## Оценка времени

| Фаза | Приоритет | Оценка | Статус |
|------|-----------|--------|--------|
| Фаза 0: Подготовка | - | - | ✅ Завершено |
| Фаза 1: Управление серверами | P1 | 2-3 дня | ⭕ Ожидает |
| Фаза 2: Управление админами | P1 | 3-4 дня | ⭕ Ожидает |
| Фаза 3: Управление пользователями | P2 | 2-3 дня | ⭕ Ожидает |
| Фаза 4: Управление БД | P2 | 3-4 дня | ⭕ Ожидает |
| Фаза 5: Управление платежами | P2 | 2-3 дня | ⭕ Ожидает |
| Фаза 6: RBAC управление | P2 | 2-3 дня | ⭕ Ожидает |
| Фаза 7: Мониторинг и аналитика | P3 | 3-4 дня | ⭕ Ожидает |
| Фаза 8: Управление интеграциями | P3 | 2-3 дня | ⭕ Ожидает |
| Фаза 9: Pipelines/Workflows/Workers | P3 | 3-4 дня | ⭕ Ожидает |
| Фаза 10: Безопасность и аудит | P1 | 2-3 дня | ⭕ Ожидает |

**Общая оценка**: 25-35 дней

---

## Следующие шаги

1. ✅ Утвердить план внедрения
2. ✅ Создать систему управления задачами (`TASKS.md`)
3. ✅ Создать скрипты для автоматизации (`/task`, `/commit`)
4. ⏳ Начать Фазу 1: Управление серверами

---

## Связанные документы

- [ADMIN_API_PLAN.md](./ADMIN_API_PLAN.md) - План функциональности
- [ADMIN_API_SECURITY.md](./ADMIN_API_SECURITY.md) - Кейсы безопасности
- [../../TASKS.md](../../TASKS.md) - Список задач
