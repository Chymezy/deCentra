---
applyTo: "**/*.rs*"
---

# CERT Secure Coding Instructions for AI Development Assistant

**Version:** 2.0  
**Purpose:** Comprehensive security guidelines for AI agents developing Rust ICP canisters  
**Scope:** Backend development, smart contracts, web services

---

## **CRITICAL SECURITY REQUIREMENTS**

You MUST follow these security principles when writing, reviewing, or suggesting Rust code for Internet Computer Protocol (ICP) canisters and backend services.

---

## **ZERO-TOLERANCE ANTI-PATTERNS**

### **🚫 ABSOLUTE PROHIBITIONS - NEVER USE IN ANY CONTEXT**

```rust
// ❌ NEVER ALLOWED - These will cause immediate failure
.unwrap()           // FORBIDDEN - Use ? or explicit match
.expect("msg")      // FORBIDDEN - Use ? or explicit match  
panic!()            // FORBIDDEN - Return Result instead
unreachable!()      // FORBIDDEN - Use Result/Option instead
todo!()             // FORBIDDEN - Complete implementation
unimplemented!()    // FORBIDDEN - Complete implementation

// ❌ NEVER ALLOWED - Arithmetic that can overflow
a + b               // FORBIDDEN - Use a.saturating_add(b)
a - b               // FORBIDDEN - Use a.saturating_sub(b)
a * b               // FORBIDDEN - Use a.saturating_mul(b)
a / b               // FORBIDDEN - Check for zero first

// ❌ NEVER ALLOWED - Deprecated patterns
format!("{}", var)  // FORBIDDEN - Use format!("{var}")
clippy::integer_arithmetic  // FORBIDDEN - Use clippy::arithmetic_side_effects
```

### **✅ MANDATORY REPLACEMENTS**

```rust
// ✅ ALWAYS use these patterns instead
fn safe_function() -> Result<T, String> {
    let value = option_value.ok_or("Error message")?;
    let result = fallible_operation().map_err(|e| format!("Operation failed: {e}"))?;
    
    // Arithmetic with overflow protection
    let sum = a.saturating_add(b);
    let diff = a.saturating_sub(b);
    let product = a.saturating_mul(b);
    
    // Safe division with zero check
    if b == 0 {
        return Err("Division by zero".to_string());
    }
    let quotient = a / b;
    
    Ok(result)
}
```

---

## **1. INPUT VALIDATION - ALWAYS REQUIRED**

### **Rule: Never trust user input**

```rust
// ❌ NEVER do this
fn create_post(content: String) -> PostId {
    // Missing validation, no error handling
    let post = Post { content, .. };
    store_post(post)
}

// ✅ ALWAYS do this  
const MAX_POST_CONTENT: usize = 10_000;
const MAX_USERNAME: usize = 50;
const MIN_USERNAME: usize = 3;

fn create_post(content: String) -> Result<PostId, String> {
    // Validate size
    if content.len() > MAX_POST_CONTENT {
        return Err(format!("Content too long: {} > {}", content.len(), MAX_POST_CONTENT));
    }
    
    // Validate emptiness
    if content.trim().is_empty() {
        return Err("Content cannot be empty".to_string());
    }
    
    // Sanitize content
    let sanitized_content = sanitize_content(&content)?;
    
    // Create post safely
    let post = Post {
        content: sanitized_content,
        created_at: ic_cdk::api::time(),
        author: authenticate_user()?,
    };
    
    store_post(post)
}

fn sanitize_content(content: &str) -> Result<String, String> {
    // Remove control characters
    let cleaned: String = content
        .chars()
        .filter(|c| !c.is_control() || *c == '\n' || *c == '\t')
        .collect();
    
    // Additional sanitization
    if cleaned.len() != content.len() {
        return Err("Content contains invalid characters".to_string());
    }
    
    Ok(cleaned)
}
```

### **Required validations for all inputs:**
- Size limits (define constants like `MAX_POST_CONTENT`, `MAX_USERNAME`)
- Empty/whitespace-only rejection
- Character filtering for control characters
- Type validation using strong types instead of raw strings
- Range validation for numeric inputs
- Format validation for URLs, emails, etc.

---

## **2. ERROR HANDLING - NO PANICS ALLOWED**

### **Rule: Never use .unwrap(), .expect(), or panic! in production code**

