"""
DevOps Agent с использованием StarCoder2 для кодинга
Специализированный агент для работы с кодом
"""

from autogen import AssistantAgent, UserProxyAgent

# Конфигурация StarCoder2 для кодинга
STARCODER_CONFIG = {
    "model": "starcoder2:3b",
    "base_url": "http://localhost:11434/v1",
    "api_key": "ollama",
    "api_type": "open_ai"
}

# Конфигурация Qwen для общих задач
QWEN_CONFIG = {
    "model": "qwen2.5:7b",
    "base_url": "http://localhost:11434/v1",
    "api_key": "ollama",
    "api_type": "open_ai"
}

# Агент-кодер (использует StarCoder - специализация на коде)
coder = AssistantAgent(
    name="StarCoder",
    system_message="Ты эксперт в написании кода. Специализируешься на чистом, "
                   "оптимизированном и хорошо документированном коде. "
                   "Следуешь best practices и SOLID принципам. "
                   "Пишешь код на Python, TypeScript, JavaScript, Java и других языках.",
    llm_config=STARCODER_CONFIG
)

# Агент-рефакторер (тоже StarCoder)
refactorer = AssistantAgent(
    name="Refactorer",
    system_message="Ты эксперт в рефакторинге кода. Улучшаешь существующий код, "
                   "делаешь его более читаемым, производительным и поддерживаемым. "
                   "Применяешь паттерны проектирования и оптимизации.",
    llm_config=STARCODER_CONFIG
)

# Агент-ревьюер (использует Qwen для лучшего понимания контекста)
reviewer = AssistantAgent(
    name="CodeReviewer",
    system_message="Ты опытный code reviewer. Проверяешь код на качество, "
                   "безопасность, производительность и соответствие стандартам. "
                   "Даешь конструктивную обратную связь.",
    llm_config=QWEN_CONFIG
)

# Агент-тестировщик (Qwen)
tester = AssistantAgent(
    name="Tester",
    system_message="Ты QA инженер. Создаешь unit-тесты, integration-тесты. "
                   "Пишешь тесты на pytest, jest, junit и других фреймворках. "
                   "Проверяешь покрытие кода и edge cases.",
    llm_config=QWEN_CONFIG
)

# Пользовательский агент
user = UserProxyAgent(
    name="Developer",
    human_input_mode="NEVER",
    max_consecutive_auto_reply=10,
    code_execution_config={
        "work_dir": ".",
        "use_docker": False
    }
)

# Примеры использования
if __name__ == "__main__":
    print("🚀 DevOps Agent с StarCoder2 запущен!")
    print("")
    print("🤖 Доступные агенты:")
    print("   - StarCoder (coder): Написание нового кода")
    print("   - Refactorer: Рефакторинг существующего кода")
    print("   - CodeReviewer (reviewer): Code review")
    print("   - Tester: Создание тестов")
    print("")
    print("💡 Примеры использования:")
    print("")
    print("1. Написать новый код:")
    print("   user.initiate_chat(coder, message='Создай REST API для управления пользователями')")
    print("")
    print("2. Отрефакторить код:")
    print("   user.initiate_chat(refactorer, message='Улучши этот код: [код]')")
    print("")
    print("3. Code review:")
    print("   user.initiate_chat(reviewer, message='Проверь этот код: [код]')")
    print("")
    print("4. Написать тесты:")
    print("   user.initiate_chat(tester, message='Создай тесты для этого модуля: [код]')")
    print("")
    print("📊 Модели:")
    print(f"   - Кодинг: {STARCODER_CONFIG['model']}")
    print(f"   - Общие задачи: {QWEN_CONFIG['model']}")

