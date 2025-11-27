#!/bin/bash
set -e

echo "🧪 Запуск Gateway E2E тестов"
echo ""

# Проверяем Gateway
echo "📡 Проверяю Gateway (http://localhost:7101)..."
if curl -s http://localhost:7101/api/v1/auth/health > /dev/null 2>&1; then
  echo "✅ Gateway доступен"
else
  echo "❌ Gateway не доступен. Запустите: npm run api:gateway"
  exit 1
fi

echo ""
echo "🚀 Запускаю тест: registration.spec.ts"
echo ""

# Запускаем тест с таймаутом
timeout 60 npx vitest run apps-e2e/src/gateway/registration.spec.ts \
  --config apps-e2e/vitest.config.gateway.ts \
  --reporter=verbose \
  --no-coverage \
  2>&1 | tee /tmp/gateway-e2e-registration.log

EXIT_CODE=${PIPESTATUS[0]}

if [ $EXIT_CODE -eq 0 ]; then
  echo ""
  echo "✅ Тест registration.spec.ts прошел успешно"
else
  echo ""
  echo "❌ Тест registration.spec.ts завершился с ошибкой (код: $EXIT_CODE)"
  echo "📋 Лог: /tmp/gateway-e2e-registration.log"
fi

exit $EXIT_CODE



