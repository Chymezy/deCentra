---
applyTo: "**/*social*,**/*post*,**/*feed*,**/*profile*"
---

# Social Network Components Instructions for deCentra

## Core Social Components Architecture

deCentra implements a comprehensive social network component system with **neumorphic design**, **privacy-first features**, and **creator monetization** capabilities.

### Component Hierarchy

```typescript
// Social component organization
src/components/social/
├── feed/                  # Feed-related components
│   ├── FeedContainer.tsx
│   ├── PostCard.tsx
│   ├── PostComposer.tsx
│   └── FeedFilters.tsx
├── profile/              # Profile components
│   ├── UserProfile.tsx
│   ├── ProfileHeader.tsx
│   ├── ProfileStats.tsx
│   └── EditProfileModal.tsx
├── interactions/         # Social interactions
│   ├── LikeButton.tsx
│   ├── CommentSection.tsx
│   ├── ShareButton.tsx
│   └── FollowButton.tsx
├── discovery/           # Content discovery
│   ├── TrendingTopics.tsx
│   ├── UserSuggestions.tsx
│   └── SearchResults.tsx
└── creator/             # Creator features
    ├── CreatorDashboard.tsx
    ├── TipButton.tsx
    ├── SubscriptionCard.tsx
    └── AnalyticsCharts.tsx
```

### Core Domain Types

```typescript
// Core social network types
export interface Post {
  id: string;
  author: UserProfile;
  content: string;
  mediaUrls: string[];
  createdAt: bigint;
  updatedAt: bigint;
  
  // Engagement metrics
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  tipsCount: number;
  totalTipAmount: number;
  
  // Visibility and moderation
  visibility: PostVisibility;
  moderationStatus: ModerationStatus;
  isEdited: boolean;
  
  // User interactions
  isLikedByUser: boolean;
  isRepostedByUser: boolean;
  userTipAmount: number;
}

export enum PostVisibility {
  Public = 'public',
  Followers = 'followers',
  Private = 'private',
  Anonymous = 'anonymous',
}

export interface Comment {
  id: string;
  postId: string;
  author: UserProfile;
  content: string;
  createdAt: bigint;
  likesCount: number;
  isLikedByUser: boolean;
  replies: Comment[];
  parentCommentId?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  
  // Social stats
  followersCount: number;
  followingCount: number;
  postsCount: number;
  
  // Creator features
  isCreator: boolean;
  totalTipsReceived: number;
  subscribersCount: number;
  
  // Verification and status
  isVerified: boolean;
  isFollowedByUser: boolean;
  isFollowingUser: boolean;
  relationshipStatus: RelationshipStatus;
}

export enum RelationshipStatus {
  None = 'none',
  Following = 'following',
  Follower = 'follower',
  Mutual = 'mutual',
  Blocked = 'blocked',
}
```

## Feed Components

### Main Feed Container

```typescript
// components/social/feed/FeedContainer.tsx
import { useState, useEffect, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { FixedSizeList as VirtualList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { PostCard } from './PostCard';
import { PostComposer } from './PostComposer';
import { FeedFilters } from './FeedFilters';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export enum FeedType {
  Following = 'following',
  Trending = 'trending',
  Latest = 'latest',
  Creator = 'creator',
}

interface FeedContainerProps {
  feedType?: FeedType;
  userId?: string;
  className?: string;
}

export function FeedContainer({ 
  feedType = FeedType.Following, 
  userId,
  className = '' 
}: FeedContainerProps) {
  const [filters, setFilters] = useState({
    sortBy: 'recent',
    timeRange: '24h',
    contentType: 'all',
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['feed', feedType, userId, filters],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await socialService.getFeed({
        feedType,
        userId,
        offset: pageParam,
        limit: 20,
        filters,
      });
      return response;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.posts.length < 20) return undefined;
      return allPages.length * 20;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const posts = data?.pages.flatMap(page => page.posts) ?? [];

  const handlePostCreated = useCallback((newPost: Post) => {
    // Optimistic update - add new post to the beginning
    refetch();
  }, [refetch]);

  const handlePostUpdated = useCallback((updatedPost: Post) => {
    // Update specific post in cache
    refetch();
  }, [refetch]);

  const isItemLoaded = useCallback((index: number) => {
    return !!posts[index];
  }, [posts]);

  const loadMoreItems = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">Failed to load feed</p>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {/* Post Composer - only show for following feed */}
      {feedType === FeedType.Following && (
        <div className="border-b border-dark-border-subtle">
          <PostComposer onPostCreated={handlePostCreated} />
        </div>
      )}

      {/* Feed Filters */}
      <FeedFilters 
        filters={filters}
        onFiltersChange={setFilters}
        feedType={feedType}
      />

      {/* Posts Feed */}
      <ErrorBoundary>
        <div className="divide-y divide-dark-border-subtle">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-dark-text-secondary">No posts to show</p>
            </div>
          ) : (
            <InfiniteLoader
              isItemLoaded={isItemLoaded}
              itemCount={hasNextPage ? posts.length + 1 : posts.length}
              loadMoreItems={loadMoreItems}
              threshold={5}
            >
              {({ onItemsRendered, ref }) => (
                <VirtualList
                  ref={ref}
                  height={800}
                  itemCount={posts.length}
                  itemSize={200}
                  onItemsRendered={onItemsRendered}
                  itemData={posts}
                >
                  {({ index, style, data }) => (
                    <div style={style}>
                      <PostCard
                        post={data[index]}
                        onPostUpdated={handlePostUpdated}
                        className="border-b border-dark-border-subtle last:border-b-0"
                      />
                    </div>
                  )}
                </VirtualList>
              )}
            </InfiniteLoader>
          )}
          
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          )}
        </div>
      </ErrorBoundary>
    </div>
  );
}
```

