#!/bin/bash

# Скрипт для очистки временных MD файлов
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
DAYS_THRESHOLD=${1:-7}  # По умолчанию 7 дней

echo -e "${BLUE}🧹 Очистка временных MD файлов${NC}\n"

deleted=0
skipped=0

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

# Функция для удаления временного файла
delete_temp_file() {
    local file="$1"
    local reason="$2"

    if [ ! -f "$file" ]; then
        return
    fi

    local age=$(get_file_age_days "$file")

    if [ $age -gt $DAYS_THRESHOLD ]; then
        rm "$file"
        echo -e "${GREEN}✓${NC} Удален: $(basename "$file") (${age} дней) - ${reason}"
        ((deleted++))
    else
        echo -e "${BLUE}⊘${NC} Пропущен (новый): $(basename "$file") (${age} дней)"
        ((skipped++))
    fi
}

# 1. Временные файлы (удаляются сразу)
echo -e "${YELLOW}🗑️  Временные файлы${NC}"
for file in TEMP_*.md *_TEMP.md; do
    if [ -f "$file" ]; then
        rm "$file"
        echo -e "${GREEN}✓${NC} Удален: $(basename "$file") - временный файл"
        ((deleted++))
    fi
done

# 2. Отчеты о тестировании (через 7 дней)
echo -e "\n${YELLOW}🧪 Отчеты о тестировании${NC}"
for file in TEST_*.md *_TEST.md TESTING_*.md *_TESTING.md; do
    if [ -f "$file" ]; then
        delete_temp_file "$file" "отчет о тестировании"
    fi
done

# 3. Временные отчеты (через 7 дней)
echo -e "\n${YELLOW}📊 Временные отчеты${NC}"
for file in REPORT_*.md *_REPORT.md CHECK_*.md *_CHECK.md; do
    if [ -f "$file" ] && [ "$(basename "$file")" != "README.md" ]; then
        delete_temp_file "$file" "временный отчет"
    fi
done

# 4. Очистка пустых папок
echo -e "\n${YELLOW}📁 Очистка пустых папок${NC}"
find . -type d -empty -name "check-results" -exec rmdir {} \; 2>/dev/null || true

echo -e "\n${GREEN}✅ Очистка завершена!${NC}"
echo -e "   Удалено: ${GREEN}${deleted}${NC} файлов"
echo -e "   Пропущено: ${YELLOW}${skipped}${NC} файлов"
