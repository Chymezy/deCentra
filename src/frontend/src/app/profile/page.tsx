'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthContext';
import ProfileDisplay from '@/components/profile/ProfileDisplay';
import FollowRequestManager from '@/components/social/FollowRequestManager';

export default function ProfilePage() {
  const { isAuthenticated, userProfile, login } = useAuth();

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="pt-16 min-h-screen">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center py-16">
              <span className="text-6xl block mb-4">👤</span>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile</h1>
              <p className="text-gray-600 mb-8">
                Connect with Internet Identity to view and manage your profile
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

  if (!userProfile) {
    return (
      <>
        <Header />
        <main className="pt-16 min-h-screen">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your profile...</p>
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
            {/* User Profile Display */}
            <ProfileDisplay />
            
            {/* Follow Requests Management */}
            <FollowRequestManager />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
