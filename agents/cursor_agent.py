"""
Cursor IDE Agent с использованием Ollama
Использует llama3.1:8b-instruct-q4_K_M для работы в IDE
"""

from autogen import AssistantAgent, UserProxyAgent
import os
from dotenv import load_dotenv

# Загрузить переменные окружения
load_dotenv()

# Конфигурация LLM для Ollama с llama3.1:8b-instruct-q4_K_M
OLLAMA_CONFIG = {
    "model": os.getenv("OLLAMA_MODEL", "llama3.1:8b-instruct-q4_K_M"),
    "base_url": os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1"),
    "api_key": "ollama",
    "api_type": "open_ai",
    "temperature": float(os.getenv("AUTOGEN_TEMPERATURE", "0.7")),
    "timeout": 300,
    "max_retries": 3,
}

# ==================== АГЕНТЫ ====================

# Агент-кодер (использует llama3.1:8b-instruct-q4_K_M)
coder = AssistantAgent(
    name="Coder",
    system_message="""Ты опытный TypeScript/NestJS/Angular разработчик для проекта Workix.

Твои задачи:
- Писать чистый, документированный код
- Следовать best practices проекта Workix
- Создавать качественные решения с типизацией
- Использовать современные паттерны (DI, Repository, etc.)
- Обеспечивать 100% покрытие типов
- Следовать правилам из .specify/specs-optimized/core/development.md

Стиль кода:
- TypeScript strict mode
- Explicit return types
- Interfaces в отдельных файлах
- eslint и prettier compliant
- Комментарии на русском для документации
- НЕ использовать: as, any, as unknown, ! (non-null assertion)
- Использовать unknown вместо any, затем type guards
- Искать существующие интерфейсы перед созданием новых

Проект:
- NX monorepo
- Вся бизнес-логика в libs/
- apps/ только контроллеры и подключение из libs
- Минимум 85% покрытие для shared библиотек
""",
    llm_config=OLLAMA_CONFIG
)

# Агент-тестировщик
tester = AssistantAgent(
    name="Tester",
    system_message="""Ты QA инженер для проекта Workix.

Твои задачи:
- Создавать unit-тесты (Vitest для backend, Jest для frontend)
- Создавать integration-тесты
- Создавать E2E тесты
- Проверять покрытие кода (минимум 70%, 85%+ для shared libs)
- Использовать Storybook для UI компонентов

Требования:
- Минимум 85% покрытие для shared библиотек
- Vitest для backend тестов
- Jest для frontend тестов
- Storybook для UI компонентов
""",
    llm_config=OLLAMA_CONFIG
)

# Агент-ревьюер кода
reviewer = AssistantAgent(
    name="Reviewer",
    system_message="""Ты code reviewer для проекта Workix.

Твои задачи:
- Проверять соответствие кода правилам проекта
- Проверять типизацию (нет as, any, as unknown, !)
- Проверять архитектуру (логика в libs/, не в apps/)
- Проверять покрытие тестами
- Проверять соответствие SOLID принципам
- Проверять использование i18n (нет хардкода текста)

Правила:
- См. .specify/specs-optimized/core/development.md
- См. .specify/specs-optimized/core/git-workflow.md
- См. .specify/specs-optimized/process/testing.md
""",
    llm_config=OLLAMA_CONFIG
)

# Пользовательский агент
user = UserProxyAgent(
    name="User",
    human_input_mode="NEVER",
    max_consecutive_auto_reply=10,
    code_execution_config={
        "work_dir": ".",
        "use_docker": False
    }
)

# Пример использования
if __name__ == "__main__":
    print("🚀 Cursor IDE Agent запущен!")
    print(f"📦 Модель: {OLLAMA_CONFIG['model']}")
    print("📝 Доступные агенты:")
    print("   - coder: для написания кода")
    print("   - tester: для создания тестов")
    print("   - reviewer: для code review")
    print("   - user: для взаимодействия с агентами")
    print("\nПримеры:")
    print("  user.initiate_chat(coder, message='Создай новый сервис для авторизации')")
    print("  user.initiate_chat(tester, message='Создай тесты для AuthService')")
    print("  user.initiate_chat(reviewer, message='Проверь код в libs/domain/auth')")