```rust
// ❌ NEVER do this
fn get_user(user_id: &str) -> User {
    USERS.with(|users| {
        users.borrow().get(user_id).unwrap().clone()  // FORBIDDEN
    })
}

// ✅ ALWAYS do this
fn get_user(user_id: &UserId) -> Result<User, String> {
    USERS.with(|users| {
        users
            .borrow()
            .get(user_id)
            .cloned()
            .ok_or_else(|| format!("User not found: {}", user_id.0))
    })
}

// ✅ For complex error handling
fn complex_operation() -> Result<ComplexResult, String> {
    let step1 = perform_step1().map_err(|e| format!("Step 1 failed: {e}"))?;
    let step2 = perform_step2(&step1).map_err(|e| format!("Step 2 failed: {e}"))?;
    let step3 = perform_step3(&step2).map_err(|e| format!("Step 3 failed: {e}"))?;
    
    Ok(ComplexResult {
        step1_result: step1,
        step2_result: step2,
        step3_result: step3,
    })
}
```

### **Required error handling patterns:**
- Always return `Result<T, E>` for fallible operations
- Use `?` operator or explicit `match` for error propagation
- Return descriptive but safe error messages (no internal details)
- Log errors internally but don't expose sensitive information
- Never use `.unwrap()` even in tests - use `.expect()` with clear test context
- Handle all `Option` values explicitly with `ok_or` or pattern matching

---

## **3. AUTHENTICATION & AUTHORIZATION**

### **Rule: Always validate caller before state changes**

```rust
// ✅ Standard authentication pattern
fn update_profile(profile: UserProfile) -> Result<(), String> {
    let caller = authenticate_user()?;
    authorize_profile_update(&caller, &profile)?;
    
    with_state_mut(|state| {
        state.users.insert(caller, profile);
        Ok(())
    })
}

// ✅ Role-based access control
thread_local! {
    static USER_ROLES: RefCell<HashMap<UserId, UserRole>> = RefCell::new(HashMap::new());
}

fn admin_only_operation() -> Result<(), String> {
    let caller = authenticate_user()?;
    let role = get_user_role(&caller)?;
    
    match role {
        UserRole::Admin => {
            // Proceed with admin operation
            Ok(())
        }
        _ => Err("Admin access required".to_string())
    }
}

// ✅ Always check anonymous callers
fn authenticate_user() -> Result<UserId, String> {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        return Err("Authentication required".to_string());
    }
    Ok(UserId(caller))
}
```

---

## **4. RESOURCE PROTECTION (Cycle Management)**

### **Rule: Protect against resource exhaustion attacks**

```rust
const MAX_BATCH_SIZE: usize = 100;
const MAX_CYCLES_PER_CALL: u64 = 1_000_000_000; // 1B cycles
const MAX_MEMORY_USAGE: usize = 100_000_000; // 100MB

fn batch_operation(items: Vec<Item>) -> Result<(), String> {
    // Validate batch size
    if items.len() > MAX_BATCH_SIZE {
        return Err(format!("Batch too large: {} > {}", items.len(), MAX_BATCH_SIZE));
    }
    
    // Monitor cycle usage
    let start_cycles = ic_cdk::api::instruction_counter();
    
    let results: Result<Vec<_>, String> = items
        .into_iter()
        .map(|item| {
            // Check cycles for each item
            let current_cycles = ic_cdk::api::instruction_counter();
            let used_cycles = current_cycles.saturating_sub(start_cycles);
            
            if used_cycles > MAX_CYCLES_PER_CALL {
                return Err("Cycle limit exceeded".to_string());
            }
            
            process_item(item)
        })
        .collect();
    
    results.map(|_| ())
}

// ✅ Memory usage monitoring
fn check_memory_limits() -> Result<(), String> {
    let memory_usage = ic_cdk::api::stable::stable64_size()
        .saturating_mul(65536); // Convert pages to bytes
    
    if memory_usage > MAX_MEMORY_USAGE as u64 {
        return Err("Memory limit exceeded".to_string());
    }
    
    Ok(())
}
```

---

## **5. STRONG TYPING REQUIREMENTS**

### **Rule: Use newtype patterns for domain-specific IDs**

