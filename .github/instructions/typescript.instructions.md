---
applyTo: "**/*.tsx"
---

# TypeScript Instructions for deCentra Social Network Frontend

## Type Safety

- Follow TypeScript best practices with proper type annotations
- Define interfaces for all props, state, and API responses
- Avoid `any` type - use proper typing or `unknown` when necessary

## Canister Integration Types

Define types for all canister interactions:

```typescript
// Define response types
interface UserData {
  id: string;
  name: string;
  email?: string;
}

// Service function with proper typing
export async function fetchUserData(userId: string): Promise<UserData> {
  try {
    return await backend.get_user_data(userId);
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    throw error;
  }
}
```

## Social Network Type Patterns

```typescript
// Core domain types for social network
export interface User {
  id: string; // Principal as string
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: bigint;
  privacySettings: PrivacySettings;
  verificationStatus: VerificationStatus;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  mediaUrls: string[];
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  tipsReceived: bigint;
  createdAt: bigint;
  editedAt?: bigint;
  visibility: PostVisibility;
  isLiked?: boolean; // For current user context
  isTipped?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  likesCount: number;
  createdAt: bigint;
  parentCommentId?: string; // For threading
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'followers' | 'private';
  postVisibilityDefault: 'public' | 'followers' | 'private';
  allowFollowers: boolean;
  allowDirectMessages: boolean;
  showOnlineStatus: boolean;
}

export type VerificationStatus = 'none' | 'verified' | 'whistleblower' | 'organization';
export type PostVisibility = 'public' | 'followers' | 'unlisted' | 'encrypted';
```

## Internet Identity Integration

```typescript
// Authentication state management for social network
export interface AuthState {
  isAuthenticated: boolean;
  principal: string | null;
  userProfile: User | null;
  isLoading: boolean;
  error: string | null;
}

// Enhanced authentication hook with profile management
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    principal: null,
    userProfile: null,
    isLoading: true,
    error: null,
  });

  const login = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const authClient = await AuthClient.create();
      await authClient.login({
        identityProvider: "https://identity.ic0.app",
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days
        onSuccess: async () => {
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal().toString();
          
          try {
            // Check if user has a profile
            const profile = await UserService.getUserProfile();
            
            setAuthState({
              isAuthenticated: true,
              principal,
              userProfile: profile,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            // User exists but no profile yet
            setAuthState({
              isAuthenticated: true,
              principal,
              userProfile: null,
              isLoading: false,
              error: null,
            });
          }
        },
        onError: (error) => {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            error: "Authentication failed",
          }));
        },
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: "Authentication failed",
      }));
    }
  };

  const logout = async () => {
    const authClient = await AuthClient.create();
    await authClient.logout();
    setAuthState({
      isAuthenticated: false,
      principal: null,
      userProfile: null,
      isLoading: false,
      error: null,
    });
  };

  return { authState, login, logout };
}
```

## Service Layer Patterns

```typescript
// Type-safe canister service integration
export class SocialNetworkService {
  constructor(private actor: ActorSubclass<_SERVICE>) {}

  async createPost(content: string): Promise<{ success: string } | { error: string }> {
    try {
      const result = await this.actor.create_post(content);
      return 'success' in result 
        ? { success: result.success }
        : { error: result.error };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create post' };
    }
  }

  async getUserFeed(offset: number = 0, limit: number = 10): Promise<Post[]> {
    try {
      const result = await this.actor.get_user_feed(offset, limit);
      if ('success' in result) {
        return result.success.map(this.transformPost);
      }
      throw new Error(result.error);
    } catch (error) {
      console.error('Failed to get user feed:', error);
      return [];
    }
  }

  private transformPost = (post: any): Post => ({
    id: post.id.toString(),
    authorId: post.author_id.toString(),
    content: post.content,
    mediaUrls: post.media_urls,
    likesCount: Number(post.likes_count),
    commentsCount: Number(post.comments_count),
    repostsCount: Number(post.reposts_count),
    tipsReceived: BigInt(post.tips_received),
    createdAt: BigInt(post.created_at),
    editedAt: post.edited_at ? BigInt(post.edited_at) : undefined,
    visibility: post.visibility,
  });
}
```

## Error Handling for Canister Calls

```typescript
// Standardized error handling for social network features
export async function handleCanisterCall<T>(
  operation: () => Promise<T>,
  errorMessage: string = "Operation failed"
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    
    if (error instanceof Error) {
      if (error.message.includes("Anonymous")) {
        throw new Error("Please log in to continue");
      }
      if (error.message.includes("Unauthorized")) {
        throw new Error("You don't have permission for this action");
      }
      if (error.message.includes("Authentication required")) {
        throw new Error("Please log in to continue");
      }
      if (error.message.includes("Rate limit")) {
        throw new Error("Please wait before trying again");
      }
    }
    
    throw new Error(errorMessage);
  }
}

// Usage in components
export function useCreatePost() {
  const [loading, setLoading] = useState(false);
  
  const createPost = async (content: string) => {
    setLoading(true);
    try {
      await handleCanisterCall(
        () => SocialService.createPost(content),
        "Failed to create post"
      );
    } finally {
      setLoading(false);
    }
  };
  
  return { createPost, loading };
}
```

