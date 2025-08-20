---
applyTo: "**"
---

# API Documentation Instructions

## Candid Interface Documentation for deCentra

### Backend API Documentation Standards

Every public canister endpoint must include:
- Clear function description and purpose
- Parameter validation rules
- Return type documentation
- Error handling specifications
- Usage examples with real social network scenarios
- Security considerations

```rust
/// Creates a new user profile with privacy controls
/// 
/// # Purpose
/// Initializes a user profile for social networking on deCentra.
/// This is required before users can post content or interact socially.
/// 
/// # Arguments
/// * `username` - Unique identifier (3-50 chars, alphanumeric + _ -)
/// * `display_name` - Optional public display name (max 100 chars)
/// * `bio` - Optional biography (max 500 chars)
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
///     Some("Alice Doe".to_string()),
///     Some("Digital rights activist and journalist".to_string())
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
/// - Bio and display_name are optional for enhanced privacy
#[ic_cdk::update]
pub async fn create_user_profile(
    username: String,
    display_name: Option<String>,
    bio: Option<String>
) -> Result<UserProfile, String> {
    // Implementation...
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
/// * `Ok(Vec<Post>)` - List of posts sorted by creation time (newest first)
/// * `Err(String)` - Authentication or validation error
/// 
/// # Feed Algorithm
/// 1. Collect posts from users the current user follows
/// 2. Include current user's own posts
/// 3. Filter based on post visibility settings
/// 4. Remove posts from blocked users
/// 5. Sort by creation timestamp (descending)
/// 6. Apply pagination limits
/// 
/// # Privacy Filters Applied
/// - PostVisibility::Public - Always visible
/// - PostVisibility::FollowersOnly - Only if user follows author
/// - PostVisibility::Unlisted - Only author's own posts
/// - PostVisibility::Encrypted - Only author's own posts
/// 
/// # Performance
/// - Pagination prevents memory exhaustion
/// - Efficient indexing for large user bases
/// - Cycle cost scales with following count
/// 
/// # Example
/// ```rust
/// // Load initial feed
/// let feed = get_user_feed(0, 10).await?;
/// println!("Loaded {} posts", feed.len());
/// 
/// // Load more posts for infinite scroll
/// let more_posts = get_user_feed(10, 10).await?;
/// ```
#[ic_cdk::query]
pub fn get_user_feed(offset: usize, limit: usize) -> Result<Vec<Post>, String> {
    // Implementation...
}
```

### Frontend Service Layer Documentation

```typescript
/**
 * Social Network Service for deCentra Frontend
 * 
 * Provides type-safe integration with the deCentra backend canister.
 * Handles authentication, error processing, and data transformation.
 */
export class SocialNetworkService {
  private actor: ActorSubclass<_SERVICE>;

  constructor(actor: ActorSubclass<_SERVICE>) {
    this.actor = actor;
  }

