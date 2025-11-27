#!/bin/bash
set -e

echo "🧪 Запуск E2E тестов Auth Service"
echo ""

cd /home/ivan/git/workix

# Проверяем доступность сервиса
echo "🔍 Проверка Auth Service..."
if curl -s http://localhost:7200/api/auth/health > /dev/null 2>&1; then
    echo "✅ Auth Service доступен"
else
    echo "⚠️  Auth Service не запущен"
    echo "💡 Запускаю Auth Service..."
    npm run api:auth > /tmp/auth-service.log 2>&1 &
    AUTH_PID=$!
    echo "Auth Service PID: $AUTH_PID"

    # Ждем запуска
    for i in {1..30}; do
        if curl -s http://localhost:7200/api/auth/health > /dev/null 2>&1; then
            echo "✅ Auth Service запущен"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "❌ Auth Service не запустился"
            cat /tmp/auth-service.log
            exit 1
        fi
        sleep 1
    done
fi

echo ""
echo "🚀 Запуск тестов..."
echo ""

export AUTH_SERVICE_URL="http://localhost:7200"
export AUTH_SERVICE_PORT="7200"

npx vitest run apps-e2e/src/auth/auth.spec.ts --config apps-e2e/vitest.config.auth.ts --reporter=verbose

echo ""
echo "✅ Тесты завершены!"
