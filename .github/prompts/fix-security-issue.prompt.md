---
mode: "agent"  
description: "Fix security vulnerabilities in deCentra"
---

# Security Issue Resolution

Identify, analyze, and fix security vulnerabilities following CERT compliance standards and best practices.

## Security Analysis Process

### 1. Vulnerability Assessment
- Scan for common vulnerabilities (XSS, CSRF, injection attacks)
- Check authentication and authorization flows
- Analyze data validation and sanitization
- Review cryptographic implementations and key management

### 2. Risk Classification
- Classify by severity (Critical, High, Medium, Low)
- Assess impact on user data and platform integrity
- Determine exploitation likelihood and attack vectors
- Prioritize based on CERT vulnerability scoring

## Backend Security Fixes (Rust + ic-cdk)

### 1. Input Validation
- Sanitize all user inputs before processing
- Implement proper bounds checking for numeric inputs
- Add regex validation for formatted data (emails, usernames)
- Use type-safe parsing with comprehensive error handling

### 2. Access Control
- Verify caller authentication for all protected endpoints
- Implement role-based access control (RBAC)
- Add rate limiting to prevent abuse and DoS attacks
- Include audit logging for sensitive operations

### 3. Data Protection
- Encrypt sensitive data at rest and in transit
- Implement secure key derivation and management
- Add data integrity checks with cryptographic signatures
- Include secure deletion for sensitive information

## Frontend Security Fixes (React + TypeScript)

### 1. Content Security
- Sanitize all user-generated content before rendering
- Implement Content Security Policy (CSP) headers
- Add XSS protection for dynamic content injection
- Include input validation on client side (with server backup)

### 2. Authentication Security
- Secure token storage using secure browser APIs
- Implement proper session management with timeout
- Add CSRF protection for state-changing operations
- Include secure communication with backend services

### 3. Privacy Protection
- Minimize data collection and storage
- Implement user consent management
- Add data anonymization for analytics
- Include secure file upload with type validation

## Code Patterns

Backend security example:
```rust
#[ic_cdk::update]
pub async fn secure_endpoint(data: String) -> Result<Response, String> {
    // Validate caller
    // Sanitize input
    // Rate limit check
    // Process securely
}
```

Frontend security example:
```typescript
function sanitizeUserInput(input: string): string
function validateFileUpload(file: File): boolean
function secureApiCall<T>(endpoint: string, data: any): Promise<T>
```

## Validation Checklist
- [ ] All inputs properly validated and sanitized
- [ ] Authentication and authorization working correctly
- [ ] Rate limiting prevents abuse
- [ ] Sensitive data encrypted and protected
- [ ] Security headers properly configured
- [ ] Audit logging captures security events