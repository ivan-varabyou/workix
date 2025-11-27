# Gateway E2E Tests

## Запуск тестов

```bash
# Запустить все gateway тесты
npx nx run apps-e2e:e2e:gateway

# Запустить конкретный тест
npx vitest run apps-e2e/src/gateway/registration.spec.ts --config apps-e2e/vitest.config.gateway.ts
```

## Требования

1. Gateway должен быть запущен на порту 7101
2. База данных auth должна быть доступна на порту 5102
3. Prisma клиенты должны быть сгенерированы:
   ```bash
   npx prisma generate --schema=apps/api-auth/prisma/schema.prisma
   ```



