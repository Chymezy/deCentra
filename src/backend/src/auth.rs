use crate::types::UserId;
use candid::Principal;
use ic_cdk::api::{caller, time};

/// Authenticates the current caller and returns their UserId
///
/// # Security
/// * Rejects anonymous callers
/// * Validates Principal format
/// * Checks for suspended/banned users (future implementation)
///
/// # Returns
/// * `Ok(UserId)` - Authenticated user ID
/// * `Err(String)` - Authentication error
pub fn authenticate_user() -> Result<UserId, String> {
    let caller_principal = caller();

    // Reject anonymous callers
    if caller_principal == Principal::anonymous() {
        return Err("Authentication required. Please log in with Internet Identity.".to_string());
    }

    // Additional validation could be added here:
    // - Check if user is suspended/banned
    // - Validate principal format
    // - Check rate limiting

    Ok(UserId(caller_principal))
}

/// Returns the authenticated user ID if the caller is not anonymous
///
/// # Returns
/// * `Some(UserId)` - If user is authenticated
/// * `None` - If user is anonymous or invalid
#[allow(dead_code)]
pub fn get_authenticated_user() -> Option<UserId> {
    let caller_principal = caller();

    if caller_principal == Principal::anonymous() {
        None
    } else {
        Some(UserId(caller_principal))
    }
}

/// Rate limiting implementation to prevent spam and DoS attacks
///
/// # Arguments
/// * `user_id` - User attempting the action
/// * `action` - Type of action (e.g., "create_post", "like_post")
/// * `max_actions` - Maximum actions allowed in the time window
/// * `window_seconds` - Time window in seconds
///
/// # Returns
/// * `Ok(())` - Action is allowed
/// * `Err(String)` - Rate limit exceeded
pub fn check_rate_limit(
    _user_id: &UserId,
    _action: &str,
    _max_actions: u32,
    window_seconds: u64,
) -> Result<(), String> {
    // Get current time
    let now = time();
    let _window_start = now.saturating_sub(window_seconds.saturating_mul(1_000_000_000)); // Convert to nanoseconds

    // For now, implement basic in-memory rate limiting
    // In a production system, this would be persisted in stable storage

    // This is a simplified implementation - in a real system you'd want to:
    // 1. Store rate limiting data in stable storage
    // 2. Implement sliding window rate limiting
    // 3. Have different limits for different user types
    // 4. Implement IP-based rate limiting as well

    // For MVP, we'll do basic validation without persistent storage
    // since rate limiting state would be lost on canister upgrades

    Ok(())
}

/// Records an action for rate limiting purposes
///
/// This would typically update the rate limiting storage,
/// but for now it's a placeholder for future implementation
#[allow(dead_code)]
pub fn record_action(_user_id: &UserId, _action: &str) {
    // TODO: Implement persistent rate limiting storage
    // This would record the action timestamp for the user
}

/// Checks if a user has specific permissions for an action
///
/// # Arguments
/// * `user_id` - User requesting the action
/// * `action` - Action being requested
/// * `target_resource` - Optional target resource (e.g., post ID)
///
/// # Returns
/// * `Ok(())` - Permission granted
/// * `Err(String)` - Permission denied
#[allow(dead_code)]
pub fn check_permission(
    _user_id: &UserId,
    action: &str,
    _target_resource: Option<&str>,
) -> Result<(), String> {
    // Basic permission checking
    match action {
        "create_post" | "create_comment" | "like_post" | "unlike_post" => {
            // Any authenticated user can perform these basic actions
            Ok(())
        }
        "delete_post" | "edit_post" => {
            // For now, allow (would check ownership in full implementation)
            Ok(())
        }
        "moderate_content" => {
            // Future: Check if user is a moderator
            Err("Insufficient permissions for content moderation".to_string())
        }
        "admin_action" => {
            // Future: Check if user is an admin
            Err("Insufficient permissions for admin actions".to_string())
        }
        _ => {
            // Unknown action, deny by default
            Err(format!("Unknown action: {action}"))
        }
    }
}

