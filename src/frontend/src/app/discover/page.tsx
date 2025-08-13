'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthContext';
import UserSearch from '@/components/social/UserSearch';
import type { UserProfile } from '../../../../declarations/backend/backend.did';

export default function DiscoverPage() {
  const { isAuthenticated, login } = useAuth();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const handleUserSelect = (user: UserProfile) => {
    setSelectedUser(user);
    // TODO: Navigate to user profile page
    console.log('Selected user:', user);
  };

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="pt-16 min-h-screen">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center py-16">
              <span className="text-6xl block mb-4">🔍</span>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Discover Users
              </h1>
              <p className="text-gray-600 mb-8">
                Connect with Internet Identity to search and discover other
                users
              </p>
              <button
                onClick={login}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Connect Internet Identity
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Page Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Discover Users
              </h1>
              <p className="text-gray-600 mb-8">
                Find and connect with other users in the deCentra community
              </p>
            </div>

            {/* User Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Search Users
              </h2>
              <UserSearch
                onUserSelect={handleUserSelect}
                placeholder="Search for users by username..."
                showFollowButtons={true}
                maxResults={10}
                className="w-full"
              />
            </div>

            {/* Selected User Preview */}
            {selectedUser && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Selected User
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {selectedUser.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedUser.username}
                    </h3>
                    <p className="text-gray-600">
                      {selectedUser.bio || 'No bio available'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                      <span>
                        {Number(selectedUser.follower_count)} followers
                      </span>
                      <span>
                        {Number(selectedUser.following_count)} following
                      </span>
                      <span>{Number(selectedUser.post_count)} posts</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Integration Status */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">
                🚧 Integration Status
              </h2>
              <div className="space-y-3 text-blue-800">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Enhanced Authentication with Profile Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Profile Creation Wizard for New Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Interactive Like/Unlike System</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Comprehensive Comment System with Threading</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Follow/Unfollow Functionality</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Follow Request Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Enhanced Profile Display</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-600">⚠️</span>
                  <span>User Search (Backend endpoint needed)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">🔄</span>
                  <span>Privacy Settings Management (Coming next)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">🔄</span>
                  <span>Notification System (Coming next)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
