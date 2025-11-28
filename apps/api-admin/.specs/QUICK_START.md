# Speckit Commands - Краткая инструкция

**Версия**: 1.0  
**Дата**: 2025-11-27

## Правильный порядок команд

```
1. /speckit.specify      → Создание спецификации
2. /speckit.clarify      → Уточнение неоднозначностей
3. /speckit.plan         → Техническое планирование
4. /speckit.tasks        → Генерация задач
5. /speckit.checklist    → Чек-лист качества (после tasks)
6. /speckit.analyze      → Анализ согласованности (после tasks)
7. /speckit.implement    → Реализация (опционально)
```

## Текущий статус Admin API

| # | Команда | Статус | Файл |
|---|---------|--------|------|
| 1 | `/speckit.specify` | ✅ | `.specs/ADMIN_API_PLAN.md` |
| 2 | `/speckit.clarify` | ✅ | Обновлен spec |
| 3 | `/speckit.plan` | ⏳ **СЛЕДУЮЩИЙ** | - |
| 4 | `/speckit.tasks` | ⏳ | - |
| 5 | `/speckit.checklist` | ✅* | `.specs/checklists/` |
| 6 | `/speckit.analyze` | ✅* | `.specs/ANALYSIS_REPORT.md` |

\* Выполнено раньше для демонстрации, правильный порядок - после tasks

## Следующая команда

```
/speckit.plan
```

## Структура документации

Все спецификации хранятся в `apps/api-admin/.specs/`:
- `ADMIN_API_PLAN.md` - Спецификация
- `IMPLEMENTATION_PLAN.md` - План внедрения
- `ADMIN_API_SECURITY.md` - Кейсы безопасности
- `SPECKIT_WORKFLOW.md` - Полная инструкция
- `checklists/` - Чек-листы качества

## Важно для NX монорепозитория

- `api-auth` → `libs/backend/domain/auth` (User)
- `api-admin` → `libs/backend/domain/admin` (Admin)
- Изменения в `admin` **НЕ влияют** на `api-auth`
- Общие библиотеки (`infrastructure/*`) влияют на оба API

## Команды которые НЕ существуют

❌ `/speckit.test`, `/speckit.deploy`, `/speckit.monitor`, `/speckit.optimize`, `/speckit.refactor`, `/speckit.cleanup`, `/speckit.docs`, `/speckit.release`, `/speckit.support`, `/speckit.improve`, `/speckit.review`

**Реально доступны только**: specify, clarify, plan, tasks, checklist, analyze, implement

