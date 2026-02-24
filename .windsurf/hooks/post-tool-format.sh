#!/bin/bash

# Post-Tool-Use Hook: Auto-format and validate files
# This hook runs after Claude Code uses any tool (Write, Edit, etc.)

# Get the file path from environment variable
FILE_PATH="$CLAUDE_TOOL_INPUT_FILE_PATH"

if [ -z "$FILE_PATH" ]; then
    exit 0
fi

# Only process specific file types
case "$FILE_PATH" in
    *.ts|*.tsx|*.js|*.jsx|*.json|*.md|*.css|*.scss)
        echo "🎨 Auto-formatting: $FILE_PATH"
        
        # Run Prettier
        if command -v npx >/dev/null 2>&1; then
            npx prettier --write "$FILE_PATH" 2>/dev/null || true
        fi
        
        # Run ESLint for TypeScript/JavaScript files
        if [[ "$FILE_PATH" =~ \.(ts|tsx|js|jsx)$ ]]; then
            if command -v npx >/dev/null 2>&1; then
                npx eslint --fix "$FILE_PATH" 2>/dev/null || true
            fi
        fi
        
        # Check for TypeScript compilation errors
        if [[ "$FILE_PATH" =~ \.(ts|tsx)$ ]]; then
            if command -v npx >/dev/null 2>&1; then
                npx tsc --noEmit --skipLibCheck "$FILE_PATH" 2>/dev/null || {
                    echo "⚠️ TypeScript compilation error in $FILE_PATH"
                }
            fi
        fi
        
        echo "✅ Formatting complete: $FILE_PATH"
        ;;
    *)
        # Skip other file types
        ;;
esac
