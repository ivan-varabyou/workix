
## Problem

```
Request failed with status code 400: {"error":"Invalid request body"}
```



## Solutions



```python
OLLAMA_CONFIG = {
    "temperature": 0.7,
    "timeout": 300,
    "max_retries": 3,
}
```


```bash
ollama list

ollama pull llama3.1:8b-instruct-q4_K_M
```


```bash
curl -X POST http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.1:8b-instruct-q4_K_M",
    "messages": [{"role": "user", "content": "hello"}],
    "stream": false
  }'
```




```bash
pip install --upgrade pyautogen
```



```python
OLLAMA_CONFIG = {
    "config_list": [{
        "model": "llama3.1:8b-instruct-q4_K_M",
        "base_url": "http://localhost:11434/v1",
        "api_key": "ollama",
        "api_type": "open_ai",
    }],
    "temperature": 0.7,
}
```



```bash
python scripts/test-ollama-connection.py
```




```python
import requests

def chat_with_ollama(message):
    response = requests.post(
        "http://localhost:11434/v1/chat/completions",
        json={
            "model": "llama3.1:8b-instruct-q4_K_M",
            "messages": [{"role": "user", "content": message}],
            "stream": False
        }
    )
    return response.json()
```














