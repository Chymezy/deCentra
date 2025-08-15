---
applyTo: "**"
---

# Code Quality Standards for deCentra

## CERT Compliance Integration

All code must follow the security standards defined in `cert-rust.instructions.md`. This file supplements those standards with project-specific quality requirements.

## Social Network Best Practices

### Privacy-First Design
- Default to most private settings
- Make privacy controls obvious and accessible
- Never log or expose user identifiers
- Implement granular privacy controls

### Performance Patterns
```rust
// Backend: Efficient pagination for social feeds
const DEFAULT_FEED_LIMIT: usize = 10;
const MAX_FEED_LIMIT: usize = 50;

pub fn get_feed(offset: usize, limit: usize) -> Result<Vec<Post>, String> {
    let safe_limit = std::cmp::min(limit, MAX_FEED_LIMIT);
    // Implementation with proper bounds checking
}
```

```typescript
// Frontend: Virtualized components for large datasets
export function usePaginatedFeed(feedType: FeedType) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const newPosts = await SocialService.getFeed(feedType, posts.length, 10);
      setPosts(prev => [...prev, ...newPosts]);
      setHasMore(newPosts.length === 10);
    } finally {
      setLoading(false);
    }
  }, [posts.length, loading, hasMore, feedType]);

  return { posts, loadMore, loading, hasMore };
}
```

### Accessibility Requirements

#### WCAG 2.1 AA Compliance
- Color contrast ratio ≥ 4.5:1 for normal text
- Color contrast ratio ≥ 3:1 for large text
- All interactive elements must be keyboard accessible
- Screen reader compatibility for all social features

```typescript
// Accessible social component example
export function AccessiblePostCard({ post, author }: PostCardProps) {
  const postTimeAgo = a11y.getTimeAgo(post.createdAt);
  const ariaLabel = a11y.getPostAriaLabel(post, author);

  return (
    <article
      className="bg-white rounded-lg shadow-sm border focus-within:ring-2 focus-within:ring-blue-500"
      aria-labelledby={`post-${post.id}-author`}
      aria-describedby={`post-${post.id}-content`}
    >
      <header className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <UserAvatar 
            user={author} 
            className="flex-shrink-0"
            aria-hidden="true" 
          />
          <div className="min-w-0 flex-1">
            <h3 
              id={`post-${post.id}-author`}
              className="font-semibold text-gray-900 truncate"
            >
              {author.displayName || author.username}
            </h3>
            <time 
              dateTime={new Date(Number(post.createdAt / 1000000n)).toISOString()}
              className="text-sm text-gray-500"
            >
              {postTimeAgo}
            </time>
          </div>
        </div>
      </header>
      
      <div className="p-4">
        <p 
          id={`post-${post.id}-content`}
          className="text-gray-900 whitespace-pre-wrap"
        >
          {post.content}
        </p>
      </div>
      
      <footer className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between">
          <EngagementButton
            type="like"
            count={post.likesCount}
            isActive={post.isLiked}
            aria-label={`${post.isLiked ? 'Unlike' : 'Like'} post by ${author.displayName || author.username}`}
          />
          <EngagementButton
            type="comment"
            count={post.commentsCount}
            aria-label={`Comment on post by ${author.displayName || author.username}`}
          />
          <EngagementButton
            type="tip"
            count={Number(post.tipsReceived)}
            aria-label={`Tip ${author.displayName || author.username} for this post`}
          />
        </div>
      </footer>
    </article>
  );
}
```

## Code Organization Standards

### File Structure
```
src/
├── backend/           # Rust canister code
│   ├── types/        # Domain types and data structures
│   ├── auth/         # Authentication and authorization
│   ├── validation/   # Input validation utilities
│   ├── social/       # Social network business logic
│   └── api/          # Public API endpoints
├── frontend/         # React application
│   ├── app/          # Main application entry point (Next.js)
│   ├── components/   # Reusable UI components
│   └── lib/          # Shared libraries and utilities
│       ├── config/          # Configuration centralization ✓
│       ├── contexts/        # React context providers ✓  
│       ├── services/        # Business logic separation ✓
│       ├── types/           # Type definitions ✓
│       ├── utils/           # Utility functions ✓
│       └── hooks/           # Custom hooks (good pattern)
└── tests/           # Test files
```

