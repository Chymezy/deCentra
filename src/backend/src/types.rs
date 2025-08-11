use candid::{CandidType, Deserialize, Principal};

// ============================================================================
// STRONG TYPED IDS
// ============================================================================

/// Strongly typed user identifier
#[derive(CandidType, Deserialize, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Debug)]
pub struct UserId(pub Principal);

/// Strongly typed post identifier  
#[derive(CandidType, Deserialize, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Debug)]
pub struct PostId(pub u64);

/// Strongly typed comment identifier
#[derive(CandidType, Deserialize, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Debug)]
pub struct CommentId(pub u64);

// ============================================================================
// USER PROFILE TYPES
// ============================================================================

/// Complete user profile with privacy and social metrics
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct UserProfile {
    /// Unique user identifier (Internet Identity Principal)
    pub id: UserId,

    /// User-chosen display name (3-50 characters)
    pub username: String,

    /// Optional user biography (max 500 characters)
    pub bio: String,

    /// Avatar URL or emoji
    pub avatar: String,

    /// Profile creation timestamp
    pub created_at: u64,

    /// Last profile update timestamp
    pub updated_at: u64,

    /// Number of users following this user
    pub follower_count: u64,

    /// Number of users this user follows
    pub following_count: u64,

    /// Total number of posts created
    pub post_count: u64,

    /// Privacy and visibility settings
    pub privacy_settings: PrivacySettings,

    /// Account verification status
    pub verification_status: VerificationStatus,
}

/// Privacy control settings for user profiles
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct PrivacySettings {
    /// Who can view the user's profile
    pub profile_visibility: ProfileVisibility,

    /// Who can send direct messages
    pub message_privacy: MessagePrivacy,

    /// Whether to show follower/following lists
    pub show_social_graph: bool,

    /// Whether to appear in search results
    pub searchable: bool,
}

impl Default for PrivacySettings {
    fn default() -> Self {
        Self {
            profile_visibility: ProfileVisibility::Public,
            message_privacy: MessagePrivacy::FollowersOnly,
            show_social_graph: true,
            searchable: true,
        }
    }
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum ProfileVisibility {
    Public,        // Anyone can view
    FollowersOnly, // Only followers can view
    Private,       // Only user can view (hidden profile)
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum MessagePrivacy {
    Everyone,      // Anyone can message
    FollowersOnly, // Only followers can message
    Nobody,        // No direct messages allowed
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum VerificationStatus {
    Unverified,    // Regular user
    Verified,      // Verified identity (blue checkmark)
    Organization,  // Verified organization
    Journalist,    // Verified journalist (for whistleblower access)
    Whistleblower, // Anonymous whistleblower account
}

// ============================================================================
// POST TYPES
// ============================================================================

/// Social media post with engagement metrics
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Post {
    /// Unique post identifier
    pub id: PostId,

    /// User who created the post
    pub author_id: UserId,

    /// Post content (1-10,000 characters)
    pub content: String,

    /// Post creation timestamp
    pub created_at: u64,

    /// Last modification timestamp
    pub updated_at: u64,

    /// Number of likes on this post
    pub like_count: u64,

    /// Number of comments on this post
    pub comment_count: u64,

    /// Who can view this post
    pub visibility: PostVisibility,
}

/// Post visibility and privacy controls
#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum PostVisibility {
    /// Anyone can view and interact
    Public,

    /// Only followers can view and interact
    FollowersOnly,

    /// Unlisted - only viewable with direct link, no feed visibility
    Unlisted,
}

/// Enhanced post data including author information for feeds
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct FeedPost {
    /// The post data
    pub post: Post,

    /// Author profile information
    pub author: UserProfile,

    /// Whether the current viewer has liked this post
    pub is_liked: bool,
}

// ============================================================================
// COMMENT TYPES
// ============================================================================

/// Comment on a post
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Comment {
    /// Unique comment identifier
    pub id: CommentId,

    /// Post this comment belongs to
    pub post_id: PostId,

    /// User who created the comment
    pub author_id: UserId,

    /// Comment content (1-500 characters)
    pub content: String,

    /// Comment creation timestamp
    pub created_at: u64,

    /// Last modification timestamp
    pub updated_at: u64,
}

// ============================================================================
// STATISTICS TYPES
// ============================================================================

/// Platform-wide statistics
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct PlatformStats {
    /// Total number of registered users
    pub total_users: u64,

    /// Total number of posts created
    pub total_posts: u64,

    /// Total number of likes across all posts
    pub total_likes: u64,

    /// Total number of comments across all posts
    pub total_comments: u64,
}

// ============================================================================
// SOCIAL NETWORK CONSTANTS
// ============================================================================

/// Maximum post content length (characters)
pub const MAX_POST_CONTENT: usize = 10_000;

/// Minimum post content length (characters)
pub const MIN_POST_CONTENT: usize = 1;

/// Maximum comment content length (characters)
pub const MAX_COMMENT_CONTENT: usize = 500;

/// Minimum comment content length (characters)
pub const MIN_COMMENT_CONTENT: usize = 1;

/// Maximum username length (characters)
pub const MAX_USERNAME_LENGTH: usize = 50;

/// Minimum username length (characters)
pub const MIN_USERNAME_LENGTH: usize = 3;

/// Maximum bio length (characters)
pub const MAX_BIO_LENGTH: usize = 500;

/// Maximum avatar length (characters) - for URLs or long emoji sequences
pub const MAX_AVATAR_LENGTH: usize = 200;

/// Default feed limit for pagination
pub const DEFAULT_FEED_LIMIT: usize = 10;

/// Maximum feed limit to prevent resource exhaustion
pub const MAX_FEED_LIMIT: usize = 50;
