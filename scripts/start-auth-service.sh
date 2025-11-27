#!/bin/bash
# Скрипт для запуска Auth сервиса с базой данных
# Использование: ./scripts/start-auth-service.sh [dev|prod]

set -e

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Параметры
MODE=${1:-dev}
WORKIX_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONTAINER_NAME="workix-postgres-auth"
DB_PORT=5200

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

print_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# Проверка режима
if [ "$MODE" != "dev" ] && [ "$MODE" != "prod" ]; then
  print_error "Неверный режим. Используйте: dev или prod"
  echo "Использование: $0 [dev|prod]"
  exit 1
fi

print_status "Запуск Auth сервиса в режиме: $MODE"

# Шаг 1: Запуск базы данных
print_status "Проверка базы данных..."
if docker ps | grep -q "$CONTAINER_NAME"; then
  print_success "База данных уже запущена"
else
  print_status "Запуск базы данных..."
  cd "$WORKIX_ROOT"
  docker-compose up -d postgres-auth

  # Ждем готовности базы
  print_status "Ожидание готовности базы данных..."
  sleep 3

  # Проверка подключения
  if docker exec "$CONTAINER_NAME" pg_isready -U postgres > /dev/null 2>&1; then
    print_success "База данных готова"
  else
    print_error "База данных не готова"
    exit 1
  fi
fi

# Шаг 2: Подготовка Prisma
print_status "Генерация Prisma Client..."
cd "$WORKIX_ROOT/apps/api-auth"
npx prisma generate --schema=./prisma/schema.prisma
print_success "Prisma Client сгенерирован"

# Шаг 3: Применение миграций/схемы
if [ "$MODE" = "dev" ]; then
  print_status "Применение схемы базы данных (db push)..."
  DATABASE_URL_AUTH=postgresql://postgres:postgres@localhost:$DB_PORT/workix_auth \
    npx prisma db push --skip-generate --schema=./prisma/schema.prisma
  print_success "Схема базы данных применена"
else
  print_status "Применение миграций (migrate deploy)..."
  DATABASE_URL_AUTH=postgresql://postgres:postgres@localhost:$DB_PORT/workix_auth \
    npx prisma migrate deploy --schema=./prisma/schema.prisma
  print_success "Миграции применены"
fi

# Шаг 4: Запуск сервиса
cd "$WORKIX_ROOT"

if [ "$MODE" = "dev" ]; then
  print_status "Запуск сервиса в режиме разработки..."
  print_warn "Сервис будет запущен в фоновом режиме с hot-reload"
  cd apps/api-auth
  npm run dev &
  DEV_PID=$!
  print_success "Сервис запущен (PID: $DEV_PID)"
  print_status "Логи будут выводиться в консоль"
  print_status "Для остановки используйте: kill $DEV_PID"
  wait $DEV_PID
else
  print_status "Сборка сервиса для production..."
  npm run api:auth:build

  if [ ! -f "dist/apps/api-auth/main.js" ]; then
    print_error "Сборка не удалась - файл dist/apps/api-auth/main.js не найден"
    exit 1
  fi
  print_success "Сборка завершена"

  print_status "Запуск сервиса в production режиме..."
  npm run api:auth:start
fi

