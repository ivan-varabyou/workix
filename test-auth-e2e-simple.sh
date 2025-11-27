#!/bin/bash
set -e

cd /home/ivan/git/workix

echo "🧪 Запуск E2E тестов Auth Service"
echo ""

# Проверяем доступность сервиса
if ! curl -s http://localhost:7200/api/auth/health > /dev/null 2>&1; then
    echo "❌ Auth Service не запущен на http://localhost:7200"
    echo "💡 Запустите в отдельном терминале: npm run api:auth"
    exit 1
fi

echo "✅ Auth Service доступен"
echo ""

# Запускаем тесты
export AUTH_SERVICE_URL="http://localhost:7200"
npx vitest run apps-e2e/src/auth/auth.spec.ts --config apps-e2e/vitest.config.auth.ts
