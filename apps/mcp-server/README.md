# Workix MCP Server

AI Agent Integration Server using Model Context Protocol (MCP).

## Overview

MCP server providing AI agents with access to Workix platform resources and tools. Enables AI-driven automation and development workflows.

## Structure

```
src/
├── main.ts              # MCP Server entry point
├── tools/               # MCP tools (API methods)
│   ├── auth.tools.ts
│   ├── users.tools.ts
│   ├── pipelines.tools.ts
│   └── ...
└── resources/           # MCP resources (documentation)
    ├── api-reference.resource.ts
    ├── architecture.resource.ts
    └── ...
```

## Tools

### Authentication (5 tools)
- `authenticate_user` - Login
- `create_user` - Register
- `verify_token` - Validate JWT
- `refresh_token` - Get new token

### Users (5 tools)
- `get_user` - Get user info
- `list_users` - List all users
- `update_user` - Update user
- `delete_user` - Delete user

### Pipelines (5 tools)
- `create_pipeline` - Create pipeline
- `execute_pipeline` - Execute pipeline
- `get_pipeline` - Get pipeline info
- `list_pipelines` - List pipelines

## Resources

- API Reference
- Architecture Overview
- Database Schema
- Development Rules
- Tasks & Intermediate Tasks

## Usage

Transport: `stdio`

Configure in Cursor IDE or compatible MCP client.

## Documentation

- **Project Specifications**: [.specify/specs-optimized/index.md](../../.specify/specs-optimized/index.md)
- **MCP Integration**: [.specify/specs-optimized/architecture/integrations.md](../../.specify/specs-optimized/architecture/integrations.md)
