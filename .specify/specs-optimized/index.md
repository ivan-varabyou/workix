# Workix Project Specifications

**Version**: 3.1 (Optimized)
**Last Updated**: 2025-11-27

## About Workix

**Workix** is an **AI-Powered Visual Automation Platform** that enables users to create, run, and monitor AI-driven workflows without writing code.

### What is Workix?

Workix is a universal platform for creating virtual workers (marketers, designers, copywriters, content creators, etc.) using visual pipelines and AI agents. The platform combines:

- 🖼️ **Visual Pipeline Editor** - Drag-and-drop workflow creation
- 🤖 **AI-Powered Automation** - Multiple AI providers (OpenAI, Groq, Anthropic, etc.)
- 🔗 **Universal Integrations** - YouTube, TikTok, Instagram, Ozon, Wildberries, eBay, GitHub, GitLab, Slack, Telegram, Jira, Salesforce, AWS, Azure, GCP
- 📊 **Analytics & Insights** - Performance tracking, A/B testing, optimization
- 🔒 **Enterprise Security** - Multi-tenant, RBAC, API keys, rate limiting, audit logging
- 💰 **Built-in Billing** - Usage tracking, quotas, plans
- 🎨 **Content Generation** - Text, images, video, speech, translations

### Key Features

**AI Core:**
- 7 AI providers (OpenAI, Groq, Anthropic, Stability AI, Runway, ElevenLabs, Tavily)
- Intelligent router with weighted selection, failover, A/B testing
- 11 generation services (text, image, video, speech, vision, search, embeddings, context, translation, quality scoring)
- Cost tracking and execution metrics

**Integrations:**
- Universal integration framework with provider-agnostic abstraction
- Cloud providers (AWS, Azure, GCP)
- Code platforms (GitHub, GitLab)
- Communication (Slack, Telegram)
- E-commerce (Amazon, eBay, Ozon, Wildberries, Instagram, TikTok, YouTube)
- Project management (Jira, Salesforce)

**Platform:**
- Multi-tenant architecture
- Visual pipeline editor
- Virtual workers management
- A/B testing engine
- Universal analytics
- MCP server for AI agent integration

### Use Cases

- 🏢 **Business Process Automation** - Marketing workflows, reporting, approvals
- 📝 **Content Generation** - Auto-generate descriptions, articles, social posts
- 🔗 **Data Integration** - Connect multiple platforms, sync data
- 📈 **Analytics & Optimization** - Collect metrics, A/B test variations, optimize performance
- 🎯 **No-Code Workflows** - Complex automations without programming skills
- 🤖 **Virtual Workers** - Create AI-powered workers for specific tasks

### Technology Stack

- **Backend**: NestJS, TypeScript, Prisma, PostgreSQL
- **Frontend**: Angular 20, Signals, Zoneless, PrimeNG
- **Architecture**: NX Monorepo, Monolith-First strategy
- **AI**: Multiple providers with unified abstraction layer
- **Testing**: Vitest (backend), Jest (frontend), E2E tests
- **Documentation**: Swagger/OpenAPI, Storybook

### Architecture

- **Monolith-First**: Start with monolith, split to microservices when needed
- **NX Workspace**: All business logic in `libs/`, `apps/` only connects
- **Modular Design**: Backend/Frontend separation with Domain, Infrastructure, Entities, Integrations, Shared libraries
- **API Gateway**: Central entry point with routing, authentication, rate limiting
- **Library Structure**: `libs/backend/`, `libs/frontend/`, `libs/shared/` organization

## Purpose

Central index for all Workix project specifications. Provides navigation and routing to detailed documentation.

## Structure

```
specs-optimized/
├── index.md                    (this file - router)
├── TODO.md                     (optimization TODO list)
├── core/
│   ├── architecture.md         (monolith-first architecture)
│   ├── libraries.md            (all libraries structure)
│   ├── applications.md         (all applications structure)
│   ├── development.md          (development process & rules)
│   └── git-workflow.md         (git workflow & commits)
├── process/
│   ├── code-review.md          (code review & testing)
│   ├── testing.md              (testing architecture)
│   └── automation.md           (automation rules)
└── architecture/
    ├── platform.md             (platform foundation)
    ├── frontend.md             (Angular 20, Signals, UI components)
    ├── ai.md                   (AI providers, router, generation)
    ├── security.md             (authentication, RBAC, API keys, rate limiting)
    ├── api-gateway.md          (API gateway operations)
    ├── ports.md                (port configuration)
    └── integrations.md         (MCP & integrations)
```

