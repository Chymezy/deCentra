#!/bin/bash

# =============================================================================
# UNIFIED CERT SECURITY PRE-COMMIT HOOK FOR DECENTRA ICP PROJECT
# =============================================================================
# 
# This script combines:
# 1. Original comprehensive CERT security checks
# 2. Enhanced targeted error pattern detection
# 3. Project-specific validation for ICP/IC canisters
#
# Features:
# - Zero-tolerance for critical security anti-patterns (.unwrap, panic!, etc.)
# - Enhanced arithmetic safety validation
# - Comprehensive authentication checks for update functions  
# - Multi-language support (Rust, Motoko, TypeScript)
# - Caching for expensive operations
# - Detailed error reporting with fix suggestions
#
# Version: 2.0 (Unified)
# Last updated: Based on comprehensive debugging analysis
# =============================================================================

# Unified CERT Security Pre-Commit Hook for deCentra ICP Project
# Combines comprehensive security checks with targeted error prevention
# This script enforces CERT security standards and prevents common coding errors

set -e

echo "🔒 Running Unified CERT Security & Quality Checks..."
echo "=================================================="

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

# Enhanced reporting functions for critical errors
report_critical_issue() {
    CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
    echo -e "${RED}❌ CRITICAL: $1${NC}"
}

# Track if any check failed
CHECKS_FAILED=0
CRITICAL_ISSUES=0
WARNINGS=""

# Cache directory for expensive checks
CACHE_DIR=".git/cert-check-cache"

# Secure cache directory creation
create_secure_cache() {
    if [ ! -d "$CACHE_DIR" ]; then
        if ! mkdir -p "$CACHE_DIR"; then
            print_error "Failed to create cache directory"
            return 1
        fi
        # Set restrictive permissions
        chmod 700 "$CACHE_DIR"
    fi
    
    # Verify permissions
    local perms
    perms=$(stat -c %a "$CACHE_DIR" 2>/dev/null || stat -f %A "$CACHE_DIR" 2>/dev/null)
    if [ "$perms" != "700" ]; then
        print_warning "Cache directory has insecure permissions: $perms"
        chmod 700 "$CACHE_DIR"
    fi
}

create_secure_cache

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

# Better error handling with explicit checks
get_staged_files() {
    local pattern="$1"
    local files
    
    if ! files=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null); then
        print_error "Failed to get staged files from git"
        return 1
    fi
    
    # Exclude .md files
    echo "$files" | grep -E "$pattern" | grep -v '\.md$' || true
}

STAGED_RS_FILES=$(get_staged_files '\.rs$') || exit 1
STAGED_MO_FILES=$(get_staged_files '\.mo$') || exit 1
STAGED_TS_FILES=$(get_staged_files '\.(ts|tsx)$') || exit 1
STAGED_ALL_FILES=$(git diff --cached --name-only --diff-filter=ACM || true)

print_status "Staged files analysis:"
echo "  - Rust files: $(echo "$STAGED_RS_FILES" | wc -w)"
echo "  - Motoko files: $(echo "$STAGED_MO_FILES" | wc -w)" 
echo "  - TypeScript files: $(echo "$STAGED_TS_FILES" | wc -w)"
echo "  - Total files: $(echo "$STAGED_ALL_FILES" | wc -w)"

# ==============================================================================
# ENHANCED CRITICAL SECURITY PATTERN CHECKS (from enhanced-pre-commit.sh)
# ==============================================================================
print_status "Running enhanced critical security pattern checks..."

# Function to check for forbidden patterns with better precision
check_forbidden_patterns() {
    local file_pattern="$1"
    shift
    local patterns=("$@")
    
    local files_found=false
    for pattern in "${patterns[@]}"; do
        # Check staged files only, exclude comments and strings
        if echo "$STAGED_ALL_FILES" | grep -E "$file_pattern" | while read -r file; do
            if [ -f "$file" ]; then
                # Check git diff for new additions of this pattern
                if git diff --cached "$file" | grep -E "^\+.*$pattern" | grep -v "^\s*//" | grep -v "^\s*\*" | grep -v "//.*$pattern" > /dev/null; then
                    echo "$file: $pattern"
                    files_found=true
                fi
            fi
        done | head -10; then
            report_critical_issue "Found forbidden pattern '$pattern' in staged changes"
            case "$pattern" in
                "\.unwrap\(\)")
                    echo "   🔧 Replace with: .ok_or(\"error message\")?  or  .map_err(|e| format!(\"error: {}\", e))?"
                    ;;
                "\.expect\(")
                    echo "   🔧 Replace with: .ok_or(\"error message\")?  or  .map_err(|e| format!(\"error: {}\", e))?"
                    ;;
                "panic!\(")
                    echo "   🔧 Replace with: return Err(\"error message\".to_string())"
                    ;;
                "unreachable!\(")
                    echo "   🔧 Replace with proper error handling and return Err(...)"
                    ;;
                "todo!\("|"unimplemented!\(")
                    echo "   🔧 Implement the functionality or return an appropriate error"
                    ;;
            esac
            echo ""
            CHECKS_FAILED=1
        fi
    done
}

