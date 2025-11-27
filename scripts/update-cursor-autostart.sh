#!/bin/bash

# Скрипт для обновления автозапуска Cursor на последнюю версию
# Использование: sudo ./scripts/update-cursor-autostart.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🔄 Обновление автозапуска Cursor..."

# Найти последнюю версию Cursor в Soft
LATEST_CURSOR=$(ls -t ~/Soft/Cursor-*.AppImage 2>/dev/null | head -1)

if [ -z "$LATEST_CURSOR" ]; then
    echo "❌ Не найдена установка Cursor в ~/Soft/"
    exit 1
fi

LATEST_VERSION=$(basename "$LATEST_CURSOR")
echo "✅ Найдена последняя версия: $LATEST_VERSION"

# Обновить автозапуск пользователя
AUTOSTART_FILE="$HOME/.config/autostart/cursor.desktop"
if [ -f "$AUTOSTART_FILE" ]; then
    # Обновить путь в автозапуске
    sed -i "s|Exec=.*|Exec=$LATEST_CURSOR|" "$AUTOSTART_FILE"
    echo "✅ Обновлен файл автозапуска: $AUTOSTART_FILE"
else
    echo "⚠️  Файл автозапуска не найден: $AUTOSTART_FILE"
fi

# Обновить системный desktop файл (требует sudo)
SYSTEM_DESKTOP="/usr/share/applications/cursor.desktop"
if [ -f "$SYSTEM_DESKTOP" ] && [ "$EUID" -eq 0 ]; then
    sed -i "s|Exec=.*|Exec=$LATEST_CURSOR|" "$SYSTEM_DESKTOP"
    echo "✅ Обновлен системный desktop файл: $SYSTEM_DESKTOP"
elif [ -f "$SYSTEM_DESKTOP" ] && [ "$EUID" -ne 0 ]; then
    echo "⚠️  Для обновления системного файла требуется sudo:"
    echo "   sudo sed -i 's|Exec=.*|Exec=$LATEST_CURSOR|' $SYSTEM_DESKTOP"
fi

# Обновить базу данных desktop файлов
update-desktop-database ~/.local/share/applications 2>/dev/null || true

echo ""
echo "✅ Автозапуск Cursor обновлен на версию: $LATEST_VERSION"
echo "🔄 Перезагрузите систему или перезапустите сессию для применения изменений"


