# Migration Plan

**Status**: ✅ Complete

## Done ✅

- Core specs migrated
- MCP Resources: All updated (9 files)
  - ✅ specs-index.resource.ts → specs-optimized/index.md
  - ✅ development-process.resource.ts → specs-optimized/core/development.md
  - ✅ testing-guide.resource.ts → specs-optimized/process/testing.md
  - ✅ architecture-vision.resource.ts → specs-optimized/core/architecture.md
  - ✅ api-endpoints.resource.ts → specs-optimized/architecture/api-gateway.md
  - ✅ libs-structure.resource.ts → specs-optimized/core/libraries.md
  - ✅ apps-structure.resource.ts → specs-optimized/core/applications.md
  - ✅ architecture.resource.ts → updated references
  - ✅ project.tools.ts → updated references
- App READMEs: All updated
- Configuration files: Updated
  - ✅ .cursorrules → specs-optimized/index.md
  - ✅ README.md → updated spec links

## Kept in Old Location (Active Files)

- `tasks.resource.ts` → Keep old (TASKS.md) - Active task tracking
- `development-rules.resource.ts` → Keep old (DEVELOPMENT_RULES.md) - Detailed rules
- Scripts: Keep old references (TASKS.md, TODO_TYPESCRIPT_TYPES_FIXES.md) - Active files

## Strategy

✅ All migrated references updated. Active task files remain in old location for now.

## Cleanup Status

**Date**: 2025-11-17

✅ **Old specs directory cleaned up:**
- All migrated directories deleted
- INDEX.md deleted
- history/ deleted
- All obsolete files in 005-development-process/ deleted

**Remaining in `.specify/specs/`:**
- `005-development-process/TASKS.md` - Active task tracking
- `005-development-process/INTERMEDIATE_TASKS.md` - Intermediate tasks
- `005-development-process/TODO_TYPESCRIPT_TYPES_FIXES.md` - TypeScript fixes tracking
- `005-development-process/DEVELOPMENT_RULES.md` - Detailed development rules

**Backup**: `.specify/specs-backup/005-development-process/` contains backup of all active files.
