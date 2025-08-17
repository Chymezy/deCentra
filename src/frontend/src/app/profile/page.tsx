'use client';

import React, { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { SocialNetworkLayout } from '@/components/layout/SocialNetworkLayout';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/lib/contexts/AuthContext';
import { type PrivacyMode } from '@/components/auth/LoginFlow';
import UserConnectionsDisplay from '@/components/social/UserConnectionsDisplay';
import FollowRequestsPanel from '@/components/social/FollowRequestsPanel';
import { 
  toComponentAuthState, 
  toSidebarUserProfile, 
  getNavigationItemsConfig
} from '@/lib/types/unified-auth.types';
import { usePathname } from 'next/navigation';

export default function ProfilePage() {
  const authState = useAuth();
  const pathname = usePathname();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('👤');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentPrivacyMode, setCurrentPrivacyMode] = useState<PrivacyMode>('normal');

  const handleLogin = async (privacyMode: PrivacyMode) => {
    setCurrentPrivacyMode(privacyMode);
    await authState.login(privacyMode);
  };

  // Initialize form with user data when available
  useEffect(() => {
    if (authState.user) {
      setUsername(authState.user.username);
      setBio(authState.user.bio);
      setAvatar(authState.user.avatar);
    }
  }, [authState.user]);

  const handleUpdateProfile = async () => {
    if (!authState.isAuthenticated || !authState.user) {
      alert('You must be logged in to update your profile');
      return;
    }

    if (!username.trim()) {
      alert('Username is required');
      return;
    }

    setIsUpdating(true);
    try {
      await authState.updateUserProfile(username, bio, avatar);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!authState.isAuthenticated) {
      alert('You must be logged in to create a profile');
      return;
    }

    if (!username.trim()) {
      alert('Username is required');
      return;
    }

    setIsCreating(true);
    try {
      await authState.createUserProfile(username, bio, avatar);
      alert('Profile created successfully!');
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Failed to create profile. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  // Convert auth state for AuthGuard
  const authStateForGuard = toComponentAuthState({
    ...authState,
    privacyMode: currentPrivacyMode,
  });

  // Convert user for Sidebar
  const sidebarUser = authState.user ? toSidebarUserProfile(authState.user) : undefined;

  // Get navigation items with active state
  const navItemsConfig = getNavigationItemsConfig(pathname);
  
  // Helper function to get icons for navigation items
  const getIconForNavItem = (id: string): React.ReactNode => {
    const icons = {
      home: <span>🏠</span>,
      feed: <span>📰</span>,
      discover: <span>🔍</span>,
      notifications: <span>🔔</span>,
      messages: <span>💬</span>,
      profile: <span>👤</span>,
      creator: <span>⭐</span>,
      settings: <span>⚙️</span>,
    };
    return icons[id as keyof typeof icons] || <span>📄</span>;
  };

  const navigationItems = navItemsConfig.map(item => ({
    ...item,
    icon: getIconForNavItem(item.id),
  }));

  return (
    <AuthGuard
      authState={authStateForGuard}
      onLogin={handleLogin}
      onLogout={authState.logout}
      requiredLevel="authenticated"
    >
      <SocialNetworkLayout
        sidebar={
          <Sidebar
            isAuthenticated={authState.isAuthenticated}
            user={sidebarUser}
            navigationItems={navigationItems}
          />
        }
      >
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-heading font-bold text-white mb-4">
              Your Profile
            </h1>
            <div className="w-24 h-24 bg-gradient-to-br from-electric-blue to-vibrant-orange rounded-full flex items-center justify-center mx-auto mb-4 shadow-neumorphic">
              <span className="text-white font-code font-bold text-2xl">
                {avatar}
              </span>
            </div>
            <p className="text-white/70 font-body">
              {authState.user
                ? `Connected as: ${authState.user.username || 'No username set'}`
                : 'Loading profile...'}
            </p>
            {authState.principal && (
              <p className="text-white/50 font-code text-sm mt-2">
                Principal: {String(authState.principal).substring(0, 16)}...
              </p>
            )}
          </div>

          {!authState.user ? (
            // Profile Creation Form
            <div className="max-w-2xl mx-auto">
              <div className="bg-dark-gray shadow-neumorphic rounded-xl p-8 border border-white/5">
                <h2 className="text-2xl font-heading font-bold text-electric-blue mb-6 text-center">
                  Create Your Profile
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-white font-body font-medium mb-2">
                      Avatar
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-electric-blue to-vibrant-orange rounded-full flex items-center justify-center shadow-neumorphic-inset">
                        <span className="text-white font-code font-bold text-xl">
                          {avatar}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {['👤', '🦸', '🤖', '🌟', '🎨', '🔥'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => setAvatar(emoji)}
                            className={`w-10 h-10 rounded-lg text-lg transition-all duration-200 ${
                              avatar === emoji
                                ? 'bg-electric-blue text-white shadow-neumorphic-inset'
                                : 'bg-dark-gray shadow-neumorphic text-white/70 hover:shadow-neumorphic-inset hover:text-white'
                            } border border-white/10`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-body font-medium mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full px-4 py-3 bg-dark-gray shadow-neumorphic-inset rounded-lg text-white placeholder-white/50 font-body border border-white/10 focus:outline-none focus:ring-2 focus:ring-electric-blue/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-body font-medium mb-2">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      className="w-full px-4 py-3 bg-dark-gray shadow-neumorphic-inset rounded-lg text-white placeholder-white/50 font-body border border-white/10 focus:outline-none focus:ring-2 focus:ring-electric-blue/50 resize-none"
                    />
                  </div>

                  <button
                    onClick={handleCreateProfile}
                    disabled={isCreating || !username.trim()}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? 'Creating Profile...' : 'Create Profile'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Profile Management
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              {/* Profile Info */}
              <div className="bg-dark-gray shadow-neumorphic rounded-xl p-8 border border-white/5">
                <h2 className="text-2xl font-heading font-bold text-electric-blue mb-6">
                  Profile Information
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-white font-body font-medium mb-2">
                      Avatar
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-electric-blue to-vibrant-orange rounded-full flex items-center justify-center shadow-neumorphic-inset">
                        <span className="text-white font-code font-bold text-xl">
                          {avatar}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {['👤', '🦸', '🤖', '🌟', '🎨', '🔥'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => setAvatar(emoji)}
                            className={`w-10 h-10 rounded-lg text-lg transition-all duration-200 ${
                              avatar === emoji
                                ? 'bg-electric-blue text-white shadow-neumorphic-inset'
                                : 'bg-dark-gray shadow-neumorphic text-white/70 hover:shadow-neumorphic-inset hover:text-white'
                            } border border-white/10`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-body font-medium mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-gray shadow-neumorphic-inset rounded-lg text-white font-body border border-white/10 focus:outline-none focus:ring-2 focus:ring-electric-blue/50"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-body font-medium mb-2">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-dark-gray shadow-neumorphic-inset rounded-lg text-white font-body border border-white/10 focus:outline-none focus:ring-2 focus:ring-electric-blue/50 resize-none"
                    />
                  </div>

                  <button
                    onClick={handleUpdateProfile}
                    disabled={isUpdating}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </div>

              {/* Social Features */}
              <div className="space-y-6">
                <div className="bg-dark-gray shadow-neumorphic rounded-xl p-8 border border-white/5">
                  <h3 className="text-xl font-heading font-bold text-electric-blue mb-4">
                    Connections
                  </h3>
                  <UserConnectionsDisplay userId={authState.user?.id?.toString() || ''} />
                </div>

                <div className="bg-dark-gray shadow-neumorphic rounded-xl p-8 border border-white/5">
                  <h3 className="text-xl font-heading font-bold text-electric-blue mb-4">
                    Follow Requests
                  </h3>
                  <FollowRequestsPanel />
                </div>

                <div className="bg-dark-gray shadow-neumorphic-inset rounded-xl p-8 border border-white/5">
                  <h3 className="text-xl font-heading font-bold text-white mb-4">
                    Quick Start
                  </h3>
                  <p className="text-white/70 font-body mb-4">
                    Welcome to deCentra! Complete your profile and create your
                    first post!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </SocialNetworkLayout>
    </AuthGuard>
  );
}
