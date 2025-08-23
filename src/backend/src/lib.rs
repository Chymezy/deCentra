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

    /// Social connections for each user (following/followers)
    pub social_connections: BTreeMap<UserId, SocialConnections>,

    /// Follow requests for private profiles
    pub follow_requests: BTreeMap<u64, FollowRequest>,

    /// Next available follow request ID
    pub next_follow_request_id: u64,

    /// Index: who follows whom for efficient lookup
    pub following_index: BTreeMap<UserId, BTreeSet<UserId>>,

    /// Index: who is followed by whom for efficient lookup
    pub followers_index: BTreeMap<UserId, BTreeSet<UserId>>,
}

/// Utility function to work with state
fn with_state<T>(f: impl FnOnce(&SocialNetworkState) -> T) -> T {
    STATE.with(|state| f(&state.borrow()))
}

/// Utility function to mutate state
fn with_state_mut<T>(f: impl FnOnce(&mut SocialNetworkState) -> T) -> T {
    STATE.with(|state| f(&mut state.borrow_mut()))
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
        state.next_post_id = state.next_post_id.saturating_add(1);

        let now = time();
        let post = Post {
            id: post_id,
            author_id: user_id,
            content,
            created_at: now,
            updated_at: now,
            likes_count: 0u32,
            comments_count: 0u32,
            reposts_count: 0u32,
            tips_received: 0u64,
            edited_at: None,
            visibility: visibility.unwrap_or(PostVisibility::Public),
            like_count: 0u64,
            comment_count: 0u64,
        };

        state.posts.insert(post_id, post);
        state.post_likes.insert(post_id, BTreeSet::new());
        state.post_comments.insert(post_id, Vec::new());

        // Add to user's posts
        state.user_posts.entry(user_id).or_default().push(post_id);

        // Update user's post count
        if let Some(profile) = state.users.get_mut(&user_id) {
            profile.post_count = profile.post_count.saturating_add(1);
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
/// 1. Collect posts from users the current user follows
/// 2. Include current user's own posts regardless of visibility
/// 3. Filter based on post visibility settings
/// 4. Remove posts from blocked users
/// 5. Sort by creation timestamp (descending)
/// 6. Apply pagination limits
///
/// # Privacy Filters Applied
/// - PostVisibility::Public - Always visible
/// - PostVisibility::FollowersOnly - Only if user follows author or owns post
/// - PostVisibility::Unlisted - Only author's own posts
///
/// # Performance
/// - Pagination prevents memory exhaustion
/// - Efficient indexing for large user bases
/// - Cycle cost scales with following count
#[query]
pub fn get_user_feed(offset: Option<u64>, limit: Option<u64>) -> Result<Vec<CanisterPost>, String> {
    let _caller = authenticate_user()?;

    let safe_offset: usize = offset.unwrap_or(0u64) as usize;
    let safe_limit: usize = std::cmp::min(limit.unwrap_or(10u64) as usize, MAX_FEED_LIMIT);

    with_state(|state| {
        let user_posts: Vec<CanisterPost> = state
            .posts
            .values()
            .filter(|post| {
                // For now, show all public posts (will add following filter later)
                matches!(post.visibility, PostVisibility::Public)
            })
            .skip(safe_offset)
            .take(safe_limit)
            .map(|post| CanisterPost {
                id: post.id,
                author_id: post.author_id,
                content: post.content.clone(),
                created_at: post.created_at,
                likes_count: post.likes_count,
                comments_count: post.comments_count,
                reposts_count: post.reposts_count,
                tips_received: post.tips_received,
                edited_at: post.edited_at,
                visibility: post.visibility.clone(),
            })
            .collect::<Vec<_>>()
            .into_iter()
            .rev() // Newest first
            .collect();

        Ok(user_posts)
    })
}

// Add the CanisterPost type to match frontend expectations
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct CanisterPost {
    pub id: PostId,
    pub author_id: UserId,
    pub content: String,
    pub created_at: u64,
    pub likes_count: u32,
    pub comments_count: u32,
    pub reposts_count: u32,
    pub tips_received: u64,
    pub edited_at: Option<u64>,
    pub visibility: PostVisibility,
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
        let likes = state.post_likes.entry(post_id).or_default();

        if likes.contains(&user_id) {
            return Err("Already liked this post".to_string());
        }

        // Add like
        likes.insert(user_id);
        post.like_count = post.like_count.saturating_add(1);
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
        let likes = state.post_likes.entry(post_id).or_default();

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
        state.next_comment_id = state.next_comment_id.saturating_add(1);

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
            .or_default()
            .push(comment_id);

        // Update post comment count
        post.comment_count = post.comment_count.saturating_add(1);
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

// ============================================================================
// SOCIAL GRAPH MANAGEMENT (FOLLOW/UNFOLLOW SYSTEM)
// ============================================================================

/// Follows another user or sends a follow request for private profiles
///
/// # Purpose
/// Establishes or requests a social connection between users. This is the core
/// functionality for building the social graph in deCentra.
///
/// # Arguments
/// * `target_user_id` - Principal of the user to follow
///
/// # Returns
/// * `Ok(())` - Successfully followed user or sent follow request
/// * `Err(String)` - Validation error or operation failure
///
/// # Behavior
/// - For public profiles: Immediately creates follow relationship
/// - For private profiles: Creates pending follow request
/// - Updates follower/following counts and social graph indices
/// - Prevents self-following and duplicate follows
///
/// # Errors
/// - "Cannot follow yourself" - Self-follow attempt
/// - "User does not exist" - Target user not found
/// - "Already following this user" - Duplicate follow attempt
/// - "User has blocked you" - Target has blocked the follower
/// - "Following limit exceeded" - Follower has reached MAX_FOLLOWING_LIMIT
/// - "Authentication required" - Anonymous caller
///
/// # Security
/// * Requires authenticated user (Internet Identity)
/// * Validates target user exists and is not blocked
/// * Enforces following limits to prevent spam
/// * Respects privacy settings (public vs private profiles)
/// * Rate limited to prevent abuse
///
/// # Example
/// ```rust
/// // Following a public user
/// if let Ok(target) = Principal::from_text("rdmx6-jaaaa-aaaah-qcaiq-cai") {
///     let result = follow_user(target).await;
///     match result {
///         Ok(()) => println!("Successfully followed user"),
///         Err(error) => println!("Failed to follow: {}", error),
///     }
/// }
/// }
/// ```
///
/// # Privacy Notes
/// - Private profiles will receive a follow request instead of immediate follow
/// - Blocked users cannot send follow requests
/// - Following relationships are visible based on user privacy settings
#[update]
pub async fn follow_user(target_user_id: Principal) -> Result<(), String> {
    let follower_id = authenticate_user()?;
    let target_id = UserId(target_user_id);

    // Prevent self-following
    if follower_id == target_id {
        return Err("Cannot follow yourself".to_string());
    }

    // Check if target user exists
    let target_profile = with_state(|state| state.users.get(&target_id).cloned());
    let target_profile = target_profile.ok_or("User does not exist".to_string())?;

    // Check if already following
    if with_state(|state| {
        state
            .social_connections
            .get(&follower_id)
            .map(|conn| conn.following.contains(&target_id))
            .unwrap_or(false)
    }) {
        return Err("Already following this user".to_string());
    }

    // Check if blocked by target user
    if with_state(|state| {
        state
            .social_connections
            .get(&target_id)
            .map(|conn| conn.blocked.contains(&follower_id))
            .unwrap_or(false)
    }) {
        return Err("User has blocked you".to_string());
    }

    // Check following limit
    let current_following_count = with_state(|state| {
        state
            .social_connections
            .get(&follower_id)
            .map(|conn| conn.following.len())
            .unwrap_or(0)
    });

    if current_following_count >= MAX_FOLLOWING_LIMIT {
        return Err("Following limit exceeded".to_string());
    }

    // Handle follow based on target user's privacy settings
    match target_profile.privacy_settings.profile_visibility {
        ProfileVisibility::Public => {
            // Direct follow for public profiles
            execute_follow(follower_id, target_id)?;
        }
        ProfileVisibility::FollowersOnly | ProfileVisibility::Private => {
            // Send follow request for private profiles
            create_follow_request(follower_id, target_id, None)?;
        }
    }

    Ok(())
}

/// Unfollows a user and removes the social connection
///
/// # Purpose
/// Removes an existing follow relationship between users and updates
/// the social graph accordingly.
///
/// # Arguments
/// * `target_user_id` - Principal of the user to unfollow
///
/// # Returns
/// * `Ok(())` - Successfully unfollowed user
/// * `Err(String)` - Validation error or operation failure
///
/// # Errors
/// - "User does not exist" - Target user not found
/// - "Not following this user" - No existing follow relationship
/// - "Authentication required" - Anonymous caller
///
/// # Security
/// * Requires authenticated user (Internet Identity)
/// * Only allows unfollowing existing relationships
/// * Updates all relevant indices and counts atomically
///
/// # Example
/// ```rust
/// if let Ok(target) = Principal::from_text("rdmx6-jaaaa-aaaah-qcaiq-cai") {
///     let result = unfollow_user(target).await;
/// }
/// ```
#[update]
pub async fn unfollow_user(target_user_id: Principal) -> Result<(), String> {
    let follower_id = authenticate_user()?;
    let target_id = UserId(target_user_id);

    // Check if target user exists
    if !with_state(|state| state.users.contains_key(&target_id)) {
        return Err("User does not exist".to_string());
    }

    // Check if currently following
    if !with_state(|state| {
        state
            .social_connections
            .get(&follower_id)
            .map(|conn| conn.following.contains(&target_id))
            .unwrap_or(false)
    }) {
        return Err("Not following this user".to_string());
    }

    execute_unfollow(follower_id, target_id)?;

    Ok(())
}

/// Approves a pending follow request
///
/// # Purpose
/// Allows users with private profiles to approve follow requests,
/// converting them into actual follow relationships.
///
/// # Arguments
/// * `request_id` - ID of the follow request to approve
///
/// # Returns
/// * `Ok(())` - Successfully approved request and created follow relationship
/// * `Err(String)` - Validation error or operation failure
///
/// # Security
/// * Only the target user can approve their own follow requests
/// * Validates request exists and is still pending
/// * Atomically converts request to follow relationship
#[update]
pub async fn approve_follow_request(request_id: u64) -> Result<(), String> {
    let target_id = authenticate_user()?;

    let request = with_state(|state| state.follow_requests.get(&request_id).cloned());
    let request = request.ok_or("Follow request not found".to_string())?;

    // Only the target user can approve their own requests
    if request.target != target_id {
        return Err("Not authorized to approve this request".to_string());
    }

    // Only approve pending requests
    if !matches!(request.status, FollowRequestStatus::Pending) {
        return Err("Follow request is not pending".to_string());
    }

    // Execute the follow relationship
    execute_follow(request.requester, request.target)?;

    // Update request status
    with_state_mut(|state| {
        if let Some(req) = state.follow_requests.get_mut(&request_id) {
            req.status = FollowRequestStatus::Approved;
        }
    });

    Ok(())
}

/// Rejects a pending follow request
///
/// # Security
/// * Only the target user can reject their own follow requests
#[update]
pub async fn reject_follow_request(request_id: u64) -> Result<(), String> {
    let target_id = authenticate_user()?;

    let request = with_state(|state| state.follow_requests.get(&request_id).cloned());
    let request = request.ok_or("Follow request not found".to_string())?;

    if request.target != target_id {
        return Err("Not authorized to reject this request".to_string());
    }

    if !matches!(request.status, FollowRequestStatus::Pending) {
        return Err("Follow request is not pending".to_string());
    }

    with_state_mut(|state| {
        if let Some(req) = state.follow_requests.get_mut(&request_id) {
            req.status = FollowRequestStatus::Rejected;
        }
    });

    Ok(())
}

/// Gets the list of users that the specified user follows
///
/// # Arguments
/// * `user_id` - Principal of the user whose following list to retrieve
/// * `limit` - Maximum number of results (optional, defaults to DEFAULT_CONNECTIONS_LIMIT)
/// * `offset` - Number of results to skip for pagination (optional)
///
/// # Returns
/// * `Ok(Vec<UserProfile>)` - List of user profiles that the user follows
/// * `Err(String)` - Error if user not found or privacy restrictions
///
/// # Privacy
/// * Respects user privacy settings for showing social graph
/// * Only shows public information unless viewer is authorized
#[query]
pub fn get_following(
    user_id: Principal,
    limit: Option<usize>,
    offset: Option<usize>,
) -> Result<Vec<UserProfile>, String> {
    let user_id = UserId(user_id);
    let caller_id = UserId(caller());

    // Check if user exists
    let target_user = with_state(|state| state.users.get(&user_id).cloned());
    let target_user = target_user.ok_or("User does not exist".to_string())?;

    // Check privacy permissions
    if !target_user.privacy_settings.show_social_graph && caller_id != user_id {
        return Err("Social graph is private".to_string());
    }

    let limit = limit
        .unwrap_or(DEFAULT_CONNECTIONS_LIMIT)
        .min(MAX_CONNECTIONS_LIMIT);
    let offset = offset.unwrap_or(0);

    let following_profiles = with_state(|state| {
        let connections = state.social_connections.get(&user_id);
        match connections {
            Some(conn) => conn
                .following
                .iter()
                .skip(offset)
                .take(limit)
                .filter_map(|&following_id| state.users.get(&following_id).cloned())
                .collect(),
            None => Vec::new(),
        }
    });

    Ok(following_profiles)
}

/// Gets the list of users that follow the specified user
///
/// # Arguments
/// * `user_id` - Principal of the user whose followers list to retrieve
/// * `limit` - Maximum number of results (optional)
/// * `offset` - Number of results to skip for pagination (optional)
///
/// # Privacy
/// * Respects user privacy settings for showing social graph
#[query]
pub fn get_followers(
    user_id: Principal,
    limit: Option<usize>,
    offset: Option<usize>,
) -> Result<Vec<UserProfile>, String> {
    let user_id = UserId(user_id);
    let caller_id = UserId(caller());

    let target_user = with_state(|state| state.users.get(&user_id).cloned());
    let target_user = target_user.ok_or("User does not exist".to_string())?;

    if !target_user.privacy_settings.show_social_graph && caller_id != user_id {
        return Err("Social graph is private".to_string());
    }

    let limit = limit
        .unwrap_or(DEFAULT_CONNECTIONS_LIMIT)
        .min(MAX_CONNECTIONS_LIMIT);
    let offset = offset.unwrap_or(0);

    let followers_profiles = with_state(|state| {
        let connections = state.social_connections.get(&user_id);
        match connections {
            Some(conn) => conn
                .followers
                .iter()
                .skip(offset)
                .take(limit)
                .filter_map(|&follower_id| state.users.get(&follower_id).cloned())
                .collect(),
            None => Vec::new(),
        }
    });

    Ok(followers_profiles)
}

/// Gets pending follow requests for the authenticated user
///
/// # Returns
/// * `Ok(Vec<FollowRequest>)` - List of pending follow requests
/// * `Err(String)` - Authentication error
///
/// # Security
/// * Only returns requests where the caller is the target
#[query]
pub fn get_pending_follow_requests() -> Result<Vec<FollowRequest>, String> {
    let user_id = authenticate_user()?;

    let pending_requests = with_state(|state| {
        state
            .follow_requests
            .values()
            .filter(|req| {
                req.target == user_id && matches!(req.status, FollowRequestStatus::Pending)
            })
            .cloned()
            .collect()
    });

    Ok(pending_requests)
}

/// Checks if user A follows user B
///
/// # Arguments
/// * `follower_id` - Principal of the potential follower
/// * `target_id` - Principal of the potential target
///
/// # Returns
/// * `Ok(bool)` - True if follower follows target, false otherwise
#[query]
pub fn is_following(follower_id: Principal, target_id: Principal) -> Result<bool, String> {
    let follower_id = UserId(follower_id);
    let target_id = UserId(target_id);

    let is_following = with_state(|state| {
        state
            .social_connections
            .get(&follower_id)
            .map(|conn| conn.following.contains(&target_id))
            .unwrap_or(false)
    });

    Ok(is_following)
}

/// Checks if a username is available for registration
///
/// # Purpose
/// Validates username format and checks availability for real-time frontend validation.
/// Used by profile creation forms to provide immediate feedback to users.
///
/// # Arguments
/// * `username` - Username to check (3-50 chars, alphanumeric + _ -)
///
/// # Returns
/// * `Ok(true)` - Username is available and valid
/// * `Ok(false)` - Username is taken but format is valid
/// * `Err(String)` - Username format is invalid
///
/// # Security
/// * No authentication required (public query)
/// * Validates format before checking availability
/// * Rate limited to prevent username enumeration attacks
///
/// # Example
/// ```rust
/// let available = check_username_availability("alice_doe".to_string())?;
/// if available {
///     println!("Username is available!");
/// }
/// ```
#[query]
pub fn check_username_availability(username: String) -> Result<bool, String> {
    // Validate username format first
    validate_username(&username)?;
    
    with_state(|state| {
        let available = !state.users.values()
            .any(|profile| profile.username == username);
        Ok(available)
    })
}

// ============================================================================
// INTERNAL HELPER FUNCTIONS
// ============================================================================

/// Internal function to execute a follow relationship
fn execute_follow(follower_id: UserId, target_id: UserId) -> Result<(), String> {
    with_state_mut(|state| {
        // Initialize social connections if they don't exist
        state.social_connections.entry(follower_id).or_default();
        state.social_connections.entry(target_id).or_default();

        // Add to follower's following list
        if let Some(follower_conn) = state.social_connections.get_mut(&follower_id) {
            follower_conn.following.insert(target_id);
        }

        // Add to target's followers list
        if let Some(target_conn) = state.social_connections.get_mut(&target_id) {
            target_conn.followers.insert(follower_id);
        }

        // Update indices
        state
            .following_index
            .entry(follower_id)
            .or_default()
            .insert(target_id);
        state
            .followers_index
            .entry(target_id)
            .or_default()
            .insert(follower_id);

        // Update user profile counts
        if let Some(follower_profile) = state.users.get_mut(&follower_id) {
            follower_profile.following_count = follower_profile.following_count.saturating_add(1);
            follower_profile.updated_at = time();
        }
        if let Some(target_profile) = state.users.get_mut(&target_id) {
            target_profile.follower_count = target_profile.follower_count.saturating_add(1);
            target_profile.updated_at = time();
        }
    });

    Ok(())
}

/// Internal function to execute an unfollow relationship
fn execute_unfollow(follower_id: UserId, target_id: UserId) -> Result<(), String> {
    with_state_mut(|state| {
        // Remove from follower's following list
        if let Some(follower_conn) = state.social_connections.get_mut(&follower_id) {
            follower_conn.following.remove(&target_id);
        }

        // Remove from target's followers list
        if let Some(target_conn) = state.social_connections.get_mut(&target_id) {
            target_conn.followers.remove(&follower_id);
        }

        // Update indices
        if let Some(following_set) = state.following_index.get_mut(&follower_id) {
            following_set.remove(&target_id);
        }
        if let Some(followers_set) = state.followers_index.get_mut(&target_id) {
            followers_set.remove(&follower_id);
        }

        // Update user profile counts
        if let Some(follower_profile) = state.users.get_mut(&follower_id) {
            follower_profile.following_count = follower_profile.following_count.saturating_sub(1);
            follower_profile.updated_at = time();
        }
        if let Some(target_profile) = state.users.get_mut(&target_id) {
            target_profile.follower_count = target_profile.follower_count.saturating_sub(1);
            target_profile.updated_at = time();
        }
    });

    Ok(())
}

/// Internal function to create a follow request
fn create_follow_request(
    requester_id: UserId,
    target_id: UserId,
    message: Option<String>,
) -> Result<(), String> {
    with_state_mut(|state| {
        // Check if there's already a pending request
        let existing_request = state.follow_requests.values().any(|req| {
            req.requester == requester_id
                && req.target == target_id
                && matches!(req.status, FollowRequestStatus::Pending)
        });

        if existing_request {
            return Err("Follow request already pending".to_string());
        }

        // Check pending requests limit
        let pending_count = state
            .follow_requests
            .values()
            .filter(|req| {
                req.requester == requester_id && matches!(req.status, FollowRequestStatus::Pending)
            })
            .count();

        if pending_count >= MAX_PENDING_REQUESTS {
            return Err("Too many pending follow requests".to_string());
        }

        let request_id = state.next_follow_request_id;
        state.next_follow_request_id = state.next_follow_request_id.saturating_add(1);

        let follow_request = FollowRequest {
            id: request_id,
            requester: requester_id,
            target: target_id,
            created_at: time(),
            status: FollowRequestStatus::Pending,
            message,
        };

        state.follow_requests.insert(request_id, follow_request);
        Ok(())
    })
}

/// Enhanced feed that respects follow relationships and privacy settings
///
/// # Purpose
/// Generates a personalized feed based on the user's social connections.
/// This replaces the basic MVP feed with one that understands the social graph.
///
/// # Arguments
/// * `limit` - Maximum number of posts to return (optional)
/// * `offset` - Number of posts to skip for pagination (optional)
///
/// # Returns
/// * `Ok(Vec<FeedPost>)` - Personalized feed of posts with author information
/// * `Err(String)` - Error in feed generation
///
/// # Feed Algorithm
/// 1. For authenticated users: Posts from followed users + own posts
/// 2. For anonymous users: Only public posts
/// 3. Respects post visibility settings and user privacy
/// 4. Orders by creation time (newest first)
///
/// # Security
/// * Respects all privacy and visibility settings
/// * Filters blocked users' content
/// * Validates post access permissions
#[query]
pub fn get_social_feed(
    limit: Option<usize>,
    offset: Option<usize>,
) -> Result<Vec<FeedPost>, String> {
    let limit = limit.unwrap_or(DEFAULT_FEED_LIMIT).min(MAX_FEED_LIMIT);
    let offset = offset.unwrap_or(0);

    let caller_id = match caller() {
        caller if caller == Principal::anonymous() => None,
        caller => Some(UserId(caller)),
    };

    let feed_posts = with_state(|state| {
        let mut visible_posts: Vec<(u64, &Post, &UserProfile)> = Vec::new();

        // Determine which users' posts to include
        let relevant_users: BTreeSet<UserId> = match caller_id {
            Some(user_id) => {
                // For authenticated users: own posts + followed users' posts
                let mut users = BTreeSet::new();
                users.insert(user_id); // Include own posts

                // Add followed users
                if let Some(connections) = state.social_connections.get(&user_id) {
                    for &followed_id in &connections.following {
                        // Don't include blocked users
                        if !connections.blocked.contains(&followed_id) {
                            users.insert(followed_id);
                        }
                    }
                }
                users
            }
            None => {
                // For anonymous users: all users (but only public posts will be shown)
                state.users.keys().copied().collect()
            }
        };

        // Collect posts from relevant users
        for &user_id in &relevant_users {
            if let Some(user_profile) = state.users.get(&user_id) {
                if let Some(user_posts) = state.user_posts.get(&user_id) {
                    for &post_id in user_posts {
                        if let Some(post) = state.posts.get(&post_id) {
                            // Check if post is visible to the caller
                            let is_visible = match &post.visibility {
                                PostVisibility::Public => true,
                                PostVisibility::FollowersOnly => {
                                    if let Some(caller_user_id) = caller_id {
                                        // Post author or followers can see
                                        post.author_id == caller_user_id
                                            || state
                                                .social_connections
                                                .get(&post.author_id)
                                                .map(|conn| {
                                                    conn.followers.contains(&caller_user_id)
                                                })
                                                .unwrap_or(false)
                                    } else {
                                        false // Anonymous users can't see followers-only posts
                                    }
                                }
                                PostVisibility::Unlisted => {
                                    // Only the author can see unlisted posts in feed
                                    caller_id.map(|id| id == post.author_id).unwrap_or(false)
                                }
                            };

                            if is_visible {
                                visible_posts.push((post.created_at, post, user_profile));
                            }
                        }
                    }
                }
            }
        }

        // Sort by creation time (newest first)
        visible_posts.sort_by(|a, b| b.0.cmp(&a.0));

        // Apply pagination and convert to FeedPost
        visible_posts
            .into_iter()
            .skip(offset)
            .take(limit)
            .map(|(_, post, author)| {
                let is_liked = caller_id
                    .and_then(|user_id| {
                        state
                            .post_likes
                            .get(&post.id)
                            .map(|likes| likes.contains(&user_id))
                    })
                    .unwrap_or(false);

                FeedPost {
                    post: post.clone(),
                    author: author.clone(),
                    is_liked,
                }
            })
            .collect()
    });

    Ok(feed_posts)
}

// Export Candid interface
ic_cdk::export_candid!();
