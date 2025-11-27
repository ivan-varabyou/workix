// Content Script для браузерного расширения
// Работает через querySelector для доступа к DOM чата Cursor

(function() {
    'use strict';

    /**
     * Найти поле ввода чата Cursor
     */
    function findChatInput() {
        const selectors = [
            // Cursor специфичные селекторы
            'textarea[placeholder*="Ask"]',
            'textarea[placeholder*="Message"]',
            'textarea[placeholder*="Chat"]',
            'textarea[data-testid="chat-input"]',
            'textarea.chat-input',
            'textarea#chat-input',
            // Общие селекторы
            'textarea[role="textbox"]',
            '.chat-input textarea',
            '.chat-container textarea',
            '[class*="chat"] textarea',
            '[class*="input"] textarea',
            // Последний вариант - любой textarea
            'textarea'
        ];

        for (const selector of selectors) {
            try {
                const element = document.querySelector(selector);
                if (element && element.offsetParent !== null) {
                    // Проверить, что элемент видим и доступен
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
        const input = findChatInput();

        if (!input) {
            console.warn('Chat input not found');
            return false;
        }

        try {
            // Фокус на поле ввода
            input.focus();

            // Установить значение
            input.value = text;

            // Триггерить события для обновления состояния
            const events = ['input', 'change', 'keyup'];
            events.forEach(eventType => {
                const event = new Event(eventType, { bubbles: true });
                input.dispatchEvent(event);
            });

            // Найти кнопку отправки или нажать Enter
            const sendButton = document.querySelector('button[type="submit"]') ||
                             document.querySelector('button[aria-label*="Send"]') ||
                             document.querySelector('button[aria-label*="Submit"]') ||
                             document.querySelector('.send-button') ||
                             document.querySelector('[class*="send"]');

            if (sendButton) {
                sendButton.click();
            } else {
                // Отправить через Enter
                const enterEvent = new KeyboardEvent('keydown', {
                    key: 'Enter',
                    code: 'Enter',
                    keyCode: 13,
                    which: 13,
                    bubbles: true,
                    cancelable: true
                });
                input.dispatchEvent(enterEvent);

                const enterUpEvent = new KeyboardEvent('keyup', {
                    key: 'Enter',
                    code: 'Enter',
                    keyCode: 13,
                    which: 13,
                    bubbles: true,
                    cancelable: true
                });
                input.dispatchEvent(enterUpEvent);
            }

            return true;
        } catch (e) {
            console.error('Error sending to chat:', e);
            return false;
        }
    }

    /**
     * Слушать сообщения от background script
     */
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'sendContinue') {
            const success = sendToChat('продолжай');
            sendResponse({ success });
        }
        return true;
    });

    // Экспортировать функцию для прямого вызова
    window.cursorAutoContinue = {
        send: sendToChat,
        findInput: findChatInput
    };

    console.log('✅ Cursor Auto Continue content script loaded');
})();



