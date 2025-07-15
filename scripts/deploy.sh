#!/bin/bash

# scripts/deploy.sh
# Deploys the entire deCentra application (backend and frontend) to a specified network.

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
NETWORK=${1:-local} # Default to 'local' if no argument provided
DFX_VERSION="0.25.0" # Ensure DFX version consistency

echo "--- deCentra Deployment Script ---"
echo "Target Network: $NETWORK"
echo "DFX Version: $DFX_VERSION"

# --- Pre-checks ---
if ! command -v dfx &> /dev/null; then
    echo "Error: DFX CLI not found. Please install DFX."
    exit 1
fi

CURRENT_DFX_VERSION=$(dfx --version | awk '{print $2}')
if [[ "$CURRENT_DFX_VERSION" != "$DFX_VERSION" ]]; then
    echo "Warning: DFX version mismatch. Expected $DFX_VERSION, found $CURRENT_DFX_VERSION."
    echo "Consider running 'dfx upgrade' or installing the correct version."
    # Optionally, exit here if strict versioning is required
    # exit 1
fi

# --- Start DFX network (if local) ---
if [ "$NETWORK" == "local" ]; then
    echo "Stopping any running local DFX instance..."
    dfx stop || true # Ignore error if no instance is running
    echo "Starting clean local DFX network in background..."
    dfx start --clean --background
    echo "Local DFX network started."
fi

# --- Backend Deployment ---
echo "Building and deploying Motoko backend canisters to $NETWORK..."
# This will create/reinstall canisters and deploy code
dfx deploy --network "$NETWORK"

# --- Frontend Build & Deployment ---
echo "Building Next.js frontend..."
# Ensure frontend dependencies are installed
(cd src/deCentra_frontend && npm install)
# Build the Next.js application
(cd src/deCentra_frontend && npm run build)

echo "Deploying frontend assets to $NETWORK..."
# The 'frontend' canister is of type 'assets' and serves the Next.js build output
# DFX automatically picks up the 'source' directory from dfx.json (e.g., 'src/frontend/dist')
dfx deploy deCentra_frontend --network "$NETWORK"

# --- Post-deployment Information ---
echo "Deployment completed successfully!"

if [ "$NETWORK" == "local" ]; then
    FRONTEND_CANISTER_ID=$(dfx canister id deCentra_frontend)
    echo "You can access the frontend at: http://localhost:4943/?canisterId=$FRONTEND_CANISTER_ID"
else
    echo "Deployment to $NETWORK completed. Check your DFX dashboard for canister IDs."
fi
