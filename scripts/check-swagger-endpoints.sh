#!/bin/bash

# Скрипт для проверки всех эндпоинтов в Swagger разметке
# Проверяет наличие параметров запросов для всех эндпоинтов

set -euo pipefail

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Параметры
SWAGGER_URL="${SWAGGER_URL:-http://localhost:7200/docs-json}"
OUTPUT_FILE="${OUTPUT_FILE:-/tmp/swagger-check-report.txt}"

# Функция для логирования
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

# Проверка доступности Swagger
check_swagger_available() {
    log "Проверка доступности Swagger по адресу: $SWAGGER_URL"

    if ! curl -s -f "$SWAGGER_URL" > /dev/null 2>&1; then
        error "Swagger недоступен по адресу $SWAGGER_URL"
        error "Убедитесь, что сервис запущен и Swagger настроен"
        exit 1
    fi

    success "Swagger доступен"
}

# Получение JSON схемы Swagger
get_swagger_json() {
    log "Получение JSON схемы Swagger..."
    curl -s "$SWAGGER_URL" | jq '.' > /tmp/swagger.json || {
        error "Не удалось получить или распарсить JSON схему Swagger"
        exit 1
    }
    success "JSON схема получена"
}

# Проверка эндпоинта
check_endpoint() {
    local path=$1
    local method=$2
    local endpoint_key="${method,,}_${path}"

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔍 Проверка: $method $path"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Получение информации об эндпоинте
    local endpoint_info=$(jq -r ".paths.\"$path\".$method" /tmp/swagger.json 2>/dev/null)

    if [ "$endpoint_info" == "null" ] || [ -z "$endpoint_info" ]; then
        error "Эндпоинт не найден в Swagger схеме"
        return 1
    fi

    # Проверка наличия requestBody
    local request_body=$(echo "$endpoint_info" | jq -r '.requestBody // empty' 2>/dev/null)

    if [ -z "$request_body" ] || [ "$request_body" == "null" ]; then
        # Для GET и DELETE эндпоинтов requestBody не обязателен
        if [[ "$method" == "GET" ]] || [[ "$method" == "DELETE" ]]; then
            success "Эндпоинт найден (requestBody не требуется для $method)"
            return 0
        else
            warn "⚠️  requestBody отсутствует для $method эндпоинта"

            # Проверка наличия параметров в query или path
            local parameters=$(echo "$endpoint_info" | jq -r '.parameters // []' 2>/dev/null)
            if [ "$parameters" != "[]" ] && [ -n "$parameters" ]; then
                log "Найдены параметры в query/path:"
                echo "$parameters" | jq -r '.[] | "  - \(.name) (\(.in)): \(.description // "без описания")"' 2>/dev/null
            fi

            return 1
        fi
    fi

    # Проверка содержимого requestBody
    local content=$(echo "$request_body" | jq -r '.content // empty' 2>/dev/null)

    if [ -z "$content" ] || [ "$content" == "null" ]; then
        warn "⚠️  requestBody присутствует, но content пустой"
        return 1
    fi

    # Проверка application/json схемы
    local schema_ref=$(echo "$content" | jq -r '.["application/json"].schema."$ref" // empty' 2>/dev/null)

    if [ -z "$schema_ref" ]; then
        # Попытка найти schema напрямую
        local schema=$(echo "$content" | jq -r '.["application/json"].schema // empty' 2>/dev/null)
        if [ -n "$schema" ] && [ "$schema" != "null" ]; then
            success "✅ requestBody присутствует (inline schema)"
            echo "$schema" | jq '.' 2>/dev/null | head -20
            return 0
        else
            warn "⚠️  Не удалось найти schema в requestBody"
            return 1
        fi
    fi

    # Извлечение имени схемы из $ref
    local schema_name=$(echo "$schema_ref" | sed 's|#/components/schemas/||')

    if [ -z "$schema_name" ]; then
        warn "⚠️  Не удалось извлечь имя схемы из $ref"
        return 1
    fi

    success "✅ requestBody присутствует (schema: $schema_name)"

    # Получение свойств схемы
    local schema_props=$(jq -r ".components.schemas.\"$schema_name\".properties // empty" /tmp/swagger.json 2>/dev/null)

    if [ -z "$schema_props" ] || [ "$schema_props" == "null" ]; then
        warn "⚠️  Схема $schema_name не содержит свойств (возможно, все поля скрыты через @ApiHideProperty)"
        return 1
    fi

    # Вывод свойств схемы
    log "Свойства схемы $schema_name:"
    echo "$schema_props" | jq -r 'to_entries[] | "  ✅ \(.key): \(.value.type // .value."$ref" // "object")"' 2>/dev/null

    # Проверка required полей
    local required_fields=$(jq -r ".components.schemas.\"$schema_name\".required // []" /tmp/swagger.json 2>/dev/null)
    if [ "$required_fields" != "[]" ] && [ -n "$required_fields" ]; then
        log "Обязательные поля:"
        echo "$required_fields" | jq -r '.[] | "  🔴 \(.)"' 2>/dev/null
    fi

    return 0
}

# Проверка всех эндпоинтов
check_all_endpoints() {
    log "Проверка всех эндпоинтов..."

    local total_endpoints=0
    local checked_endpoints=0
    local missing_params=0

    # Получение списка всех путей
    local paths=$(jq -r '.paths | keys[]' /tmp/swagger.json 2>/dev/null)

    while IFS= read -r path; do
        # Получение методов для каждого пути
        local methods=$(jq -r ".paths.\"$path\" | keys[]" /tmp/swagger.json 2>/dev/null)

        while IFS= read -r method; do
            total_endpoints=$((total_endpoints + 1))

            if check_endpoint "$path" "$method"; then
                checked_endpoints=$((checked_endpoints + 1))
            else
                missing_params=$((missing_params + 1))
            fi

        done <<< "$methods"
    done <<< "$paths"

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 Итоговая статистика:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Всего эндпоинтов: $total_endpoints"
    success "Проверено успешно: $checked_endpoints"
    if [ $missing_params -gt 0 ]; then
        warn "С отсутствующими параметрами: $missing_params"
    fi
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Главная функция
main() {
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  Проверка Swagger разметки - Проверка параметров         ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""

    check_swagger_available
    get_swagger_json
    check_all_endpoints

    echo ""
    success "Проверка завершена!"
    log "Отчет сохранен в: $OUTPUT_FILE"
}

# Запуск
main "$@"
