# 🤖 DevOps Agent с AutoGen и Ollama

Автоматизированный DevOps агент for разработки и деплоя с usageм AutoGen и локального LLM via Ollama.

## ✅ Статус установки

- ✅ Python 3.10.12 установлен
- ✅ Git установлен
- ✅ Ollama 0.5.7 установлен
- ✅ Виртуальное окрalreadyние создано (`.venv`)
- ✅ AutoGen и зависимости установлены:
  - pyautogen 0.10.0
  - autogen-agentchat 0.7.5
  - autogen-core 0.7.5
  - langchain 1.0.7
  - ollama 0.6.1

## 🚀 Быстрый start

### 1. Активируйте виртуальное окрalreadyние

```bash
source .venv/bin/activate  # Linux/Mac
# или
.venv\Scripts\activate      # Windows
```

### 2. Убедитесь, what Ollama запущен

```bash
# Проверьте версию
ollama --version

# Запустите Ollama service (если не запущен)
ollama serve
```

### 3. Установите model LLM

```bash
# Установите model Qwen 32B (рекомендуется)
ollama pull qwen:32b

# Или используйте более легкую model for тестирования
ollama pull qwen:7b
```

### 4. Запустите агента

```bash
cd agents
python devops_agent.py
```

## 📝 Usage агентов

### Базовое usage

```python
from devops_agent import coder, tester, user

# Попросите кодера создать код
user.initiate_chat(
    coder,
    message="Создай new service for авторизации users"
)

# Попросите тестировщика создать тесты
user.initiate_chat(
    tester,
    message="Создай unit-тесты for serviceа авторизации"
)
```

### Интерактивный mode

Измените `human_input_mode` в `UserProxyAgent` на `"ALWAYS"` for интерактивного modeа:

```python
user = UserProxyAgent(
    name="User",
    human_input_mode="ALWAYS",  # Интерактивный mode
    max_consecutive_auto_reply=10,
    code_execution_config={
        "work_dir": ".",
        "use_docker": False
    }
)
```

## 🔧 Конфигурация

### Изменение модели

Отредактируйте `OLLAMA_CONFIG` в `devops_agent.py`:

```python
OLLAMA_CONFIG = {
    "model": "ollama/qwen:7b",  # Используйте другую model
    "base_url": "http://localhost:11434/v1",
    "api_key": "ollama"
}
```

### Доступные модели Ollama

- `qwen:32b` - Большая model, betterе качество (требует many памяти)
- `qwen:14b` - Средняя model, хороший баланс
- `qwen:7b` - Легкая model, быстрая работа
- `llama2:13b` - Альтернативная model
- `mistral:7b` - Быстрая и эффективная model

## 📚 Дополнительные resources

- [AutoGen Documentation](https://microsoft.github.io/autogen/)
- [Ollama Documentation](https://ollama.ai/docs/)
- [LangChain Documentation](https://python.langchain.com/)

## 🐛 Решение проблем

### Ollama не launchается

```bash
# Проверьте, запущен ли process
ps aux | grep ollama

# Запустите вручную
ollama serve
```

### Модель не загружается

```bash
# Проверьте доступное место на диске
df -h

# Попробуйте более легкую model
ollama pull qwen:7b
```

### Ошибки импорта AutoGen

```bash
# Убедитесь, what виртуальное окрalreadyние активировано
source .venv/bin/activate

# Переустановите зависимости
pip install --upgrade pyautogen langchain ollama
```

## 🎯 Следующие шаги

1. Настройте агентов under ваши задачи
2. Добавьте дополнительные агенты (DevOps, Code Reviewer и т.д.)
3. Интегрируйте с CI/CD пайплайнами
4. Настройте monitoring и logging
