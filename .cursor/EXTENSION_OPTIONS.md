






```json
{
  "name": "cursor-auto-continue",
  "displayName": "Cursor Auto Continue",
  "version": "1.0.0",
  "engines": {
    "vscode": "^1.80.0"
  },
  "activationEvents": [
    "onCommand:cursor.autoContinue"
  ],
  "contributes": {
    "commands": [
      {
        "command": "cursor.autoContinue",
        "title": "Auto Continue Work"
      }
    ],
    "keybindings": [
      {
        "command": "cursor.autoContinue",
        "key": "ctrl+alt+c",
        "mac": "cmd+alt+c"
      }
    ]
  }
}
```


```typescript
import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as clipboardy from 'clipboardy';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand(
        'cursor.autoContinue',
        async () => {
            exec('make auto-continue-exec', (error, stdout, stderr) => {
                if (error) {
                    vscode.window.showErrorMessage(`Error: ${error.message}`);
                    return;
                }

                const fs = require('fs');
                const path = require('path');
                const triggerFile = path.join(
                    vscode.workspace.workspaceFolders[0].uri.fsPath,
                    '.cursor',
                    'trigger-continue.txt'
                );

                if (fs.existsSync(triggerFile)) {
                    const content = fs.readFileSync(triggerFile, 'utf8');

                    clipboardy.write(command);

                    vscode.window.showInformationMessage(
                    ).then(selection => {
                            vscode.commands.executeCommand('workbench.action.chat.open');
                        }
                    });
                }
            });
        }
    );

    context.subscriptions.push(disposable);
}
```


#### a) Macro Extension



#### b) Task Runner Extension


```json
{
  "tasks": [
    {
      "label": "Auto Continue",
      "type": "shell",
      "problemMatcher": []
    }
  ]
}
```

### 3. Keyboard Macro Tools

#### AutoHotkey (Windows)

```autohotkey
^!c::  ; Ctrl+Alt+C
    WinActivate, ahk_exe Cursor.exe

    Sleep, 500


    Send, {Enter}
return
```

#### Keyboard Maestro (macOS)




```bash
npm install -g yo generator-code
```

```bash
yo code
```

```typescript
// extension.ts
import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as clipboardy from 'clipboardy';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand(
        'cursorAutoContinue.continue',
        async () => {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                return;
            }

            exec('make auto-continue-exec', {
                cwd: workspaceFolder.uri.fsPath
            }, async (error, stdout, stderr) => {
                if (error) {
                    vscode.window.showErrorMessage(`Error: ${error.message}`);
                    return;
                }

                const triggerFile = vscode.Uri.joinPath(
                    workspaceFolder.uri,
                    '.cursor',
                    'trigger-continue.txt'
                );

                try {
                    const content = await vscode.workspace.fs.readFile(triggerFile);
                    const text = Buffer.from(content).toString('utf8');

                    await vscode.env.clipboard.writeText(command);

                    const action = await vscode.window.showInformationMessage(
                    );

                        await vscode.commands.executeCommand('workbench.action.chat.open');
                    }
                } catch (err) {
                }
            });
        }
    );

    context.subscriptions.push(disposable);
}
```

```bash
npm install -g vsce
vsce package
vsce publish
```




```bash
```





