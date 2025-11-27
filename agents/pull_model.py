#!/usr/bin/env python3
"""
Скрипт для загрузки модели Ollama через агента ModelManager
Использование: python agents/pull_model.py [model_name]
"""

import sys
from devops_agent_complete import pull_ollama_model, model_manager, user

def main():
    """Главная функция"""
    # Получить имя модели из аргументов или использовать по умолчанию
    model_name: str = sys.argv[1] if len(sys.argv) > 1 else "qwen:32b"

    print(f"\n🚀 Загрузка модели Ollama через агента ModelManager")
    print(f"📦 Модель: {model_name}\n")

    # Использовать функцию для загрузки модели
    pull_ollama_model(model_name)

    print("\n" + "=" * 60)
    print("✅ Готово! Проверь результат:")
    print(f"   ollama list")
    print(f"   ollama show {model_name}")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    main()


















