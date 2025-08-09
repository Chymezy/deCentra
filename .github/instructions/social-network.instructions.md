---
applyTo: "**"
---

# Social Network Feature Instructions for deCentra

## Mission Statement

deCentra is building the social network for a free and open internet where governments can't ban users, corporations can't sell user data, and communities govern themselves. Every feature must align with these core principles.

## Core Social Features

### User Management
- Use Internet Identity for authentication
- Store user profiles with privacy controls
- Implement username uniqueness validation
- Support profile customization (bio, avatar, display name)

### Content System
- Posts support text, images, and links
- Character limits for content (MAX_POST_CONTENT = 10,000)
- Content moderation hooks for future DAO implementation
- Edit history tracking for transparency

### Social Graph
- Follow/unfollow relationships
- Follower/following counts
- Privacy controls (public/private profiles)
- Block functionality for user safety

### Engagement Features
- Like/unlike posts and comments
- Comment threading (up to 3 levels deep)
- Repost functionality
- Real-time engagement counts

### Feed Algorithm
- Chronological feed for MVP
- Following-based content filtering
- Trending content discovery
- Search functionality (users and content)

### Privacy & Safety
- Content reporting system
- User blocking
- Privacy settings
- Data export functionality

## Social Network Architecture Principles

### 1. Censorship Resistance
- All data stored 100% on-chain
- No single points of failure
- Decentralized content moderation via DAO
- Anonymous whistleblowing capabilities

### 2. User Data Ownership
- Users control their own data
- Exportable profiles and content
- Privacy-first design
- Transparent data handling

### 3. Community Governance
- DAO-based content moderation
- Community-driven policy decisions
- Transparent voting mechanisms
- User appeals process

## Implementation Patterns

### Backend (Rust)
```rust
// Social graph management
pub fn follow_user(target_user: UserId) -> Result<(), String> {
    let caller = authenticate_user()?;
    
    if caller == target_user {
        return Err("Cannot follow yourself".into());
    }
    
    // Check if already following
    if is_following(&caller, &target_user)? {
        return Err("Already following this user".into());
    }
    
    create_follow_relationship(caller, target_user)
}
```

### Frontend (React)
```typescript
// Social interaction components
export function FollowButton({ userId }: { userId: string }) {
  const { authState } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    if (!authState.isAuthenticated) {
      // Prompt login
      return;
    }

    try {
      setLoading(true);
      if (isFollowing) {
        await backend.unfollow_user(userId);
      } else {
        await backend.follow_user(userId);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Follow action failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`px-4 py-2 rounded-md ${
        isFollowing 
          ? 'bg-gray-200 text-gray-800' 
          : 'bg-blue-500 text-white'
      }`}
    >
      {loading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
}
```

## Content Guidelines

### Post Content
- Support markdown formatting
- Image uploads via URL (IPFS integration planned)
- Link previews
- Hashtag support
- Mention support (@username)

### Comment System
- Threaded replies
- Like/unlike comments
- Comment moderation
- Reply notifications

### Search & Discovery
- User search by username/display name
- Content search by keywords
- Hashtag trending
- Recommended users

## Core Social Features Implementation

### User Management System
```rust
// Profile creation with privacy controls
pub struct UserProfile {
    pub id: UserId,
    pub username: String,           // Public identifier
    pub display_name: Option<String>, // Optional public name
    pub bio: Option<String>,        // User description
    pub avatar_url: Option<String>, // Profile picture
    pub privacy_settings: PrivacySettings,
    pub verification_status: VerificationStatus,
    pub created_at: u64,
}

pub struct PrivacySettings {
    pub profile_visibility: Visibility,
    pub post_visibility_default: Visibility,
    pub allow_followers: bool,
    pub allow_direct_messages: bool,
    pub show_online_status: bool,
}

pub enum VerificationStatus {
    None,
    Verified,        // Community verified
    Whistleblower,   // Anonymous but verified source
    Organization,    // Verified organization/NGO
}
```

### Content Management System
```rust
// Post types for different content
pub enum PostType {
    Text(String),
    Media(String, Vec<String>), // content + media URLs
    Poll(String, Vec<PollOption>),
    Whistleblower(EncryptedContent), // Special encrypted posts
}

pub struct Post {
    pub id: PostId,
    pub author_id: UserId,
    pub post_type: PostType,
    pub visibility: PostVisibility,
    pub tags: Vec<String>,          // For discoverability
    pub engagement: EngagementMetrics,
    pub moderation_status: ModerationStatus,
    pub created_at: u64,
    pub edited_at: Option<u64>,
}

pub enum PostVisibility {
    Public,                    // Everyone can see
    FollowersOnly,            // Only followers
    Unlisted,                 // Accessible by direct link
    Encrypted,                // For whistleblowing
}

pub enum ModerationStatus {
    Active,
    Flagged(Vec<Flag>),
    UnderReview,
    DAOApproved,
    DAORemoved(String),       // Reason for removal
}
```

