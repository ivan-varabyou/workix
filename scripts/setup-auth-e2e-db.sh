#!/bin/bash
# Скрипт для автоматического запуска БД для E2E тестов api-auth
# Использование: ./scripts/setup-auth-e2e-db.sh

set -e

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Параметры
DB_CONTAINER="workix-postgres-auth"
DB_PORT="5102"
DB_NAME="workix_auth"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}"
DOCKER_COMPOSE_FILE="docker-compose.yml"

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

print_status "🚀 Настройка БД для E2E тестов api-auth"
echo ""

# Проверка Docker
if ! command -v docker &> /dev/null; then
  print_error "Docker не установлен"
  exit 1
fi

# Переход в корень проекта
cd "$(dirname "$0")/.."

# Шаг 1: Проверка и запуск PostgreSQL и Redis
print_status "📦 Шаг 1/4: Проверка PostgreSQL и Redis контейнеров..."

# PostgreSQL
if docker ps -a | grep -q "$DB_CONTAINER"; then
  if docker ps | grep -q "$DB_CONTAINER"; then
    print_success "   Контейнер $DB_CONTAINER уже запущен"
  else
    print_warning "   Контейнер существует, но не запущен. Запускаю..."
    docker start "$DB_CONTAINER" > /dev/null 2>&1
    print_success "   Контейнер запущен"
  fi
else
  print_warning "   Контейнер не найден. Создаю через docker-compose..."
  if docker-compose -f "$DOCKER_COMPOSE_FILE" up -d postgres-auth > /dev/null 2>&1; then
    print_success "   Контейнер создан и запущен"
  else
    print_error "   Не удалось создать контейнер"
    exit 1
  fi
fi

# Redis
REDIS_CONTAINER="workix-redis"
if docker ps -a | grep -q "$REDIS_CONTAINER"; then
  if docker ps | grep -q "$REDIS_CONTAINER"; then
    print_success "   Контейнер $REDIS_CONTAINER уже запущен"
  else
    print_warning "   Контейнер Redis существует, но не запущен. Запускаю..."
    docker start "$REDIS_CONTAINER" > /dev/null 2>&1
    print_success "   Контейнер Redis запущен"
  fi
else
  print_warning "   Контейнер Redis не найден. Создаю через docker-compose..."
  if docker-compose -f "$DOCKER_COMPOSE_FILE" up -d redis > /dev/null 2>&1; then
    print_success "   Контейнер Redis создан и запущен"
  else
    print_warning "   Не удалось создать контейнер Redis (может быть не критично)"
  fi
fi

# Шаг 2: Ожидание готовности БД
print_status "🔍 Шаг 2/4: Ожидание готовности БД..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if docker exec "$DB_CONTAINER" pg_isready -U "$DB_USER" > /dev/null 2>&1; then
    print_success "   БД готова к работе"
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
    sleep 1
  fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  print_error "   БД не готова после $MAX_RETRIES попыток"
  exit 1
fi

# Шаг 3: Проверка Redis
print_status "🔍 Шаг 3/4: Проверка Redis..."
if docker exec "$REDIS_CONTAINER" redis-cli ping > /dev/null 2>&1; then
  print_success "   Redis готов к работе"
else
  print_warning "   Redis не отвечает (может быть не критично для тестов)"
fi

# Шаг 4: Применение миграций Prisma
print_status "🔄 Шаг 4/4: Применение миграций Prisma..."

cd apps/api-auth

if [ -f "prisma/schema.prisma" ]; then
  # Генерация Prisma Client
  if DATABASE_URL_AUTH="$DB_URL" npx prisma generate --schema=./prisma/schema.prisma > /dev/null 2>&1; then
    print_success "   Prisma Client сгенерирован"
  else
    print_warning "   Предупреждение при генерации Prisma Client"
  fi

  # Применение миграций
  if DATABASE_URL_AUTH="$DB_URL" npx prisma db push --skip-generate --schema=./prisma/schema.prisma > /dev/null 2>&1; then
    print_success "   Миграции применены"
  else
    print_warning "   Предупреждение при применении миграций"
  fi
else
  print_warning "   Файл prisma/schema.prisma не найден"
fi

cd ../..

echo ""
print_success "✅ БД настроена и готова к тестированию!"
echo ""
echo "📋 Информация:"
echo "   • Контейнер: $DB_CONTAINER"
echo "   • Порт: $DB_PORT"
echo "   • База данных: $DB_NAME"
echo "   • URL: $DB_URL"
echo ""
