# ✅ Чек-лист миграции libs

## 🎯 Принципы самоконтроля

1. **После каждого перемещения библиотеки:**
   - ✅ Проверить компиляцию: `nx build {library-name}`
   - ✅ Проверить тесты: `nx test {library-name}`
   - ✅ Обновить импорты в зависимых библиотеках
   - ✅ Обновить `tsconfig.base.json`
   - ✅ Обновить `project.json` (если нужно)

2. **После каждого этапа:**
   - ✅ Проверить компиляцию всех библиотек этапа
   - ✅ Проверить работу всех сервисов
   - ✅ Обновить документацию

3. **Перед финальным коммитом:**
   - ✅ Полная компиляция: `nx run-many -t build --all`
   - ✅ Все тесты: `nx run-many -t test --all`
   - ✅ Проверка линтера: `nx run-many -t lint --all`

---

## 📋 Этап 0: Создание структуры

### Задачи:
- [ ] Создать `libs/backend/` структуру
- [ ] Создать `libs/frontend/` структуру (если нужно)
- [ ] Создать `libs/shared/` структуру (если нужно)

### Чек-лист после этапа 0:
- [ ] Структура директорий создана
- [ ] NX видит новую структуру

---

## 📋 Этап 1: Entities

### Задачи:
- [ ] Переместить `entities/backend/user/` → `backend/entities/domain/user/`
- [ ] Переместить `entities/backend/admin/` → `backend/entities/domain/admin/`
- [ ] Переместить `entities/backend/pipeline/` → `backend/entities/domain/pipeline/`
- [ ] Переместить `entities/backend/role/` → `backend/entities/domain/role/`
- [ ] Переместить `entities/backend/worker/` → `backend/entities/domain/worker/`
- [ ] Переместить `entities/backend/ab-test/` → `backend/entities/domain/ab-test/`
- [ ] Переместить `entities/backend/trial/` → `backend/entities/domain/trial/`
- [ ] Переместить `entities/backend/subscription/` → `backend/entities/domain/subscription/`
- [ ] Переместить `entities/backend/api-key/` → `backend/entities/infrastructure/api-key/`
- [ ] Переместить `entities/backend/ai-provider/` → `ai/entities/ai-provider/`
- [ ] Переместить `entities/backend/ai-model/` → `ai/entities/ai-model/`
- [ ] Переместить `entities/backend/integration/` → `integrations/entities/integration/`

### Чек-лист после каждой библиотеки:
- [ ] `nx build {library-name}` - успешно
- [ ] `nx test {library-name}` - успешно
- [ ] Импорты обновлены в `tsconfig.base.json`
- [ ] `project.json` обновлен (sourceRoot, paths)

### Чек-лист после этапа 1:
- [ ] Все entities перемещены
- [ ] Все импорты обновлены
- [ ] Компиляция всех entities успешна
- [ ] Тесты всех entities проходят

---

## 📋 Этап 2: Domain

### Задачи:
- [ ] Переместить `domain/auth/` → `backend/domain/auth/`
- [ ] Переместить `domain/rbac/` → `backend/domain/rbac/`
- [ ] Переместить `domain/pipelines/` → `backend/domain/pipelines/`
- [ ] Переместить `domain/workers/` → `backend/domain/workers/`
- [ ] Переместить `domain/workflows/` → `backend/domain/workflows/`
- [ ] Переместить `domain/webhooks/` → `backend/domain/webhooks/`
- [ ] Переместить `domain/users/` → `backend/domain/users/`
- [ ] Переместить `domain/admin/` → `backend/domain/admin/`
- [ ] Переместить `domain/notifications/` → `backend/domain/notifications/`
- [ ] Переместить `utilities/ab-testing/` → `backend/domain/ab-testing/`
- [ ] Переместить `utilities/billing/` → `backend/domain/billing/`
- [ ] Переместить AI domain сервисы → `ai/domain/`

### Чек-лист после каждой библиотеки:
- [ ] `nx build {library-name}` - успешно
- [ ] `nx test {library-name}` - успешно
- [ ] Импорты обновлены
- [ ] Зависимости от entities работают

### Чек-лист после этапа 2:
- [ ] Все domain сервисы перемещены
- [ ] Компиляция всех domain библиотек успешна
- [ ] Тесты всех domain библиотек проходят
- [ ] Зависимости от entities работают

---

## 📋 Этап 3: Infrastructure

