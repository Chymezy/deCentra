use crate::types::{CommentId, PostId, UserId};
use candid::{CandidType, Deserialize};

/// Comprehensive error types for deCentra social network features
#[derive(Debug, Clone, CandidType, Deserialize)]
pub enum SocialNetworkError {
    // ============================================================================
    // AUTHENTICATION & AUTHORIZATION ERRORS
    // ============================================================================
    /// User is not authenticated (anonymous caller)
    AuthenticationRequired,

    /// User lacks permission for the requested action
    Unauthorized(String),

    /// Invalid or malformed identity
    IdentityInvalid,

    /// User account is suspended or banned
    AccountSuspended(String),

    // ============================================================================
    // USER MANAGEMENT ERRORS
    // ============================================================================
    /// Requested user profile not found
    UserNotFound(UserId),

    /// Username is already taken by another user
    UsernameAlreadyTaken(String),

    /// User already has a profile (duplicate creation attempt)
    ProfileAlreadyExists,

    /// Username doesn't meet validation requirements
    InvalidUsername(String),

    /// Display name doesn't meet requirements
    InvalidDisplayName(String),

    /// Bio content doesn't meet requirements
    InvalidBio(String),

    /// Avatar content doesn't meet requirements
    InvalidAvatar(String),

    // ============================================================================
    // CONTENT MANAGEMENT ERRORS
    // ============================================================================
    /// Requested post not found
    PostNotFound(PostId),

    /// Post content exceeds maximum length
    ContentTooLong { max: usize, actual: usize },

    /// Post content is empty or only whitespace
    ContentEmpty,

    /// Post content contains prohibited material
    ContentProhibited(String),

    /// Media URL is invalid or from untrusted source
    InvalidMediaUrl(String),

    /// Content is flagged and under review
    ContentUnderReview,

    /// Content has been removed by moderation
    ContentRemoved(String),

    // ============================================================================
    // COMMENT SYSTEM ERRORS
    // ============================================================================
    /// Requested comment not found
    CommentNotFound(CommentId),

    /// Comment content doesn't meet requirements
    InvalidCommentContent(String),

    /// Comment threading depth exceeded
    CommentDepthExceeded,

    /// Comments disabled for this post
    CommentsDisabled,

    // ============================================================================
    // SOCIAL INTERACTION ERRORS
    // ============================================================================
    /// User attempting to follow themselves
    CannotFollowSelf,

    /// User is already following the target user
    AlreadyFollowing(UserId),

    /// User is not following the target user
    NotFollowing(UserId),

    /// Target user has blocked the current user
    UserBlocked(UserId),

    /// Privacy settings prevent this action
    PrivacyRestriction(String),

    /// User already liked this post
    AlreadyLiked,

    /// User hasn't liked this post (cannot unlike)
    NotLiked,

    // ============================================================================
    // RATE LIMITING & RESOURCE PROTECTION ERRORS
    // ============================================================================
    /// Rate limit exceeded for this action
    RateLimitExceeded {
        limit: u32,
        window_seconds: u64,
        retry_after: u64,
    },

    /// System resource limit exceeded
    ResourceLimitExceeded(String),

    /// Batch operation size too large
    BatchSizeTooLarge { max: usize, requested: usize },

    /// Storage quota exceeded
    StorageQuotaExceeded,

    /// Cycle limit exceeded
    CycleLimitExceeded,

    // ============================================================================
    // CONTENT MODERATION ERRORS
    // ============================================================================
    /// Content has been flagged by community
    ContentFlagged(String),

    /// Spam detection triggered
    SpamDetected(String),

    /// Malicious content detected
    MaliciousContentDetected(String),

    /// Moderation proposal not found
    ModerationProposalNotFound(String),

    /// User lacks moderation permissions
    InsufficientModerationRights,

    // ============================================================================
    // MONETIZATION ERRORS
    // ============================================================================
    /// Insufficient balance for transaction
    InsufficientBalance { required: u64, available: u64 },

    /// Invalid tip amount
    InvalidTipAmount(String),

    /// Tip transaction failed
    TipTransactionFailed(String),

    /// Subscription not found
    SubscriptionNotFound(String),

