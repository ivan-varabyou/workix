







```bash
./scripts/start-cursor-agent.sh

python agents/cursor_agent.py
```


```python
from agents.cursor_agent import coder, tester, reviewer, user



```





```bash
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.1:8b-instruct-q4_K_M
AUTOGEN_TEMPERATURE=0.7
```







```bash
curl http://localhost:11434/api/tags
```


```bash
ollama list
```


- [AutoGen Quickstart](./AUTOGEN_QUICKSTART.md)
- [Agent Setup](./AGENT_SETUP.md)
- [Development Rules](../.specify/specs-optimized/core/development.md)


- Python 3.10+



```python
from agents.cursor_agent import coder, user

user.initiate_chat(
    coder,
)
```


```python
from agents.cursor_agent import tester, user

user.initiate_chat(
    tester,
)
```

### Code review

```python
from agents.cursor_agent import reviewer, user

user.initiate_chat(
    reviewer,
)
```
