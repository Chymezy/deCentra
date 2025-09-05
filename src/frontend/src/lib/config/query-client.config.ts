import { QueryClient } from '@tanstack/react-query';

/**
 * React Query configuration for deCentra social network
 *
 * Optimized for social media patterns:
 * - Short stale times for real-time feel
 * - Aggressive caching for performance
 * - Retry logic for network resilience
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Social data should feel fresh
      staleTime: 5 * 60 * 1000, // 5 minutes

      // Retry failed requests with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry on authentication errors
        if (error instanceof Error && error.message.includes('AUTH_')) {
          return false;
        }
        return failureCount < 3;
      },

      // Don't refetch on window focus for social content
      refetchOnWindowFocus: false,

      // Refetch on reconnect for real-time updates
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});

/**
 * Query keys for consistent cache management
 */
export const queryKeys = {
  // User data
  myProfile: ['user', 'profile', 'me'] as const,
  userProfile: (userId: string) => ['user', 'profile', userId] as const,
  userPosts: (userId: string) => ['user', 'posts', userId] as const,

  // Social graph
  followers: (userId: string) => ['user', 'followers', userId] as const,
  following: (userId: string) => ['user', 'following', userId] as const,
  followRequests: ['user', 'followRequests'] as const,

  // Feed data
  userFeed: ['feed', 'user'] as const,
  socialFeed: ['feed', 'social'] as const,

  // Post data
  post: (postId: string) => ['post', postId] as const,
  postComments: (postId: string) => ['post', postId, 'comments'] as const,

  // Platform data
  platformStats: ['platform', 'stats'] as const,
} as const;

/**
 * Cache invalidation helpers
 */
export const cacheUtils = {
  // Invalidate all user-related data
  invalidateUserData: async (userId?: string) => {
    if (userId) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.userProfile(userId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.userPosts(userId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.followers(userId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.following(userId),
      });
    } else {
      await queryClient.invalidateQueries({ queryKey: queryKeys.myProfile });
    }
  },

  // Invalidate feed data
  invalidateFeeds: async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.userFeed });
    await queryClient.invalidateQueries({ queryKey: queryKeys.socialFeed });
  },

  // Invalidate post data
  invalidatePost: async (postId: string) => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.postComments(postId),
    });
  },

  // Update post engagement optimistically
  updatePostEngagement: (
    postId: string,
    updates: { likesCount?: number; commentsCount?: number; isLiked?: boolean }
  ) => {
    queryClient.setQueryData(queryKeys.post(postId), (oldData: unknown) => {
      if (!oldData) return oldData;
      return {
        ...(oldData as Record<string, unknown>),
        ...updates,
      };
    });

    // Also update in feeds
    queryClient.setQueriesData(
      { queryKey: queryKeys.userFeed },
      (oldData: unknown) => {
        const typedOldData = oldData as {
          pages?: Array<{
            data?: Array<{ post: { id: bigint }; is_liked: boolean }>;
          }>;
        };
        if (!typedOldData?.pages) return oldData;
        return {
          ...typedOldData,
          pages: typedOldData.pages.map((page) => ({
            ...page,
            data: page.data?.map((feedPost) =>
              feedPost.post.id.toString() === postId
                ? {
                    ...feedPost,
                    post: { ...feedPost.post, ...updates },
                    is_liked: updates.isLiked ?? feedPost.is_liked,
                  }
                : feedPost
            ),
          })),
        };
      }
    );
  },
};
