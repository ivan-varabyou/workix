# Speckit Commands - Quick Reference

**Version**: 1.0
**Date**: 2025-11-27

## Execution Order

```
1. /speckit.specify      → Create specification
2. /speckit.clarify      → Clarify ambiguities
3. /speckit.plan         → Technical planning
4. /speckit.tasks        → Generate tasks
5. /speckit.checklist    → Quality checklist (after tasks)
6. /speckit.analyze      → Consistency analysis (after tasks)
7. /speckit.implement    → Implementation (optional)
```

## Document Storage

**For each app**: `apps/{app-name}/.specs/`

Example for Admin API:
```
apps/api-admin/.specs/
├── README.md                    # Structure description
├── ADMIN_API_PLAN.md            # spec.md (specification)
├── IMPLEMENTATION_PLAN.md       # plan.md (technical plan)
├── ADMIN_API_SECURITY.md        # Security cases
├── SPECKIT_WORKFLOW.md          # Full guide
├── COMMANDS_ORDER.md            # Quick reference
├── ANALYSIS_REPORT.md           # Consistency analysis
└── checklists/
    └── requirements-quality.md  # Quality checklist
```

## Available Commands

### Core Commands (7)
1. `/speckit.specify` - Create specification
2. `/speckit.clarify` - Clarify ambiguities
3. `/speckit.plan` - Technical planning
4. `/speckit.tasks` - Generate tasks
5. `/speckit.checklist` - Quality checklist
6. `/speckit.analyze` - Consistency analysis
7. `/speckit.implement` - Implementation

### Additional Commands (3)
8. `/speckit.test` - ✅ Generate test plan and check coverage
9. `/speckit.docs` - ✅ Generate documentation (API, guides, README)
10. `/speckit.review` - ✅ Code review and quality check

### Release & Deploy Commands (2)
11. `/speckit.release` - ✅ Prepare release (versioning, changelog, tags)
12. `/speckit.deploy` - ✅ Check deployment readiness and generate deployment plan

**Important**: These commands **DO NOT** auto-execute release/deployment, only **prepare** everything for manual execution.

### Automatic Execution (1 command)
13. `/runTask` - ✅ Automatic task execution from `apps/{project}/.specs/tasks.md`
   - Creates branch `t0-{project}` from `develop`
   - For each task creates sub-branch and executes
   - After each task checks: types, linter, functionality
   - Merges to main branch after checks
   - **Usage**: `/runTask {project-name}` (e.g., `/runTask api-admin`)
   - **See details**: `.cursor/commands/runTask.md`

### Commands That Don't Exist
❌ **NOT implemented**:
- `/speckit.monitor`, `/speckit.optimize`, `/speckit.refactor`
- `/speckit.cleanup`, `/speckit.support`, `/speckit.improve`

**Total available**: 13 commands (7 core + 3 additional + 2 release/deploy + 1 automatic execution)

## Quick Reference

- **Full guide**: `apps/api-admin/.specs/SPECKIT_WORKFLOW.md`
- **Quick reference**: `apps/api-admin/.specs/COMMANDS_ORDER.md`
- **Template for other apps**: `.specs-template/README.md`
