---
applyTo: "**/*.rs*"
---

# CERT Secure Coding Instructions for AI Development Assistant

**Version:** 1.0  
**Purpose:** Comprehensive security guidelines for AI agents developing Rust ICP canisters  
**Scope:** Backend development, smart contracts, web services

---

## **CRITICAL SECURITY REQUIREMENTS**

You MUST follow these security principles when writing, reviewing, or suggesting Rust code for Internet Computer Protocol (ICP) canisters and backend services.

---

## **1. INPUT VALIDATION - ALWAYS REQUIRED**

### **Rule: Never trust user input**

```rust
// ❌ NEVER do this
fn create_post(content: String) -> PostId {
    // Direct use without validation
    store_post(content)
}

// ✅ ALWAYS do this  
const MAX_POST_CONTENT: usize = 10_000;
const MAX_USERNAME: usize = 50;
const MIN_USERNAME: usize = 3;

fn create_post(content: String) -> Result<PostId, String> {
    // Size validation
    if content.len() > MAX_POST_CONTENT {
        return Err("Post content exceeds 10,000 characters".into());
    }
    
    if content.trim().is_empty() {
        return Err("Post content cannot be empty".into());
    }
    
    // Sanitization
    let sanitized_content = sanitize_content(&content);
    
    Ok(store_post(sanitized_content)?)
}

fn sanitize_content(content: &str) -> String {
    content
        .trim()
        .chars()
        .filter(|c| !c.is_control() || *c == '\n' || *c == '\t')
        .take(MAX_POST_CONTENT)
        .collect()
}
```

### **Required validations for all inputs:**
- Size limits (define constants like `MAX_POST_CONTENT`, `MAX_USERNAME`)
- Empty/whitespace-only rejection
- Character filtering for control characters
- Type validation using strong types instead of raw strings

---

## **2. ERROR HANDLING - NO PANICS ALLOWED**

### **Rule: Never use .unwrap(), .expect(), or panic! in production code**

```rust
// ❌ NEVER do this
fn get_user(user_id: &str) -> User {
    USERS.with(|users| {
        users.borrow().get(user_id).unwrap() // FORBIDDEN
    })
}

// ✅ ALWAYS do this
fn get_user(user_id: &UserId) -> Result<User, String> {
    USERS.with(|users| {
        users.borrow()
            .get(user_id)
            .cloned()
            .ok_or("User not found".into())
    })
}
```

### **Required error handling patterns:**
- Always return `Result<T, E>` for fallible operations
- Use `?` operator or explicit `match` for error propagation
- Return descriptive but safe error messages (no internal details)
- Log errors internally but don't expose sensitive information

---

## **3. AUTHENTICATION & AUTHORIZATION**

### **Rule: Always validate caller before state changes**

```rust
// ✅ Standard authentication pattern
fn update_profile(profile: UserProfile) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    // Always check for anonymous
    if caller == Principal::anonymous() {
        return Err("Authentication required".into());
    }
    
    // Check ownership
    if profile.owner != caller {
        return Err("Unauthorized: can only update own profile".into());
    }
    
    // Validate input
    validate_profile(&profile)?;
    
    // Proceed with update
    update_user_profile_internal(profile)
}

// ✅ Role-based access control
thread_local! {
    static ADMIN_PRINCIPALS: RefCell<HashSet<Principal>> = RefCell::new(HashSet::new());
}

fn admin_only_operation() -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    let is_admin = ADMIN_PRINCIPALS.with(|admins| {
        admins.borrow().contains(&caller)
    });
    
    if !is_admin {
        return Err("Admin access required".into());
    }
    
    // Proceed with admin operation
    Ok(())
}
```

---

## **4. RESOURCE PROTECTION (Cycle Management)**

### **Rule: Protect against resource exhaustion attacks**

