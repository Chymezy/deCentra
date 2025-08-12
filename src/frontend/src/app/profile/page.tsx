'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthContext';
import UserConnectionsDisplay from '@/components/social/UserConnectionsDisplay';
import FollowRequestsPanel from '@/components/social/FollowRequestsPanel';
import { backend } from '../../../../declarations/backend';
import type { UserProfile } from '../../../../declarations/backend/backend.did';
import { Principal } from '@dfinity/principal';

export default function ProfilePage() {
  const { isAuthenticated, principal, login } = useAuth();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('👤');
  const [isUpdating, setIsUpdating] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Fetch user profile when authenticated
  useEffect(() => {
    if (isAuthenticated && principal) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, principal]);

  const fetchProfile = async () => {
    if (!backend || !principal) return;
    // Use Principal.fromText for correct type
    const principalId = Principal.fromText(principal);
    try {
      const userProfileResult = await backend.get_user_profile(principalId);
      if (userProfileResult && userProfileResult.length > 0) {
        const userProfile = userProfileResult[0];
        if (userProfile) {
          setProfile(userProfile);
          setUsername(userProfile.username);
          setBio(userProfile.bio);
          setAvatar(userProfile.avatar);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!isAuthenticated || !backend) {
      alert('Please connect with Internet Identity first');
      return;
    }

    if (!username.trim()) {
      alert('Username is required');
      return;
    }

    setIsUpdating(true);
    try {
      const result = await backend.update_user_profile(
        username,
        bio ? [bio] : [],
        avatar ? [avatar] : []
      );
      if ('Ok' in result) {
        alert('Profile updated successfully!');
        setProfile(result.Ok);
      } else {
        alert('Error updating profile: ' + result.Err);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      alert('Error updating profile: ' + error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!isAuthenticated || !backend) {
      alert('Please connect with Internet Identity first');
      return;
    }

    if (!username.trim()) {
      alert('Username is required');
      return;
    }

    setIsUpdating(true);
    try {
      const result = await backend.create_user_profile(
        username,
        bio ? [bio] : [],
        avatar ? [avatar] : []
      );
      if ('Ok' in result) {
        alert('Profile created successfully!');
        setProfile(result.Ok);
      } else {
        alert('Error creating profile: ' + result.Err);
      }
    } catch (error) {
      console.error('Create profile error:', error);
      alert('Error creating profile: ' + error);
    } finally {
      setIsUpdating(false);
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
                <p className="text-charcoal-black/70">Principal: {principal}</p>
              </div>

              <div className="bg-gradient-to-r from-deep-indigo/5 to-electric-blue/5 rounded-2xl p-6">
                <h2 className="text-xl font-heading font-bold text-deep-indigo mb-4">
                  Profile Information
                </h2>
                {profile && (
                  <div className="mb-6 p-4 bg-white/50 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-charcoal-black">
                          @{profile.username}
                        </h3>
                        {profile.bio && (
                          <p className="text-gray-600 mt-1">{profile.bio}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <span>
                        <strong className="text-charcoal-black">
                          {Number(profile.follower_count)}
                        </strong>{' '}
                        followers
                      </span>
                      <span>
                        <strong className="text-charcoal-black">
                          {Number(profile.following_count)}
                        </strong>{' '}
                        following
                      </span>
                      <span>
                        <strong className="text-charcoal-black">
                          {Number(profile.post_count)}
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
                    onClick={
                      profile ? handleUpdateProfile : handleCreateProfile
                    }
                    disabled={isUpdating || !username.trim()}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating
                      ? 'Updating...'
                      : profile
                        ? 'Update Profile'
                        : 'Create Profile'}
                  </button>
                </div>
              </div>

              {/* Follow Requests Panel - Only show for users with profiles */}
              {profile && <FollowRequestsPanel />}

              {/* Social Connections Display */}
              {profile && (
                <UserConnectionsDisplay
                  userId={profile.id.toString()}
                  userProfile={profile}
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
