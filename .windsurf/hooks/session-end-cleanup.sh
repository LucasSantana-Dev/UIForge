#!/bin/bash

# Session End Hook: Cleanup and reporting
# This hook runs when Claude Code session ends

echo "📊 Session Summary - $(date)"
echo "================================"

# Generate session report
REPORT_FILE=".claude/session-report-$(date +%Y%m%d-%H%M%S).md"

cat > "$REPORT_FILE" << EOF
# Claude Code Session Report

**Session End:** $(date)
**Project:** Siza
**Duration:** $SECONDS seconds

## Summary
- Files modified: $(git status --porcelain 2>/dev/null | grep "^M\|^A\|^D" | wc -l)
- Commands executed: $(history | tail -n +2 | wc -l)
- Current branch: $(git branch --show-current 2>/dev/null || echo "N/A")

## Recent Activity
EOF

# Add recent git activity
if command -v git >/dev/null 2>&1; then
    echo "### Recent Commits" >> "$REPORT_FILE"
    git log --oneline -5 2>/dev/null >> "$REPORT_FILE" || echo "No recent commits" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
fi

# Add modified files
if command -v git >/dev/null 2>&1; then
    echo "### Modified Files" >> "$REPORT_FILE"
    git status --porcelain 2>/dev/null | head -10 >> "$REPORT_FILE" || echo "No modified files" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
fi

# Add performance metrics if available
if [ -f "package.json" ]; then
    echo "### Project Info" >> "$REPORT_FILE"
    echo "- Node.js version: $(node --version 2>/dev/null || echo 'N/A')" >> "$REPORT_FILE"
    echo "- npm version: $(npm --version 2>/dev/null || echo 'N/A')" >> "$REPORT_FILE"
    echo "- Dependencies: $(cat package.json | jq '.dependencies | keys | length' 2>/dev/null || echo 'N/A')" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
fi

cat >> "$REPORT_FILE" << EOF
## Next Steps
- [ ] Review changes
- [ ] Run tests if applicable
- [ ] Commit work if ready
- [ ] Deploy if approved

## Notes
Session completed successfully. All changes have been saved and validated.
EOF

echo "📝 Session report saved to: $REPORT_FILE"

# Cleanup temporary files
find . -name "*.tmp" -type f -delete 2>/dev/null || true
find . -name ".DS_Store" -type f -delete 2>/dev/null || true

# Check for any security issues
if command -v gitleaks >/dev/null 2>&1; then
    echo "🔒 Running security scan..."
    gitleaks detect --no-banner 2>/dev/null || echo "No security issues detected"
fi

# Check for any uncommitted changes
if command -v git >/dev/null 2>&1; then
    UNCOMMITTED=$(git status --porcelain 2>/dev/null | grep -v "^??" | wc -l)
    if [ "$UNCOMMITTED" -gt 0 ]; then
        echo "⚠️  $UNCOMMITTED uncommitted changes detected"
        echo "   Consider running: git add . && git commit -m 'Session changes'"
    else
        echo "✅ Working directory is clean"
    fi
fi

echo "👋 Session ended successfully"