```rust
const MAX_BATCH_SIZE: usize = 100;
const MAX_CYCLES_PER_CALL: u64 = 1_000_000_000; // 1B cycles

fn batch_operation(items: Vec<Item>) -> Result<(), String> {
    // Limit batch size
    if items.len() > MAX_BATCH_SIZE {
        return Err(format!("Batch size limited to {} items", MAX_BATCH_SIZE));
    }
    
    // Monitor cycle usage
    let initial_cycles = ic_cdk::api::instruction_counter();
    
    for (i, item) in items.iter().enumerate() {
        process_item(item)?;
        
        // Check cycles periodically
        if i % 10 == 0 {
            let current_cycles = ic_cdk::api::instruction_counter();
            if current_cycles - initial_cycles > MAX_CYCLES_PER_CALL {
                return Err("Operation too expensive, aborting".into());
            }
        }
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
            return Err("Anonymous principal not allowed".into());
        }
        Ok(UserId(principal))
    }
}

// ✅ Use enums for finite states
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize)]
pub enum PostStatus {
    Draft,
    Published,
    Archived,
    Flagged,
}

// ❌ NEVER use raw strings for IDs
// fn get_user(user_id: String) -> User { ... }

// ✅ ALWAYS use strong types
fn get_user(user_id: UserId) -> Result<User, String> { ... }
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
    pub next_post_id: u64,
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
            .expect("Failed to save state before upgrade");
    });
}

#[ic_cdk::post_upgrade]
fn post_upgrade() {
    let (stored_state,): (AppState,) = stable_restore()
        .expect("Failed to restore state after upgrade");
    
    // Handle version migrations
    let migrated_state = migrate_state_if_needed(stored_state);
    
    STATE.with(|state| {
        *state.borrow_mut() = migrated_state;
    });
}

fn migrate_state_if_needed(mut state: AppState) -> AppState {
    const CURRENT_VERSION: u32 = 1;
    
    if state.version < CURRENT_VERSION {
        // Perform migration logic
        state.version = CURRENT_VERSION;
    }
    
    state
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
    
    #[serde(deserialize_with = "validate_bio")]
    pub bio: String,
    
    pub created_at: u64,
    
    #[serde(skip_serializing_if = "Option::is_none")]
    pub avatar_url: Option<String>,
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
    
    if username.trim() != username {
        return Err(serde::de::Error::custom("Username cannot have leading/trailing whitespace"));
    }
    
    Ok(username)
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
    let sanitized_id = format!("user_{}", 
        user_id.0.to_text().chars().take(8).collect::<String>()
    );
    ic_cdk::println!("DEBUG: {} performed by {}", action, sanitized_id);
}
```

---

## **9. CONCURRENCY & ATOMICITY**

### **Rule: Ensure atomic operations for state changes**

```rust
// ✅ Atomic transfer operation
fn transfer_tokens(from: UserId, to: UserId, amount: u64) -> Result<(), String> {
    STATE.with(|state| {
        let mut state = state.borrow_mut();
        
        // Check balance first
        let from_balance = state.balances.get(&from).copied().unwrap_or(0);
        if from_balance < amount {
            return Err("Insufficient balance".into());
        }
        
        // Perform atomic update - both operations or neither
        state.balances.entry(from).and_modify(|b| *b -= amount);
        state.balances.entry(to).and_modify(|b| *b += amount).or_insert(amount);
        
        // Log the transaction
        let tx_id = state.next_tx_id;
        state.next_tx_id += 1;
        
        state.transactions.insert(tx_id, Transaction {
            id: tx_id,
            from,
            to,
            amount,
            timestamp: ic_cdk::api::time(),
        });
        
        Ok(())
    })
}

// ✅ Safe async operations with proper state handling
async fn process_user_action(user_id: UserId, action: UserAction) -> Result<(), String> {
    // Validate user exists and is authorized before any async operations
    let user_exists = STATE.with(|state| {
        state.borrow().users.contains_key(&user_id)
    });
    
    if !user_exists {
        return Err("User not found".into());
    }
    
    // Perform async operations (external calls, etc.)
    let result = match action {
        UserAction::SendNotification(message) => {
            send_notification_async(message).await
        }
        UserAction::UpdateExternalProfile(data) => {
            update_external_service_async(data).await
        }
    };
    
    // Update state only after successful async operations
    match result {
        Ok(response) => {
            STATE.with(|state| {
                let mut state = state.borrow_mut();
                // Update state atomically based on successful async result
                state.last_action_results.insert(user_id, response);
            });
            Ok(())
        }
        Err(e) => Err(format!("External operation failed: {}", e))
    }
}
```

