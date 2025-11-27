#!/bin/bash
# Комплексный скрипт для настройки и запуска всех сервисов

set -e

cd "$(dirname "$0")/.."

echo "🚀 Настройка всех API сервисов Workix..."
echo ""

# Функция для настройки Prisma сервиса
setup_prisma_service() {
  local service=$1
  local db_url_var=$2
  local db_url=$3

  echo "📦 Настройка Prisma для $service..."
  export "$db_url_var=$db_url"

  cd "apps/$service"

  # Генерация Prisma клиента
  if [ -f "prisma/schema.prisma" ]; then
    echo "  ➕ Генерация Prisma клиента..."
    eval "$db_url_var=\"$db_url\"" npx prisma generate --schema=./prisma/schema.prisma 2>&1 | grep -v "Environment variables loaded" | grep -v "Prisma schema loaded" || true

    echo "  🔄 Синхронизация базы данных..."
    eval "$db_url_var=\"$db_url\"" npx prisma db push --schema=./prisma/schema.prisma --skip-generate 2>&1 | grep -v "Environment variables loaded" | grep -v "Prisma schema loaded" || true

    echo "  ✅ $service настроен"
  else
    echo "  ⚠️  Prisma schema не найден для $service"
  fi

  cd ../..
}

# Настройка всех сервисов
echo "📊 Настройка Prisma для всех сервисов..."
echo ""

setup_prisma_service "api-admin" "DATABASE_URL_ADMIN" "postgresql://postgres:postgres@localhost:5100/workix_admin"
setup_prisma_service "api-gateway" "DATABASE_URL_GATEWAY" "postgresql://postgres:postgres@localhost:5101/workix_gateway"
setup_prisma_service "api-auth" "DATABASE_URL_AUTH" "postgresql://postgres:postgres@localhost:5102/workix_auth"
# api-notifications не имеет schema.prisma, использует PrismaService из infrastructure
setup_prisma_service "api-pipelines" "DATABASE_URL_PIPELINES" "postgresql://postgres:postgres@localhost:5104/workix_pipelines"
setup_prisma_service "api-webhooks" "DATABASE_URL_WEBHOOKS" "postgresql://postgres:postgres@localhost:5105/workix_webhooks"
setup_prisma_service "api-workflows" "DATABASE_URL_WORKFLOWS" "postgresql://postgres:postgres@localhost:5106/workix_workflows"
setup_prisma_service "api-workers" "DATABASE_URL_WORKERS" "postgresql://postgres:postgres@localhost:5107/workix_workers"
setup_prisma_service "api-ab-testing" "DATABASE_URL_AB_TESTING" "postgresql://postgres:postgres@localhost:5108/workix_ab_testing"
setup_prisma_service "api-audit" "DATABASE_URL_AUDIT" "postgresql://postgres:postgres@localhost:5109/workix_audit"
setup_prisma_service "api-integrations" "DATABASE_URL_INTEGRATIONS" "postgresql://postgres:postgres@localhost:5110/workix_integrations"

echo ""
echo "✅ Все сервисы настроены!"
echo ""
echo "💡 Теперь можно запустить сервисы через: bash scripts/start-all-services.sh"
