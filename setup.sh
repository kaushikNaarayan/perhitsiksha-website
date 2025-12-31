#!/bin/bash

# Perhitsiksha Website Setup Script
# This script ensures the correct Node.js version is installed and sets up the development environment

set -e  # Exit on error

echo "🚀 Perhitsiksha Website Setup"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Required Node.js version
REQUIRED_NODE_VERSION="20"
REQUIRED_NODE_FULL="20.0.0"

# Function to compare version numbers
version_gt() {
    test "$(printf '%s\n' "$@" | sort -V | head -n 1)" != "$1";
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo ""
    echo "Please install Node.js ${REQUIRED_NODE_VERSION}+ using one of these methods:"
    echo ""
    echo "Option 1: Using nvm (recommended)"
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "  source ~/.bashrc"
    echo "  nvm install ${REQUIRED_NODE_VERSION}"
    echo "  nvm use ${REQUIRED_NODE_VERSION}"
    echo ""
    echo "Option 2: Using system package manager"
    echo "  curl -fsSL https://deb.nodesource.com/setup_${REQUIRED_NODE_VERSION}.x | sudo -E bash -"
    echo "  sudo apt-get install -y nodejs"
    echo ""
    exit 1
fi

# Get current Node.js version
CURRENT_NODE_VERSION=$(node -v | sed 's/v//')
CURRENT_NODE_MAJOR=$(echo "$CURRENT_NODE_VERSION" | cut -d. -f1)

echo "📌 Current Node.js version: v${CURRENT_NODE_VERSION}"

# Check if Node.js version is sufficient
if [ "$CURRENT_NODE_MAJOR" -lt "$REQUIRED_NODE_VERSION" ]; then
    echo -e "${RED}✗ Node.js version ${REQUIRED_NODE_FULL} or higher is required${NC}"
    echo -e "${YELLOW}  You have: v${CURRENT_NODE_VERSION}${NC}"
    echo ""

    # Check if nvm is available
    if command -v nvm &> /dev/null || [ -s "$HOME/.nvm/nvm.sh" ]; then
        echo "💡 You have nvm installed. Attempting to switch to Node ${REQUIRED_NODE_VERSION}..."
        echo ""

        # Load nvm
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

        # Check if Node 20 is already installed
        if nvm ls ${REQUIRED_NODE_VERSION} &> /dev/null; then
            echo "✓ Node ${REQUIRED_NODE_VERSION} is already installed via nvm"
            nvm use ${REQUIRED_NODE_VERSION}
        else
            echo "Installing Node ${REQUIRED_NODE_VERSION} via nvm..."
            nvm install ${REQUIRED_NODE_VERSION}
            nvm use ${REQUIRED_NODE_VERSION}
        fi

        echo -e "${GREEN}✓ Switched to Node $(node -v)${NC}"
    else
        echo "Please upgrade Node.js to version ${REQUIRED_NODE_VERSION} or higher:"
        echo ""
        echo "Using nvm (recommended):"
        echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
        echo "  source ~/.bashrc"
        echo "  nvm install ${REQUIRED_NODE_VERSION}"
        echo "  nvm use ${REQUIRED_NODE_VERSION}"
        echo ""
        exit 1
    fi
else
    echo -e "${GREEN}✓ Node.js version check passed${NC}"
fi

# Check npm version
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "📦 npm version: v${NPM_VERSION}"
echo -e "${GREEN}✓ npm is available${NC}"
echo ""

# Check if .nvmrc exists
if [ -f ".nvmrc" ]; then
    echo "📄 Found .nvmrc file"
    if command -v nvm &> /dev/null || [ -s "$HOME/.nvm/nvm.sh" ]; then
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        echo "💡 Tip: Run 'nvm use' to automatically use the correct Node version"
    fi
fi

# Install dependencies
echo "📥 Installing dependencies..."
npm install

echo ""
echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "  1. Start the development server:"
echo "     npm run dev"
echo ""
echo "  2. Or start Supabase local development:"
echo "     npx supabase start"
echo "     npm run dev"
echo ""
echo "  3. Open http://localhost:3000 in your browser"
echo ""
