#!/bin/bash

# MCP Servers Management Script
# Управление MCP серверами для Workix проекта

set -e

WORKIX_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MCP_CONFIG="$WORKIX_ROOT/.cursor/cursor-settings.json"
ENHANCED_CONFIG="$WORKIX_ROOT/.cursor/mcp-enhanced.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[MCP]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[MCP]${NC} $1"
}

error() {
    echo -e "${RED}[MCP]${NC} $1"
}

info() {
    echo -e "${BLUE}[MCP]${NC} $1"
}

# Check if MCP servers are running
check_servers() {
    log "Checking MCP servers status..."

    # Check Ollama
    if pgrep -f "ollama serve" > /dev/null; then
        log "✅ Ollama server is running"
    else
        warn "❌ Ollama server is not running"
    fi

    # Check Workix MCP server
    if pgrep -f "main.js" > /dev/null || pgrep -f "apps/mcp-server" > /dev/null; then
        log "✅ Workix MCP server is running"
    else
        warn "❌ Workix MCP server is not running"
    fi

    # Check TypeScript
    if pgrep -f "tsc.*--watch" > /dev/null; then
        log "✅ TypeScript watch mode is running"
    else
        warn "❌ TypeScript watch mode is not running"
    fi

    # Check ESLint
    if pgrep -f "eslint.*--cache" > /dev/null; then
        log "✅ ESLint server is running"
    else
        warn "❌ ESLint server is not running"
    fi

    # Check NX MCP server
    if command -v nx > /dev/null 2>&1 || npx nx --version > /dev/null 2>&1; then
        log "✅ NX MCP server is available"
    else
        warn "❌ NX MCP server is not available"
    fi

    # Check Chrome DevTools MCP
    if pgrep -f "chrome.*--remote-debugging-port=9222" > /dev/null || curl -s http://localhost:9222/json/version > /dev/null 2>&1; then
        if command -v chrome-devtools-mcp > /dev/null 2>&1; then
            log "✅ Chrome DevTools MCP server is available"
        else
            warn "⚠️  Chrome DevTools running but chrome-devtools-mcp not installed globally"
        fi
    else
        warn "❌ Chrome DevTools MCP server is not running"
    fi
}

# Start Ollama server
start_ollama() {
    if ! pgrep -f "ollama serve" > /dev/null; then
        log "Starting Ollama server..."
        ollama serve &
        sleep 2
        log "✅ Ollama server started"
    else
        log "Ollama server already running"
    fi
}

# Build and start Workix MCP server
start_workix_mcp() {
    log "Checking Workix MCP server..."
    cd "$WORKIX_ROOT"

    # Check if already built
    if [ -f "$WORKIX_ROOT/apps/mcp-server/dist/main.js" ]; then
        log "✅ Workix MCP server already built"
    else
        log "Building Workix MCP server..."
        # Try to build using tsc directly since NX config might be missing
        cd "$WORKIX_ROOT/apps/mcp-server"
        npx tsc

        if [ -f "$WORKIX_ROOT/apps/mcp-server/dist/main.js" ]; then
            log "✅ Workix MCP server built successfully"
        else
            error "❌ Failed to build Workix MCP server"
            exit 1
        fi
    fi
}

# Start TypeScript watch mode
start_typescript() {
    if ! pgrep -f "tsc.*--watch" > /dev/null; then
        log "Starting TypeScript watch mode..."
        cd "$WORKIX_ROOT"
        npx tsc --noEmit --watch &
        log "✅ TypeScript watch mode started"
    else
        log "TypeScript watch mode already running"
    fi
}

# Start ESLint server
start_eslint() {
    if ! pgrep -f "eslint.*--cache" > /dev/null; then
        log "Starting ESLint server..."
        cd "$WORKIX_ROOT"
        # Run ESLint in watch mode using nodemon
        npx nodemon --watch "**/*.{ts,js,tsx,jsx}" --ext ts,js,tsx,jsx --exec "npx eslint --ext .ts,.js,.tsx,.jsx --format json --cache --fix-dry-run ." &
        log "✅ ESLint server started"
    else
        log "ESLint server already running"
    fi
}

# Check NX MCP server availability
check_nx() {
    if command -v nx > /dev/null 2>&1 || npx nx --version > /dev/null 2>&1; then
        return 0
    else
        warn "⚠️  NX not available"
        warn "   NX should be available via npx or installed globally"
        return 1
    fi
}

# Check Chrome DevTools MCP server
check_chrome_devtools() {
    if ! command -v chrome-devtools-mcp > /dev/null 2>&1; then
        warn "⚠️  chrome-devtools-mcp not installed globally"
        warn "   Install with: npm install -g chrome-devtools-mcp"
        return 1
    fi

    if ! curl -s http://localhost:9222/json/version > /dev/null 2>&1; then
        warn "⚠️  Chrome DevTools Protocol not available on port 9222"
        warn "   Chrome needs to be started with: --remote-debugging-port=9222"
        return 1
    fi

    return 0
}

# Pull Ollama models
pull_models() {
    log "Pulling Ollama models..."

    models=("llama3.1:8b-instruct-q4_K_M" "mistral:7b-instruct-q4_K_M" "codellama:7b-code")

    for model in "${models[@]}"; do
        log "Pulling model: $model"
        ollama pull "$model"
    done

    log "✅ All models pulled successfully"
}

# Show usage
usage() {
    cat << EOF
Usage: $0 [COMMAND]

Commands:
    start       Start all MCP servers
    stop        Stop all MCP servers
    restart     Restart all MCP servers
    status      Check status of MCP servers
    build       Build Workix MCP server
    pull        Pull Ollama models
    config      Show MCP configuration
    help        Show this help message

Examples:
    $0 start          # Start all servers
    $0 status         # Check status
    $0 pull           # Pull Ollama models
    $0 build          # Build MCP server
EOF
}

# Main command handling
case "${1:-}" in
    "start")
        log "Starting all MCP servers..."
        start_ollama
        start_workix_mcp
        start_typescript
        start_eslint
        check_nx && log "✅ NX MCP server is ready" || warn "⚠️  NX MCP server not ready"
        check_chrome_devtools && log "✅ Chrome DevTools MCP server is ready" || warn "⚠️  Chrome DevTools MCP server not ready"
        log "✅ All MCP servers started"
        ;;
    "stop")
        log "Stopping MCP servers..."
        pkill -f "ollama serve" || true
        pkill -f "apps/mcp-server/dist/main.js" || true
        pkill -f "tsc.*--watch" || true
        pkill -f "eslint.*--cache" || true
        pkill -f "nodemon.*eslint" || true
        warn "⚠️  Chrome DevTools MCP: Chrome process not stopped (may be used by other services)"
        log "✅ All MCP servers stopped"
        ;;
    "restart")
        $0 stop
        sleep 2
        $0 start
        ;;
    "status")
        check_servers
        ;;
    "build")
        start_workix_mcp
        ;;
    "pull")
        pull_models
        ;;
    "config")
        info "Current MCP configuration:"
        if [ -f "$MCP_CONFIG" ]; then
            cat "$MCP_CONFIG"
        else
            error "Configuration file not found: $MCP_CONFIG"
        fi
        ;;
    "help"|"")
        usage
        ;;
    *)
        error "Unknown command: $1"
        usage
        exit 1
        ;;
esac
