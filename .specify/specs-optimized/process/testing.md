# Testing Architecture

**Version**: 3.0

## Overview

Multi-layer testing strategy: Unit → Integration → E2E tests.

## Test Pyramid

```
        E2E Tests (Gateway Layer)
            ~46 tests, 10-30s
        [apps/api-e2e]

    Integration Tests (Service + DB)
        ~20-30 tests, 15-30s
    [apps/*/integration/]

    Controller Tests (HTTP endpoints)
        ~50-70 tests, 5-10s
    [apps/*/controllers/]

    Unit Tests (Business Logic)
        ~200+ tests, 1-2s
    [libs/*/services/]
```

## Test Frameworks

### Backend (NestJS)
- **Framework**: Vitest
- **Base Config**: `libs/shared/backend/vitest.config.base.ts`
- **Usage**: Import `createVitestConfig()` in project `vitest.config.ts`

### Frontend (Angular)
- **Framework**: Jest
- **Base Config**: `libs/shared/frontend/jest.config.base.ts`
- **Usage**: Import `createJestConfig()` in project `jest.config.ts`

## Coverage Requirements

### Minimum Coverage
- **Regular code**: 70% minimum
- **Shared libraries**: **85%+ mandatory** (critical!)
- **UI components**: Storybook stories required

### Critical Areas (Must Have Tests)
- Authentication & Authorization
- Data persistence (DB operations)
- Core API endpoints
- Error handling
- Data validation
- Multi-tenancy isolation
- External integrations

## Unit Tests

**Location**: `libs/*/services/*.spec.ts`

**What to test**:
- Business logic in services
- Individual functions/methods
- Edge cases and error handling

**Example**:
```typescript
describe('AuthService', () => {
  it('should login user with correct credentials', async () => {
    const user = await authService.login({ email, password });
    expect(user).toHaveProperty('accessToken');
  });

  it('should throw error on invalid credentials', async () => {
    await expect(authService.login({ email, password: 'wrong' }))
      .rejects.toThrow('Invalid credentials');
  });
});
```

**Status**: ✅ 200+ tests passing

## Integration Tests

**Location**: `apps/*/integration/*.spec.ts`

**What to test**:
- Service + Database interactions
- External service integrations
- Data flow between components

**Setup**: Requires test database

**Commands**:
```bash
npm run test:auth:integration
npm run test:auth:integration:setup
```

## E2E Tests

**Location**: `apps/api-e2e/src/**/*.spec.ts`

**Setup**:
1. Start all services: `npm run start:all`
2. Run E2E tests: `nx run api-e2e:e2e` or `npm run test:e2e`
3. Tests wait for Gateway startup (global-setup.ts)
4. Cleanup after tests (global-teardown.ts)

**What to test**:
- Full API flow through Gateway
- End-to-end user scenarios
- Cross-service communication

**Commands**:
```bash
npm run test:e2e              # Run all E2E tests
npm run test:auth:e2e         # Auth E2E tests
npm run test:auth:e2e:full    # Full setup + tests
```

**Status**: ✅ 18 tests implemented, 28 missing

## Test Execution

### Commands

```bash
# Unit tests (all)
npm run test:run              # ~2 sec, 200+ tests

# Unit tests (specific)
npm run test:run libs/auth

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# Integration tests
npm run test:auth:integration
```

### Pre-commit Checklist

1. ✅ TypeScript compilation: `npx tsc --noEmit`
2. ✅ All tests pass: `npm run test:run`
3. ✅ Linting: `npx nx lint`
4. ✅ Coverage meets requirements

## Test Organization

### File Structure

```
libs/domain/auth/src/
├── services/
│   ├── auth.service.ts
│   └── auth.service.spec.ts      ✅ Unit test

apps/api-auth/src/app/
├── controllers/
│   ├── auth.controller.ts
│   └── auth.controller.spec.ts  ✅ Controller test
└── integration/
    └── auth.integration.spec.ts  ✅ Integration test

apps/api-e2e/src/
└── api/
    └── api.spec.ts                ✅ E2E test
```

## Configuration

### Base Configs (Required)

**Backend**:
```typescript
// vitest.config.ts
import { createVitestConfig } from '../../shared/backend/vitest.config.base';

export default createVitestConfig({
  root: __dirname,
  coverageDirectory: '../../../../coverage/libs/domain/auth',
});
```

**Frontend**:
```typescript
// jest.config.ts
import { createJestConfig } from '../../shared/frontend/jest.config.base';

export default createJestConfig({
  displayName: 'app-web',
  preset: '../../jest.preset.js',
});
```

**Rules**:
- ❌ Never duplicate config
- ✅ Always use base configs
- ✅ Extend base configs via `extends` in `tsconfig.spec.json`

## Related

- [Code Review](./code-review.md)
- [Development Process](../core/development.md)
