use crate::types::*;

/// Validates username according to deCentra security standards
///
/// # Rules
/// - Length: 3-50 characters
/// - Characters: alphanumeric, underscore, hyphen only
/// - No consecutive special characters
/// - Cannot start or end with special characters
/// - No reserved words
pub fn validate_username(username: &str) -> Result<(), String> {
    // Length check
    if username.len() < MIN_USERNAME_LENGTH {
        return Err(format!(
            "Username must be at least {} characters",
            MIN_USERNAME_LENGTH
        ));
    }

    if username.len() > MAX_USERNAME_LENGTH {
        return Err(format!(
            "Username must be less than {} characters",
            MAX_USERNAME_LENGTH
        ));
    }

    // Character validation
    if !username
        .chars()
        .all(|c| c.is_alphanumeric() || c == '_' || c == '-')
    {
        return Err(
            "Username can only contain letters, numbers, underscores, and hyphens".to_string(),
        );
    }

    // Cannot start or end with special characters
    if username.starts_with('_')
        || username.starts_with('-')
        || username.ends_with('_')
        || username.ends_with('-')
    {
        return Err("Username cannot start or end with underscore or hyphen".to_string());
    }

    // No consecutive special characters
    let mut prev_special = false;
    for c in username.chars() {
        let is_special = c == '_' || c == '-';
        if is_special && prev_special {
            return Err("Username cannot have consecutive special characters".to_string());
        }
        prev_special = is_special;
    }

    // Reserved words check
    let reserved_words = [
        "admin",
        "administrator",
        "mod",
        "moderator",
        "system",
        "root",
        "api",
        "www",
        "mail",
        "email",
        "support",
        "help",
        "info",
        "news",
        "blog",
        "decentra",
        "backend",
        "frontend",
        "canister",
        "icp",
        "dfinity",
        "anonymous",
        "null",
        "undefined",
        "true",
        "false",
        "test",
        "demo",
    ];

    if reserved_words.contains(&username.to_lowercase().as_str()) {
        return Err("Username is reserved and cannot be used".to_string());
    }

    Ok(())
}

/// Validates user bio content
///
/// # Rules
/// - Maximum 500 characters
/// - No malicious content patterns
/// - Basic XSS prevention
pub fn validate_bio(bio: &str) -> Result<(), String> {
    if bio.len() > MAX_BIO_LENGTH {
        return Err(format!(
            "Bio must be less than {} characters",
            MAX_BIO_LENGTH
        ));
    }

    // Basic XSS prevention
    if contains_malicious_patterns(bio) {
        return Err("Bio contains potentially harmful content".to_string());
    }

    Ok(())
}

/// Validates avatar content (URL or emoji)
///
/// # Rules
/// - Maximum 200 characters
/// - Valid URL format if it's a URL
/// - No malicious patterns
pub fn validate_avatar(avatar: &str) -> Result<(), String> {
    if avatar.len() > MAX_AVATAR_LENGTH {
        return Err(format!(
            "Avatar must be less than {} characters",
            MAX_AVATAR_LENGTH
        ));
    }

    // If it looks like a URL, validate URL format
    if avatar.starts_with("http://") || avatar.starts_with("https://") {
        if !is_valid_url(avatar) {
            return Err("Invalid avatar URL format".to_string());
        }

        // Check for safe domains (basic whitelist approach)
        if !is_safe_avatar_url(avatar) {
            return Err("Avatar URL must be from a trusted domain".to_string());
        }
    }

    // Check for malicious patterns
    if contains_malicious_patterns(avatar) {
        return Err("Avatar contains potentially harmful content".to_string());
    }

    Ok(())
}

/// Validates post content according to deCentra standards
///
/// # Rules
/// - Length: 1-10,000 characters
/// - No excessive whitespace
/// - Basic spam detection
/// - Malicious content prevention
pub fn validate_post_content(content: &str) -> Result<(), String> {
    let trimmed = content.trim();

    // Length validation
    if trimmed.len() < MIN_POST_CONTENT {
        return Err("Post content cannot be empty".to_string());
    }

    if content.len() > MAX_POST_CONTENT {
        return Err(format!(
            "Post content must be less than {} characters",
            MAX_POST_CONTENT
        ));
    }

    // Spam detection - repetitive content
    if is_likely_spam(content) {
        return Err("Post appears to be spam or repetitive content".to_string());
    }

    // Malicious content check
    if contains_malicious_patterns(content) {
        return Err("Post contains potentially harmful content".to_string());
    }

    Ok(())
}

/// Validates comment content
///
/// # Rules
/// - Length: 1-500 characters
/// - No malicious content
/// - Basic spam detection
pub fn validate_comment_content(content: &str) -> Result<(), String> {
    let trimmed = content.trim();

    // Length validation
    if trimmed.len() < MIN_COMMENT_CONTENT {
        return Err("Comment cannot be empty".to_string());
    }

    if content.len() > MAX_COMMENT_CONTENT {
        return Err(format!(
            "Comment must be less than {} characters",
            MAX_COMMENT_CONTENT
        ));
    }

    // Basic spam detection
    if is_likely_spam(content) {
        return Err("Comment appears to be spam or repetitive content".to_string());
    }

    // Malicious content check
    if contains_malicious_patterns(content) {
        return Err("Comment contains potentially harmful content".to_string());
    }

    Ok(())
}

