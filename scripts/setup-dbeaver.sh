#!/bin/bash
# Скрипт для настройки DBeaver подключений ко всем базам данных Workix

set -e

WORKIX_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
  echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

print_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

print_status "Настройка DBeaver для Workix микросервисов..."

# Определяем OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  DBEAVER_CONFIG_DIR="$HOME/.dbeaver/General/.dbeaver"
  DBEAVER_DATA_SOURCES="$DBEAVER_CONFIG_DIR/data-sources.json"
elif [[ "$OSTYPE" == "darwin"* ]]; then
  DBEAVER_CONFIG_DIR="$HOME/.dbeaver/General/.dbeaver"
  DBEAVER_DATA_SOURCES="$DBEAVER_CONFIG_DIR/data-sources.json"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  DBEAVER_CONFIG_DIR="$APPDATA/DBeaverData/workspace6/General/.dbeaver"
  DBEAVER_DATA_SOURCES="$DBEAVER_CONFIG_DIR/data-sources.json"
else
  print_error "Неподдерживаемая ОС: $OSTYPE"
  exit 1
fi

# Проверяем, установлен ли DBeaver
if ! command -v dbeaver &> /dev/null && ! command -v dbeaver-ce &> /dev/null; then
  print_warn "DBeaver не найден в PATH"
  print_status "Установите DBeaver:"
  echo "  Linux: sudo snap install dbeaver-ce"
  echo "  или скачайте с https://dbeaver.io/download/"
  echo ""
  print_status "После установки запустите этот скрипт снова"
  exit 1
fi

print_success "DBeaver найден"

# Создаем директорию конфигурации, если не существует
if [ ! -d "$DBEAVER_CONFIG_DIR" ]; then
  print_status "Создание директории конфигурации DBeaver..."
  mkdir -p "$DBEAVER_CONFIG_DIR"
  print_success "Директория создана: $DBEAVER_CONFIG_DIR"
fi

# Читаем существующие подключения, если файл существует
if [ -f "$DBEAVER_DATA_SOURCES" ]; then
  print_status "Найдены существующие подключения DBeaver"
  print_warn "Резервная копия будет создана: ${DBEAVER_DATA_SOURCES}.backup"
  cp "$DBEAVER_DATA_SOURCES" "${DBEAVER_DATA_SOURCES}.backup"
fi

# Генерируем конфигурацию подключений
print_status "Генерация конфигурации подключений..."

# Массив баз данных
declare -a DATABASES=(
  "admin:5100:workix_admin"
  "gateway:5101:workix_gateway"
  "auth:5102:workix_auth"
  "notifications:5103:workix_notifications"
  "pipelines:5104:workix_pipelines"
  "webhooks:5105:workix_webhooks"
  "workflows:5106:workix_workflows"
  "workers:5107:workix_workers"
  "ab-testing:5108:workix_ab_testing"
  "audit:5109:workix_audit"
  "integrations:5110:workix_integrations"
)

# Начинаем JSON файл
echo "{" > "$DBEAVER_DATA_SOURCES"
echo '  "connections": [' >> "$DBEAVER_DATA_SOURCES"

# Генерируем подключения
for i in "${!DATABASES[@]}"; do
  IFS=':' read -r name port database <<< "${DATABASES[$i]}"

  # Генерируем UUID для подключения
  if command -v uuidgen &> /dev/null; then
    CONNECTION_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
  elif command -v python3 &> /dev/null; then
    CONNECTION_ID=$(python3 -c "import uuid; print(uuid.uuid4())")
  else
    CONNECTION_ID="workix-${name}-$(date +%s | sha256sum | head -c 32)"
  fi

  # Добавляем запятую, если не последний элемент
  if [ $i -lt $((${#DATABASES[@]} - 1)) ]; then
    COMMA=","
  else
    COMMA=""
  fi

  cat >> "$DBEAVER_DATA_SOURCES" << EOF
    {
      "id": "${CONNECTION_ID}",
      "name": "workix-${name}",
      "type": "postgresql",
      "configuration": {
        "host": "localhost",
        "port": "${port}",
        "database": "${database}",
        "authType": "native",
        "user": "postgres",
        "password": "postgres",
        "savePassword": true,
        "showSystemObjects": false,
        "showUtilityObjects": false
      },
      "description": "${name^} microservice database",
      "folder": "Workix"
    }${COMMA}
EOF
done

echo "  ]" >> "$DBEAVER_DATA_SOURCES"
echo "}" >> "$DBEAVER_DATA_SOURCES"

print_success "Конфигурация создана: $DBEAVER_DATA_SOURCES"
print_status "Добавлено подключений: ${#DATABASES[@]}"

echo ""
print_success "✅ Настройка завершена!"
echo ""
print_status "Откройте DBeaver и обновите список подключений (F5)"
print_status "Все подключения будут в папке 'Workix'"
echo ""
print_status "Подключения:"
for db in "${DATABASES[@]}"; do
  IFS=':' read -r name port database <<< "$db"
  echo "  - workix-${name} (localhost:${port}/${database})"
done
