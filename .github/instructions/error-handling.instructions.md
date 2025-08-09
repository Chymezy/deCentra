---
applyTo: "**"
---

# Error Handling Instructions

## Backend Error Patterns for deCentra

### Rust Error Handling Standards

```rust
// Custom error types for social network features
#[derive(Debug, Clone, CandidType, Deserialize)]
pub enum SocialNetworkError {
    // Authentication & Authorization
    AuthenticationRequired,
    Unauthorized(String),
    IdentityInvalid,
    
    // User Management
    UserNotFound(UserId),
    UsernameAlreadyTaken(String),
    ProfileAlreadyExists,
    InvalidUsername(String),
    
    // Content Management
    PostNotFound(PostId),
    ContentTooLong { max: usize, actual: usize },
    ContentEmpty,
    InvalidMediaUrl(String),
    
    // Social Interactions
    CannotFollowSelf,
    AlreadyFollowing(UserId),
    NotFollowing(UserId),
    UserBlocked(UserId),
    PrivacyRestriction(String),
    
    // Rate Limiting & Resource Protection
    RateLimitExceeded { limit: u32, window: u64 },
    ResourceLimitExceeded(String),
    BatchSizeTooLarge { max: usize, requested: usize },
    
    // Content Moderation
    ContentFlagged(ReportId),
    ContentUnderReview,
    ContentRemoved(String),
    
    // System Errors
    StateCorrupted(String),
    StorageError(String),
    InvalidRequest(String),
}

impl From<SocialNetworkError> for String {
    fn from(error: SocialNetworkError) -> String {
        match error {
            // User-friendly error messages
            SocialNetworkError::AuthenticationRequired => 
                "Please log in with Internet Identity to continue".into(),
            SocialNetworkError::Unauthorized(action) => 
                format!("You don't have permission to {}", action),
            SocialNetworkError::UserNotFound(_) => 
                "User not found".into(),
            SocialNetworkError::UsernameAlreadyTaken(username) => 
                format!("Username '{}' is already taken", username),
            SocialNetworkError::InvalidUsername(reason) => 
                format!("Invalid username: {}", reason),
            SocialNetworkError::ContentTooLong { max, actual } => 
                format!("Content too long: {} characters (max: {})", actual, max),
            SocialNetworkError::ContentEmpty => 
                "Content cannot be empty".into(),
            SocialNetworkError::CannotFollowSelf => 
                "You cannot follow yourself".into(),
            SocialNetworkError::AlreadyFollowing(_) => 
                "You are already following this user".into(),
            SocialNetworkError::UserBlocked(_) => 
                "This action is not allowed with blocked users".into(),
            SocialNetworkError::PrivacyRestriction(reason) => 
                format!("Privacy settings prevent this action: {}", reason),
            SocialNetworkError::RateLimitExceeded { limit, window } => 
                format!("Rate limit exceeded: {} actions per {} seconds", limit, window),
            SocialNetworkError::ContentFlagged(_) => 
                "This content has been flagged and is under review".into(),
            // Don't expose internal details for system errors
            SocialNetworkError::StateCorrupted(_) | 
            SocialNetworkError::StorageError(_) => 
                "A system error occurred. Please try again later".into(),
            _ => "An unexpected error occurred".into(),
        }
    }
}

// Result type alias for cleaner code
pub type SocialResult<T> = Result<T, SocialNetworkError>;

// Error handling utilities
pub fn validate_authentication() -> SocialResult<UserId> {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        return Err(SocialNetworkError::AuthenticationRequired);
    }
    Ok(UserId(caller))
}

pub fn validate_user_exists(user_id: &UserId, state: &SocialNetworkState) -> SocialResult<&UserProfile> {
    state.users.get(user_id)
        .ok_or_else(|| SocialNetworkError::UserNotFound(user_id.clone()))
}

pub fn validate_content_length(content: &str, max_length: usize) -> SocialResult<()> {
    if content.trim().is_empty() {
        return Err(SocialNetworkError::ContentEmpty);
    }
    
    if content.len() > max_length {
        return Err(SocialNetworkError::ContentTooLong {
            max: max_length,
            actual: content.len(),
        });
    }
    
    Ok(())
}

pub fn validate_social_interaction(
    actor: &UserId,
    target: &UserId,
    state: &SocialNetworkState
) -> SocialResult<()> {
    // Check if users are blocked
    if let Some(blocked_users) = state.blocks.get(actor) {
        if blocked_users.contains(target) {
            return Err(SocialNetworkError::UserBlocked(target.clone()));
        }
    }
    
    if let Some(blocked_by) = state.blocks.get(target) {
        if blocked_by.contains(actor) {
            return Err(SocialNetworkError::UserBlocked(target.clone()));
        }
    }
    
    Ok(())
}

// Comprehensive error handling in endpoints
#[ic_cdk::update]
pub async fn create_post_with_error_handling(
    content: String,
    media_urls: Vec<String>,
    visibility: PostVisibility
) -> Result<PostId, String> {
    // Use ? operator for clean error propagation
    let user_id = validate_authentication()?;
    
    // Validate content
    validate_content_length(&content, MAX_POST_CONTENT)?;
    
    // Validate media URLs
    if media_urls.len() > MAX_MEDIA_URLS {
        return Err(SocialNetworkError::BatchSizeTooLarge {
            max: MAX_MEDIA_URLS,
            requested: media_urls.len(),
        }.into());
    }
    
    for url in &media_urls {
        if !url.starts_with("https://") {
            return Err(SocialNetworkError::InvalidMediaUrl(url.clone()).into());
        }
    }
    
    // Check rate limiting
    if is_rate_limited(&user_id, "create_post")? {
        return Err(SocialNetworkError::RateLimitExceeded {
            limit: POST_RATE_LIMIT,
            window: RATE_LIMIT_WINDOW,
        }.into());
    }
    
    // Attempt to create post with proper error handling
    with_state_mut(|state| -> SocialResult<PostId> {
        // Validate user exists
        validate_user_exists(&user_id, state)?;
        
        let post_id = PostId(state.next_post_id);
        state.next_post_id += 1;
        
        let sanitized_content = sanitize_content(&content);
        
        let post = Post {
            id: post_id.clone(),
            author_id: user_id.clone(),
            content: sanitized_content,
            media_urls: media_urls.clone(),
            likes_count: 0,
            comments_count: 0,
            reposts_count: 0,
            tips_received: 0,
            created_at: ic_cdk::api::time(),
            edited_at: None,
            visibility,
            moderation_status: ModerationStatus::Active,
        };
        
        // Atomic state updates with rollback capability
        let original_post_count = state.users.get(&user_id).unwrap().posts_count;
        
        state.posts.insert(post_id.clone(), post);
        
        // Update user post count
        if let Some(user) = state.users.get_mut(&user_id) {
            user.posts_count += 1;
        } else {
            // Rollback on inconsistent state
            state.posts.remove(&post_id);
            return Err(SocialNetworkError::StateCorrupted(
                "User disappeared during post creation".into()
            ));
        }
        
        // Update rate limiting
        update_rate_limit(&user_id, "create_post");
        
        Ok(post_id)
    }).map_err(|e| e.into())
}
```