### Задачи:
- [ ] Переместить `infrastructure/prisma/` → `backend/infrastructure/prisma/`
- [ ] Переместить `infrastructure/database/` → `backend/infrastructure/database/`
- [ ] Переместить `infrastructure/i18n/` → `backend/infrastructure/i18n/`
- [ ] Переместить `infrastructure/message-broker/` → `backend/infrastructure/message-broker/`
- [ ] Переместить `infrastructure/service-discovery/` → `backend/infrastructure/service-discovery/`
- [ ] Переместить `infrastructure/notifications/` → `backend/infrastructure/notifications/`
- [ ] Переместить `infrastructure/performance/` → `backend/infrastructure/performance/`
- [ ] Переместить `infrastructure/testing/` → `backend/infrastructure/testing/`
- [ ] Переместить `infrastructure/api-keys/` → `backend/infrastructure/api-keys/`
- [ ] Переместить AI infrastructure → `ai/infrastructure/`

### Чек-лист после каждой библиотеки:
- [ ] `nx build {library-name}` - успешно
- [ ] `nx test {library-name}` - успешно
- [ ] Импорты обновлены
- [ ] Зависимости работают

### Чек-лист после этапа 3:
- [ ] Все infrastructure библиотеки перемещены
- [ ] Компиляция всех infrastructure библиотек успешна
- [ ] Тесты всех infrastructure библиотек проходят
- [ ] Сервисы работают корректно

---

## 📋 Этап 4: Shared

### Задачи:
- [ ] Переместить `shared/backend/core/` → `backend/shared/core/`
- [ ] Переместить `shared/backend/api/` → `backend/shared/api/`
- [ ] Переместить `shared/backend/config/` → `backend/shared/config/`
- [ ] Переместить `utilities/data-validation/` → `backend/shared/utilities/data-validation/`
- [ ] Переместить `utilities/resilience/` → `backend/shared/utilities/resilience/`
- [ ] Переместить `utilities/file-storage/` → `backend/shared/utilities/file-storage/`
- [ ] Переместить `utilities/batch-processing/` → `backend/shared/utilities/batch-processing/`
- [ ] Переместить `utilities/custom-scripts/` → `backend/shared/utilities/custom-scripts/`
- [ ] Реорганизовать services в подпапки (session-manager/, token-cache/, auth-client/)

### Чек-лист после каждой библиотеки:
- [ ] `nx build {library-name}` - успешно
- [ ] `nx test {library-name}` - успешно
- [ ] Импорты обновлены во всех зависимых библиотеках

### Чек-лист после этапа 4:
- [ ] Все shared библиотеки перемещены
- [ ] Services реорганизованы в подпапки
- [ ] Компиляция всех shared библиотек успешна
- [ ] Тесты всех shared библиотек проходят

---

## 📋 Этап 5: Features

### Задачи:
- [ ] Удалить `features/backend/auth/` (использовать `backend/domain/auth/`)
- [ ] Удалить `features/backend/pipelines/` (использовать `backend/domain/pipelines/`)
- [ ] Удалить `features/backend/rbac/` (использовать `backend/domain/rbac/`)
- [ ] Переместить frontend features (если есть)

### Чек-лист после этапа 5:
- [ ] Backend features удалены
- [ ] Импорты обновлены (используют domain напрямую)
- [ ] Компиляция успешна

---

## 📋 Этап 6: Integrations & AI

### Задачи:
- [ ] Переместить AI провайдеры → `integrations/ai/providers/`
- [ ] Организовать integrations структуру

### Чек-лист после этапа 6:
- [ ] AI провайдеры перемещены
- [ ] Integrations структура организована
- [ ] Компиляция успешна

---

## 📋 Этап 7: Финальная проверка

### Задачи:
- [ ] Обновить `tsconfig.base.json` со всеми новыми путями
- [ ] Обновить все `project.json` файлы
- [ ] Обновить все импорты в `apps/`
- [ ] Полная компиляция: `nx run-many -t build --all`
- [ ] Все тесты: `nx run-many -t test --all`
- [ ] Линтер: `nx run-many -t lint --all`

### Чек-лист после этапа 7:
- [ ] Все проекты компилируются
- [ ] Все тесты проходят
- [ ] Линтер не находит ошибок
- [ ] Документация обновлена

---

## 🚨 Критические проверки перед коммитом

- [ ] `nx graph` - проверить граф зависимостей
- [ ] `nx affected:build` - проверить затронутые проекты
- [ ] `nx affected:test` - проверить затронутые тесты
- [ ] Все apps запускаются без ошибок
- [ ] Все сервисы работают корректно

