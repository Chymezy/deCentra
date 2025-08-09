---
applyTo: "**"
---

# Security Instructions for deCentra

## Social Network Security Patterns

### Authentication & Authorization Framework

```rust
// Comprehensive authentication system for social network
use ic_cdk::api::caller;
use candid::Principal;

// Multi-level authentication system
pub fn authenticate_user() -> Result<UserId, SecurityError> {
    let caller = caller();
    if caller == Principal::anonymous() {
        return Err(SecurityError::AuthenticationRequired);
    }
    
    // Check if user is banned or suspended
    if is_user_suspended(&UserId(caller))? {
        return Err(SecurityError::AccountSuspended);
    }
    
    Ok(UserId(caller))
}

// Role-based authorization for social features
pub enum UserRole {
    Regular,
    Moderator,
    Admin,
    Whistleblower,    // Special anonymous role
}

pub fn authorize_action(
    user_id: &UserId, 
    action: SecurityAction, 
    target: Option<&ResourceId>
) -> Result<(), SecurityError> {
    let user_role = get_user_role(user_id)?;
    
    match action {
        SecurityAction::CreatePost => {
            // Basic users can create posts
            if !is_rate_limited(user_id, "create_post")? {
                Ok(())
            } else {
                Err(SecurityError::RateLimitExceeded)
            }
        }
        SecurityAction::ModerateContent => {
            // Only moderators and admins
            match user_role {
                UserRole::Moderator | UserRole::Admin => Ok(()),
                _ => Err(SecurityError::InsufficientPrivileges),
            }
        }
        SecurityAction::BanUser => {
            // Only admins
            match user_role {
                UserRole::Admin => Ok(()),
                _ => Err(SecurityError::InsufficientPrivileges),
            }
        }
        SecurityAction::AccessWhistleblowerFeatures => {
            // Special whistleblower verification
            verify_whistleblower_status(user_id)
        }
    }
}

// Rate limiting with exponential backoff
pub struct RateLimiter {
    pub limits: HashMap<String, RateLimit>,
    pub user_actions: HashMap<(UserId, String), ActionHistory>,
}

pub struct RateLimit {
    pub max_actions: u32,
    pub window_seconds: u64,
    pub penalty_multiplier: f64,
}

impl RateLimiter {
    pub fn check_rate_limit(
        &self,
        user_id: &UserId,
        action: &str
    ) -> Result<(), SecurityError> {
        let limit = self.limits.get(action)
            .ok_or(SecurityError::UnknownAction)?;
        
        let history = self.user_actions.get(&(user_id.clone(), action.to_string()))
            .cloned()
            .unwrap_or_default();
        
        let now = ic_cdk::api::time();
        let window_start = now - (limit.window_seconds * 1_000_000_000);
        
        // Count recent actions
        let recent_actions = history.actions.iter()
            .filter(|&&timestamp| timestamp > window_start)
            .count() as u32;
        
        if recent_actions >= limit.max_actions {
            Err(SecurityError::RateLimitExceeded)
        } else {
            Ok(())
        }
    }
    
    pub fn record_action(&mut self, user_id: UserId, action: String) {
        let now = ic_cdk::api::time();
        let history = self.user_actions
            .entry((user_id, action))
            .or_insert_with(ActionHistory::new);
        
        history.actions.push(now);
        
        // Clean old entries
        let window_start = now - (24 * 60 * 60 * 1_000_000_000); // 24 hours
        history.actions.retain(|&timestamp| timestamp > window_start);
    }
}
```

### Input Validation & Sanitization

