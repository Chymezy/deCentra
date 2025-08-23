#!/bin/bash

# scripts/setup.sh
# Unified development environment setup for deCentra
# Supports both local development and containerized environments (GitHub Codespaces, Dev Containers)
set -e

echo "🚀 --- deCentra Unified Development Environment Setup ---"

# Detect environment and platform
detect_environment() {
    # Detect if running in container environment
    if [ -n "$CODESPACES" ]; then
        ENV_TYPE="codespaces"
        echo "🐙 GitHub Codespaces environment detected"
    elif [ -n "$REMOTE_CONTAINERS" ] || [ -f "/.dockerenv" ]; then
        ENV_TYPE="devcontainer"
        echo "🐳 Dev Container environment detected"
    else
        ENV_TYPE="local"
        echo "🖥️ Local development environment detected"
    fi

    # Detect OS
    OS="$(uname -s)"
    case "${OS}" in
        Linux*)     PLATFORM=Linux;;
        Darwin*)    PLATFORM=Mac;;
        CYGWIN*|MINGW*|MSYS*) PLATFORM=Windows;;
        *)          PLATFORM="UNKNOWN:${OS}"
    esac

    echo "🖥️ Platform: $PLATFORM | Environment: $ENV_TYPE"
}

detect_environment

# --- System Package Installation (Container environments) ---
install_system_packages() {
    if [ "$ENV_TYPE" = "codespaces" ] || [ "$ENV_TYPE" = "devcontainer" ]; then
        echo "📦 Installing system packages for container environment..."
        
        # Update package lists
        if command -v apt-get &> /dev/null; then
            apt-get update
            
            # Install essential development tools
            apt-get install -y \
                curl \
                wget \
                git \
                build-essential \
                pkg-config \
                libssl-dev \
                jq \
                unzip \
                ca-certificates \
                gnupg \
                lsb-release
                
            echo "✅ System packages installed"
        elif command -v yum &> /dev/null; then
            sudo yum update -y
            sudo yum install -y curl wget git gcc openssl-devel jq unzip
            echo "✅ System packages installed (RHEL/CentOS)"
        else
            echo "⚠️ Package manager not recognized, skipping system packages"
        fi
    else
        echo "⏭️ Skipping system packages (local environment)"
    fi
}

install_system_packages

# --- Rust Toolchain Installation ---
install_rust() {
    echo "🦀 Setting up Rust toolchain..."
    
    if ! command -v rustc &> /dev/null; then
        echo "📦 Installing Rust via rustup..."
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        
        # Source the environment
        source ~/.cargo/env
        echo "✅ Rust installed successfully"
    else
        echo "✅ Rust is already installed"
        rustc --version
    fi
    
    # Ensure we have the WebAssembly target (required for ICP canisters)
    echo "🎯 Adding WebAssembly target..."
    rustup target add wasm32-unknown-unknown
    
    # Install essential Rust tools for ICP development
    echo "🔧 Installing Rust development tools..."
    
    # Install candid-extractor if not present
    if ! command -v candid-extractor &> /dev/null; then
        echo "📦 Installing candid-extractor..."
        cargo install candid-extractor
    else
        echo "✅ candid-extractor already installed"
    fi
    
    # Install other useful Rust tools
    # cargo install --locked trunk 2>/dev/null || true
    # echo "⚠️ trunk installation skipped (optional)"
    
    echo "✅ Rust toolchain setup complete"
}

install_rust

# --- DFX Installation (ICP SDK) ---
install_dfx() {
    echo "⚙️ Setting up Internet Computer SDK..."
    
    if [ "$ENV_TYPE" = "codespaces" ] || [ "$ENV_TYPE" = "devcontainer" ]; then
        # Use dfxvm for container environments (more reliable)
        echo "📦 Installing DFX via dfxvm (container environment)..."
        
        if ! command -v dfxvm &> /dev/null; then
            DFXVM_INIT_YES=true bash -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
        fi
        
        # Install specific DFX version
        dfxvm install 0.25.0
        dfxvm default 0.25.0
        
        # Setup container-specific identity
        echo "🔑 Setting up container DFX identity..."
        dfx identity new codespace_dev --storage-mode=plaintext 2>/dev/null || echo "Identity may already exist"
        dfx identity use codespace_dev
        
        echo "✅ DFX installed via dfxvm"
    else
        # Standard installation for local environments
        if ! command -v dfx &> /dev/null; then
            echo "📦 Installing DFX..."
            sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
            echo "✅ DFX installed"
        else
            echo "✅ DFX is already installed"
        fi
    fi
    
    # Verify installation
    dfx --version
}