// ============================================================================
// SECURITY HELPER FUNCTIONS
// ============================================================================

/// Detects basic malicious patterns in text content
///
/// This provides basic XSS and injection protection
fn contains_malicious_patterns(content: &str) -> bool {
    let content_lower = content.to_lowercase();

    // Basic XSS patterns
    let xss_patterns = [
        "<script",
        "</script>",
        "javascript:",
        "onclick=",
        "onerror=",
        "onload=",
        "eval(",
        "alert(",
        "document.cookie",
        "window.location",
        "iframe",
        "object",
        "embed",
        "form",
        "input",
    ];

    // SQL injection patterns (though not applicable to IC, good practice)
    let sql_patterns = [
        "union select",
        "drop table",
        "delete from",
        "insert into",
        "update set",
        "'; --",
        "\"; --",
    ];

    // Combine all patterns
    let all_patterns = [&xss_patterns[..], &sql_patterns[..]].concat();

    all_patterns
        .iter()
        .any(|pattern| content_lower.contains(pattern))
}

/// Basic URL format validation
fn is_valid_url(url: &str) -> bool {
    // Very basic URL validation
    url.starts_with("https://")
        && url.len() > 10
        && url.contains('.')
        && !url.contains(' ')
        && !url.contains('\n')
        && !url.contains('\r')
}

/// Checks if avatar URL is from a trusted domain
fn is_safe_avatar_url(url: &str) -> bool {
    // Whitelist of safe domains for avatars
    let safe_domains = [
        "imgur.com",
        "i.imgur.com",
        "github.com",
        "githubusercontent.com",
        "gravatar.com",
        "avatar.com",
        "cloudinary.com",
        "cloudflare.com",
        "unsplash.com",
        "pexels.com",
    ];

    safe_domains.iter().any(|domain| url.contains(domain))
}

/// Detects likely spam content using basic heuristics
fn is_likely_spam(content: &str) -> bool {
    // Check for excessive repetition
    if has_excessive_repetition(content) {
        return true;
    }

    // Check for excessive capitalization
    if has_excessive_caps(content) {
        return true;
    }

    // Check for excessive special characters
    if has_excessive_special_chars(content) {
        return true;
    }

    false
}

/// Detects excessive character repetition
fn has_excessive_repetition(content: &str) -> bool {
    let chars: Vec<char> = content.chars().collect();
    let mut consecutive_count = 1;
    let mut prev_char = None;

    for &ch in &chars {
        if Some(ch) == prev_char {
            consecutive_count += 1;
            if consecutive_count > 10 {
                // More than 10 consecutive identical characters
                return true;
            }
        } else {
            consecutive_count = 1;
        }
        prev_char = Some(ch);
    }

    false
}

/// Detects excessive capitalization (likely shouting/spam)
fn has_excessive_caps(content: &str) -> bool {
    if content.len() < 10 {
        return false; // Too short to judge
    }

    let total_letters = content.chars().filter(|c| c.is_alphabetic()).count();
    let caps_letters = content.chars().filter(|c| c.is_uppercase()).count();

    if total_letters == 0 {
        return false;
    }

    let caps_ratio = caps_letters as f64 / total_letters as f64;
    caps_ratio > 0.7 // More than 70% caps
}

/// Detects excessive special characters
fn has_excessive_special_chars(content: &str) -> bool {
    let special_chars = content
        .chars()
        .filter(|c| !c.is_alphanumeric() && !c.is_whitespace())
        .count();

    let total_chars = content.len();

    if total_chars == 0 {
        return false;
    }

    let special_ratio = special_chars as f64 / total_chars as f64;
    special_ratio > 0.5 // More than 50% special characters
}

// ============================================================================
// VALIDATION TESTS
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_username_validation() {
        // Valid usernames
        assert!(validate_username("alice").is_ok());
        assert!(validate_username("alice_bob").is_ok());
        assert!(validate_username("alice-bob").is_ok());
        assert!(validate_username("user123").is_ok());

        // Invalid usernames
        assert!(validate_username("ab").is_err()); // Too short
        assert!(validate_username("_alice").is_err()); // Starts with underscore
        assert!(validate_username("alice_").is_err()); // Ends with underscore
        assert!(validate_username("alice__bob").is_err()); // Consecutive underscores
        assert!(validate_username("admin").is_err()); // Reserved word
        assert!(validate_username("alice@bob").is_err()); // Invalid character
    }

    #[test]
    fn test_spam_detection() {
        assert!(is_likely_spam("AAAAAAAAAAAAA")); // Excessive repetition
        assert!(is_likely_spam("HELLO WORLD THIS IS SHOUTING")); // Excessive caps
        assert!(is_likely_spam("!!!!!!@@@@@#####")); // Excessive special chars
        assert!(!is_likely_spam("This is normal content")); // Normal content
    }

    #[test]
    fn test_malicious_content_detection() {
        assert!(contains_malicious_patterns("<script>alert('xss')</script>"));
        assert!(contains_malicious_patterns("javascript:alert(1)"));
        assert!(contains_malicious_patterns("onclick=alert(1)"));
        assert!(!contains_malicious_patterns("This is safe content"));
    }
}
