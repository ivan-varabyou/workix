#!/bin/bash

# Тестовый скрипт для проверки работы api-notifications

echo "=== Тест сервиса уведомлений ==="
echo ""

# Проверка Redis
echo "1. Проверка Redis..."
if docker ps | grep -q redis; then
    echo "   ✅ Redis запущен в Docker"
else
    echo "   ⚠️ Redis не запущен. Запустите: docker-compose up redis"
fi

# Проверка api-notifications
echo ""
echo "2. Проверка api-notifications..."
if ps aux | grep -E "(tsx.*api-notifications|NotificationsService)" | grep -v grep > /dev/null; then
    echo "   ✅ Сервис запущен"
    echo ""
    echo "   Логи процесса:"
    ps aux | grep -E "(tsx.*api-notifications|NotificationsService)" | grep -v grep | head -1
else
    echo "   ⚠️ Сервис не запущен"
    echo ""
    echo "   Запуск:"
    echo "   cd apps/api-notifications && npm run dev"
fi

# Проверка api-auth
echo ""
echo "3. Проверка api-auth (для отправки событий)..."
if ps aux | grep -E "nx serve api-auth" | grep -v grep > /dev/null; then
    echo "   ✅ api-auth запущен"
    echo ""
    echo "   Тест: отправить POST запрос на http://localhost:7200/api-auth/v1/auth/register"
    echo "   Это автоматически создаст событие в очереди"
else
    echo "   ⚠️ api-auth не запущен"
    echo ""
    echo "   Запуск:"
    echo "   npx nx serve api-auth"
fi

echo ""
echo "=== Как проверить работу ==="
echo ""
echo "1. Убедитесь, что запущены:"
echo "   - Redis (docker-compose up redis)"
echo "   - api-notifications (cd apps/api-notifications && npm run dev)"
echo "   - api-auth (npx nx serve api-auth)"
echo ""
echo "2. Отправьте тестовый запрос:"
echo "   curl -X POST http://localhost:7200/api-auth/v1/auth/register \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"test@example.com\",\"name\":\"Test User\",\"password\":\"TestP@ssw0rd123\"}'"
echo ""
echo "3. Проверьте логи api-notifications - должно появиться:"
echo "   [EmailProcessor] Processing email verification for test@example.com"
echo "   [EmailProcessor] ✅ Email verification sent to test@example.com"
echo ""
echo "=== Готово ==="
