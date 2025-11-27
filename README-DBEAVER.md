# 🦫 DBeaver для Workix - Быстрый старт

## 🚀 Установка

### Linux
```bash
sudo snap install dbeaver-ce
```

### macOS
```bash
brew install --cask dbeaver-community
```

### Windows
Скачайте установщик с https://dbeaver.io/download/

## ⚡ Автоматическая настройка

После установки DBeaver запустите:

```bash
npm run db:dbeaver:setup
```

Скрипт автоматически:
- ✅ Создаст подключения ко всем 11 базам данных
- ✅ Настроит правильные порты (5100-5110)
- ✅ Сгруппирует в папку "Workix"
- ✅ Сохранит пароли

## 📊 Все подключения

После настройки будут доступны:

| Подключение | Host | Port | Database |
|------------|------|------|----------|
| workix-admin | localhost | 5100 | workix_admin |
| workix-gateway | localhost | 5101 | workix_gateway |
| workix-auth | localhost | 5102 | workix_auth |
| workix-notifications | localhost | 5103 | workix_notifications |
| workix-pipelines | localhost | 5104 | workix_pipelines |
| workix-webhooks | localhost | 5105 | workix_webhooks |
| workix-workflows | localhost | 5106 | workix_workflows |
| workix-workers | localhost | 5107 | workix_workers |
| workix-ab-testing | localhost | 5108 | workix_ab_testing |
| workix-audit | localhost | 5109 | workix_audit |
| workix-integrations | localhost | 5110 | workix_integrations |

**Учетные данные:** `postgres` / `postgres`

## 🔗 Просмотр ER диаграмм

1. Откройте DBeaver
2. Подключитесь к базе (двойной клик)
3. Правый клик на БД → **"View Diagram"**
4. Видите все таблицы и связи!

## 📖 Подробная документация

См. `scripts/DBeaver-Setup.md` для полной инструкции.
