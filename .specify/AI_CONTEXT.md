# AI Assistant Context - Workix Platform

**Last Updated**: 2025-11-27
**Version**: 4.1 (Optimized)

## Purpose

This file provides AI agent (Cursor) with full context about Workix Platform project.

**IMPORTANT**:

1. Always start by reading `.specify/specs-optimized/index.md` for project structure!
2. For quick action reference see [AI_ACTIONS_REGISTRY.md](./AI_ACTIONS_REGISTRY.md)

## Main Specifications

### 1. Start Here

**File**: [`.specify/specs-optimized/index.md`](./specs-optimized/index.md)

**Read first!** Contains:
- Complete specs structure
- Links to all documents
- System logic
- Context usage rules

### 2. Development Process

**File**: [`.specify/specs-optimized/core/development.md`](./specs-optimized/core/development.md)

**Key rules**:
- SOLID principles
- DRY, KISS
- Testing (minimum 70%, 85%+ for shared libraries)
- Documentation required
- **🔴 CRITICAL: Never switch branches during development!**
- Use i18n (no hardcoded text!)
- Angular 20: signals, input()/output(), new control flow

### 3. Git Workflow

**File**: [`.specify/specs-optimized/core/git-workflow.md`](./specs-optimized/core/git-workflow.md)

**Commit format**: `T #{number} - {type}({scope}): description`

- Always create branches from `develop`
- Use correct commit format
- **All commits: English, lowercase only**
- **🔴 CRITICAL: Never switch branches during development!**

### 4. Testing

**File**: [`.specify/specs-optimized/process/code-review.md`](./specs-optimized/process/code-review.md)

**Requirements**:
- Minimum 70% coverage for regular code
- **Minimum 85% coverage for shared libraries** (critical!)
- Vitest for testing
- Storybook for UI components
- Integration tests required for services with external dependencies

## Project Structure

### Libraries Structure

```
libs/
├── backend/             # Backend-specific libraries
│   ├── domain/         # Business logic (auth, users, pipelines, rbac, webhooks, workflows, workers, admin, notifications, ab-testing, billing, ai)
│   ├── entities/       # Data models with business logic (domain and infrastructure entities)
│   ├── infrastructure/ # Infrastructure (database, prisma, message-broker, i18n, notifications, api-keys, testing, service-discovery, performance, ai)
│   ├── integrations/   # External integrations (cloud, code, communication, e-commerce, project-management, core, ai providers)
│   └── shared/         # Backend shared libraries (core, utilities)
├── frontend/           # Frontend-specific libraries
│   ├── entities/       # Frontend data models
│   ├── features/       # Frontend features
│   └── shared/         # Frontend shared libraries (core, api, ui)
└── shared/             # Platform-agnostic shared libraries
    └── utils/          # Common utilities (date, string, validation)
```

**Documentation**: [core/libraries.md](./specs-optimized/core/libraries.md)

**Note**: Structure updated 2025-11-27. Libraries now organized by platform (`backend/`, `frontend/`) and purpose (`domain/`, `infrastructure/`, `entities/`, `shared/`, `integrations/`).

### Applications Structure

```
apps/
├── api-gateway/         # API Gateway (port 7000 → DB 5000)
├── api-monolith/        # Monolith API (port 7101 → DB 5101)
├── api-auth/           # Auth service (port 7102 → DB 5102)
├── api-notifications/  # Notifications (port 7103 → DB 5103)
├── app-admin/          # Admin frontend (port 7300)
├── app-web/            # Web frontend (port 7301)
└── mcp-server/         # MCP server
```

**Documentation**: [core/applications.md](./specs-optimized/core/applications.md)

## Development Cycle

```
PLANNING → PREPARATION → WORKING → TESTING → DONE
```

## Critical Rules

### 1. Work Only on Task Branch!

**❌ FORBIDDEN:**
- Switch to other branches during development
- Work on multiple branches simultaneously

**✅ REQUIRED:**
- Work only on task branch (`task-{number}`)
- All changes only on current task branch
- Never switch branches until task complete

### 2. Shared Libraries Testing

**🔴 CRITICAL RULE:**
- Minimum 85% coverage for shared libraries
- Vitest for testing
- Storybook for UI components
- Integration tests required

### 3. Use i18n

**❌ FORBIDDEN:**
- Hardcoded text in code
- Strings directly in components/services

**✅ REQUIRED:**
- Use I18nService for all texts
- Add translation keys (en, ru, ar)

## Quick Navigation

### Core Specifications
- **Architecture**: [specs-optimized/core/architecture.md](./specs-optimized/core/architecture.md)
- **Libraries**: [specs-optimized/core/libraries.md](./specs-optimized/core/libraries.md)
- **Applications**: [specs-optimized/core/applications.md](./specs-optimized/core/applications.md)
- **Development**: [specs-optimized/core/development.md](./specs-optimized/core/development.md)
- **Git Workflow**: [specs-optimized/core/git-workflow.md](./specs-optimized/core/git-workflow.md)

### Process Specifications
- **Code Review**: [specs-optimized/process/code-review.md](./specs-optimized/process/code-review.md)
- **Automation**: [specs-optimized/process/automation.md](./specs-optimized/process/automation.md)

### Architecture Specifications
- **Platform**: [specs-optimized/architecture/platform.md](./specs-optimized/architecture/platform.md)
- **API Gateway**: [specs-optimized/architecture/api-gateway.md](./specs-optimized/architecture/api-gateway.md)
- **Ports**: [specs-optimized/architecture/ports.md](./specs-optimized/architecture/ports.md)
- **Integrations**: [specs-optimized/architecture/integrations.md](./specs-optimized/architecture/integrations.md)

## Pre-Work Checklist

1. ✅ Read [specs-optimized/index.md](./specs-optimized/index.md) for structure
2. ✅ Check current branch (should be `task-{number}`)
3. ✅ **Check MCP servers**: `make mcp-status` → if not running: `make mcp-start`
4. ✅ Read [specs-optimized/core/development.md](./specs-optimized/core/development.md)
5. ✅ Follow development rules
6. ✅ Use correct commit format
7. ✅ Never switch branches during development

## MCP Servers (Always Check First!)

**Available**: Workix MCP (project tools), Ollama (LLM models), TypeScript (type check), NX (workspace)
**Commands**: `make mcp-status`, `make mcp-start`, `make mcp-stop`

## Related Documentation

- **Main Index**: [specs-optimized/index.md](./specs-optimized/index.md) - **START HERE!**
- **Legacy Specs**: [specs/INDEX.md](./specs/INDEX.md) (being migrated)
- **Project README**: `/README.md`
- **App READMEs**: `/apps/*/README.md` (link to specs-optimized)

---

**Note**: This file is automatically updated. Always check link validity in [specs-optimized/index.md](./specs-optimized/index.md).
