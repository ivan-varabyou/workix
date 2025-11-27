# ⚡ Быстрый start: Офлайн AI DevOps Agent

## 🎯 За 5 минут до полностью функционального офлайн AI агента!

---

## ✅ Checklist установки

### [ ] 1. Проверьте Python
```bash
python3 --version  # Должно быть >= 3.10
```

### [ ] 2. Проверьте Git
```bash
git --version
```

### [ ] 3. Установите Ollama
```bash
# Linux
curl -fsSL https://ollama.com/install.sh | sh

# macOS
brew install ollama

# Windows - скачайте с https://ollama.com/download
```

### [ ] 4. Запустите Ollama
```bash
ollama serve
```
> ✨ Оставьте this terminal открытым!

### [ ] 5. Загрузите model

**Вариант 1: Через агента ModelManager (рекомендуется)**
```python
python agents/pull_model.py qwen:32b
# Или for компактной модели:
python agents/pull_model.py qwen2.5:7b
```

**Вариант 2: Напрямую via Ollama**
```bash
# Компактная model (рекомендуется for начала)
ollama pull qwen2.5:7b

# Или большая model (если exists >= 20GB RAM)
ollama pull qwen:32b
```

**Вариант 3: Через Python интерактивно**
```python
from agents.devops_agent_complete import pull_ollama_model

pull_ollama_model("qwen:32b")
```

### [ ] 6. Проверьте модели
```bash
ollama list
```

### [ ] 7. Создайте виртуальное окрalreadyние
```bash
cd /home/ivan/git/workix
python3 -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate  # Windows
```

### [ ] 8. Установите зависимости
```bash
pip install -r requirements.txt
```

### [ ] 9. Создайте .env file
```bash
cat > .env << 'EOF'
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
AUTOGEN_TEMPERATURE=0.7
EOF
```

### [ ] 10. Протестируйте установку
```bash
python scripts/test_ollama_autogen.py
```

---

## 🚀 Первый launch

### Вариант 1: Автоматический mode
```python
python agents/devops_agent_complete.py
```

### Вариант 2: Интерактивный mode
```python
python3
```

```python
from agents.devops_agent_complete import coder, user

# Дайте задачу агенту
user.initiate_chat(
    coder,
    message="Создай функцию for checks email addressа с тесthereи"
)
```

---

## 💡 Первые задачи

### 1. Простая задача - создать функцию
```python
from agents.devops_agent_complete import coder, user

user.initiate_chat(
    coder,
    message="Создай TypeScript функцию for валидации телефонных номеров"
)
```

### 2. С тесthereи
```python
from agents.devops_agent_complete import coder, tester, user

# Создать код
user.initiate_chat(coder, message="Создай класс Calculator с methodами add, subtract, multiply, divide")

# Создать тесты
user.initiate_chat(tester, message="Создай unit-тесты for класса Calculator")
```

### 3. Полный цикл - фича от начала до деплоя
```python
from agents.devops_agent_complete import create_feature

create_feature("Добавить REST API for управления tasks")
```
> Это создаст: архитектуру → код → тесты → review → Kubernetes конфиги

### 4. Подготовка к деплою
```python
from agents.devops_agent_complete import deploy_to_kubernetes

deploy_to_kubernetes("api-auth")
```
> Создаст Dockerfile + Kubernetes манифесты

### 5. Загрузка модели Ollama
```python
from agents.devops_agent_complete import pull_ollama_model, model_manager, user

# Через функцию
pull_ollama_model("qwen:32b")

# Или напрямую via агента
user.initiate_chat(
    model_manager,
    message="Загрузи model qwen:32b и проверь системные требования"
)
```
> Агент проверит место на диске, RAM и загрузит model

---

## 🔒 Проверка офлайн modeа

```bash
# 1. Отключите WiFi
sudo ifconfig wlan0 down

# 2. Запустите агента (должен работать!)
python agents/devops_agent_complete.py

# 3. Включите WiFi обратно
sudo ifconfig wlan0 up
```

✅ **Агент работает полностью офлайн!**

---

## 🎨 Примеры команд

