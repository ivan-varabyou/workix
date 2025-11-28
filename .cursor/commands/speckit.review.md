---
description: Perform code review checklist and quality analysis for implemented feature
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Goal

Perform comprehensive code review checklist and quality analysis for the implemented feature, ensuring compliance with project standards, best practices, and requirements.

## Operating Constraints

**READ-ONLY**: Do not modify code. Only analyze and report issues.

**Review Criteria**:
- Code quality and style
- Type safety (no `any`, `as`, `!`)
- Test coverage
- Documentation
- Security
- Performance
- Architecture compliance

## Execution Steps

### 1. Initialize Context

Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS. Derive absolute paths:
- SPEC = FEATURE_DIR/spec.md (or {APP}_PLAN.md)
- PLAN = FEATURE_DIR/plan.md (or IMPLEMENTATION_PLAN.md)
- TASKS = FEATURE_DIR/tasks.md
- CODE = Implementation files

For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

### 2. Load Artifacts

Load context from:
- spec.md: Requirements to verify
- plan.md: Architecture to verify
- Implementation code: Files to review

### 3. Code Quality Review

Check for:

**Type Safety**:
- [ ] No `any` types (except documented exceptions)
- [ ] No `as` type assertions
- [ ] No `!` non-null assertions
- [ ] Proper use of `unknown` with type guards
- [ ] All types explicitly defined

**Code Style**:
- [ ] Follows project conventions
- [ ] Proper naming (camelCase, PascalCase)
- [ ] Consistent formatting
- [ ] No magic numbers/strings
- [ ] Proper error handling

**SOLID Principles**:
- [ ] Single Responsibility
- [ ] Open/Closed
- [ ] Liskov Substitution
- [ ] Interface Segregation
- [ ] Dependency Inversion

### 4. Architecture Compliance

Verify:
- [ ] Follows NX monorepo structure
- [ ] Business logic in `libs/backend/domain/`
- [ ] Infrastructure in `libs/backend/infrastructure/`
- [ ] Apps only import and call libraries
- [ ] No business logic in apps
- [ ] Proper dependency injection

### 5. Security Review

Check:
- [ ] Authentication/Authorization implemented
- [ ] Input validation
- [ ] SQL injection prevention (Prisma parameterized queries)
- [ ] XSS prevention
- [ ] CSRF protection (if applicable)
- [ ] Rate limiting (if applicable)
- [ ] Sensitive data handling
- [ ] Error messages don't leak sensitive info

### 6. Test Coverage Review

Verify:
- [ ] Unit tests for services
- [ ] Integration tests for APIs
- [ ] E2E tests for critical flows
- [ ] Coverage meets requirements (70% regular, 85% shared)
- [ ] Tests are meaningful (not just coverage)

### 7. Documentation Review

Check:
- [ ] README updated
- [ ] API documentation exists
- [ ] Code comments for complex logic
- [ ] Swagger annotations (if applicable)
- [ ] Type definitions documented

### 8. Performance Review

Check:
- [ ] Database queries optimized
- [ ] No N+1 queries
- [ ] Proper indexing
- [ ] Caching where appropriate
- [ ] Async operations properly handled

### 9. Generate Review Report

Create `FEATURE_DIR/review-report.md`:

```markdown
# Code Review Report for {Feature Name}

## Summary
- Total Issues: X
- Critical: Y
- High: Z
- Medium: A
- Low: B

## Code Quality
### Type Safety
- [ ] All types explicit
- [ ] No `any` usage
- [ ] No unsafe assertions

### Code Style
- [ ] Follows conventions
- [ ] Proper naming
- [ ] Consistent formatting

## Architecture
- [ ] Follows NX structure
- [ ] Business logic in libs
- [ ] Proper dependencies

## Security
- [ ] Authentication implemented
- [ ] Input validation
- [ ] No security vulnerabilities

## Tests
- [ ] Unit tests: X/Y
- [ ] Integration tests: X/Y
- [ ] E2E tests: X/Y
- [ ] Coverage: X%

## Issues

### Critical
1. {Issue description}
   - File: {file}
   - Line: {line}
   - Fix: {suggestion}

### High
1. {Issue description}

## Recommendations
1. {Recommendation}
2. {Recommendation}
```

### 10. Pre-Commit Checklist

Verify:
- [ ] TypeScript compilation: `npx tsc --noEmit`
- [ ] All tests pass: `npm run test:run`
- [ ] Linting: `npx nx lint`
- [ ] Coverage meets requirements
- [ ] Documentation updated

## Output Files

- `FEATURE_DIR/review-report.md` - Comprehensive review report

## Review Checklist Template

```markdown
## Pre-Commit Checklist

### 1. TypeScript Types
- [ ] `npx tsc --noEmit` - No errors
- [ ] No type errors
- [ ] No compilation errors

### 2. Tests
- [ ] `npm run test:run` - All pass
- [ ] Tests for new features
- [ ] Coverage meets requirements

### 3. Linting
- [ ] `npx nx lint` - No errors
- [ ] `npx prettier --write .` - Formatted

### 4. Functional Check
- [ ] App starts without errors
- [ ] Endpoints work
- [ ] Swagger docs available
```

## Related Documentation

- [Code Review Process](../../.specify/specs-optimized/process/code-review.md)
- [Development Rules](../../.specify/specs-optimized/core/development.md)
- [Testing Architecture](../../.specify/specs-optimized/process/testing.md)
