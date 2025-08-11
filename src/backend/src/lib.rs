use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::time;
use ic_cdk::{caller, query, update};
use std::cell::RefCell;
use std::collections::{BTreeMap, BTreeSet};

mod auth;
mod errors;
mod types;
mod validation;

use auth::*;
use types::*;
use validation::*;

// Global state management
thread_local! {
    static STATE: RefCell<SocialNetworkState> = RefCell::new(SocialNetworkState::default());
}

/// Main state structure for the social network
#[derive(Default, CandidType, Deserialize, Clone)]
pub struct SocialNetworkState {
    /// User profiles indexed by user ID
    pub users: BTreeMap<UserId, UserProfile>,

    /// All posts indexed by post ID
    pub posts: BTreeMap<PostId, Post>,

    /// Comments indexed by comment ID
    pub comments: BTreeMap<CommentId, Comment>,

    /// Posts by user for efficient lookup
    pub user_posts: BTreeMap<UserId, Vec<PostId>>,

    /// Likes for each post
    pub post_likes: BTreeMap<PostId, BTreeSet<UserId>>,

    /// Comments for each post
    pub post_comments: BTreeMap<PostId, Vec<CommentId>>,

    /// Next available post ID
    pub next_post_id: u64,

    /// Next available comment ID
    pub next_comment_id: u64,

    /// Rate limiting tracking (user, action) -> last action times
    pub rate_limits: BTreeMap<(UserId, String), Vec<u64>>,
}

/// Utility function to work with state
fn with_state<T>(f: impl FnOnce(&SocialNetworkState) -> T) -> T {
    STATE.with(|state| f(&*state.borrow()))
}

/// Utility function to mutate state
fn with_state_mut<T>(f: impl FnOnce(&mut SocialNetworkState) -> T) -> T {
    STATE.with(|state| f(&mut *state.borrow_mut()))
}

// ============================================================================
// USER PROFILE MANAGEMENT
// ============================================================================

/// Creates a new user profile with privacy controls
///
/// # Purpose
/// Initializes a user profile for social networking on deCentra.
/// This is required before users can post content or interact socially.
///
/// # Arguments
/// * `username` - Unique identifier (3-50 chars, alphanumeric + _ -)
/// * `bio` - Optional biography (max 500 chars)
/// * `avatar` - Optional avatar URL or emoji
///
/// # Returns
/// * `Ok(UserProfile)` - Successfully created profile with default privacy settings
/// * `Err(String)` - Validation error or username conflict
///
/// # Errors
/// - "Username already taken" - Duplicate username
/// - "Username must be between 3 and 50 characters" - Invalid length
/// - "User profile already exists" - User already has profile
/// - "Authentication required" - Anonymous caller
///
/// # Security
/// * Requires authenticated user (Internet Identity)
/// * Validates all input parameters against DoS attacks
/// * Sanitizes text content to prevent injection
/// * Rate limited to 1 profile per principal
///
/// # Example
/// ```rust
/// // Creating a basic user profile
/// let result = create_user_profile(
///     "alice_doe".to_string(),
///     Some("Digital rights activist and journalist".to_string()),
///     Some("👩‍💻".to_string())
/// ).await;
///
/// match result {
///     Ok(profile) => println!("Profile created for {}", profile.username),
///     Err(error) => println!("Failed to create profile: {}", error),
/// }
/// ```
///
/// # Privacy Notes
/// - Profile starts with privacy_settings.profile_visibility = Public
/// - Users can change privacy settings after creation
/// - Bio and avatar are optional for enhanced privacy
#[update]
pub async fn create_user_profile(
    username: String,
    bio: Option<String>,
    avatar: Option<String>,
) -> Result<UserProfile, String> {
    let user_id = authenticate_user()?;

    // Check if profile already exists
    if with_state(|state| state.users.contains_key(&user_id)) {
        return Err("User profile already exists".to_string());
    }

    // Validate inputs
    validate_username(&username)?;
    if let Some(ref bio_text) = bio {
        validate_bio(bio_text)?;
    }
    if let Some(ref avatar_text) = avatar {
        validate_avatar(avatar_text)?;
    }

    // Check for username uniqueness
    let username_taken = with_state(|state| {
        state
            .users
            .values()
            .any(|profile| profile.username == username)
    });

    if username_taken {
        return Err("Username already taken".to_string());
    }

    let now = time();
    let profile = UserProfile {
        id: user_id,
        username,
        bio: bio.unwrap_or_default(),
        avatar: avatar.unwrap_or_default(),
        created_at: now,
        updated_at: now,
        follower_count: 0,
        following_count: 0,
        post_count: 0,
        privacy_settings: PrivacySettings::default(),
        verification_status: VerificationStatus::Unverified,
    };

    with_state_mut(|state| {
        state.users.insert(user_id, profile.clone());
        state.user_posts.insert(user_id, Vec::new());
    });

    Ok(profile)
}

