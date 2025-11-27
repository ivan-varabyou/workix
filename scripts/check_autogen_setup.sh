#!/bin/bash
# Automated setup checker for AutoGen + Ollama

set -e

echo "🔍 Checking AutoGen + Ollama Setup..."
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $2 is installed"
        return 0
    else
        echo -e "${RED}✗${NC} $2 is NOT installed"
        return 1
    fi
}

check_python_version() {
    if python3 --version &> /dev/null; then
        VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
        MAJOR=$(echo $VERSION | cut -d'.' -f1)
        MINOR=$(echo $VERSION | cut -d'.' -f2)
        
        if [ "$MAJOR" -ge 3 ] && [ "$MINOR" -ge 10 ]; then
            echo -e "${GREEN}✓${NC} Python $VERSION (>= 3.10 required)"
            return 0
        else
            echo -e "${RED}✗${NC} Python $VERSION (>= 3.10 required)"
            return 1
        fi
    else
        echo -e "${RED}✗${NC} Python is NOT installed"
        return 1
    fi
}

check_ollama_running() {
    if curl -s http://localhost:11434/api/version &> /dev/null; then
        echo -e "${GREEN}✓${NC} Ollama service is running"
        return 0
    else
        echo -e "${RED}✗${NC} Ollama service is NOT running"
        echo -e "${YELLOW}  → Run: ollama serve${NC}"
        return 1
    fi
}

check_model() {
    if ollama list | grep -q "$1"; then
        echo -e "${GREEN}✓${NC} Model '$1' is installed"
        return 0
    else
        echo -e "${RED}✗${NC} Model '$1' is NOT installed"
        echo -e "${YELLOW}  → Run: ollama pull $1${NC}"
        return 1
    fi
}

check_venv() {
    if [ -d ".venv" ]; then
        echo -e "${GREEN}✓${NC} Virtual environment exists"
        return 0
    else
        echo -e "${RED}✗${NC} Virtual environment does NOT exist"
        echo -e "${YELLOW}  → Run: python3 -m venv .venv${NC}"
        return 1
    fi
}

check_python_package() {
    if python3 -c "import $1" &> /dev/null; then
        VERSION=$(python3 -c "import $1; print($1.__version__)" 2>/dev/null || echo "unknown")
        echo -e "${GREEN}✓${NC} Python package '$1' is installed (version: $VERSION)"
        return 0
    else
        echo -e "${RED}✗${NC} Python package '$1' is NOT installed"
        echo -e "${YELLOW}  → Run: pip install $2${NC}"
        return 1
    fi
}

check_env_file() {
    if [ -f ".env" ]; then
        echo -e "${GREEN}✓${NC} .env file exists"
        
        if grep -q "OLLAMA_BASE_URL" .env; then
            echo -e "${GREEN}  ✓${NC} OLLAMA_BASE_URL configured"
        else
            echo -e "${YELLOW}  ⚠${NC} OLLAMA_BASE_URL not found in .env"
        fi
        
        if grep -q "OLLAMA_MODEL" .env; then
            echo -e "${GREEN}  ✓${NC} OLLAMA_MODEL configured"
        else
            echo -e "${YELLOW}  ⚠${NC} OLLAMA_MODEL not found in .env"
        fi
        
        return 0
    else
        echo -e "${YELLOW}⚠${NC} .env file does NOT exist (optional but recommended)"
        return 1
    fi
}

check_agent_files() {
    local all_exist=0
    
    if [ -f "agents/devops_agent.py" ]; then
        echo -e "${GREEN}✓${NC} agents/devops_agent.py exists"
    else
        echo -e "${RED}✗${NC} agents/devops_agent.py NOT found"
        all_exist=1
    fi
    
    if [ -f "scripts/autogen_example.py" ]; then
        echo -e "${GREEN}✓${NC} scripts/autogen_example.py exists"
    else
        echo -e "${RED}✗${NC} scripts/autogen_example.py NOT found"
        all_exist=1
    fi
    
    if [ -f "scripts/test_ollama_autogen.py" ]; then
        echo -e "${GREEN}✓${NC} scripts/test_ollama_autogen.py exists"
    else
        echo -e "${RED}✗${NC} scripts/test_ollama_autogen.py NOT found"
        all_exist=1
    fi
    
    return $all_exist
}

# Run checks
ERRORS=0

echo "1️⃣  System Requirements"
echo "------------------------"
check_command "python3" "Python" || ((ERRORS++))
check_python_version || ((ERRORS++))
check_command "git" "Git" || ((ERRORS++))
echo ""

echo "2️⃣  Ollama Installation"
echo "------------------------"
check_command "ollama" "Ollama" || ((ERRORS++))
check_ollama_running || ((ERRORS++))
check_model "qwen2.5:7b" || ((ERRORS++))
echo ""

echo "3️⃣  Python Environment"
echo "----------------------"
check_venv || ((ERRORS++))

# Try to activate venv if it exists
if [ -d ".venv" ]; then
    source .venv/bin/activate 2>/dev/null || true
fi

check_python_package "autogen" "pyautogen" || ((ERRORS++))
check_python_package "dotenv" "python-dotenv" || ((ERRORS++))
echo ""

echo "4️⃣  Configuration"
echo "------------------"
check_env_file || ((ERRORS++))
echo ""

echo "5️⃣  Agent Files"
echo "----------------"
check_agent_files || ((ERRORS++))
echo ""

echo "======================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Setup is complete.${NC}"
    echo ""
    echo "🚀 You can now run:"
    echo "   python scripts/test_ollama_autogen.py"
    echo "   python agents/devops_agent.py"
    exit 0
else
    echo -e "${RED}❌ Found $ERRORS issue(s). Please fix them first.${NC}"
    echo ""
    echo "📚 See documentation:"
    echo "   - AUTOGEN_QUICKSTART.md"
    echo "   - .specify/specs/005-development-process/AUTOGEN_OLLAMA_SETUP_CHECKLIST.md"
    exit 1
fi

