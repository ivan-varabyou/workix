import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ChatWebViewProvider } from './webview-provider';

const execAsync = promisify(exec);

/**
 * VS Code Extension для автоматической отправки "продолжай" в чат Cursor
 * Использует WebView API и querySelector для доступа к DOM чата
 */

let chatWebViewPanel: vscode.WebviewPanel | undefined;

/**
 * Найти или создать WebView панель для чата
 */
async function getChatWebView(): Promise<vscode.WebviewPanel | null> {
    // Попытка найти существующую панель чата
    const existingPanel = vscode.window.visibleTextEditors.find(
        editor => editor.document.uri.scheme === 'vscode-webview'
    );

    // Если чат открыт, попробовать получить доступ через команды
    try {
        // Открыть чат через команду VS Code
        await vscode.commands.executeCommand('workbench.action.chat.open');

        // Подождать открытия чата
        await new Promise(resolve => setTimeout(resolve, 500));

        // Попытка получить доступ к WebView через активные панели
        // Это работает только если чат открыт как WebView панель
        return null; // VS Code API не предоставляет прямой доступ к чату
    } catch (e) {
        return null;
    }
}

/**
 * Отправить текст в чат через WebView (если доступен)
 */
async function sendToChatViaWebView(text: string): Promise<boolean> {
    try {
        // Создать временный WebView для выполнения скрипта
        const panel = vscode.window.createWebviewPanel(
            'cursorAutoContinue',
            'Auto Continue',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        // HTML с JavaScript для поиска и отправки в чат
        panel.webview.html = getWebviewContent(text);

        // Отправить сообщение в WebView
        panel.webview.postMessage({ command: 'sendContinue', text });

        // Закрыть панель через 2 секунды
        setTimeout(() => {
            panel.dispose();
        }, 2000);

        return true;
    } catch (e) {
        return false;
    }
}

/**
 * HTML контент для WebView с JavaScript для querySelector
 */
function getWebviewContent(text: string): string {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <script>
        const vscode = acquireVsCodeApi();

        // Слушать сообщения от расширения
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'sendContinue') {
                sendToChat(message.text);
            }
        });

        /**
         * Найти поле ввода чата через querySelector
         */
        function findChatInput() {
            const selectors = [
                'textarea[placeholder*="Ask"]',
                'textarea[placeholder*="Message"]',
                'textarea[placeholder*="Chat"]',
                'textarea[data-testid="chat-input"]',
                'textarea.chat-input',
                'textarea[role="textbox"]',
                '.chat-input textarea',
                '.chat-container textarea',
                '[class*="chat"] textarea',
                'textarea'
            ];

            for (const selector of selectors) {
                try {
                    const element = document.querySelector(selector);
                    if (element && element.offsetParent !== null) {
                        const rect = element.getBoundingClientRect();
                        if (rect.width > 0 && rect.height > 0) {
                            return element;
                        }
                    }
                } catch (e) {
                    // Игнорировать ошибки
                }
            }
            return null;
        }

        /**
         * Отправить текст в чат
         */
        function sendToChat(text) {
            // Попытка найти поле ввода в родительском окне
            // (если чат открыт в другом WebView)
            try {
                // Попытка доступа к родительскому окну
                if (window.parent && window.parent !== window) {
                    const parentInput = window.parent.document.querySelector('textarea[placeholder*="Ask"]');
                    if (parentInput) {
                        parentInput.value = text;
                        parentInput.dispatchEvent(new Event('input', { bubbles: true }));
                        parentInput.dispatchEvent(new KeyboardEvent('keydown', {
                            key: 'Enter',
                            keyCode: 13,
                            bubbles: true
                        }));
                        vscode.postMessage({ success: true });
                        return;
                    }
                }
            } catch (e) {
                // Cross-origin ограничения
            }

            // Локальный поиск
            const input = findChatInput();
            if (input) {
                input.value = text;
                input.dispatchEvent(new Event('input', { bubbles: true }));

                const sendButton = document.querySelector('button[type="submit"]') ||
                                 document.querySelector('button[aria-label*="Send"]');

                if (sendButton) {
                    sendButton.click();
                } else {
                    input.dispatchEvent(new KeyboardEvent('keydown', {
                        key: 'Enter',
                        keyCode: 13,
                        bubbles: true
                    }));
                }
                vscode.postMessage({ success: true });
            } else {
                vscode.postMessage({ success: false, error: 'Chat input not found' });
            }
        }

        // Автоматически попытаться отправить при загрузке
        setTimeout(() => {
            sendToChat('${text}');
        }, 500);
    </script>
