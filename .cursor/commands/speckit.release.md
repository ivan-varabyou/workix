---
description: Prepare release by generating version, changelog, release notes, and git tags based on completed tasks
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Goal

Prepare a release by analyzing completed tasks, generating version number, changelog, release notes, and preparing git tags. This command **does NOT** perform the actual release - it only prepares all necessary artifacts.

## Operating Constraints

**READ-ONLY for git operations**: This command generates release artifacts but does NOT:
- Create git tags automatically
- Push to remote
- Merge branches
- Modify package.json version

**User must manually**:
- Review generated artifacts
- Create git tag: `git tag v{version}`
- Push tag: `git push origin v{version}`
- Update package.json version if needed

## Execution Steps

### 1. Initialize Context

Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS. Derive absolute paths:
- SPEC = FEATURE_DIR/spec.md (or {APP}_PLAN.md)
- PLAN = FEATURE_DIR/plan.md (or IMPLEMENTATION_PLAN.md)
- TASKS = FEATURE_DIR/tasks.md
- ROOT = Project root

For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

### 2. Analyze Completed Tasks

Load tasks.md and identify:
- Completed tasks (status: `done`, `completed`)
- Task types (feat, fix, docs, refactor, test, chore)
- Task scopes (modules affected)
- Breaking changes (if any)

### 3. Determine Version

Based on completed tasks, suggest version bump:
- **MAJOR** (x.0.0): Breaking changes, major features
- **MINOR** (0.x.0): New features, backward compatible
- **PATCH** (0.0.x): Bug fixes, patches

Read current version from `package.json` and suggest next version.

### 4. Generate Changelog

Create `FEATURE_DIR/CHANGELOG.md` or update root `CHANGELOG.md` with:

```markdown
# Changelog

## [Version] - {Date}

### Added
- {Feature from completed tasks}

### Changed
- {Changes from completed tasks}

### Fixed
- {Bug fixes from completed tasks}

### Deprecated
- {Deprecated features}

### Removed
- {Removed features}

### Security
- {Security fixes}
```

### 5. Generate Release Notes

Create `FEATURE_DIR/RELEASE_NOTES.md` with:

```markdown
# Release Notes - v{version}

## Overview
{Summary of release}

## What's New
{New features with descriptions}

## Improvements
{Improvements and enhancements}

## Bug Fixes
{Bug fixes with issue references}

## Breaking Changes
{Breaking changes with migration guide}

## Upgrade Guide
{Steps to upgrade}

## Contributors
{List of contributors}
```

### 6. Generate Git Tag Command

Create `FEATURE_DIR/release-commands.sh` with:

```bash
#!/bin/bash
# Release commands for v{version}

# 1. Review generated artifacts
echo "Review CHANGELOG.md and RELEASE_NOTES.md"

# 2. Update version in package.json (if needed)
# npm version {version} --no-git-tag-version

# 3. Create git tag
git tag -a v{version} -m "Release v{version}"

# 4. Push tag to remote
git push origin v{version}

# 5. Create GitHub release (if applicable)
# gh release create v{version} --title "Release v{version}" --notes-file RELEASE_NOTES.md
```

### 7. Check Release Readiness

Verify:
- [ ] All critical tasks completed
- [ ] Tests passing
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Migration guide (if breaking changes)
- [ ] Security review passed

### 8. Generate Release Checklist

Create `FEATURE_DIR/release-checklist.md`:

```markdown
# Release Checklist - v{version}

## Pre-Release
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Changelog reviewed
- [ ] Release notes reviewed
- [ ] Version number confirmed
- [ ] Breaking changes documented

## Release
- [ ] Create git tag
- [ ] Push tag to remote
- [ ] Update package.json version (if needed)
- [ ] Create GitHub release (if applicable)

## Post-Release
- [ ] Verify deployment
- [ ] Monitor logs
- [ ] Update documentation
- [ ] Notify team
```

## Output Files

- `FEATURE_DIR/CHANGELOG.md` - Changelog for this release
- `FEATURE_DIR/RELEASE_NOTES.md` - Release notes
- `FEATURE_DIR/release-commands.sh` - Git commands (manual execution)
- `FEATURE_DIR/release-checklist.md` - Release checklist

## Version Format

Follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

## Git Workflow Integration

This command integrates with project git workflow:
- Tags format: `v{version}` (e.g., `v1.2.3`)
- Branch: Usually from `develop` or `main`
- Commit format: `T #{number} - {type}({scope}): description`

## Related Documentation

- [Git Workflow](../../.specify/specs-optimized/core/git-workflow.md)
- [Development Process](../../.specify/specs-optimized/core/development.md)
