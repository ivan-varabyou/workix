# 🔧 Usage querySelector via DevTools Cursor






```bash
cat .cursor/devtools-script.js | xclip -selection clipboard

cat .cursor/devtools-script.js
```




```javascript
const input = document.querySelector('textarea[placeholder*="Ask"]') ||
              document.querySelector('textarea[placeholder*="Message"]') ||
              document.querySelector('textarea');

if (input) {
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
} else {
}
```



```bash
alias cursor-continue='cat /home/ivan/git/workix/.cursor/devtools-script.js'
```






```javascript
document.querySelectorAll('textarea');
document.querySelectorAll('button');
document.querySelectorAll('[class*="chat"]');
```


```javascript
document.querySelector('textarea[placeholder*="Ask"]');
document.querySelector('textarea[placeholder*="Message"]');
document.querySelector('.chat-input textarea');
```










