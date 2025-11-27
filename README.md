# 🚀 Workix - Visual Automation Platform

> Empowering non-technical users to create, run, and monitor AI-driven workflows without writing code.

## 🎯 What is Workix?

**Workix** is a visual automation platform that combines:

- 🖼️ **Intuitive Visual Editor** - Drag-and-drop pipeline creation
- 🤖 **AI-Agent Integration** - Windsurf-powered automation with explainability
- 🔒 **Enterprise Security** - Multi-tenant, GDPR-compliant, approval gating
- 📊 **Full Observability** - Dashboards, alerts, runbooks, audit logs
- 💰 **Built-in Billing** - Usage tracking, quotas, plans
- 🔄 **Sandbox Execution** - Safe, reproducible, rollback-capable

### Use Cases

- 🏢 **Business Process Automation** - Streamline marketing, reporting, approvals
- 📝 **Content Generation** - Auto-generate descriptions, articles, social posts
- 🔗 **Data Integration** - Connect YouTube, Google Sheets, REST APIs
- 📈 **Analytics & Insights** - Collect, process, and transform data
- 🎯 **No-Code Workflows** - Complex automations without programming skills

## 🏗️ Project Structure

```
workix/
├── .specify/                          # Spec-Driven Development artifacts
│   ├── memory/
│   │   └── constitution.md           # Project principles & governance
│   ├── specs/
│   │   └── 001-platform-foundation/
│   │       ├── spec.md               # Requirements & user stories
│   │       ├── plan.md               # Technical implementation plan
│   │       ├── tasks.md              # Actionable task breakdown
│   │       └── contracts/            # API contracts & data models
│   ├── scripts/
│   │   └── bash/                     # Automation scripts
│   └── templates/
│       └── *.md                      # Specification templates
│
├── apps/                              # Application entry points
│   ├── backend-api/                  # NestJS backend server
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── auth/                 # Authentication module
│   │   │   ├── tenants/              # Multi-tenancy module
│   │   │   ├── pipelines/            # Pipeline management
│   │   │   └── ...
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── web-admin/                    # Admin dashboard (Angular)
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app/
│   │   │   │   ├── layouts/
│   │   │   │   ├── features/
│   │   │   │   └── services/
│   │   │   └── styles/
│   │   └── angular.json
│   │
│   └── web-client/                   # Client app (Angular)
│       ├── src/
│       │   ├── main.ts
│       │   ├── app/
│       │   │   ├── editor/           # Visual pipeline editor
│       │   │   ├── dashboard/        # User dashboard
│       │   │   └── services/
│       │   └── styles/
│       └── angular.json
│
├── libs/                              # Shared business logic & utilities
│   ├── models/
│   │   ├── entities/                 # TypeORM entities
│   │   │   ├── user.entity.ts
│   │   │   ├── organization.entity.ts
│   │   │   ├── pipeline.entity.ts
│   │   │   └── audit-log.entity.ts
│   │   └── dtos/                     # Data Transfer Objects
│   │       ├── auth.dto.ts
│   │       ├── pipeline.dto.ts
│   │       └── ...
│   │
│   ├── services/
│   │   ├── auth/                     # Authentication service
│   │   ├── tenant/                   # Multi-tenancy service
│   │   ├── pipeline/                 # Pipeline execution service
│   │   ├── observability/            # Logging & metrics
│   │   └── ai-agent/                 # AI-agent integration
│   │
│   ├── repositories/                 # Data access layer
│   │   ├── user.repository.ts
│   │   ├── pipeline.repository.ts
│   │   └── ...
│   │
│   ├── config/                       # Configuration management
│   │   ├── env.schema.ts             # Environment validation
│   │   ├── database.config.ts
│   │   └── ...
│   │
│   ├── guards/                       # NestJS guards
│   │   ├── auth.guard.ts
│   │   ├── tenant.guard.ts
│   │   └── ...
│   │
│   ├── interceptors/                 # NestJS interceptors
│   │   ├── logging.interceptor.ts
│   │   ├── error.interceptor.ts
│   │   └── ...
│   │
│   └── shared/                       # Utilities
│       ├── decorators/
│       ├── pipes/
│       ├── filters/
│       └── utils/
│
├── docker-compose.yml                # Development environment
├── Dockerfile                        # Multi-stage container build
├── Makefile                          # Common commands
├── nx.json                           # Nx workspace config
├── tsconfig.base.json                # TypeScript base config
├── package.json                      # Dependencies
├── .env.example                      # Environment template
├── .gitignore                        # Git ignores
└── README.md                         # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ / **npm** 10+
- **Nx** CLI: `npm install -g nx`
- **TypeScript** 5+

### Quick Start (Development)

```bash
# 1. Install dependencies
npm install

