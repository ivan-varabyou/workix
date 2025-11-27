#!/bin/bash

# Bulk convert all MD files with Cyrillic to English

cd /home/ivan/git/workix

# Find and convert all MD files with Cyrillic
find . -name "*.md" -type f -exec grep -l '[а-яё]' {} \; 2>/dev/null | while read -r file; do
    echo "Converting: $file"

    # Create backup
    cp "$file" "${file}.bak" 2>/dev/null || continue

    # Apply common translations
    sed -i \
        -e 's/Статус:/Status:/g' \
        -e 's/Дата:/Date:/g' \
        -e 's/Версия:/Version:/g' \
        -e 's/Описание:/Description:/g' \
        -e 's/Примечание:/Note:/g' \
        -e 's/Обновлено:/Updated:/g' \
        -e 's/Создано:/Created:/g' \
        -e 's/Автор:/Author:/g' \
        -e 's/Результат:/Result:/g' \
        -e 's/Цель:/Goal:/g' \
        -e 's/Задача:/Task:/g' \
        -e 's/Проект:/Project:/g' \
        -e 's/Конфигурация:/Configuration:/g' \
        -e 's/Настройка:/Setup:/g' \
        -e 's/Установка:/Installation:/g' \
        -e 's/Запуск:/Launch:/g' \
        -e 's/Тестирование:/Testing:/g' \
        -e 's/Разработка:/Development:/g' \
        -e 's/Документация:/Documentation:/g' \
        -e 's/Архитектура:/Architecture:/g' \
        -e 's/Структура:/Structure:/g' \
        -e 's/Функции:/Functions:/g' \
        -e 's/Использование:/Usage:/g' \
        -e 's/Команды:/Commands:/g' \
        -e 's/Файлы:/Files:/g' \
        -e 's/Ошибка:/Error:/g' \
        -e 's/Предупреждение:/Warning:/g' \
        -e 's/Информация:/Info:/g' \
        -e 's/Изменения:/Changes:/g' \
        -e 's/Обновления:/Updates:/g' \
        -e 's/Исправления:/Fixes:/g' \
        -e 's/Рефакторинг:/Refactoring:/g' \
        -e 's/Оптимизация:/Optimization:/g' \
        -e 's/Безопасность:/Security:/g' \
        -e 's/Пользователь:/User:/g' \
        -e 's/Пользователи:/Users:/g' \
        -e 's/Роль:/Role:/g' \
        -e 's/Роли:/Roles:/g' \
        -e 's/Доступ:/Access:/g' \
        -e 's/Токен:/Token:/g' \
        -e 's/Ключ:/Key:/g' \
        -e 's/Пароль:/Password:/g' \
        -e 's/Логин:/Login:/g' \
        -e 's/Профиль:/Profile:/g' \
        -e 's/Настройки:/Settings:/g' \
        -e 's/Переменные:/Variables:/g' \
        -e 's/Окружение:/Environment:/g' \
        -e 's/готово/ready/g' \
        -e 's/завершено/completed/g' \
        -e 's/выполнено/done/g' \
        -e 's/успешно/successfully/g' \
        -e 's/ошибка/error/g' \
        -e 's/предупреждение/warning/g' \
        -e 's/информация/information/g' \
        -e 's/начало/start/g' \
        -e 's/конец/end/g' \
        -e 's/процесс/process/g' \
        -e 's/система/system/g' \
        -e 's/приложение/application/g' \
        -e 's/компонент/component/g' \
        -e 's/модуль/module/g' \
        -e 's/сервис/service/g' \
        -e 's/клиент/client/g' \
        -e 's/сервер/server/g' \
        -e 's/база данных/database/g' \
        -e 's/таблица/table/g' \
        -e 's/запрос/request/g' \
        -e 's/ответ/response/g' \
        -e 's/метод/method/g' \
        -e 's/параметр/parameter/g' \
        -e 's/значение/value/g' \
        -e 's/тип/type/g' \
        -e 's/объект/object/g' \
        -e 's/массив/array/g' \
        -e 's/строка/string/g' \
        -e 's/число/number/g' \
        -e 's/булево/boolean/g' \
        "$file"

    echo "Converted: $file"
done

echo "Bulk conversion completed!"
echo "Backup files created with .bak extension"