## **10. TESTING REQUIREMENTS**

### **Rule: Security tests are mandatory**

```rust
#[cfg(test)]
mod security_tests {
    use super::*;
    
    #[test]
    fn security_test_input_size_limits() {
        // Test maximum size rejection
        let large_content = "x".repeat(MAX_POST_CONTENT + 1);
        let result = create_post(large_content);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("exceeds"));
    }
    
    #[test]
    fn security_test_empty_input_rejection() {
        let empty_content = "   ".to_string();
        let result = create_post(empty_content);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("cannot be empty"));
    }
    
    #[test]
    fn security_test_authentication_required() {
        // Mock anonymous caller
        let result = update_profile(UserProfile::default());
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Authentication required"));
    }
    
    #[test]
    fn security_test_authorization_checks() {
        let other_user_profile = UserProfile {
            owner: Principal::from_text("rdmx6-jaaaa-aaaah-qcaiq-cai").unwrap(),
            // ... other fields
        };
        
        // Should fail when trying to update another user's profile
        let result = update_profile(other_user_profile);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Unauthorized"));
    }
    
    #[test]
    fn security_test_resource_limits() {
        // Test batch size limits
        let large_batch: Vec<_> = (0..MAX_BATCH_SIZE + 1)
            .map(|i| Item { id: i })
            .collect();
        
        let result = batch_operation(large_batch);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Batch size limited"));
    }
    
    #[test]
    fn security_test_no_injection_vectors() {
        // Test that user input doesn't affect system behavior
        let malicious_content = "<script>alert('xss')</script>";
        let sanitized = sanitize_content(malicious_content);
        assert!(!sanitized.contains("<script>"));
    }
}
```

---

## **11. CODE STRUCTURE REQUIREMENTS**

### **Rule: Organize security-critical code properly**

```rust
// ✅ Separate modules for different concerns
pub mod auth {
    use ic_cdk::api::caller;
    use candid::Principal;
    
    pub fn require_authentication() -> Result<Principal, String> {
        let caller = caller();
        if caller == Principal::anonymous() {
            return Err("Authentication required".into());
        }
        Ok(caller)
    }
    
    pub fn require_owner(resource_owner: Principal) -> Result<(), String> {
        let caller = require_authentication()?;
        if caller != resource_owner {
            return Err("Access denied: not resource owner".into());
        }
        Ok(())
    }
}

pub mod validation {
    pub fn validate_post_content(content: &str) -> Result<(), String> {
        if content.trim().is_empty() {
            return Err("Content cannot be empty".into());
        }
        
        if content.len() > MAX_POST_CONTENT {
            return Err("Content too long".into());
        }
        
        Ok(())
    }
}

pub mod types {
    use candid::{CandidType, Deserialize, Principal};
    
    #[derive(Debug, Clone, PartialEq, Eq, Hash, CandidType, Deserialize)]
    pub struct UserId(pub Principal);
    
    impl UserId {
        pub fn from_caller() -> Result<Self, String> {
            let caller = ic_cdk::api::caller();
            if caller == Principal::anonymous() {
                return Err("Anonymous caller not allowed".into());
            }
            Ok(UserId(caller))
        }
    }
}
```

---

## **12. API DESIGN PATTERNS**

### **Rule: Secure API patterns for all endpoints**

```rust
// ✅ Standard secure endpoint pattern
#[ic_cdk::update]
pub async fn create_post(content: String) -> Result<PostId, String> {
    // 1. Authentication
    let caller = auth::require_authentication()?;
    let user_id = UserId(caller);
    
    // 2. Input validation
    validation::validate_post_content(&content)?;
    
    // 3. Authorization (user-specific checks)
    require_user_can_post(&user_id)?;
    
    // 4. Business logic
    let sanitized_content = sanitize_content(&content);
    let post_id = create_post_internal(user_id, sanitized_content)?;
    
    // 5. Success response
    Ok(post_id)
}

// ✅ Query endpoints remain read-only
#[ic_cdk::query]
pub fn get_post(post_id: PostId) -> Result<Post, String> {
    STATE.with(|state| {
        state.borrow()
            .posts
            .get(&post_id)
            .cloned()
            .ok_or("Post not found".into())
    })
}

// ✅ Admin endpoints with proper role checks
#[ic_cdk::update]
pub fn admin_delete_post(post_id: PostId) -> Result<(), String> {
    let caller = auth::require_authentication()?;
    
    // Admin-only operation
    if !is_admin(&caller) {
        return Err("Admin access required".into());
    }
    
    delete_post_internal(post_id)
}
```

