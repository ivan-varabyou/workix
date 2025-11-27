# Code Review & Testing

## Pre-Commit Checklist

### 1. TypeScript Types
```bash
npx tsc --noEmit
```
- No type errors
- No compilation errors

### 2. Tests
```bash
npm run test:run
```
- All tests pass
- Add tests for new features

### 3. Linting
```bash
npx nx lint
npx prettier --write .
```
- Code formatted
- No linting errors

### 4. Functional Check
```bash
npm run api:serve
```
- App starts without errors
- Endpoints work
- Swagger docs available

## Testing Requirements

- Unit tests for services
- Integration tests for APIs
- E2E tests for critical flows
- Minimum 85% coverage for shared libraries

## Code Review Process

1. Self-review before commit
2. Run pre-commit checklist
3. Create merge request
4. Code review by team
5. Address feedback
6. Merge to `develop`

## Related

- [Development Process](../core/development.md)
- [Git Workflow](../core/git-workflow.md)