install_dfx

# --- Node.js Installation ---
install_nodejs() {
    echo "🟢 Setting up Node.js..."
    
    if ! command -v node &> /dev/null; then
        echo "📦 Node.js not found. Installing via NVM..."

        if ! command -v nvm &> /dev/null; then
            echo "🌐 Installing NVM..."
            curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
            export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
            [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        fi

        echo "📦 Installing latest Node.js LTS via NVM..."
        nvm install --lts
        nvm use --lts
        echo "✅ Node.js installed via NVM"
    else
        echo "✅ Node.js is already installed"
        node --version
        npm --version
    fi
}

install_nodejs

# --- Project Dependencies ---
install_dependencies() {
    echo "📦 Installing project dependencies..."
    
    # Install root dependencies
    echo "📦 Installing root dependencies..."
    npm install
    
    # Install frontend dependencies
    echo "📦 Installing frontend dependencies..."
    (cd src/frontend && npm install)
    
    echo "✅ Project dependencies installed"
}

install_dependencies

# --- Development Tools (Container-specific) ---
install_dev_tools() {
    if [ "$ENV_TYPE" = "codespaces" ] || [ "$ENV_TYPE" = "devcontainer" ]; then
        echo "�️ Installing container-specific development tools..."
        
        # Install Ollama for AI assistance (optional)
        if ! command -v ollama &> /dev/null; then
            echo "🤖 Installing Ollama for AI support..."
            curl -fsSL https://ollama.com/install.sh | sh || echo "⚠️ Ollama installation failed (optional)"
        else
            echo "✅ Ollama already installed"
        fi
        
        echo "✅ Development tools setup complete"
    else
        echo "⏭️ Skipping container-specific dev tools (local environment)"
    fi
}

install_dev_tools

# --- Git Hooks Setup ---
setup_git_hooks() {
    echo "🪝 Setting up Git hooks..."
    
    if [ -f "./scripts/install-hooks.sh" ]; then
        chmod +x ./scripts/install-hooks.sh
        ./scripts/install-hooks.sh
        echo "✅ Git hooks installed"
    else
        echo "⚠️ Git hooks script not found, skipping"
    fi
}

# setup_git_hooks

# --- Environment Configuration ---
setup_environment() {
    echo "⚙️ Setting up environment configuration..."
    
    # Create .env.local if it doesn't exist
    if [ ! -f ".env.local" ]; then
        echo "📝 Creating .env.local file..."
        cat > .env.local << EOF
# deCentra Local Development Environment
DFX_NETWORK=local
HOST=localhost:4943

# Internet Identity Configuration
INTERNET_IDENTITY_URL=http://localhost:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai

# Development flags
NODE_ENV=development
DEV_MODE=true
EOF
        echo "✅ Environment configuration created"
    else
        echo "✅ Environment configuration already exists"
    fi
}

setup_environment

# --- Final Setup Steps ---
finalize_setup() {
    echo "🏁 Finalizing setup..."
    
    # Test DFX installation
    if [ "$ENV_TYPE" = "codespaces" ] || [ "$ENV_TYPE" = "devcontainer" ]; then
        echo "🧪 Testing DFX in container environment..."
        dfx start --background --clean || echo "⚠️ DFX start test failed (normal in container setup)"
        sleep 2
        dfx stop || echo "⚠️ DFX stop failed (expected)"
    fi
    
    echo ""
    echo "🎉 deCentra development environment setup complete!"
    echo ""
    echo "📋 Next steps:"
    echo "  1. Start local DFX replica: 'dfx start --clean --background'"
    echo "  2. Deploy canisters: './scripts/deploy.sh local'"
    echo "  3. Start frontend: 'cd src/frontend && npm run dev'"
    echo ""
    echo "🔗 Useful commands:"
    echo "  • Deploy locally: './scripts/deploy.sh local'"
    echo "  • Run tests: 'cargo test && npm test'"
    echo "  • Format code: 'cargo fmt && npm run format'"
    echo ""
    
    if [ "$ENV_TYPE" = "codespaces" ]; then
        echo "☁️ GitHub Codespaces specific:"
        echo "  • Ports 4943 (DFX) and 5173 (Vite) are auto-forwarded"
        echo "  • Access frontend at the forwarded port URL"
    elif [ "$ENV_TYPE" = "devcontainer" ]; then
        echo "🐳 Dev Container specific:"
        echo "  • Use VS Code terminal for all commands"
        echo "  • Ports are configured for forwarding"
    fi
    
    echo ""
    echo "✨ Happy coding! Building the future of decentralized social media! ✨"
}

finalize_setup