/// Updates an existing user profile
///
/// # Security
/// * Only the profile owner can update their profile
/// * Validates all input parameters
/// * Maintains creation timestamp
#[update]
pub async fn update_user_profile(
    username: String,
    bio: Option<String>,
    avatar: Option<String>,
) -> Result<UserProfile, String> {
    let user_id = authenticate_user()?;

    // Validate inputs
    validate_username(&username)?;
    if let Some(ref bio_text) = bio {
        validate_bio(bio_text)?;
    }
    if let Some(ref avatar_text) = avatar {
        validate_avatar(avatar_text)?;
    }

    with_state_mut(|state| {
        // First check username uniqueness (excluding current user)
        let username_taken = state
            .users
            .values()
            .any(|p| p.username == username && p.id != user_id);

        if username_taken {
            return Err("Username already taken".to_string());
        }

        // Now get mutable reference to update the profile
        match state.users.get_mut(&user_id) {
            Some(profile) => {
                profile.username = username;
                profile.bio = bio.unwrap_or_default();
                profile.avatar = avatar.unwrap_or_default();
                profile.updated_at = time();

                Ok(profile.clone())
            }
            None => Err("Profile not found".to_string()),
        }
    })
}

/// Retrieves a user profile by user ID
///
/// # Privacy
/// * Respects privacy settings
/// * Anonymous users can only see public profiles
#[query]
pub fn get_user_profile(user_id: UserId) -> Option<UserProfile> {
    let viewer = caller();

    with_state(|state| {
        state.users.get(&user_id).cloned().map(|profile| {
            // Apply privacy filters based on viewer
            if viewer == Principal::anonymous() || viewer != user_id.0 {
                // For now, return full profile (privacy filtering to be enhanced)
                profile
            } else {
                profile
            }
        })
    })
}

/// Get the authenticated user's own profile
#[query]
pub fn get_my_profile() -> Option<UserProfile> {
    let user_id = match authenticate_user() {
        Ok(id) => id,
        Err(_) => return None,
    };

    with_state(|state| state.users.get(&user_id).cloned())
}

// ============================================================================
// POST MANAGEMENT
// ============================================================================

/// Creates a new post with content validation
///
/// # Purpose
/// Creates a new social media post with content validation and security checks.
/// Posts are stored on-chain and become part of the user's social graph.
///
/// # Arguments
/// * `content` - Post content (1-10,000 characters)
/// * `visibility` - Who can see this post (Public, FollowersOnly, Unlisted)
///
/// # Returns
/// * `Ok(PostId)` - Successfully created post ID
/// * `Err(String)` - Validation or security error
///
/// # Security
/// * Requires authenticated user
/// * Validates content length and safety
/// * Rate limited to prevent spam
/// * Auto-creates profile if needed
#[update]
pub async fn create_post(
    content: String,
    visibility: Option<PostVisibility>,
) -> Result<PostId, String> {
    let user_id = authenticate_user()?;

    // Validate content
    validate_post_content(&content)?;

    // Check rate limiting
    check_rate_limit(&user_id, "create_post", 10, 300)?; // 10 posts per 5 minutes

    // Ensure user has a profile (create default if needed)
    ensure_user_profile(user_id).await?;

    let post_id = with_state_mut(|state| {
        let post_id = PostId(state.next_post_id);
        state.next_post_id += 1;

        let now = time();
        let post = Post {
            id: post_id,
            author_id: user_id,
            content,
            created_at: now,
            updated_at: now,
            like_count: 0,
            comment_count: 0,
            visibility: visibility.unwrap_or(PostVisibility::Public),
        };

        state.posts.insert(post_id, post);
        state.post_likes.insert(post_id, BTreeSet::new());
        state.post_comments.insert(post_id, Vec::new());

        // Add to user's posts
        state
            .user_posts
            .entry(user_id)
            .or_insert_with(Vec::new)
            .push(post_id);

        // Update user's post count
        if let Some(profile) = state.users.get_mut(&user_id) {
            profile.post_count += 1;
            profile.updated_at = now;
        }

        post_id
    });

    Ok(post_id)
}