</body>
</html>`;
}

/**
 * Отправить текст через команды VS Code (fallback)
 */
async function sendToChatViaCommands(text: string): Promise<boolean> {
    try {
        // Открыть чат
        await vscode.commands.executeCommand('workbench.action.chat.open');
        await new Promise(resolve => setTimeout(resolve, 500));

        // Скопировать текст в буфер обмена
        await vscode.env.clipboard.writeText(text);

        // Вставить текст
        await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
        await new Promise(resolve => setTimeout(resolve, 200));

        // Нажать Enter (через команду)
        await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');

        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Основная функция для отправки "продолжай"
 */
async function autoContinue(): Promise<void> {
    const text = 'продолжай';

    // Попытка 1: Через WebView с querySelector
    let success = await sendToChatViaWebView(text);

    // Попытка 2: Через команды VS Code (fallback)
    if (!success) {
        success = await sendToChatViaCommands(text);
    }

    if (success) {
        vscode.window.showInformationMessage(`✅ Отправлено "${text}" в чат Cursor`);
    } else {
        // Fallback: скопировать в буфер обмена
        await vscode.env.clipboard.writeText(text);
        vscode.window.showInformationMessage(
            `📋 Текст "${text}" скопирован в буфер обмена. Вставьте в чат (Ctrl+V) и нажмите Enter`,
            'Открыть чат'
        ).then(selection => {
            if (selection === 'Открыть чат') {
                vscode.commands.executeCommand('workbench.action.chat.open');
            }
        });
    }
}

/**
 * Полный цикл: создать команду + отправить
 */
async function autoContinueFull(): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('Откройте папку проекта');
        return;
    }

    // Выполнить команду создания инструкций
    try {
        await execAsync('make auto-continue-exec', {
            cwd: workspaceFolder.uri.fsPath
        });
    } catch (error) {
        vscode.window.showErrorMessage(`Ошибка выполнения команды: ${error}`);
        return;
    }

    // Отправить "продолжай"
    await autoContinue();
}

/**
 * Активировать расширение
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('Cursor Auto Continue extension activated');

    // Регистрация WebView Provider для querySelector доступа
    const webViewProvider = new ChatWebViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('cursorAutoContinue.webview', webViewProvider)
    );

    // Команда для отправки "продолжай" через WebView
    const continueCommand = vscode.commands.registerCommand(
        'cursorAutoContinue.continue',
        async () => {
            // Попытка через WebView с querySelector
            await webViewProvider.sendToChat('продолжай');
            // Fallback на старый метод
            await autoContinue();
        }
    );

    // Команда для полного цикла
    const autoContinueCommand = vscode.commands.registerCommand(
        'cursorAutoContinue.autoContinue',
        async () => {
            await autoContinueFull();
        }
    );

    // Команда для автоматического продолжения после завершения работы
    const autoContinueOnComplete = vscode.commands.registerCommand(
        'cursorAutoContinue.onComplete',
        async () => {
            // Небольшая задержка для завершения предыдущих операций
            await new Promise(resolve => setTimeout(resolve, 1000));
            await webViewProvider.sendToChat('продолжай');
            await autoContinueFull();
        }
    );

    context.subscriptions.push(continueCommand, autoContinueCommand, autoContinueOnComplete);
}

export function deactivate() {
    if (chatWebViewPanel) {
        chatWebViewPanel.dispose();
    }
}