# Critical Rust patterns are checked in the dedicated Rust section below
# This prevents checking .md and other documentation files for forbidden patterns

if [ -n "$STAGED_RS_FILES" ]; then
    
    # Check for unsafe arithmetic operations
    print_status "Checking for unsafe arithmetic operations..."
    if echo "$STAGED_RS_FILES" | while read -r file; do
        if [ -f "$file" ]; then
            # Look for additions of arithmetic operations without safety checks
            if git diff --cached "$file" | grep -E "^\+.*[^.]\s*[\+\-*]\s*[^.]" | grep -v "saturating_" | grep -v "checked_" | grep -v "wrapping_" | grep -v "^\s*//" > /dev/null; then
                echo "$file: unsafe arithmetic"
            fi
            # Look for array indexing without bounds checking (exclude attributes)
            if git diff --cached "$file" | grep -E "^\+.*\[.*\]" | grep -v "\.get(" | grep -v "^\s*//" | grep -v "#\[" > /dev/null; then
                echo "$file: unsafe indexing"
            fi
        fi
    done | head -5; then
        report_critical_issue "Found unsafe arithmetic or indexing operations"
        echo "   🔧 Use: .saturating_add(), .saturating_sub(), .saturating_mul()"
        echo "   🔧 For arrays: .get(index).ok_or(\"index out of bounds\")?"
        echo ""
        CHECKS_FAILED=1
    fi
    
    # Check for ambiguous numeric types
    print_status "Checking for ambiguous numeric types..."
    if echo "$STAGED_RS_FILES" | while read -r file; do
        if [ -f "$file" ]; then
            if git diff --cached "$file" | grep -E "^\+.*let.*=\s*[0-9]" | grep -v ": [ui][0-9]" | grep -v "^\s*//" > /dev/null; then
                echo "$file: ambiguous numeric type"
            fi
        fi
    done | head -5; then
        report_critical_issue "Found ambiguous numeric types"
        echo "   🔧 Add explicit type: let count: u32 = 0;"
        echo ""
        CHECKS_FAILED=1
    fi
    
    # Check authentication in update functions
    print_status "Checking authentication in update functions..."
    if echo "$STAGED_RS_FILES" | while read -r file; do
        if [ -f "$file" ]; then
            git diff --cached "$file" | grep -A 10 -B 2 "^\+.*#\[ic_cdk::update\]" | while read -r line; do
                if echo "$line" | grep -q "#\[ic_cdk::update\]"; then
                    # Get the next 10 lines to check for authentication
                    if ! echo "$line" | grep -A 10 -E "authenticate_user|caller\(\)" > /dev/null; then
                        echo "$file: missing authentication in update function"
                    fi
                fi
            done
        fi
    done | head -3; then
        report_critical_issue "Update functions may be missing authentication checks"
        echo "   🔧 Add: let caller = authenticate_user()?;"
        echo "   🔧 Or verify: if caller == Principal::anonymous() { return Err(...) }"
        echo ""
        CHECKS_FAILED=1
    fi
fi

print_success "Enhanced critical security pattern checks completed"