## Quick Navigation

### Core Specifications
- **Architecture**: [core/architecture.md](./core/architecture.md) - Monolith-first strategy, structure, phases
- **Libraries**: [core/libraries.md](./core/libraries.md) - All libraries structure (domain, infrastructure, integrations, ai, shared, utilities)
- **Applications**: [core/applications.md](./core/applications.md) - All applications structure (backend, frontend, ports)
- **Development**: [core/development.md](./core/development.md) - Development process, rules, tasks
- **Git Workflow**: [core/git-workflow.md](./core/git-workflow.md) - Branching, commits, workflow

### Process Specifications
- **Code Review**: [process/code-review.md](./process/code-review.md) - Pre-commit checklist, testing
- **Testing**: [process/testing.md](./process/testing.md) - Testing architecture, coverage requirements
- **Automation**: [process/automation.md](./process/automation.md) - Auto-continue workflow, rules

### Architecture Specifications
- **Platform**: [architecture/platform.md](./architecture/platform.md) - Foundation, multi-tenancy
- **Frontend**: [architecture/frontend.md](./architecture/frontend.md) - Angular 20, Signals, UI components
- **AI**: [architecture/ai.md](./architecture/ai.md) - AI providers, router, generation services
- **Security**: [architecture/security.md](./architecture/security.md) - Authentication, RBAC, API keys, rate limiting
- **API Gateway**: [architecture/api-gateway.md](./architecture/api-gateway.md) - Gateway operations
- **Ports**: [architecture/ports.md](./architecture/ports.md) - Port configuration
- **Integrations**: [architecture/integrations.md](./architecture/integrations.md) - MCP, universal integrations
- **MCP Servers**: [architecture/mcp-servers.md](./architecture/mcp-servers.md) - MCP servers configuration, management

## Key Concepts

### Development Cycle
```
PLANNING → PREPARATION → WORKING → TESTING → DONE
```

### Rules
- Work only on task branches (`task-{number}`)
- Never switch branches during development
- All commits: English, lowercase
- Format: `T #{number} - {type}({scope}): description`
- Minimum 85% test coverage for shared libraries

## For AI Agents

1. **ALWAYS FIRST**: Check MCP servers - `make mcp-status` → `make mcp-start` if needed
2. Start with this index.md
3. Read core/development.md for process
4. Follow git-workflow.md for commits
5. Check process/code-review.md before commits

## Related Documentation

- Project README: `/README.md`
- App READMEs: `/apps/*/README.md` (link to this index)
- Full specs (legacy): `.specify/specs/` (being migrated)

## Package Configuration
Use scripts for run project only in package.json

### Root Package
- **Project package.json**: [`/package.json`](../../package.json) - Root dependencies, scripts, workspace configuration

### Application Packages
- **api-monolith**: Uses root package.json (NX workspace)
- **api-gateway**: Uses root package.json (NX workspace)
- **api-auth**: [`/apps/api-auth/package.json`](../../apps/api-auth/package.json) - Auth microservice dependencies
- **api-notifications**: [`/apps/api-notifications/package.json`](../../apps/api-notifications/package.json) - Notifications worker service dependencies
- **app-admin**: Uses root package.json (NX workspace)
- **app-web**: Uses root package.json (NX workspace)
- **mcp-server**: [`/apps/mcp-server/package.json`](../../apps/mcp-server/package.json) - MCP server dependencies

### Library Packages
- **Backend domain libraries**: Individual package.json files in `libs/backend/domain/*/package.json`
- **Backend infrastructure libraries**: Individual package.json files in `libs/backend/infrastructure/*/package.json`
- **Shared libraries**: [`/libs/shared/package.json`](../../libs/shared/package.json) - Shared dependencies
