#!/bin/bash

# Script to convert Cyrillic text in MD files to English
# Usage: ./scripts/convert-cyrillic-md.sh

set -e

WORKIX_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[CONVERT]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[CONVERT]${NC} $1"
}

error() {
    echo -e "${RED}[CONVERT]${NC} $1"
}

info() {
    echo -e "${BLUE}[CONVERT]${NC} $1"
}

# Find all MD files with Cyrillic
find_cyrillic_files() {
    find "$WORKIX_ROOT" -name "*.md" -type f | xargs grep -l '[а-яё]' 2>/dev/null || true
}

# Convert common Cyrillic phrases to English
convert_file() {
    local file="$1"
    local temp_file="${file}.tmp"

    info "Converting: $file"

    # Create backup
    cp "$file" "${file}.bak"

    # Common translations
    sed -e 's/Статус:/Status:/g' \
        -e 's/Дата:/Date:/g' \
        -e 's/Версия:/Version:/g' \
        -e 's/Описание:/Description:/g' \
        -e 's/Примечание:/Note:/g' \
        -e 's/Обновлено:/Updated:/g' \
        -e 's/Создано:/Created:/g' \
        -e 's/Автор:/Author:/g' \
        -e 's/Тип:/Type:/g' \
        -e 's/Результат:/Result:/g' \
        -e 's/Цель:/Goal:/g' \
        -e 's/Задача:/Task:/g' \
        -e 's/Проект:/Project:/g' \
        -e 's/Модуль:/Module:/g' \
        -e 's/Сервис:/Service:/g' \
        -e 's/API:/API:/g' \
        -e 's/Конфигурация:/Configuration:/g' \
        -e 's/Настройка:/Setup:/g' \
        -e 's/Установка:/Installation:/g' \
        -e 's/Запуск:/Launch:/g' \
        -e 's/Остановка:/Stop:/g' \
        -e 's/Перезапуск:/Restart:/g' \
        -e 's/Тестирование:/Testing:/g' \
        -e 's/Разработка:/Development:/g' \
        -e 's/Документация:/Documentation:/g' \
        -e 's/Архитектура:/Architecture:/g' \
        -e 's/Структура:/Structure:/g' \
        -e 's/Компоненты:/Components:/g' \
        -e 's/Библиотеки:/Libraries:/g' \
        -e 's/Зависимости:/Dependencies:/g' \
        -e 's/Требования:/Requirements:/g' \
        -e 's/Функции:/Functions:/g' \
        -e 's/Методы:/Methods:/g' \
        -e 's/Параметры:/Parameters:/g' \
        -e 's/Возвращает:/Returns:/g' \
        -e 's/Пример:/Example:/g' \
        -e 's/Использование:/Usage:/g' \
        -e 's/Команды:/Commands:/g' \
        -e 's/Скрипты:/Scripts:/g' \
        -e 's/Файлы:/Files:/g' \
        -e 's/Папки:/Folders:/g' \
        -e 's/Директории:/Directories:/g' \
        -e 's/Путь:/Path:/g' \
        -e 's/URL:/URL:/g' \
        -e 's/Ссылка:/Link:/g' \
        -e 's/Ссылки:/Links:/g' \
        -e 's/Порт:/Port:/g' \
        -e 's/Хост:/Host:/g' \
        -e 's/База данных:/Database:/g' \
        -e 's/Таблица:/Table:/g' \
        -e 's/Схема:/Schema:/g' \
        -e 's/Модель:/Model:/g' \
        -e 's/Контроллер:/Controller:/g' \
        -e 's/Сервис:/Service:/g' \
        -e 's/Репозиторий:/Repository:/g' \
        -e 's/Интерфейс:/Interface:/g' \
        -e 's/Класс:/Class:/g' \
        -e 's/Объект:/Object:/g' \
        -e 's/Массив:/Array:/g' \
        -e 's/Строка:/String:/g' \
        -e 's/Число:/Number:/g' \
        -e 's/Булево:/Boolean:/g' \
        -e 's/Null:/Null:/g' \
        -e 's/Undefined:/Undefined:/g' \
        -e 's/Ошибка:/Error:/g' \
        -e 's/Предупреждение:/Warning:/g' \
        -e 's/Информация:/Info:/g' \
        -e 's/Отладка:/Debug:/g' \
        -e 's/Логи:/Logs:/g' \
        -e 's/Журнал:/Log:/g' \
        -e 's/История:/History:/g' \
        -e 's/Изменения:/Changes:/g' \
        -e 's/Обновления:/Updates:/g' \
        -e 's/Исправления:/Fixes:/g' \
        -e 's/Улучшения:/Improvements:/g' \
        -e 's/Новые функции:/New features:/g' \
        -e 's/Багфиксы:/Bugfixes:/g' \
        -e 's/Рефакторинг:/Refactoring:/g' \
        -e 's/Оптимизация:/Optimization:/g' \
        -e 's/Производительность:/Performance:/g' \
        -e 's/Безопасность:/Security:/g' \
        -e 's/Аутентификация:/Authentication:/g' \
        -e 's/Авторизация:/Authorization:/g' \
        -e 's/Пользователь:/User:/g' \
        -e 's/Пользователи:/Users:/g' \
        -e 's/Роль:/Role:/g' \
        -e 's/Роли:/Roles:/g' \
        -e 's/Права:/Permissions:/g' \
        -e 's/Доступ:/Access:/g' \
        -e 's/Токен:/Token:/g' \
        -e 's/Ключ:/Key:/g' \
        -e 's/Секрет:/Secret:/g' \
        -e 's/Пароль:/Password:/g' \
        -e 's/Логин:/Login:/g' \
        -e 's/Email:/Email:/g' \
        -e 's/Телефон:/Phone:/g' \
        -e 's/Имя:/Name:/g' \
        -e 's/Фамилия:/Surname:/g' \
        -e 's/Профиль:/Profile:/g' \
        -e 's/Настройки:/Settings:/g' \
        -e 's/Конфиг:/Config:/g' \
        -e 's/Переменные:/Variables:/g' \
        -e 's/Окружение:/Environment:/g' \
        -e 's/Среда:/Environment:/g' \
        -e 's/Разработка:/Development:/g' \
        -e 's/Продакшн:/Production:/g' \
        -e 's/Тест:/Test:/g' \
        -e 's/Стейджинг:/Staging:/g' \
        "$file" > "$temp_file"

    # Move temp file to original
    mv "$temp_file" "$file"

    log "Converted: $file"
}

# Main execution
main() {
    log "Starting Cyrillic to English conversion for MD files..."

    log "Finding MD files with Cyrillic text..."
    local files
    files=$(find_cyrillic_files)

    if [ -z "$files" ]; then
        log "No MD files with Cyrillic found."
        return 0
    fi

    local count=0
    while IFS= read -r file; do
        if [ -n "$file" ]; then
            convert_file "$file"
            ((count++))
        fi
    done <<< "$files"

    log "Conversion completed. Processed $count files."
    log "Backup files created with .bak extension"

    warn "Please review the converted files and remove .bak files when satisfied."
}

# Run if called directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
