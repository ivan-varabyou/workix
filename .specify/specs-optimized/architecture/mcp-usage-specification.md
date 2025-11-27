# MCP Usage Specification

**Version**: 1.0
**Created**: 2025-11-17
**Updated**: 2025-11-17
**Purpose**: Specification for using MCP servers in Workix project

## Summary

**Status**: ✅ Ollama running, PrismaModule fixed, Auth API debugging
**Completed**: MCP specification, Browser MCP tested, PrismaModule double init fixed
**Current**: Ollama operational with 3 models, Auth API startup issue being resolved
**Next**: Complete Auth API startup, verify Swagger documentation

## Communication Guidelines

### Response Style
- **Keep responses minimalistic and concise**
- Use bullet points over paragraphs
- Avoid verbose explanations
- Focus on actionable information only
- Prefer code examples over descriptions

### Documentation Standards
- **All documentation must be minimalistic**
- Remove unnecessary sections
- Use tables for structured data
- Keep examples short and practical
- Eliminate redundant information

## Overview

Rules and examples for MCP servers in Workix project for AI-powered development.

## MCP Servers

| Server | Purpose | Status | Details |
|--------|---------|--------|---------|
| Workix | Project API | ✅ | 15+ tools, 10+ resources |
| Ollama | Local AI | ✅ | llama3.1:8b, mistral:7b, qwen2.5:7b |
| TypeScript | Type check | ✅ | `tsc --noEmit --watch` |
| ESLint | Code quality | ✅ | Real-time monitoring |

## Rules

```bash
# ALWAYS before work
make mcp-status
make mcp-start  # if needed
```

## Commands

| Command | Purpose |
|---------|---------|
| `make mcp-status` | Check servers |
| `make mcp-start` | Start all |
| `make mcp-stop` | Stop all |
| `make mcp-build` | Build Workix MCP |

## Usage Examples

### Ollama AI
```bash
curl -X POST http://localhost:11434/api/generate \
  -d '{"model": "llama3.1:8b-instruct-q4_K_M", "prompt": "Review code", "stream": false}'
```

### TypeScript Check
```bash
npx tsc --noEmit path/to/file.ts
```

### ESLint Fix
```bash
npx eslint --ext .ts,.js,.tsx,.jsx . --fix
```

## Actual MCP Connection Results

### ✅ Successfully Tested

#### Ollama Server
- **Status**: ✅ Active and responding
- **Available Models**:
  - `llama3.1:8b-instruct-q4_K_M` - 4.9GB
  - `mistral:7b-instruct-q4_K_M` - 4.4GB
  - `qwen2.5:7b` - 4.7GB
- **API**: http://localhost:11434 (working)
- **Test Result**: Successfully generated response

#### TypeScript Server
- **Status**: ✅ Active and monitoring
- **Process**: `tsc --noEmit --watch` running
- **Functionality**: Real-time type checking working
- **Test Result**: Correctly detected type errors

#### ESLint Server
- **Status**: ✅ Active and monitoring
- **Process**: Multiple ESLint instances running
- **Functionality**: Real-time code quality checking
- **Extensions**: .ts, .js, .tsx, .jsx files

### ⚠️ MCP Tool Access Issue

**Current Issue**: Direct MCP tool calls through `call_mcp_tool` are not working as expected.
**Likely Cause**: MCP server connection configuration needs adjustment.
**Solution**: Use direct API calls or check MCP server setup.

## Practical Usage Examples

### 1. Ollama Local AI Usage
```bash
# Test model availability
curl -s http://localhost:11434/api/tags

# Generate code analysis
curl -X POST http://localhost:11434/api/generate \
  -d '{"model": "llama3.1:8b-instruct-q4_K_M", "prompt": "Analyze this TypeScript code: ...", "stream": false}'

# Code review assistance
curl -X POST http://localhost:11434/api/generate \
  -d '{"model": "mistral:7b-instruct-q4_K_M", "prompt": "Review this function for best practices: ...", "stream": false}'
```

### 2. TypeScript Real-time Checking
```bash
# Check if TypeScript watcher is running
ps aux | grep "tsc --noEmit --watch"

# Manual type check
npx tsc --noEmit

# Check specific file
npx tsc --noEmit path/to/file.ts
```

### 3. ESLint Quality Monitoring
```bash
# Check ESLint processes
ps aux | grep eslint

# Manual lint check
npx eslint --ext .ts,.js,.tsx,.jsx .

# Fix issues automatically
npx eslint --ext .ts,.js,.tsx,.jsx . --fix
```

### 4. Development Workflow Integration
```bash
# 1. Start development session
make mcp-status

# 2. Verify all services
curl -s http://localhost:11434/api/tags > /dev/null && echo "Ollama: ✅"
ps aux | grep "tsc --noEmit --watch" > /dev/null && echo "TypeScript: ✅"
ps aux | grep eslint > /dev/null && echo "ESLint: ✅"

# 3. Code with AI assistance
# - TypeScript automatically checks types
# - ESLint monitors code quality
# - Ollama available for AI queries
```

### 5. AI-Powered Code Analysis
```javascript
// Example: Using Ollama for code review
const analyzeCode = async (code) => {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.1:8b-instruct-q4_K_M',
      prompt: `Review this TypeScript code for best practices and potential issues:\n\n${code}`,
      stream: false
    })
  });
  return response.json();
};
```

## Troubleshooting

### MCP Server Issues
```bash
# Rebuild MCP server
make mcp-build

# Restart all MCP services
make mcp-stop
make mcp-start

# Check logs
journalctl -u workix-mcp -f
```

### Service Recovery
```bash
# If TypeScript watcher stops
npm run dev:types

# If ESLint stops monitoring
npm run lint:watch

# If Ollama becomes unresponsive
systemctl restart ollama
# or
docker restart ollama
```

## Related Documents

- [MCP Servers Architecture](./mcp-servers.md)
- [Development Process](../core/development.md)
- [MCP Summary](../../.cursor/MCP_SUMMARY_EN.md)
- [Applications](../core/applications.md)
