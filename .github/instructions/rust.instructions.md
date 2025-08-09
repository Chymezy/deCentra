---
applyTo: "**/*.rs"
---

# Rust ICP Canister Instructions for deCentra

## Architecture Context

deCentra uses a **single Rust canister architecture** for the MVP, with modular code structure for future scaling. All social network features are implemented in one canister using ic-cdk, optimized for the Internet Computer Protocol.

## Architecture Patterns

- Single canister architecture for MVP with modular code structure
- Use strong typing with newtype patterns for domain IDs
- Implement proper state management with thread_local! storage
- Follow CERT secure coding standards (see cert-rust.instructions.md)

## Core Social Network Patterns

### Authentication & Authorization
```rust
use ic_cdk::api::caller;
use candid::Principal;

// Standard authentication pattern for social network
pub fn authenticate_user() -> Result<UserId, String> {
    let caller = caller();
    if caller == Principal::anonymous() {
        return Err("Please authenticate with Internet Identity".into());
    }
    Ok(UserId(caller))
}

// Authorization for social network resource ownership
pub fn authorize_user_action(resource_owner: &UserId) -> Result<(), String> {
    let current_user = authenticate_user()?;
    if current_user != *resource_owner {
        return Err("Unauthorized: can only modify your own content".into());
    }
    Ok(())
}

// Social graph authorization (blocking/privacy checks)
pub fn authorize_social_interaction(
    actor: &UserId, 
    target: &UserId, 
    interaction_type: InteractionType
) -> Result<(), String> {
    // Check if users are blocked
    if is_blocked(actor, target)? || is_blocked(target, actor)? {
        return Err("Interaction not allowed with blocked user".into());
    }
    
    // Check privacy settings
    let target_user = get_user_profile(target)?;
    match interaction_type {
        InteractionType::Follow => {
            if !target_user.privacy_settings.allow_followers {
                return Err("User is not accepting followers".into());
            }
        }
        InteractionType::Message => {
            if !target_user.privacy_settings.allow_direct_messages {
                return Err("User is not accepting direct messages".into());
            }
        }
        _ => {} // Other interactions allowed by default
    }
    
    Ok(())
}
```

### Strong Typing for Social Network
```rust
use candid::{CandidType, Deserialize, Principal};

// Domain-specific IDs prevent confusion and improve type safety
#[derive(Debug, Clone, PartialEq, Eq, Hash, CandidType, Deserialize)]
pub struct UserId(pub Principal);

#[derive(Debug, Clone, PartialEq, Eq, Hash, CandidType, Deserialize)]
pub struct PostId(pub u64);

#[derive(Debug, Clone, PartialEq, Eq, Hash, CandidType, Deserialize)]
pub struct CommentId(pub u64);

#[derive(Debug, Clone, PartialEq, Eq, Hash, CandidType, Deserialize)]
pub struct ReportId(pub u64);

// Social network core types with proper validation
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct UserProfile {
    pub id: UserId,
    pub username: String,
    pub display_name: Option<String>,
    pub bio: Option<String>,
    pub avatar_url: Option<String>,
    pub followers_count: u32,
    pub following_count: u32,
    pub posts_count: u32,
    pub privacy_settings: PrivacySettings,
    pub verification_status: VerificationStatus,
    pub created_at: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Post {
    pub id: PostId,
    pub author_id: UserId,
    pub content: String,
    pub media_urls: Vec<String>,
    pub likes_count: u32,
    pub comments_count: u32,
    pub reposts_count: u32,
    pub tips_received: u64, // In ICP e8s
    pub created_at: u64,
    pub edited_at: Option<u64>,
    pub visibility: PostVisibility,
    pub moderation_status: ModerationStatus,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct PrivacySettings {
    pub profile_visibility: Visibility,
    pub post_visibility_default: Visibility,
    pub allow_followers: bool,
    pub allow_direct_messages: bool,
    pub show_online_status: bool,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum PostVisibility {
    Public,
    FollowersOnly,
    Unlisted,
    Encrypted, // For whistleblowing
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum VerificationStatus {
    None,
    Verified,        // Community verified
    Whistleblower,   // Anonymous but verified source
    Organization,    // Verified organization/NGO
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum ModerationStatus {
    Active,
    Flagged(Vec<Flag>),
    UnderReview,
    DAOApproved,
    DAORemoved(String), // Reason for removal
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum InteractionType {
    Follow,
    Message,
    Like,
    Comment,
    Tip,
}
```

