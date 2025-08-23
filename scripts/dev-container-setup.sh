#!/bin/bash
set -e

echo "� Redirecting to unified setup script..."
echo "� Note: dev-container-setup.sh is now unified with setup.sh"
echo "� Running unified development environment setup..."

# Execute the unified setup script
exec ./scripts/setup.sh
