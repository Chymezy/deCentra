---
applyTo: "**/tests/**/*.rs"
---

# Backend Testing Instructions for Social Network

## Testing Patterns for Social Features

### Authentication Tests
```rust
#[tokio::test]
async fn test_authentication_required() {
    let pic = PocketIc::new();
    let canister_id = pic.create_canister();
    
    // Test anonymous access is rejected
    let result = pic.update_call(canister_id, Principal::anonymous(), "create_post", 
        candid::encode_one("Hello World").unwrap()).await;
    
    assert!(result.is_err());
}
```

### Social Interaction Tests
```rust
#[tokio::test]
async fn test_follow_unfollow_workflow() {
    let pic = PocketIc::new();
    let canister_id = pic.create_canister();
    
    let user1 = Principal::from_text("rdmx6-jaaaa-aaaah-qcaiq-cai").unwrap();
    let user2 = Principal::from_text("rrkah-fqaaa-aaaah-qcupq-cai").unwrap();
    
    // Test follow
    let follow_result = pic.update_call(canister_id, user1, "follow_user", 
        candid::encode_one(user2).unwrap()).await;
    assert!(follow_result.is_ok());
    
    // Test following list
    let following_result = pic.query_call(canister_id, user1, "get_following", 
        candid::encode_args(()).unwrap()).await;
    // Assert user2 is in following list
}
```

### Content Tests
```rust
#[tokio::test]
async fn test_post_creation_and_retrieval() {
    // Test post creation with valid content
    // Test post retrieval
    // Test post permissions
    // Test content validation
}
```

### Security Tests
- Test input validation (oversized content, empty content)
- Test authorization (user can only modify own content)
- Test rate limiting
- Test principal validation patterns
