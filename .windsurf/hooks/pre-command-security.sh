#!/bin/bash

# Pre-Command Hook: Security validation
# This hook runs before Claude Code executes any command

COMMAND="$CLAUDE_COMMAND_INPUT"

# Define dangerous commands that should be blocked
DANGEROUS_COMMANDS=(
    "rm -rf"
    "rm -r /"
    "sudo rm"
    "chmod 777"
    "chown root"
    "git push --force"
    "git reset --hard HEAD"
    "git clean -fd"
    ":(){ :|:& };:"  # Fork bomb
    "dd if=/dev/zero"
    "mv /dev/null"
    "> /dev/"
)

# Check if command contains dangerous patterns
for dangerous_cmd in "${DANGEROUS_COMMANDS[@]}"; do
    if [[ "$COMMAND" == *"$dangerous_cmd"* ]]; then
        echo "🚨 SECURITY ALERT: Blocked dangerous command: $dangerous_cmd"
        echo "This command could cause data loss or security issues."
        echo "Please use a safer alternative or confirm with explicit /allow flag."
        exit 1
    fi
done

# Check for potential secret exposure
if [[ "$COMMAND" =~ (echo|cat|print|display).*[Aa][Pp][Ii][_][Kk][Ee][Yy]|[Ss][Ee][Cc][Rr][Ee][Tt]|[Tt][Oo][Kk][Ee][Nn]|[Pp][Aa][Ss][Ss][Ww][Oo][Rr][Dd] ]]; then
    echo "⚠️ SECURITY WARNING: Command may expose sensitive data"
    echo "Please verify no secrets or API keys will be exposed."
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Command cancelled for security reasons"
        exit 1
    fi
fi

# Check for production environment modifications
if [[ "$COMMAND" =~ (production|prod|main|master).*[Dd][Ee][Ll][Ee][Tt][Ee]|[Dd][Rr][Oo][Pp]|[Tt][Rr][Uu][Nn][Cc][Aa][Tt][Ee] ]]; then
    echo "🚨 PRODUCTION WARNING: Command modifies production environment"
    echo "This could affect live users and data."
    read -p "Continue with production modification? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Production modification cancelled"
        exit 1
    fi
fi

echo "✅ Security validation passed"
