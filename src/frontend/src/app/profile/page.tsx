'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/contexts/AuthContext';
import UserConnectionsDisplay from '@/components/social/UserConnectionsDisplay';
import FollowRequestsPanel from '@/components/social/FollowRequestsPanel';

export default function ProfilePage() {
  const {
    isAuthenticated,
    principal,
    user,
    login,
    createUserProfile,
    updateUserProfile,
  } = useAuth();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('👤');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Initialize form with user data when available
  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setBio(user.bio);
      setAvatar(user.avatar);
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!isAuthenticated) {
      alert('You must be logged in to update your profile');
      return;
    }

    setIsUpdating(true);
    try {
      await updateUserProfile(username, bio, avatar);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!isAuthenticated) {
      alert('You must be logged in to create a profile');
      return;
    }

    if (!username.trim()) {
      alert('Username is required');
      return;
    }

    setIsCreating(true);
    try {
      await createUserProfile(username, bio, avatar);
      alert('Profile created successfully!');
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Failed to create profile. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Header />
      <main className="pt-16 min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-20">
          {!isAuthenticated ? (
            <div className="text-center">
              <h1 className="text-3xl font-heading font-bold text-deep-indigo mb-4">
                Profile Page
              </h1>
              <p className="text-lg text-charcoal-black/70 mb-8">
                Connect with Internet Identity to view your profile.
              </p>
              <button onClick={login} className="btn-primary">
                Connect Internet Identity
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-heading font-bold text-deep-indigo mb-4">
                  Your Profile
                </h1>
                <div className="w-24 h-24 bg-gradient-to-br from-deep-indigo to-electric-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-code font-bold text-2xl">
                    {avatar}
                  </span>
                </div>
                <p className="text-charcoal-black/70">
                  Principal: {principal?.toString()}
                </p>
              </div>

              <div className="bg-gradient-to-r from-deep-indigo/5 to-electric-blue/5 rounded-2xl p-6">
                <h2 className="text-xl font-heading font-bold text-deep-indigo mb-4">
                  Profile Information
                </h2>
                {user && (
                  <div className="mb-6 p-4 bg-white/50 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-charcoal-black">
                          @{user.username}
                        </h3>
                        {user.bio && (
                          <p className="text-gray-600 mt-1">{user.bio}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <span>
                        <strong className="text-charcoal-black">
                          {Number(user.follower_count)}
                        </strong>{' '}
                        followers
                      </span>
                      <span>
                        <strong className="text-charcoal-black">
                          {Number(user.following_count)}
                        </strong>{' '}
                        following
                      </span>
                      <span>
                        <strong className="text-charcoal-black">
                          {Number(user.post_count)}
                        </strong>{' '}
                        posts
                      </span>
                    </div>
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal-black mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-deep-indigo focus:border-transparent text-charcoal-black bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-black mb-2">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-deep-indigo focus:border-transparent text-charcoal-black bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-black mb-2">
                      Avatar
                    </label>
                    <input
                      type="text"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="Enter emoji or text"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-deep-indigo focus:border-transparent text-charcoal-black bg-white"
                    />
                  </div>
                  <button
                    onClick={user ? handleUpdateProfile : handleCreateProfile}
                    disabled={isUpdating || isCreating || !username.trim()}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating || isCreating
                      ? 'Processing...'
                      : user
                        ? 'Update Profile'
                        : 'Create Profile'}
                  </button>
                </div>
              </div>

              {/* Follow Requests Panel - Only show for users with profiles */}
              {user && <FollowRequestsPanel />}

              {/* Social Connections Display */}
              {user && (
                <UserConnectionsDisplay
                  userId={user.id.toString()}
                  userProfile={user}
                  isOwnProfile={true}
                />
              )}

              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-xl font-heading font-bold text-deep-indigo mb-4">
                  Your Posts
                </h2>
                <p className="text-charcoal-black/70">
                  Your posts will appear here. Visit the feed to create your
                  first post!
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
