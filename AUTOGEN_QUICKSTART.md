# 🤖 AutoGen + Ollama Quick Start

> **Quick reference for setting up and using AI agents in this project**

## 🚀 Quick Install (5 minutes)

### 1. Install Ollama
```bash
# Linux
curl -fsSL https://ollama.com/install.sh | sh

# macOS  
brew install ollama

# Windows
# Download from https://ollama.com/download
```

### 2. Start Ollama & Pull Model
```bash
ollama serve  # Start server (runs in background on macOS/Windows)
ollama pull qwen2.5:7b  # Download AI model (~4.7GB)
```

### 3. Setup Python Environment
```bash
cd /home/ivan/git/workix
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Test Installation
```bash
python scripts/test_ollama_autogen.py
```

---

## 💡 Basic Usage

### Example 1: Simple Task
```python
from agents.devops_agent import user, coder

user.initiate_chat(
    coder,
    message="Create a function to validate JWT tokens"
)
```

### Example 2: Multi-Agent Workflow
```python
from agents.devops_agent import user, coder, tester

# Coder creates code
user.initiate_chat(
    coder,
    message="Create REST API endpoint for user authentication"
)

# Tester creates tests
user.initiate_chat(
    tester,
    message="Create integration tests for the authentication endpoint"
)
```

### Example 3: Custom Agent
```python
from autogen import AssistantAgent, UserProxyAgent

# Create specialized agent
architect = AssistantAgent(
    name="Architect",
    system_message="You are a system architect. Design scalable solutions.",
    llm_config={
        "model": "qwen2.5:7b",
        "base_url": "http://localhost:11434/v1",
        "api_key": "ollama",
    }
)

user = UserProxyAgent(
    name="User",
    human_input_mode="NEVER",
    code_execution_config={"work_dir": ".", "use_docker": False}
)

# Use it
user.initiate_chat(
    architect,
    message="Design microservices architecture for e-commerce platform"
)
```

---

## 📝 Available Models

| Model | Size | Best For | Memory |
|-------|------|----------|--------|
| `qwen2.5:7b` | 4.7GB | **Recommended** - Fast & Accurate | 8GB RAM |
| `qwen:32b` | 20GB | Best Quality | 32GB RAM |
| `mistral:7b` | 4.1GB | Fast Responses | 8GB RAM |
| `llama2:13b` | 7.4GB | Balanced | 16GB RAM |

```bash
# Change model
ollama pull mistral:7b
# Update in agents/devops_agent.py: OLLAMA_CONFIG["model"] = "mistral:7b"
```

---

## 🛠️ Common Commands

```bash
# Ollama
ollama list                    # List installed models
ollama ps                      # Show running models
ollama pull <model>           # Download model
ollama rm <model>             # Remove model
curl http://localhost:11434/api/version  # Check Ollama status

# Python
source .venv/bin/activate     # Activate environment
python agents/devops_agent.py # Run agent
pip list | grep autogen       # Check AutoGen version
```

---

## 🐛 Quick Troubleshooting

**Ollama not responding?**
```bash
ps aux | grep ollama   # Check if running
ollama serve           # Start manually
```

**Model too large?**
```bash
df -h                  # Check disk space
ollama pull qwen:7b    # Use smaller model
```

**Import errors?**
```bash
source .venv/bin/activate
pip install --upgrade pyautogen python-dotenv
```

---

## 📚 Full Documentation

- **Complete Setup Guide:** `.specify/specs/005-development-process/AUTOGEN_OLLAMA_SETUP_CHECKLIST.md`
- **Detailed Instructions:** `.specify/specs/000-project/OLLAMA_AUTOGEN_SETUP.md`
- **Agent Examples:** `agents/README.md`

---

## 🎯 Next Steps

1. ✅ Follow setup checklist
2. ✅ Test with examples above  
3. 🚀 Create custom agents for your needs
4. 📖 Read full documentation for advanced features

**Need help?** Check troubleshooting section in full docs or visit:
- AutoGen: https://microsoft.github.io/autogen/
- Ollama: https://ollama.com/docs/

