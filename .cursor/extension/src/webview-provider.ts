import * as vscode from 'vscode';

/**
 * WebView Provider для инжекции скрипта с querySelector в чат Cursor
 */
export class ChatWebViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Слушать сообщения от WebView
        webviewView.webview.onDidReceiveMessage((data) => {
            switch (data.type) {
                case 'sendContinue':
                    this.sendToChat(data.text);
                    break;
            }
        });
    }

    /**
     * Отправить текст в чат через querySelector
     */
    public async sendToChat(text: string): Promise<void> {
        if (!this._view) {
            return;
        }

        // Отправить команду в WebView для выполнения querySelector
        this._view.webview.postMessage({
            command: 'executeQuerySelector',
            text: text,
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cursor Auto Continue</title>
</head>
<body>
    <script>
        const vscode = acquireVsCodeApi();

        // Слушать сообщения от расширения
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'executeQuerySelector') {
                executeQuerySelector(message.text);
            }
        });

        /**
         * Выполнить querySelector для поиска и отправки в чат
         */
        function executeQuerySelector(text) {
            // Попытка доступа к родительскому окну (где открыт чат Cursor)
            try {
                // Если чат открыт в родительском окне
                if (window.parent && window.parent !== window) {
                    const parentDoc = window.parent.document;
                    const chatInput = findChatInputInDocument(parentDoc);

                    if (chatInput) {
                        sendToChatInput(chatInput, text);
                        vscode.postMessage({ type: 'success', text: text });
                        return;
                    }
                }
            } catch (e) {
                // Cross-origin ограничения - это нормально
            }

            // Попытка найти в текущем документе
            const chatInput = findChatInputInDocument(document);
            if (chatInput) {
                sendToChatInput(chatInput, text);
                vscode.postMessage({ type: 'success', text: text });
            } else {
                vscode.postMessage({ type: 'error', message: 'Chat input not found' });
            }
        }

        /**
         * Найти поле ввода чата через querySelector
         */
        function findChatInputInDocument(doc) {
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
                '[class*="input"] textarea',
                'textarea'
            ];

            for (const selector of selectors) {
                try {
                    const element = doc.querySelector(selector);
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
         * Отправить текст в поле ввода чата
         */
        function sendToChatInput(input, text) {
            // Фокус на поле ввода
            input.focus();

            // Установить значение
            input.value = text;

            // Триггерить события для обновления состояния React/Vue
            const events = ['input', 'change', 'keyup'];
            events.forEach(eventType => {
                const event = new Event(eventType, { bubbles: true });
                input.dispatchEvent(event);
            });

            // Найти кнопку отправки
            const sendButton = input.closest('form')?.querySelector('button[type="submit"]') ||
                             input.closest('[class*="chat"]')?.querySelector('button[aria-label*="Send"]') ||
                             document.querySelector('button[type="submit"]');

            if (sendButton) {
                sendButton.click();
            } else {
                // Отправить через Enter
                const enterDown = new KeyboardEvent('keydown', {
                    key: 'Enter',
                    code: 'Enter',
                    keyCode: 13,
                    which: 13,
                    bubbles: true,
                    cancelable: true
                });
                input.dispatchEvent(enterDown);

                const enterUp = new KeyboardEvent('keyup', {
                    key: 'Enter',
                    code: 'Enter',
                    keyCode: 13,
                    which: 13,
                    bubbles: true,
                    cancelable: true
                });
                input.dispatchEvent(enterUp);
            }
        }

        // Автоматически попытаться выполнить при загрузке (если есть команда)
        vscode.postMessage({ type: 'ready' });
    </script>
</body>
</html>`;
    }
}



