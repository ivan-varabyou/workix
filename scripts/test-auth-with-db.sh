#!/bin/bash
# Скрипт для запуска тестов api-auth с реальной базой данных
# Использование: ./scripts/test-auth-with-db.sh [security|integration|all]

set -e

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Параметры
TEST_TYPE=${1:-all}
DB_URL="postgresql://postgres:postgres@localhost:5437/workix_auth_test"
CONTAINER_NAME="workix-postgres-test-auth"

# Функция для вывода статуса
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

print_status "🧪 Запуск тестов api-auth с реальной БД"
print_status "📋 Тип тестов: $TEST_TYPE"
echo ""

# Шаг 1: Запуск БД
print_status "📦 Шаг 1/4: Запуск тестовой БД..."
if ! docker ps | grep -q "$CONTAINER_NAME"; then
  print_warning "   Контейнер не запущен, запускаю..."
  if docker-compose -f docker-compose.test-auth.yml up -d > /dev/null 2>&1; then
    print_success "   Контейнер БД запущен"
  else
    print_error "   Не удалось запустить контейнер БД"
    exit 1
  fi
else
  print_success "   БД уже запущена"
fi

# Шаг 2: Проверка готовности БД
echo ""
print_status "🔍 Шаг 2/4: Проверка готовности БД..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if docker exec "$CONTAINER_NAME" pg_isready -U postgres > /dev/null 2>&1; then
    print_success "   БД готова к работе"
    break
  fi

  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    print_error "   БД не запустилась за $MAX_RETRIES попыток"
    exit 1
  fi

  if [ $((RETRY_COUNT % 5)) -eq 0 ]; then
    echo -e "   ${YELLOW}⏳${NC} Ожидание БД... ($RETRY_COUNT/$MAX_RETRIES)"
  fi
  sleep 1
done

# Шаг 3: Применение миграций
echo ""
print_status "🔄 Шаг 3/4: Применение миграций Prisma..."
cd apps/api-auth

export DATABASE_URL_AUTH="$DB_URL"
export DATABASE_URL_AUTH_TEST="$DB_URL"

# Проверяем наличие схемы
if [ ! -f "prisma/schema.prisma" ]; then
  print_error "   Prisma схема не найдена: apps/api-auth/prisma/schema.prisma"
  exit 1
fi

# Применяем схему
print_status "   Применяю схему к БД..."
if npx prisma db push --schema=./prisma/schema.prisma --skip-generate > /tmp/prisma-push.log 2>&1; then
  print_success "   Миграции применены успешно"
else
  print_warning "   Ошибка при применении миграций (возможно, схема уже применена)"
  cat /tmp/prisma-push.log | tail -3
fi

cd ../..

# Шаг 4: Запуск тестов
echo ""
print_status "🧪 Шаг 4/4: Запуск тестов..."
echo ""

export DATABASE_URL_AUTH_TEST="$DB_URL"
export USE_REAL_DB_FOR_SECURITY_TESTS="true"

START_TIME=$(date +%s)

case $TEST_TYPE in
  security)
    print_status "   Запускаю security тесты..."
    if nx test api-auth --testPathPattern="security" --run 2>&1 | tee /tmp/test-output.log; then
      TEST_RESULT=0
    else
      TEST_RESULT=$?
    fi
    ;;
  integration)
    print_status "   Запускаю integration тесты..."
    if nx test api-auth --testPathPattern="integration" --run 2>&1 | tee /tmp/test-output.log; then
      TEST_RESULT=0
    else
      TEST_RESULT=$?
    fi
    ;;
  all)
    print_status "   Запускаю все тесты..."
    if nx test api-auth --run 2>&1 | tee /tmp/test-output.log; then
      TEST_RESULT=0
    else
      TEST_RESULT=$?
    fi
    ;;
  *)
    print_error "   Неизвестный тип тестов: $TEST_TYPE"
    echo "   Использование: ./scripts/test-auth-with-db.sh [security|integration|all]"
    exit 1
    ;;
esac

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Проверяем наличие ошибок в выводе
HAS_FAILURES=false
if grep -q "FAIL\|failed" /tmp/test-output.log; then
  HAS_FAILURES=true
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $TEST_RESULT -eq 0 ] && [ "$HAS_FAILURES" = false ]; then
  print_success "Тесты завершены успешно за ${DURATION}с"

  # Показываем краткую статистику
  if grep -q "Test Files" /tmp/test-output.log; then
    echo ""
    print_status "📊 Статистика:"
    grep -E "(Test Files|Tests )" /tmp/test-output.log | tail -2 | sed 's/^/   /'
  fi
else
  print_error "Тесты завершены с ошибками за ${DURATION}с"

  # Показываем статистику
  if grep -q "Test Files" /tmp/test-output.log; then
    echo ""
    print_status "📊 Статистика:"
    grep -E "(Test Files|Tests )" /tmp/test-output.log | tail -2 | sed 's/^/   /'
  fi

  # Показываем ошибки
  if grep -q "FAIL\|Error\|×" /tmp/test-output.log; then
    echo ""
    print_status "❌ Ошибки:"
    grep -E "(FAIL|Error|×)" /tmp/test-output.log | head -5 | sed 's/^/   /'
  fi
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Возвращаем код ошибки, если есть проблемы
if [ $TEST_RESULT -ne 0 ] || [ "$HAS_FAILURES" = true ]; then
  exit 1
else
  exit 0
fi
