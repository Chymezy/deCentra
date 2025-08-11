---
applyTo: "**/scripts/**"
---

# Deployment Instructions for deCentra

## ICP Canister Deployment

### Local Development Environment

```bash
# Start local Internet Computer replica
dfx start --clean

# Deploy to local network
dfx deploy --network local

# Reset and deploy fresh
dfx deploy --network local --mode reinstall

# Deploy specific canister
dfx deploy backend --network local
```

### Environment-Specific Configurations

```bash
# networks.json configuration for different environments
{
  "local": {
    "bind": "127.0.0.1:4943",
    "type": "ephemeral"
  },
  "testnet": {
    "providers": ["https://testnet.dfinity.network"],
    "type": "persistent"
  },
  "ic": {
    "providers": ["https://icp-api.io"],
    "type": "persistent"
  }
}
```

### Deployment Scripts

```bash
#!/bin/bash
# filepath: scripts/deploy-local.sh

set -e

echo "🚀 Deploying deCentra to local network..."

# Check if dfx is running
if ! dfx ping; then
    echo "❌ dfx is not running. Please start it with 'dfx start'"
    exit 1
fi

# Build and deploy backend canister
echo "📦 Building backend canister..."
dfx build backend

echo "🔧 Deploying backend canister..."
dfx deploy backend --network local

# Get canister ID for frontend
CANISTER_ID=$(dfx canister id backend --network local)
echo "Backend canister deployed with ID: $CANISTER_ID"

# Set environment variables for frontend
export VITE_CANISTER_ID_backend=$CANISTER_ID
export VITE_DFX_NETWORK=local

# Build and start frontend
echo "🎨 Building frontend..."
npm run build

echo "🌐 Starting frontend development server..."
npm run dev

echo "✅ deCentra deployed successfully!"
echo "🔗 Access the application at: http://localhost:5173"
echo "🔗 Candid UI available at: http://127.0.0.1:4943/?canisterId=$(dfx canister id __Candid_UI)&id=$CANISTER_ID"
```

```bash
#!/bin/bash
# filepath: scripts/deploy-testnet.sh

set -e

echo "🚀 Deploying deCentra to IC testnet..."

# Check wallet balance
BALANCE=$(dfx wallet balance --network testnet)
echo "💰 Wallet balance: $BALANCE"

if [[ "$BALANCE" == *"0.000"* ]]; then
    echo "❌ Insufficient balance. Please add cycles to your wallet."
    echo "💡 Visit https://faucet.dfinity.org/ to get test cycles"
    exit 1
fi

# Deploy with sufficient cycles
echo "📦 Deploying backend with cycles..."
dfx deploy backend --network testnet --with-cycles 1000000000000

CANISTER_ID=$(dfx canister id backend --network testnet)
echo "✅ Backend deployed to testnet with ID: $CANISTER_ID"

# Update frontend configuration
export VITE_CANISTER_ID_backend=$CANISTER_ID
export VITE_DFX_NETWORK=testnet

echo "🎨 Building production frontend..."
npm run build

echo "✅ deCentra deployed to testnet successfully!"
echo "🔗 Access at: https://$CANISTER_ID.icp0.io"
```