---

## **13. DEPLOYMENT & UPGRADE SECURITY**

### **Rule: Secure deployment practices**

```rust
// ✅ Version-aware state management
#[derive(CandidType, Deserialize, Clone)]
pub struct AppState {
    pub version: StateVersion,
    // ... other fields
}

#[derive(CandidType, Deserialize, Clone, PartialEq)]
pub enum StateVersion {
    V1,
    V2, 
    // Add new versions here
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            version: StateVersion::V2, // Always latest
            // ... other defaults
        }
    }
}

// ✅ Safe upgrade migration
fn migrate_from_v1_to_v2(mut state: AppState) -> AppState {
    match state.version {
        StateVersion::V1 => {
            // Perform V1 -> V2 migration
            // Add new fields, transform existing data
            state.version = StateVersion::V2;
            state
        }
        StateVersion::V2 => state, // Already current
    }
}

// ✅ Deployment checklist validation
#[ic_cdk::init]
fn init() {
    // Initialize with secure defaults
    STATE.with(|state| {
        let mut state = state.borrow_mut();
        
        // Set up admin principals (from environment or init args)
        setup_initial_admins();
        
        // Initialize with secure configuration
        *state = AppState::default();
    });
}
```

---

## **14. MONITORING & OBSERVABILITY**

### **Rule: Security monitoring without data exposure**

```rust
// ✅ Safe metrics collection
pub struct SecurityMetrics {
    pub failed_auth_attempts: u64,
    pub oversized_requests: u64,
    pub admin_actions: u64,
    pub last_security_check: u64,
}

impl SecurityMetrics {
    pub fn record_failed_auth(&mut self) {
        self.failed_auth_attempts += 1;
    }
    
    pub fn record_oversized_request(&mut self) {
        self.oversized_requests += 1;
    }
}

// ✅ Admin-only security status endpoint
#[ic_cdk::query]
pub fn get_security_metrics() -> Result<SecurityMetrics, String> {
    let caller = ic_cdk::api::caller();
    if !is_admin(&caller) {
        return Err("Admin access required".into());
    }
    
    STATE.with(|state| {
        Ok(state.borrow().security_metrics.clone())
    })
}
```

---

## **15. EMERGENCY RESPONSE PROCEDURES**

### **Rule: Built-in security controls**

```rust
// ✅ Emergency stop functionality
thread_local! {
    static EMERGENCY_STOP: RefCell<bool> = RefCell::new(false);
}

fn check_emergency_stop() -> Result<(), String> {
    EMERGENCY_STOP.with(|stop| {
        if *stop.borrow() {
            Err("System temporarily unavailable".into())
        } else {
            Ok(())
        }
    })
}

#[ic_cdk::update]
pub fn emergency_stop() -> Result<(), String> {
    let caller = ic_cdk::api::caller();
    if !is_admin(&caller) {
        return Err("Admin access required".into());
    }
    
    EMERGENCY_STOP.with(|stop| {
        *stop.borrow_mut() = true;
    });
    
    Ok(())
}

// Add emergency check to all critical endpoints
#[ic_cdk::update]
pub fn create_post(content: String) -> Result<PostId, String> {
    check_emergency_stop()?;
    // ... rest of function
}
```

---

## **AI AGENT SPECIFIC INSTRUCTIONS**

### **When writing code, ALWAYS:**

1. **Start with security validation** - authentication, authorization, input validation
2. **Use Result<T, E> for all fallible operations** - never .unwrap() or panic!
3. **Define size limits as constants** - MAX_CONTENT_LEN, MAX_USERNAME, etc.
4. **Create strong types** - UserId(Principal), PostId(u64), not raw strings
5. **Include security tests** - for each function, test edge cases and malicious input
6. **Add resource limits** - prevent unbounded loops, large allocations
7. **Sanitize all text input** - remove control characters, limit length
8. **Use thread_local! for state** - with proper upgrade handling

