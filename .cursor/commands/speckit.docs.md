---
description: Generate comprehensive documentation for the feature including API docs, guides, and README updates
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Goal

Generate comprehensive documentation for the feature including API documentation, user guides, developer guides, and README updates based on spec.md, plan.md, and implementation.

## Operating Constraints

**Documentation Location**:
- API docs → `FEATURE_DIR/API.md` or Swagger annotations
- User guides → `.docs/guides/`
- Developer guides → `FEATURE_DIR/README.md` or `.docs/guides/`
- Feature docs → `FEATURE_DIR/.specs/` (already exists)

## Execution Steps

### 1. Initialize Context

Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS. Derive absolute paths:
- SPEC = FEATURE_DIR/spec.md (or {APP}_PLAN.md)
- PLAN = FEATURE_DIR/plan.md (or IMPLEMENTATION_PLAN.md)
- TASKS = FEATURE_DIR/tasks.md

For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

### 2. Load Artifacts

Load context from:
- spec.md: Functional requirements, API endpoints, use cases
- plan.md: Technical architecture, data models, integrations
- Implementation code (if exists): Controllers, services, DTOs

### 3. Generate API Documentation

Create `FEATURE_DIR/API.md` with:

```markdown
# {Feature Name} API Documentation

## Base URL
{base_url}

## Authentication
{authentication_method}

## Endpoints

### {Endpoint Name}
**Method**: {GET|POST|PUT|DELETE|PATCH}
**Path**: {/path}
**Description**: {description}

**Request**:
\`\`\`json
{request_example}
\`\`\`

**Response**:
\`\`\`json
{response_example}
\`\`\`

**Status Codes**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error
```

### 4. Generate Developer Guide

Create or update `FEATURE_DIR/README.md` with:

```markdown
# {Feature Name}

## Overview
{description from spec}

## Architecture
{architecture from plan}

## Setup
{setup instructions}

## Usage
{usage examples}

## API Reference
See [API.md](./API.md)

## Testing
{testing instructions}

## Related Documentation
- [Specification](./.specs/{APP}_PLAN.md)
- [Implementation Plan](./.specs/IMPLEMENTATION_PLAN.md)
```

### 5. Generate User Guide (if applicable)

Create `.docs/guides/{feature-name}.md` with:
- Quick start
- Common use cases
- Troubleshooting
- FAQ

### 6. Update Swagger Annotations

If implementation exists, suggest Swagger annotations:

```typescript
@ApiOperation({ summary: 'Description', description: 'Detailed description' })
@ApiResponse({ status: 200, description: 'Success', type: ResponseDto })
@ApiResponse({ status: 400, description: 'Bad Request' })
```

### 7. Generate Code Examples

Include code examples for:
- Basic usage
- Advanced scenarios
- Error handling
- Integration examples

### 8. Create Documentation Index

Update or create documentation index linking all generated docs.

## Output Files

- `FEATURE_DIR/API.md` - API documentation
- `FEATURE_DIR/README.md` - Developer guide (update or create)
- `.docs/guides/{feature-name}.md` - User guide (if applicable)
- Swagger annotations suggestions (in code comments)

## Documentation Standards

- Use clear, concise language
- Include code examples
- Document all public APIs
- Include error cases
- Add troubleshooting sections
- Keep documentation up-to-date with code

## Related Documentation

- [Development Process](../../.specify/specs-optimized/core/development.md)
- [API Gateway Documentation](../../.specify/specs-optimized/architecture/api-gateway.md)
