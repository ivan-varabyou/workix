# Plan: Delete Old Specs Directory

**Status**: Ready for execution

## ⚠️ Critical Files to KEEP

These files are actively used and MUST be preserved:

### Active Task Files
- `.specify/specs/005-development-process/TASKS.md` - Active task tracking
- `.specify/specs/005-development-process/INTERMEDIATE_TASKS.md` - Intermediate tasks checklist
- `.specify/specs/005-development-process/TODO_TYPESCRIPT_TYPES_FIXES.md` - TypeScript fixes tracking

### Active Configuration Files
- `.specify/specs/005-development-process/DEVELOPMENT_RULES.md` - Detailed development rules (used by MCP)

## ✅ Safe to Delete

### Entire Directories (after migration)
- `.specify/specs/000-project/` - All migrated to `specs-optimized/`
- `.specify/specs/001-platform-foundation/` - Migrated
- `.specify/specs/002-git-workflow/` - Migrated
- `.specify/specs/003-frontend/` - Migrated
- `.specify/specs/003-mcp-integration-process/` - Migrated
- `.specify/specs/004-code-review-and-testing/` - Migrated
- `.specify/specs/006-workix-mcp-server/` - Migrated
- `.specify/specs/007-port-configuration/` - Migrated
- `.specify/specs/010-automation-mode/` - Migrated
- `.specify/specs/010-web-app/` - Migrated
- `.specify/specs/011-quality-assurance/` - Migrated
- `.specify/specs/012-api-gateway-operations/` - Migrated
- `.specify/specs/INDEX.md` - Replaced by `specs-optimized/index.md`

### History and Archives
- `.specify/specs/005-development-process/history/` - Archive, can be deleted

### Other Files in 005-development-process
All files except the 4 critical ones listed above can be deleted:
- `spec.md` - Migrated
- `AUTO_CONTINUE_WORKFLOW.md` - Migrated
- `AUTOGEN_KUBERNETES_INTEGRATION.md` - Migrated
- `AUTOGEN_OLLAMA_SETUP_CHECKLIST.md` - Migrated
- `E2E_TESTING_STRUCTURE.md` - Migrated
- `ESLINT_NX_CONFIGURATION.md` - Migrated
- `ESLINT_TAGS_SUMMARY.md` - Migrated
- `HISTORY_TRACKING.md` - Migrated
- `INTEGRATION_TYPES_COMPLETE.md` - Migrated
- `INTEGRATION_TYPES_STRATEGY.md` - Migrated
- `TASK_TIMING_TEMPLATE.md` - Migrated
- `TESTING_ARCHITECTURE.md` - Migrated
- `TYPESCRIPT_ANY_VS_UNKNOWN.md` - Migrated
- `TYPESCRIPT_TYPE_COVERAGE.md` - Migrated
- `WEBASSEMBLY_COMPATIBILITY.md` - Migrated

## 📋 Execution Steps

### Step 1: Backup Active Files
```bash
mkdir -p .specify/specs-backup/005-development-process
cp .specify/specs/005-development-process/TASKS.md .specify/specs-backup/005-development-process/
cp .specify/specs/005-development-process/INTERMEDIATE_TASKS.md .specify/specs-backup/005-development-process/
cp .specify/specs/005-development-process/TODO_TYPESCRIPT_TYPES_FIXES.md .specify/specs-backup/005-development-process/
cp .specify/specs/005-development-process/DEVELOPMENT_RULES.md .specify/specs-backup/005-development-process/
```

### Step 2: Delete Old Specs (except active files)
```bash
# Delete all directories except 005-development-process
rm -rf .specify/specs/000-project
rm -rf .specify/specs/001-platform-foundation
rm -rf .specify/specs/002-git-workflow
rm -rf .specify/specs/003-frontend
rm -rf .specify/specs/003-mcp-integration-process
rm -rf .specify/specs/004-code-review-and-testing
rm -rf .specify/specs/006-workix-mcp-server
rm -rf .specify/specs/007-port-configuration
rm -rf .specify/specs/010-automation-mode
rm -rf .specify/specs/010-web-app
rm -rf .specify/specs/011-quality-assurance
rm -rf .specify/specs/012-api-gateway-operations

# Delete INDEX.md
rm -f .specify/specs/INDEX.md

# Delete history
rm -rf .specify/specs/005-development-process/history

# Delete other files in 005-development-process (keep only 4 critical files)
cd .specify/specs/005-development-process
rm -f spec.md AUTO_CONTINUE_WORKFLOW.md AUTOGEN_KUBERNETES_INTEGRATION.md \
     AUTOGEN_OLLAMA_SETUP_CHECKLIST.md E2E_TESTING_STRUCTURE.md \
     ESLINT_NX_CONFIGURATION.md ESLINT_TAGS_SUMMARY.md HISTORY_TRACKING.md \
     INTEGRATION_TYPES_COMPLETE.md INTEGRATION_TYPES_STRATEGY.md \
     TASK_TIMING_TEMPLATE.md TESTING_ARCHITECTURE.md \
     TYPESCRIPT_ANY_VS_UNKNOWN.md TYPESCRIPT_TYPE_COVERAGE.md \
     WEBASSEMBLY_COMPATIBILITY.md
```

### Step 3: Verify Active Files Still Work
```bash
# Test MCP resources
npm run build --workspace=apps/mcp-server
npm run test --workspace=apps/mcp-server

# Test scripts
make fix-types-progress
```

## ✅ After Deletion

The old `.specify/specs/` directory will contain only:
- `005-development-process/TASKS.md`
- `005-development-process/INTERMEDIATE_TASKS.md`
- `005-development-process/TODO_TYPESCRIPT_TYPES_FIXES.md`
- `005-development-process/DEVELOPMENT_RULES.md`

All other specifications are in `.specify/specs-optimized/`.