    /// Payment processing error
    PaymentError(String),

    // ============================================================================
    // SYSTEM & TECHNICAL ERRORS
    // ============================================================================
    /// Internal state corruption detected
    StateCorrupted(String),

    /// Storage operation failed
    StorageError(String),

    /// Invalid request format or parameters
    InvalidRequest(String),

    /// Network or external service error
    NetworkError(String),

    /// Canister upgrade in progress
    UpgradeInProgress,

    /// Feature not yet implemented
    NotImplemented(String),

    /// Generic internal error
    InternalError(String),
}

impl From<SocialNetworkError> for String {
    fn from(error: SocialNetworkError) -> String {
        match error {
            // Authentication & Authorization
            SocialNetworkError::AuthenticationRequired => {
                "Authentication required. Please log in with Internet Identity.".to_string()
            }
            SocialNetworkError::Unauthorized(msg) => format!("Unauthorized: {msg}"),
            SocialNetworkError::IdentityInvalid => {
                "Invalid identity. Please try logging in again.".to_string()
            }
            SocialNetworkError::AccountSuspended(reason) => {
                format!("Account suspended: {reason}")
            }

            // User Management
            SocialNetworkError::UserNotFound(user_id) => {
                format!("User not found: {}", user_id.0.to_text())
            }
            SocialNetworkError::UsernameAlreadyTaken(username) => {
                format!("Username '{username}' is already taken")
            }
            SocialNetworkError::ProfileAlreadyExists => "User profile already exists".to_string(),
            SocialNetworkError::InvalidUsername(msg) => format!("Invalid username: {msg}"),
            SocialNetworkError::InvalidDisplayName(msg) => format!("Invalid display name: {msg}"),
            SocialNetworkError::InvalidBio(msg) => format!("Invalid bio: {msg}"),
            SocialNetworkError::InvalidAvatar(msg) => format!("Invalid avatar: {msg}"),

            // Content Management
            SocialNetworkError::PostNotFound(post_id) => format!("Post not found: {}", post_id.0),
            SocialNetworkError::ContentTooLong { max, actual } => {
                format!("Content too long: {actual} characters (max: {max})")
            }
            SocialNetworkError::ContentEmpty => "Content cannot be empty".to_string(),
            SocialNetworkError::ContentProhibited(reason) => {
                format!("Content prohibited: {reason}")
            }
            SocialNetworkError::InvalidMediaUrl(url) => format!("Invalid media URL: {url}"),
            SocialNetworkError::ContentUnderReview => {
                "Content is under moderation review".to_string()
            }
            SocialNetworkError::ContentRemoved(reason) => format!("Content removed: {reason}"),

            // Comment System
            SocialNetworkError::CommentNotFound(comment_id) => {
                format!("Comment not found: {}", comment_id.0)
            }
            SocialNetworkError::InvalidCommentContent(msg) => format!("Invalid comment: {msg}"),
            SocialNetworkError::CommentDepthExceeded => {
                "Comment threading depth exceeded".to_string()
            }
            SocialNetworkError::CommentsDisabled => {
                "Comments are disabled for this post".to_string()
            }

            // Social Interactions
            SocialNetworkError::CannotFollowSelf => "Cannot follow yourself".to_string(),
            SocialNetworkError::AlreadyFollowing(user_id) => {
                format!("Already following user: {}", user_id.0.to_text())
            }
            SocialNetworkError::NotFollowing(user_id) => {
                format!("Not following user: {}", user_id.0.to_text())
            }
            SocialNetworkError::UserBlocked(user_id) => {
                format!("User has blocked you: {}", user_id.0.to_text())
            }
            SocialNetworkError::PrivacyRestriction(msg) => format!("Privacy restriction: {msg}"),
            SocialNetworkError::AlreadyLiked => "Already liked this post".to_string(),
            SocialNetworkError::NotLiked => "Haven't liked this post".to_string(),

            // Rate Limiting & Resources
            SocialNetworkError::RateLimitExceeded {
                limit,
                window_seconds,
                retry_after,
            } => format!(
                "Rate limit exceeded: {limit} actions per {window_seconds} seconds. Try again in {retry_after} seconds."
            ),
            SocialNetworkError::ResourceLimitExceeded(resource) => {
                format!("Resource limit exceeded: {resource}")
            }
            SocialNetworkError::BatchSizeTooLarge { max, requested } => {
                format!("Batch size too large: {requested} items (max: {max})")
            }
            SocialNetworkError::StorageQuotaExceeded => "Storage quota exceeded".to_string(),
            SocialNetworkError::CycleLimitExceeded => {
                "Cycle limit exceeded. Please try again later.".to_string()
            }

            // Content Moderation
            SocialNetworkError::ContentFlagged(reason) => format!("Content flagged: {reason}"),
            SocialNetworkError::SpamDetected(reason) => format!("Spam detected: {reason}"),
            SocialNetworkError::MaliciousContentDetected(reason) => {
                format!("Malicious content detected: {reason}")
            }
            SocialNetworkError::ModerationProposalNotFound(id) => {
                format!("Moderation proposal not found: {id}")
            }
            SocialNetworkError::InsufficientModerationRights => {
                "Insufficient moderation rights".to_string()
            }

            // Monetization
            SocialNetworkError::InsufficientBalance {
                required,
                available,
            } => {
                // Allow precision loss for ICP balance display (acceptable trade-off)
                #[allow(clippy::cast_precision_loss)]
                let required_icp = required as f64 / 100_000_000.0;
                #[allow(clippy::cast_precision_loss)]
                let available_icp = available as f64 / 100_000_000.0;
                format!(
                    "Insufficient balance: need {required_icp:.8} ICP, have {available_icp:.8} ICP"
                )
            }
            SocialNetworkError::InvalidTipAmount(msg) => format!("Invalid tip amount: {msg}"),
            SocialNetworkError::TipTransactionFailed(reason) => {
                format!("Tip transaction failed: {reason}")
            }
            SocialNetworkError::SubscriptionNotFound(id) => {
                format!("Subscription not found: {id}")
            }
            SocialNetworkError::PaymentError(msg) => format!("Payment error: {msg}"),

            // System & Technical
            SocialNetworkError::StateCorrupted(msg) => format!("System state corrupted: {msg}"),
            SocialNetworkError::StorageError(msg) => format!("Storage error: {msg}"),
            SocialNetworkError::InvalidRequest(msg) => format!("Invalid request: {msg}"),
            SocialNetworkError::NetworkError(msg) => format!("Network error: {msg}"),
            SocialNetworkError::UpgradeInProgress => {
                "System upgrade in progress. Please try again later.".to_string()
            }
            SocialNetworkError::NotImplemented(feature) => {
                format!("Feature not yet implemented: {feature}")
            }
            SocialNetworkError::InternalError(msg) => format!("Internal error: {msg}"),
        }
    }
}