# ==============================================================================

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

    # Check 2: Enhanced Clippy Linting (with comprehensive security-focused rules)
    print_status "Running enhanced security-focused linting with Clippy..."
    if cargo clippy --all-targets --all-features -- \
        -D warnings \
        -D clippy::unwrap_used \
        -D clippy::expect_used \
        -D clippy::panic \
        -D clippy::unreachable \
        -D clippy::todo \
        -D clippy::unimplemented \
        -D clippy::arithmetic_side_effects \
        -D clippy::indexing_slicing \
        -W clippy::cast_possible_truncation \
        -W clippy::cast_possible_wrap \
        -W clippy::cast_precision_loss \
        -W clippy::string_slice \
        > /dev/null 2>&1; then
        print_success "Enhanced Clippy security checks passed"
    else
        print_error "Enhanced Clippy security checks failed"
        echo "Fix the warnings above before committing"
        echo "Focus on: .unwrap(), .expect(), panic!, arithmetic operations, and array indexing"
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
    
    # Check for .unwrap() usage in .rs files only
    if echo "$STAGED_RS_FILES" | while read -r file; do
        if [ -f "$file" ]; then
            if git diff --cached "$file" | grep -E '^\+.*\.unwrap\(\)([^_a-zA-Z]|$)' > /dev/null; then
                echo "$file"
            fi
        fi
    done | head -1 | grep -q .; then
        print_error "Found .unwrap() in staged Rust changes"
        echo "Replace .unwrap() with proper error handling"
        ANTIPATTERNS_FOUND=1
    fi
    
    # Check for .expect() usage in .rs files only
    if echo "$STAGED_RS_FILES" | while read -r file; do
        if [ -f "$file" ]; then
            if git diff --cached "$file" | grep -E '^\+.*\.expect\(' > /dev/null; then
                echo "$file"
            fi
        fi
    done | head -1 | grep -q .; then
        print_error "Found .expect() in staged Rust changes"
        echo "Replace .expect() with proper error handling"
        ANTIPATTERNS_FOUND=1
    fi
    
    # Check for panic! usage in .rs files only
    if echo "$STAGED_RS_FILES" | while read -r file; do
        if [ -f "$file" ]; then
            if git diff --cached "$file" | grep -E '^\+.*panic!' > /dev/null; then
                echo "$file"
            fi
        fi
    done | head -1 | grep -q .; then
        print_error "Found panic! in staged Rust changes"
        echo "Replace panic! with proper error handling"
        ANTIPATTERNS_FOUND=1
    fi
    
    # Check for TODO/FIXME in security-related contexts in .rs files only
    if echo "$STAGED_RS_FILES" | while read -r file; do
        if [ -f "$file" ]; then
            if git diff --cached "$file" | grep -E '^\+.*(TODO|FIXME).*(auth|security|password|token|principal)' -i > /dev/null; then
                echo "$file"
            fi
        fi
    done | head -1 | grep -q .; then
        print_warning "Found security-related TODO/FIXME in staged Rust changes"
        echo "Ensure security-related TODOs are resolved before release"
    fi
    
    # Check for hardcoded secrets patterns in .rs files only
    if echo "$STAGED_RS_FILES" | while read -r file; do
        if [ -f "$file" ]; then
            if git diff --cached "$file" | grep -E '^\+.*((password|secret|api_key|token)s?)\s*=\s*[\x27\x22][^\x27\x22]{8,}[\x27\x22]' -i > /dev/null; then
                echo "$file"
            fi
        fi
    done | head -1 | grep -q .; then
        print_error "Possible hardcoded secret detected in staged Rust changes"
        echo "Remove hardcoded secrets and use environment variables"
        ANTIPATTERNS_FOUND=1
    fi
    
    # Check for unsafe blocks in .rs files only
    if echo "$STAGED_RS_FILES" | while read -r file; do
        if [ -f "$file" ]; then
            if git diff --cached "$file" | grep -E '^\+.*unsafe\s*\{' > /dev/null; then
                echo "$file"
            fi
        fi
    done | head -1 | grep -q .; then
        print_warning "Found unsafe block in staged Rust changes"
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
    # Add path validation to prevent directory traversal
    validate_file_path() {
        local file="$1"
        # Check for directory traversal attempts
        if echo "$file" | grep -E '\.\./|/\.\.' > /dev/null; then
            return 1
        fi
        # Ensure file is within project directory
        if ! realpath "$file" | grep -q "^$(pwd)"; then
            return 1
        fi
        return 0
    }

    if [ -f "$file" ] && [ -n "$file" ] && validate_file_path "$file"; then
        # Safe to process file
        size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || echo 0)
        if [ "$size" -gt "$MAX_FILE_SIZE" ]; then
            print_error "File $file is too large ($(($size/1024))KB)"
            echo "Consider using Git LFS for large files"
            CHECKS_FAILED=1
        fi
    fi
done <<< "$STAGED_ALL_FILES"

# NPM audit (if package.json exists and not cached)
MAX_AUDIT_SIZE=$((1024 * 1024))  # 1MB limit
AUDIT_TIMEOUT=30  # 30 seconds