### Post Card Component

```typescript
// components/social/feed/PostCard.tsx
import { useState, memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LikeButton } from '../interactions/LikeButton';
import { CommentSection } from '../interactions/CommentSection';
import { ShareButton } from '../interactions/ShareButton';
import { TipButton } from '../creator/TipButton';
import { FollowButton } from '../interactions/FollowButton';
import { 
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ArrowPathRoundedSquareIcon,
  GiftIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid';

interface PostCardProps {
  post: Post;
  onPostUpdated?: (post: Post) => void;
  className?: string;
  showActions?: boolean;
  compact?: boolean;
}

export const PostCard = memo(function PostCard({
  post,
  onPostUpdated,
  className = '',
  showActions = true,
  compact = false,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const shouldTruncate = post.content.length > 280;
  const displayContent = shouldTruncate && !isExpanded 
    ? post.content.slice(0, 280) + '...' 
    : post.content;

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <Card className={`
      p-4 hover:shadow-soft transition-shadow duration-200 cursor-pointer
      ${compact ? 'p-3' : 'p-4'}
      ${className}
    `}>
      <article className="space-y-3">
        {/* Post Header */}
        <header className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <UserAvatar
              src={post.author.avatarUrl}
              alt={post.author.displayName || post.author.username}
              size={compact ? "sm" : "md"}
              verified={post.author.isVerified}
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-dark-text-primary truncate">
                  {post.author.displayName || post.author.username}
                </h3>
                <span className="text-dark-text-tertiary text-sm">
                  @{post.author.username}
                </span>
                <span className="text-dark-text-tertiary text-sm">·</span>
                <time className="text-dark-text-tertiary text-sm">
                  {formatTimestamp(post.createdAt)}
                </time>
                {post.isEdited && (
                  <span className="text-dark-text-tertiary text-xs">(edited)</span>
                )}
              </div>
              
              {/* Creator Badge */}
              {post.author.isCreator && (
                <div className="flex items-center gap-1 mt-1">
                  <GiftIcon className="w-3 h-3 text-vibrant-orange" />
                  <span className="text-xs text-vibrant-orange font-medium">Creator</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!post.author.isFollowedByUser && (
              <FollowButton 
                userId={post.author.id}
                size="sm"
                variant="outline"
              />
            )}
            
            <Button variant="ghost" size="sm" className="text-dark-text-tertiary">
              <EllipsisHorizontalIcon className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Post Content */}
        <div className="space-y-3">
          <div className="text-dark-text-primary leading-relaxed">
            <p className="whitespace-pre-wrap">{displayContent}</p>
            
            {shouldTruncate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-electric-blue hover:text-electric-blue p-0 h-auto font-normal"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </Button>
            )}
          </div>

          {/* Media Attachments */}
          {post.mediaUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
              {post.mediaUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-48 object-cover bg-dark-background-tertiary"
                  loading="lazy"
                />
              ))}
            </div>
          )}
        </div>

        {/* Post Actions */}
        {showActions && (
          <footer className="flex items-center justify-between pt-2 border-t border-dark-border-subtle">
            <div className="flex items-center gap-6">
              {/* Like Button */}
              <LikeButton
                postId={post.id}
                isLiked={post.isLikedByUser}
                likesCount={post.likesCount}
                onLikeChanged={(isLiked, count) => {
                  if (onPostUpdated) {
                    onPostUpdated({
                      ...post,
                      isLikedByUser: isLiked,
                      likesCount: count,
                    });
                  }
                }}
              />

              {/* Comment Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 text-dark-text-tertiary hover:text-electric-blue"
              >
                <ChatBubbleOvalLeftIcon className="w-5 h-5" />
                <span className="text-sm">{post.commentsCount}</span>
              </Button>

              {/* Share Button */}
              <ShareButton
                postId={post.id}
                isReposted={post.isRepostedByUser}
                repostsCount={post.repostsCount}
              />

              {/* Tip Button */}
              <TipButton
                recipientId={post.author.id}
                contentId={post.id}
                tipCount={post.tipsCount}
                totalAmount={post.totalTipAmount}
                userTipAmount={post.userTipAmount}
              />
            </div>

            {/* Engagement Stats */}
            <div className="flex items-center gap-4 text-xs text-dark-text-tertiary">
              {post.tipsCount > 0 && (
                <span className="flex items-center gap-1">
                  <GiftIcon className="w-3 h-3 text-vibrant-orange" />
                  {post.totalTipAmount.toFixed(2)} ICP
                </span>
              )}
            </div>
          </footer>
        )}

        {/* Comments Section */}
        {showComments && (
          <CommentSection
            postId={post.id}
            onCommentAdded={(comment) => {
              if (onPostUpdated) {
                onPostUpdated({
                  ...post,
                  commentsCount: post.commentsCount + 1,
                });
              }
            }}
          />
        )}
      </article>
    </Card>
  );
});
```

