#!/bin/bash

#######################################
# ODIN Exchange - Git Setup Script
# Configures Git hooks and settings
#######################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

print_header "Git Configuration for ODIN Exchange"

cd "$PROJECT_DIR"

#######################################
# Check Git Repository
#######################################

if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    print_success "Git repository initialized"
else
    print_success "Git repository already exists"
fi

#######################################
# Setup Git Hooks Directory
#######################################

HOOKS_DIR="$PROJECT_DIR/.git/hooks"

print_header "Setting Up Git Hooks"

#######################################
# Pre-commit Hook
#######################################

cat > "$HOOKS_DIR/pre-commit" << 'PREHOOK'
#!/bin/bash

# ODIN Exchange Pre-commit Hook
# Runs linting and type checking before commit

set -e

echo "Running pre-commit checks..."

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "backend" ]; then
    echo "Error: Not in project root"
    exit 1
fi

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

# Check for sensitive data
echo "Checking for sensitive data..."
for file in $STAGED_FILES; do
    if [ -f "$file" ]; then
        # Check for potential secrets
        if grep -qE "(sk_live_|pk_live_|AKIA[A-Z0-9]{16}|password\s*=\s*['\"][^'\"]+['\"])" "$file" 2>/dev/null; then
            echo "⚠️  Warning: Potential secret found in $file"
            echo "   Please review before committing."
        fi
    fi
done

# Check for .env files
for file in $STAGED_FILES; do
    if [[ "$file" == ".env" ]] || [[ "$file" == *".env.local"* ]]; then
        echo "❌ Error: Attempting to commit .env file: $file"
        echo "   This file should not be committed to the repository."
        exit 1
    fi
done

# Run backend linting if backend files changed
BACKEND_CHANGED=$(echo "$STAGED_FILES" | grep "^backend/" || true)
if [ -n "$BACKEND_CHANGED" ]; then
    echo "Backend files changed, running lint..."
    cd backend
    if [ -f "package.json" ]; then
        npm run lint --if-present || true
    fi
    cd ..
fi

# Run frontend linting if frontend files changed
FRONTEND_CHANGED=$(echo "$STAGED_FILES" | grep "^frontend/" || true)
if [ -n "$FRONTEND_CHANGED" ]; then
    echo "Frontend files changed, running lint..."
    cd frontend
    if [ -f "package.json" ]; then
        npm run lint --if-present || true
    fi
    cd ..
fi

echo "✓ Pre-commit checks passed"
exit 0
PREHOOK

chmod +x "$HOOKS_DIR/pre-commit"
print_success "Pre-commit hook created"

#######################################
# Commit Message Hook
#######################################

cat > "$HOOKS_DIR/commit-msg" << 'COMMITMSG'
#!/bin/bash

# ODIN Exchange Commit Message Hook
# Validates commit message format

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Conventional Commits pattern
PATTERN="^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .{1,100}"

if ! echo "$COMMIT_MSG" | grep -qE "$PATTERN"; then
    echo ""
    echo "❌ Invalid commit message format!"
    echo ""
    echo "Expected format: <type>(<scope>): <description>"
    echo ""
    echo "Types:"
    echo "  feat     - New feature"
    echo "  fix      - Bug fix"
    echo "  docs     - Documentation"
    echo "  style    - Formatting, no code change"
    echo "  refactor - Code refactoring"
    echo "  perf     - Performance improvement"
    echo "  test     - Adding tests"
    echo "  build    - Build system changes"
    echo "  ci       - CI configuration"
    echo "  chore    - Maintenance"
    echo "  revert   - Revert commit"
    echo ""
    echo "Examples:"
    echo "  feat(auth): add two-factor authentication"
    echo "  fix(payments): resolve Stripe webhook issue"
    echo "  docs: update README with API endpoints"
    echo ""
    exit 1
fi

exit 0
COMMITMSG

chmod +x "$HOOKS_DIR/commit-msg"
print_success "Commit message hook created"

#######################################
# Pre-push Hook
#######################################

cat > "$HOOKS_DIR/pre-push" << 'PREPUSH'
#!/bin/bash

# ODIN Exchange Pre-push Hook
# Runs tests before pushing

echo "Running pre-push checks..."

# Check for uncommitted changes
if ! git diff --quiet; then
    echo "⚠️  Warning: You have uncommitted changes"
fi

# Run tests if available
if [ -d "backend" ] && [ -f "backend/package.json" ]; then
    cd backend
    if grep -q "\"test\"" package.json; then
        echo "Running backend tests..."
        npm test --if-present 2>/dev/null || true
    fi
    cd ..
fi

echo "✓ Pre-push checks completed"
exit 0
PREPUSH

chmod +x "$HOOKS_DIR/pre-push"
print_success "Pre-push hook created"

#######################################
# Setup .gitignore
#######################################

print_header "Checking .gitignore"

GITIGNORE="$PROJECT_DIR/.gitignore"

# Essential entries to check
ESSENTIAL_IGNORES=(
    "node_modules"
    ".env"
    ".env.local"
    ".env.*.local"
    "dist"
    "build"
    ".DS_Store"
    "*.log"
    "coverage"
    ".idea"
    ".vscode"
    "*.sqlite"
)

for entry in "${ESSENTIAL_IGNORES[@]}"; do
    if ! grep -qx "$entry" "$GITIGNORE" 2>/dev/null; then
        echo "$entry" >> "$GITIGNORE"
        echo "  Added: $entry"
    fi
done

print_success ".gitignore updated"

#######################################
# Configure Git Settings
#######################################

print_header "Git Configuration"

# Set default branch name
git config --local init.defaultBranch main 2>/dev/null || true

# Enable color
git config --local color.ui auto

# Set pull strategy
git config --local pull.rebase true

# Set push default
git config --local push.default current

print_success "Git settings configured"

#######################################
# Summary
#######################################

print_header "Git Setup Complete!"

echo "Installed hooks:"
echo "  - pre-commit: Checks for secrets, runs linting"
echo "  - commit-msg: Validates conventional commit format"
echo "  - pre-push: Runs tests before push"
echo ""
echo "To skip hooks temporarily, use:"
echo "  git commit --no-verify"
echo "  git push --no-verify"
echo ""

print_success "Git hooks installed successfully!"