### Написать new service
```python
from agents.devops_agent_complete import coder, user

user.initiate_chat(
    coder,
    message="""
    Создай NestJS service EmailService с methodами:
    - sendEmail(to, subject, body)
    - sendBulkEmail(recipients, subject, body)
    - validateEmail(email)

    Используй @nestjs/common, добавь logging и обработку ошибок
    """
)
```

### Создать тесты
```python
from agents.devops_agent_complete import tester, user

user.initiate_chat(
    tester,
    message="Создай тесты for EmailService с покрытием >= 85%"
)
```

### Подготовить Kubernetes деплой
```python
from agents.devops_agent_complete import deployer, user

user.initiate_chat(
    deployer,
    message="""
    Создай конфигурацию for деплоя EmailService:
    - Dockerfile (multi-stage build)
    - Kubernetes Deployment
    - Kubernetes Service
    - ConfigMap for SMTP настроек
    - Health checks
    """
)
```

### Архитектурный design
```python
from agents.devops_agent_complete import architect, user

user.initiate_chat(
    architect,
    message="Сprojectируй микроserviceную архитектуру for e-commerce platforms"
)
```

### Code Review
```python
from agents.devops_agent_complete import reviewer, user

user.initiate_chat(
    reviewer,
    message="Проверь качество кода в fileе user.service.ts, найди проблемы"
)
```

### Управление моделями Ollama
```python
from agents.devops_agent_complete import model_manager, user, pull_ollama_model

# Загрузить model via функцию
pull_ollama_model("qwen:32b")

# Или via агента напрямую
user.initiate_chat(
    model_manager,
    message="Проверь установленные модели и загрузи qwen:32b если её нет"
)

# Проверить модели
user.initiate_chat(
    model_manager,
    message="Покажи список allх установленных моделей Ollama"
)

# Рекомендации по моделям
user.initiate_chat(
    model_manager,
    message="Какую model Ollama ты рекомендуешь for разработки TypeScript кода?"
)
```

---

## 🛠️ Настройка under себя

### Изменить model
Отредактируйте `.env`:
```env
OLLAMA_MODEL=qwen:32b  # Или другая model
```

### Изменить temperature (креативность)
```env
AUTOGEN_TEMPERATURE=0.5  # Меньше = более детерминированно
AUTOGEN_TEMPERATURE=0.9  # Больше = более креативно
```

### Добавить своего агента
```python
from autogen import AssistantAgent

my_agent = AssistantAgent(
    name="MyAgent",
    system_message="Твоя instruction for агента",
    llm_config={
        "model": "qwen2.5:7b",
        "base_url": "http://localhost:11434/v1",
        "api_key": "ollama",
        "api_type": "open_ai"
    }
)
```

---

## 📚 Документация

- **Полный чеклист**: `agents/SETUP_CHECKLIST.md`
- **Офлайн mode**: `agents/OFFLINE_AI_AGENT.md`
- **Полное guide**: `.specify/specs/000-project/OLLAMA_AUTOGEN_SETUP.md`
- **README агентов**: `agents/README.md`

---

## ❓ Проблемы?

### Ollama не launchается
```bash
ps aux | grep ollama  # Проверить process
pkill ollama          # Убить
ollama serve          # Запустить заново
```

### Модель не загружается
```bash
df -h                 # Проверить место на диске
ollama list           # Проверить модели
ollama pull qwen2.5:7b  # Загрузить снова
```

### Python errors
```bash
source .venv/bin/activate  # Активировать venv
pip install --upgrade -r requirements.txt  # Переустановить
```

---

## ✨ Готово!

**Теперь у вас exists полноценный AI DevOps Agent, работающий полностью офлайн!**

- ✅ Работает without интернета
- ✅ Бесплатно наallгда
- ✅ Конфиденциально
- ✅ Без лимитов

**Начните автоматизировать разработку прямо сейчас! 🚀**

---

## 🎯 Следующие шаги

1. Попробуйте exampleы higher
2. Создайте своих агентов
3. Интегрируйте в свой workflow
4. Настройте under свои задачи
5. Наслаждайтесь автоматизацией! ⚡
