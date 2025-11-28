# Quick Start: MD Files Organization

## 🚀 30 Seconds

```bash
# Organize all MD files
make docs-organize

# Archive old files (>30 days)
make docs-archive

# Cleanup temporary files (>7 days)
make docs-cleanup
```

## 📋 What Each Command Does

### `make docs-organize`
- Scans project root for MD files
- Classifies by rules
- Moves to correct folders:
  - `ARCHITECTURE_*.md` → `.docs/architecture/`
  - `MIGRATION_*.md` → `.docs/archive/migrations/`
  - `LIBS_STRUCTURE_*.md` → `.docs/archive/structure/`
  - etc.

### `make docs-archive`
- Finds files older than 30 days
- Moves to `.docs/archive/`
- Creates archive index

### `make docs-cleanup`
- Deletes temporary files (`TEMP_*.md` immediately)
- Deletes old reports (>7 days)
- Cleans empty folders

## 📁 Structure After Organization

```
.docs/
├── architecture/          # Architecture documentation
├── guides/               # Guides
├── api/                  # API documentation
├── archive/              # Archived documents
│   ├── migrations/
│   ├── refactoring/
│   ├── analysis/
│   └── plans/
└── reports/              # Temporary reports

apps/{app}/.specs/        # App specifications
.specify/specs-optimized/ # System specifications
```

## ✅ Exceptions (Stay in Root)

- `README.md`
- `TASKS.md`
- `SPECKIT_COMMANDS.md`

## 🔄 Recommended Workflow

1. **After creating MD file**: `make docs-organize`
2. **Weekly**: `make docs-archive`
3. **Daily**: `make docs-cleanup`

## 📚 More Info

- [Full rules](../.specify/docs-organization.md)
- [AI agent rules](../.cursor/docs-rules.md)
- [Project documentation](./README.md)
