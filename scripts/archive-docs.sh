#!/bin/bash

# Скрипт для архивации старых MD файлов
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

# Параметры
DAYS_THRESHOLD=${1:-30}  # По умолчанию 30 дней
REPORTS_DAYS=${2:-7}     # Отчеты архивируются через 7 дней

echo -e "${BLUE}📦 Архивация старых MD файлов (>${DAYS_THRESHOLD} дней)${NC}\n"

# Создаем папки архива
mkdir -p .docs/archive/migrations
mkdir -p .docs/archive/refactoring
mkdir -p .docs/archive/analysis
mkdir -p .docs/archive/plans
mkdir -p .docs/archive/reports

archived=0

# Функция для получения возраста файла в днях
get_file_age_days() {
    local file="$1"
    if [ "$(uname)" = "Darwin" ]; then
        # macOS
        file_age=$(($(date +%s) - $(stat -f %m "$file")))
    else
        # Linux
        file_age=$(($(date +%s) - $(stat -c %Y "$file")))
    fi
    echo $((file_age / 86400))
}

# Функция для архивации файла
archive_file() {
    local file="$1"
    local category="$2"
    local threshold="$3"

    if [ ! -f "$file" ]; then
        return
    fi

    local age=$(get_file_age_days "$file")

    if [ $age -gt $threshold ]; then
        local dest=".docs/archive/${category}/$(basename "$file")"
        mv "$file" "$dest"
        echo -e "${GREEN}✓${NC} Архивирован: $(basename "$file") (${age} дней) → ${category}"
        ((archived++))
    fi
}

# 1. Архивация отчетов в .docs/reports (через 7 дней)
echo -e "${YELLOW}📊 Отчеты${NC}"
if [ -d ".docs/reports" ]; then
    for file in .docs/reports/*.md; do
        if [ -f "$file" ]; then
            archive_file "$file" "reports" "$REPORTS_DAYS"
        fi
    done
fi

# 2. Архивация старых планов в корне (если остались)
echo -e "\n${YELLOW}📋 Планы${NC}"
for file in PLAN_*.md AI_MIGRATION_PLAN.md; do
    if [ -f "$file" ]; then
        archive_file "$file" "plans" "$DAYS_THRESHOLD"
    fi
done

# 3. Архивация старых анализов
echo -e "\n${YELLOW}🔍 Анализы${NC}"
for file in *_ANALYSIS.md *_REPORT.md; do
    if [ -f "$file" ] && [ "$(basename "$file")" != "README.md" ]; then
        archive_file "$file" "analysis" "$DAYS_THRESHOLD"
    fi
done

# 4. Создание индекса архива
echo -e "\n${YELLOW}📑 Создание индекса архива${NC}"
cat > .docs/archive/INDEX.md <<EOF
# Архив документации

**Дата создания**: $(date +"%Y-%m-%d %H:%M:%S")
**Порог архивации**: ${DAYS_THRESHOLD} дней

## Структура

- \`migrations/\` - Завершенные миграции
- \`refactoring/\` - Завершенные рефакторинги
- \`analysis/\` - Старые анализы
- \`plans/\` - Устаревшие планы
- \`reports/\` - Старые отчеты (>${REPORTS_DAYS} дней)
- \`structure/\` - Старые документы о структуре

## Статистика

- Всего файлов: $(find .docs/archive -name "*.md" -not -name "INDEX.md" | wc -l)
- Миграции: $(find .docs/archive/migrations -name "*.md" 2>/dev/null | wc -l)
- Рефакторинги: $(find .docs/archive/refactoring -name "*.md" 2>/dev/null | wc -l)
- Анализы: $(find .docs/archive/analysis -name "*.md" 2>/dev/null | wc -l)
- Планы: $(find .docs/archive/plans -name "*.md" 2>/dev/null | wc -l)
- Отчеты: $(find .docs/archive/reports -name "*.md" 2>/dev/null | wc -l)
- Структура: $(find .docs/archive/structure -name "*.md" 2>/dev/null | wc -l)

EOF

echo -e "${GREEN}✓${NC} Индекс архива создан"

echo -e "\n${GREEN}✅ Архивация завершена!${NC}"
echo -e "   Архивировано: ${GREEN}${archived}${NC} файлов"
