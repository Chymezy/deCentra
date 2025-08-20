#!/bin/bash

# scripts/setup.sh
# Sets up the development environment for deCentra.
set -e

echo "🚀 --- deCentra Setup Script ---"

# Detect OS
OS="$(uname -s)"
case "${OS}" in
    Linux*)     PLATFORM=Linux;;
    Darwin*)    PLATFORM=Mac;;
    CYGWIN*|MINGW*|MSYS*) PLATFORM=Windows;;
    *)          PLATFORM="UNKNOWN:${OS}"
esac

echo "🖥️ Platform detected: $PLATFORM"

# --- Install DFX ---
if ! command -v dfx &> /dev/null; then
    echo "📦 Installing DFX..."
    sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
    echo "✅ DFX installed."
else
    echo "✅ DFX is already installed."
fi

# --- Install Node.js and npm (via NVM) ---
if ! command -v node &> /dev/null; then
    echo "📦 Node.js not found. Installing via NVM..."

    if ! command -v nvm &> /dev/null; then
        echo "🌐 Installing NVM..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
        export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi

    echo "📦 Installing latest Node.js via NVM..."
    nvm install --lts
    nvm use --lts
    echo "✅ Node.js installed via NVM."
else
    echo "✅ Node.js is already installed."
fi

# --- Install Root Dependencies ---
echo "📦 Installing root dependencies..."
(npm install)

echo "✅ Installation completed successfully!"

# --- Install Frontend Dependencies ---
echo "📦 Installing frontend dependencies..."
(cd src/frontend && npm install)

echo "✅ Setup completed successfully!"

# --- Install candid-extractor ---
echo "📦 Checking candid-extractor installation..."
# Check if candid-extractor is installed
if ! command -v candid-extractor &> /dev/null; then
    echo "candid-extractor not found. Installing..."
    cargo install candid-extractor
    
    # Verify installation was successful
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install candid-extractor"
        exit 1
    fi
    echo "candid-extractor installed successfully"
else
    echo "candid-extractor is already installed"
fi
