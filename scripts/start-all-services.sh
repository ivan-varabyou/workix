#!/bin/bash
# Скрипт для запуска всех API сервисов Workix

set -e

cd "$(dirname "$0")/.."

echo "🚀 Запуск всех API сервисов Workix..."
echo ""

# Экспорт общих переменных окружения
export NODE_ENV=development
export REDIS_HOST=localhost
export REDIS_PORT=5900
export REDIS_PASSWORD=
export SERVICE_KEY=dev-service-key
export JWT_SECRET=dev-jwt-secret-minimum-32-characters-long-for-security
export ADMIN_JWT_SECRET=dev-admin-jwt-secret-minimum-32-characters-long
export GATEWAY_ADMIN_JWT_SECRET=dev-gateway-admin-jwt-secret-minimum-32-characters

# Переменные для каждого сервиса
export DATABASE_URL_ADMIN=postgresql://postgres:postgres@localhost:5100/workix_admin
export DATABASE_URL_GATEWAY=postgresql://postgres:postgres@localhost:5101/workix_gateway
export DATABASE_URL_AUTH=postgresql://postgres:postgres@localhost:5102/workix_auth
export DATABASE_URL_NOTIFICATIONS=postgresql://postgres:postgres@localhost:5103/workix_notifications
export DATABASE_URL_PIPELINES=postgresql://postgres:postgres@localhost:5104/workix_pipelines
export DATABASE_URL_WEBHOOKS=postgresql://postgres:postgres@localhost:5105/workix_webhooks
export DATABASE_URL_WORKFLOWS=postgresql://postgres:postgres@localhost:5106/workix_workflows
export DATABASE_URL_WORKERS=postgresql://postgres:postgres@localhost:5107/workix_workers
export DATABASE_URL_AB_TESTING=postgresql://postgres:postgres@localhost:5108/workix_ab_testing
export DATABASE_URL_AUDIT=postgresql://postgres:postgres@localhost:5109/workix_audit
export DATABASE_URL_INTEGRATIONS=postgresql://postgres:postgres@localhost:5110/workix_integrations

# Порты сервисов
export API_ADMIN_PORT=7100
export API_GATEWAY_PORT=7101
export API_AUTH_PORT=7102
export API_NOTIFICATIONS_PORT=7103
export API_PIPELINES_PORT=7104
export API_WEBHOOKS_PORT=7105
export API_WORKFLOWS_PORT=7106
export API_WORKERS_PORT=7107
export API_AB_TESTING_PORT=7108
export API_AUDIT_PORT=7109
export API_INTEGRATIONS_PORT=7110
export API_GENERATION_PORT=7111

export API_HOST=0.0.0.0

echo "📋 Порядок запуска:"
echo "  1. api-admin (7100)"
echo "  2. api-auth (7102)"
echo "  3. api-notifications (7103)"
echo "  4. api-pipelines (7104)"
echo "  5. api-webhooks (7105)"
echo "  6. api-workflows (7106)"
echo "  7. api-workers (7107)"
echo "  8. api-ab-testing (7108)"
echo "  9. api-audit (7109)"
echo "  10. api-integrations (7110)"
echo "  11. api-generation (7111)"
echo "  12. api-gateway (7101) - последним"
echo ""

# Функция для запуска сервиса
start_service() {
  local service=$1
  local port=$2
  local delay=$3
  local env_vars=$4

  echo "🚀 Запуск $service на порту $port..."

  # Запуск с переменными окружения
  eval "$env_vars" npx nx serve "$service" --port "$port" > "/tmp/${service}.log" 2>&1 &
  local pid=$!
  echo "  PID: $pid"
  sleep "$delay"

  # Проверка запуска
  local max_attempts=5
  local attempt=0
  while [ $attempt -lt $max_attempts ]; do
    if curl -s -o /dev/null -w "%{http_code}" --max-time 3 "http://localhost:${port}/health" 2>/dev/null | grep -q "200\|404"; then
      echo "  ✅ $service запущен успешно"
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 2
  done

  echo "  ⚠️  $service запускается (проверка через $delay сек)..."
  return 1
}