```bash
#!/bin/bash
# filepath: scripts/deploy-mainnet.sh

set -e

echo "🚀 Deploying deCentra to IC mainnet..."
echo "⚠️  WARNING: This will deploy to production mainnet!"

read -p "Are you sure you want to continue? (yes/no): " confirm
if [[ $confirm != "yes" ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Security checks
echo "🔍 Running security checks..."

# Check for .env files that shouldn't be committed
if [ -f ".env" ]; then
    echo "❌ .env file found. Remove before mainnet deployment."
    exit 1
fi

# Verify we're on the main branch
BRANCH=$(git branch --show-current)
if [[ "$BRANCH" != "main" ]]; then
    echo "❌ Not on main branch. Switch to main for production deployment."
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "❌ Uncommitted changes found. Commit all changes before deployment."
    exit 1
fi

# Run all tests
echo "🧪 Running tests..."
npm test
cargo test

# Check wallet balance (need more cycles for mainnet)
BALANCE=$(dfx wallet balance --network ic)
echo "💰 Wallet balance: $BALANCE"

# Deploy with production cycles allocation
echo "📦 Deploying to mainnet with production cycles..."
dfx deploy backend --network ic --with-cycles 5000000000000

CANISTER_ID=$(dfx canister id backend --network ic)
echo "✅ Backend deployed to mainnet with ID: $CANISTER_ID"

# Build production frontend
export VITE_CANISTER_ID_backend=$CANISTER_ID
export VITE_DFX_NETWORK=ic

echo "🎨 Building production frontend..."
npm run build

echo "🎉 deCentra deployed to mainnet successfully!"
echo "🔗 Access at: https://$CANISTER_ID.icp0.io"
echo "📊 Monitor at: https://dashboard.internetcomputer.org/canister/$CANISTER_ID"

# Send deployment notification
echo "📧 Sending deployment notification..."
# Add your notification logic here (Slack, Discord, etc.)
```

### Canister Configuration

```toml
# dfx.json configuration for social network deployment
{
  "version": 1,
  "canisters": {
    "backend": {
      "type": "rust",
      "package": "backend",
      "candid": "src/backend/backend.did",
      "build": ["cargo build --target wasm32-unknown-unknown --release --package backend"]
    }
  },
  "defaults": {
    "build": {
      "packtool": ""
    }
  },
  "networks": {
    "local": {
      "bind": "127.0.0.1:4943",
      "type": "ephemeral",
      "replica": {
        "subnet_type": "application"
      }
    },
    "testnet": {
      "providers": ["https://testnet.dfinity.network"],
      "type": "persistent"
    },
    "ic": {
      "providers": ["https://icp-api.io"],
      "type": "persistent"
    }
  }
}
```

### Upgrade Safety Procedures

```bash
#!/bin/bash
# filepath: scripts/upgrade-canister.sh

set -e

NETWORK=${1:-local}
CANISTER_NAME="backend"

echo "🔄 Upgrading $CANISTER_NAME on $NETWORK network..."

# Backup current state
echo "💾 Creating state backup..."
dfx canister call $CANISTER_NAME export_state --network $NETWORK > "backup_$(date +%Y%m%d_%H%M%S).json"

# Build new version
echo "📦 Building new version..."
cargo build --target wasm32-unknown-unknown --release --package $CANISTER_NAME

# Upgrade canister
echo "⬆️  Upgrading canister..."
dfx canister install $CANISTER_NAME --mode upgrade --network $NETWORK

# Verify upgrade
echo "✅ Verifying upgrade..."
dfx canister call $CANISTER_NAME get_version --network $NETWORK

echo "🎉 Upgrade completed successfully!"
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# filepath: .github/workflows/deploy.yml
name: Deploy deCentra

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  CARGO_TERM_COLOR: always
  NODE_VERSION: '18'
  RUST_VERSION: '1.70'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          toolchain: ${{ env.RUST_VERSION }}
          targets: wasm32-unknown-unknown
      
      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install dfx
        run: |
          DFX_VERSION=0.15.0
          wget https://github.com/dfinity/sdk/releases/download/${DFX_VERSION}/dfx-${DFX_VERSION}-x86_64-linux.tar.gz
          tar -xzf dfx-${DFX_VERSION}-x86_64-linux.tar.gz
          sudo mv dfx /usr/local/bin/dfx
          dfx --version
      
      - name: Setup dfx identity
        run: |
          dfx identity new github-actions --storage-mode=plaintext || true
          dfx identity use github-actions
      
      - name: Start dfx
        run: |
          dfx start --background --host 127.0.0.1:4943
          sleep 10
      
      - name: Run backend tests
        run: |
          cargo test --package backend
          cargo clippy --all-targets --all-features -- -D warnings
      
      - name: Run frontend tests
        run: |
          npm run test:frontend
          npm run type-check
      
      - name: Build canister
        run: |
          dfx build backend
      
      - name: Deploy to local (test)
        run: |
          dfx deploy backend --network local
          dfx canister call backend get_version
      
      - name: Stop dfx
        run: dfx stop

  deploy-testnet:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install dfx
        run: |
          DFX_VERSION=0.15.0
          wget https://github.com/dfinity/sdk/releases/download/${DFX_VERSION}/dfx-${DFX_VERSION}-x86_64-linux.tar.gz
          tar -xzf dfx-${DFX_VERSION}-x86_64-linux.tar.gz
          sudo mv dfx /usr/local/bin/dfx
      
      - name: Setup dfx identity
        run: |
          echo "${{ secrets.DFX_IDENTITY }}" | base64 -d > identity.pem
          dfx identity import github-actions identity.pem
          dfx identity use github-actions
          rm identity.pem
      
      - name: Deploy to testnet
        run: |
          dfx deploy backend --network testnet --with-cycles 1000000000000
          echo "CANISTER_ID=$(dfx canister id backend --network testnet)" >> $GITHUB_ENV
      
      - name: Update deployment status
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.repos.createDeploymentStatus({
              owner: context.repo.owner,
              repo: context.repo.repo,
              deployment_id: context.payload.deployment.id,
              state: 'success',
              environment_url: `https://${{ env.CANISTER_ID }}.icp0.io`,
              description: 'Deployed to testnet successfully'
            });
