import * as vscode from 'vscode';

/**
 * Инжектор скрипта для DevTools Cursor
 * Инжектирует JavaScript с querySelector в консоль DevTools
 */
export class DevToolsInjector {
    /**
     * Инжектировать скрипт в DevTools консоль
     */
    public static async injectScript(): Promise<void> {
        // Создать команду для выполнения скрипта в DevTools
        // Это работает только если DevTools открыт

        const script = `
(function() {
    function findChatInput() {
        const selectors = [
            'textarea[placeholder*="Ask"]',
            'textarea[placeholder*="Message"]',
            'textarea[placeholder*="Chat"]',
            'textarea[data-testid="chat-input"]',
            'textarea.chat-input',
            'textarea[role="textbox"]',
            '.chat-input textarea',
            '[class*="chat"] textarea',
            'textarea'
        ];
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && element.offsetParent !== null) {
                const rect = element.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    return element;
                }
            }
        }
        return null;
    }

    function sendToChat(text) {
        const input = findChatInput();
        if (!input) return false;
        input.focus();
        input.value = text;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        const sendButton = document.querySelector('button[type="submit"]');
        if (sendButton) {
            sendButton.click();
        } else {
            input.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Enter',
                keyCode: 13,
                bubbles: true
            }));
        }
        return true;
    }

    window.sendContinue = () => sendToChat('продолжай');
    console.log('✅ Auto Continue script injected');
})();
        `;

        // Попытка выполнить скрипт через команду VS Code
        // Это работает только если есть доступ к DevTools
        try {
            // Открыть DevTools (если доступно)
            await vscode.commands.executeCommand('workbench.action.toggleDevTools');

            // Подождать открытия DevTools
            await new Promise(resolve => setTimeout(resolve, 500));

            // Выполнить скрипт через команду (если доступно)
            // VS Code не предоставляет прямой способ выполнения скрипта в DevTools
            // Поэтому используем альтернативный подход

            vscode.window.showInformationMessage(
                'Откройте DevTools (Ctrl+Shift+I) и выполните скрипт из .cursor/devtools-script.js'
            );
        } catch (e) {
            vscode.window.showErrorMessage(`Ошибка: ${e}`);
        }
    }
}



