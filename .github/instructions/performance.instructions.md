---
applyTo: "**"
---

# Performance & Optimization Instructions

## Cycle Management for Social Features

### Backend Cycle Optimization

```rust
// Cycle-efficient state management
use ic_cdk::api::instruction_counter;

// Monitor cycle usage for expensive operations
pub fn monitor_cycles<T>(operation: impl FnOnce() -> T, operation_name: &str) -> T {
    let start_cycles = instruction_counter();
    let result = operation();
    let end_cycles = instruction_counter();
    
    let used_cycles = end_cycles - start_cycles;
    if used_cycles > 1_000_000 {  // Log expensive operations
        ic_cdk::println!("Operation '{}' used {} cycles", operation_name, used_cycles);
    }
    
    result
}

// Efficient pagination to prevent cycle exhaustion
const DEFAULT_FEED_LIMIT: usize = 10;
const MAX_FEED_LIMIT: usize = 50;
const MAX_SEARCH_RESULTS: usize = 20;

pub fn get_user_feed_optimized(offset: usize, limit: usize) -> Result<Vec<Post>, String> {
    let safe_limit = std::cmp::min(limit, MAX_FEED_LIMIT);
    
    monitor_cycles(|| {
        with_state(|state| {
            let user_id = authenticate_user()?;
            
            // Get following list once
            let following = state.follows.get(&user_id).cloned().unwrap_or_default();
            
            // Pre-allocate capacity for efficiency
            let mut feed_posts = Vec::with_capacity(safe_limit);
            
            // Efficient iteration with early termination
            let mut collected = 0;
            let mut skipped = 0;
            
            for post in state.posts.values() {
                // Skip until we reach offset
                if skipped < offset {
                    skipped += 1;
                    continue;
                }
                
                // Stop when we have enough posts
                if collected >= safe_limit {
                    break;
                }
                
                // Check if post should be in feed
                if should_include_in_feed(post, &user_id, &following, state) {
                    feed_posts.push(post.clone());
                    collected += 1;
                }
            }
            
            // Sort by timestamp (most recent first)
            feed_posts.sort_by(|a, b| b.created_at.cmp(&a.created_at));
            
            Ok(feed_posts)
        })
    }, "get_user_feed")
}

// Optimized social graph operations
pub fn get_user_connections_batch(user_ids: Vec<UserId>) -> Result<HashMap<UserId, UserConnections>, String> {
    // Batch process to reduce cycles
    if user_ids.len() > 100 {
        return Err("Too many user IDs requested".into());
    }
    
    with_state(|state| {
        let mut connections = HashMap::with_capacity(user_ids.len());
        
        for user_id in user_ids {
            let followers = state.followers.get(&user_id).cloned().unwrap_or_default();
            let following = state.follows.get(&user_id).cloned().unwrap_or_default();
            
            connections.insert(user_id.clone(), UserConnections {
                followers_count: followers.len() as u32,
                following_count: following.len() as u32,
            });
        }
        
        Ok(connections)
    })
}

// Cycle-efficient content validation
pub fn validate_content_efficient(content: &str) -> Result<String, String> {
    // Early return for empty content
    if content.is_empty() {
        return Err("Content cannot be empty".into());
    }
    
    // Length check before expensive operations
    if content.len() > MAX_POST_CONTENT {
        return Err(format!("Content too long: {} chars (max: {})", content.len(), MAX_POST_CONTENT));
    }
    
    // Efficient sanitization
    let sanitized: String = content
        .chars()
        .filter(|c| !c.is_control() || *c == '\n' || *c == '\t')
        .take(MAX_POST_CONTENT)
        .collect();
    
    Ok(sanitized)
}

// Resource-aware batch operations
pub fn process_engagement_batch(actions: Vec<EngagementAction>) -> Result<BatchResult, String> {
    // Limit batch size to prevent cycle exhaustion
    if actions.len() > 50 {
        return Err("Batch size too large (max: 50)".into());
    }
    
    let mut results = Vec::with_capacity(actions.len());
    let mut cycle_budget = 10_000_000; // Reserve cycles for response
    
    for action in actions {
        let start_cycles = instruction_counter();
        
        let result = process_single_engagement(action);
        
        let used_cycles = instruction_counter() - start_cycles;
        cycle_budget = cycle_budget.saturating_sub(used_cycles);
        
        results.push(result);
        
        // Stop if running low on cycles
        if cycle_budget < 1_000_000 {
            break;
        }
    }
    
    Ok(BatchResult { results })
}
```