## Social Component Patterns

```typescript
// Reusable social interaction hooks
export function usePostEngagement(postId: string) {
  const [engagement, setEngagement] = useState<{
    isLiked: boolean;
    likesCount: number;
    isLoading: boolean;
  }>({
    isLiked: false,
    likesCount: 0,
    isLoading: false,
  });

  const toggleLike = async () => {
    setEngagement(prev => ({ ...prev, isLoading: true }));
    
    try {
      if (engagement.isLiked) {
        await SocialService.unlikePost(postId);
        setEngagement(prev => ({
          isLiked: false,
          likesCount: prev.likesCount - 1,
          isLoading: false,
        }));
      } else {
        await SocialService.likePost(postId);
        setEngagement(prev => ({
          isLiked: true,
          likesCount: prev.likesCount + 1,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
      setEngagement(prev => ({ ...prev, isLoading: false }));
    }
  };

  return { engagement, toggleLike };
}

// Privacy-aware component wrapper
export function withPrivacyCheck<T>(
  Component: React.ComponentType<T>,
  requiredPermission: keyof PrivacySettings
) {
  return function PrivacyCheckedComponent(props: T & { user: User }) {
    const { user, ...otherProps } = props;
    
    if (!user.privacySettings[requiredPermission]) {
      return (
        <div className="text-gray-500 text-center p-4">
          This content is private
        </div>
      );
    }
    
    return <Component {...(otherProps as T)} />;
  };
}
```

## Form Validation Patterns

```typescript
// Social network specific validation
export const socialValidation = {
  username: (value: string) => {
    if (!value) return "Username is required";
    if (value.length < 3) return "Username must be at least 3 characters";
    if (value.length > 50) return "Username cannot exceed 50 characters";
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      return "Username can only contain letters, numbers, underscores, and hyphens";
    }
    return null;
  },

  postContent: (value: string) => {
    if (!value.trim()) return "Post content cannot be empty";
    if (value.length > 10000) return "Post content cannot exceed 10,000 characters";
    return null;
  },

  bio: (value: string) => {
    if (value.length > 500) return "Bio cannot exceed 500 characters";
    return null;
  },
};

// Form hook for social features
export function useSocialForm<T>(
  initialValues: T,
  validationRules: Partial<Record<keyof T, (value: any) => string | null>>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validate = (field?: keyof T) => {
    const fieldsToValidate = field ? [field] : Object.keys(validationRules) as (keyof T)[];
    const newErrors: Partial<Record<keyof T, string>> = {};

    fieldsToValidate.forEach(key => {
      const validator = validationRules[key];
      if (validator) {
        const error = validator(values[key]);
        if (error) {
          newErrors[key] = error;
        }
      }
    });

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const setValue = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    // Validate on change for immediate feedback
    setTimeout(() => validate(field), 0);
  };

  return {
    values,
    errors,
    touched,
    setValue,
    validate,
    isValid: Object.keys(errors).length === 0,
  };
}
```

## Performance Optimization

```typescript
// Virtualized components for large social feeds
export function VirtualizedPostList({ posts }: { posts: Post[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: posts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Estimated post height
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <PostCard post={posts[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Optimistic updates for better UX
export function useOptimisticUpdates<T>(
  initialData: T[],
  updateFn: (data: T[]) => Promise<T[]>
) {
  const [data, setData] = useState<T[]>(initialData);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, T>>(new Map());

  const addOptimisticUpdate = (id: string, update: T) => {
    setOptimisticUpdates(prev => new Map(prev.set(id, update)));
  };

  const commitUpdates = async () => {
    try {
      const updatedData = await updateFn(data);
      setData(updatedData);
      setOptimisticUpdates(new Map());
    } catch (error) {
      // Revert optimistic updates on failure
      setOptimisticUpdates(new Map());
      throw error;
    }
  };

  const displayData = useMemo(() => {
    const result = [...data];
    optimisticUpdates.forEach((update, id) => {
      const index = result.findIndex(item => (item as any).id === id);
      if (index >= 0) {
        result[index] = update;
      } else {
        result.unshift(update);
      }
    });
    return result;
  }, [data, optimisticUpdates]);

  return {
    data: displayData,
    addOptimisticUpdate,
    commitUpdates,
  };
}
```

## Accessibility Helpers

```typescript
// Accessibility utilities for social features
export const a11y = {
  announceToScreenReader: (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  },

  getPostAriaLabel: (post: Post, author: User) => 
    `Post by ${author.displayName || author.username}. ${post.content}. ${post.likesCount} likes, ${post.commentsCount} comments.`,

  getTimeAgo: (timestamp: bigint) => {
    const now = Date.now();
    const postTime = Number(timestamp / 1000000n); // Convert nanoseconds to milliseconds
    const diffInMinutes = Math.floor((now - postTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  },
};
```

## Remember

- Always handle authentication state properly in social components
- Use optimistic updates for better user experience
- Implement proper error boundaries for social features
- Follow accessibility guidelines for inclusive design
- Use proper TypeScript patterns for type safety with canister integration
