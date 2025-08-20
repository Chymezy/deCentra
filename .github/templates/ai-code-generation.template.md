# AI Code Generation Template for deCentra

## **MANDATORY PRE-GENERATION CHECKLIST**

Before generating ANY Rust code for deCentra, you MUST verify:

### **🚫 ZERO-TOLERANCE PATTERNS**
**NEVER include these patterns in generated code:**
- [ ] `.unwrap()` or `.expect()` calls
- [ ] `panic!()`, `unreachable!()`, `todo!()`, `unimplemented!()`
- [ ] Unchecked arithmetic: `+`, `-`, `*`, `/` 
- [ ] Raw array indexing: `array[index]`
- [ ] Anonymous caller acceptance without validation
- [ ] Deprecated format strings: `format!("{}", var)`
- [ ] Ambiguous numeric types: `let count = 0`
- [ ] Deprecated clippy lints: `clippy::integer_arithmetic`

### **✅ MANDATORY PATTERNS**
**ALWAYS include these patterns in generated code:**
- [ ] `Result<T, String>` return types for fallible operations
- [ ] Saturating arithmetic: `.saturating_add()`, `.saturating_sub()`, `.saturating_mul()`
- [ ] Safe array access: `.get(index).ok_or("error")?`
- [ ] Authentication checks: `let caller = authenticate_user()?`
- [ ] Modern format strings: `format!("{variable}")`
- [ ] Explicit type annotations: `let count: u32 = 0`
- [ ] Strong typing with newtypes for domain IDs

---

## **CODE GENERATION TEMPLATE**

### **For Any Rust Function:**

```rust
/// [Function description with purpose, security considerations, and error conditions]
/// 
/// # Arguments
/// * `param` - [Description with validation rules and type constraints]
/// 
/// # Returns  
/// * `Ok(ReturnType)` - [Success condition description]
/// * `Err(String)` - [All possible error conditions]
/// 
/// # Security
/// * [Authentication requirements]
/// * [Input validation performed]
/// * [Resource limits enforced]
/// 
/// # Errors
/// - "[Specific error message]" - [Error condition]
/// 
/// # Example
/// ```rust
/// let result = function_name(validated_input)?;
/// match result {
///     Ok(value) => println!("Success: {value}"),
///     Err(error) => println!("Error: {error}"),
/// }
/// ```
pub fn function_name(param: StrongType) -> Result<ReturnType, String> {
    // Step 1: Authentication (for update functions)
    let caller = authenticate_user()?;
    
    // Step 2: Input validation with explicit error messages
    validate_param(&param)?;
    
    // Step 3: Authorization checks
    authorize_action(&caller, &param)?;
    
    // Step 4: Business logic with safe operations
    let intermediate_result = safe_operation(&param)
        .map_err(|e| format!("Operation failed: {e}"))?;
    
    // Step 5: Safe arithmetic if needed
    let calculated_value = base_value.saturating_add(increment);
    
    // Step 6: Safe state access
    with_state_mut(|state| {
        // Safe state mutation
        state.collection.insert(key, value);
        Ok(ReturnType { /* ... */ })
    })
}
```

### **For Validation Functions:**

```rust
pub fn validate_input(input: &InputType) -> Result<(), String> {
    // Size validation
    if input.field.len() > MAX_FIELD_SIZE {
        return Err(format!("Field too long: {} > {}", input.field.len(), MAX_FIELD_SIZE));
    }
    
    // Emptiness validation
    if input.field.trim().is_empty() {
        return Err("Field cannot be empty".to_string());
    }
    
    // Content validation
    if !is_valid_content(&input.field) {
        return Err("Field contains invalid characters".to_string());
    }
    
    Ok(())
}
```

### **For Error Handling:**

```rust
// ✅ ALWAYS use this pattern for error propagation
let result = fallible_operation()
    .map_err(|e| format!("Context-specific error: {e}"))?;

// ✅ ALWAYS use this pattern for Option handling
let value = option_value
    .ok_or("Descriptive error message")?;

// ✅ ALWAYS use this pattern for collections
let item = collection
    .get(&key)
    .ok_or_else(|| format!("Item not found: {key}"))?;
```

### **For Authentication:**

```rust
pub fn authenticate_user() -> Result<UserId, String> {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        return Err("Authentication required".to_string());
    }
    Ok(UserId(caller))
}
```

### **For Arithmetic:**

```rust
// ✅ ALWAYS use saturating arithmetic
let new_count = current_count.saturating_add(increment);
let remaining = total.saturating_sub(used);
let total = items.iter().fold(0u64, |acc, item| acc.saturating_add(item.value));

// ✅ ALWAYS check for division by zero
pub fn calculate_rate(numerator: u64, denominator: u64) -> Result<f64, String> {
    if denominator == 0 {
        return Err("Cannot divide by zero".to_string());
    }
    Ok(numerator as f64 / denominator as f64)
}
```

---

## **SPECIFIC INSTRUCTION INTEGRATION**

When generating code, ensure it follows ALL of these instruction files:
1. `code-quality.instructions.md` - Security and anti-patterns
2. `error-handling.instructions.md` - Comprehensive error handling  
3. `rust.instructions.md` - Rust-specific patterns
4. `general.instructions.md` - Overall project requirements
5. `social-network.instructions.md` - Domain-specific features

---

## **VALIDATION CHECKLIST FOR GENERATED CODE**

After generating any code block, verify:

### **Security Checklist**
- [ ] No `.unwrap()`, `.expect()`, or `panic!` anywhere
- [ ] Authentication check for all update functions
- [ ] Input validation with size limits
- [ ] All arithmetic uses saturating operations
- [ ] No anonymous caller acceptance

### **Quality Checklist**  
- [ ] All functions return `Result<T, String>`
- [ ] Explicit type annotations where needed
- [ ] Modern format string syntax
- [ ] Strong typing with domain newtypes
- [ ] Comprehensive error messages

### **Documentation Checklist**
- [ ] Function purpose clearly explained
- [ ] All parameters documented with constraints
- [ ] Return values and errors documented
- [ ] Security considerations mentioned
- [ ] Example usage provided

### **Testing Checklist**
- [ ] Consider error conditions and edge cases
- [ ] Include examples that can be tested
- [ ] Validate against resource limits
- [ ] Consider canister upgrade scenarios

---

## **ENFORCEMENT REMINDER**

Remember: This is an Internet Computer canister where:
- **Every `.unwrap()` is a potential DoS attack vector**
- **Every panic stops the entire social network**
- **Every unchecked operation is a security vulnerability**
- **Every ambiguous type can cause runtime errors**

Generate code as if lives depend on it - because in some cases, they do (whistleblowing, activism, etc.).