```rust
// Comprehensive input validation for social content
pub struct ContentValidator;

impl ContentValidator {
    pub fn validate_post_content(content: &str) -> Result<String, SecurityError> {
        // Length validation
        if content.trim().is_empty() {
            return Err(SecurityError::ContentEmpty);
        }
        
        if content.len() > MAX_POST_CONTENT {
            return Err(SecurityError::ContentTooLong {
                max: MAX_POST_CONTENT,
                actual: content.len(),
            });
        }
        
        // Security validation
        Self::check_for_malicious_content(content)?;
        Self::validate_encoding(content)?;
        
        // Sanitize content
        let sanitized = Self::sanitize_content(content);
        
        Ok(sanitized)
    }
    
    fn check_for_malicious_content(content: &str) -> Result<(), SecurityError> {
        // Check for potential script injection
        let dangerous_patterns = [
            "<script", "</script>", "javascript:", "data:",
            "vbscript:", "onload=", "onerror=", "onclick=",
        ];
        
        let content_lower = content.to_lowercase();
        for pattern in &dangerous_patterns {
            if content_lower.contains(pattern) {
                return Err(SecurityError::MaliciousContent(
                    format!("Suspicious pattern detected: {}", pattern)
                ));
            }
        }
        
        // Check for SQL injection patterns (even though we don't use SQL)
        let sql_patterns = [
            "union select", "drop table", "insert into", 
            "delete from", "update set", "'or'1'='1",
        ];
        
        for pattern in &sql_patterns {
            if content_lower.contains(pattern) {
                return Err(SecurityError::MaliciousContent(
                    "SQL injection pattern detected".into()
                ));
            }
        }
        
        Ok(())
    }
    
    fn validate_encoding(content: &str) -> Result<(), SecurityError> {
        // Ensure valid UTF-8
        if !content.is_ascii() && !content.chars().all(|c| c.is_alphabetic() || c.is_numeric() || c.is_whitespace() || ".,!?@#$%^&*()_+-=[]{}|;':\"<>?/".contains(c)) {
            return Err(SecurityError::InvalidEncoding);
        }
        
        Ok(())
    }
    
    fn sanitize_content(content: &str) -> String {
        content
            .chars()
            .filter(|c| {
                // Allow printable ASCII and common Unicode
                c.is_ascii_graphic() || 
                c.is_ascii_whitespace() ||
                c.is_alphabetic() ||
                c.is_numeric()
            })
            .take(MAX_POST_CONTENT)
            .collect()
    }
    
    pub fn validate_username(username: &str) -> Result<(), SecurityError> {
        if username.len() < MIN_USERNAME || username.len() > MAX_USERNAME {
            return Err(SecurityError::InvalidUsernameLength);
        }
        
        // Only allow alphanumeric, underscore, hyphen
        if !username.chars().all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '-') {
            return Err(SecurityError::InvalidUsernameChars);
        }
        
        // Prevent username enumeration attacks
        if username.starts_with("admin") || username.starts_with("system") {
            return Err(SecurityError::ReservedUsername);
        }
        
        Ok(())
    }
    
    pub fn validate_media_urls(urls: &[String]) -> Result<(), SecurityError> {
        if urls.len() > MAX_MEDIA_URLS {
            return Err(SecurityError::TooManyMediaFiles);
        }
        
        for url in urls {
            Self::validate_single_url(url)?;
        }
        
        Ok(())
    }
    
    fn validate_single_url(url: &str) -> Result<(), SecurityError> {
        // Must use HTTPS
        if !url.starts_with("https://") {
            return Err(SecurityError::InsecureUrl);
        }
        
        // Reasonable length limit
        if url.len() > 2048 {
            return Err(SecurityError::UrlTooLong);
        }
        
        // Basic URL structure validation
        if !url.contains('.') || url.contains("..") || url.contains("localhost") {
            return Err(SecurityError::InvalidUrl);
        }
        
        Ok(())
    }
}
```

### Privacy Controls & Data Protection

