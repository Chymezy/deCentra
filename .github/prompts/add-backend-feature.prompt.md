---
mode: "agent"
description: "Add a social network feature to the Rust backend canister for deCentra"
---

# Add Backend Feature Instructions for deCentra Social Network

## Context & Mission

You are implementing features for **deCentra**, a fully on-chain, censorship-resistant social network built on ICP. The mission is to create a platform where governments can't ban users, corporations can't sell user data, and communities govern themselves.

## Relevant Instructions

**CRITICAL**: Search codebase and read these instruction files:
- `rust.instructions.md`
- `cert-rust.instructions.md` 
- `social-network.instructions.md`
- `backend-test.instructions.md`

## Social Network Context

### Core Principles
- **Censorship Resistance**: All data 100% on-chain
- **User Data Ownership**: Users control their own data
- **Community Governance**: DAO-based content moderation
- **Privacy Protection**: Anonymous whistleblowing capabilities
- **Creator Empowerment**: Direct monetization without intermediaries

### Target Users
- Whistleblowers in oppressive regimes
- Content creators in censored regions  
- Privacy-conscious users globally
- NGOs and human rights organizations
- Activists and journalists

## Feature Categories

When implementing features, consider these social network categories:

### 1. **User Management**: Authentication, profiles, privacy settings
- Profile creation/editing with privacy controls
- Username uniqueness and validation
- Privacy settings and verification status
- Account recovery and data export

### 2. **Content System**: Posts, comments, media handling 
- Post creation (text, media, polls)
- Content editing and versioning
- Visibility controls (public, followers, encrypted)
- Content categorization and tagging

### 3. **Social Graph**: Follow/unfollow, user relationships
- Follow/unfollow relationships
- Block and mute functionality
- Friend recommendations
- Relationship privacy controls

### 4. **Engagement Features**: Likes, reposts, social interactions
- Like/dislike system
- Comment threading
- Repost functionality
- Micro-tipping with ICP tokens

### 5. **Discovery & Feeds**: Search, trending, recommendations
- User search functionality
- Content search with filters
- Feed generation algorithms
- Trending topic detection

### 6. **Moderation & Safety**: Reporting, blocking, content filtering
- Content reporting system
- DAO-based moderation proposals
- Automated spam detection
- User appeal processes

### 7. **Monetization**
- Creator tip jars
- Premium content subscriptions
- Creator analytics dashboards
- Revenue sharing mechanisms

### 8. **Privacy & Whistleblowing**: Data access, export, user controls
- Encrypted messaging
- Anonymous post creation
- Identity protection features
- Secure communication channels

## Step-by-Step Workflow

### 1. Planning Phase
- Understand the social feature requirements within deCentra's mission
- Consider impact on user privacy and censorship resistance
- Plan for DAO governance integration where applicable
- Identify security and resource protection requirements
- **CRITICAL PAUSE POINT** - Get human approval for approach

### 2. Update Documentation
- Add feature entry to CHANGELOG.md under [Unreleased]
- Update relevant documentation (API.md, ARCHITECTURE.md)

### 3. Security-First Test Development
Write comprehensive tests covering:
- Authentication tests
- Test authorization (users can only modify own data)
- Test input validation (content length, user IDs)
- Test social graph edge cases
- **CRITICAL PAUSE POINT** - Review test coverage

```rust
// Authentication tests
#[test]
fn test_feature_requires_authentication() {
    // Verify anonymous users are rejected
}

// Authorization tests  
#[test]
fn test_user_can_only_modify_own_content() {
    // Test ownership validation
}

// Input validation tests
#[test]
fn test_input_size_limits() {
    // Test MAX_CONTENT_LEN enforcement
}

// Social network specific tests
#[test] 
fn test_social_interaction_workflow() {
    // Test follow -> post -> like -> comment workflow
}

// Resource protection tests
#[test]
fn test_resource_limits() {
    // Test batch operation limits
}

// Privacy tests
#[test]
fn test_privacy_controls() {
    // Test visibility and access controls
}
```

**CRITICAL PAUSE POINT** - Review test coverage with human

### 4. Implementation Phase

Follow these patterns for social network features:
- Follow CERT secure coding standards
- Use strong typing (UserId, PostId, etc.)
- Implement proper error handling
- Add resource limits and validation
- Test and verify all functionality

