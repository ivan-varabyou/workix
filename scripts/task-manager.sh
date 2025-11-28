#!/bin/bash

# Task Manager Script
# Управление задачами для разработки
# Использование: ./scripts/task-manager.sh {command} [args]

set -e

TASKS_FILE="TASKS.md"
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
TASK_PREFIX="task-"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Функция для получения следующего свободного номера задачи
get_next_task_number() {
    local max_num=0
    local task_num
    
    # Проверяем существующие ветки
    while IFS= read -r branch; do
        if [[ $branch =~ ^${TASK_PREFIX}([0-9]+)$ ]] || [[ $branch =^t([0-9]+)$ ]]; then
            task_num="${BASH_REMATCH[1]}"
            if [ "$task_num" -gt "$max_num" ]; then
                max_num=$task_num
            fi
        fi
    done < <(git branch -a 2>/dev/null | sed 's/^[* ] //' | sed 's/remotes\/origin\///' | grep -E "^${TASK_PREFIX}[0-9]+$|^t[0-9]+$" || true)
    
    # Проверяем TASKS.md
    if [ -f "$TASKS_FILE" ]; then
        while IFS= read -r line; do
            if [[ $line =~ \|\ *([0-9]+)\ *\| ]]; then
                task_num="${BASH_REMATCH[1]}"
                if [ "$task_num" -gt "$max_num" ]; then
                    max_num=$task_num
                fi
            fi
        done < "$TASKS_FILE"
    fi
    
    echo $((max_num + 1))
}

# Функция для проверки существования ветки
branch_exists() {
    local branch=$1
    git branch -a 2>/dev/null | grep -qE "^\s*${branch}$|remotes/.*/${branch}$" || return 1
}

# Функция для создания новой задачи
create_task() {
    local task_num=$1
    
    if [ -z "$task_num" ]; then
        task_num=$(get_next_task_number)
    fi
    
    # Проверяем что ветка не занята
    local branch_name="${TASK_PREFIX}${task_num}"
    local short_branch="t${task_num}"
    
    if branch_exists "$branch_name" || branch_exists "$short_branch"; then
        error "Ветка $branch_name или $short_branch уже существует!"
        info "Попробуйте другой номер задачи или используйте: ./scripts/task-manager.sh start $(get_next_task_number)"
        exit 1
    fi
    
    # Проверяем что мы на develop
    if [ "$CURRENT_BRANCH" != "develop" ]; then
        warning "Текущая ветка: $CURRENT_BRANCH"
        read -p "Переключиться на develop? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git checkout develop
            git pull origin develop 2>/dev/null || true
            CURRENT_BRANCH="develop"
        else
            error "Создание задачи возможно только от ветки develop"
            exit 1
        fi
    fi
    
    # Создаем ветку
    info "Создание ветки $branch_name от develop..."
    git checkout -b "$branch_name" develop
    
    success "Ветка $branch_name создана!"
    info "Номер задачи: $task_num"
    info "Ветка: $branch_name"
    
    # Обновляем TASKS.md (если файл существует)
    if [ -f "$TASKS_FILE" ]; then
        info "Обновление $TASKS_FILE..."
        # Здесь можно добавить автоматическое обновление статуса задачи
    fi
    
    echo ""
    info "Следующие шаги:"
    echo "  1. Начните разработку"
    echo "  2. Для коммита используйте: ./scripts/task-manager.sh commit 'описание'"
    echo "  3. Формат коммита: T #${task_num} - {type}({scope}): description"
}

# Функция для создания коммита
create_commit() {
    local message=$1
    local task_num
    
    # Определяем номер задачи из текущей ветки
    if [[ $CURRENT_BRANCH =~ ^${TASK_PREFIX}([0-9]+)$ ]]; then
        task_num="${BASH_REMATCH[1]}"
    elif [[ $CURRENT_BRANCH =~ ^t([0-9]+)$ ]]; then
        task_num="${BASH_REMATCH[1]}"
    else
        error "Текущая ветка не является задачей (task-{номер} или t{номер})"
        info "Текущая ветка: $CURRENT_BRANCH"
        read -p "Введите номер задачи вручную: " task_num
    fi
    
    if [ -z "$message" ]; then
        error "Не указано сообщение коммита!"
        info "Использование: ./scripts/task-manager.sh commit 'описание'"
        exit 1
    fi
    
    # Форматируем сообщение коммита
    local commit_message="T #${task_num} - ${message}"
    
    info "Создание коммита..."
    info "Сообщение: $commit_message"
    
    # Проверяем изменения
    if ! git diff --quiet || ! git diff --cached --quiet; then
        git add -A
        git commit -m "$commit_message"
        success "Коммит создан: $commit_message"
    else
        warning "Нет изменений для коммита"
    fi
}

# Функция для показа статуса задачи
show_status() {
    local task_num=$1
    
    if [ -z "$task_num" ]; then
        # Показываем статус текущей задачи
        if [[ $CURRENT_BRANCH =~ ^${TASK_PREFIX}([0-9]+)$ ]] || [[ $CURRENT_BRANCH =~ ^t([0-9]+)$ ]]; then
            task_num="${BASH_REMATCH[1]}"
        else
            error "Не на ветке задачи и не указан номер задачи"
            info "Использование: ./scripts/task-manager.sh status {номер}"
            exit 1
        fi
    fi
    
    info "Статус задачи #$task_num:"
    echo ""
    echo "Ветка: $CURRENT_BRANCH"
    echo "Номер задачи: $task_num"
    
    # Показываем последние коммиты
    echo ""
    info "Последние коммиты:"
    git log --oneline -5 --grep="T #${task_num}" || echo "  (нет коммитов для этой задачи)"
}

# Функция для показа списка задач
list_tasks() {
    info "Список задач:"
    echo ""
    
    if [ -f "$TASKS_FILE" ]; then
        # Парсим TASKS.md и показываем активные задачи
        grep -E "^\|\ *[0-9]+\ *\|" "$TASKS_FILE" | head -20 || echo "  (нет задач в TASKS.md)"
    else
        warning "Файл $TASKS_FILE не найден"
    fi
    
    echo ""
    info "Активные ветки задач:"
    git branch -a 2>/dev/null | grep -E "${TASK_PREFIX}[0-9]+|^t[0-9]+" | sed 's/^/  /' || echo "  (нет активных веток задач)"
}

# Главная функция
main() {
    local command=$1
    shift
    
    case "$command" in
        start)
            create_task "$1"
            ;;
        commit)
            create_commit "$*"
            ;;
        status)
            show_status "$1"
            ;;
        list)
            list_tasks
            ;;
        *)
            echo "Task Manager - Управление задачами для разработки"
            echo ""
            echo "Использование:"
            echo "  ./scripts/task-manager.sh start [номер]     - Создать новую задачу (ветку)"
            echo "  ./scripts/task-manager.sh commit 'message'  - Создать коммит с автоматическим номером задачи"
            echo "  ./scripts/task-manager.sh status [номер]     - Показать статус задачи"
            echo "  ./scripts/task-manager.sh list              - Показать список задач"
            echo ""
            echo "Примеры:"
            echo "  ./scripts/task-manager.sh start              - Создать задачу с автоматическим номером"
            echo "  ./scripts/task-manager.sh start 5            - Создать задачу #5"
            echo "  ./scripts/task-manager.sh commit 'feat(admin): add user management'"
            echo ""
            exit 1
            ;;
    esac
}

main "$@"

