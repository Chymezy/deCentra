import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { socialNetworkService } from '@/lib/services/social.service';
import { queryKeys, cacheUtils } from '@/lib/config/query-client.config';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useCallback } from 'react';
import type { FeedPost, Comment, PostVisibility } from '@/lib/types';
import { Principal } from '@dfinity/principal';

/**
 * Social Hooks for deCentra - Complete integration layer
 *
 * These hooks provide type-safe, performance-optimized integration
 * with the social service layer, following React patterns and
 * deCentra's security standards.
 */

// ============================================================================
// FEED HOOKS
// ============================================================================

/**
 * Hook for user's personalized feed with infinite scroll support
 */
export function useUserFeed() {
  const { isAuthenticated } = useAuth();

  return useInfiniteQuery({
    queryKey: queryKeys.userFeed,
    queryFn: async ({ pageParam = 0 }) => {
      const posts = await socialNetworkService.getUserFeed(
        pageParam as number,
        10
      );
      return {
        data: posts,
        nextCursor:
          posts.length === 10 ? (pageParam as number) + 10 : undefined,
      };
    },
    enabled: isAuthenticated,
    initialPageParam: 0,
    getNextPageParam: (lastPage: { nextCursor?: number }) =>
      lastPage.nextCursor,
    staleTime: 2 * 60 * 1000, // 2 minutes for feed freshness
  });
}

/**
 * Hook for public social feed
 */
export function useSocialFeed() {
  return useInfiniteQuery({
    queryKey: queryKeys.socialFeed,
    queryFn: async ({ pageParam = 0 }) => {
      const posts = await socialNetworkService.getSocialFeed(
        pageParam as number,
        10
      );
      return {
        data: posts,
        nextCursor:
          posts.length === 10 ? (pageParam as number) + 10 : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: { nextCursor?: number }) =>
      lastPage.nextCursor,
    staleTime: 5 * 60 * 1000, // 5 minutes for public feed
  });
}

// ============================================================================
// POST HOOKS
// ============================================================================

/**
 * Hook for creating posts with optimistic updates
 */
export function useCreatePost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      content,
      visibility,
    }: {
      content: string;
      visibility?: PostVisibility;
    }) => {
      return await socialNetworkService.createPost(content, visibility);
    },
    onMutate: async ({ content, visibility }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.userFeed });

      // Snapshot previous value
      const previousFeed = queryClient.getQueryData(queryKeys.userFeed);

      // Optimistically update feed
      if (user) {
        const optimisticPost: FeedPost = {
          post: {
            id: BigInt(Date.now()), // Temporary ID
            content,
            author_id: user.id,
            visibility: visibility || { Public: null },
            created_at: BigInt(Date.now() * 1000000), // Convert to nanoseconds
            updated_at: BigInt(Date.now() * 1000000),
            like_count: BigInt(0),
            comment_count: BigInt(0),
            comments_count: 0,
            likes_count: 0,
            reposts_count: 0,
            edited_at: [],
            tips_received: BigInt(0),
          },
          author: user,
          is_liked: false,
        };

        queryClient.setQueryData(queryKeys.userFeed, (old: unknown) => {
          const typedOld = old as { pages?: Array<{ data: FeedPost[] }> };
          if (!typedOld?.pages) return old;

          return {
            ...typedOld,
            pages: [
              { data: [optimisticPost, ...(typedOld.pages[0]?.data || [])] },
              ...typedOld.pages.slice(1),
            ],
          };
        });
      }

      return { previousFeed };
    },
    onError: (err, variables, context) => {
      // Revert optimistic update
      if (context?.previousFeed) {
        queryClient.setQueryData(queryKeys.userFeed, context.previousFeed);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch feeds
      cacheUtils.invalidateFeeds();
    },
  });
}

/**
 * Hook for getting a specific post
 */
export function usePost(postId: string) {
  return useQuery({
    queryKey: queryKeys.post(postId),
    queryFn: async () => {
      const post = await socialNetworkService.getPost(BigInt(postId));
      return post;
    },
    enabled: !!postId,
  });
}