### Social Graph Management
```rust
// Relationship types
pub enum RelationshipType {
    Follow,
    Block,
    Mute,
}

pub struct SocialGraph {
    pub relationships: HashMap<(UserId, UserId), RelationshipType>,
    pub follower_counts: HashMap<UserId, u32>,
    pub following_counts: HashMap<UserId, u32>,
}

// Follow system with privacy controls
pub fn follow_user(target_user_id: UserId) -> Result<(), String> {
    let current_user_id = authenticate_user()?;
    
    // Check if target user allows followers
    let target_user = get_user_profile(&target_user_id)?;
    if !target_user.privacy_settings.allow_followers {
        return Err("User is not accepting followers".into());
    }
    
    // Implement follow logic
    create_relationship(current_user_id, target_user_id, RelationshipType::Follow)
}
```

### Engagement System
```rust
// Engagement types with context
pub enum EngagementAction {
    Like,
    Dislike,
    Repost(Option<String>),   // Optional comment on repost
    Comment(CommentId),
    Share(ShareContext),
    Tip(u64),                 // ICP amount in e8s
}

pub struct EngagementMetrics {
    pub likes: u32,
    pub dislikes: u32,
    pub reposts: u32,
    pub comments: u32,
    pub shares: u32,
    pub tips_received: u64,   // Total ICP received
}

// Like system with tip integration
pub fn engage_with_post(
    post_id: PostId, 
    action: EngagementAction
) -> Result<(), String> {
    let user_id = authenticate_user()?;
    
    match action {
        EngagementAction::Like => add_like(post_id, user_id),
        EngagementAction::Tip(amount) => process_tip(post_id, user_id, amount),
        _ => process_engagement(post_id, user_id, action),
    }
}
```

### Content Discovery & Feed Algorithm
```rust
// Feed generation strategies
pub enum FeedType {
    Chronological,            // Time-based
    Algorithmic,              // Engagement-based
    Following,                // Only followed users
    Trending,                 // Community trending
    Topic(String),            // Specific topic/hashtag
}

// Search functionality
pub struct SearchQuery {
    pub query: String,
    pub search_type: SearchType,
    pub filters: SearchFilters,
}

pub enum SearchType {
    Users,
    Posts,
    Topics,
    Mixed,
}

pub struct SearchFilters {
    pub date_range: Option<(u64, u64)>,
    pub user_verification: Option<VerificationStatus>,
    pub post_visibility: Option<PostVisibility>,
    pub content_type: Option<PostType>,
}
```

### Privacy & Safety Features
```rust
// Content reporting system
pub struct ContentReport {
    pub id: ReportId,
    pub reporter_id: UserId,
    pub target_content: ContentReference,
    pub report_type: ReportType,
    pub description: String,
    pub status: ReportStatus,
    pub created_at: u64,
}

pub enum ReportType {
    Spam,
    Harassment,
    Misinformation,
    Copyright,
    Violence,
    Other(String),
}

pub enum ReportStatus {
    Pending,
    UnderReview,
    Resolved(ResolutionAction),
    Dismissed,
}

// Block and mute functionality
pub fn block_user(target_user_id: UserId) -> Result<(), String> {
    let current_user_id = authenticate_user()?;
    
    // Remove existing follow relationship if any
    remove_relationship(current_user_id.clone(), target_user_id.clone())?;
    
    // Add block relationship
    create_relationship(current_user_id, target_user_id, RelationshipType::Block)
}
```

### Monetization Features
```rust
// Creator monetization
pub struct CreatorProfile {
    pub user_id: UserId,
    pub subscription_price: Option<u64>,  // Monthly price in ICP e8s
    pub tip_jar_enabled: bool,
    pub premium_content_enabled: bool,
    pub analytics_enabled: bool,
}

// Micro-tipping system
pub fn tip_creator(
    post_id: PostId, 
    amount: u64
) -> Result<TransactionId, String> {
    let tipper_id = authenticate_user()?;
    let post = get_post(&post_id)?;
    
    // Validate tip amount
    if amount < MIN_TIP_AMOUNT {
        return Err("Tip amount too small".into());
    }
    
    // Process ICP transfer
    transfer_icp(tipper_id, post.author_id, amount)
}
```