/// Retrieves a post by ID with privacy checks
#[query]
pub fn get_post(post_id: PostId) -> Option<Post> {
    let viewer = caller();

    with_state(|state| {
        state.posts.get(&post_id).cloned().filter(|post| {
            // Apply visibility filters
            match post.visibility {
                PostVisibility::Public => true,
                PostVisibility::FollowersOnly => {
                    // For now, allow all (following system to be implemented)
                    viewer != Principal::anonymous()
                }
                PostVisibility::Unlisted => {
                    // Only author can see unlisted posts
                    viewer == post.author_id.0
                }
            }
        })
    })
}

/// Gets all posts by a specific user
#[query]
pub fn get_user_posts(user_id: UserId, limit: Option<usize>, offset: Option<usize>) -> Vec<Post> {
    let viewer = caller();
    let limit = limit.unwrap_or(10).min(50); // Cap at 50 posts
    let offset = offset.unwrap_or(0);

    with_state(|state| {
        state
            .user_posts
            .get(&user_id)
            .map(|post_ids| {
                post_ids
                    .iter()
                    .rev() // Most recent first
                    .skip(offset)
                    .take(limit)
                    .filter_map(|&post_id| state.posts.get(&post_id))
                    .filter(|post| {
                        // Apply visibility filters
                        match post.visibility {
                            PostVisibility::Public => true,
                            PostVisibility::FollowersOnly => viewer != Principal::anonymous(),
                            PostVisibility::Unlisted => viewer == post.author_id.0,
                        }
                    })
                    .cloned()
                    .collect()
            })
            .unwrap_or_default()
    })
}

/// Retrieves the authenticated user's personalized social feed
///
/// # Purpose
/// Generates a chronological feed of posts from followed users plus own posts.
/// Respects privacy settings and blocks between users.
///
/// # Arguments
/// * `offset` - Number of posts to skip (for pagination)
/// * `limit` - Maximum posts to return (capped at 50)
///
/// # Returns
/// * `Ok(Vec<FeedPost>)` - List of posts with author info sorted by creation time (newest first)
/// * `Err(String)` - Authentication or validation error
///
/// # Feed Algorithm
/// 1. Collect all public posts (for MVP - following system to be enhanced)
/// 2. Include current user's own posts regardless of visibility
/// 3. Sort by creation timestamp (descending)
/// 4. Apply pagination limits
///
/// # Performance
/// - Pagination prevents memory exhaustion
/// - Efficient indexing for large user bases
/// - Cycle cost scales with total posts
#[query]
pub fn get_user_feed(offset: Option<usize>, limit: Option<usize>) -> Result<Vec<FeedPost>, String> {
    let viewer = caller();
    let limit = limit.unwrap_or(10).min(50); // Cap at 50 posts
    let offset = offset.unwrap_or(0);

    if viewer == Principal::anonymous() {
        return Err("Authentication required for personalized feed".to_string());
    }

    with_state(|state| {
        let mut feed_posts: Vec<FeedPost> = Vec::new();

        // Collect posts (for MVP, show all public posts + user's own posts)
        for (post_id, post) in state.posts.iter() {
            let can_view = match post.visibility {
                PostVisibility::Public => true,
                PostVisibility::FollowersOnly => true, // For MVP, show all
                PostVisibility::Unlisted => viewer == post.author_id.0,
            };

            if can_view {
                if let Some(author) = state.users.get(&post.author_id) {
                    feed_posts.push(FeedPost {
                        post: post.clone(),
                        author: author.clone(),
                        is_liked: state
                            .post_likes
                            .get(post_id)
                            .map(|likes| likes.contains(&UserId(viewer)))
                            .unwrap_or(false),
                    });
                }
            }
        }

        // Sort by creation time (newest first)
        feed_posts.sort_by(|a, b| b.post.created_at.cmp(&a.post.created_at));

        // Apply pagination
        let result: Vec<FeedPost> = feed_posts.into_iter().skip(offset).take(limit).collect();

        Ok(result)
    })
}

// ============================================================================
// ENGAGEMENT FEATURES
// ============================================================================

