# 📁 План структуры libs для NX проекта

**Дата**: 2025-11-27

---

## 🎯 Принципы организации

1. **NX Workspace** - используем стандартную структуру NX
2. **Feature-based** - группируем по функциональности
3. **Shared libraries** - общие компоненты в shared
4. **Domain libraries** - бизнес-логика в domain
5. **UI libraries** - компоненты интерфейса в ui

---

## 📂 Предлагаемая структура

```
libs/
├── shared/                    # Общие библиотеки
│   ├── utils/                # Утилиты
│   │   ├── src/
│   │   │   ├── date.utils.ts
│   │   │   ├── string.utils.ts
│   │   │   ├── validation.utils.ts
│   │   │   └── index.ts
│   │   ├── project.json
│   │   └── tsconfig.json
│   │
│   ├── config/               # Конфигурация
│   │   ├── src/
│   │   │   ├── env.config.ts
│   │   │   ├── database.config.ts
│   │   │   └── index.ts
│   │   ├── project.json
│   │   └── tsconfig.json
│   │
│   ├── api/                  # API клиенты
│   │   ├── src/
│   │   │   ├── http-client.ts
│   │   │   ├── api-client.ts
│   │   │   └── index.ts
│   │   ├── project.json
│   │   └── tsconfig.json
│   │
│   └── backend/              # Backend общие компоненты
│       ├── core/             # ✅ Уже существует
│       │   ├── src/
│       │   │   ├── guards/
│       │   │   ├── services/
│       │   │   └── index.ts
│       │   └── project.json
│       │
│       └── vitest.config.base.ts
│
├── ui/                       # UI компоненты
│   ├── button/               # Кнопка
│   │   ├── src/
│   │   │   ├── button.component.ts
│   │   │   ├── button.stories.ts
│   │   │   └── index.ts
│   │   ├── project.json
│   │   └── tsconfig.json
│   │
│   └── modal/                # Модальное окно
│       ├── src/
│       │   ├── modal.component.ts
│       │   ├── modal.stories.ts
│       │   └── index.ts
│       ├── project.json
│       └── tsconfig.json
│
├── entities/                 # Сущности (Feature-Sliced Design)
│   ├── user/                 # Пользователь
│   │   ├── src/
│   │   │   ├── model/
│   │   │   │   ├── user.interface.ts
│   │   │   │   └── user.entity.ts
│   │   │   ├── api/
│   │   │   │   └── user.api.ts
│   │   │   └── index.ts
│   │   ├── project.json
│   │   └── tsconfig.json
│   │
│   └── product/              # Продукт
│       ├── src/
│       │   ├── model/
│       │   │   ├── product.interface.ts
│       │   │   └── product.entity.ts
│       │   ├── api/
│       │   │   └── product.api.ts
│       │   └── index.ts
│       ├── project.json
│       └── tsconfig.json
│
└── features/                 # Фичи (Feature-Sliced Design)
    ├── auth/                 # Авторизация
    │   ├── src/
    │   │   ├── login/
    │   │   │   ├── login.component.ts
    │   │   │   └── login.hook.ts
    │   │   ├── register/
    │   │   │   ├── register.component.ts
    │   │   │   └── register.hook.ts
    │   │   └── index.ts
    │   ├── project.json
    │   └── tsconfig.json
    │
    ├── cart/                 # Корзина
    │   ├── src/
    │   │   ├── cart.component.ts
    │   │   ├── cart.hook.ts
    │   │   └── index.ts
    │   ├── project.json
    │   └── tsconfig.json
    │
    └── checkout/             # Оформление заказа
        ├── src/
        │   ├── checkout.component.ts
        │   ├── checkout.hook.ts
        │   └── index.ts
        ├── project.json
        └── tsconfig.json
```

---

## 🔄 Текущая структура (для сравнения)

```
libs/
├── domain/                   # Доменные библиотеки
│   ├── auth/                 # ✅ Существует
│   ├── users/                # ✅ Существует
│   ├── admin/                # ✅ Существует
│   └── ...
│
├── infrastructure/           # Инфраструктурные библиотеки
│   ├── i18n/                 # ✅ Существует
│   ├── message-broker/       # ✅ Существует
│   └── ...
│
├── integrations/             # Интеграции
│   └── ...
│
├── ai/                       # AI библиотеки
│   └── ...
│
└── shared/                   # Общие библиотеки
    ├── backend/              # ✅ Существует
    │   └── core/             # ✅ Существует
    └── frontend/             # ✅ Существует
        └── ...
```

---

## 📋 План миграции

### Этап 1: Создание базовой структуры
1. ✅ Создать `libs/shared/utils`
2. ✅ Создать `libs/shared/config`
3. ✅ Создать `libs/shared/api`

### Этап 2: UI компоненты
1. ✅ Создать `libs/ui/button`
2. ✅ Создать `libs/ui/modal`

### Этап 3: Entities (Feature-Sliced Design)
1. ✅ Создать `libs/entities/user`
2. ✅ Создать `libs/entities/product`

### Этап 4: Features (Feature-Sliced Design)
1. ✅ Создать `libs/features/auth`
2. ✅ Создать `libs/features/cart`
3. ✅ Создать `libs/features/checkout`

---

## 🛠️ Команды NX для создания библиотек

```bash
# Shared utils
nx generate @nx/js:library shared-utils --directory=libs/shared/utils --importPath=@workix/shared/utils

# Shared config
nx generate @nx/js:library shared-config --directory=libs/shared/config --importPath=@workix/shared/config

# Shared api
nx generate @nx/js:library shared-api --directory=libs/shared/api --importPath=@workix/shared/api

# UI button
nx generate @nx/react:component button --project=ui-button --export

# UI modal
nx generate @nx/react:component modal --project=ui-modal --export

# Entity user
nx generate @nx/js:library entity-user --directory=libs/entities/user --importPath=@workix/entities/user

# Entity product
nx generate @nx/js:library entity-product --directory=libs/entities/product --importPath=@workix/entities/product

# Feature auth
nx generate @nx/react:library feature-auth --directory=libs/features/auth --importPath=@workix/features/auth

# Feature cart
nx generate @nx/react:library feature-cart --directory=libs/features/cart --importPath=@workix/features/cart

# Feature checkout
nx generate @nx/react:library feature-checkout --directory=libs/features/checkout --importPath=@workix/features/checkout
```

---

## ⚠️ Важные замечания

1. **Совместимость**: Новая структура должна быть совместима с существующей
2. **Постепенная миграция**: Не нужно переносить все сразу
3. **Тестирование**: После создания каждой библиотеки запускать тесты
4. **Документация**: Обновлять документацию при создании новых библиотек

---

## 📝 Следующие шаги

1. ✅ Исправить все тесты
2. ⏳ Создать базовую структуру shared (utils, config, api)
3. ⏳ Создать UI компоненты (button, modal)
4. ⏳ Создать entities (user, product)
5. ⏳ Создать features (auth, cart, checkout)
