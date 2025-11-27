// Background script для браузерного расширения

chrome.action.onClicked.addListener((tab) => {
    // Отправить сообщение в content script
    chrome.tabs.sendMessage(tab.id, { action: 'sendContinue' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Error:', chrome.runtime.lastError);
        } else if (response && response.success) {
            console.log('✅ Сообщение отправлено');
        } else {
            console.warn('⚠️ Не удалось отправить сообщение');
        }
    });
});

// Слушать команды от других частей расширения
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'sendContinue') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'sendContinue' }, (response) => {
                    sendResponse(response);
                });
            }
        });
        return true;
    }
});