### State Management for Social Network
```rust
use std::collections::HashMap;
use std::cell::RefCell;
use ic_cdk::storage::{stable_save, stable_restore};

#[derive(Default, CandidType, Deserialize, Clone)]
pub struct SocialNetworkState {
    // Core entities
    pub users: HashMap<UserId, UserProfile>,
    pub posts: HashMap<PostId, Post>,
    pub comments: HashMap<CommentId, Comment>,
    
    // Social graph
    pub follows: HashMap<UserId, Vec<UserId>>, // user -> following list
    pub followers: HashMap<UserId, Vec<UserId>>, // user -> followers list
    pub blocks: HashMap<UserId, Vec<UserId>>, // user -> blocked users
    
    // Engagement tracking
    pub likes: HashMap<PostId, Vec<UserId>>, // post -> likers
    pub post_comments: HashMap<PostId, Vec<CommentId>>, // post -> comments
    
    // Content moderation
    pub reports: HashMap<ReportId, ContentReport>,
    pub moderation_proposals: HashMap<ProposalId, ModerationProposal>,
    
    // Monetization
    pub creator_profiles: HashMap<UserId, CreatorProfile>,
    pub tips: HashMap<PostId, Vec<Tip>>,
    
    // System state
    pub next_post_id: u64,
    pub next_comment_id: u64,
    pub next_report_id: u64,
    pub version: u32,
}

thread_local! {
    static STATE: RefCell<SocialNetworkState> = RefCell::new(SocialNetworkState::default());
}

// Safe state access patterns
pub fn with_state<R>(f: impl FnOnce(&SocialNetworkState) -> R) -> R {
    STATE.with(|state| f(&state.borrow()))
}

pub fn with_state_mut<R>(f: impl FnOnce(&mut SocialNetworkState) -> R) -> R {
    STATE.with(|state| f(&mut state.borrow_mut()))
}
```

### Input Validation for Social Content
```rust
// Content validation constants aligned with social network needs
const MAX_POST_CONTENT: usize = 10_000;
const MAX_USERNAME: usize = 50;
const MIN_USERNAME: usize = 3;
const MAX_BIO: usize = 500;
const MAX_DISPLAY_NAME: usize = 100;
const MAX_COMMENT_CONTENT: usize = 2_000;
const MAX_MEDIA_URLS: usize = 10;
const MAX_HASHTAGS: usize = 20;

pub fn validate_post_content(content: &str) -> Result<(), String> {
    if content.trim().is_empty() {
        return Err("Post content cannot be empty".into());
    }
    
    if content.len() > MAX_POST_CONTENT {
        return Err(format!("Post content exceeds {} characters", MAX_POST_CONTENT));
    }
    
    // Check for potential spam patterns
    if content.split_whitespace().count() < content.len() / 200 {
        return Err("Content appears to be spam".into());
    }
    
    Ok(())
}

pub fn validate_username(username: &str) -> Result<(), String> {
    if username.len() < MIN_USERNAME || username.len() > MAX_USERNAME {
        return Err(format!("Username must be between {} and {} characters", 
                          MIN_USERNAME, MAX_USERNAME));
    }
    
    if !username.chars().all(|c| c.is_alphanumeric() || c == '_' || c == '-') {
        return Err("Username can only contain letters, numbers, underscores, and hyphens".into());
    }
    
    if username.starts_with('-') || username.ends_with('-') {
        return Err("Username cannot start or end with hyphens".into());
    }
    
    Ok(())
}

pub fn validate_bio(bio: &str) -> Result<(), String> {
    if bio.len() > MAX_BIO {
        return Err(format!("Bio cannot exceed {} characters", MAX_BIO));
    }
    Ok(())
}

pub fn sanitize_content(content: &str) -> String {
    content
        .trim()
        .chars()
        .filter(|c| !c.is_control() || *c == '\n' || *c == '\t')
        .take(MAX_POST_CONTENT)
        .collect()
}

pub fn validate_media_urls(urls: &[String]) -> Result<(), String> {
    if urls.len() > MAX_MEDIA_URLS {
        return Err(format!("Cannot attach more than {} media files", MAX_MEDIA_URLS));
    }
    
    for url in urls {
        if !url.starts_with("https://") {
            return Err("Media URLs must use HTTPS".into());
        }
        if url.len() > 500 {
            return Err("Media URL too long".into());
        }
    }
    
    Ok(())
}
```

