# Отчет об ошибках линтинга и TypeScript в модуле безопасности

## ESLint ошибки

### 1. libs/domain/auth/src/security/services/location-anomaly-detector.service.ts

**Строка 89:**
- `@typescript-eslint/consistent-type-assertions` - Do not use any type assertions
- `@typescript-eslint/consistent-type-definitions` - Use an `interface` instead of a `type`
- `@typescript-eslint/no-type-alias` - Type literals are not allowed

**Проблема:** Используется `type LocationMapping` вместо `interface`, и возможно есть type assertions

**Строка 159:**
- `@typescript-eslint/consistent-type-assertions` - Do not use any type assertions

**Проблема:** Type assertion на строке 159

**Строка 1:**
- `simple-import-sort/imports` - Run autofix to sort these imports!

**Проблема:** Импорты не отсортированы

### 2. libs/domain/auth/src/security/middleware/security-threat.middleware.ts

**Строка 192:**
- `@typescript-eslint/consistent-type-assertions` - Do not use any type assertions

**Проблема:** Type assertion `messages[threatType] as string`

**Текущий код:**
```typescript
const message: string = messages[threatType] as string;
```

### 3. libs/domain/auth/src/security/services/geolocation.service.ts

**Строка 1:**
- `simple-import-sort/imports` - Run autofix to sort these imports!

**Проблема:** Импорты не отсортированы

## TypeScript ошибки

Проверка TypeScript не выявила ошибок в модуле безопасности.

## План исправления

1. **location-anomaly-detector.service.ts:89**
   - Заменить `type LocationMapping` на `interface LocationMapping`
   - Убрать type assertions, если они есть
   - Использовать type guards вместо assertions

2. **location-anomaly-detector.service.ts:159**
   - Найти и исправить type assertion
   - Использовать type guards или явные проверки типов

3. **security-threat.middleware.ts:192**
   - Заменить `messages[threatType] as string` на безопасное извлечение с проверкой типа
   - Использовать type guard или условную проверку

4. **Сортировка импортов**
   - Запустить `npx eslint --fix` для автоматической сортировки импортов
   - Или отсортировать вручную согласно правилам проекта

## Команды для исправления

```bash
# Автоматическое исправление сортировки импортов
npx eslint --fix libs/domain/auth/src/security

# Проверка после исправлений
npx eslint libs/domain/auth/src/security --max-warnings 0
npx tsc --noEmit --project tsconfig.base.json
```
