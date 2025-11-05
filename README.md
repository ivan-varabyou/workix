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

- **Node.js** 18+ / **npm** 9+ or **pnpm** 8+
- **Docker** & **Docker Compose** (for database & services)
- **Nx** CLI: `npm install -g nx`
- **TypeScript** 5+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/workix.git
   cd workix
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the development environment**
   ```bash
   docker-compose up -d
   npm run dev
   # or with Nx
   nx serve backend-api
   nx serve web-admin
   nx serve web-client
   ```

5. **Access the applications**
   - Backend API: http://localhost:3333
   - Admin Dashboard: http://localhost:4200
   - Client App: http://localhost:4201
   - Swagger Docs: http://localhost:3333/api/docs

## 📚 Development Workflow

### Spec-Driven Development (SDD)

This project follows **Spec-Driven Development** methodology. Start here:

1. **Establish Principles** - Review `constitution.md`
2. **Create Specifications** - Check `specs/` directory
3. **Plan Implementation** - See `plan.md` files
4. **Implement** - Follow task breakdown in `tasks.md`

### Common Commands

```bash
# Nx Development Server
nx serve backend-api              # Start backend
nx serve web-admin                # Start admin dashboard
nx serve web-client               # Start client app

# Building
nx build backend-api              # Build backend
nx build web-admin                # Build admin
nx build web-client               # Build client

# Testing
nx test models                    # Test models library
nx test backend-api               # Test backend
nx e2e e2e-tests                  # End-to-end tests

# Linting & Formatting
nx lint                           # Lint all projects
nx format                         # Format code

# Database
npm run db:migrate                # Run migrations
npm run db:seed                   # Seed test data
npm run db:drop                   # Drop all tables

# Docker
docker-compose up -d              # Start services
docker-compose down               # Stop services
docker-compose logs -f            # View logs
```

### Project Configuration

- **Nx Configuration**: `nx.json`
- **TypeScript**: `tsconfig.base.json`
- **Package Manager**: `package.json`
- **Environment**: `.env.local` (create from `.env.example`)

## 🏛️ Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Angular 20 | UI framework (zoneless, signals) |
| **Backend** | NestJS | Modular, scalable server |
| **Database** | PostgreSQL 15+ | Relational data store |
| **ORM** | TypeORM | Database abstraction |
| **Testing** | Vitest | Fast unit testing |
| **Monorepo** | Nx | Workspace management |
| **Containerization** | Docker | Development & deployment |
| **Observability** | Prometheus + Grafana | Metrics & dashboards |
| **CI/CD** | GitHub Actions | Automated pipelines |

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