### Social Network API Patterns
```rust
// User management endpoints
#[ic_cdk::update]
pub async fn create_user_profile(
    username: String,
    display_name: Option<String>,
    bio: Option<String>
) -> Result<UserProfile, String> {
    let user_id = authenticate_user()?;
    
    // Validate inputs
    validate_username(&username)?;
    if let Some(name) = &display_name {
        if name.len() > MAX_DISPLAY_NAME {
            return Err("Display name too long".into());
        }
    }
    if let Some(bio_text) = &bio {
        validate_bio(bio_text)?;
    }
    
    with_state_mut(|state| {
        // Check if username is already taken
        for existing_user in state.users.values() {
            if existing_user.username == username {
                return Err("Username already taken".into());
            }
        }
        
        // Check if user already has a profile
        if state.users.contains_key(&user_id) {
            return Err("User profile already exists".into());
        }
        
        let profile = UserProfile {
            id: user_id.clone(),
            username: username.clone(),
            display_name,
            bio,
            avatar_url: None,
            followers_count: 0,
            following_count: 0,
            posts_count: 0,
            privacy_settings: PrivacySettings::default(),
            verification_status: VerificationStatus::None,
            created_at: ic_cdk::api::time(),
        };
        
        state.users.insert(user_id, profile.clone());
        Ok(profile)
    })
}

#[ic_cdk::update]
pub async fn create_post(
    content: String,
    media_urls: Vec<String>,
    visibility: PostVisibility
) -> Result<PostId, String> {
    let user_id = authenticate_user()?;
    
    // Validate content and media
    validate_post_content(&content)?;
    validate_media_urls(&media_urls)?;
    let sanitized_content = sanitize_content(&content);
    
    with_state_mut(|state| {
        // Check user exists
        if !state.users.contains_key(&user_id) {
            return Err("User profile not found. Please create a profile first".into());
        }
        
        let post_id = PostId(state.next_post_id);
        state.next_post_id += 1;
        
        let post = Post {
            id: post_id.clone(),
            author_id: user_id.clone(),
            content: sanitized_content,
            media_urls,
            likes_count: 0,
            comments_count: 0,
            reposts_count: 0,
            tips_received: 0,
            created_at: ic_cdk::api::time(),
            edited_at: None,
            visibility,
            moderation_status: ModerationStatus::Active,
        };
        
        state.posts.insert(post_id.clone(), post);
        
        // Update user's post count
        if let Some(user) = state.users.get_mut(&user_id) {
            user.posts_count += 1;
        }
        
        Ok(post_id)
    })
}

#[ic_cdk::update]
pub async fn follow_user(target_user_id: UserId) -> Result<(), String> {
    let current_user_id = authenticate_user()?;
    
    if current_user_id == target_user_id {
        return Err("Cannot follow yourself".into());
    }
    
    // Check social interaction authorization
    authorize_social_interaction(&current_user_id, &target_user_id, InteractionType::Follow)?;
    
    with_state_mut(|state| {
        // Check both users exist
        if !state.users.contains_key(&current_user_id) || !state.users.contains_key(&target_user_id) {
            return Err("User not found".into());
        }
        
        // Add to following list
        let following = state.follows.entry(current_user_id.clone()).or_insert_with(Vec::new);
        if following.contains(&target_user_id) {
            return Err("Already following this user".into());
        }
        following.push(target_user_id.clone());
        
        // Add to followers list
        let followers = state.followers.entry(target_user_id.clone()).or_insert_with(Vec::new);
        followers.push(current_user_id.clone());
        
        // Update counts
        if let Some(current_user) = state.users.get_mut(&current_user_id) {
            current_user.following_count += 1;
        }
        if let Some(target_user) = state.users.get_mut(&target_user_id) {
            target_user.followers_count += 1;
        }
        
        Ok(())
    })
}

#[ic_cdk::update]
pub async fn like_post(post_id: PostId) -> Result<(), String> {
    let user_id = authenticate_user()?;
    
    with_state_mut(|state| {
        // Check post exists
        if !state.posts.contains_key(&post_id) {
            return Err("Post not found".into());
        }
        
        // Check if already liked
        let likes = state.likes.entry(post_id.clone()).or_insert_with(Vec::new);
        if likes.contains(&user_id) {
            return Err("Already liked this post".into());
        }
        
        // Add like
        likes.push(user_id);
        
        // Update post like count
        if let Some(post) = state.posts.get_mut(&post_id) {
            post.likes_count += 1;
        }
        
        Ok(())
    })
}

#[ic_cdk::query]
pub fn get_user_feed(offset: usize, limit: usize) -> Result<Vec<Post>, String> {
    let user_id = authenticate_user()?;
    
    // Limit pagination to prevent resource exhaustion
    let safe_limit = std::cmp::min(limit, 50);
    
    with_state(|state| {
        // Get user's following list
        let following = state.follows.get(&user_id).cloned().unwrap_or_default();
        
        // Collect posts from followed users + own posts
        let mut feed_posts: Vec<_> = state.posts
            .values()
            .filter(|post| {
                // Include posts from followed users or own posts
                following.contains(&post.author_id) || post.author_id == user_id
            })
            .filter(|post| {
                // Respect visibility settings
                match post.visibility {
                    PostVisibility::Public => true,
                    PostVisibility::FollowersOnly => {
                        // Check if current user follows the author
                        post.author_id == user_id || 
                        state.followers.get(&post.author_id)
                            .map(|followers| followers.contains(&user_id))
                            .unwrap_or(false)
                    },
                    PostVisibility::Unlisted | PostVisibility::Encrypted => {
                        // Only show to author
                        post.author_id == user_id
                    }
                }
            })
            .filter(|post| {
                // Filter out content from blocked users
                !state.blocks.get(&user_id)
                    .map(|blocked| blocked.contains(&post.author_id))
                    .unwrap_or(false)
            })
            .cloned()
            .collect();
        
        // Sort by creation time (newest first)
        feed_posts.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        
        // Apply pagination
        let end = std::cmp::min(offset + safe_limit, feed_posts.len());
        if offset >= feed_posts.len() {
            Ok(Vec::new())
        } else {
            Ok(feed_posts[offset..end].to_vec())
        }
    })
}

#[ic_cdk::query]
pub fn search_users(query: String, limit: usize) -> Result<Vec<UserProfile>, String> {
    if query.trim().is_empty() {
        return Err("Search query cannot be empty".into());
    }
    
    if query.len() > 100 {
        return Err("Search query too long".into());
    }
    
    let safe_limit = std::cmp::min(limit, 20);
    let query_lower = query.to_lowercase();
    
    with_state(|state| {
        let mut matching_users: Vec<_> = state.users
            .values()
            .filter(|user| {
                user.username.to_lowercase().contains(&query_lower) ||
                user.display_name.as_ref()
                    .map(|name| name.to_lowercase().contains(&query_lower))
                    .unwrap_or(false)
            })
            .filter(|user| {
                // Respect privacy settings
                user.privacy_settings.profile_visibility == Visibility::Public
            })
            .cloned()
            .collect();
        
        // Sort by follower count (most followed first)
        matching_users.sort_by(|a, b| b.followers_count.cmp(&a.followers_count));
        
        // Apply limit
        matching_users.truncate(safe_limit);
        Ok(matching_users)
    })
}
```