```rust
// Privacy-preserving social network features
pub struct PrivacyManager;

impl PrivacyManager {
    pub fn filter_user_data_for_viewer(
        user: &UserProfile,
        viewer: Option<&UserId>
    ) -> FilteredUserProfile {
        match viewer {
            Some(viewer_id) if viewer_id == &user.id => {
                // User viewing their own profile - show everything
                FilteredUserProfile::from_full_profile(user)
            }
            Some(viewer_id) => {
                // Another user viewing - apply privacy filters
                Self::apply_privacy_filters(user, viewer_id)
            }
            None => {
                // Anonymous viewer - most restrictive
                Self::apply_anonymous_filters(user)
            }
        }
    }
    
    fn apply_privacy_filters(
        user: &UserProfile,
        viewer_id: &UserId
    ) -> FilteredUserProfile {
        let is_following = is_following(viewer_id, &user.id).unwrap_or(false);
        let is_blocked = is_blocked(&user.id, viewer_id).unwrap_or(false);
        
        if is_blocked {
            return FilteredUserProfile::blocked();
        }
        
        match user.privacy_settings.profile_visibility {
            Visibility::Public => FilteredUserProfile {
                id: user.id.clone(),
                username: user.username.clone(),
                display_name: user.display_name.clone(),
                bio: user.bio.clone(),
                avatar_url: user.avatar_url.clone(),
                followers_count: Some(user.followers_count),
                following_count: Some(user.following_count),
                posts_count: Some(user.posts_count),
                verification_status: user.verification_status.clone(),
                is_following: Some(is_following),
                can_message: user.privacy_settings.allow_direct_messages,
                can_follow: user.privacy_settings.allow_followers,
            },
            Visibility::FollowersOnly if is_following => {
                FilteredUserProfile::for_followers(user, is_following)
            }
            Visibility::Private | Visibility::FollowersOnly => {
                FilteredUserProfile::limited(user)
            }
        }
    }
    
    fn apply_anonymous_filters(user: &UserProfile) -> FilteredUserProfile {
        match user.privacy_settings.profile_visibility {
            Visibility::Public => FilteredUserProfile {
                id: user.id.clone(),
                username: user.username.clone(),
                display_name: user.display_name.clone(),
                bio: user.bio.clone(),
                avatar_url: user.avatar_url.clone(),
                followers_count: Some(user.followers_count),
                following_count: None, // Hide for anonymous
                posts_count: Some(user.posts_count),
                verification_status: user.verification_status.clone(),
                is_following: None,
                can_message: false,
                can_follow: false,
            },
            _ => FilteredUserProfile::anonymous_restricted(user),
        }
    }
    
    pub fn can_view_post(
        post: &Post,
        viewer: Option<&UserId>
    ) -> bool {
        match post.visibility {
            PostVisibility::Public => true,
            PostVisibility::FollowersOnly => {
                viewer.map_or(false, |viewer_id| {
                    viewer_id == &post.author_id || 
                    is_following(viewer_id, &post.author_id).unwrap_or(false)
                })
            }
            PostVisibility::Unlisted => {
                viewer.map_or(false, |viewer_id| viewer_id == &post.author_id)
            }
            PostVisibility::Encrypted => {
                // Special whistleblower content - needs special access
                viewer.map_or(false, |viewer_id| {
                    viewer_id == &post.author_id || 
                    has_whistleblower_access(viewer_id).unwrap_or(false)
                })
            }
        }
    }
}
```

## Whistleblower Protection

### Anonymous Communication System

