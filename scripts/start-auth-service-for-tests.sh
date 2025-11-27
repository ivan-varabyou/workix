#!/bin/bash
# Скрипт для запуска api-auth сервиса для E2E тестов
# Использование: ./scripts/start-auth-service-for-tests.sh

set -e

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Параметры
SERVICE_PORT="7102"
SERVICE_URL="http://localhost:${SERVICE_PORT}"
HEALTH_ENDPOINT="${SERVICE_URL}/api-auth/v1/auth/health"

# Функции для вывода
print_status() {
  echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

print_status "🚀 Запуск api-auth сервиса для E2E тестов"
echo ""

# Переход в корень проекта
cd "$(dirname "$0")/.."

# Проверка, запущен ли сервис
if curl -s "$HEALTH_ENDPOINT" > /dev/null 2>&1; then
  print_success "   Сервис уже запущен на порту $SERVICE_PORT"
  exit 0
fi

# Проверка порта
if lsof -Pi :$SERVICE_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
  print_warning "   Порт $SERVICE_PORT занят другим процессом"
  exit 1
fi

# Запуск сервиса в фоне
print_status "   Запускаю сервис..."
npx nx serve api-auth > /tmp/api-auth-test.log 2>&1 &
SERVICE_PID=$!

# Ожидание запуска
print_status "   Ожидание запуска сервиса..."
MAX_RETRIES=60
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if curl -s "$HEALTH_ENDPOINT" > /dev/null 2>&1; then
    print_success "   Сервис запущен (PID: $SERVICE_PID)"
    echo ""
    echo "📋 Информация:"
    echo "   • URL: $SERVICE_URL"
    echo "   • Health: $HEALTH_ENDPOINT"
    echo "   • PID: $SERVICE_PID"
    echo "   • Логи: /tmp/api-auth-test.log"
    echo ""
    echo "💡 Для остановки: kill $SERVICE_PID"
    exit 0
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  sleep 1
done

# Если не запустился
print_error "   Сервис не запустился за $MAX_RETRIES секунд"
print_error "   Проверьте логи: tail -f /tmp/api-auth-test.log"
kill $SERVICE_PID 2>/dev/null || true
exit 1
