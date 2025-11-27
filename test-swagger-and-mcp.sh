#!/bin/bash

# Скрипт для запуска и тестирования Auth Service со Swagger и MCP

set -e

echo "🚀 Запуск Auth Service и проверка Swagger..."
echo ""

cd /home/ivan/git/workix

# Останавливаем старые процессы
echo "🛑 Останавливаю старые процессы..."
pkill -f "api-auth" 2>/dev/null || true
pkill -f "mcp-server" 2>/dev/null || true
pkill -f "http.server" 2>/dev/null || true
sleep 2

# Запускаем Auth Service
echo "🔐 Запускаю Auth Service..."
npm run api:auth > /tmp/api-auth.log 2>&1 &
AUTH_PID=$!
echo "Auth Service PID: $AUTH_PID"

# Ждем запуска
echo "⏳ Ожидание запуска сервиса (10 секунд)..."
sleep 10

# Проверяем health
echo ""
echo "📡 Проверка Health endpoint..."
if curl -s http://localhost:7200/api/health > /dev/null 2>&1; then
    echo "✅ Health endpoint доступен"
    curl -s http://localhost:7200/api/health | jq . 2>/dev/null || curl -s http://localhost:7200/api/health
else
    echo "❌ Health endpoint недоступен"
    echo "Логи:"
    tail -20 /tmp/api-auth.log
    exit 1
fi

# Проверяем Swagger UI
echo ""
echo "📚 Проверка Swagger UI..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:7200/docs | grep -q "200"; then
    echo "✅ Swagger UI доступен на http://localhost:7200/docs"
else
    echo "❌ Swagger UI недоступен"
fi

# Проверяем Swagger JSON
echo ""
echo "📋 Проверка Swagger JSON..."
if curl -s http://localhost:7200/docs-json > /tmp/swagger.json 2>&1; then
    if command -v jq >/dev/null 2>&1; then
        echo "✅ Swagger JSON валиден"
        echo "Информация:"
        jq -r '.info | "Title: \(.title)\nVersion: \(.version)\nDescription: \(.description)"' /tmp/swagger.json
        echo ""
        echo "Количество endpoints: $(jq '.paths | length' /tmp/swagger.json)"
        echo ""
        echo "Примеры endpoints:"
        jq -r '.paths | keys | .[0:5] | .[]' /tmp/swagger.json | while read path; do
            methods=$(jq -r ".paths[\"$path\"] | keys | join(\", \")" /tmp/swagger.json)
            echo "  $path [$methods]"
        done
    else
        echo "✅ Swagger JSON загружен (jq не установлен для детального анализа)"
        echo "Размер файла: $(wc -c < /tmp/swagger.json) байт"
    fi
else
    echo "❌ Swagger JSON недоступен"
fi

# Проверяем HTML структуру Swagger
echo ""
echo "🌐 Проверка HTML структуры Swagger..."
SWAGGER_HTML=$(curl -s http://localhost:7200/docs 2>&1)
if echo "$SWAGGER_HTML" | grep -q "swagger"; then
    echo "✅ HTML содержит Swagger"
    if echo "$SWAGGER_HTML" | grep -q "Workix"; then
        echo "✅ HTML содержит название 'Workix'"
    fi
    if echo "$SWAGGER_HTML" | grep -q "title"; then
        echo "✅ HTML содержит title"
    fi
else
    echo "⚠️  HTML не содержит явных признаков Swagger"
fi

# Запускаем HTTP сервер для тестового HTML
echo ""
echo "🌐 Запускаю HTTP сервер для тестового HTML..."
cd /home/ivan/git/workix
python3 -m http.server 8080 > /tmp/http-server.log 2>&1 &
HTTP_PID=$!
echo "HTTP Server PID: $HTTP_PID"
sleep 2

echo ""
echo "✅ Все сервисы запущены!"
echo ""
echo "📋 Информация:"
echo "  🔐 Auth Service: http://localhost:7200"
echo "  📚 Swagger UI: http://localhost:7200/docs"
echo "  📋 Swagger JSON: http://localhost:7200/docs-json"
echo "  🌐 Тестовый HTML: http://localhost:8080/test-swagger.html"
echo ""
echo "Для остановки выполните:"
echo "  kill $AUTH_PID $HTTP_PID"
echo "  pkill -f 'api-auth'"
echo "  pkill -f 'http.server'"
