---
mode: "agent"
description: "Optimize deCentra for better performance and cycle efficiency"
---

# Performance Optimization for deCentra

## Context
Optimize ICP canister performance to reduce cycle costs and improve user experience while maintaining censorship resistance.

## Backend Optimizations (Rust + ic-cdk)

### Cycle Management
```rust
// Monitor and limit cycle usage
pub fn monitor_cycles<T>(operation: impl FnOnce() -> T) -> T {
    let start = ic_cdk::api::instruction_counter();
    let result = operation();
    let used = ic_cdk::api::instruction_counter() - start;
    if used > 1_000_000 { ic_cdk::println!("High cycle usage: {}", used); }
    result
}

// Efficient pagination
const MAX_FEED_LIMIT: usize = 50;
pub fn get_feed_optimized(offset: usize, limit: usize) -> Result<Vec<Post>, String> {
    let safe_limit = std::cmp::min(limit, MAX_FEED_LIMIT);
    // Implementation with early termination
}

// Batch operations
pub fn process_engagement_batch(actions: Vec<EngagementAction>) -> Result<(), String> {
    if actions.len() > 50 { return Err("Batch too large".into()); }
    // Process with cycle budget monitoring
}
```

### Memory Optimization
```rust
// Use BTreeMap for better memory locality
pub struct OptimizedState {
    pub users: BTreeMap<UserId, UserProfile>,
    pub posts: BTreeMap<PostId, Post>,
    pub indexes: HashMap<String, Vec<PostId>>, // Pre-computed indexes
}

// Compact data structures
pub struct CompactPost {
    pub id: PostId,
    pub author_id: UserId,
    pub content_hash: [u8; 32],
    pub engagement_count: u32,
    pub created_at: u64,
}
```

## Frontend Optimizations (React + TypeScript)

### Virtualized Components
```typescript
// Virtual scrolling for feeds
import { FixedSizeList as List } from 'react-window';

export function VirtualizedFeed({ posts }: { posts: Post[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}><PostCard post={posts[index]} /></div>
  );
  
  return <List height={600} itemCount={posts.length} itemSize={200}>{Row}</List>;
}

// Lazy loading with Intersection Observer
export function LazyPostCard({ post }: { post: Post }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  
  return <div ref={ref}>{isVisible ? <PostCard post={post} /> : <PostSkeleton />}</div>;
}
```

### Caching & State Management
```typescript
// React Query for caching
export function useFeed() {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam = 0 }) => fetchFeed(pageParam),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Optimistic updates
export function useOptimisticLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => likePost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries(['posts']);
      queryClient.setQueryData(['posts'], (old: any) => 
        old.map((post: Post) => 
          post.id === postId ? { ...post, likesCount: post.likesCount + 1 } : post
        )
      );
    },
  });
}
```

## Performance Targets
- Feed load time: < 2 seconds
- Post creation: < 1 second
- Search results: < 3 seconds
- Cycle usage per operation: < 10M cycles
- Memory usage: < 2GB stable storage

## Monitoring
```rust
// Performance metrics collection
pub fn track_performance_metric(operation: &str, duration_ms: u64, cycles_used: u64) {
    // Log to stable storage for analysis
}

// Health check endpoint
#[ic_cdk::query]
pub fn health_check() -> HealthStatus {
    HealthStatus {
        memory_usage: ic_cdk::api::stable::stable_size(),
        cycle_balance: ic_cdk::api::canister_balance(),
        active_users: get_active_user_count(),
    }
}
```