```rust
// Whistleblower-specific security features
pub struct WhistleblowerProtection;

impl WhistleblowerProtection {
    pub fn create_anonymous_post(
        content: String,
        evidence_urls: Vec<String>,
        target_organizations: Vec<String>
    ) -> Result<PostId, SecurityError> {
        // Enhanced validation for whistleblower content
        Self::validate_whistleblower_content(&content)?;
        Self::validate_evidence_urls(&evidence_urls)?;
        
        // Create anonymous identity
        let anonymous_id = Self::generate_anonymous_id();
        
        // Encrypt sensitive content
        let encrypted_content = Self::encrypt_whistleblower_content(&content)?;
        
        // Create post with special protections
        let post = Post {
            id: PostId(generate_post_id()),
            author_id: anonymous_id,
            content: encrypted_content,
            media_urls: evidence_urls,
            visibility: PostVisibility::Encrypted,
            post_type: PostType::Whistleblower,
            verification_required: true,
            legal_protections: true,
            created_at: ic_cdk::api::time(),
            // No edit capability for security
            edited_at: None,
            moderation_status: ModerationStatus::UnderReview,
        };
        
        // Store with enhanced security
        with_state_mut(|state| {
            state.whistleblower_posts.insert(post.id.clone(), post);
            Ok(post.id)
        })
    }
    
    fn generate_anonymous_id() -> UserId {
        // Generate cryptographically secure anonymous ID
        let random_bytes = ic_cdk::api::management_canister::main::raw_rand()
            .await
            .unwrap_or_default();
        
        let hash = sha256(&random_bytes);
        UserId(Principal::from_slice(&hash[..29]).unwrap())
    }
    
    fn encrypt_whistleblower_content(content: &str) -> Result<String, SecurityError> {
        // Use threshold encryption for whistleblower content
        // This ensures content can only be decrypted by verified journalists/authorities
        
        // For MVP, use base64 encoding with salt
        // In production, implement proper threshold encryption
        let salt = generate_salt();
        let salted_content = format!("{}:{}", salt, content);
        let encoded = base64::encode(salted_content.as_bytes());
        
        Ok(encoded)
    }
    
    fn validate_whistleblower_content(content: &str) -> Result<(), SecurityError> {
        // Enhanced validation for sensitive content
        if content.len() < 100 {
            return Err(SecurityError::WhistleblowerContentTooShort);
        }
        
        if content.len() > MAX_WHISTLEBLOWER_CONTENT {
            return Err(SecurityError::WhistleblowerContentTooLong);
        }
        
        // Check for required elements
        let has_what = content.to_lowercase().contains("what happened") || 
                      content.to_lowercase().contains("incident") ||
                      content.to_lowercase().contains("violation");
        
        let has_when = content.contains("202") || // Year reference
                      content.to_lowercase().contains("date") ||
                      content.to_lowercase().contains("time");
        
        let has_where = content.to_lowercase().contains("location") ||
                       content.to_lowercase().contains("where") ||
                       content.to_lowercase().contains("facility");
        
        if !has_what && !has_when && !has_where {
            return Err(SecurityError::InsufficientWhistleblowerDetail);
        }
        
        Ok(())
    }
    
    pub fn verify_journalist_access(
        journalist_id: &UserId,
        post_id: &PostId
    ) -> Result<String, SecurityError> {
        // Verify journalist credentials
        let journalist = get_verified_journalist(journalist_id)?;
        
        if !journalist.whistleblower_access {
            return Err(SecurityError::NoWhistleblowerAccess);
        }
        
        // Decrypt content for verified journalist
        let post = get_whistleblower_post(post_id)?;
        Self::decrypt_for_verified_user(&post.content, journalist_id)
    }
    
    fn decrypt_for_verified_user(
        encrypted_content: &str,
        user_id: &UserId
    ) -> Result<String, SecurityError> {
        // Implement threshold decryption
        // For MVP, reverse the encoding
        let decoded = base64::decode(encrypted_content)
            .map_err(|_| SecurityError::DecryptionFailed)?;
        
        let content = String::from_utf8(decoded)
            .map_err(|_| SecurityError::DecryptionFailed)?;
        
        // Remove salt (format: "salt:content")
        if let Some(pos) = content.find(':') {
            Ok(content[pos + 1..].to_string())
        } else {
            Err(SecurityError::DecryptionFailed)
        }
    }
}

// Metadata scrubbing for whistleblower protection
pub struct MetadataScrubber;

impl MetadataScrubber {
    pub fn scrub_post_metadata(post: &mut Post) {
        // Remove identifying timestamps
        post.created_at = Self::anonymize_timestamp(post.created_at);
        
        // Scrub any location data from media URLs
        post.media_urls = post.media_urls.iter()
            .map(|url| Self::scrub_url_metadata(url))
            .collect();
        
        // Remove any identifying information from content
        post.content = Self::scrub_identifying_info(&post.content);
    }
    
    fn anonymize_timestamp(timestamp: u64) -> u64 {
        // Round to nearest hour to prevent timing correlation
        let hour_in_nanos = 60 * 60 * 1_000_000_000;
        (timestamp / hour_in_nanos) * hour_in_nanos
    }
    
    fn scrub_url_metadata(url: &str) -> String {
        // Remove common tracking parameters
        let tracking_params = [
            "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
            "fbclid", "gclid", "msclkid", "ref", "source"
        ];
        
        let mut scrubbed = url.to_string();
        
        for param in &tracking_params {
            // Remove parameter and its value
            let patterns = [
                format!("?{}=", param),
                format!("&{}=", param),
            ];
            
            for pattern in &patterns {
                if let Some(start) = scrubbed.find(pattern) {
                    if let Some(end) = scrubbed[start + 1..].find('&') {
                        scrubbed.replace_range(start..start + end + 1, "");
                    } else {
                        scrubbed.truncate(start);
                    }
                }
            }
        }
        
        scrubbed
    }
    
    fn scrub_identifying_info(content: &str) -> String {
        // Remove common identifying patterns
        let mut scrubbed = content.to_string();
        
        // Email addresses
        let email_regex = regex::Regex::new(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b").unwrap();
        scrubbed = email_regex.replace_all(&scrubbed, "[EMAIL_REDACTED]").to_string();
        
        // Phone numbers
        let phone_regex = regex::Regex::new(r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b").unwrap();
        scrubbed = phone_regex.replace_all(&scrubbed, "[PHONE_REDACTED]").to_string();
        
        // Social Security Numbers
        let ssn_regex = regex::Regex::new(r"\b\d{3}-?\d{2}-?\d{4}\b").unwrap();
        scrubbed = ssn_regex.replace_all(&scrubbed, "[SSN_REDACTED]").to_string();
        
        scrubbed
    }
}
```

