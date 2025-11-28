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

## Document Structure

All specifications stored in `apps/api-admin/.specs/`:
- `ADMIN_API_PLAN.md` - Specification
- `IMPLEMENTATION_PLAN.md` - Implementation plan
- `ADMIN_API_SECURITY.md` - Security cases
- `SPECKIT_WORKFLOW.md` - Full guide
- `checklists/` - Quality checklists

## NX Monorepo Notes

- `api-auth` → `libs/backend/domain/auth` (User)
- `api-admin` → `libs/backend/domain/admin` (Admin)
- Changes in `admin` **DO NOT affect** `api-auth`
- Shared libraries (`infrastructure/*`) affect both APIs