### Upgrade Safety
```rust
#[ic_cdk::pre_upgrade]
fn pre_upgrade() {
    STATE.with(|state| {
        stable_save((state.borrow().clone(),))
            .expect("Failed to save state before upgrade");
    });
}

#[ic_cdk::post_upgrade]
fn post_upgrade() {
    let (stored_state,): (SocialNetworkState,) = stable_restore()
        .expect("Failed to restore state after upgrade");
    
    STATE.with(|state| {
        *state.borrow_mut() = stored_state;
    });
}

#[ic_cdk::init]
fn init() {
    STATE.with(|state| {
        *state.borrow_mut() = SocialNetworkState::default();
    });
}
```

## Security Requirements for Social Network

### ALWAYS implement:
- Principal validation for all update calls
- Input size limits with social network constants
- Content sanitization for user-generated content
- Social graph authorization (blocking, privacy)
- Resource limits to prevent DoS attacks
- Proper error handling with Result types

### NEVER use:
- .unwrap() or .expect() in production code
- panic! for error handling
- Unbounded loops or operations
- Direct Principal comparisons without authentication
- Raw user input without validation

## Testing Patterns

```rust
#[cfg(test)]
mod social_network_tests {
    use super::*;
    
    #[test]
    fn test_user_profile_creation_success() {
        let user_id = UserId(Principal::from_text("rdmx6-jaaaa-aaaah-qcaiq-cai").unwrap());
        // Test successful user creation with valid data
    }
    
    #[test]
    fn test_username_uniqueness() {
        // Test that duplicate usernames are rejected
    }
    
    #[test]
    fn test_follow_workflow() {
        // Test complete follow/unfollow workflow
    }
    
    #[test]
    fn test_privacy_settings_enforcement() {
        // Test that privacy settings are respected
    }
    
    #[test]
    fn test_content_moderation_workflow() {
        // Test reporting and moderation features
    }
    
    #[test]
    fn test_feed_generation_performance() {
        // Test feed generation with large datasets
    }
}
```

Remember: Every function should consider the social network context and ensure user privacy, content integrity, and censorship resistance while maintaining high performance and security standards.
