#!/bin/bash

# UIForge Main Branch Push Script
# Enforces force-only push policy for main branch

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# Check if we're on main branch
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_error "You must be on the main branch to use this script"
    print_status "Current branch: $CURRENT_BRANCH"
    print_status "Switch to main branch with: git checkout main"
    exit 1
fi

print_status "On main branch - enforcing force-only push policy"

# Check if there are changes to push
if [ -z "$(git status --porcelain)" ]; then
    print_warning "No changes to push"
    exit 0
fi

# Check if remote exists
if ! git remote get-url origin >/dev/null 2>&1; then
    print_error "No remote 'origin' found"
    exit 1
fi

# Get remote URL
REMOTE_URL=$(git remote get-url origin)
print_status "Remote: $REMOTE_URL"

# Check if user is authorized
AUTHORIZED_USERS="LucasSantana-Dev"
CURRENT_USER=$(git config user.name || echo "Unknown")

if [[ "$AUTHORIZED_USERS" != *"$CURRENT_USER"* ]]; then
    print_warning "User '$CURRENT_USER' may not be authorized to force push main"
    print_status "Authorized users: $AUTHORIZED_USERS"
    
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Push cancelled"
        exit 0
    fi
fi

# Stage all changes
print_status "Staging changes..."
git add .

# Check if there are staged changes
if [ -z "$(git diff --cached --name-only)" ]; then
    print_warning "No staged changes to commit"
    exit 0
fi

# Get commit message
if [ -z "$1" ]; then
    echo "Enter commit message:"
    read -r COMMIT_MESSAGE
else
    COMMIT_MESSAGE="$1"
fi

if [ -z "$COMMIT_MESSAGE" ]; then
    print_error "Commit message cannot be empty"
    exit 1
fi

# Commit changes
print_status "Committing changes..."
git commit -m "$COMMIT_MESSAGE"

# Pull latest changes from remote
print_status "Pulling latest changes from remote..."
git pull origin main --rebase || {
    print_error "Failed to pull latest changes"
    print_status "Resolve conflicts and try again"
    exit 1
}

# Force push to main
print_status "Force pushing to main branch..."
print_warning "This will overwrite the remote main branch"

read -p "Continue with force push? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Force push cancelled"
    exit 0
fi

git push --force-with-lease origin main

print_success "Force push completed successfully!"
print_status "Main branch updated and deployment triggered"
print_status "Check GitHub Actions for deployment status"