### Post Composer

```typescript
// components/social/feed/PostComposer.tsx
import { useState, useRef } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Textarea } from '@/components/ui/Textarea';
import { 
  PhotoIcon,
  FaceSmileIcon,
  MapPinIcon,
  EyeIcon,
  GlobeAltIcon,
  LockClosedIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface PostComposerProps {
  onPostCreated?: (post: Post) => void;
  placeholder?: string;
  autoFocus?: boolean;
  compact?: boolean;
}

export function PostComposer({
  onPostCreated,
  placeholder = "What's happening?",
  autoFocus = false,
  compact = false,
}: PostComposerProps) {
  const { state: authState } = useAuth();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<PostVisibility>(PostVisibility.Public);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxLength = 10000;
  const remainingChars = maxLength - content.length;

  const visibilityOptions = [
    {
      value: PostVisibility.Public,
      label: 'Public',
      icon: GlobeAltIcon,
      description: 'Anyone can see this post',
    },
    {
      value: PostVisibility.Followers,
      label: 'Followers',
      icon: UserGroupIcon,
      description: 'Only your followers can see this',
    },
    {
      value: PostVisibility.Private,
      label: 'Private',
      icon: LockClosedIcon,
      description: 'Only you can see this',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      // Upload media files if any
      const mediaUrls: string[] = [];
      if (mediaFiles.length > 0) {
        // TODO: Implement media upload to IPFS or similar
        // For now, we'll skip media upload
      }

      const newPost = await socialService.createPost({
        content: content.trim(),
        mediaUrls,
        visibility,
      });

      // Reset form
      setContent('');
      setMediaFiles([]);
      setVisibility(PostVisibility.Public);

      // Notify parent component
      if (onPostCreated) {
        onPostCreated(newPost);
      }

    } catch (error) {
      console.error('Failed to create post:', error);
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMediaFiles(prev => [...prev, ...files].slice(0, 4)); // Max 4 files
  };

  if (!authState.isAuthenticated || !authState.userProfile) {
    return null;
  }

  return (
    <Card className={`${compact ? 'p-3' : 'p-4'} border-b-0 rounded-b-none`}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* User Avatar and Content */}
        <div className="flex gap-3">
          <UserAvatar
            src={authState.userProfile.avatarUrl}
            alt={authState.userProfile.displayName || authState.userProfile.username}
            size={compact ? "sm" : "md"}
          />
          
          <div className="flex-1 space-y-3">
            {/* Text Input */}
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              autoFocus={autoFocus}
              className="min-h-[120px] text-lg border-none resize-none bg-transparent placeholder:text-dark-text-tertiary focus:ring-0"
              maxLength={maxLength}
            />

            {/* Media Preview */}
            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-2 gap-2 p-3 bg-dark-background-tertiary rounded-lg">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-1 right-1 bg-black bg-opacity-50 text-white"
                      onClick={() => {
                        setMediaFiles(prev => prev.filter((_, i) => i !== index));
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-dark-border-subtle">
          <div className="flex items-center gap-2">
            {/* Media Upload */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-electric-blue hover:bg-electric-blue hover:bg-opacity-10"
              disabled={mediaFiles.length >= 4}
            >
              <PhotoIcon className="w-5 h-5" />
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleMediaUpload}
              className="hidden"
            />

            {/* Emoji Picker */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-electric-blue hover:bg-electric-blue hover:bg-opacity-10"
            >
              <FaceSmileIcon className="w-5 h-5" />
            </Button>

            {/* Visibility Selector */}
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as PostVisibility)}
              className="bg-transparent text-sm text-dark-text-secondary border border-dark-border-subtle rounded px-2 py-1"
            >
              {visibilityOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-dark-background-secondary">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            {/* Character Count */}
            <span className={`text-sm ${
              remainingChars < 100 ? 'text-vibrant-orange' : 
              remainingChars < 0 ? 'text-red-400' : 'text-dark-text-tertiary'
            }`}>
              {remainingChars < 100 && remainingChars}
            </span>

            {/* Post Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!content.trim() || remainingChars < 0 || isSubmitting}
              loading={isSubmitting}
              className="px-6"
            >
              Post
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
```