### Memory Management Optimization

```rust
// Efficient state management with size limits
const MAX_USERS: usize = 1_000_000;
const MAX_POSTS: usize = 10_000_000;
const MAX_COMMENTS: usize = 50_000_000;

pub fn check_storage_limits() -> Result<(), String> {
    with_state(|state| {
        if state.users.len() >= MAX_USERS {
            return Err("User storage limit reached".into());
        }
        
        if state.posts.len() >= MAX_POSTS {
            return Err("Post storage limit reached".into());
        }
        
        if state.comments.len() >= MAX_COMMENTS {
            return Err("Comment storage limit reached".into());
        }
        
        Ok(())
    })
}

// Memory-efficient data structures
use std::collections::BTreeMap;  // More memory efficient than HashMap for large datasets

#[derive(Default, CandidType, Deserialize, Clone)]
pub struct OptimizedSocialNetworkState {
    // Use BTreeMap for better memory locality
    pub users: BTreeMap<UserId, UserProfile>,
    pub posts: BTreeMap<PostId, Post>,
    
    // Index structures for fast lookups
    pub user_posts_index: BTreeMap<UserId, Vec<PostId>>,
    pub timeline_index: BTreeMap<u64, Vec<PostId>>, // timestamp -> posts
    pub hashtag_index: BTreeMap<String, Vec<PostId>>,
    
    // Compact representation for relationships
    pub social_graph: SocialGraph,
}

// Compressed storage for large datasets
pub struct CompactPost {
    pub id: PostId,
    pub author_id: UserId,
    pub content_hash: [u8; 32],  // Hash for large content
    pub metadata: PostMetadata,
    pub engagement: CompactEngagement,
}

pub struct PostMetadata {
    pub created_at: u64,
    pub visibility: u8,  // Enum as u8 to save space
    pub media_count: u8,
    pub flags: u16,      // Bitfield for boolean properties
}
```

## Frontend Performance

### Virtualized Components for Large Datasets

```typescript
// Virtualized feed for optimal performance
import { FixedSizeList as List } from 'react-window';
import { useMemo, useState, useCallback } from 'react';

export function VirtualizedSocialFeed({ 
  posts, 
  onLoadMore 
}: { 
  posts: Post[]; 
  onLoadMore: () => void; 
}) {
  const [listHeight, setListHeight] = useState(600);
  
  // Memoized row renderer for performance
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const post = posts[index];
    
    // Load more when approaching end
    if (index >= posts.length - 5) {
      onLoadMore();
    }
    
    return (
      <div style={style}>
        <PostCard 
          post={post} 
          optimized={true}
          lazyLoad={index > 20} // Lazy load images for posts below fold
        />
      </div>
    );
  }, [posts, onLoadMore]);
  
  // Memoize item count to prevent unnecessary re-renders
  const itemCount = useMemo(() => posts.length, [posts.length]);
  
  return (
    <List
      height={listHeight}
      itemCount={itemCount}
      itemSize={200} // Estimated post height
      overscanCount={5} // Render 5 extra items for smooth scrolling
    >
      {Row}
    </List>
  );
}

// Optimized post card with performance considerations
export const PostCard = React.memo(({ 
  post, 
  optimized = false,
  lazyLoad = false 
}: PostCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(!lazyLoad);
  const [isVisible, setIsVisible] = useState(!lazyLoad);
  
  // Intersection observer for lazy loading
  const observerRef = useCallback((node: HTMLDivElement) => {
    if (!lazyLoad || !node) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(node);
  }, [lazyLoad]);
  
  return (
    <article 
      ref={observerRef}
      className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
    >
      <PostHeader author={post.author} timestamp={post.createdAt} />
      
      <div className="p-4">
        <PostContent content={post.content} optimized={optimized} />
        
        {/* Lazy load images */}
        {post.mediaUrls.length > 0 && isVisible && (
          <PostMedia 
            urls={post.mediaUrls} 
            onLoad={() => setImageLoaded(true)}
            lazy={lazyLoad}
          />
        )}
      </div>
      
      <PostEngagement 
        post={post} 
        optimized={optimized}
      />
    </article>
  );
});

// Debounced search for performance
export function useDeboucedSearch(delay: number = 300) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [searching, setSearching] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
      setSearching(false);
    }, delay);
    
    if (searchTerm) {
      setSearching(true);
    }
    
    return () => clearTimeout(timer);
  }, [searchTerm, delay]);
  
  return {
    searchTerm,
    setSearchTerm,
    debouncedTerm,
    searching,
  };
}
```