run_npm_audit() {
    local output_file
    output_file=$(mktemp)
    
    if timeout $AUDIT_TIMEOUT npm audit --production --audit-level=high > "$output_file" 2>&1; then
        local size
        size=$(stat -c%s "$output_file" 2>/dev/null || stat -f%z "$output_file" 2>/dev/null)
        
        if [ "$size" -gt "$MAX_AUDIT_SIZE" ]; then
            print_error "npm audit output too large ($size bytes)"
            rm -f "$output_file"
            return 1
        fi
        
        cat "$output_file"
        rm -f "$output_file"
        return 0
    else
        rm -f "$output_file"
        return 1
    fi
}

if [ -f "package.json" ] && ! check_cache "npm-audit"; then
    print_status "Running npm audit..."
    if command -v npm > /dev/null 2>&1; then
        # Run npm audit and capture both exit code and output
        AUDIT_OUTPUT=$(run_npm_audit 2>&1)
        AUDIT_EXIT_CODE=$?
        
        if [ $AUDIT_EXIT_CODE -eq 0 ]; then
            touch "$CACHE_DIR/npm-audit"
            print_success "No high-severity npm vulnerabilities found"
        elif echo "$AUDIT_OUTPUT" | grep -q "audit endpoint returned an error\|request.*failed"; then
            # Network/registry issue - don't block commit
            print_warning "npm audit failed due to network/registry issues"
            echo "Skipping npm audit check (network unavailable)"
            echo "Run 'npm audit' manually when network is available"
        elif echo "$AUDIT_OUTPUT" | grep -q "audit found.*vulnerabilities"; then
            # Actual security vulnerabilities found
            print_error "High-severity npm vulnerabilities found"
            echo "Run 'npm audit' to see details and 'npm audit fix' to resolve"
            CHECKS_FAILED=1
        else
            # Other npm audit failure
            print_warning "npm audit failed with unexpected error"
            echo "Run 'npm audit' manually to investigate"
            echo "Output: $AUDIT_OUTPUT"
        fi
    else
        print_warning "npm not found - skipping npm audit"
    fi
else
    if [ -f "package.json" ]; then
        print_success "No npm vulnerabilities found (cached)"
    fi
fi

# Summary
echo ""
echo "======================================================="
echo "UNIFIED CERT SECURITY & QUALITY CHECK SUMMARY:"
echo "======================================================="

if [ $CHECKS_FAILED -eq 0 ] && [ $CRITICAL_ISSUES -eq 0 ]; then
    print_success "All CERT security and quality checks passed! 🎉"
    if [ -n "$WARNINGS" ]; then
        echo ""
        print_warning "Non-blocking warnings to review:"
        printf "%b" "$WARNINGS"
    fi
    print_status "Commit proceeding..."
    exit 0
else
    if [ $CRITICAL_ISSUES -gt 0 ]; then
        echo -e "${RED}🚨 CRITICAL SECURITY ISSUES FOUND: $CRITICAL_ISSUES${NC}"
        echo ""
    fi
    
    print_error "CERT security and quality checks failed! ❌"
    print_error "Commit aborted. Fix the issues above and try again."
    echo ""
    echo "🔧 PRIORITY FIXES (Critical Issues):"
    echo "  1. Replace ALL .unwrap()/.expect() with proper error handling"
    echo "  2. Use saturating arithmetic: .saturating_add(), .saturating_sub(), .saturating_mul()"
    echo "  3. Replace panic!/unreachable!/todo! with proper error returns"
    echo "  4. Add authentication checks to all update functions"
    echo "  5. Use safe array access: .get(index).ok_or(\"error\")?"
    echo ""
    echo "🛠️  STANDARD FIXES:"
    echo "  - Run 'cargo fmt' to fix Rust formatting"
    echo "  - Run 'cargo clippy --fix --allow-dirty' for auto-fixable issues"
    echo "  - Run 'npm run format' to fix TypeScript formatting"
    echo "  - Run 'npm run type-check' to check TypeScript errors"
    echo "  - Remove console.logs and debug statements"
    echo ""
    echo "📚 DOCUMENTATION & GUIDANCE:"
    echo "  - .github/instructions/code-quality.instructions.md"
    echo "  - .github/instructions/error-handling.instructions.md"
    echo "  - .github/instructions/rust.instructions.md"
    echo ""
    exit 1
fi