```

### Pre-deployment Security Checks

```bash
#!/bin/bash
# filepath: scripts/security-check.sh

set -e

echo "🔍 Running security checks before deployment..."

# Check for sensitive data in code
echo "🔒 Checking for sensitive data..."
if grep -r "sk_test\|sk_live\|pk_test\|pk_live" src/ 2>/dev/null; then
    echo "❌ Sensitive keys found in source code!"
    exit 1
fi

# Check for TODO/FIXME in production code
echo "📝 Checking for TODO/FIXME items..."
TODO_COUNT=$(grep -r "TODO\|FIXME" src/ | wc -l)
if [ $TODO_COUNT -gt 0 ]; then
    echo "⚠️  Found $TODO_COUNT TODO/FIXME items. Review before production deployment."
    grep -r "TODO\|FIXME" src/
fi

# Run security audit
echo "🛡️  Running security audit..."
cargo audit
npm audit --audit-level moderate

# Check canister size
echo "📏 Checking canister size..."
WASM_SIZE=$(wc -c < target/wasm32-unknown-unknown/release/backend.wasm)
MAX_SIZE=2097152  # 2MB limit

if [ $WASM_SIZE -gt $MAX_SIZE ]; then
    echo "❌ Canister WASM file too large: ${WASM_SIZE} bytes (max: ${MAX_SIZE})"
    exit 1
fi

echo "✅ Security checks passed!"
```

### Monitoring and Health Checks

```bash
#!/bin/bash
# filepath: scripts/health-check.sh

NETWORK=${1:-local}
CANISTER_ID=$(dfx canister id backend --network $NETWORK)

echo "🏥 Running health checks for deCentra on $NETWORK..."

# Check canister status
echo "📊 Checking canister status..."
STATUS=$(dfx canister status backend --network $NETWORK)
echo "$STATUS"

# Check if canister is running
if echo "$STATUS" | grep -q "Status: Running"; then
    echo "✅ Canister is running"
else
    echo "❌ Canister is not running!"
    exit 1
fi

# Test basic functionality
echo "🧪 Testing basic functionality..."

# Test version endpoint
VERSION=$(dfx canister call backend get_version --network $NETWORK)
echo "Version: $VERSION"