/// Result type alias for cleaner error handling
#[allow(dead_code)]
pub type SocialResult<T> = Result<T, SocialNetworkError>;

/// Error categorization for metrics and monitoring
#[derive(Debug, Clone, CandidType, Deserialize)]
pub enum ErrorCategory {
    Authentication,
    Authorization,
    Validation,
    RateLimit,
    ContentModeration,
    System,
    Network,
    Business,
}

impl SocialNetworkError {
    /// Categorizes errors for metrics and monitoring
    pub fn category(&self) -> ErrorCategory {
        match self {
            SocialNetworkError::AuthenticationRequired | SocialNetworkError::IdentityInvalid => {
                ErrorCategory::Authentication
            }

            SocialNetworkError::Unauthorized(_)
            | SocialNetworkError::InsufficientModerationRights
            | SocialNetworkError::PrivacyRestriction(_) => ErrorCategory::Authorization,

            SocialNetworkError::InvalidUsername(_)
            | SocialNetworkError::InvalidDisplayName(_)
            | SocialNetworkError::InvalidBio(_)
            | SocialNetworkError::InvalidAvatar(_)
            | SocialNetworkError::ContentTooLong { .. }
            | SocialNetworkError::ContentEmpty
            | SocialNetworkError::InvalidCommentContent(_)
            | SocialNetworkError::InvalidMediaUrl(_)
            | SocialNetworkError::InvalidRequest(_) => ErrorCategory::Validation,

            SocialNetworkError::RateLimitExceeded { .. }
            | SocialNetworkError::ResourceLimitExceeded(_)
            | SocialNetworkError::BatchSizeTooLarge { .. }
            | SocialNetworkError::CycleLimitExceeded => ErrorCategory::RateLimit,

            SocialNetworkError::ContentFlagged(_)
            | SocialNetworkError::SpamDetected(_)
            | SocialNetworkError::MaliciousContentDetected(_)
            | SocialNetworkError::ContentProhibited(_)
            | SocialNetworkError::ContentUnderReview
            | SocialNetworkError::ContentRemoved(_) => ErrorCategory::ContentModeration,

            SocialNetworkError::StateCorrupted(_)
            | SocialNetworkError::StorageError(_)
            | SocialNetworkError::InternalError(_)
            | SocialNetworkError::UpgradeInProgress => ErrorCategory::System,

            SocialNetworkError::NetworkError(_) => ErrorCategory::Network,

            _ => ErrorCategory::Business,
        }
    }

