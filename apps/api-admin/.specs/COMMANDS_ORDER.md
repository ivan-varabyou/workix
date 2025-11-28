# Speckit Commands Order - Quick Reference

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
8. `/speckit.test` - ✅ Generate test plan
9. `/speckit.docs` - ✅ Generate documentation
10. `/speckit.review` - ✅ Code review

### Release & Deploy Commands (2)
11. `/speckit.release` - ✅ Prepare release (versioning, changelog)
12. `/speckit.deploy` - ✅ Check deployment readiness and plan

**Important**: Release and Deploy commands **DO NOT** auto-execute release/deployment, only **prepare** everything.

### Commands That Don't Exist
- `/speckit.monitor`, `/speckit.optimize`, `/speckit.refactor`, `/speckit.cleanup`, `/speckit.support`, `/speckit.improve`

**Total available**: 12 commands

## Important Notes

⚠️ **Correct order**:
1. `/speckit.specify` → creates specification in `.specs/`
2. `/speckit.clarify` → clarifies specification (updates file in `.specs/`)
3. `/speckit.plan` → creates technical plan in `.specs/`
4. `/speckit.tasks` → creates tasks in `.specs/`
5. `/speckit.checklist` → creates checklists in `.specs/checklists/` (**after tasks**)
6. `/speckit.analyze` → creates analysis in `.specs/` (**after tasks**)

**Note**: For Admin API, `checklist` and `analyze` were executed earlier for demo, but correct order is after `tasks`.