## Frontend Implementation Patterns

### Authentication Integration
```typescript
// Internet Identity hook with social context
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    principal: null,
    userProfile: null,
    isLoading: true,
  });

  const login = async () => {
    try {
      const authClient = await AuthClient.create();
      await authClient.login({
        identityProvider: "https://identity.ic0.app",
        onSuccess: async () => {
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal().toString();
          
          // Check if user has a profile
          const profile = await UserService.getUserProfile();
          
          setAuthState({
            isAuthenticated: true,
            principal,
            userProfile: profile,
            isLoading: false,
          });
        },
      });
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  };

  return { authState, login, logout };
}
```

### Social Feed Components
```typescript
// Infinite scroll feed with real-time updates
export function SocialFeed({ feedType = 'following' }: { feedType?: FeedType }) {
  const { authState } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = useCallback(async (offset: number = 0) => {
    if (!authState.isAuthenticated) return;

    try {
      setLoading(true);
      const newPosts = await PostService.getFeed(feedType, offset, 10);
      
      if (offset === 0) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setHasMore(newPosts.length === 10);
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setLoading(false);
    }
  }, [feedType, authState.isAuthenticated]);

  return (
    <InfiniteScroll
      dataLength={posts.length}
      next={() => loadPosts(posts.length)}
      hasMore={hasMore}
      loader={<PostSkeleton />}
    >
      <div className="space-y-4">
        {posts.map(post => (
          <PostCard 
            key={post.id} 
            post={post}
            onLike={handleLike}
            onTip={handleTip}
            onShare={handleShare}
          />
        ))}
      </div>
    </InfiniteScroll>
  );
}
```

### Creator Dashboard
```typescript
// Analytics and monetization dashboard
export function CreatorDashboard() {
  const { authState } = useAuth();
  const [analytics, setAnalytics] = useState<CreatorAnalytics | null>(null);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);

  useEffect(() => {
    if (authState.userProfile?.creatorProfile) {
      loadCreatorData();
    }
  }, [authState.userProfile]);

  const loadCreatorData = async () => {
    const [analyticsData, earningsData] = await Promise.all([
      AnalyticsService.getCreatorAnalytics(),
      MonetizationService.getEarnings(),
    ]);
    
    setAnalytics(analyticsData);
    setEarnings(earningsData);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnalyticsCard analytics={analytics} />
      <EarningsCard earnings={earnings} />
      <EngagementCard analytics={analytics} />
    </div>
  );
}
```

## DAO Governance Integration

### Moderation Proposals
```rust
// DAO voting for content moderation
pub struct ModerationProposal {
    pub id: ProposalId,
    pub content_reference: ContentReference,
    pub action: ProposedAction,
    pub reason: String,
    pub proposer: UserId,
    pub votes: VoteTracker,
    pub status: ProposalStatus,
    pub created_at: u64,
    pub voting_deadline: u64,
}

pub enum ProposedAction {
    RemoveContent,
    WarningLabel,
    ShadowBan,
    AccountSuspension(u64), // Duration in seconds
    NoAction,
}

pub fn submit_moderation_proposal(
    content_ref: ContentReference,
    action: ProposedAction,
    reason: String
) -> Result<ProposalId, String> {
    let proposer = authenticate_user()?;
    
    // Check proposer has sufficient reputation
    if !has_moderation_privileges(&proposer)? {
        return Err("Insufficient privileges to propose moderation".into());
    }
    
    create_moderation_proposal(content_ref, action, reason, proposer)
}
```

## Development Guidelines

### Backend Development
1. **Always authenticate** before state changes
2. **Validate all inputs** with size and content limits
3. **Use strong typing** for all domain concepts
4. **Implement resource limits** to prevent DoS
5. **Add comprehensive tests** for social interactions

### Frontend Development
1. **Handle authentication state** properly
2. **Implement optimistic updates** for better UX
3. **Use proper loading states** for all async operations
4. **Add accessibility** features for inclusive design
5. **Implement proper error boundaries** for resilience

### Security Priorities
1. **User privacy** is paramount
2. **Content integrity** must be maintained
3. **Spam prevention** is essential
4. **Resource protection** prevents abuse
5. **Transparent moderation** builds trust

Remember: Every feature should enhance user freedom, privacy, and community self-governance while maintaining a high-quality social experience.