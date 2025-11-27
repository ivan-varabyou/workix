#!/usr/bin/env python3
"""Пример использования AutoGen с Ollama"""

import autogen
import os
import sys
from pathlib import Path

# Добавить корень проекта в путь
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from dotenv import load_dotenv

load_dotenv()


def main():
    """Основная функция примера"""

    # Конфигурация для Ollama
    config_list = [
        {
            "model": os.getenv("OLLAMA_MODEL", "qwen2.5:7b"),
            "base_url": os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
            "api_key": "ollama",  # Ollama не требует реальный API ключ
            "api_type": "open_ai",
        }
    ]

    print("🤖 Инициализация AutoGen агентов...")

    # Создание агента-ассистента
    assistant = autogen.AssistantAgent(
        name="assistant",
        llm_config={
            "config_list": config_list,
            "temperature": float(os.getenv("AUTOGEN_TEMPERATURE", "0.7")),
        },
        system_message="Ты полезный AI ассистент для разработки. Отвечай на русском языке.",
    )

    # Создание пользователя-прокси
    user_proxy = autogen.UserProxyAgent(
        name="user_proxy",
        human_input_mode="NEVER",
        max_consecutive_auto_reply=10,
        code_execution_config={
            "work_dir": "coding",
            "use_docker": False,
        },
    )

    print("✅ Агенты созданы успешно!")
    print("\n" + "="*60)
    print("💬 Начало диалога с AI ассистентом")
    print("="*60)
    print()

    # Пример использования
    user_proxy.initiate_chat(
        assistant,
        message="Напиши функцию на Python для вычисления факториала числа. Функция должна быть рекурсивной и иметь обработку ошибок.",
    )

    print("\n" + "="*60)
    print("✅ Диалог завершен!")
    print("="*60)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️ Прервано пользователем")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Ошибка: {e}")
        print("\n📋 Убедитесь, что:")
        print("   - Ollama запущен: ollama serve")
        print("   - Модель скачана: ollama pull qwen2.5:7b")
        print("   - AutoGen установлен: pip install pyautogen")
        sys.exit(1)


