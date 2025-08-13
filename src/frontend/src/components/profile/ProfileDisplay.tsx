'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { backend } from '../../../../declarations/backend';
import { useAuth } from '../AuthContext';
import FollowButton from '../social/FollowButton';
import type { UserProfile, Post, VerificationStatus } from '../../../../declarations/backend/backend.did';
import { Principal } from '@dfinity/principal';

interface ProfileDisplayProps {
  userId?: string;
}

export default function ProfileDisplay({ userId }: ProfileDisplayProps) {
  const { userProfile: currentUserProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = !userId || (currentUserProfile && userId === currentUserProfile.id.toString());

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isOwnProfile && currentUserProfile) {
        setProfile(currentUserProfile);
      } else if (userId) {
        try {
          const principal = Principal.fromText(userId);
          const result = await backend.get_user_profile(principal);
          if (result.length > 0 && result[0]) {
            setProfile(result[0]);
          } else {
            setError('Profile not found');
          }
        } catch (principalError) {
          console.error('Invalid principal:', principalError);
          setError('Invalid user ID');
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [userId, isOwnProfile, currentUserProfile]);

  const fetchUserPosts = useCallback(async () => {
    if (!profile) return;

    setIsLoadingPosts(true);
    try {
      const principal = Principal.fromText(profile.id.toString());
      const posts = await backend.get_user_posts(principal, [], []);
      setUserPosts(posts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setUserPosts([]);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [profile]);

  const getVerificationBadge = (status: VerificationStatus) => {
    if ('Verified' in status) return { emoji: '✅', text: 'Verified' };
    if ('Whistleblower' in status) return { emoji: '🔒', text: 'Whistleblower' };
    if ('Organization' in status) return { emoji: '🏢', text: 'Organization' };
    if ('Journalist' in status) return { emoji: '📰', text: 'Journalist' };
    return null;
  };

  const formatJoinDate = (timestamp: bigint): string => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const formatPostDate = (timestamp: bigint): string => {
    const date = new Date(Number(timestamp) / 1000000);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      fetchUserPosts();
    }
  }, [profile, fetchUserPosts]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h3>
        <p className="text-gray-600">{error || 'The requested profile could not be found.'}</p>
      </div>
    );
  }

  const verificationBadge = getVerificationBadge(profile.verification_status);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 h-32"></div>
      
      <div className="relative px-6 pb-6">
        <div className="flex justify-between items-start -mt-16 mb-4">
          <div className="w-32 h-32 bg-white rounded-full p-1 shadow-lg">
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {profile.username.slice(0, 2).toUpperCase()}
            </div>
          </div>
          
          {!isOwnProfile && (
            <div className="mt-16">
              <FollowButton
                targetUserId={profile.id.toString()}
                size="md"
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
              {verificationBadge && (
                <span 
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                  title={verificationBadge.text}
                >
                  <span>{verificationBadge.emoji}</span>
                  <span>{verificationBadge.text}</span>
                </span>
              )}
            </div>
            <p className="text-gray-500">@{profile.username}</p>
          </div>

          {profile.bio && (
            <div>
              <p className="text-gray-800 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>Joined {formatJoinDate(profile.created_at)}</span>
          </div>

          <div className="flex items-center gap-6 py-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{Number(profile.post_count)}</div>
              <div className="text-sm text-gray-500">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{Number(profile.following_count)}</div>
              <div className="text-sm text-gray-500">Following</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{Number(profile.follower_count)}</div>
              <div className="text-sm text-gray-500">Followers</div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Posts</h2>
          
          {isLoadingPosts ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : userPosts.length > 0 ? (
            <div className="space-y-4">
              {userPosts.slice(0, 5).map((post) => (
                <div key={post.id.toString()} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm text-gray-500">
                      {formatPostDate(post.created_at)}
                    </div>
                  </div>
                  <p className="text-gray-800 leading-relaxed">{post.content}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>❤️ {Number(post.like_count)} likes</span>
                    <span>💬 {Number(post.comment_count)} comments</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No posts yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
