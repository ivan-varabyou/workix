# 🗄️ Database UI для Workix

## 🦫 DBeaver (Рекомендуется)

**Мощный десктопный инструмент с лучшими ER диаграммами**

### Установка

```bash
# Linux
sudo snap install dbeaver-ce

# macOS
brew install --cask dbeaver-community

# Windows
# Скачайте с https://dbeaver.io/download/
```

### Автоматическая настройка

После установки DBeaver запустите:

```bash
npm run db:dbeaver:setup
```

Скрипт автоматически создаст подключения ко всем 11 базам данных микросервисов.

**Подробная инструкция:** `scripts/DBeaver-Setup.md`

### Преимущества DBeaver

- ✅ **Лучшие ER диаграммы** - отличная визуализация связей
- ✅ **Универсальный** - работает со всеми БД
- ✅ **Мощный SQL редактор** - с автодополнением
- ✅ **Бесплатный** - Community Edition
- ✅ **Кроссплатформенный** - Linux, macOS, Windows

## 📊 Все базы данных проекта

| База данных | Host | Port | Database | User | Password |
|------------|------|------|----------|------|----------|
| Admin | localhost | 5100 | workix_admin | postgres | postgres |
| Gateway | localhost | 5101 | workix_gateway | postgres | postgres |
| Auth | localhost | 5102 | workix_auth | postgres | postgres |
| Notifications | localhost | 5103 | workix_notifications | postgres | postgres |
| Pipelines | localhost | 5104 | workix_pipelines | postgres | postgres |
| Webhooks | localhost | 5105 | workix_webhooks | postgres | postgres |
| Workflows | localhost | 5106 | workix_workflows | postgres | postgres |
| Workers | localhost | 5107 | workix_workers | postgres | postgres |
| AB Testing | localhost | 5108 | workix_ab_testing | postgres | postgres |
| Audit | localhost | 5109 | workix_audit | postgres | postgres |
| Integrations | localhost | 5110 | workix_integrations | postgres | postgres |

## 🔗 Как посмотреть ER диаграммы в DBeaver

1. Откройте DBeaver
2. Подключитесь к базе данных (двойной клик)
3. Правый клик на базе данных → **"View Diagram"**
4. Вы увидите визуальное представление всех таблиц и их связей
5. Можно перетаскивать таблицы, масштабировать, экспортировать

## 🎨 Prisma Studio (для работы с данными)

Для каждой базы данных есть отдельная команда:

```bash
# Admin
npm run db:studio:admin      # http://localhost:5555

# Gateway
npm run db:studio:gateway    # http://localhost:5556

# Auth
npm run db:studio:auth       # http://localhost:5557

# Pipelines
npm run db:studio:pipelines # http://localhost:5558

# Webhooks
npm run db:studio:webhooks  # http://localhost:5559

# Workflows
npm run db:studio:workflows # http://localhost:5560

# Workers
npm run db:studio:workers   # http://localhost:5561

# AB Testing
npm run db:studio:ab-testing # http://localhost:5562

# Audit
npm run db:studio:audit     # http://localhost:5563

# Integrations
npm run db:studio:integrations # http://localhost:5564
```

## 📖 Документация

- **Быстрый старт:** `README-DBEAVER.md`
- **Подробная инструкция:** `scripts/DBeaver-Setup.md`