```rust
// ✅ Strong typing prevents ID confusion
#[derive(Debug, Clone, PartialEq, Eq, Hash, CandidType, Deserialize)]
pub struct UserId(pub Principal);

#[derive(Debug, Clone, PartialEq, Eq, Hash, CandidType, Deserialize)]
pub struct PostId(pub u64);

#[derive(Debug, Clone, PartialEq, Eq, Hash, CandidType, Deserialize)]
pub struct CommentId(pub u64);

impl UserId {
    pub fn new(principal: Principal) -> Result<Self, String> {
        if principal == Principal::anonymous() {
            return Err("Cannot create UserId from anonymous principal".to_string());
        }
        Ok(UserId(principal))
    }
    
    pub fn as_bytes(&self) -> &[u8] {
        self.0.as_slice()
    }
}

impl PostId {
    pub fn new(id: u64) -> Result<Self, String> {
        if id == 0 {
            return Err("PostId cannot be zero".to_string());
        }
        Ok(PostId(id))
    }
}

// ✅ Use enums for finite states
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize)]
pub enum PostStatus {
    Draft,
    Published,
    Archived,
    Moderated { reason: String },
    Deleted { timestamp: u64 },
}

// ❌ NEVER use raw strings for IDs
// fn get_user(user_id: String) -> User { ... }

// ✅ ALWAYS use strong types
fn get_user(user_id: UserId) -> Result<User, String> { /* ... */ }
```

---

## **6. SECURE STATE MANAGEMENT**

### **Rule: Use thread_local! with proper upgrade handling**

```rust
use std::collections::HashMap;
use std::cell::RefCell;
use ic_cdk::storage::{stable_save, stable_restore};
use candid::{CandidType, Deserialize};

#[derive(Default, CandidType, Deserialize, Clone)]
pub struct AppState {
    pub users: HashMap<UserId, UserProfile>,
    pub posts: HashMap<PostId, Post>,
    pub version: u32,
}

thread_local! {
    static STATE: RefCell<AppState> = RefCell::new(AppState::default());
}

// ✅ Proper upgrade handling
#[ic_cdk::pre_upgrade]
fn pre_upgrade() {
    STATE.with(|state| {
        stable_save((state.borrow().clone(),))
            .expect("Failed to save state in pre_upgrade");
    });
}

#[ic_cdk::post_upgrade]
fn post_upgrade() {
    let (stored_state,): (AppState,) = stable_restore()
        .expect("Failed to restore state in post_upgrade");
    
    let migrated_state = migrate_state_if_needed(stored_state);
    
    STATE.with(|state| {
        *state.borrow_mut() = migrated_state;
    });
}

fn migrate_state_if_needed(mut state: AppState) -> AppState {
    const CURRENT_VERSION: u32 = 2;
    
    match state.version {
        0 => {
            // Migration from version 0 to 1
            // Add any necessary migrations
            state.version = 1;
        }
        1 => {
            // Migration from version 1 to 2
            // Add any necessary migrations
            state.version = 2;
        }
        CURRENT_VERSION => {
            // Already at current version
        }
        _ => {
            // Unknown version - this should not happen
            ic_cdk::trap(&format!("Unknown state version: {}", state.version));
        }
    }
    
    state
}

// ✅ Safe state access with error handling
pub fn with_state<R>(f: impl FnOnce(&AppState) -> R) -> R {
    STATE.with(|state| f(&state.borrow()))
}

pub fn with_state_mut<R>(f: impl FnOnce(&mut AppState) -> Result<R, String>) -> Result<R, String> {
    check_memory_limits()?;
    
    STATE.with(|state| {
        let mut state_guard = state.borrow_mut();
        f(&mut state_guard)
    })
}
```

---

## **7. SECURE SERIALIZATION**

### **Rule: Explicit type definitions with validation**

