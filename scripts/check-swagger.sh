#!/bin/bash

# Проверка доступности и корректности Swagger схемы
# Использование: ./scripts/check-swagger.sh [api-url]

set -e

API_URL="${1:-http://localhost:7000/api/docs-json}"
TEMP_JSON="/tmp/swagger-check.json"

echo "🔍 Проверка Swagger схемы..."
echo "📡 URL: $API_URL"
echo ""

# Проверяем доступность
echo "1️⃣ Проверка доступности API..."
if curl -s -f "$API_URL" > "$TEMP_JSON" 2>/dev/null; then
  echo "✅ API доступен"
else
  echo "❌ API недоступен на $API_URL"
  echo ""
  echo "💡 Убедитесь, что API сервер запущен:"
  echo "   npm run api:monolith"
  echo "   или"
  echo "   nx serve api-monolith"
  exit 1
fi

# Проверяем структуру JSON
echo ""
echo "2️⃣ Проверка структуры JSON..."
if command -v jq >/dev/null 2>&1; then
  if jq empty "$TEMP_JSON" 2>/dev/null; then
    echo "✅ JSON валидный"
  else
    echo "❌ JSON невалидный"
    exit 1
  fi
else
  # Проверяем базовую структуру без jq
  if grep -q "openapi\|swagger" "$TEMP_JSON" 2>/dev/null; then
    echo "✅ JSON содержит OpenAPI поля (jq не установлен, базовая проверка)"
  else
    echo "❌ JSON не содержит OpenAPI полей"
    exit 1
  fi
fi

# Проверяем наличие обязательных полей OpenAPI
echo ""
echo "3️⃣ Проверка структуры OpenAPI..."
if command -v jq >/dev/null 2>&1; then
  HAS_OPENAPI=$(jq -r '.openapi // .swagger // empty' "$TEMP_JSON" 2>/dev/null)
  HAS_INFO=$(jq -r '.info // empty' "$TEMP_JSON" 2>/dev/null)
  HAS_PATHS=$(jq -r '.paths // empty' "$TEMP_JSON" 2>/dev/null)
  HAS_COMPONENTS=$(jq -r '.components // empty' "$TEMP_JSON" 2>/dev/null)

  if [ -n "$HAS_OPENAPI" ]; then
    echo "✅ OpenAPI версия: $HAS_OPENAPI"
  else
    echo "⚠️  Поле 'openapi' или 'swagger' не найдено"
  fi

  if [ -n "$HAS_INFO" ]; then
    TITLE=$(jq -r '.info.title // "N/A"' "$TEMP_JSON" 2>/dev/null)
    VERSION=$(jq -r '.info.version // "N/A"' "$TEMP_JSON" 2>/dev/null)
    echo "✅ Info: $TITLE v$VERSION"
  else
    echo "❌ Поле 'info' не найдено"
    exit 1
  fi

  if [ -n "$HAS_PATHS" ]; then
    PATH_COUNT=$(jq -r '.paths | length' "$TEMP_JSON" 2>/dev/null)
    echo "✅ Paths: $PATH_COUNT endpoints"
  else
    echo "❌ Поле 'paths' не найдено"
    exit 1
  fi

  if [ -n "$HAS_COMPONENTS" ]; then
    SCHEMA_COUNT=$(jq -r '.components.schemas | length // 0' "$TEMP_JSON" 2>/dev/null)
    echo "✅ Components: $SCHEMA_COUNT schemas"
  else
    echo "⚠️  Поле 'components' не найдено (может быть пустым)"
  fi

  # Проверяем примеры endpoints
  echo ""
  echo "4️⃣ Примеры endpoints:"
  jq -r '.paths | keys | .[0:5] | .[]' "$TEMP_JSON" 2>/dev/null | while read -r path; do
    METHODS=$(jq -r ".paths[\"$path\"] | keys | join(\", \")" "$TEMP_JSON" 2>/dev/null)
    echo "   $path [$METHODS]"
  done

  # Проверяем примеры schemas
  echo ""
  echo "5️⃣ Примеры schemas:"
  jq -r '.components.schemas | keys | .[0:5] | .[]' "$TEMP_JSON" 2>/dev/null | while read -r schema; do
    echo "   $schema"
  done || echo "   (schemas не найдены)"
else
  # Базовая проверка без jq
  echo "⚠️  jq не установлен, выполняется базовая проверка..."
  if grep -q '"openapi"\|"swagger"' "$TEMP_JSON" 2>/dev/null; then
    echo "✅ Найдено поле 'openapi' или 'swagger'"
  fi
  if grep -q '"info"' "$TEMP_JSON" 2>/dev/null; then
    echo "✅ Найдено поле 'info'"
  else
    echo "❌ Поле 'info' не найдено"
    exit 1
  fi
  if grep -q '"paths"' "$TEMP_JSON" 2>/dev/null; then
    PATH_COUNT=$(grep -o '"paths"' "$TEMP_JSON" | wc -l)
    echo "✅ Найдено поле 'paths'"
  else
    echo "❌ Поле 'paths' не найдено"
    exit 1
  fi
  echo ""
  echo "💡 Установите 'jq' для более детальной проверки: sudo apt install jq"
fi

echo ""
echo "✅ Swagger схема корректна и готова к генерации типов!"
echo ""
echo "📦 Для генерации типов выполните:"
echo "   npm run generate:api-types:monolith"
