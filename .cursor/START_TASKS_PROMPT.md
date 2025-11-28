# Prompt: Start Admin API Tasks Execution

Copy this text to a new chat window:

---

**Context**: Working on Admin API in NX monorepo Workix. Need to start executing tasks from `apps/api-admin/.specs/tasks.md`.

**Current State**:
- ✅ Specifications ready: `ADMIN_API_PLAN.md`, `IMPLEMENTATION_PLAN.md`
- ✅ Task plan: `apps/api-admin/.specs/tasks.md` (292 tasks, 16 phases)
- ✅ `api-admin` created as copy of `api-auth`, adapted for admins
- ⏳ Need to start with Phase 1: Setup

## Required Rules (READ FIRST!)

1. **Development Rules**: `.specify/specs-optimized/core/development.md`
   - Process (lines 1-53), commit format (lines 89-94)
   - **Type Safety** (lines 96-103): ❌ Forbidden `any`, `as`, `!`, `unknown` without type guards
   - NX rules (lines 136-148), architecture (lines 128-134)
   - **Language**: All code/docs in English, concise

2. **Type Safety Details**: `.specify/specs-backup/005-development-process/DEVELOPMENT_RULES.md`
   - Full typing rules (lines 2489-3032)
   - Explicit types required for all functions

3. **ESLint Config**: `eslint.config.mjs`
   - `@typescript-eslint/no-explicit-any`: 'error'
   - `@typescript-eslint/consistent-type-assertions`: ['error', { assertionStyle: 'never' }]

4. **Git Workflow**: `.specify/specs-optimized/core/git-workflow.md`
   - Branch from `develop`, commit format: `T #{number} - {type}({scope}): description`

## Type Safety Rules

**❌ FORBIDDEN**:
- `any`, `as`, `!`, `unknown` without type guards
- Inline types in parameters - extract to interfaces

**✅ REQUIRED**:
- Explicit types for all variables, parameters, return values
- Type guards instead of `as` assertions
- Interfaces in separate files for reuse
- Check after each task: `nx run api-admin:typecheck` and `nx run api-admin:lint`

## Execution Process

**After each task**:
1. ✅ TypeScript: `nx run api-admin:typecheck`
2. ✅ Linter: `nx run api-admin:lint`
3. ✅ Type safety: `grep -r ":\s*any\b" apps/api-admin/`
4. ✅ Functionality: Verify service builds/starts
5. ✅ Commit: `T #{number} - {type}({scope}): description` (lowercase, English)

**Start**:
1. Check MCP: `make mcp-status` (start if needed: `make mcp-start`)
2. Read `apps/api-admin/.specs/tasks.md`
3. Create branch from `develop`: `t0-api-admin` (or next available)
4. Start with **Phase 1: Setup** (T001-T004)
5. Then **Phase 2: Foundational** (T005-T023) - ⚠️ CRITICAL, blocks all User Stories
6. After Phase 2: User Stories (US1, US2, US3...)

**MVP Priority**: Phase 1 → Phase 2 → Phase 3 (User Story 1 - Admin Authentication)

**Task Structure**:
- `[P]` = parallelizable
- `[US1]` = belongs to User Story 1
- All tasks include exact file paths

**Task**: Start execution with Phase 1, check current project state, follow all Type Safety rules, continue per plan from `apps/api-admin/.specs/tasks.md`. Check types, linter, and functionality after each task.

---
