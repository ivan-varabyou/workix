# API Types

Auto-generated TypeScript types from Swagger/OpenAPI schema.

## Type Generation

### From API Monolith (main API)

```bash
npm run generate:api-types:monolith
```

### From API Gateway

```bash
npm run generate:api-types:gateway
```

### From custom URL

```bash
npm run generate:api-types <url> <output-path>
```

## Usage

After generation, types are available via:

```typescript
import type { paths, components } from '@workix/shared/frontend/core/types/api-monolith.types';

// Usage example
type User = components['schemas']['User'];
type CreateUserRequest =
  paths['/api/v1/users']['post']['requestBody']['content']['application/json'];
type CreateUserResponse =
  paths['/api/v1/users']['post']['responses']['201']['content']['application/json'];
```

## Automatic Generation

Types should be updated when API changes. Recommended:

1. Run generation after API schema updates
2. Add to CI/CD pipeline
3. Use pre-commit hook to check type freshness