## Profile Components

### User Profile Display

```typescript
// components/social/profile/UserProfile.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProfileHeader } from './ProfileHeader';
import { ProfileStats } from './ProfileStats';
import { FeedContainer, FeedType } from '../feed/FeedContainer';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface UserProfileProps {
  userId: string;
  currentUserId?: string;
}

export function UserProfile({ userId, currentUserId }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'likes'>('posts');

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => socialService.getUserProfile(userId),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Profile not found</p>
      </div>
    );
  }

  const isOwnProfile = currentUserId === userId;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile Header */}
      <ProfileHeader 
        profile={profile}
        isOwnProfile={isOwnProfile}
      />

      {/* Profile Stats */}
      <ProfileStats profile={profile} />

      {/* Tab Navigation */}
      <div className="flex border-b border-dark-border-subtle">
        {[
          { key: 'posts', label: 'Posts' },
          { key: 'media', label: 'Media' },
          { key: 'likes', label: 'Likes' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`
              flex-1 py-4 text-center font-medium transition-colors duration-200
              ${activeTab === tab.key
                ? 'text-electric-blue border-b-2 border-electric-blue'
                : 'text-dark-text-tertiary hover:text-dark-text-secondary'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'posts' && (
          <FeedContainer
            feedType={FeedType.Latest}
            userId={userId}
          />
        )}
        {activeTab === 'media' && (
          <div className="text-center py-8 text-dark-text-secondary">
            Media posts coming soon
          </div>
        )}
        {activeTab === 'likes' && (
          <div className="text-center py-8 text-dark-text-secondary">
            Liked posts coming soon
          </div>
        )}
      </div>
    </div>
  );
}
```

## Social Interaction Components

### Like Button with Animation

```typescript
// components/social/interactions/LikeButton.tsx
import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface LikeButtonProps {
  postId: string;
  isLiked: boolean;
  likesCount: number;
  onLikeChanged?: (isLiked: boolean, newCount: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function LikeButton({
  postId,
  isLiked: initialIsLiked,
  likesCount: initialLikesCount,
  onLikeChanged,
  size = 'md',
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isAnimating, setIsAnimating] = useState(false);

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        return socialService.unlikePost(postId);
      } else {
        return socialService.likePost(postId);
      }
    },
    onMutate: () => {
      // Optimistic update
      const newIsLiked = !isLiked;
      const newCount = newIsLiked ? likesCount + 1 : likesCount - 1;
      
      setIsLiked(newIsLiked);
      setLikesCount(newCount);
      setIsAnimating(true);
      
      // Trigger animation
      setTimeout(() => setIsAnimating(false), 300);
      
      if (onLikeChanged) {
        onLikeChanged(newIsLiked, newCount);
      }
    },
    onError: () => {
      // Revert optimistic update on error
      setIsLiked(initialIsLiked);
      setLikesCount(initialLikesCount);
      
      if (onLikeChanged) {
        onLikeChanged(initialIsLiked, initialLikesCount);
      }
    },
  });

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    likeMutation.mutate();
  }, [likeMutation]);

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={likeMutation.isPending}
      className={`
        flex items-center gap-2 transition-all duration-200
        ${isLiked 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-dark-text-tertiary hover:text-red-500'
        }
        ${isAnimating ? 'animate-bounce' : ''}
      `}
      aria-label={`${isLiked ? 'Unlike' : 'Like'} post. ${likesCount} likes`}
    >
      {isLiked ? (
        <HeartIconSolid className={`${iconSize} text-red-500`} />
      ) : (
        <HeartIcon className={iconSize} />
      )}
      <span className={textSize}>{likesCount}</span>
    </Button>
  );
}
```

## Creator Monetization Components

### Tip Button

```typescript
// components/social/creator/TipButton.tsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { GiftIcon } from '@heroicons/react/24/outline';