/**
 * Hook for getting user posts
 */
export function useUserPosts(userId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.userPosts(userId),
    queryFn: async ({ pageParam = 0 }) => {
      const posts = await socialNetworkService.getUserPosts(
        Principal.fromText(userId),
        pageParam as number,
        10
      );
      return {
        data: posts,
        nextCursor:
          posts.length === 10 ? (pageParam as number) + 10 : undefined,
      };
    },
    enabled: !!userId,
    initialPageParam: 0,
    getNextPageParam: (lastPage: { nextCursor?: number }) =>
      lastPage.nextCursor,
  });
}

// ============================================================================
// ENGAGEMENT HOOKS
// ============================================================================

/**
 * Hook for liking posts with optimistic updates
 */
export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      await socialNetworkService.likePost(BigInt(postId));
    },
    onMutate: async (postId) => {
      // Optimistically update UI
      cacheUtils.updatePostEngagement(postId, {
        isLiked: true,
        likesCount: undefined, // Will be updated by server response
      });
    },
    onError: (err, postId) => {
      // Revert optimistic update
      cacheUtils.updatePostEngagement(postId, {
        isLiked: false,
      });
    },
    onSuccess: (data, postId) => {
      // Invalidate related queries for accurate counts
      queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) });
    },
  });
}

/**
 * Hook for unliking posts with optimistic updates
 */
export function useUnlikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      await socialNetworkService.unlikePost(BigInt(postId));
    },
    onMutate: async (postId) => {
      // Optimistically update UI
      cacheUtils.updatePostEngagement(postId, {
        isLiked: false,
      });
    },
    onError: (err, postId) => {
      // Revert optimistic update
      cacheUtils.updatePostEngagement(postId, {
        isLiked: true,
      });
    },
    onSuccess: (data, postId) => {
      // Invalidate related queries for accurate counts
      queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) });
    },
  });
}

// ============================================================================
// COMMENT HOOKS
// ============================================================================

/**
 * Hook for getting post comments
 */
export function usePostComments(postId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.postComments(postId),
    queryFn: async ({ pageParam = 0 }) => {
      const comments = await socialNetworkService.getPostComments(
        BigInt(postId),
        pageParam as number,
        10
      );
      return {
        data: comments,
        nextCursor:
          comments.length === 10 ? (pageParam as number) + 10 : undefined,
      };
    },
    enabled: !!postId,
    initialPageParam: 0,
    getNextPageParam: (lastPage: { nextCursor?: number }) =>
      lastPage.nextCursor,
  });
}

/**
 * Hook for adding comments with optimistic updates
 */
export function useAddComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      postId,
      content,
    }: {
      postId: string;
      content: string;
    }) => {
      return await socialNetworkService.addComment(BigInt(postId), content);
    },
    onMutate: async ({ postId, content }) => {
      if (!user) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.postComments(postId),
      });

      // Optimistic comment
      const optimisticComment: Comment = {
        id: BigInt(Date.now()),
        post_id: BigInt(postId),
        content,
        author_id: user.id,
        created_at: BigInt(Date.now() * 1000000),
        updated_at: BigInt(Date.now() * 1000000),
      };

      // Update comments cache
      queryClient.setQueryData(
        queryKeys.postComments(postId),
        (old: unknown) => {
          const typedOld = old as { pages?: Array<{ data: Comment[] }> };
          if (!typedOld?.pages) return old;

          return {
            ...typedOld,
            pages: [
              { data: [optimisticComment, ...(typedOld.pages[0]?.data || [])] },
              ...typedOld.pages.slice(1),
            ],
          };
        }
      );

      // Update comment count
      cacheUtils.updatePostEngagement(postId, {
        commentsCount: undefined, // Will be updated by server
      });
    },
    onSuccess: (data, { postId }) => {
      // Invalidate to get accurate data
      queryClient.invalidateQueries({
        queryKey: queryKeys.postComments(postId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) });
    },
  });
}

