#!/bin/bash
# Скрипт для установки DBeaver и настройки подключений

set -e

WORKIX_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
  echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

print_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

print_status "Установка DBeaver для Workix..."

# Проверяем, установлен ли DBeaver
if command -v dbeaver &> /dev/null || command -v dbeaver-ce &> /dev/null; then
  print_success "DBeaver уже установлен"
else
  print_status "Установка DBeaver через snap..."
  if command -v snap &> /dev/null; then
    sudo snap install dbeaver-ce
    print_success "DBeaver установлен"
  else
    print_error "Snap не установлен"
    print_status "Установите DBeaver вручную:"
    echo "  - Скачайте с https://dbeaver.io/download/"
    echo "  - Или установите snap: sudo apt install snapd"
    exit 1
  fi
fi

# Запускаем скрипт настройки
print_status "Настройка подключений..."
cd "$WORKIX_ROOT"
npm run db:dbeaver:setup

print_success "✅ DBeaver установлен и настроен!"
echo ""
print_status "Запустите DBeaver:"
echo "  dbeaver"
echo ""
print_status "Все подключения будут в папке 'Workix'"
print_status "Обновите список подключений (F5) после запуска DBeaver"