### Naming Conventions
- **Backend (Rust)**: `snake_case` for functions, `PascalCase` for types
- **Frontend (TypeScript)**: `camelCase` for variables/functions, `PascalCase` for components
- **Constants**: `UPPER_SNAKE_CASE` for both backend and frontend
- **Files**: `kebab-case` for all file names

### Documentation Requirements
- All public functions must have doc comments
- Complex algorithms require inline comments
- API endpoints need usage examples
- Components need prop interface documentation

```rust
/// Creates a new user profile with privacy controls
/// 
/// # Arguments
/// * `username` - Unique identifier for the user (3-50 chars, alphanumeric + _ -)
/// * `display_name` - Optional public display name
/// * `bio` - Optional user biography (max 500 chars)
/// 
/// # Returns
/// * `Ok(UserProfile)` - Successfully created profile
/// * `Err(String)` - Validation error or username already taken
/// 
/// # Security
/// * Requires authenticated user (no anonymous)
/// * Validates all input parameters
/// * Sanitizes text content
#[ic_cdk::update]
pub async fn create_user_profile(
    username: String,
    display_name: Option<String>,
    bio: Option<String>
) -> Result<UserProfile, String> {
    // Implementation...
}
```

```typescript
/**
 * Hook for managing user authentication state with Internet Identity
 * 
 * @returns Object containing:
 *   - authState: Current authentication status and user profile
 *   - login: Function to initiate Internet Identity login flow
 *   - logout: Function to log out current user
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { authState, login, logout } = useAuth();
 *   
 *   if (!authState.isAuthenticated) {
 *     return <button onClick={login}>Login</button>;
 *   }
 *   
 *   return <div>Welcome, {authState.userProfile?.username}</div>;
 * }
 * ```
 */
export function useAuth(): AuthHookReturn {
  // Implementation...
}
```

## Testing Standards

### Backend Testing Requirements
- Unit tests for all business logic functions
- Security tests for authentication/authorization
- Integration tests for social network workflows
- Performance tests for resource usage

### Frontend Testing Requirements
- Component tests for all social features
- Authentication flow tests
- Accessibility tests with @testing-library/jest-dom
- Visual regression tests for UI components

### Test Naming Convention
```rust
#[cfg(test)]
mod tests {
    #[test]
    fn test_create_post_success() {
        // Test successful post creation
    }
    
    #[test]
    fn test_create_post_requires_auth() {
        // Test authentication requirement
    }
    
    #[test]
    fn security_test_post_content_validation() {
        // Test input validation
    }
}
```

```typescript
describe('PostCard Component', () => {
  it('should render post content correctly', () => {
    // Test rendering
  });
  
  it('should require authentication for engagement', () => {
    // Test auth requirements
  });
  
  it('should be accessible to screen readers', () => {
    // Test accessibility
  });
});
```

## Performance Standards

### Backend Performance
- All endpoints must respond within 2 seconds under normal load
- Batch operations limited to prevent DoS attacks
- Efficient state management with proper indexing
- Resource usage monitoring and limits

### Frontend Performance
- Initial page load under 3 seconds
- Smooth scrolling with virtualized feeds
- Optimistic updates for social interactions
- Proper lazy loading for images and components

## Security Checklist

Before any code review approval:
- [ ] Authentication verified for all state-changing operations
- [ ] Input validation with proper size limits
- [ ] No use of .unwrap(), .expect(), or panic! in production code
- [ ] Error messages don't leak sensitive information
- [ ] Resource limits prevent DoS attacks
- [ ] Privacy settings respected in all operations
- [ ] Security tests included for new functionality