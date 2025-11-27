# Vite Plugins for Workix

## angular-template.plugin.ts

Плагин for Vite, который обрабатывает Angular componentы в тестах, аналогично `jest-preset-angular`.

### Функциональность

- **Обработка HTML fileов**: Преобразует HTML templateы в строки (how `jest-preset-angular` с `stringifyContentPathRegex`)
- **Обработка SCSS fileов**: Возвращает пустую строку for тестов (стили не нужны в unit-тестах)
- **Разsolution путей**: Правильно обрабатывает относительные пути к templateам и стилям

### Usage

```typescript
import angularTemplatePlugin from '../../../tools/vite-plugins/angular-template.plugin';

export default defineConfig({
  plugins: [nxViteTsPaths(), angularTemplatePlugin()],
  // ...
});
```

### Примечание

Для фронтенд whenложений usesся **Jest** с `jest-preset-angular`. Эthat плагин предназначен for библиотек, которые используют Vitest (наexample, `shared-frontend/core`).