# Test authentication (should fail for anonymous)
echo "🔐 Testing authentication..."
AUTH_TEST=$(dfx canister call backend get_user_profile --network $NETWORK 2>&1 || true)
if echo "$AUTH_TEST" | grep -q "Authentication required"; then
    echo "✅ Authentication working correctly"
else
    echo "❌ Authentication check failed!"
    exit 1
fi

# Check cycle balance
echo "💰 Checking cycle balance..."
CYCLES=$(echo "$STATUS" | grep "Balance:" | awk '{print $2}')
MIN_CYCLES=1000000000000  # 1T cycles minimum

if [ "$CYCLES" -lt "$MIN_CYCLES" ]; then
    echo "⚠️  Low cycle balance: $CYCLES (minimum: $MIN_CYCLES)"
else
    echo "✅ Cycle balance sufficient: $CYCLES"
fi

echo "🎉 Health check completed!"
```

### Environment Variables Management

```bash
# filepath: scripts/setup-env.sh

#!/bin/bash

NETWORK=${1:-local}

echo "🔧 Setting up environment for $NETWORK..."

case $NETWORK in
    "local")
        export VITE_DFX_NETWORK=local
        export VITE_HOST=http://127.0.0.1:4943
        export VITE_INTERNET_IDENTITY_URL=http://127.0.0.1:4943/?canisterId=rdmx6-jaaaa-aaaah-qcaiq-cai
        ;;
    "testnet")
        export VITE_DFX_NETWORK=testnet
        export VITE_HOST=https://testnet.dfinity.network
        export VITE_INTERNET_IDENTITY_URL=https://identity.ic0.app
        ;;
    "ic")
        export VITE_DFX_NETWORK=ic
        export VITE_HOST=https://icp-api.io
        export VITE_INTERNET_IDENTITY_URL=https://identity.ic0.app
        ;;
    *)
        echo "❌ Unknown network: $NETWORK"
        exit 1
        ;;
esac

# Get canister IDs
if [ -f ".dfx/local/canister_ids.json" ] && [ "$NETWORK" = "local" ]; then
    export VITE_CANISTER_ID_backend=$(jq -r '.backend.local' .dfx/local/canister_ids.json)
elif [ -f "canister_ids.json" ]; then
    export VITE_CANISTER_ID_backend=$(jq -r ".backend.$NETWORK" canister_ids.json)
fi

echo "✅ Environment configured for $NETWORK"
echo "🔗 Backend Canister ID: $VITE_CANISTER_ID_backend"
echo "🌐 Network: $VITE_DFX_NETWORK"
echo "🏠 Host: $VITE_HOST"
```

### Rollback Procedures

```bash
#!/bin/bash
# filepath: scripts/rollback.sh

set -e

NETWORK=${1:-local}
BACKUP_FILE=${2}

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Please provide backup file path"
    echo "Usage: $0 <network> <backup_file>"
    exit 1
fi

echo "🔄 Rolling back deCentra on $NETWORK network..."

# Verify backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Get current canister info
CANISTER_ID=$(dfx canister id backend --network $NETWORK)
echo "📋 Rolling back canister: $CANISTER_ID"

# Create emergency backup before rollback
echo "💾 Creating emergency backup before rollback..."
dfx canister call backend export_state --network $NETWORK > "emergency_backup_$(date +%Y%m%d_%H%M%S).json"

# Restore from backup
echo "⬅️  Restoring from backup: $BACKUP_FILE"
dfx canister call backend import_state --network $NETWORK "$(cat $BACKUP_FILE)"

# Verify rollback
echo "✅ Verifying rollback..."
dfx canister call backend get_version --network $NETWORK

echo "🎉 Rollback completed successfully!"
echo "⚠️  Emergency backup saved in case of issues"
```

Remember: Always test deployments on local and testnet before mainnet. Monitor cycle consumption and implement proper backup procedures for production deployments.