# Task Management Commands

**Версия**: 1.0
**Дата**: 2025-11-27

## Обзор

Система управления задачами для быстрой разработки. Позволяет создавать задачи, ветки и коммиты с автоматическим определением номеров задач.

## Команды

### `/task {номер}`

Начать работу над задачей. Если номер не указан, автоматически определяется следующий свободный номер.

**Действия**:
1. Проверяет что ветка не занята
2. Переключается на `develop` (если нужно)
3. Создает ветку `task-{номер}` или `t{номер}`
4. Обновляет статус задачи в `TASKS.md`

**Примеры**:
```
/task 1
/task 2
/task
```

**Реализация**:
```bash
./scripts/task-manager.sh start [номер]
```

---

### `/commit {message}`

Создать коммит с автоматическим определением номера задачи из текущей ветки.

**Действия**:
1. Определяет номер задачи из текущей ветки (`task-{номер}` или `t{номер}`)
2. Форматирует сообщение: `T #{номер} - {message}`
3. Создает коммит

**Примеры**:
```
/commit feat(admin): add user management
/commit fix(auth): resolve login issue
/commit docs(api): update swagger
```

**Реализация**:
```bash
./scripts/task-manager.sh commit 'message'
```

---

### `/task status [номер]`

Показать статус задачи. Если номер не указан, показывает статус текущей задачи.

**Действия**:
1. Определяет номер задачи (из ветки или параметра)
2. Показывает информацию о задаче
3. Показывает последние коммиты

**Примеры**:
```
/task status
/task status 1
```

**Реализация**:
```bash
./scripts/task-manager.sh status [номер]
```

---

### `/task list`

Показать список всех задач.

**Действия**:
1. Парсит `TASKS.md`
2. Показывает активные задачи
3. Показывает активные ветки задач

**Примеры**:
```
/task list
```

**Реализация**:
```bash
./scripts/task-manager.sh list
```

---

## Интеграция с Cursor

Для использования команд в чате Cursor, можно создать простой обработчик:

1. **Создать файл `.cursor/commands/task.md`**:
```markdown
---
description: Start working on a task
---

## User Input

```text
$ARGUMENTS
```

## Task Command Handler

If user input starts with `/task` or `/commit`, execute the corresponding script:

- `/task {номер}` → `./scripts/task-manager.sh start {номер}`
- `/commit {message}` → `./scripts/task-manager.sh commit '{message}'`
- `/task status [номер]` → `./scripts/task-manager.sh status [номер]`
- `/task list` → `./scripts/task-manager.sh list`

Execute the command and return the result to the user.
```

2. **Или использовать напрямую в чате**:
   - Просто напишите команду, и AI агент выполнит соответствующий скрипт

---

## Примеры использования

### Начало работы над задачей

```
Пользователь: /task 1
AI: Выполняю: ./scripts/task-manager.sh start 1
     ✅ Ветка task-1 создана!
     ℹ️  Номер задачи: 1
     ℹ️  Ветка: task-1
```

### Создание коммита

```
Пользователь: /commit feat(admin): add user management
AI: Выполняю: ./scripts/task-manager.sh commit 'feat(admin): add user management'
     ✅ Коммит создан: T #1 - feat(admin): add user management
```

### Проверка статуса

```
Пользователь: /task status
AI: Выполняю: ./scripts/task-manager.sh status
     ℹ️  Статус задачи #1:
     Ветка: task-1
     Номер задачи: 1
     Последние коммиты:
     abc1234 T #1 - feat(admin): add user management
```

---

## Будущие улучшения

- [ ] Автоматическое обновление статуса задачи в `TASKS.md`
- [ ] Интеграция с Git hooks для автоматического определения задачи
- [ ] Поддержка подзадач
- [ ] Интеграция с issue tracker (GitHub Issues, Jira)
- [ ] Автоматическое создание PR при завершении задачи
