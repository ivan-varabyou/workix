


   - `Ctrl+,` (or `Cmd+,` based macOS)


   - **Provider**: Ollama
   - **Base URL**: `http://localhost:11434/v1`
   - **Model**: `llama3.1:8b-instruct-q4_K_M`


   - Linux: `~/.config/Cursor/User/settings.json`
   - macOS: `~/Library/Application Support/Cursor/User/settings.json`
   - Windows: `%APPDATA%\Cursor\User\settings.json`


```json
{
  "cursor.ai.providers": {
    "ollama": {
      "baseUrl": "http://localhost:11434/v1",
      "apiKey": "ollama",
      "models": [
        {
          "id": "llama3.1:8b-instruct-q4_K_M",
          "name": "LLaMA 3.1 8B Instruct",
          "maxTokens": 4096
        },
        {
          "id": "mistral:7b-instruct-q4_K_M",
          "name": "Mistral 7B Instruct",
          "maxTokens": 4096
        }
      ]
    }
  }
}
```



   ```bash
   ollama serve
   ```







```bash
./scripts/start-cursor-agent.sh

Ctrl+Shift+P → Tasks: Run Task → 🤖 Start Cursor Agent (llama3.1)
```


- [Ollama Documentation](https://github.com/ollama/ollama)
- [Cursor IDE Documentation](https://cursor.sh/docs)
- [MCP Protocol](https://modelcontextprotocol.io)














