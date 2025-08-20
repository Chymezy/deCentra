'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { ProfileCreationFlow } from './ProfileCreationFlow';

interface SimpleAuthGuardProps {
  children: ReactNode;
  requireProfile?: boolean;
  fallback?: ReactNode;
}

/**
 * Simple AuthGuard Component for Profile Creation Flow
 * 
 * Protects components that require authentication and/or user profiles.
 * Automatically shows ProfileCreationFlow when user doesn't have a profile.
 */
export function SimpleAuthGuard({ 
  children, 
  requireProfile = true, 
  fallback 
}: SimpleAuthGuardProps) {
  const { authState } = useAuth();

  // Show loading while checking authentication
  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Show fallback or redirect to login if not authenticated
  if (!authState.isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Default login prompt
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Welcome to deCentra
            </h1>
            <p className="text-slate-400 mb-6">
              Please log in with Internet Identity to continue
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show profile creation if user doesn't have a profile
  if (requireProfile && !authState.user) {
    return <ProfileCreationFlow />;
  }

  // Show auth error if there's an error
  if (authState.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-red-500/20 p-8">
            <div className="text-red-400 text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              Authentication Error
            </h1>
            <p className="text-slate-400 mb-6">
              {authState.error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-6 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-medium rounded-lg transition-all duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // All checks passed - render children
  return <>{children}</>;
}
