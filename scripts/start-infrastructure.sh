#!/bin/bash
# Скрипт для запуска всех баз данных и Redis

set -e

echo "🚀 Запуск инфраструктуры Workix..."
echo ""

# Переход в корень проекта
cd "$(dirname "$0")/.."

echo "📊 Запуск баз данных и Redis..."
docker-compose up -d redis postgres-gateway postgres-monolith postgres-auth postgres-notifications

echo ""
echo "⏳ Ожидание готовности сервисов..."
sleep 5

echo ""
echo "✅ Проверка статуса:"
echo ""

# Проверка Redis
if docker exec workix-redis redis-cli ping > /dev/null 2>&1; then
    echo "  ✅ Redis: работает (порт 5900)"
else
    echo "  ❌ Redis: не отвечает"
fi

# Проверка баз данных
for db in "workix_gateway:workix-postgres-gateway:5000" "workix_monolith:workix-postgres-monolith:5101" "workix_auth:workix-postgres-auth:5102" "workix_notifications:workix-postgres-notifications:5103"; do
    name=$(echo $db | cut -d: -f1)
    container=$(echo $db | cut -d: -f2)
    port=$(echo $db | cut -d: -f3)
    
    if docker exec $container psql -U postgres -d $name -c "SELECT 1;" > /dev/null 2>&1; then
        echo "  ✅ $name: работает (порт $port)"
    else
        echo "  ❌ $name: недоступна"
    fi
done

echo ""
echo "✅ Инфраструктура запущена!"
echo ""
echo "📋 Порты:"
echo "  • Redis: 5900"
echo "  • Gateway БД: 5000"
echo "  • Monolith БД: 5101"
echo "  • Auth БД: 5102"
echo "  • Notifications БД: 5103"