```rust
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct UserProfile {
    #[serde(deserialize_with = "validate_username")]
    pub username: String,
    
    #[serde(deserialize_with = "validate_optional_string")]
    pub display_name: Option<String>,
    
    #[serde(deserialize_with = "validate_optional_bio")]
    pub bio: Option<String>,
    
    pub created_at: u64,
    pub privacy_settings: PrivacySettings,
}

fn validate_username<'de, D>(deserializer: D) -> Result<String, D::Error>
where
    D: serde::Deserializer<'de>,
{
    let username = String::deserialize(deserializer)?;
    
    if username.len() < MIN_USERNAME || username.len() > MAX_USERNAME {
        return Err(serde::de::Error::custom(
            format!("Username must be between {} and {} characters", MIN_USERNAME, MAX_USERNAME)
        ));
    }
    
    if !username.chars().all(|c| c.is_alphanumeric() || c == '_' || c == '-') {
        return Err(serde::de::Error::custom(
            "Username can only contain alphanumeric characters, underscores, and hyphens"
        ));
    }
    
    Ok(username)
}

fn validate_optional_string<'de, D>(deserializer: D) -> Result<Option<String>, D::Error>
where
    D: serde::Deserializer<'de>,
{
    let opt = Option::<String>::deserialize(deserializer)?;
    
    match opt {
        Some(s) if s.trim().is_empty() => Ok(None),
        Some(s) if s.len() > MAX_DISPLAY_NAME => {
            Err(serde::de::Error::custom(
                format!("Display name too long: {} > {}", s.len(), MAX_DISPLAY_NAME)
            ))
        }
        other => Ok(other),
    }
}

fn validate_optional_bio<'de, D>(deserializer: D) -> Result<Option<String>, D::Error>
where
    D: serde::Deserializer<'de>,
{
    let opt = Option::<String>::deserialize(deserializer)?;
    
    match opt {
        Some(s) if s.trim().is_empty() => Ok(None),
        Some(s) if s.len() > MAX_BIO => {
            Err(serde::de::Error::custom(
                format!("Bio too long: {} > {}", s.len(), MAX_BIO)
            ))
        }
        other => Ok(other),
    }
}
```

---

## **8. LOGGING & DEBUG SECURITY**

### **Rule: Never log sensitive information**

```rust
// ❌ NEVER do this - logs Principal
ic_cdk::println!("User {} created post", caller);

// ❌ NEVER do this - logs sensitive data
ic_cdk::println!("Processing payment: {:?}", payment_details);

// ✅ ALWAYS do this - safe logging
ic_cdk::println!("User created post successfully");
ic_cdk::println!("Processing payment request");

// ✅ For debugging, use sanitized logs
#[cfg(debug_assertions)]
fn debug_log_user_action(action: &str, user_id: &UserId) {
    let sanitized_id = format!("user_{}", user_id.0.to_text().len());
    ic_cdk::println!("DEBUG: {} for {}", action, sanitized_id);
}

// ✅ Structured logging with levels
pub enum LogLevel {
    Error,
    Warn,
    Info,
    Debug,
}

pub fn log_safe(level: LogLevel, message: &str, context: Option<&str>) {
    let timestamp = ic_cdk::api::time();
    let level_str = match level {
        LogLevel::Error => "ERROR",
        LogLevel::Warn => "WARN",
        LogLevel::Info => "INFO",
        LogLevel::Debug => "DEBUG",
    };
    
    match context {
        Some(ctx) => ic_cdk::println!("[{}] {}: {} (context: {})", timestamp, level_str, message, ctx),
        None => ic_cdk::println!("[{}] {}: {}", timestamp, level_str, message),
    }
}
```

---

## **9. MANDATORY PRE-SUBMISSION CHECKLIST**

Before submitting any Rust code, verify:

### **Security Checklist**
- [ ] No `.unwrap()`, `.expect()`, or `panic!` calls anywhere
- [ ] All arithmetic uses saturating operations
- [ ] All user inputs are validated with size limits
- [ ] All functions return `Result<T, String>` for fallible operations
- [ ] Authentication check in all update functions
- [ ] No sensitive data in logs or error messages

### **Code Quality Checklist**
- [ ] All clippy lints pass with current lint names
- [ ] All types are explicitly annotated where ambiguous
- [ ] Format strings use inlined arguments (`{var}` not `{}`)
- [ ] Strong typing with newtype patterns for IDs
- [ ] Proper error propagation with `?` operator

### **Documentation Checklist**
- [ ] All public functions have comprehensive doc comments
- [ ] All examples in documentation use safe patterns
- [ ] No commented-out code with unsafe patterns
- [ ] Error conditions are documented

### **Testing Checklist**
- [ ] Tests for error conditions and edge cases
- [ ] Tests for authentication and authorization
- [ ] Tests for input validation boundaries
- [ ] Performance tests for resource limits

---

## **10. ENFORCEMENT MECHANISMS**

### **Automated Checks Required**
```bash
# Run these before any commit
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings -D clippy::unwrap_used -D clippy::expect_used -D clippy::panic -D clippy::arithmetic_side_effects
cargo test
```

### **CI/CD Integration**
All code must pass these checks in CI before merging:
- Zero clippy warnings with security-focused lints
- 100% test coverage for error conditions
- Documentation completeness check
- Performance regression testing

This enhanced instruction set creates a zero-tolerance environment for the error patterns we identified, ensuring robust, secure, and maintainable code.
