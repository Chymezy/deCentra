#!/bin/bash

# Install the unified CERT security pre-commit hook
# This installs the comprehensive security and quality validation script

HOOK_DIR=.git/hooks
SCRIPT_DIR=$(dirname "$(readlink -f "$0")")

if [ ! -d "$HOOK_DIR" ]; then
    echo "Error: .git/hooks directory not found"
    exit 1
fi

echo "Installing unified CERT security pre-commit hook..."
ln -sf "$SCRIPT_DIR/pre-commit.sh" "$HOOK_DIR/pre-commit"
chmod +x "$HOOK_DIR/pre-commit"
echo "Unified pre-commit hook installed successfully!"
echo "This hook enforces CERT security standards and prevents common coding errors."