# 2. Start development environment (API + MCP Server)
npm run dev
```

This automatically starts:

- 🟢 **API Server** on http://localhost:7000
- 📡 **MCP Server** (for AI agent integration)
- 📚 **Swagger Docs** on http://localhost:7000/api/docs

### Installation (Detailed)

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/workix.git
   cd workix
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development environment**
   ```bash
   # Both API and MCP Server run together
   npm run dev
   ```

### Access Services

- **API**: http://localhost:7000
- **Swagger Docs**: http://localhost:7000/api/docs
- **Health Check**: http://localhost:7000/api/health
- **MCP Server**: Runs in background (Cursor/Windsurf integration)

### Configuration

Create `.env` file from template:

```bash
cp .env.example .env
# Edit if you want different ports
```

**Default Ports:**

- Monolith API: **7000**
- API Gateway: **7100**
- Debug Port: **9229**
- MCP Server: **9000**

## 📚 Development Workflow

### Development Mode (Always Run This)

```bash
# Start API Gateway + All MCP Servers
npm run dev

# Full development mode (Gateway + MCP + Admin + Web)
npm run dev:full

# Or run individually:
npm run api:serve         # API only
npm run dev:mcp-only      # MCP Server only

# MCP Servers management
npm run mcp:status        # Check MCP servers status
npm run mcp:start-all     # Start all MCP servers
npm run mcp:stop-all      # Stop all MCP servers
```

**Why MCP Server runs automatically?**

- ✅ AI agents (Claude/Cursor) stay in sync with your code
- ✅ New tools are instantly available
- ✅ Full project context preserved
- ✅ No manual updates needed

### Common Commands

**Always use `npm run` commands instead of `nx` directly** - they handle environment variables and ports correctly.

```bash
# Development (RECOMMENDED)
npm run dev                 # Start API + MCP Server together on port 4200
npm run dev:mcp-only        # Start MCP Server only

# API Server
npm run api:serve           # Development server with hot reload (port 4200)
npm run api:build           # Build for production
npm run api:start           # Run production build

# MCP Server
npm run mcp:dev             # Development mode
npm run mcp:build           # Build
npm run mcp:start           # Production mode

# IDE Integration
npm run setup:cursor        # Configure Cursor/Windsurf (one-time setup)

# Testing
npm run test                # Run tests in watch mode
npm run test:run            # Run tests once
npm run test:coverage       # Run tests with coverage
npm run test:ui             # Run with UI

# Code Quality
npx nx lint                 # Lint all projects
npx tsc --noEmit            # Type check
```

### Port Configuration

All ports are configured in `.env` file:

```bash
API_PORT=4200              # API server port
API_HOST=localhost         # API server host
MCP_PORT=9000              # MCP server port (future)
NODE_ENV=development
```

See [Port Configuration](./.specify/specs-optimized/architecture/ports.md) for details.

### Project Documentation

- 📖 [Development Guide](./DEVELOPMENT.md) - Quick start guide
- 📊 [Project Metrics](./.specify/specs/005-development-process/PROJECT_METRICS.md) - **Total hours, KPIs, productivity stats**
- 🏢 [Enterprise Process](./.specify/specs/008-enterprise-development-process/spec.md) - Complete enterprise development process
- 🤖 [Automation Framework](./.specify/specs/009-automation-framework/spec.md) - **Fully automated enterprise workflows**
- 📋 [Development Process](./.specify/specs-optimized/core/development.md) - Development process & rules
- 🔧 [Git Workflow](./.specify/specs-optimized/core/git-workflow.md) - Git conventions
- 🤖 [MCP Server](./.specify/specs/006-workix-mcp-server/spec.md) - AI agent integration
- 🔌 [Port Configuration](./.specify/specs-optimized/architecture/ports.md) - Port configuration
- ⏱️ [Task Timing Template](./.specify/specs/005-development-process/TASK_TIMING_TEMPLATE.md) - Time tracking template
- ✅ [Task List](./.specify/specs/005-development-process/TASKS.md) - Current tasks & timing

### Project Configuration

- **Nx Configuration**: `nx.json`
- **TypeScript**: `tsconfig.base.json`
- **Package Manager**: `package.json`
- **Environment**: `.env.local` (create from `.env.example`)

## 🏛️ Architecture

### Technology Stack

| Layer                | Technology           | Purpose                          |
| -------------------- | -------------------- | -------------------------------- |
| **Frontend**         | Angular 20           | UI framework (zoneless, signals) |
| **Backend**          | NestJS               | Modular, scalable server         |
| **Database**         | PostgreSQL 15+       | Relational data store            |
| **ORM**              | TypeORM              | Database abstraction             |
| **Testing**          | Vitest               | Fast unit testing                |
| **Monorepo**         | Nx                   | Workspace management             |
| **Containerization** | Docker               | Development & deployment         |
| **Observability**    | Prometheus + Grafana | Metrics & dashboards             |
| **CI/CD**            | GitHub Actions       | Automated pipelines              |

### Design Principles

- 🏗️ **SOLID** - Maintainable architecture
- 🔄 **DRY** - No code duplication
- ⚡ **YAGNI** - Only what's needed
- 🔒 **Security First** - Defense in depth
- 📊 **Observable** - Logs, metrics, traces
- 🚀 **Scalable** - Horizontal scaling ready

## 🔐 Security

### Key Features

- ✅ Multi-tenant data isolation
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Approval gating for critical operations
- ✅ Audit logging for all mutations
- ✅ Secrets management (Vault/Docker Secrets)
- ✅ Rate limiting & DDoS protection
- ✅ GDPR compliance

### Secrets Management

- All secrets in `.env` files (never committed)
- Environment validation through `config/env.schema.ts`
- Secrets scanning in CI/CD
- No logging of sensitive data

## 📊 Observability

### Monitoring

- **Metrics**: Prometheus exports at `/metrics`
- **Dashboards**: Grafana dashboards in `observability/dashboards/`
- **Logs**: Structured JSON logging
- **Alerts**: Defined in Alertmanager config

### Accessing Services

```bash
# Prometheus
http://localhost:9090

