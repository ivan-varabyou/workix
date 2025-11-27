/**
 * Architecture Resource
 *
 * Provides project architecture overview
 */

import { MCPResource } from '../types.js';

export function getArchitectureResource(): MCPResource {
  return {
    uri: 'workix://architecture',
    name: 'Project Architecture',
    description: 'Workix project structure and architecture',
    mimeType: 'text/markdown',
    getContent: () => `
# Workix Project Architecture

## Overview

Workix is a visual automation platform built with Nx monorepo structure using NestJS backend and Angular frontends.

## Structure

### Apps (Application Entry Points)

- **api** - NestJS Backend API
  - REST endpoints
  - Swagger documentation at /docs
  - Health check at /health

- **admin** - Admin Dashboard (Angular)
  - Admin panel
  - User management
  - Pipeline management

- **client** - Client Application (Angular)
  - End-user interface
  - Pipeline execution
  - Results visualization

- **mcp-server** - AI Integration Server
  - MCP Protocol implementation
  - Tools for AI agents
  - API documentation resources

### Libs (Reusable Business Logic)

All business logic is in \`libs/\` to maximize reusability across apps.

#### Domain Libraries

- **auth** - Authentication & Authorization
  - User login/register
  - JWT handling
  - Role-based access control (RBAC)
  - Modules: services, guards, decorators, entities

- **users** - User Management
  - User CRUD operations
  - User profiles
  - User roles and permissions
  - Modules: services, repositories, entities

- **pipelines** - Pipeline/Workflow Logic
  - Pipeline creation and management
  - Step execution
  - Pipeline status tracking
  - Modules: services, repositories, entities

#### Infrastructure Libraries

- **database** - Database Configuration
  - TypeORM/Sequelize setup
  - Connection management
  - Migrations

- **config** - Configuration Management
  - Environment variables
  - Configuration validation
  - Feature flags

- **models** - Shared Entities & Interfaces
  - Common interfaces
  - Entity definitions
  - DTOs

#### Shared Library

- **shared** - Common Utilities
  - Email validators
  - Common decorators
  - Common pipes
  - Error filters
  - Utility functions

## Import Pattern

### ✅ Correct Import

From apps, import from libs:

\`\`\`typescript
// apps/api/src/users/users.controller.ts
\`\`\`

### ✅ Library Exports

Each library has an \`index.ts\` that exports public API:

\`\`\`typescript
// libs/auth/src/index.ts
export * from './services/auth.service';
export * from './entities/user.entity';
export * from './auth.module';
\`\`\`

## Dependencies

### No Circular Dependencies

\`\`\`
apps/api -> libs/auth -> libs/database OK
apps/api -> libs/users -> libs/auth OK
                              |
                        libs/shared OK
\`\`\`

## Technology Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: NestJS
- **ORM**: TypeORM
- **Testing**: Vitest
- **API Docs**: Swagger/OpenAPI

### Frontend
- **Framework**: Angular
- **Package Manager**: npm
- **Build Tool**: Nx/Webpack

### Development Tools
- **Monorepo**: Nx
- **Language**: TypeScript
- **MCP**: Model Context Protocol
- **Git Workflow**: Feature branching

## Module Structure Example

\`\`\`typescript
// libs/auth/src/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService], // Export for other libs/apps
})
export class AuthModule {}
\`\`\`

## Development Workflow

1. **Create task** in TASKS.md
2. **Design entities** - in libs/models
3. **Implement services** - in libs/{domain}
4. **Create controllers** - in apps/api
5. **Add tests** - in same location
6. **Update MCP Server** - add tools for new functionality
7. **Commit** - with proper format and scope

## Best Practices

- ✅ Libs contain business logic
- ✅ Apps contain only HTTP/UI concerns
- ✅ Use dependency injection
- ✅ Export only public API from libs
- ✅ No hardcoding - use ConfigService
- ✅ Follow SOLID principles
- ✅ Minimal coupling between modules
- ✅ Maximum cohesion within modules

---

For more details, see:
- [Development Rules](../../../.specify/specs-optimized/core/development.md)
- [Git Workflow](../../../.specify/specs-optimized/core/git-workflow.md)
    `,
  };
}