# Запуск сервисов по порядку с переменными окружения
start_service "api-admin" "7100" "8" "DATABASE_URL_ADMIN=\"$DATABASE_URL_ADMIN\" API_ADMIN_PORT=7100 REDIS_HOST=\"$REDIS_HOST\" REDIS_PORT=\"$REDIS_PORT\" ADMIN_JWT_SECRET=\"$ADMIN_JWT_SECRET\" SERVICE_KEY=\"$SERVICE_KEY\" NODE_ENV=\"$NODE_ENV\""
start_service "api-auth" "7102" "8" "DATABASE_URL_AUTH=\"$DATABASE_URL_AUTH\" API_AUTH_PORT=7102 REDIS_HOST=\"$REDIS_HOST\" REDIS_PORT=\"$REDIS_PORT\" JWT_SECRET=\"$JWT_SECRET\" SERVICE_KEY=\"$SERVICE_KEY\" NODE_ENV=\"$NODE_ENV\""
start_service "api-notifications" "7103" "8" "DATABASE_URL_NOTIFICATIONS=\"$DATABASE_URL_NOTIFICATIONS\" DATABASE_URL_AUTH=\"$DATABASE_URL_AUTH\" API_NOTIFICATIONS_PORT=7103 REDIS_HOST=\"$REDIS_HOST\" REDIS_PORT=\"$REDIS_PORT\" SERVICE_KEY=\"$SERVICE_KEY\" NODE_ENV=\"$NODE_ENV\""
start_service "api-pipelines" "7104" "8" "DATABASE_URL_PIPELINES=\"$DATABASE_URL_PIPELINES\" API_PIPELINES_PORT=7104 REDIS_HOST=\"$REDIS_HOST\" REDIS_PORT=\"$REDIS_PORT\" SERVICE_KEY=\"$SERVICE_KEY\" NODE_ENV=\"$NODE_ENV\""
start_service "api-webhooks" "7105" "8" "DATABASE_URL_WEBHOOKS=\"$DATABASE_URL_WEBHOOKS\" API_WEBHOOKS_PORT=7105 REDIS_HOST=\"$REDIS_HOST\" REDIS_PORT=\"$REDIS_PORT\" SERVICE_KEY=\"$SERVICE_KEY\" NODE_ENV=\"$NODE_ENV\""
start_service "api-workflows" "7106" "8" "DATABASE_URL_WORKFLOWS=\"$DATABASE_URL_WORKFLOWS\" API_WORKFLOWS_PORT=7106 REDIS_HOST=\"$REDIS_HOST\" REDIS_PORT=\"$REDIS_PORT\" SERVICE_KEY=\"$SERVICE_KEY\" NODE_ENV=\"$NODE_ENV\""
start_service "api-workers" "7107" "8" "DATABASE_URL_WORKERS=\"$DATABASE_URL_WORKERS\" API_WORKERS_PORT=7107 REDIS_HOST=\"$REDIS_HOST\" REDIS_PORT=\"$REDIS_PORT\" SERVICE_KEY=\"$SERVICE_KEY\" NODE_ENV=\"$NODE_ENV\""
start_service "api-ab-testing" "7108" "8" "DATABASE_URL_AB_TESTING=\"$DATABASE_URL_AB_TESTING\" API_AB_TESTING_PORT=7108 REDIS_HOST=\"$REDIS_HOST\" REDIS_PORT=\"$REDIS_PORT\" SERVICE_KEY=\"$SERVICE_KEY\" NODE_ENV=\"$NODE_ENV\""
start_service "api-audit" "7109" "8" "DATABASE_URL_AUDIT=\"$DATABASE_URL_AUDIT\" API_AUDIT_PORT=7109 REDIS_HOST=\"$REDIS_HOST\" REDIS_PORT=\"$REDIS_PORT\" SERVICE_KEY=\"$SERVICE_KEY\" NODE_ENV=\"$NODE_ENV\""
start_service "api-integrations" "7110" "8" "DATABASE_URL_INTEGRATIONS=\"$DATABASE_URL_INTEGRATIONS\" API_INTEGRATIONS_PORT=7110 REDIS_HOST=\"$REDIS_HOST\" REDIS_PORT=\"$REDIS_PORT\" SERVICE_KEY=\"$SERVICE_KEY\" NODE_ENV=\"$NODE_ENV\""
start_service "api-generation" "7111" "8" "API_GENERATION_PORT=7111 REDIS_HOST=\"$REDIS_HOST\" REDIS_PORT=\"$REDIS_PORT\" SERVICE_KEY=\"$SERVICE_KEY\" NODE_ENV=\"$NODE_ENV\""
start_service "api-gateway" "7101" "10" "DATABASE_URL_GATEWAY=\"$DATABASE_URL_GATEWAY\" API_PORT=7101 API_GATEWAY_PORT=7101 REDIS_HOST=\"$REDIS_HOST\" REDIS_PORT=\"$REDIS_PORT\" SERVICE_KEY=\"$SERVICE_KEY\" NODE_ENV=\"$NODE_ENV\""

echo ""
echo "⏳ Ожидание полного запуска всех сервисов..."
sleep 15

echo ""
echo "📊 Финальная проверка статуса:"
echo ""

for port in 7100 7102 7103 7104 7105 7106 7107 7108 7109 7110 7111 7101; do
  if curl -s -o /dev/null -w "%{http_code}" --max-time 3 "http://localhost:${port}/health" 2>/dev/null | grep -q "200\|404"; then
    echo "  ✅ Порт $port: работает"
  else
    echo "  ❌ Порт $port: не отвечает"
    echo "     Логи: /tmp/api-*.log"
  fi
done

echo ""
echo "✅ Запуск завершен!"
echo ""
echo "📚 Swagger документация:"
echo "  • api-admin: http://localhost:7100/docs"
echo "  • api-gateway: http://localhost:7101/docs"
echo "  • api-auth: http://localhost:7102/docs"
echo ""
echo "💡 Для просмотра логов: tail -f /tmp/api-*.log"
