#!/bin/bash

# CERT Secure Coding Pre-Commit Hook for ICP Projects
# This script enforces security checks before allowing commits

set -e

echo "🔒 Running CERT Security Checks..."

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
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_warning() {
    local message="$1"
    echo -e "${YELLOW}[WARN]${NC} $message"
    WARNINGS="${WARNINGS}- ${message}\n"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Track if any check failed
CHECKS_FAILED=0
WARNINGS=""

# Cache directory for expensive checks
CACHE_DIR=".git/cert-check-cache"
mkdir -p "$CACHE_DIR"

# Function to check cache validity
check_cache() {
    local check_name="$1"
    local cache_file="$CACHE_DIR/$check_name"
    local cache_timeout=300  # 5 minutes
    
    if [ -f "$cache_file" ]; then
        local cache_time=$(stat -c %Y "$cache_file" 2>/dev/null || stat -f %m "$cache_file" 2>/dev/null)
        local current_time=$(date +%s)
        local age=$((current_time - cache_time))
        
        if [ $age -lt $cache_timeout ]; then
            return 0  # Cache is valid
        fi
    fi
    return 1  # Cache is invalid or missing
}

# Get staged files by type
STAGED_RS_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.rs$' || true)
STAGED_MO_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.mo$' || true)
STAGED_TS_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$' || true)
STAGED_ALL_FILES=$(git diff --cached --name-only --diff-filter=ACM || true)

print_status "Staged files analysis:"
echo "  - Rust files: $(echo "$STAGED_RS_FILES" | wc -w)"
echo "  - Motoko files: $(echo "$STAGED_MO_FILES" | wc -w)" 
echo "  - TypeScript files: $(echo "$STAGED_TS_FILES" | wc -w)"
echo "  - Total files: $(echo "$STAGED_ALL_FILES" | wc -w)"

# Check Rust Files (ONLY if Rust files are staged)
if [ -n "$STAGED_RS_FILES" ]; then
    print_status "Checking Rust files..."
    
    # Check 1: Code Formatting
    print_status "Checking Rust code formatting..."
    if cargo fmt -- --check > /dev/null 2>&1; then
        print_success "Rust code formatting is correct"
    else
        print_error "Rust code formatting check failed"
        echo "Run 'cargo fmt' to fix formatting issues"
        CHECKS_FAILED=1
    fi

    # Check 2: Clippy Linting (with security-focused rules)
    print_status "Running security-focused linting with Clippy..."
    if cargo clippy --all-targets --all-features -- \
        -D warnings \
        -D clippy::unwrap_used \
        -D clippy::expect_used \
        -D clippy::panic \
        -D clippy::unreachable \
        -D clippy::todo \
        -D clippy::unimplemented \
        -W clippy::cast_possible_truncation \
        -W clippy::cast_possible_wrap \
        -W clippy::cast_precision_loss \
        -W clippy::integer_arithmetic \
        -W clippy::string_slice \
        > /dev/null 2>&1; then
        print_success "Clippy security checks passed"
    else
        print_error "Clippy security checks failed"
        echo "Fix the warnings above before committing"
        echo "Particularly check for .unwrap(), .expect(), and panic! usage"
        CHECKS_FAILED=1
    fi

    # Check 3: Cargo audit (cached)
    print_status "Running cargo audit for known vulnerabilities..."
    if ! check_cache "cargo-audit"; then
        if command -v cargo-audit > /dev/null 2>&1; then
            if cargo audit > /dev/null 2>&1; then
                touch "$CACHE_DIR/cargo-audit"
                print_success "No known security vulnerabilities found"
            else
                print_error "Security vulnerabilities detected"
                echo "Run 'cargo audit' to see details and update dependencies"
                CHECKS_FAILED=1
            fi
        else
            print_warning "cargo-audit not installed. Install with: cargo install cargo-audit"
        fi
    else
        print_success "No known security vulnerabilities found (cached)"
    fi

    # Check 4: Security tests
    print_status "Running security-focused tests..."
    if cargo test security_ --quiet > /dev/null 2>&1; then
        print_success "Security tests passed"
    else
        print_warning "No security tests found or tests failed"
        echo "Consider adding tests with names starting with 'security_'"
    fi

    # Check 5: Security anti-patterns in staged Rust files
    print_status "Scanning for security anti-patterns in Rust files..."
    ANTIPATTERNS_FOUND=0
    
    # Check for .unwrap() usage
    if git diff --cached | grep -E '^\+.*\.unwrap\(\)' > /dev/null; then
        print_error "Found .unwrap() in staged changes"
        echo "Replace .unwrap() with proper error handling"
        ANTIPATTERNS_FOUND=1
    fi
    
    # Check for .expect() usage  
    if git diff --cached | grep -E '^\+.*\.expect\(' > /dev/null; then
        print_error "Found .expect() in staged changes"
        echo "Replace .expect() with proper error handling"
        ANTIPATTERNS_FOUND=1
    fi
    
    # Check for panic! usage
    if git diff --cached | grep -E '^\+.*panic!' > /dev/null; then
        print_error "Found panic! in staged changes"
        echo "Replace panic! with proper error handling"
        ANTIPATTERNS_FOUND=1
    fi
    
    # Check for TODO/FIXME in security-related contexts
    if git diff --cached | grep -E '^\+.*(TODO|FIXME).*(auth|security|password|token|principal)' -i > /dev/null; then
        print_warning "Found security-related TODO/FIXME in staged changes"
        echo "Ensure security-related TODOs are resolved before release"
    fi
    
    # Check for hardcoded secrets patterns
    if git diff --cached | grep -E '^\+.*((password|secret|api_key|token)s?)\s*=\s*[\x27\x22][^\x27\x22]{8,}[\x27\x22]' -i > /dev/null; then
        print_error "Possible hardcoded secret detected in staged changes"
        echo "Remove hardcoded secrets and use environment variables"
        ANTIPATTERNS_FOUND=1
    fi
    
    # Check for unsafe blocks
    if git diff --cached | grep -E '^\+.*unsafe\s*\{' > /dev/null; then
        print_warning "Found unsafe block in staged changes"
        echo "Ensure unsafe code is properly reviewed and documented"
    fi
    
    if [ $ANTIPATTERNS_FOUND -eq 0 ]; then
        print_success "No security anti-patterns found in staged Rust changes"
    else
        CHECKS_FAILED=1
    fi

    # Check 6: Verify input size limits are defined (only if src/ exists)
    if [ -d "src" ]; then
        print_status "Checking for input size limit constants..."
        if find src -type f -name "*.rs" -exec grep -l -E "MAX_[A-Z_]+(LEN|SIZE|LIMIT)" {} + 2>/dev/null | grep -q .; then
            print_success "Input size limits found in code"
        else
            print_warning "No input size limits found"
            echo "Consider defining constants like MAX_POST_LEN, MAX_USERNAME, etc."
        fi

        # Check 7: Principal validation check
        print_status "Checking for Principal validation patterns..."
        VALIDATED_FILES=$(find src -type f -name "*.rs" -exec grep -l "ic_cdk::caller()" {} + 2>/dev/null | \
                         xargs grep -l "Principal::anonymous()" 2>/dev/null || true)
        
        UNVALIDATED_FILES=$(find src -type f -name "*.rs" -exec grep -l "ic_cdk::caller()" {} + 2>/dev/null | \
                           grep -v -f <(echo "$VALIDATED_FILES") 2>/dev/null || true)
        
        if [ -n "$VALIDATED_FILES" ]; then
            print_success "Found proper Principal validation patterns"
        elif [ -n "$UNVALIDATED_FILES" ]; then
            print_warning "Found files using caller() without anonymous principal checks:"
            echo "$UNVALIDATED_FILES" | sed 's/^/  - /'
            echo "Ensure you validate against anonymous principals"
        else
            print_warning "No Principal validation found"
            echo "Ensure you're validating ic_cdk::caller() for authenticated operations"
        fi
    fi
else
    print_status "No Rust files staged - skipping Rust-specific checks"
fi

# Check Motoko Files (ONLY if Motoko files are staged)
if [ -n "$STAGED_MO_FILES" ]; then
    print_status "Checking Motoko files..."
    
    # Format check
    if command -v dfx > /dev/null 2>&1; then
        if dfx fmt check > /dev/null 2>&1; then
            print_success "Motoko formatting is correct"
        else
            print_error "Motoko formatting check failed"
            echo "Run 'dfx fmt' to fix formatting issues"
            CHECKS_FAILED=1
        fi
    else
        print_warning "dfx not found - skipping Motoko format check"
    fi
    
    # Check for Motoko anti-patterns
    for file in $STAGED_MO_FILES; do
        if [ -f "$file" ]; then
            # Check for debug/print usage
            if git diff --cached "$file" | grep -E '^\+.*Debug\.print' > /dev/null; then
                print_warning "Found Debug.print in $file"
                echo "Remove debug prints before deployment"
            fi
            
            # Check for trap usage without error handling
            if git diff --cached "$file" | grep -E '^\+.*trap\s+[^?]' > /dev/null; then
                print_error "Found unhandled trap in $file"
                echo "Add proper error handling for trap statements"
                CHECKS_FAILED=1
            fi
        fi
    done
else
    print_status "No Motoko files staged - skipping Motoko-specific checks"
fi

# Check TypeScript/React Files (ONLY if TS files are staged)
if [ -n "$STAGED_TS_FILES" ]; then
    print_status "Checking TypeScript/React files..."
    
    # Check if npm commands exist
    if command -v npm > /dev/null 2>&1 && [ -f "package.json" ]; then
        # Type check
        if npm run type-check --silent > /dev/null 2>&1; then
            print_success "TypeScript type check passed"
        else
            print_error "TypeScript type check failed"
            echo "Run 'npm run type-check' to see issues"
            CHECKS_FAILED=1
        fi
        
        # Format check
        if npm run format:check --silent > /dev/null 2>&1; then
            print_success "TypeScript formatting is correct"
        else
            print_warning "TypeScript formatting issues found"
            echo "Run 'npm run format' to fix formatting"
        fi
    else
        print_warning "npm or package.json not found - skipping TypeScript checks"
    fi
    
    # Check for frontend security patterns
    for file in $STAGED_TS_FILES; do
        if [ -f "$file" ]; then
            # Check for console.log
            if git diff --cached "$file" | grep -E '^\+.*console\.(log|debug)' > /dev/null; then
                print_warning "Found console.log in $file"
                echo "Remove console.logs before deployment"
            fi
            
            # Check for sensitive data in localStorage
            if git diff --cached "$file" | grep -E '^\+.*localStorage\.(set|get)Item.*token' > /dev/null; then
                print_warning "Found token storage in localStorage"
                echo "Consider using more secure storage methods"
            fi
            
            # Check for unsafe innerHTML usage
            if git diff --cached "$file" | grep -E '^\+.*innerHTML' > /dev/null; then
                print_error "Found unsafe innerHTML usage in $file"
                echo "Use safer alternatives to prevent XSS"
                CHECKS_FAILED=1
            fi
        fi
    done
else
    print_status "No TypeScript files staged - skipping TypeScript-specific checks"
fi

# Global Security Checks (always run)
print_status "Running global security checks..."

# Check for env files in staged changes
if echo "$STAGED_ALL_FILES" | grep -E '\.env($|\.)' > /dev/null; then
    print_error "Attempting to commit .env file"
    echo "Remove .env files from commit and add to .gitignore"
    CHECKS_FAILED=1
fi

# Check for large files
MAX_FILE_SIZE=$((1024 * 1024)) # 1MB
while IFS= read -r file; do
    if [ -f "$file" ] && [ -n "$file" ]; then
        size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || echo 0)
        if [ "$size" -gt "$MAX_FILE_SIZE" ]; then
            print_error "File $file is too large ($(($size/1024))KB)"
            echo "Consider using Git LFS for large files"
            CHECKS_FAILED=1
        fi
    fi
