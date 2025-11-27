#!/usr/bin/env python3
"""
Тест подключения к Ollama API
Проверяет правильность формата запросов
"""

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")
MODEL = os.getenv("OLLAMA_MODEL", "llama3.1:8b-instruct-q4_K_M")

def test_ollama_connection():
    """Тест подключения к Ollama"""
    print(f"🔍 Тестирование подключения к Ollama...")
    print(f"   Base URL: {OLLAMA_BASE_URL}")
    print(f"   Model: {MODEL}")
    print()

    # Тест 1: Проверка доступности API
    print("1️⃣ Проверка доступности API...")
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/models", timeout=5)
        if response.status_code == 200:
            models = response.json()
            print(f"   ✅ API доступен")
            print(f"   📦 Доступные модели: {len(models.get('data', []))}")
            for model in models.get('data', []):
                print(f"      - {model.get('id')}")
        else:
            print(f"   ❌ Ошибка: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Ошибка подключения: {e}")
        return False

    print()

    # Тест 2: Проверка формата запроса chat/completions
    print("2️⃣ Тест запроса chat/completions...")
    try:
        payload = {
            "model": MODEL,
            "messages": [
                {"role": "user", "content": "Hello, say hi!"}
            ],
            "stream": False,
            "temperature": 0.7
        }

        response = requests.post(
            f"{OLLAMA_BASE_URL}/chat/completions",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )

        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Запрос успешен")
            print(f"   💬 Ответ: {result.get('choices', [{}])[0].get('message', {}).get('content', 'N/A')[:100]}")
            return True
        else:
            print(f"   ❌ Ошибка: {response.status_code}")
            print(f"   📄 Ответ: {response.text}")
            return False

    except Exception as e:
        print(f"   ❌ Ошибка: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 Тест подключения Ollama API")
    print("=" * 60)
    print()

    success = test_ollama_connection()

    print()
    print("=" * 60)
    if success:
        print("✅ Все тесты пройдены!")
        print("   Ollama API работает корректно")
    else:
        print("❌ Тесты не пройдены")
        print("   Проверьте настройки Ollama")
    print("=" * 60)














