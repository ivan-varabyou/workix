#!/bin/bash

# Запуск Cursor IDE Agent с Ollama
# Использование: ./scripts/start-cursor-agent.sh

set -e

echo "🚀 Запуск Cursor IDE Agent с Ollama"
echo ""

# Проверка Ollama
echo "🔍 Проверка Ollama..."
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "❌ Ollama не запущен. Запустите: ollama serve"
    exit 1
fi
echo "✅ Ollama запущен"

# Проверка модели
echo ""
echo "📦 Проверка модели llama3.1:8b-instruct-q4_K_M..."
if ! ollama list | grep -q "llama3.1:8b-instruct-q4_K_M"; then
    echo "⚠️  Модель не найдена. Загружаю..."
    ollama pull llama3.1:8b-instruct-q4_K_M
fi
echo "✅ Модель установлена"

# Активация виртуального окружения
if [ -d ".venv" ]; then
    echo ""
    echo "🐍 Активация виртуального окружения..."
    source .venv/bin/activate
fi

# Установка переменных окружения
export OLLAMA_BASE_URL="http://localhost:11434/v1"
export OLLAMA_MODEL="llama3.1:8b-instruct-q4_K_M"
export AUTOGEN_TEMPERATURE="0.7"

# Запуск агента
echo ""
echo "🤖 Запуск агента..."
echo ""
python agents/cursor_agent.py