  /**
   * Creates a new user profile
   * 
   * @param profileData - User profile information
   * @param profileData.username - Unique username (3-50 chars)
   * @param profileData.displayName - Optional display name
   * @param profileData.bio - Optional biography
   * 
   * @returns Promise resolving to created profile or error
   * 
   * @throws {Error} When authentication fails or validation errors occur
   * 
   * @example
   * ```typescript
   * try {
   *   const profile = await socialService.createUserProfile({
   *     username: 'alice_doe',
   *     displayName: 'Alice Doe',
   *     bio: 'Digital rights activist'
   *   });
   *   console.log('Profile created:', profile);
   * } catch (error) {
   *   console.error('Profile creation failed:', error.message);
   * }
   * ```
   */
  async createUserProfile(profileData: {
    username: string;
    displayName?: string;
    bio?: string;
  }): Promise<UserProfile> {
    try {
      const result = await this.actor.create_user_profile(
        profileData.username,
        profileData.displayName ? [profileData.displayName] : [],
        profileData.bio ? [profileData.bio] : []
      );

      if ('Ok' in result) {
        return this.transformUserProfile(result.Ok);
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      throw this.handleCanisterError(error, 'Failed to create user profile');
    }
  }

  /**
   * Retrieves the user's personalized social feed
   * 
   * @param options - Feed retrieval options
   * @param options.offset - Number of posts to skip (default: 0)
   * @param options.limit - Maximum posts to return (default: 10, max: 50)
   * 
   * @returns Promise resolving to array of posts
   * 
   * @throws {Error} When authentication fails or request invalid
   * 
   * @example
   * ```typescript
   * // Initial feed load
   * const posts = await socialService.getUserFeed({ offset: 0, limit: 10 });
   * 
   * // Load more for infinite scroll
   * const morePosts = await socialService.getUserFeed({ 
   *   offset: posts.length, 
   *   limit: 10 
   * });
   * ```
   */
  async getUserFeed(options: {
    offset?: number;
    limit?: number;
  } = {}): Promise<Post[]> {
    const { offset = 0, limit = 10 } = options;

    try {
      const result = await this.actor.get_user_feed(offset, Math.min(limit, 50));

      if ('Ok' in result) {
        return result.Ok.map(this.transformPost);
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      throw this.handleCanisterError(error, 'Failed to load user feed');
    }
  }

  /**
   * Creates a new post
   * 
   * @param postData - Post creation data
   * @param postData.content - Post text content (max 10,000 chars)
   * @param postData.mediaUrls - Optional media attachments
   * @param postData.visibility - Post visibility setting
   * 
   * @returns Promise resolving to created post ID
   * 
   * @throws {Error} When validation fails or creation error occurs
   * 
   * @example
   * ```typescript
   * const postId = await socialService.createPost({
   *   content: 'Building the future of decentralized social media! 🚀',
   *   mediaUrls: ['https://example.com/image.jpg'],
   *   visibility: 'public'
   * });
   * ```
   */
  async createPost(postData: {
    content: string;
    mediaUrls?: string[];
    visibility?: PostVisibility;
  }): Promise<string> {
    try {
      const result = await this.actor.create_post(
        postData.content,
        postData.mediaUrls || [],
        this.transformVisibilityToBackend(postData.visibility || 'public')
      );

      if ('Ok' in result) {
        return result.Ok.toString();
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      throw this.handleCanisterError(error, 'Failed to create post');
    }
  }

  /**
   * Follows or unfollows a user
   * 
   * @param userId - Target user's ID
   * @param action - 'follow' or 'unfollow'
   * 
   * @returns Promise resolving when action completes
   * 
   * @throws {Error} When user not found or privacy settings prevent action
   */
  async toggleUserFollow(userId: string, action: 'follow' | 'unfollow'): Promise<void> {
    try {
      const userIdPrincipal = Principal.fromText(userId);
      
      const result = action === 'follow' 
        ? await this.actor.follow_user({ 0: userIdPrincipal })
        : await this.actor.unfollow_user({ 0: userIdPrincipal });

      if ('Err' in result) {
        throw new Error(result.Err);
      }
    } catch (error) {
      throw this.handleCanisterError(error, `Failed to ${action} user`);
    }
  }

  /**
   * Searches for users by username or display name
   * 
   * @param query - Search query string
   * @param limit - Maximum results to return (default: 10, max: 20)
   * 
   * @returns Promise resolving to array of matching user profiles
   * 
   * @example
   * ```typescript
   * const users = await socialService.searchUsers('alice', 5);
   * console.log(`Found ${users.length} users matching 'alice'`);
   * ```
   */
  async searchUsers(query: string, limit: number = 10): Promise<UserProfile[]> {
    if (!query.trim()) {
      throw new Error('Search query cannot be empty');
    }

    try {
      const result = await this.actor.search_users(query.trim(), Math.min(limit, 20));

      if ('Ok' in result) {
        return result.Ok.map(this.transformUserProfile);
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      throw this.handleCanisterError(error, 'Failed to search users');
    }
  }

  // Private transformation methods
  private transformPost = (backendPost: any): Post => ({
    id: backendPost.id.toString(),
    authorId: backendPost.author_id.toString(),
    content: backendPost.content,
    mediaUrls: backendPost.media_urls,
    likesCount: Number(backendPost.likes_count),
    commentsCount: Number(backendPost.comments_count),
    repostsCount: Number(backendPost.reposts_count),
    tipsReceived: BigInt(backendPost.tips_received),
    createdAt: BigInt(backendPost.created_at),
    editedAt: backendPost.edited_at?.[0] ? BigInt(backendPost.edited_at[0]) : undefined,
    visibility: this.transformVisibilityFromBackend(backendPost.visibility),
  });

  private transformUserProfile = (backendProfile: any): UserProfile => ({
    id: backendProfile.id.toString(),
    username: backendProfile.username,
    displayName: backendProfile.display_name?.[0],
    bio: backendProfile.bio?.[0],
    avatarUrl: backendProfile.avatar_url?.[0],
    followersCount: Number(backendProfile.followers_count),
    followingCount: Number(backendProfile.following_count),
    postsCount: Number(backendProfile.posts_count),
    createdAt: BigInt(backendProfile.created_at),
    privacySettings: this.transformPrivacySettings(backendProfile.privacy_settings),
    verificationStatus: this.transformVerificationStatus(backendProfile.verification_status),
  });

  private handleCanisterError(error: any, defaultMessage: string): Error {
    if (error instanceof Error) {
      // Map common canister errors to user-friendly messages
      if (error.message.includes('Authentication required')) {
        return new Error('Please log in to continue');
      }
      if (error.message.includes('Unauthorized')) {
        return new Error("You don't have permission for this action");
      }
      if (error.message.includes('Rate limit')) {
        return new Error('Please wait before trying again');
      }
      return error;
    }
    
    return new Error(defaultMessage);
  }
}
```

### API Usage Examples

```typescript
// Complete social network integration example
export class SocialNetworkApp {
  private socialService: SocialNetworkService;
  private authClient: AuthClient;

  async initialize() {
    // Initialize authentication
    this.authClient = await AuthClient.create();
    
    // Create canister actor
    const actor = createActor(canisterId, {
      agentOptions: {
        identity: this.authClient.getIdentity(),
      },
    });
    
    this.socialService = new SocialNetworkService(actor);
  }

  /**
   * Complete user onboarding flow
   */
  async onboardUser(profileData: UserProfileData): Promise<UserProfile> {
    try {
      // 1. Authenticate with Internet Identity
      await this.authClient.login({
        identityProvider: 'https://identity.ic0.app',
      });

      // 2. Create user profile
      const profile = await this.socialService.createUserProfile(profileData);

      // 3. Set up default privacy settings
      await this.socialService.updatePrivacySettings({
        profileVisibility: 'public',
        allowFollowers: true,
        allowDirectMessages: true,
      });

      return profile;
    } catch (error) {
      throw new Error(`Onboarding failed: ${error.message}`);
    }
  }

  /**
   * Complete post creation workflow
   */
  async createPostWithValidation(content: string, options?: CreatePostOptions): Promise<string> {
    try {
      // 1. Validate content
      if (!content.trim()) {
        throw new Error('Post content cannot be empty');
      }
      if (content.length > 10000) {
        throw new Error('Post content too long');
      }

      // 2. Create post
      const postId = await this.socialService.createPost({
        content: content.trim(),
        mediaUrls: options?.mediaUrls,
        visibility: options?.visibility || 'public',
      });

      // 3. Update local state optimistically
      this.updateLocalFeed(postId, content);

      return postId;
    } catch (error) {
      throw new Error(`Failed to create post: ${error.message}`);
    }
  }

  /**
   * Social interaction workflow
   */
  async performSocialAction(action: SocialAction): Promise<void> {
    try {
      switch (action.type) {
        case 'like':
          await this.socialService.likePost(action.postId);
          break;
        case 'follow':
          await this.socialService.toggleUserFollow(action.userId, 'follow');
          break;
        case 'tip':
          await this.socialService.tipCreator(action.postId, action.amount);
          break;
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      // Update UI optimistically
      this.updateUIAfterAction(action);
    } catch (error) {
      // Revert optimistic update on failure
      this.revertUIUpdate(action);
      throw error;
    }
  }
}
```

### Error Handling Documentation

```typescript
/**
 * Comprehensive error handling for deCentra API calls
 */
export class DecentraAPIError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'DecentraAPIError';
  }
}

export const ErrorCodes = {
  // Authentication errors
  NOT_AUTHENTICATED: 'NOT_AUTHENTICATED',
  INVALID_IDENTITY: 'INVALID_IDENTITY',
  
  // Authorization errors
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  BLOCKED_USER: 'BLOCKED_USER',
  PRIVACY_RESTRICTION: 'PRIVACY_RESTRICTION',
  
  // Validation errors
  INVALID_INPUT: 'INVALID_INPUT',
  CONTENT_TOO_LONG: 'CONTENT_TOO_LONG',
  USERNAME_TAKEN: 'USERNAME_TAKEN',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Resource errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  POST_NOT_FOUND: 'POST_NOT_FOUND',
  
  // System errors
  CANISTER_ERROR: 'CANISTER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

/**
 * Maps backend error messages to typed error codes
 */
export function mapBackendError(errorMessage: string): DecentraAPIError {
  if (errorMessage.includes('Authentication required')) {
    return new DecentraAPIError(
      'Please log in to continue',
      ErrorCodes.NOT_AUTHENTICATED
    );
  }
  
  if (errorMessage.includes('Username already taken')) {
    return new DecentraAPIError(
      'This username is already taken',
      ErrorCodes.USERNAME_TAKEN
    );
  }
  
  if (errorMessage.includes('Rate limit exceeded')) {
    return new DecentraAPIError(
      'Please wait before trying again',
      ErrorCodes.RATE_LIMIT_EXCEEDED
    );
  }
  
  // Default to generic error
  return new DecentraAPIError(
    errorMessage,
    ErrorCodes.CANISTER_ERROR,
    { originalMessage: errorMessage }
  );
}
```

Remember: API documentation is crucial for deCentra's success. Clear documentation enables community contributions and third-party integrations that strengthen the decentralized ecosystem.