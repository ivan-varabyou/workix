# MCP Servers Architecture

**Version**: 3.1

## Overview

Model Context Protocol servers for AI-powered development workflow.

## Available Servers

### 1. Workix MCP Server
- **Path**: `apps/mcp-server/dist/main.js`
- **Transport**: stdio
- **Tools**: 15+ (auth, users, pipelines, health, project)
- **Resources**: 10+ (docs, architecture, schema, rules)

### 2. Ollama Server
- **URL**: `http://localhost:11434/v1`
- **Models**: llama3.1:8b, mistral:7b, codellama:7b
- **Purpose**: Local LLM inference

### 3. TypeScript Server
- **Command**: `tsc --noEmit --watch`
- **Purpose**: Real-time type checking
- **Auto-restart**: On file changes

### 4. NX Server
- **Command**: `npx nx`
- **Purpose**: Workspace management
- **Tools**: build, test, lint, serve, generate

### 5. ESLint Server
- **Command**: `npx eslint --cache --watch`
- **Purpose**: Real-time code linting & quality checks
- **Features**: Auto-fix suggestions, JSON output, caching
- **Extensions**: .ts, .js, .tsx, .jsx

### 6. Chrome DevTools MCP Server
- **Command**: `chrome-devtools-mcp` (global npm package)
- **Port**: 9222 (Chrome remote debugging)
- **Purpose**: Browser automation and debugging
- **Installation**: `npm install -g chrome-devtools-mcp`
- **Config**: `~/.cursor/mcp.json`

## Configuration

**File**: `.cursor/cursor-settings.json`

```json
{
  "mcpServers": {
    "workix": {
      "command": "node",
      "args": ["${workspaceFolder}/apps/mcp-server/dist/main.js"],
      "env": {"NODE_ENV": "development"}
    },
    "ollama": {
      "command": "ollama",
      "args": ["serve"]
    },
    "nx": {
      "command": "npx",
      "args": ["nx"],
      "env": {"NODE_ENV": "development"}
    },
    "typescript": {
      "command": "npx",
      "args": ["tsc", "--noEmit", "--watch"],
      "env": {"NODE_ENV": "development"}
    },
    "eslint": {
      "command": "npx",
      "args": ["eslint", "--ext", ".ts,.js,.tsx,.jsx", "--format", "json", "--cache"],
      "env": {"NODE_ENV": "development"}
    },
    "chrome-devtools": {
      "command": "chrome-devtools-mcp",
      "env": {"CHROME_REMOTE_DEBUGGING_PORT": "9222"}
    }
  }
}
```

## Management Commands

```bash
# Status check (ALWAYS RUN FIRST)
make mcp-status

# Start all servers
make mcp-start

# Stop all servers
make mcp-stop

# Build Workix MCP
make mcp-build

# Pull Ollama models
make mcp-pull
```

## Pre-Work Protocol

**CRITICAL RULE**: Always check MCP servers before starting work!

```bash
# Step 1: Check status
make mcp-status

# Step 2: Start if needed
make mcp-start

# Step 3: Verify running
make mcp-status
```

## Tools Available

### Workix MCP Tools
- **auth**: authenticate_user, create_user, verify_token, refresh_token
- **users**: get_user, list_users, update_user, delete_user
- **pipelines**: create_pipeline, execute_pipeline, get_pipeline, list_pipelines
- **project**: health checks, documentation access

### NX Tools
- `nx build <project>` - Build project
- `nx test <project>` - Run tests
- `nx lint <project>` - Lint code
- `nx serve <project>` - Serve app
- `nx generate <schematic>` - Generate code
- `nx affected:*` - Run on affected projects
- `nx graph` - Show dependency graph

### TypeScript Tools
- Real-time type checking
- Error highlighting
- IntelliSense support
- Auto-completion

## Related

- [Development Process](../core/development.md)
- [MCP Servers Guide](../../.cursor/MCP_SERVERS_GUIDE.md)
- [Applications](../core/applications.md)