### **When reviewing code, CHECK:**

1. **No .unwrap(), .expect(), or panic!** in production paths
2. **All user input validated** before use
3. **Authentication checked** before state modifications  
4. **Size limits enforced** on user-provided data
5. **Strong typing used** instead of primitive types
6. **Error messages safe** - no sensitive information leaked
7. **Resource usage bounded** - no potential for DoS attacks
8. **State changes atomic** - either all succeed or all fail

### **When suggesting improvements:**

1. **Prioritize security fixes** over features
2. **Suggest security tests** for new functionality
3. **Recommend defensive programming** patterns
4. **Point out potential attack vectors** in code
5. **Suggest using higher-level safe abstractions** over manual unsafe code

---

## **COMMON SECURITY ANTI-PATTERNS TO AVOID**

### **❌ NEVER DO THESE:**

```rust
// 1. Raw unwrap/expect usage
let user = users.get(&id).unwrap();

// 2. No input validation
fn update_bio(bio: String) {
    // Direct use without checks
}

// 3. Missing authentication
fn delete_post(post_id: PostId) {
    // Anyone can delete posts!
}

// 4. Hardcoded secrets
const API_KEY: &str = "sk-1234567890abcdef";

// 5. Information disclosure in errors
Err(format!("Database error: {}", internal_error))

// 6. Unbounded operations
for item in user_provided_list {
    expensive_operation(item);
}

// 7. Weak typing
fn transfer(from: String, to: String, amount: u64);

// 8. Logging sensitive data
println!("User {} performed action", user_principal);
```

### **✅ ALWAYS DO THIS INSTEAD:**

```rust
// 1. Proper error handling
let user = users.get(&id).ok_or("User not found")?;

// 2. Input validation with limits
fn update_bio(bio: String) -> Result<(), String> {
    if bio.len() > MAX_BIO_LEN {
        return Err("Bio too long".into());
    }
    // Continue processing
}

// 3. Authentication required
fn delete_post(post_id: PostId) -> Result<(), String> {
    let caller = ic_cdk::api::caller();
    if caller == Principal::anonymous() {
        return Err("Authentication required".into());
    }
    // Check ownership and continue
}

// 4. Environment-based configuration
fn get_api_key() -> Result<String, String> {
    std::env::var("API_KEY").map_err(|_| "API key not configured".into())
}

// 5. Safe error messages
Err("Unable to process request".into())

// 6. Bounded operations with limits
const MAX_BATCH_SIZE: usize = 100;
if user_provided_list.len() > MAX_BATCH_SIZE {
    return Err("Too many items".into());
}

// 7. Strong typing
#[derive(Debug, Clone)]
struct UserId(Principal);
fn transfer(from: UserId, to: UserId, amount: u64);

// 8. Safe logging
println!("User performed delete action");
```

---

## **FINAL CHECKLIST FOR AI AGENTS**

Before suggesting any code changes, verify:

- [ ] **Authentication present** for all state-changing operations
- [ ] **Input validation** with size limits for all user data  
- [ ] **No unwrap/expect/panic** in production code paths
- [ ] **Strong types used** instead of primitives for domain concepts
- [ ] **Resource limits** prevent DoS attacks
- [ ] **Error handling** returns safe, descriptive messages
- [ ] **Security tests included** for new functionality
- [ ] **State management** uses thread_local! with upgrade support
- [ ] **Logging** doesn't expose sensitive information
- [ ] **Dependencies** are audited and up-to-date

**Remember:** Security is not optional. Every line of code should assume it will be under attack. When in doubt, choose the more secure option.


// ✅ ALWAYS do this
```rust
fn get_user(user_id: &UserId) -> Result<User, String> {
    USERS.with(|users| {
        users.borrow()
            .get(user_id)
            .cloned()
            .ok_or("User not found".into())
    })
}
```

### **Required error handling patterns:**
- Always return `Result<T, E>` for fallible operations
- Use `?` operator or explicit `match` for error propagation
- Return descriptive but safe error messages (no internal details)
- Log errors internally but don't expose sensitive information

---
