---
mode: "agent"
description: "Add a social network feature to the React frontend for deCentra"
---

# Add Frontend Feature Instructions for deCentra Social Network

## Context & Mission

You are building the frontend for **deCentra**, a fully on-chain, censorship-resistant social network. The UI should embody the principles of freedom, privacy, and community governance while providing an excellent user experience.

## Relevant Instructions

**CRITICAL**: Search codebase and read these instruction files:
- `typescript.instructions.md`
- `frontend-test.instructions.md`
- `social-network.instructions.md`
- `general.instructions.md`

## Social Network Frontend Context

### Brand Identity
- **Colors**: Deep Indigo (#4B0082), Electric Blue (#0F62FE), Vibrant Orange (#FF6F00)
- **Typography**: Inter/Poppins for headings, Roboto/Open Sans for body text
- **Design Philosophy**: Clean, modern, privacy-focused, community-driven

### User Experience Principles
- **Privacy by Default**: Clear privacy controls and settings
- **Censorship Resistance**: Obvious decentralized nature and benefits
- **Community Governance**: Transparent moderation and DAO features
- **Creator Empowerment**: Built-in monetization and analytics
- **Accessibility**: Inclusive design for global users

## Target User Scenarios

### 1. **Whistleblower Protection**
- Anonymous posting capabilities
- Encrypted communication interfaces
- Identity protection features
- Secure authentication flows

### 2. **Creator Monetization**
- Tip jar interfaces
- Creator analytics dashboards
- Subscription management
- Revenue tracking

### 3. **Community Governance**
- DAO voting interfaces
- Moderation proposal systems
- Transparent decision making
- Appeal processes

### 4. **Privacy-Conscious Users**
- Granular privacy controls
- Data export functionality
- Transparent data handling
- Clear permission requests

## Step-by-Step Workflow

### 1. Planning Phase
- Understand the social feature's user journey
- Consider mobile-first responsive design
- Plan for offline/poor connectivity scenarios
- Design for accessibility and internationalization
- **CRITICAL PAUSE POINT** - Get human approval for UX approach

### 2. Update Documentation
- Add feature to CHANGELOG.md
- Update component documentation
- Document new user interactions

### 3. Component Development

Follow these social network patterns:

```typescript
// Social feature component structure
export function SocialFeatureComponent({
  user,
  onAction,
  ...props
}: SocialFeatureProps) {
  const { authState } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authentication guard
  if (!authState.isAuthenticated) {
    return <AuthenticationPrompt />;
  }

  // Privacy controls integration
  const handleAction = async (actionData: ActionData) => {
    try {
      setLoading(true);
      setError(null);

      // Check privacy settings
      if (!user.privacySettings.allowsAction(actionData.type)) {
        setError("Privacy settings prevent this action");
        return;
      }

      // Perform action with optimistic update
      const result = await SocialService.performAction(actionData);
      onAction?.(result);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {error && (
        <ErrorBanner 
          message={error} 
          onDismiss={() => setError(null)} 
        />
      )}
      {/* Component content */}
    </div>
  );
}
```

### 4. Authentication Integration

```typescript
// Social network authentication patterns
export function useAuthenticatedAction<T>(
  action: (data: T) => Promise<any>,
  requiresProfile: boolean = true
) {
  const { authState } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeAction = useCallback(async (data: T) => {
    if (!authState.isAuthenticated) {
      throw new Error("Please log in to continue");
    }

    if (requiresProfile && !authState.userProfile) {
      throw new Error("Please complete your profile first");
    }

    setLoading(true);
    setError(null);

    try {
      const result = await action(data);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Action failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [authState, action, requiresProfile]);

  return { executeAction, loading, error };
}
```

### 5. Real-time Social Features

```typescript
// Real-time engagement tracking
export function usePostEngagement(postId: string) {
  const [engagement, setEngagement] = useState<EngagementData | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Set<string>>(new Set());

  const performEngagement = async (
    action: EngagementAction,
    optimisticUpdate: boolean = true
  ) => {
    if (optimisticUpdate) {
      // Apply optimistic update
      setOptimisticUpdates(prev => new Set([...prev, action.type]));
      updateEngagementOptimistically(action);
    }

    try {
      const result = await PostService.engage(postId, action);
      setEngagement(result.engagement);
      return result;
    } catch (error) {
      // Revert optimistic update on failure
      if (optimisticUpdate) {
        setOptimisticUpdates(prev => {
          const updated = new Set(prev);
          updated.delete(action.type);
          return updated;
        });
        revertOptimisticUpdate(action);
      }
      throw error;
    }
  };

  return { engagement, performEngagement, optimisticUpdates };
}
```

### 6. Privacy-Focused UI Components

```typescript
// Privacy controls component
export function PrivacyControls({ 
  currentSettings, 
  onUpdate 
}: PrivacyControlsProps) {
  const [settings, setSettings] = useState(currentSettings);
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <ShieldCheckIcon className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Privacy by Default
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Your data is stored on-chain and controlled by you. 
              Adjust these settings to control who can see your content.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <PrivacyToggle
          label="Profile Visibility"
          description="Who can see your profile and posts"
          value={settings.profileVisibility}
          onChange={(value) => updateSetting('profileVisibility', value)}
          options={[
            { value: 'public', label: 'Everyone' },
            { value: 'followers', label: 'Followers Only' },
            { value: 'private', label: 'Nobody' },
          ]}
        />

        <PrivacyToggle
          label="Allow Followers"
          description="Let other users follow you"
          value={settings.allowFollowers}
          onChange={(value) => updateSetting('allowFollowers', value)}
        />

        {showAdvanced && (
          <AdvancedPrivacySettings 
            settings={settings}
            onChange={setSettings}
          />
        )}
      </div>
    </div>
  );
}
```

### 7. Creator Dashboard Components

```typescript
// Creator monetization dashboard
export function CreatorDashboard() {
  const { analytics, earnings, loading } = useCreatorData();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Creator Dashboard</h1>
        <p className="opacity-90">
          Track your impact and earnings on deCentra
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Earnings"
          value={`${earnings.total / 1e8} ICP`}
          change={earnings.change}
          icon={<CurrencyDollarIcon className="h-8 w-8" />}
        />
        <MetricCard
          title="Tips Received"
          value={earnings.tips.count}
          change={earnings.tips.change}
          icon={<HeartIcon className="h-8 w-8" />}
        />
        <MetricCard
          title="Followers"
          value={analytics.followers}
          change={analytics.followerChange}
          icon={<UsersIcon className="h-8 w-8" />}
        />
        <MetricCard
          title="Engagement Rate"
          value={`${analytics.engagementRate}%`}
          change={analytics.engagementChange}
          icon={<ChartBarIcon className="h-8 w-8" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EarningsChart 
          data={earnings.history} 
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
        />
        <TopPostsTable posts={analytics.topPosts} />
      </div>
    </div>
  );
}
```

**CRITICAL PAUSE POINT** - Use `openSimpleBrowser` to review UI at `http://localhost:5173`

### 8. Testing Implementation

Write comprehensive frontend tests:

```typescript
// Social component tests
describe('SocialFeatureComponent', () => {
  it('should require authentication', () => {
    render(
      <AuthProvider initialState={{ isAuthenticated: false }}>
        <SocialFeatureComponent />
      </AuthProvider>
    );

    expect(screen.getByText(/please log in/i)).toBeInTheDocument();
  });

  it('should handle privacy restrictions gracefully', async () => {
    const mockUser = createMockUser({ 
      privacySettings: { allowFollowers: false } 
    });

    render(<FollowButton user={mockUser} />);

    const followBtn = screen.getByRole('button', { name: /follow/i });
    await userEvent.click(followBtn);

    expect(screen.getByText(/privacy settings prevent/i)).toBeInTheDocument();
  });

  it('should display loading states during actions', async () => {
    // Test loading states and optimistic updates
  });
});
```

## Accessibility Requirements

### WCAG 2.1 AA Compliance
- Proper ARIA labels and roles
- Keyboard navigation support
- Color contrast ratios ≥ 4.5:1
- Screen reader compatibility
- Focus management

```typescript
// Accessible social component example
export function AccessiblePostCard({ post }: { post: Post }) {
  return (
    <article
      className="bg-white rounded-lg shadow-sm border"
      aria-labelledby={`post-${post.id}-title`}
    >
      <header className="p-4 border-b">
        <h3 id={`post-${post.id}-title`} className="sr-only">
          Post by {post.author.displayName}
        </h3>
        <UserAvatar user={post.author} />
      </header>
      
      <div className="p-4">
        <p className="text-gray-900">{post.content}</p>
      </div>
      
      <footer className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="flex items-center space-x-2 text-gray-600 hover:text-red-600"
            aria-label={`Like post by ${post.author.displayName}`}
          >
            <HeartIcon className="h-5 w-5" />
            <span>{post.likesCount}</span>
          </button>
          {/* Other engagement buttons */}
        </div>
      </footer>
    </article>
  );
}
```

## Performance Optimization

### Core Performance Patterns
```typescript
// Virtualized infinite scroll for large feeds
export function VirtualizedFeed({ posts }: { posts: Post[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={posts.length}
      itemSize={200}
      itemData={posts}
    >
      {({ index, style, data }) => (
        <div style={style}>
          <PostCard post={data[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}

// Image optimization for social media
export function OptimizedPostImage({ src, alt }: ImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={600}
      height={400}
      className="rounded-lg object-cover"
      priority={false}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
    />
  );
}
```

## Mobile-First Responsive Design

```typescript
// Mobile-optimized social components
export function MobilePostCard({ post }: { post: Post }) {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      {/* Mobile-optimized layout */}
      <div className="flex space-x-3">
        <UserAvatar 
          user={post.author} 
          size="sm"
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-900 truncate">
              {post.author.displayName}
            </span>
            <span className="text-gray-500 text-sm">
              {formatTimeAgo(post.createdAt)}
            </span>
          </div>
          <p className="text-gray-900 mt-1">{post.content}</p>
          
          {/* Mobile-optimized engagement bar */}
          <div className="flex items-center justify-between mt-3 max-w-sm">
            <EngagementButton type="like" count={post.likesCount} />
            <EngagementButton type="comment" count={post.commentsCount} />
            <EngagementButton type="repost" count={post.repostsCount} />
            <EngagementButton type="tip" count={post.tipsCount} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Error Boundaries for Social Features

```typescript
// Social-specific error boundary
export function SocialErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={SocialErrorFallback}
      onError={(error, errorInfo) => {
        // Log to monitoring service
        console.error('Social feature error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

function SocialErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <ExclamationTriangleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-red-900 mb-2">
        Something went wrong
      </h3>
      <p className="text-red-700 mb-4">
        We're having trouble loading this social feature. Your data is safe on the blockchain.
      </p>
      <button
        onClick={resetErrorBoundary}
        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
      >
        Try Again
      </button>
    </div>
  );
}
```

## Remember

You're building the frontend for a platform that enables freedom of expression globally. Every component should:

- **Empower Users**: Make decentralized features feel intuitive and powerful
- **Protect Privacy**: Make privacy controls obvious and easy to use
- **Enable Community**: Foster healthy social interactions and governance
- **Resist Censorship**: Highlight the censorship-resistant nature of the platform
- **Support Creators**: Make monetization and analytics feel natural and valuable

Think beyond traditional social media UX - you're designing for a free and open internet where users truly own their data