```rust
// Standard social network endpoint pattern
#[ic_cdk::update]
pub async fn social_feature_endpoint(params: ValidatedParams) -> Result<ResponseType, String> {
    // 1. Authentication
    let user_id = authenticate_user()?;
    
    // 2. Input validation with social network context
    validate_social_input(&params)?;
    
    // 3. Authorization (ownership, privacy, blocking checks)
    authorize_social_action(&user_id, &params)?;
    
    // 4. Social graph checks (blocked users, privacy settings)
    check_social_permissions(&user_id, &params)?;
    
    // 5. Business logic with state consistency
    let result = with_state_mut(|state| {
        // Atomic state updates
        // Update multiple related entities (user stats, relationships, etc.)
        execute_social_logic(state, user_id, params)
    })?;
    
    // 6. Success response
    Ok(result)
}

// Social input validation
fn validate_social_input(params: &Params) -> Result<(), String> {
    // Content length limits
    // Username/display name validation
    // URL validation for media
    // Profanity filtering (basic)
    Ok(())
}

// Social authorization checks
fn authorize_social_action(user_id: &UserId, params: &Params) -> Result<(), String> {
    // Check if user is blocked
    // Verify privacy settings allow action
    // Check rate limits
    // Validate resource ownership
    Ok(())
}
```

### 5. Integration Considerations

- **Cycle Management**: Monitor instruction count for expensive operations
- **State Consistency**: Use atomic operations for related updates
- **Privacy Controls**: Respect user privacy settings in all operations
- **DAO Integration**: Add hooks for future governance features
- **Scalability**: Design for horizontal scaling (future multi-canister)

### 6. Social Network Specific Security

- **Privacy**: Respect user privacy settings in all operations
- **Performance**: Consider cycle costs for social operations
- **Scalability**: Design for 10k+ concurrent users
- **Moderation**: Prepare hooks for future DAO integration
- **Data Ownership**: Users should own and control their data

```rust
// Always implement these security patterns
pub fn secure_social_operation() -> Result<(), String> {
    // 1. Authentication check
    let caller = authenticate_user()?;
    
    // 2. Block/mute relationship checks
    if is_blocked_or_blocked_by(&caller, &target_user)? {
        return Err("Action not allowed".into());
    }
    
    // 3. Privacy settings validation
    if !user_allows_interaction(&target_user, &caller, &action_type)? {
        return Err("Privacy settings prevent this action".into());
    }
    
    // 4. Rate limiting
    if exceeds_rate_limit(&caller, &action_type)? {
        return Err("Rate limit exceeded".into());
    }
    
    // 5. Content validation
    validate_content_for_social_context(&content)?;
    
    // Proceed with operation
    Ok(())
}
```

## Error Handling for Social Features

```rust
// Social-specific error types
pub enum SocialError {
    UserNotFound,
    ContentNotFound,
    PrivacyRestriction,
    BlockedByUser,
    RateLimitExceeded,
    ContentViolation,
    InsufficientPrivileges,
}

impl From<SocialError> for String {
    fn from(error: SocialError) -> String {
        match error {
            SocialError::UserNotFound => "User not found".into(),
            SocialError::PrivacyRestriction => "Privacy settings prevent this action".into(),
            SocialError::BlockedByUser => "You are blocked by this user".into(),
            // ... other conversions with user-friendly messages
        }
    }
}
```

## Testing Requirements

Every social network feature MUST include:

1. **Authentication Tests**: Verify login requirements
2. **Authorization Tests**: Check ownership and permissions
3. **Privacy Tests**: Validate privacy setting enforcement
4. **Social Graph Tests**: Test blocking/following implications
5. **Rate Limiting Tests**: Prevent spam and abuse
6. **Content Validation Tests**: Ensure appropriate content handling
7. **State Consistency Tests**: Verify atomic updates
8. **Resource Protection Tests**: Prevent DoS attacks

## Performance Considerations

- **Batch Operations**: Limit batch sizes (MAX_BATCH_SIZE = 100)
- **Query Optimization**: Use efficient data structures
- **Pagination**: Implement for all list operations
- **Caching**: Consider cacheable query patterns
- **Cycle Monitoring**: Track expensive operations

## Remember

You're building the social network for a free and open internet. Every feature should:
- Enhance user freedom and privacy
- Resist censorship and centralized control
- Empower creators and communities
- Protect vulnerable users (whistleblowers, activists)
- Support community-driven governance

Think beyond traditional social media - you're building the foundation for truly decentralized, user-owned social networking.
