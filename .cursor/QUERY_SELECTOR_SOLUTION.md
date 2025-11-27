# QuerySelector Solution for Automatic Cursor Chat Sending

## Problem

Cursor doesn't provide public API for automatic chat message sending. But we can use querySelector for DOM element access in chat.

## Solutions

### 1. VS Code Extension (Recommended)

**Location**: `.cursor/extension/`

**How it works**:
- Uses VS Code API for chat access
- Opens chat via VS Code commands
- Inserts text via clipboard + paste
- Presses Enter via commands

**Installation**:
```bash
# Install extension
code --install-extension .cursor/extension/

# Or copy to VS Code extensions folder
cp -r .cursor/extension/ ~/.vscode/extensions/auto-continue-1.0.0/
```

**Usage**:
```bash
# Via command palette
Ctrl+Shift+P -> "Auto Continue: Send Message"

# Via keybinding
Ctrl+Alt+C
```

### 2. DevTools Script (Browser method)

**Location**: `.cursor/devtools-script.js`

**How it works**:
- Finds chat input via querySelector
- Sets text value
- Triggers input events
- Clicks send button

**Usage**:
```javascript
// Open DevTools (F12)
// Paste and run:
(() => {
  const message = "continue";

  // Find input
  const input = document.querySelector('[data-testid="chat-input"]') ||
                document.querySelector('textarea[placeholder*="chat"]') ||
                document.querySelector('.chat-input textarea');

  if (input) {
    input.value = message;
    input.dispatchEvent(new Event('input', { bubbles: true }));

    // Find send button
    const sendBtn = document.querySelector('[data-testid="send-button"]') ||
                   document.querySelector('button[type="submit"]');

    if (sendBtn) sendBtn.click();
  }
})();
```

### 3. Browser Extension (Chrome/Firefox)

**Location**: `.cursor/extension-browser/`

**Features**:
- Automatic detection of Cursor chat
- Hotkey support (Ctrl+Enter)
- Message templates
- Queue system

**Installation**:
```bash
# Chrome
1. Open chrome://extensions/
2. Enable Developer mode
3. Load unpacked -> select .cursor/extension-browser/

# Firefox
1. Open about:debugging
2. This Firefox -> Load Temporary Add-on
3. Select manifest.json from .cursor/extension-browser/
```

## Selectors for Cursor Chat

### Common selectors:
```javascript
// Input field
const selectors = [
  '[data-testid="chat-input"]',
  'textarea[placeholder*="chat"]',
  '.chat-input textarea',
  '.composer textarea',
  '[role="textbox"]'
];

// Send button
const sendSelectors = [
  '[data-testid="send-button"]',
  'button[type="submit"]',
  '.send-button',
  '[aria-label*="send"]'
];
```

### Robust finder function:
```javascript
function findChatElements() {
  const inputSelectors = [
    '[data-testid="chat-input"]',
    'textarea[placeholder*="chat"]',
    '.chat-input textarea',
    '.composer textarea',
    '[role="textbox"]',
    'textarea'
  ];

  const sendSelectors = [
    '[data-testid="send-button"]',
    'button[type="submit"]',
    '.send-button',
    '[aria-label*="send"]',
    'button:has(svg)',
    'button[disabled]:not([disabled])'
  ];

  let input = null;
  let sendBtn = null;

  // Find input
  for (const selector of inputSelectors) {
    input = document.querySelector(selector);
    if (input) break;
  }

  // Find send button
  for (const selector of sendSelectors) {
    sendBtn = document.querySelector(selector);
    if (sendBtn) break;
  }

  return { input, sendBtn };
}
```

## Auto-send Function

### Complete implementation:
```javascript
async function autoSendMessage(message = "continue") {
  const { input, sendBtn } = findChatElements();

  if (!input) {
    console.error('Chat input not found');
    return false;
  }

  // Set message
  input.value = message;
  input.focus();

  // Trigger events
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));

  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 100));

  // Send message
  if (sendBtn && !sendBtn.disabled) {
    sendBtn.click();
    return true;
  } else {
    // Try Enter key
    input.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      bubbles: true
    }));
    return true;
  }
}

// Usage
autoSendMessage("continue");
```

## Integration with Make Commands

### Add to Makefile:
```makefile
auto-send-devtools: ## Send message via DevTools script
	@echo "Open DevTools (F12) and run:"
	@cat .cursor/devtools-script.js

auto-send-extension: ## Send via VS Code extension
	@code --command "auto-continue.sendMessage"

auto-send-browser: ## Send via browser extension
	@echo "Use Ctrl+Enter in Cursor tab"
```

## Troubleshooting

### Common issues:

1. **Selectors not working**
   - Cursor updates change DOM structure
   - Use multiple fallback selectors
   - Inspect current DOM structure

2. **Events not triggering**
   - Try different event types
   - Add delays between events
   - Use both synthetic and native events

3. **Button disabled**
   - Wait for input validation
   - Check for required fields
   - Ensure proper focus

### Debug script:
```javascript
function debugChatElements() {
  console.log('=== Chat Debug ===');

  // Find all textareas
  const textareas = document.querySelectorAll('textarea');
  console.log('Textareas found:', textareas.length);
  textareas.forEach((el, i) => {
    console.log(`Textarea ${i}:`, {
      placeholder: el.placeholder,
      className: el.className,
      id: el.id,
      testId: el.getAttribute('data-testid')
    });
  });

  // Find all buttons
  const buttons = document.querySelectorAll('button');
  console.log('Buttons found:', buttons.length);
  buttons.forEach((el, i) => {
    if (el.textContent.includes('send') || el.getAttribute('aria-label')?.includes('send')) {
      console.log(`Send button ${i}:`, {
        textContent: el.textContent,
        className: el.className,
        disabled: el.disabled,
        ariaLabel: el.getAttribute('aria-label')
      });
    }
  });
}

// Run debug
debugChatElements();
```

## Success Indicators

### Check if message sent:
```javascript
function checkMessageSent(message) {
  const chatMessages = document.querySelectorAll('.chat-message, .message, [role="listitem"]');

  for (const msg of chatMessages) {
    if (msg.textContent.includes(message)) {
      console.log('Message found in chat:', message);
      return true;
    }
  }

  return false;
}

// Wait and check
setTimeout(() => {
  if (checkMessageSent("continue")) {
    console.log('✅ Message sent successfully');
  } else {
    console.log('❌ Message not found');
  }
}, 2000);
```

## Final Recommendation

1. **VS Code Extension** - Most reliable, uses official API
2. **DevTools Script** - Quick solution for testing
3. **Browser Extension** - Best UX for regular use

Choose based on your workflow and technical requirements.
