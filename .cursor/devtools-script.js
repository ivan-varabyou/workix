/**
 * Скрипт для выполнения в DevTools Cursor (Ctrl+Shift+I)
 * Использует querySelector для автоматической отправки "продолжай" в чат
 *
 * Использование:
 * 1. Открыть DevTools в Cursor: Ctrl+Shift+I
 * 2. Вставить этот скрипт в консоль
 * 3. Выполнить: sendContinue()
 */

(function() {
    'use strict';

    /**
     * Найти поле ввода чата через querySelector
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
            // Последний вариант
            'textarea'
        ];

        for (const selector of selectors) {
            try {
                const element = document.querySelector(selector);
                if (element && element.offsetParent !== null) {
                    const rect = element.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        console.log(`✅ Найдено поле ввода: ${selector}`);
                        return element;
                    }
                }
            } catch (e) {
                // Игнорировать ошибки
            }
        }

        console.warn('❌ Поле ввода чата не найдено');
        return null;
    }

    /**
     * Отправить текст в чат
     */
    function sendToChat(text) {
        const input = findChatInput();

        if (!input) {
            console.error('❌ Не удалось найти поле ввода чата');
            return false;
        }

        try {
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
                             input.closest('[class*="chat"]')?.querySelector('button[aria-label*="Submit"]') ||
                             document.querySelector('button[type="submit"]') ||
                             document.querySelector('button[aria-label*="Send"]');

            if (sendButton) {
                console.log('✅ Найдена кнопка отправки, кликаю...');
                sendButton.click();
            } else {
                // Отправить через Enter
                console.log('✅ Отправляю через Enter...');
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

            console.log(`✅ Текст "${text}" отправлен в чат`);
            return true;
        } catch (e) {
            console.error('❌ Ошибка при отправке:', e);
            return false;
        }
    }

    /**
     * Глобальная функция для вызова из консоли
     */
    window.sendContinue = function(text = 'продолжай') {
        return sendToChat(text);
    };

    /**
     * Автоматически отправить "продолжай"
     */
    window.autoContinue = function() {
        return sendToChat('продолжай');
    };

    console.log('✅ Скрипт загружен! Используйте:');
    console.log('  - sendContinue() - отправить "продолжай"');
    console.log('  - sendContinue("ваш текст") - отправить свой текст');
    console.log('  - autoContinue() - автоматически отправить "продолжай"');
})();



