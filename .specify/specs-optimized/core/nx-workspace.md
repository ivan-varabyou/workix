# NX Workspace Specification

**Version**: 1.0
**Last Updated**: 2025-11-23

## Overview

Workix Platform uses **NX** as its build system and monorepo management tool. NX helps in managing multiple applications and libraries within a single repository, ensuring efficient builds, testing, and code sharing.

## Configuration Files

### `nx.json`
Located at the root, this file configures the NX CLI and plugins.
- **Plugins**:
  - `@nx/nest`: For NestJS backend applications.
  - `@nx/webpack/plugin`: For Webpack-based builds.
  - `@nx/storybook/plugin`: For Storybook integration.
  - `@nx/js/typescript`: For TypeScript support.
- **Target Defaults**: Defines default options for targets like `build`, `serve`, `test`.

### `project.json`
Located at the root (and in each project), this file defines project-specific targets and configuration.
- **Root `project.json`**: Defines global targets like `local-registry`.

## Workspace Structure

The workspace is divided into `apps` and `libs`.

### Apps (`/apps`)
Applications are deployable units.
- **api-gateway**: Entry point for the backend.
- **api-monolith**: Main backend logic (monolith-first approach).
- **api-auth**: Authentication microservice.
- **api-notifications**: Notifications service (worker + API).
- **app-admin**: Admin panel (Angular).
- **app-web**: Main web application (Angular).
- **mcp-server**: Model Context Protocol server for AI agents.

### Libs (`/libs`)
Libraries contain reusable code and business logic.
- **domain**: Business logic (e.g., `auth`, `users`, `pipelines`).
- **infrastructure**: Infrastructure code (e.g., `database`, `prisma`, `redis`).
- **integrations**: External integrations (e.g., `aws`, `github`, `slack`).
- **ai**: AI-related logic (`ai-core`, `generation`).
- **shared**: Shared code between frontend and backend (`types`, `constants`).
- **utilities**: General utility functions.

## Common Commands

### Running Applications
- `nx serve <app-name>`: Serves the application in development mode.
  - Example: `nx serve api-monolith`
- `npm run dev`: Runs the development environment (configured in `package.json`).

### Building
- `nx build <app-name>`: Builds the application for production.
  - Example: `nx build app-web`

### Testing
- `nx test <project-name>`: Runs unit tests.
- `nx e2e <project-name>`: Runs end-to-end tests.

### Graph
- `nx graph`: Visualizes the project dependency graph.
- `nx graph --file=graph.json`: Saves the graph to a file.

## Generators & Executors

### Generators
Used to scaffold new code.
- `@nx/nest:library`: Create a new NestJS library.
- `@nx/angular:component`: Create a new Angular component.

### Executors
Define how targets are run.
- `@nx/webpack:webpack`: Builds using Webpack.
- `@nx/jest:jest`: Runs tests using Jest.

## Dependency Management

NX enforces boundaries between libraries to prevent circular dependencies and ensure architectural integrity.
- **Enforced Constraints**:
  - `domain` cannot import `app`.
  - `shared` cannot import `domain`.
  - `infrastructure` can be imported by `domain` (depending on architecture, usually `domain` defines interfaces and `infrastructure` implements them, but in NX `libs` structure often `domain` uses `infrastructure` for concrete implementations if not using strict clean architecture inversion). *Note: Verify specific project rules in `architecture.md`.*

## Caching

NX uses computation caching to avoid re-running tasks that haven't changed.
- **Cacheable Operations**: `build`, `test`, `lint`, `e2e`.
- **Cache Location**: `.nx/cache` (local).

## Migration & Maintenance

- `nx migrate latest`: Updates NX to the latest version.
- `nx repair`: Fixes configuration issues.