### Frontend Security Implementation

```typescript
// Frontend security utilities for social network
export class SocialSecurityManager {
  private static instance: SocialSecurityManager;
  
  static getInstance(): SocialSecurityManager {
    if (!this.instance) {
      this.instance = new SocialSecurityManager();
    }
    return this.instance;
  }

  // Content Security Policy implementation
  initializeCSP(): void {
    // Set strict CSP headers
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://identity.ic0.app",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https: wss:",
      "frame-src https://identity.ic0.app",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');

    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = csp;
    document.head.appendChild(meta);
  }

  // Input sanitization for frontend
  sanitizeUserInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Secure data storage
  secureStore(key: string, value: any): void {
    try {
      const encrypted = this.encrypt(JSON.stringify(value));
      sessionStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to securely store data:', error);
    }
  }

  secureRetrieve(key: string): any {
    try {
      const encrypted = sessionStorage.getItem(key);
      if (!encrypted) return null;
      
      const decrypted = this.decrypt(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to retrieve secure data:', error);
      return null;
    }
  }

  private encrypt(text: string): string {
    // Simple encryption for demo - use proper crypto in production
    return btoa(text);
  }

  private decrypt(encryptedText: string): string {
    return atob(encryptedText);
  }

  // Rate limiting on frontend
  private rateLimits = new Map<string, { count: number; resetTime: number }>();

  checkRateLimit(action: string, maxAttempts: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const key = action;
    const limit = this.rateLimits.get(key);

    if (!limit || now > limit.resetTime) {
      this.rateLimits.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (limit.count >= maxAttempts) {
      return false;
    }

    limit.count++;
    return true;
  }

  // Secure form validation
  validatePostContent(content: string): ValidationResult {
    const errors: string[] = [];

    if (!content.trim()) {
      errors.push('Content cannot be empty');
    }

    if (content.length > 10000) {
      errors.push('Content exceeds maximum length');
    }

    // Check for potential XSS
    if (this.containsPotentialXSS(content)) {
      errors.push('Content contains potentially unsafe elements');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedContent: this.sanitizeUserInput(content)
    };
  }

  private containsPotentialXSS(content: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    ];

    return xssPatterns.some(pattern => pattern.test(content));
  }

  // Whistleblower protection utilities
  enableAnonymousMode(): void {
    // Clear tracking data
    this.clearTrackingData();
    
    // Disable analytics
    this.disableAnalytics();
    
    // Use secure connection only
    this.enforceHTTPS();
  }

  private clearTrackingData(): void {
    // Clear cookies
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });

    // Clear storage
    localStorage.clear();
    sessionStorage.clear();
  }

  private disableAnalytics(): void {
    // Disable Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_MEASUREMENT_ID', { 'send_page_view': false });
    }

    // Set do not track
    if (navigator.doNotTrack !== '1') {
      Object.defineProperty(navigator, 'doNotTrack', { value: '1' });
    }
  }

  private enforceHTTPS(): void {
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      location.replace(`https:${location.href.substring(location.protocol.length)}`);
    }
  }
}

// Security hooks for React components
export function useSecurityValidation() {
  const securityManager = SocialSecurityManager.getInstance();

  const validateAndSanitize = useCallback((input: string, type: 'post' | 'comment' | 'bio' = 'post') => {
    switch (type) {
      case 'post':
        return securityManager.validatePostContent(input);
      case 'comment':
        return securityManager.validatePostContent(input); // Same validation for now
      case 'bio':
        return {
          isValid: input.length <= 500,
          errors: input.length > 500 ? ['Bio too long'] : [],
          sanitizedContent: securityManager.sanitizeUserInput(input)
        };
      default:
        return { isValid: false, errors: ['Unknown validation type'], sanitizedContent: '' };
    }
  }, [securityManager]);

  const checkActionRateLimit = useCallback((action: string) => {
    return securityManager.checkRateLimit(action);
  }, [securityManager]);

  return {
    validateAndSanitize,
    checkActionRateLimit,
  };
}

// Secure authentication hook
export function useSecureAuth() {
  const [authState, setAuthState] = useState<SecureAuthState>({
    isAuthenticated: false,
    principal: null,
    userProfile: null,
    sessionExpiry: null,
    securityLevel: 'normal',
  });

  useEffect(() => {
    // Check session expiry
    const checkSessionExpiry = () => {
      if (authState.sessionExpiry && Date.now() > authState.sessionExpiry) {
        logout();
      }
    };

    const interval = setInterval(checkSessionExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [authState.sessionExpiry]);

  const login = useCallback(async (options?: { whistleblower?: boolean }) => {
    try {
      if (options?.whistleblower) {
        SocialSecurityManager.getInstance().enableAnonymousMode();
      }

      const authClient = await AuthClient.create();
      await authClient.login({
        identityProvider: 'https://identity.ic0.app',
        maxTimeToLive: BigInt(8 * 60 * 60 * 1000 * 1000 * 1000), // 8 hours
        onSuccess: async () => {
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal().toString();
          
          setAuthState({
            isAuthenticated: true,
            principal,
            userProfile: null, // Load separately
            sessionExpiry: Date.now() + (8 * 60 * 60 * 1000), // 8 hours
            securityLevel: options?.whistleblower ? 'whistleblower' : 'normal',
          });
        },
      });
    } catch (error) {
      console.error('Secure authentication failed:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    const authClient = await AuthClient.create();
    await authClient.logout();
    
    // Clear secure storage
    sessionStorage.clear();
    
    setAuthState({
      isAuthenticated: false,
      principal: null,
      userProfile: null,
      sessionExpiry: null,
      securityLevel: 'normal',
    });
  }, []);

  return { authState, login, logout };
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedContent: string;
}

interface SecureAuthState {
  isAuthenticated: boolean;
  principal: string | null;
  userProfile: any | null;
  sessionExpiry: number | null;
  securityLevel: 'normal' | 'whistleblower';
}
```

Remember: Security is paramount for deCentra users who may be in high-risk situations. Every feature must be designed with security, privacy, and censorship resistance as primary concerns.