# Grafana
http://localhost:3000

# View logs
docker-compose logs -f backend-api
docker-compose logs -f postgres
```

## 🧪 Testing

### Test Organization

```
libs/models/__tests__/
├── entities/
├── dtos/
└── services/

apps/backend-api/__tests__/
├── auth/
├── tenants/
└── pipelines/
```

### Running Tests

```bash
# Unit tests
npm test

# Test with coverage
npm test -- --coverage

# E2E tests
npm run e2e

# Watch mode
npm test -- --watch
```

## 📦 Database

### PostgreSQL

Runs in Docker container via `docker-compose.yml`.

### TypeORM Migrations

```bash
# Generate migration
npm run typeorm migration:generate -- -n MigrationName

# Run migrations
npm run typeorm migration:run

# Revert last migration
npm run typeorm migration:revert
```

### Seed Data

```bash
npm run db:seed
```

## 🚢 Deployment

### Docker Build

```bash
docker build -t workix:latest .
docker run -p 3333:3333 workix:latest
```

### Environment Variables

See `.env.example` for all available configuration options.

### Production Checklist

- [ ] Environment variables set securely
- [ ] Database migrations run
- [ ] SSL/TLS enabled
- [ ] Observability configured
- [ ] Backups scheduled
- [ ] Disaster recovery tested

## 🤝 Contributing

1. Check the `constitution.md` for project principles
2. Read the relevant `spec.md` in `.specify/specs/`
3. Follow the task breakdown in `tasks.md`
4. Write tests first (TDD approach)
5. Submit pull request with clear description

## 📖 Documentation

### Key Documents

- 📋 **Constitution**: `.specify/memory/constitution.md`
- 📝 **Specification**: `.specify/specs/001-platform-foundation/spec.md`
- 🔧 **Plan**: `.specify/specs/001-platform-foundation/plan.md`
- ✅ **Tasks**: `.specify/specs/001-platform-foundation/tasks.md`
- 🔗 **API Docs**: `/api/docs` (Swagger)

### API Documentation

Swagger documentation is auto-generated and available at:

```
http://localhost:3333/api/docs
```

## 🆘 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# View logs
docker-compose logs postgres

# Rebuild containers
docker-compose down -v
docker-compose up -d
```

### Port Already in Use

```bash
# Find process using port 3333
lsof -i :3333

# Kill process
kill -9 <PID>
```

### TypeScript Errors

```bash
# Clear cache and rebuild
rm -rf dist/
npm run build

# Type check
npx tsc --noEmit
```

## 📞 Support

- 📧 Email: support@workix.io
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions
- 📚 Wiki: Documentation & FAQs

## 📄 License

MIT License - see LICENSE file for details

## 🙌 Acknowledgments

Built with ❤️ using:

- [NestJS](https://nestjs.com/)
- [Angular](https://angular.io/)
- [TypeORM](https://typeorm.io/)
- [Nx](https://nx.dev/)
- [PostgreSQL](https://www.postgresql.org/)

---

**Last Updated**: 2025-01-01
**Version**: 0.1.0-alpha
**Status**: Foundation phase 🚀