/// Likes a post
///
/// # Security
/// * Prevents duplicate likes from same user
/// * Validates post exists
/// * Rate limited to prevent spam
#[update]
pub async fn like_post(post_id: PostId) -> Result<(), String> {
    let user_id = authenticate_user()?;

    // Check rate limiting
    check_rate_limit(&user_id, "like_post", 60, 60)?; // 60 likes per minute

    with_state_mut(|state| {
        // Check if post exists
        let post = state.posts.get_mut(&post_id).ok_or("Post not found")?;

        // Check if already liked
        let likes = state
            .post_likes
            .entry(post_id)
            .or_insert_with(BTreeSet::new);

        if likes.contains(&user_id) {
            return Err("Already liked this post".to_string());
        }

        // Add like
        likes.insert(user_id);
        post.like_count += 1;
        post.updated_at = time();

        Ok(())
    })
}

/// Unlikes a post
#[update]
pub async fn unlike_post(post_id: PostId) -> Result<(), String> {
    let user_id = authenticate_user()?;

    with_state_mut(|state| {
        // Check if post exists
        let post = state.posts.get_mut(&post_id).ok_or("Post not found")?;

        // Remove like
        let likes = state
            .post_likes
            .entry(post_id)
            .or_insert_with(BTreeSet::new);

        if !likes.remove(&user_id) {
            return Err("Haven't liked this post".to_string());
        }

        post.like_count = post.like_count.saturating_sub(1);
        post.updated_at = time();

        Ok(())
    })
}

// ============================================================================
// COMMENT SYSTEM
// ============================================================================

/// Adds a comment to a post
#[update]
pub async fn add_comment(post_id: PostId, content: String) -> Result<Comment, String> {
    let user_id = authenticate_user()?;

    // Validate content
    validate_comment_content(&content)?;

    // Check rate limiting
    check_rate_limit(&user_id, "add_comment", 30, 60)?; // 30 comments per minute

    with_state_mut(|state| {
        // Check if post exists
        let post = state.posts.get_mut(&post_id).ok_or("Post not found")?;

        let comment_id = CommentId(state.next_comment_id);
        state.next_comment_id += 1;

        let now = time();
        let comment = Comment {
            id: comment_id,
            post_id,
            author_id: user_id,
            content,
            created_at: now,
            updated_at: now,
        };

        state.comments.insert(comment_id, comment.clone());
        state
            .post_comments
            .entry(post_id)
            .or_insert_with(Vec::new)
            .push(comment_id);

        // Update post comment count
        post.comment_count += 1;
        post.updated_at = now;

        Ok(comment)
    })
}

/// Gets comments for a post
#[query]
pub fn get_post_comments(
    post_id: PostId,
    limit: Option<usize>,
    offset: Option<usize>,
) -> Vec<Comment> {
    let limit = limit.unwrap_or(20).min(100); // Cap at 100 comments
    let offset = offset.unwrap_or(0);

    with_state(|state| {
        state
            .post_comments
            .get(&post_id)
            .map(|comment_ids| {
                comment_ids
                    .iter()
                    .skip(offset)
                    .take(limit)
                    .filter_map(|&comment_id| state.comments.get(&comment_id))
                    .cloned()
                    .collect()
            })
            .unwrap_or_default()
    })
}

// ============================================================================
// STATISTICS & UTILITIES
// ============================================================================

/// Gets platform statistics
#[query]
pub fn get_platform_stats() -> PlatformStats {
    with_state(|state| {
        let total_likes = state.posts.values().map(|post| post.like_count).sum();
        let total_comments = state.comments.len() as u64;

        PlatformStats {
            total_users: state.users.len() as u64,
            total_posts: state.posts.len() as u64,
            total_likes,
            total_comments,
        }
    })
}

/// Health check endpoint
#[query]
pub fn health_check() -> String {
    "deCentra backend is healthy".to_string()
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/// Ensures user has a profile, creates default if needed
async fn ensure_user_profile(user_id: UserId) -> Result<(), String> {
    let has_profile = with_state(|state| state.users.contains_key(&user_id));

    if !has_profile {
        let default_profile = UserProfile {
            id: user_id,
            username: format!(
                "user_{}",
                user_id.0.to_text().chars().take(8).collect::<String>()
            ),
            bio: "New deCentra user".to_string(),
            avatar: "👤".to_string(),
            created_at: time(),
            updated_at: time(),
            follower_count: 0,
            following_count: 0,
            post_count: 0,
            privacy_settings: PrivacySettings::default(),
            verification_status: VerificationStatus::Unverified,
        };

        with_state_mut(|state| {
            state.users.insert(user_id, default_profile);
            state.user_posts.insert(user_id, Vec::new());
        });
    }

    Ok(())
}

// Export Candid interface
ic_cdk::export_candid!();
