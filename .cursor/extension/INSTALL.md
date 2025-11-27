


```bash
cd .cursor/extension
npm install
npm run compile
```



```bash
ln -s /home/ivan/git/workix/.cursor/extension ~/.cursor/extensions/cursor-auto-continue

```


```bash
cd .cursor/extension
npm install
npm install -g vsce
npm run compile
vsce package

```

## Usage

### Commands






```json
{
  "tasks": [
    {
      "label": "Complete and Continue",
      "type": "shell",
      "command": "echo 'Task complete'",
      "problemMatcher": [],
      "runOptions": {
        "runOn": "default"
      },
      "dependsOn": "cursorAutoContinue.onComplete"
    }
  ]
}
```

2. **Git hooks** (`.git/hooks/post-commit`):
```bash
#!/bin/bash
cursor --command cursorAutoContinue.onComplete
```





- Clipboard how fallback