    /// Checks if error is retryable
    pub fn is_retryable(&self) -> bool {
        matches!(
            self,
            SocialNetworkError::RateLimitExceeded { .. }
                | SocialNetworkError::NetworkError(_)
                | SocialNetworkError::CycleLimitExceeded
                | SocialNetworkError::UpgradeInProgress
        )
    }

    /// Gets suggested retry delay in seconds
    pub fn retry_delay(&self) -> Option<u64> {
        match self {
            SocialNetworkError::RateLimitExceeded { retry_after, .. } => Some(*retry_after),
            SocialNetworkError::CycleLimitExceeded => Some(5),
            SocialNetworkError::NetworkError(_) => Some(10),
            SocialNetworkError::UpgradeInProgress => Some(30),
            _ => None,
        }
    }
}

// ============================================================================
// ERROR UTILITY FUNCTIONS
// ============================================================================

/// Creates a validation error with context
#[allow(dead_code)]
pub fn validation_error(field: &str, message: &str) -> SocialNetworkError {
    SocialNetworkError::InvalidRequest(format!("{field}: {message}"))
}

/// Creates a permission error with context
#[allow(dead_code)]
pub fn permission_error(action: &str, reason: &str) -> SocialNetworkError {
    SocialNetworkError::Unauthorized(format!("Cannot {action}: {reason}"))
}

/// Creates a resource not found error
#[allow(dead_code)]
pub fn not_found_error(resource: &str, id: &str) -> SocialNetworkError {
    SocialNetworkError::InvalidRequest(format!("{resource} not found: {id}"))
}

// ============================================================================
// ERROR TESTS
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_conversion() {
        let error = SocialNetworkError::AuthenticationRequired;
        let message: String = error.into();
        assert!(message.contains("Authentication required"));
    }

    #[test]
    fn test_error_categorization() {
        let auth_error = SocialNetworkError::AuthenticationRequired;
        assert!(matches!(
            auth_error.category(),
            ErrorCategory::Authentication
        ));

        let validation_error = SocialNetworkError::ContentEmpty;
        assert!(matches!(
            validation_error.category(),
            ErrorCategory::Validation
        ));
    }

    #[test]
    fn test_retryable_errors() {
        let rate_limit_error = SocialNetworkError::RateLimitExceeded {
            limit: 10,
            window_seconds: 60,
            retry_after: 30,
        };
        assert!(rate_limit_error.is_retryable());
        assert_eq!(rate_limit_error.retry_delay(), Some(30));

        let validation_error = SocialNetworkError::ContentEmpty;
        assert!(!validation_error.is_retryable());
        assert_eq!(validation_error.retry_delay(), None);
    }

    #[test]
    fn test_utility_functions() {
        let error = validation_error("username", "too short");
        assert!(matches!(error, SocialNetworkError::InvalidRequest(_)));

        let error = permission_error("delete post", "not owner");
        assert!(matches!(error, SocialNetworkError::Unauthorized(_)));
    }
}
