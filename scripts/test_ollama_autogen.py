#!/usr/bin/env python3
"""Тест подключения Ollama и AutoGen"""

import autogen
import os
import sys
from pathlib import Path

# Добавить корень проекта в путь
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from dotenv import load_dotenv

load_dotenv()


def test_ollama_connection():
    """Проверка подключения к Ollama"""
    import requests

    base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    model = os.getenv("OLLAMA_MODEL", "qwen2.5:7b")

    try:
        print(f"🔍 Проверка подключения к Ollama...")
        print(f"   URL: {base_url}")
        print(f"   Модель: {model}")

        response = requests.post(
            f"{base_url}/api/generate",
            json={
                "model": model,
                "prompt": "Привет! Ответь одним словом: работает?",
                "stream": False
            },
            timeout=10
        )

        if response.status_code == 200:
            result = response.json()
            print(f"✅ Ollama подключен успешно!")
            print(f"📝 Ответ модели: {result.get('response', 'N/A')[:100]}")
            return True
        else:
            print(f"❌ Ошибка подключения: {response.status_code}")
            print(f"   Ответ: {response.text[:200]}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ Не удалось подключиться к Ollama")
        print(f"   Убедитесь, что Ollama запущен: ollama serve")
        return False
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return False


def test_autogen():
    """Проверка работы AutoGen"""
    try:
        print(f"\n🔍 Проверка AutoGen...")

        config_list = [
            {
                "model": os.getenv("OLLAMA_MODEL", "qwen2.5:7b"),
                "base_url": os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
                "api_key": "ollama",
                "api_type": "open_ai",
            }
        ]

        assistant = autogen.AssistantAgent(
            name="test_assistant",
            llm_config={"config_list": config_list},
        )

        print("✅ AutoGen инициализирован успешно!")
        return True
    except Exception as e:
        print(f"❌ Ошибка AutoGen: {e}")
        print(f"   Убедитесь, что AutoGen установлен: pip install pyautogen")
        return False


if __name__ == "__main__":
    print("="*60)
    print("🔍 Тестирование Ollama и AutoGen")
    print("="*60)
    print()

    print("1. Проверка Ollama...")
    ollama_ok = test_ollama_connection()

    print("\n2. Проверка AutoGen...")
    autogen_ok = test_autogen()

    print("\n" + "="*60)
    if ollama_ok and autogen_ok:
        print("✅ Все тесты пройдены успешно!")
        print("🚀 Ollama и AutoGen готовы к использованию!")
        sys.exit(0)
    else:
        print("❌ Некоторые тесты не прошли. Проверьте настройки.")
        print("\n📋 Чек-лист:")
        if not ollama_ok:
            print("   - [ ] Ollama установлен: ollama --version")
            print("   - [ ] Ollama запущен: ollama serve")
            print("   - [ ] Модель скачана: ollama pull qwen2.5:7b")
        if not autogen_ok:
            print("   - [ ] AutoGen установлен: pip install pyautogen")
            print("   - [ ] Виртуальное окружение активировано: source .venv/bin/activate")
        sys.exit(1)


