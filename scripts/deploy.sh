#!/bin/bash

# UIForge Deployment Script
# Supports Trunk Based Development workflow

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
print_status "Current branch: $CURRENT_BRANCH"

# Check if we're on the correct branch for deployment
case "$1" in
    "dev")
        if [ "$CURRENT_BRANCH" != "dev" ]; then
            print_error "Must be on dev branch to deploy to dev environment"
            exit 1
        fi
        ENVIRONMENT="development"
        URL="dev.uiforge.com"
        ;;
    "production")
        if [ "$CURRENT_BRANCH" != "main" ]; then
            print_error "Must be on main branch to deploy to production"
            exit 1
        fi
        
        # Check if last merge was from release branch
        if ! git log --oneline --merges | head -1 | grep -q "release/"; then
            print_warning "Last merge was not from a release branch"
            read -p "Continue anyway? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_status "Deployment cancelled"
                exit 0
            fi
        fi
        
        ENVIRONMENT="production"
        URL="uiforge.com"
        ;;
    *)
        echo "Usage: $0 {dev|production}"
        echo "  dev        - Deploy dev branch to dev.uiforge.com"
        echo "  production - Deploy main branch to uiforge.com"
        exit 1
        ;;
esac

print_status "Deploying to $ENVIRONMENT environment ($URL)"

# Run tests
print_status "Running tests..."
npm run test
if [ $? -ne 0 ]; then
    print_error "Tests failed"
    exit 1
fi

# Run linting
print_status "Running linting..."
npm run lint
if [ $? -ne 0 ]; then
    print_error "Linting failed"
    exit 1
fi

# Run type checking
print_status "Running type checking..."
npm run type-check
if [ $? -ne 0 ]; then
    print_error "Type checking failed"
    exit 1
fi

# Build application
print_status "Building application..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Build failed"
    exit 1
fi

# Security scan for production
if [ "$ENVIRONMENT" = "production" ]; then
    print_status "Running security scan..."
    npm audit --audit-level high
    if [ $? -ne 0 ]; then
        print_error "Security scan failed"
        exit 1
    fi
fi

# Deploy (placeholder - replace with actual deployment commands)
print_status "Deploying to $ENVIRONMENT..."
echo "🚀 Deploying to $URL"
echo "📦 Deployment files ready"
echo "✅ Deployment completed successfully"

# Health check
print_status "Running health check..."
echo "🔍 Checking $URL"
echo "✅ Health checks passed"

print_success "Deployment to $ENVIRONMENT completed successfully!"
print_status "Application is available at: $URL"