### Image Optimization and Lazy Loading

```typescript
// Optimized image component with WebP support
export function OptimizedImage({ 
  src, 
  alt, 
  lazy = true,
  className = "",
  sizes = "100vw"
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy);
  
  // Intersection observer for lazy loading
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    if (!lazy || shouldLoad) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [lazy, shouldLoad]);
  
  // Generate optimized src URLs
  const getOptimizedSrc = (originalSrc: string, format: 'webp' | 'jpg' = 'webp') => {
    // Add image optimization service or CDN transformations
    // Example: https://images.decentra.io/optimize?src=${originalSrc}&format=${format}&quality=80
    return originalSrc;
  };
  
  if (!shouldLoad) {
    return (
      <div 
        ref={imgRef}
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ aspectRatio: '16/9' }}
      />
    );
  }
  
  return (
    <picture>
      {/* WebP for modern browsers */}
      <source srcSet={getOptimizedSrc(src, 'webp')} type="image/webp" />
      
      {/* Fallback */}
      <img
        ref={imgRef}
        src={getOptimizedSrc(src, 'jpg')}
        alt={alt}
        className={`transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        sizes={sizes}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </picture>
  );
}

// Progressive image loading
export function ProgressiveImage({ 
  lowQualitySrc, 
  highQualitySrc, 
  alt, 
  className 
}: ProgressiveImageProps) {
  const [highQualityLoaded, setHighQualityLoaded] = useState(false);
  
  return (
    <div className="relative">
      {/* Low quality placeholder */}
      <img
        src={lowQualitySrc}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover filter blur-sm transition-opacity ${
          highQualityLoaded ? 'opacity-0' : 'opacity-100'
        } ${className}`}
      />
      
      {/* High quality image */}
      <img
        src={highQualitySrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity ${
          highQualityLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onLoad={() => setHighQualityLoaded(true)}
      />
    </div>
  );
}
```

### State Management Optimization

```typescript
// Optimized state management with React Query
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Optimized feed loading with caching
export function useOptimizedFeed(feedType: FeedType = 'following') {
  return useInfiniteQuery({
    queryKey: ['feed', feedType],
    queryFn: async ({ pageParam = 0 }) => {
      const posts = await socialService.getUserFeed({
        offset: pageParam,
        limit: 10,
        feedType,
      });
      return posts;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 10 ? allPages.length * 10 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
}

// Optimistic updates for better UX
export function useOptimisticPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postData: CreatePostData) => {
      return await socialService.createPost(postData);
    },
    onMutate: async (newPost) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      
      // Get current feed data
      const previousFeed = queryClient.getQueryData(['feed', 'following']);
      
      // Optimistically update feed
      const optimisticPost: Post = {
        id: `temp-${Date.now()}`,
        ...newPost,
        author: getCurrentUser(),
        createdAt: BigInt(Date.now() * 1000000),
        likesCount: 0,
        commentsCount: 0,
        isOptimistic: true,
      };
      
      queryClient.setQueryData(['feed', 'following'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: [
            { ...old.pages[0], data: [optimisticPost, ...old.pages[0].data] },
            ...old.pages.slice(1),
          ],
        };
      });
      
      return { previousFeed };
    },
    onError: (err, newPost, context) => {
      // Revert optimistic update on error
      if (context?.previousFeed) {
        queryClient.setQueryData(['feed', 'following'], context.previousFeed);
      }
    },
    onSuccess: (data, variables, context) => {
      // Replace optimistic post with real data
      queryClient.setQueryData(['feed', 'following'], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          pages: old.pages.map((page: any, index: number) => {
            if (index === 0) {
              return {
                ...page,
                data: page.data.map((post: Post) => 
                  post.isOptimistic ? { ...data, isOptimistic: false } : post
                ),
              };
            }
            return page;
          }),
        };
      });
    },
  });
}

// Efficient user search with caching
export function useUserSearch() {
  const [query, setQuery] = useState('');
  const { debouncedTerm, searching } = useDeboucedSearch(300);
  
  const searchQuery = useQuery({
    queryKey: ['users', 'search', debouncedTerm],
    queryFn: async () => {
      if (!debouncedTerm.trim()) return [];
      return await socialService.searchUsers(debouncedTerm, 10);
    },
    enabled: !!debouncedTerm.trim(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
  
  return {
    query,
    setQuery,
    users: searchQuery.data || [],
    isSearching: searching || searchQuery.isLoading,
    error: searchQuery.error,
  };
}
```

### Bundle Optimization

```typescript
// Code splitting for route-based optimization
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load components
const Feed = lazy(() => import('./components/Feed'));
const Profile = lazy(() => import('./components/Profile'));
const Settings = lazy(() => import('./components/Settings'));
const CreatorDashboard = lazy(() => import('./components/CreatorDashboard'));

export function App() {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <Suspense fallback={<FeedSkeleton />}>
            <Feed />
          </Suspense>
        } 
      />
      <Route 
        path="/profile/:userId" 
        element={
          <Suspense fallback={<ProfileSkeleton />}>
            <Profile />
          </Suspense>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <Suspense fallback={<SettingsSkeleton />}>
            <Settings />
          </Suspense>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <Suspense fallback={<DashboardSkeleton />}>
            <CreatorDashboard />
          </Suspense>
        } 
      />
    </Routes>
  );
}

// Preload critical components
export function preloadCriticalComponents() {
  // Preload components that are likely to be used
  import('./components/Feed');
  import('./components/PostCard');
  import('./components/UserAvatar');
}

// Service worker for caching
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  }
}
```

### Performance Monitoring

```typescript
// Performance monitoring hooks
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Monitor Core Web Vitals
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    });
    
    // Monitor custom metrics
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure') {
          console.log(`${entry.name}: ${entry.duration}ms`);
        }
      });
    });
    
    observer.observe({ entryTypes: ['measure'] });
    
    return () => observer.disconnect();
  }, []);
}

// Component performance measurement
export function measureComponentPerformance(componentName: string) {
  return function <T extends React.ComponentType<any>>(Component: T): T {
    const MeasuredComponent = (props: any) => {
      useEffect(() => {
        performance.mark(`${componentName}-start`);
        
        return () => {
          performance.mark(`${componentName}-end`);
          performance.measure(
            `${componentName}-render`,
            `${componentName}-start`,
            `${componentName}-end`
          );
        };
      }, []);
      
      return <Component {...props} />;
    };
    
    return MeasuredComponent as T;
  };
}

// Usage example
export const MeasuredPostCard = measureComponentPerformance('PostCard')(PostCard);
```

Remember: Always monitor cycle usage on the backend and implement proper pagination, lazy loading, and caching strategies on the frontend to ensure optimal performance as deCentra scales.