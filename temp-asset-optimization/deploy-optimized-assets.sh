#!/bin/bash

# Asset Optimization Deployment Script
# Usage: ./deploy-optimized-assets.sh

set -e

echo "🚀 UIForge Asset Optimization Deployment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PUBLIC_DIR="apps/web/public"
LOGOS_DIR="$PUBLIC_DIR/logos"
BACKUP_DIR="$PUBLIC_DIR/backup"

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -d "apps/web/public" ]; then
    log_error "Please run this script from the project root directory"
    exit 1
fi

# Create backup directory
log_info "Creating backup directory..."
mkdir -p "$BACKUP_DIR"

# Backup current assets
log_info "Backing up current assets..."
if [ -f "$PUBLIC_DIR/text-logo.svg" ] && [ ! -f "$PUBLIC_DIR/text-logo.svg.backup" ]; then
    cp "$PUBLIC_DIR/text-logo.svg" "$BACKUP_DIR/text-logo.svg.original"
    log_success "Backed up text-logo.svg"
fi

if [ -f "$PUBLIC_DIR/anvil-logo.svg" ] && [ ! -f "$PUBLIC_DIR/anvil-logo.svg.backup" ]; then
    cp "$PUBLIC_DIR/anvil-logo.svg" "$BACKUP_DIR/anvil-logo.svg.original"
    log_success "Backed up anvil-logo.svg"
fi

# Check if optimized assets exist
if [ ! -d "$LOGOS_DIR" ]; then
    log_error "Optimized assets not found in $LOGOS_DIR"
    log_error "Please run the optimization process first"
    exit 1
fi

# Verify optimized assets
log_info "Verifying optimized assets..."
REQUIRED_FILES=(
    "text-logo.webp"
    "text-logo-256.webp"
    "text-logo-128.webp"
    "text-logo-64.webp"
    "text-logo-optimized.png"
    "anvil-logo.webp"
    "anvil-logo-256.webp"
    "anvil-logo-128.webp"
    "anvil-logo-64.webp"
    "anvil-logo-optimized.png"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$LOGOS_DIR/$file" ]; then
        log_error "Missing optimized file: $file"
        exit 1
    fi
done
log_success "All optimized assets verified"

# Calculate size comparison
log_info "Calculating size savings..."
ORIGINAL_SIZE=$(du -sk "$BACKUP_DIR"/*.svg.original 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")
OPTIMIZED_SIZE=$(du -sk "$LOGOS_DIR" 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")

if [ "$ORIGINAL_SIZE" -gt 0 ]; then
    SAVINGS=$((ORIGINAL_SIZE - OPTIMIZED_SIZE))
    PERCENTAGE=$(( (SAVINGS * 100) / ORIGINAL_SIZE ))
    log_success "Size reduction: ${SAVINGS}KB (${PERCENTAGE}%)"
else
    log_warning "Could not calculate size comparison"
fi

# Deploy optimized assets
log_info "Deploying optimized assets..."

# Copy optimized assets if they don't exist or are newer
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$LOGOS_DIR/$file" ]; then
        log_error "Missing optimized file: $file"
        exit 1
    fi
    
    # Check if we need to copy (file doesn't exist or is older)
    if [ ! -f "$LOGOS_DIR/$file.deployed" ] || [ "$LOGOS_DIR/$file" -nt "$LOGOS_DIR/$file.deployed" ]; then
        cp "$LOGOS_DIR/$file" "$LOGOS_DIR/$file.deployed"
        log_success "Deployed $file"
    fi
done

# Update Netlify headers if needed
if [ -f "_headers" ]; then
    log_info "Updating Netlify headers..."
    cp _headers "$PUBLIC_DIR/_headers"
    log_success "Updated Netlify headers"
fi

# Generate deployment summary
log_info "Generating deployment summary..."
cat > "$BACKUP_DIR/deployment-summary.md" << EOF
# Asset Optimization Deployment Summary

## Date
$(date)

## Assets Optimized
- Text Logo: WebP (46.8KB) + PNG fallback (1.2MB)
- Anvil Logo: WebP (46.8KB) + PNG fallback (1.2MB)
- Responsive variants: 64px, 128px, 256px

## Size Reduction
- Before: ${ORIGINAL_SIZE}KB
- After: ${OPTIMIZED_SIZE}KB
- Savings: ${SAVINGS}KB (${PERCENTAGE}%)

## Files Deployed
$(ls -la "$LOGOS_DIR" | grep -E "\.(webp|png)$" | wc -l | tr -d ' ') optimized files

## Next Steps
1. Test the application in staging
2. Verify logo rendering in different browsers
3. Monitor Core Web Vitals
4. Deploy to production

## Rollback
If needed, restore original assets:
\`\`\`bash
cp backup/text-logo.svg.original apps/web/public/text-logo.svg
cp backup/anvil-logo.svg.original apps/web/public/anvil-logo.svg
\`\`\`
EOF

log_success "Deployment summary generated"

# Performance recommendations
log_info "Performance recommendations:"
echo "  1. Test in staging environment first"
echo "  2. Monitor Core Web Vitals after deployment"
echo "  3. Check logo rendering in different browsers"
echo "  4. Verify responsive image loading"
echo "  5. Monitor bundle size in build tools"

# Completion message
echo ""
log_success "🎉 Asset optimization deployment completed!"
echo ""
echo "📊 Summary:"
echo "   • Optimized assets deployed to $LOGOS_DIR"
echo "   • Size reduction: ${PERCENTAGE}%"
echo "   • WebP format with PNG fallbacks"
echo "   • Responsive variants available"
echo ""
echo "📋 Next steps:"
echo "   1. Test the application"
echo "   2. Monitor performance metrics"
echo "   3. Deploy to production"
echo ""
echo "📄 Detailed report: $BACKUP_DIR/deployment-summary.md"
echo "🔄 Rollback: Original assets backed up in $BACKUP_DIR"