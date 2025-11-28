#!/bin/bash

# Скрипт для организации MD файлов в проекте Workix
# Версия: 1.0
# Дата: 2025-01-27

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Создаем необходимые папки
mkdir -p .docs/architecture
mkdir -p .docs/guides
mkdir -p .docs/api
mkdir -p .docs/archive/migrations
mkdir -p .docs/archive/refactoring
mkdir -p .docs/archive/analysis
mkdir -p .docs/archive/plans
mkdir -p .docs/archive/structure
mkdir -p .docs/reports

echo -e "${BLUE}📁 Организация MD файлов в проекте Workix${NC}\n"

# Функция для перемещения файла с логированием
move_file() {
    local src="$1"
    local dst="$2"
    local reason="$3"

    if [ -f "$src" ]; then
        mv "$src" "$dst"
        echo -e "${GREEN}✓${NC} Перемещен: $(basename "$src") → $reason"
    fi
}

# Функция для проверки, является ли файл исключением
is_exception() {
    local file="$1"
    case "$(basename "$file")" in
        README.md|TASKS.md|SPECKIT_COMMANDS.md)
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Счетчики
moved=0
skipped=0

# 1. Архитектурная документация
echo -e "${YELLOW}🏗️  Архитектурная документация${NC}"
for file in ARCHITECTURE_*.md APPLICATION_ARCHITECTURE.md; do
    if [ -f "$file" ] && ! is_exception "$file"; then
        move_file "$file" ".docs/architecture/$(basename "$file")" "архитектура"
        ((moved++))
    fi
done

# 2. Миграции (в архив)
echo -e "\n${YELLOW}🔄 Миграции${NC}"
for file in MIGRATION_*.md MIGRATION_*.md COMPREHENSIVE_MIGRATION_*.md DATABASE_PORTS_MIGRATION.md; do
    if [ -f "$file" ] && ! is_exception "$file"; then
        move_file "$file" ".docs/archive/migrations/$(basename "$file")" "архив миграций"
        ((moved++))
    fi
done

# 3. Структура библиотек (в архив)
echo -e "\n${YELLOW}📚 Структура библиотек${NC}"
for file in LIBS_STRUCTURE_*.md LIBS_SHARED_*.md; do
    if [ -f "$file" ] && ! is_exception "$file"; then
        move_file "$file" ".docs/archive/structure/$(basename "$file")" "архив структуры"
        ((moved++))
    fi
done

# 4. Анализ и дублирование (в архив)
echo -e "\n${YELLOW}🔍 Анализ${NC}"
for file in *_ANALYSIS.md DUPLICATION_*.md PORTS_AND_DATABASES_*.md; do
    if [ -f "$file" ] && ! is_exception "$file"; then
        move_file "$file" ".docs/archive/analysis/$(basename "$file")" "архив анализа"
        ((moved++))
    fi
done

# 5. Планы (в архив, если старые)
echo -e "\n${YELLOW}📋 Планы${NC}"
for file in PLAN_*.md AI_MIGRATION_PLAN.md AUTOGEN_QUICKSTART.md; do
    if [ -f "$file" ] && ! is_exception "$file"; then
        # Проверяем дату модификации (старше 30 дней = архив)
        if [ "$(uname)" = "Darwin" ]; then
            # macOS
            file_age=$(($(date +%s) - $(stat -f %m "$file")))
        else
            # Linux
            file_age=$(($(date +%s) - $(stat -c %Y "$file")))
        fi
        days_old=$((file_age / 86400))

        if [ $days_old -gt 30 ]; then
            move_file "$file" ".docs/archive/plans/$(basename "$file")" "архив планов (${days_old} дней)"
            ((moved++))
        else
            echo -e "${BLUE}⊘${NC} Пропущен (новый): $(basename "$file") (${days_old} дней)"
            ((skipped++))
        fi
    fi
done

# 6. Руководства
echo -e "\n${YELLOW}📖 Руководства${NC}"
for file in README-DB-*.md EXAMPLES_*.md; do
    if [ -f "$file" ] && ! is_exception "$file"; then
        move_file "$file" ".docs/guides/$(basename "$file")" "руководства"
        ((moved++))
    fi
done

# 7. Уведомления и архитектура сервисов
echo -e "\n${YELLOW}🔔 Архитектура сервисов${NC}"
for file in NOTIFICATIONS_*.md; do
    if [ -f "$file" ] && ! is_exception "$file"; then
        move_file "$file" ".docs/architecture/$(basename "$file")" "архитектура"
        ((moved++))
    fi
done

# 8. Результаты проверок (временные, в reports)
echo -e "\n${YELLOW}📊 Отчеты${NC}"
if [ -d "check-results" ]; then
    for file in check-results/*.md; do
        if [ -f "$file" ]; then
            move_file "$file" ".docs/reports/$(basename "$file")" "отчеты"
            ((moved++))
        fi
    done
    # Удаляем пустую папку
    rmdir check-results 2>/dev/null || true
fi

echo -e "\n${GREEN}✅ Организация завершена!${NC}"
echo -e "   Перемещено: ${GREEN}${moved}${NC} файлов"
echo -e "   Пропущено: ${YELLOW}${skipped}${NC} файлов"
echo -e "\n${BLUE}💡 Следующие шаги:${NC}"
echo -e "   - Проверьте перемещенные файлы"
echo -e "   - Обновите ссылки в README файлах"
echo -e "   - Запустите: ${YELLOW}make docs-archive${NC} для архивации старых файлов"