### Frontend Error Boundaries for Social Features

```typescript
// Social network specific error boundary
interface SocialErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string;
  userActionRequired: boolean;
}

export class SocialErrorBoundary extends React.Component<
  { children: ReactNode; onError?: (error: Error, errorInfo: any) => void },
  SocialErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: '',
      userActionRequired: false,
    };
  }

  static getDerivedStateFromError(error: Error): SocialErrorBoundaryState {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine if user action is required based on error type
    const userActionRequired = 
      error.message.includes('authentication') ||
      error.message.includes('permission') ||
      error.message.includes('login');

    return {
      hasError: true,
      error,
      errorId,
      userActionRequired,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error details for debugging
    console.error('Social feature error:', {
      error: error.message,
      stack: error.stack,
      errorInfo,
      errorId: this.state.errorId,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });

    // Report to error tracking service
    this.props.onError?.(error, {
      ...errorInfo,
      errorId: this.state.errorId,
      context: 'social_network',
    });

    // Track error metrics
    this.trackErrorMetrics(error);
  }

  private trackErrorMetrics(error: Error) {
    // Track different types of social network errors
    const errorType = this.categorizeError(error);
    
    // Send to analytics (privacy-preserving)
    analytics.track('social_error_occurred', {
      error_type: errorType,
      error_id: this.state.errorId,
      // Don't send sensitive error details
    });
  }

  private categorizeError(error: Error): string {
    if (error.message.includes('authentication')) return 'authentication';
    if (error.message.includes('network') || error.message.includes('fetch')) return 'network';
    if (error.message.includes('permission') || error.message.includes('unauthorized')) return 'authorization';
    if (error.message.includes('validation') || error.message.includes('invalid')) return 'validation';
    return 'unknown';
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: '',
      userActionRequired: false,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SocialErrorFallback
          error={this.state.error}
          errorId={this.state.errorId}
          userActionRequired={this.state.userActionRequired}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

// Error fallback component for social features
function SocialErrorFallback({
  error,
  errorId,
  userActionRequired,
  onRetry,
}: {
  error: Error | null;
  errorId: string;
  userActionRequired: boolean;
  onRetry: () => void;
}) {
  const { authState, login } = useAuth();

  const getErrorMessage = () => {
    if (!error) return 'An unexpected error occurred';

    // Map error messages to user-friendly descriptions
    if (error.message.includes('authentication') || error.message.includes('login')) {
      return 'Please log in to continue using deCentra';
    }
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Connection issue detected. Your data is safe on the blockchain.';
    }
    if (error.message.includes('permission')) {
      return "You don't have permission for this action";
    }
    if (error.message.includes('rate limit')) {
      return 'Please wait a moment before trying again';
    }

    return 'Something went wrong with this social feature';
  };

  const getActionButton = () => {
    if (error?.message.includes('authentication') && !authState.isAuthenticated) {
      return (
        <button
          onClick={login}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Log In with Internet Identity
        </button>
      );
    }

    return (
      <button
        onClick={onRetry}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Try Again
      </button>
    );
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="flex flex-col items-center space-y-4">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
        
        <div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-red-700 mb-4 max-w-md">
            {getErrorMessage()}
          </p>
          <p className="text-sm text-red-600 mb-4">
            Your data is safe on the blockchain. This is just a temporary issue.
          </p>
        </div>

        <div className="flex space-x-3">
          {getActionButton()}
          
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Refresh Page
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-600">
              Error Details (Dev Mode)
            </summary>
            <pre className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded overflow-auto max-h-32">
              Error ID: {errorId}
              {'\n'}
              Message: {error?.message}
              {'\n'}
              Stack: {error?.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

// Hook for handling async errors in social features
export function useSocialErrorHandler() {
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleAsyncError = useCallback(async (
    operation: () => Promise<any>,
    errorContext: string = 'social_operation'
  ) => {
    try {
      setError(null);
      const result = await operation();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      
      // Add context to error
      error.message = `${errorContext}: ${error.message}`;
      
      setError(error);
      
      // Log error for debugging
      console.error(`Social error in ${errorContext}:`, error);
      
      throw error;
    }
  }, []);

  const retry = useCallback(async (
    operation: () => Promise<any>,
    maxRetries: number = 3
  ) => {
    setIsRetrying(true);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        setError(null);
        setIsRetrying(false);
        return result;
      } catch (err) {
        if (attempt === maxRetries) {
          setError(err instanceof Error ? err : new Error('Retry failed'));
          setIsRetrying(false);
          throw err;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    isRetrying,
    handleAsyncError,
    retry,
    clearError,
  };
}

// Error handling for social network operations
export function useSocialOperations() {
  const { handleAsyncError } = useSocialErrorHandler();
  const { authState } = useAuth();

  const createPost = useCallback(async (content: string, options?: CreatePostOptions) => {
    return handleAsyncError(async () => {
      if (!authState.isAuthenticated) {
        throw new Error('Please log in to create posts');
      }

      if (!content.trim()) {
        throw new Error('Post content cannot be empty');
      }

      if (content.length > 10000) {
        throw new Error('Post content is too long (maximum 10,000 characters)');
      }

      return await socialService.createPost({
        content: content.trim(),
        ...options,
      });
    }, 'create_post');
  }, [authState.isAuthenticated, handleAsyncError]);

  const followUser = useCallback(async (userId: string) => {
    return handleAsyncError(async () => {
      if (!authState.isAuthenticated) {
        throw new Error('Please log in to follow users');
      }

      if (userId === authState.principal) {
        throw new Error('You cannot follow yourself');
      }

      return await socialService.toggleUserFollow(userId, 'follow');
    }, 'follow_user');
  }, [authState.isAuthenticated, authState.principal, handleAsyncError]);

  const likePost = useCallback(async (postId: string) => {
    return handleAsyncError(async () => {
      if (!authState.isAuthenticated) {
        throw new Error('Please log in to like posts');
      }

      return await socialService.likePost(postId);
    }, 'like_post');
  }, [authState.isAuthenticated, handleAsyncError]);

  return {
    createPost,
    followUser,
    likePost,
  };
}
```

