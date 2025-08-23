'use client';

import { SocialNetworkLayout } from '@/components/layout/SocialNetworkLayout';
import Sidebar from '@/components/layout/Sidebar';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/**
 * Social Network Layout - Applied to all social features
 *
 * This layout provides:
 * - Three-column Twitter-style layout
 * - Sidebar navigation with real authentication
 * - Consistent navigation across all social pages
 * - Centralized layout logic (DRY principle)
 * - Real authentication state and logout functionality
 */
export default function SocialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { 
    isAuthenticated, 
    isLoading 
  } = useAuth();

  // Authentication Guard - Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to landing page');
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading spinner while auth is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" variant="glass-primary" />
          <div className="text-gray-300">Loading your social network...</div>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (redirect is happening)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <SocialNetworkLayout
      sidebar={<Sidebar />}
      rightPanel={
        <div className="p-4 space-y-4">
          {/* Enhanced Trending Topics Section */}
          <div className="glass-card rounded-xl p-4 animate-fade-in">
            <h3 className="text-lg font-semibold mb-4 text-white gradient-text-social">
              🔥 Trending Topics
            </h3>
            <div className="space-y-2">
              {[
                { tag: '#decentralization', posts: '12.5K', href: '/discover?tag=decentralization' },
                { tag: '#privacy', posts: '8.2K', href: '/discover?tag=privacy' },
                { tag: '#whistleblower', posts: '3.1K', href: '/discover?tag=whistleblower' },
                { tag: '#freespeech', posts: '6.7K', href: '/discover?tag=freespeech' },
                { tag: '#icp', posts: '4.2K', href: '/discover?tag=icp' },
              ].map((topic, index) => (
                <Link
                  key={topic.tag}
                  href={topic.href}
                  className={`block p-3 glass-interactive rounded-lg hover:glow-social transition-all duration-300 group animate-fade-in-up animation-delay-${200 + index * 100}`}
                >
                  <p className="text-sm text-white font-medium group-hover:gradient-text-social transition-all duration-300">
                    {topic.tag}
                  </p>
                  <p className="text-xs text-gray-300 group-hover:text-gray-100 transition-colors duration-300">
                    {topic.posts} posts
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Suggested Users Section */}
          <div className="glass-card rounded-xl p-4 animate-fade-in animation-delay-400">
            <h3 className="text-lg font-semibold mb-4 text-white gradient-text-social">
              👥 Who to Follow
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Anonymous Whistleblower', username: '@anon_truth', verified: true },
                { name: 'Privacy Advocate', username: '@privacy_first', verified: false },
                { name: 'Decentralized Dev', username: '@decentral_dev', verified: true },
              ].map((user, index) => (
                <Link
                  key={user.username}
                  href={`/profile/${user.username.slice(1)}`}
                  className={`flex items-center space-x-3 p-3 glass-interactive rounded-lg hover:glow-social transition-all duration-300 group animate-fade-in-left animation-delay-${300 + index * 100}`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center shadow-glass-soft group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-xs font-bold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white group-hover:gradient-text-social transition-all duration-300 truncate">
                      {user.name} {user.verified && '✓'}
                    </p>
                    <p className="text-xs text-gray-300 group-hover:text-gray-100 transition-colors duration-300 truncate">
                      {user.username}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <main 
        className="flex-1 min-h-screen bg-dark-background-primary"
        role="main"
        aria-label="Social network main content"
      >
        {children}
      </main>
    </SocialNetworkLayout>
  );
}