// ============================================================================
// SOCIAL GRAPH HOOKS
// ============================================================================

/**
 * Hook for following users
 */
export function useFollowUser() {
  return useMutation({
    mutationFn: async (userId: string) => {
      await socialNetworkService.followUser(Principal.fromText(userId));
    },
    onSuccess: (data, userId) => {
      // Invalidate user data
      cacheUtils.invalidateUserData(userId);
      cacheUtils.invalidateUserData(); // Current user
      cacheUtils.invalidateFeeds(); // Feeds may change
    },
  });
}

/**
 * Hook for unfollowing users
 */
export function useUnfollowUser() {
  return useMutation({
    mutationFn: async (userId: string) => {
      await socialNetworkService.unfollowUser(Principal.fromText(userId));
    },
    onSuccess: (data, userId) => {
      // Invalidate user data
      cacheUtils.invalidateUserData(userId);
      cacheUtils.invalidateUserData(); // Current user
      cacheUtils.invalidateFeeds(); // Feeds may change
    },
  });
}

/**
 * Hook for checking follow status
 */
export function useIsFollowing(userA: string, userB: string) {
  return useQuery({
    queryKey: ['follow_status', userA, userB],
    queryFn: async () => {
      return await socialNetworkService.isFollowing(
        Principal.fromText(userA),
        Principal.fromText(userB)
      );
    },
    enabled: !!(userA && userB),
  });
}

/**
 * Hook for getting followers
 */
export function useFollowers(userId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.followers(userId),
    queryFn: async ({ pageParam = 0 }) => {
      const followers = await socialNetworkService.getFollowers(
        Principal.fromText(userId),
        pageParam as number,
        10
      );
      return {
        data: followers,
        nextCursor:
          followers.length === 10 ? (pageParam as number) + 10 : undefined,
      };
    },
    enabled: !!userId,
    initialPageParam: 0,
    getNextPageParam: (lastPage: { nextCursor?: number }) =>
      lastPage.nextCursor,
  });
}

/**
 * Hook for getting following
 */
export function useFollowing(userId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.following(userId),
    queryFn: async ({ pageParam = 0 }) => {
      const following = await socialNetworkService.getFollowing(
        Principal.fromText(userId),
        pageParam as number,
        10
      );
      return {
        data: following,
        nextCursor:
          following.length === 10 ? (pageParam as number) + 10 : undefined,
      };
    },
    enabled: !!userId,
    initialPageParam: 0,
    getNextPageParam: (lastPage: { nextCursor?: number }) =>
      lastPage.nextCursor,
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Combined hook for post interactions
 */
export function usePostInteractions(postId: string) {
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const addComment = useAddComment();

  const handleLike = useCallback(
    async (isLiked: boolean) => {
      if (isLiked) {
        await unlikePost.mutateAsync(postId);
      } else {
        await likePost.mutateAsync(postId);
      }
    },
    [postId, likePost, unlikePost]
  );

  const handleComment = useCallback(
    async (content: string) => {
      await addComment.mutateAsync({ postId, content });
    },
    [postId, addComment]
  );

  return {
    handleLike,
    handleComment,
    isLiking: likePost.isPending || unlikePost.isPending,
    isCommenting: addComment.isPending,
  };
}

/**
 * Hook for user profile with social stats
 */
export function useUserProfile(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id.toString();

  return useQuery({
    queryKey: targetUserId
      ? queryKeys.userProfile(targetUserId)
      : queryKeys.myProfile,
    queryFn: async () => {
      if (!targetUserId) throw new Error('No user ID provided');
      // Note: This would need to be implemented in social service
      // For now, return the current user profile
      return user;
    },
    enabled: !!targetUserId,
  });
}

/**
 * Hook for platform statistics
 */
export function usePlatformStats() {
  return useQuery({
    queryKey: queryKeys.platformStats,
    queryFn: async () => {
      return await socialNetworkService.getPlatformStats();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
