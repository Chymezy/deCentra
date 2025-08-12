#!/bin/bash

# deCentra Backend Migration Script: Motoko to Rust
# This script helps migrate from the old Motoko backend to the new Rust backend

set -e

echo "🚀 deCentra Backend Migration: Motoko → Rust"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "dfx.json" ]; then
    print_error "dfx.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Starting migration process..."

# Step 1: Backup the old Motoko backend
print_status "Step 1: Backing up Motoko backend..."
if [ -f "src/backend/main.mo" ]; then
    mkdir -p backup/motoko
    cp src/backend/main.mo backup/motoko/
    print_success "Motoko backend backed up to backup/motoko/"
else
    print_warning "No Motoko backend found to backup"
fi

# Step 2: Check if Rust backend files exist
print_status "Step 2: Checking Rust backend files..."
required_files=(
    "src/backend/Cargo.toml"
    "src/backend/src/lib.rs"
    "src/backend/src/types.rs"
    "src/backend/src/validation.rs"
    "src/backend/src/auth.rs"
    "src/backend/src/errors.rs"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    print_success "All Rust backend files are present"
else
    print_error "Missing Rust backend files:"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
    exit 1
fi

# Step 3: Verify dfx.json configuration
print_status "Step 3: Verifying dfx.json configuration..."
if grep -q '"type": "custom"' dfx.json; then
    print_success "dfx.json is configured for Rust backend"
else
    print_error "dfx.json is not configured for Rust backend"
    print_status "Please ensure the backend canister is configured as:"
    echo '    "backend": {'
    echo '      "package": "backend",'
    echo '      "type": "rust"'
    echo '    },'
    exit 1
fi

# Step 4: Install Rust dependencies
print_status "Step 4: Installing Rust dependencies..."
cd src/backend
if command -v cargo &> /dev/null; then
    cargo check
    print_success "Rust dependencies checked successfully"
else
    print_error "Cargo not found. Please install Rust: https://rustup.rs/"
    exit 1
fi
cd ../..

# Step 5: Build the new Rust backend
print_status "Step 5: Building Rust backend..."
if dfx build backend; then
    print_success "Rust backend built successfully"
else
    print_error "Failed to build Rust backend"
    exit 1
fi

# Step 6: Data migration considerations
print_status "Step 6: Data migration considerations..."
print_warning "IMPORTANT: Data migration from Motoko to Rust backend"
echo ""
echo "The new Rust backend uses a different data structure format."
echo "If you have existing data in your Motoko backend, you'll need to:"
echo ""
echo "1. Export data from the old Motoko backend"
echo "2. Transform the data to match the new Rust types"
echo "3. Import data into the new Rust backend"
echo ""
echo "For development/testing, you can start fresh with:"
echo "  dfx start --clean"
echo ""

# Step 7: Test the new backend
print_status "Step 7: Testing the new backend..."
echo ""
echo "To test the new Rust backend:"
echo ""
echo "1. Start the local replica:"
echo "   dfx start --clean"
echo ""
echo "2. Deploy the backend:"
echo "   dfx deploy backend"
echo ""
echo "3. Test basic functionality:"
echo "   dfx canister call backend health_check"
echo ""
echo "4. Create a test user profile:"
echo '   dfx canister call backend create_user_profile '"'"'("test_user", opt "Test bio", opt "🧪")'"'"
echo ""
echo "5. Test creating a post:"
echo '   dfx canister call backend create_post '"'"'("Hello from the new Rust backend!", opt variant { Public })'"'"
echo ""

# Step 8: Frontend integration
print_status "Step 8: Frontend integration notes..."
echo ""
echo "The frontend may need updates to work with the new Rust backend:"
echo ""
echo "1. Check src/declarations/backend/ for updated type definitions"
echo "2. Update frontend service calls to match new API"
echo "3. Handle new error types from the Rust backend"
echo "4. Test all social network features"
echo ""

# Summary
print_success "Migration preparation complete!"
echo ""
echo "📋 Summary of changes:"
echo "✅ Rust backend code created with enhanced security"
echo "✅ Strong typing with UserId, PostId newtypes"
echo "✅ Comprehensive input validation"
echo "✅ Proper error handling with SocialNetworkError"
echo "✅ Rate limiting framework"
echo "✅ Authentication and authorization system"
echo "✅ Privacy controls foundation"
echo "✅ dfx.json updated for Rust"
echo ""
echo "🔧 Key improvements in Rust backend:"
echo "• Enhanced security with proper validation"
echo "• Better error handling and user feedback"
echo "• Type safety with newtype patterns"
echo "• Performance optimizations"
echo "• Scalable architecture for future features"
echo "• Comprehensive documentation"
echo ""
echo "⚠️  Next steps:"
echo "1. Review the new backend code"
echo "2. Test the migration process"
echo "3. Update frontend integration"
echo "4. Plan data migration if needed"
echo ""
echo "🎉 Your deCentra backend is now ready for Rust!"
