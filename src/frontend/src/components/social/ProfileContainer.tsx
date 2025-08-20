'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { icons } from '@/lib/icons';
import { FeedContainer, FeedType } from './FeedContainer';
import { UserAvatar } from '@/components/ui';

interface ProfileContainerProps {
  userId?: string;
  className?: string;
}

export function ProfileContainer({
  userId,
  className = '',
}: ProfileContainerProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'media' | 'likes'>('posts');

  // Mock profile data - TODO: Replace with actual API calls
  const profileData = {
    username: user?.username || 'user',
    displayName: user?.username || 'User',
    bio: 'Building the future of decentralized social networking 🚀',
    followerCount: 1542,
    followingCount: 234,
    postCount: 89,
    joinedDate: 'January 2024',
    isFollowing: false,
    isOwnProfile: !userId || userId === user?.id?.toString(),
  };

  const tabs = [
    { id: 'posts', label: 'Posts', count: profileData.postCount },
    { id: 'replies', label: 'Replies', count: 12 },
    { id: 'media', label: 'Media', count: 5 },
    { id: 'likes', label: 'Likes', count: 156 },
  ] as const;

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {/* Profile Header */}
      <div className="bg-dark-background-secondary border-b border-dark-background-tertiary">
        {/* Cover Image Area */}
        <div className="h-48 bg-gradient-to-r from-deep-indigo to-electric-blue"></div>
        
        {/* Profile Info */}
        <div className="px-4 pb-4">
          <div className="flex justify-between items-start -mt-16 mb-4">
            <UserAvatar
              src={user?.avatar}
              alt={`${profileData.username}'s avatar`}
              username={profileData.username}
              size="xl"
              className="border-4 border-dark-background-secondary"
            />
            
            {!profileData.isOwnProfile && (
              <button className="bg-electric-blue text-white px-6 py-2 rounded-full font-semibold hover:bg-electric-blue/90 transition-colors mt-16">
                {profileData.isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-dark-text-primary">
              {profileData.displayName}
            </h1>
            <p className="text-dark-text-secondary">@{profileData.username}</p>
            <p className="text-dark-text-primary">{profileData.bio}</p>
            
            <div className="flex items-center space-x-4 text-sm text-dark-text-secondary">
              <span className="flex items-center">
                <icons.calendar className="w-4 h-4 mr-1" aria-hidden={true} />
                Joined {profileData.joinedDate}
              </span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <span className="text-dark-text-primary">
                <span className="font-bold">{profileData.followingCount}</span>{' '}
                <span className="text-dark-text-secondary">Following</span>
              </span>
              <span className="text-dark-text-primary">
                <span className="font-bold">{profileData.followerCount}</span>{' '}
                <span className="text-dark-text-secondary">Followers</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-dark-background-tertiary">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 text-center text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-electric-blue'
                  : 'text-dark-text-secondary hover:text-dark-text-primary'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 text-xs">({tab.count})</span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-electric-blue"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-dark-background-primary">
        {activeTab === 'posts' && (
          <FeedContainer
            feedType={FeedType.HOME}
            showComposer={profileData.isOwnProfile}
            className="!max-w-none"
          />
        )}
        
        {activeTab !== 'posts' && (
          <div className="text-center py-12">
            <p className="text-dark-text-secondary text-lg mb-2">
              {activeTab === 'replies' && 'No replies yet'}
              {activeTab === 'media' && 'No media yet'}
              {activeTab === 'likes' && 'No likes yet'}
            </p>
            <p className="text-dark-text-tertiary">
              This content will be implemented in future updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
