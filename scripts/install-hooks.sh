#!/bin/bash

HOOK_DIR=.git/hooks
SCRIPT_DIR=$(dirname "$(readlink -f "$0")")

if [ ! -d "$HOOK_DIR" ]; then
    echo "Error: .git/hooks directory not found"
    exit 1
fi

echo "Installing pre-commit hook..."
ln -sf "$SCRIPT_DIR/pre-commit.sh" "$HOOK_DIR/pre-commit"
chmod +x "$HOOK_DIR/pre-commit"
echo "Pre-commit hook installed successfully!"