interface TipButtonProps {
  recipientId: string;
  contentId: string;
  tipCount: number;
  totalAmount: number;
  userTipAmount: number;
}

export function TipButton({
  recipientId,
  contentId,
  tipCount,
  totalAmount,
  userTipAmount,
}: TipButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tipAmount, setTipAmount] = useState('');
  const [tipMessage, setTipMessage] = useState('');

  const tipMutation = useMutation({
    mutationFn: async (data: { amount: number; message?: string }) => {
      return socialService.tipContent(contentId, recipientId, data.amount, data.message);
    },
    onSuccess: () => {
      setIsModalOpen(false);
      setTipAmount('');
      setTipMessage('');
      // TODO: Show success toast
    },
    onError: (error) => {
      console.error('Tip failed:', error);
      // TODO: Show error toast
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(tipAmount);
    if (amount > 0) {
      tipMutation.mutate({ amount, message: tipMessage || undefined });
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 text-dark-text-tertiary hover:text-vibrant-orange"
      >
        <GiftIcon className="w-5 h-5" />
        <span className="text-sm">{tipCount}</span>
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Send a Tip"
        className="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-text-primary mb-2">
              Amount (ICP)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text-primary mb-2">
              Message (optional)
            </label>
            <Input
              value={tipMessage}
              onChange={(e) => setTipMessage(e.target.value)}
              placeholder="Thanks for the great content!"
              maxLength={280}
            />
          </div>

          {totalAmount > 0 && (
            <div className="p-3 bg-dark-background-tertiary rounded-lg">
              <p className="text-sm text-dark-text-secondary">
                This post has received <span className="font-medium text-vibrant-orange">
                  {totalAmount.toFixed(2)} ICP
                </span> from {tipCount} tip{tipCount !== 1 ? 's' : ''}
              </p>
              {userTipAmount > 0 && (
                <p className="text-xs text-dark-text-tertiary mt-1">
                  You've tipped {userTipAmount.toFixed(2)} ICP
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={tipMutation.isPending}
              disabled={!tipAmount || parseFloat(tipAmount) <= 0}
            >
              Send Tip
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
```

## Implementation Guidelines

### 1. Performance Optimization
- Use React.memo for expensive components
- Implement virtualization for long lists
- Optimize images with lazy loading
- Use proper caching strategies

### 2. Accessibility
- Include proper ARIA labels for all interactions
- Support keyboard navigation
- Maintain color contrast ratios
- Provide screen reader descriptions

### 3. User Experience
- Implement optimistic updates for interactions
- Show loading states for async operations
- Provide clear feedback for user actions
- Use smooth animations and transitions

### 4. Data Management
- Use React Query for server state management
- Implement proper error handling and retry logic
- Cache frequently accessed data
- Implement offline support where possible

### 5. Security & Privacy
- Sanitize user-generated content
- Implement content warnings for sensitive material
- Respect user privacy settings
- Secure all data transmissions

This comprehensive social network component system provides the foundation for a modern, accessible, and feature-rich social platform that aligns with deCentra's mission of user empowerment and privacy protection.
