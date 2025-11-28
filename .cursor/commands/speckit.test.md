---
description: Generate test plan and verify test coverage for the feature based on spec.md, plan.md, and tasks.md
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Goal

Generate a comprehensive test plan and verify test coverage requirements based on the feature specification, implementation plan, and tasks. This command helps ensure that all critical functionality is properly tested before implementation.

## Operating Constraints

**READ-ONLY for existing code**: Do not modify existing test files unless explicitly requested. Generate test plans and recommendations.

**Test Coverage Requirements**:
- Regular code: 70% minimum
- Shared libraries: **85%+ mandatory** (critical!)
- UI components: Storybook stories required

## Execution Steps

### 1. Initialize Context

Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS. Derive absolute paths:
- SPEC = FEATURE_DIR/spec.md (or {APP}_PLAN.md)
- PLAN = FEATURE_DIR/plan.md (or IMPLEMENTATION_PLAN.md)
- TASKS = FEATURE_DIR/tasks.md

For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

### 2. Load Artifacts

Load minimal necessary context:
- **From spec.md**: Functional requirements, API endpoints, security requirements
- **From plan.md**: Technical architecture, data models, integrations
- **From tasks.md**: Implementation tasks that require testing

### 3. Analyze Test Requirements

For each functional requirement and task:

**Unit Tests** (libs/*/services/*.spec.ts):
- Business logic in services
- Individual functions/methods
- Edge cases and error handling
- Data validation

**Integration Tests** (apps/*/integration/*.spec.ts):
- Service + Database interactions
- External service integrations
- Data flow between components
- API endpoint testing

**E2E Tests** (apps-e2e/src/**/*.spec.ts):
- Full API flow through Gateway
- End-to-end user scenarios
- Cross-service communication
- Critical user journeys

**Controller Tests** (apps/*/controllers/*.spec.ts):
- HTTP endpoints
- Request/response validation
- Error handling
- Authentication/Authorization

### 4. Generate Test Plan

Create `FEATURE_DIR/test-plan.md` with:

```markdown
# Test Plan for {Feature Name}

## Test Coverage Requirements
- Unit Tests: [count] required
- Integration Tests: [count] required
- E2E Tests: [count] required
- Controller Tests: [count] required

## Unit Tests
### Service: {ServiceName}
- [ ] Test: {test case description}
- [ ] Test: {test case description}

## Integration Tests
### Endpoint: {Endpoint}
- [ ] Test: {test case description}

## E2E Tests
### Scenario: {Scenario}
- [ ] Test: {test case description}

## Critical Areas (Must Have Tests)
- [ ] Authentication & Authorization
- [ ] Data persistence (DB operations)
- [ ] Core API endpoints
- [ ] Error handling
- [ ] Data validation
- [ ] Multi-tenancy isolation (if applicable)
- [ ] External integrations (if applicable)
```

### 5. Check Existing Test Coverage

If tests already exist:
- Analyze existing test files
- Identify gaps in coverage
- Recommend additional tests needed
- Check if coverage meets requirements (70% regular, 85% shared libraries)

### 6. Generate Test Templates

For each service/controller that needs tests, generate template code:

```typescript
// Example template for service test
describe('{ServiceName}', () => {
  let service: {ServiceName};
  let prisma: PrismaService;

  beforeEach(async () => {
    // Setup
  });

  describe('{method}', () => {
    it('should {expected behavior}', async () => {
      // Test implementation
    });

    it('should throw error on {error condition}', async () => {
      // Error test
    });
  });
});
```

### 7. Report Test Status

Create summary table:

| Test Type | Required | Existing | Missing | Status |
|-----------|----------|----------|---------|--------|
| Unit | X | Y | Z | ✓/✗ |
| Integration | X | Y | Z | ✓/✗ |
| E2E | X | Y | Z | ✓/✗ |
| Controller | X | Y | Z | ✓/✗ |

### 8. Recommendations

Provide recommendations:
- Which tests to write first (critical path)
- Test execution commands
- Coverage goals
- Test data setup requirements

## Output Files

- `FEATURE_DIR/test-plan.md` - Comprehensive test plan
- `FEATURE_DIR/test-templates/` - Generated test templates (optional)

## Test Execution Commands

Include in output:
```bash
# Unit tests
npm run test:run

# Integration tests
npm run test:{app}:integration

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## Related Documentation

- [Testing Architecture](../../.specify/specs-optimized/process/testing.md)
- [Code Review Process](../../.specify/specs-optimized/process/code-review.md)