done <<< "$STAGED_ALL_FILES"

# NPM audit (if package.json exists and not cached)
if [ -f "package.json" ] && ! check_cache "npm-audit"; then
    print_status "Running npm audit..."
    if command -v npm > /dev/null 2>&1; then
        if npm audit --production --audit-level=high > /dev/null 2>&1; then
            touch "$CACHE_DIR/npm-audit"
            print_success "No high-severity npm vulnerabilities found"
        else
            print_error "High-severity npm vulnerabilities found"
            echo "Run 'npm audit' to see details"
            CHECKS_FAILED=1
        fi
    else
        print_warning "npm not found - skipping npm audit"
    fi
fi

# Summary
echo ""
echo "==============================="
echo "CERT Security Check Summary:"
echo "==============================="

if [ $CHECKS_FAILED -eq 0 ]; then
    print_success "All CERT security checks passed! 🎉"
    if [ -n "$WARNINGS" ]; then
        echo ""
        print_warning "Non-blocking warnings to review:"
        printf "%b" "$WARNINGS"
    fi
    print_status "Commit proceeding..."
    exit 0
else
    print_error "CERT security checks failed! ❌"
    print_error "Commit aborted. Fix the issues above and try again."
    echo ""
    echo "Quick fixes:"
    echo "  - Run 'npm run format' to fix TypeScript formatting"
    echo "  - Run 'npm run type-check' to check TypeScript errors"
    echo "  - Run 'cargo fmt' to fix Rust formatting (if applicable)"
    echo "  - Run 'cargo clippy' to see detailed Rust linting errors (if applicable)"
    echo "  - Run 'npm audit' to check for npm vulnerabilities"
    echo "  - Remove console.logs and debug statements"
    echo "  - Add proper error handling"
    echo ""
    exit 1
fi