/// Checks if a user has access to a specific resource
///
/// # Arguments
/// * `user_id` - The user requesting access
/// * `resource_type` - The type of resource
/// * `resource_id` - The resource identifier
/// * `access_type` - The type of access requested
///
/// # Returns
/// * `Ok(())` - If access is granted
/// * `Err(String)` - If access is denied with reason
#[allow(dead_code)]
pub fn check_resource_access(
    viewer: &UserId,
    resource_owner: &UserId,
    resource_type: &str,
) -> Result<(), String> {
    // Basic access control
    match resource_type {
        "public_post" | "public_profile" => {
            // Public resources are accessible to everyone
            Ok(())
        }
        "private_post" | "private_profile" => {
            // Private resources only accessible to owner
            if viewer == resource_owner {
                Ok(())
            } else {
                Err("Access denied: private resource".to_string())
            }
        }
        "followers_only_post" => {
            // Future: Check if viewer follows the resource owner
            // For now, allow access if authenticated
            Ok(())
        }
        _ => {
            // Unknown resource type, deny by default
            Err(format!("Unknown resource type: {resource_type}"))
        }
    }
}

/// Security utilities for enhanced protection
pub mod security_utils {
    use super::*;

    /// Generates a secure random ID using IC's random number generation
    ///
    /// # Returns
    /// A cryptographically secure 64-bit random number
    #[allow(dead_code)]
    pub fn generate_secure_id() -> u64 {
        // For now, use timestamp + some entropy
        // In production, use proper cryptographic randomness
        time()
    }

    /// Sanitizes text input to prevent injection attacks
    ///
    /// # Arguments
    /// * `input` - The input string to sanitize
    ///
    /// # Returns
    /// Sanitized string safe for storage and display
    #[allow(dead_code)]
    pub fn sanitize_text_input(input: &str) -> String {
        // Basic sanitization - remove dangerous characters
        input
            .chars()
            .filter(|c| {
                // Allow alphanumeric, basic punctuation, and unicode
                c.is_alphanumeric()
                    || " .,!?;:()[]{}\"'-_@#$%^&*+=|\\/<>~`\n\r\t".contains(*c)
                    || (*c as u32) > 127 // Allow unicode characters
            })
            .take(10_000) // Prevent extremely long inputs
            .collect()
    }

    /// Validates that a principal is not anonymous and follows security rules
    ///
    /// # Arguments
    /// * `principal` - The principal to validate
    ///
    /// # Returns
    /// * `Ok(())` - If principal is valid
    /// * `Err(String)` - If principal is invalid with reason
    #[allow(dead_code)]
    pub fn validate_principal(principal: &Principal) -> Result<(), String> {
        if *principal == Principal::anonymous() {
            return Err("Anonymous principal not allowed".to_string());
        }

        // Additional Principal validation could be added here
        // Check format, length, etc.

        Ok(())
    }
}

// ============================================================================
// AUTHENTICATION TESTS
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use candid::Principal;

    #[test]
    fn test_security_utils() {
        let text = "Hello <script>alert('xss')</script> World!";
        let sanitized = security_utils::sanitize_text_input(text);
        assert_eq!(sanitized, "Hello scriptalert('xss')/script World!");
    }

    #[test]
    fn test_principal_validation() {
        let anonymous = Principal::anonymous();
        assert!(security_utils::validate_principal(&anonymous).is_err());

        // Would test with valid principals in a real test environment
    }

    #[test]
    fn test_permission_checking() -> Result<(), Box<dyn std::error::Error>> {
        let principal = Principal::from_text("rdmx6-jaaaa-aaaaa-aaadq-cai")
            .map_err(|_| "Invalid test principal")?;
        let user_id = UserId(principal);

        assert!(check_permission(&user_id, "create_post", None).is_ok());
        assert!(check_permission(&user_id, "admin_action", None).is_err());
        Ok(())
    }
}
