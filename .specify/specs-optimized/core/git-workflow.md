# Git Workflow

## Branches

### `main`
- Production branch
- Only stable, tested code
- Merge from `develop` after review

### `develop`
- Development branch
- Latest development code
- Merge from `task-{number}` when task complete

### `task-{number}`
- Task branches
- Created from `develop`
- Format: `task-1`, `task-42`, or `t1`, `t42`

## Workflow

1. Create branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b task-1
   ```

2. Develop and commit

3. Merge to `develop` when complete

## Commit Format

**IMPORTANT**: English, lowercase only

Format: `T #{number} - {type}({scope}): description`

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

### Scope
Module name: `auth`, `users`, `pipelines`, `rbac`

### Examples
```
T #1 - feat(auth): add jwt authentication
T #2 - fix(users): resolve email validation issue
T #3 - docs(api): update swagger documentation
T #0 - fix(types): remove as unknown as constructions
T #0 - feat(types): add explicit types to apps
```

**Note**: Task number `#0` used for general improvements (types, refactoring, etc.)

## Related

- [Development Process](./development.md)
- [Code Review](../process/code-review.md)