### Error Recovery Strategies

```typescript
// Automatic error recovery for social features
export function useErrorRecovery() {
  const [recoveryAttempts, setRecoveryAttempts] = useState<Map<string, number>>(new Map());
  const maxRecoveryAttempts = 3;

  const attemptRecovery = useCallback(async (
    operationId: string,
    recoveryOperation: () => Promise<any>
  ) => {
    const attempts = recoveryAttempts.get(operationId) || 0;
    
    if (attempts >= maxRecoveryAttempts) {
      throw new Error(`Maximum recovery attempts exceeded for ${operationId}`);
    }

    setRecoveryAttempts(prev => new Map(prev.set(operationId, attempts + 1)));

    try {
      const result = await recoveryOperation();
      
      // Reset attempts on success
      setRecoveryAttempts(prev => {
        const newMap = new Map(prev);
        newMap.delete(operationId);
        return newMap;
      });
      
      return result;
    } catch (error) {
      // Exponential backoff before next attempt
      const delay = Math.pow(2, attempts) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      throw error;
    }
  }, [recoveryAttempts, maxRecoveryAttempts]);

  return { attemptRecovery };
}

// Offline error handling for PWA functionality
export function useOfflineErrorHandling() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<Array<{
    id: string;
    operation: () => Promise<any>;
    context: string;
  }>>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processOfflineQueue();
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const processOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0) return;

    const queue = [...offlineQueue];
    setOfflineQueue([]);

    for (const item of queue) {
      try {
        await item.operation();
        console.log(`Offline operation completed: ${item.context}`);
      } catch (error) {
        console.error(`Failed to process offline operation: ${item.context}`, error);
        
        // Re-queue failed operations
        setOfflineQueue(prev => [...prev, item]);
      }
    }
  }, [offlineQueue]);

  const queueOfflineOperation = useCallback((
    operation: () => Promise<any>,
    context: string
  ) => {
    const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setOfflineQueue(prev => [...prev, {
      id,
      operation,
      context,
    }]);
  }, []);

  return {
    isOnline,
    queueOfflineOperation,
    offlineQueueSize: offlineQueue.length,
  };
}
```

Remember: Error handling in deCentra is critical because users may be in high-stakes situations (whistleblowing, activism) where errors could have serious consequences. Always provide clear, actionable error messages and reliable recovery mechanisms.