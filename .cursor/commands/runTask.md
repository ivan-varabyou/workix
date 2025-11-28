# Command: /runTask

**Version**: 1.0

## Description

Automatically executes tasks from `apps/{project}/.specs/tasks.md` with full development rules context.

## Usage

```
/runTask {project-name}
```

**Examples**:
- `/runTask api-admin`
- `/runTask api-auth`

## Workflow

### 1. Initialization

1. Check MCP servers: `make mcp-status` (start if needed: `make mcp-start`)
2. Load tasks: Read `apps/{project}/.specs/tasks.md`
3. Verify prerequisites: Ensure `{APP}_PLAN.md` and `IMPLEMENTATION_PLAN.md` exist
4. Create main branch:
   - Check existing branches: `t0-{project}`, `t1-{project}`, ...
   - Create next available branch (e.g., `t0-api-admin`)
   - Branch from `develop`

### 2. Task Execution

For each task:

1. Create sub-branch: `t0-{project}-T{number}` (e.g., `t0-api-admin-T001`)
2. Execute task: Implement according to task description
3. Quality checks (after each task):
   - ✅ TypeScript: `nx run {project}:typecheck`
   - ✅ Linter: `nx run {project}:lint`
   - ✅ Type safety: Check for `any`, `as`, `!` (grep)
   - ✅ Functionality: Verify service builds/starts
4. Commit: `T #{number} - {type}({scope}): description` (lowercase, English)
5. Merge to main branch: `git merge t0-{project}-T{number}` into `t0-{project}`
6. Delete sub-branch: `git branch -d t0-{project}-T{number}`

### 3. After Phase Completion

- Checkpoint: Verify all phase tasks completed
- Validation: Run all checks for entire phase
- Commit: Commit with phase completion description

## Required Rules Context

Agent must have access to:

1. **Development Rules**: `.specify/specs-optimized/core/development.md`
   - Development process
   - Commit format
   - Code quality rules
   - Type safety rules
   - **Language**: All code/docs in English, concise

2. **Type Safety**: `.specify/specs-optimized/core/development.md` (lines 96-103)
   - ❌ Forbidden: `any`, `as`, `!`, `unknown` without type guards
   - ✅ Required: explicit types, type guards, interfaces
   - ✅ Check: `nx run {project}:typecheck`

3. **ESLint Rules**: `eslint.config.mjs`
   - `@typescript-eslint/no-explicit-any`: 'error'
   - `@typescript-eslint/consistent-type-assertions`: ['error', { assertionStyle: 'never' }]
   - `@typescript-eslint/explicit-function-return-type`: 'error'
   - `@typescript-eslint/typedef`: 'error'

4. **NX Rules**: `.specify/specs-optimized/core/development.md` (lines 136-148)
   - Project structure (libs/ vs apps/)
   - Module boundaries
   - Path aliases (`@workix/*`)

5. **Git Workflow**: `.specify/specs-optimized/core/git-workflow.md`
   - Branch from `develop`
   - Commit format

6. **Architecture**: `.specify/specs-optimized/core/development.md` (lines 128-134)
   - Business logic in `libs/domain/`
   - Infrastructure in `libs/infrastructure/`
   - Apps only connect modules

## Type Safety Checklist (after each task)

```bash
# 1. TypeScript check
nx run {project}:typecheck

# 2. Linter check
nx run {project}:lint

# 3. Check for 'any'
grep -r ":\s*any\b" apps/{project}/ libs/ --include="*.ts" --exclude-dir="node_modules" || echo "✅ No 'any' found"

# 4. Check for 'as' (type assertion)
grep -r "\sas\s" apps/{project}/ libs/ --include="*.ts" --exclude-dir="node_modules" || echo "✅ No 'as' found"

# 5. Check for '!' (non-null assertion)
grep -r "!:" apps/{project}/ libs/ --include="*.ts" --exclude-dir="node_modules" || echo "✅ No '!' found"

# 6. Build check
nx build {project} || echo "❌ Build failed"
```

## Task Structure

- Format: `[ID] [P?] [Story] Description`
- `[P]`: Can run in parallel
- `[Story]`: User Story (US1, US2, ...)
- File paths: Always specified in task description

## Execution Priority

1. **Phase 1: Setup** - Initial setup
2. **Phase 2: Foundational** - ⚠️ CRITICAL, blocks all User Stories
3. **User Stories** - After Phase 2, can run in parallel (if marked [P])

## Error Handling

### If check fails

1. **TypeScript errors**: Fix types, retry check
2. **Linter errors**: Fix code, retry check
3. **Found `any`/`as`/`!`**: Replace with type guards/interfaces, retry check
4. **Build failed**: Fix errors, retry check

### If task cannot be executed

- Stop execution
- Report issue to user
- Suggest solution

## Safety

- ✅ **DOES NOT** auto-merge to `develop` or `main`
- ✅ **DOES NOT** auto-push
- ✅ **DOES NOT** auto-deploy
- ✅ All merges only to working branch `t0-{project}`
- ✅ User merges `t0-{project}` to `develop` when ready

## See Also

- [Development Rules](../../.specify/specs-optimized/core/development.md)
- [Git Workflow](../../.specify/specs-optimized/core/git-workflow.md)
- [Type Safety Rules](../../.specify/specs-optimized/core/development.md#code-quality)
