# Speckit Commands

**Version**: 1.1
**Date**: 2025-01-27

## Available Commands

### Core Commands (7)

1. **`speckit.specify`** - Create feature specification
2. **`speckit.clarify`** - Clarify ambiguities in specification
3. **`speckit.plan`** - Technical planning and architecture
4. **`speckit.tasks`** - Generate detailed tasks
5. **`speckit.checklist`** - Requirements quality checklist
6. **`speckit.analyze`** - Artifact consistency analysis
7. **`speckit.implement`** - Implementation (optional)

### Additional Commands (3)

8. **`speckit.test`** - ✅ Generate test plan and check coverage
9. **`speckit.docs`** - ✅ Generate documentation (API, guides, README)
10. **`speckit.review`** - ✅ Code review and quality check

### Release & Deploy Commands (2)

11. **`speckit.release`** - ✅ Prepare release (versioning, changelog, tags)
12. **`speckit.deploy`** - ✅ Check deployment readiness and generate deployment plan

**⚠️ Important**: `release` and `deploy` **DO NOT** auto-execute release/deployment. They only **prepare** everything (changelog, deployment plan, commands) for **manual execution**.

## Execution Order

```
1. /speckit.specify      → Creates specification
2. /speckit.clarify      → Clarifies specification
3. /speckit.plan         → Creates technical plan
4. /speckit.tasks        → Creates tasks
5. /speckit.checklist    → Creates checklists (after tasks)
6. /speckit.analyze      → Creates analysis (after tasks)
7. /speckit.implement    → Implementation (optional)
8. /speckit.test         → Test plan (after implement or before)
9. /speckit.docs         → Documentation (after implement)
10. /speckit.review      → Code review (before commit)
11. /speckit.release     → Release preparation (after all tasks)
12. /speckit.deploy      → Deployment readiness check (before deploy)
```

## Output Location

All documents saved in `apps/{app-name}/.specs/`:
- `{APP}_PLAN.md` - specification
- `IMPLEMENTATION_PLAN.md` - technical plan
- `tasks.md` - tasks
- `test-plan.md` - test plan (from test)
- `review-report.md` - code review report (from review)
- `API.md` - API documentation (from docs)
- `CHANGELOG.md` - changelog (from release)
- `RELEASE_NOTES.md` - release notes (from release)
- `deployment-plan.md` - deployment plan (from deploy)
- `deploy.sh` - deployment script (from deploy)
- `checklists/` - checklists
- `ANALYSIS_REPORT.md` - consistency analysis

## Command Descriptions

### `/speckit.test`

Generates test plan based on specification, plan, and tasks:
- Analyzes test requirements (unit, integration, E2E)
- Checks existing coverage
- Creates test templates
- Generates `test-plan.md`

**When to use**: After implementation or before starting for test planning.

### `/speckit.docs`

Generates documentation:
- API documentation
- README updates
- User guides
- Swagger annotations
- Usage examples

**When to use**: After implementation for automatic documentation generation.

### `/speckit.review`

Performs code review:
- Checks code quality
- Checks type safety (no `any`, `as`, `!`)
- Checks architecture compliance
- Checks security
- Checks test coverage
- Generates `review-report.md`

**When to use**: After implementation before commit.

### `/speckit.release`

Prepares release:
- Analyzes completed tasks
- Generates version (semantic versioning)
- Creates changelog
- Generates release notes
- Prepares git tags (commands for manual execution)

**⚠️ Safety**: Command **DOES NOT** create tags automatically, only prepares commands.

**When to use**: After all tasks completed, before release.

### `/speckit.deploy`

Checks deployment readiness:
- Checks prerequisites (tests, migrations, configuration)
- Generates deployment plan
- Creates deployment scripts
- Generates rollback plan
- Checks health checks

**⚠️ Safety**: Command **DOES NOT** execute deployment automatically, only prepares plan and scripts.

**When to use**: Before production deployment.

### `/runTask` - ✅ **New** - Automatic task execution

Automatically executes tasks from `apps/{project}/.specs/tasks.md`:
- Creates branch `t0-{project}` from `develop`
- For each task creates sub-branch `t0-{project}-T{number}`
- After each task checks: types, linter, functionality
- Merges to main branch after checks
- Has full development rules context

**Usage**: `/runTask {project-name}` (e.g., `/runTask api-admin`)

**When to use**: After creating `tasks.md` for automatic task execution.

**See details**: [`.cursor/commands/runTask.md`](./runTask.md)

## See Also

- [Full speckit guide](../../apps/api-admin/.specs/SPECKIT_WORKFLOW.md)
- [Quick reference](../../SPECKIT_COMMANDS.md)
- [Speckit rules](../speckit-rules.md)
- [Command /runTask](./runTask.md)
