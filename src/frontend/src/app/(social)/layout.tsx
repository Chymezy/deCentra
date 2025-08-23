'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { SocialNetworkLayout } from '@/components/layout/SocialNetworkLayout';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getNavigationItemsConfig } from '@/lib/types/auth.types';
import { icons } from '@/lib/icons';
import { usePathname } from 'next/navigation';

/**
 * Social Network Layout - Applied to all authenticated social features
 *
 * This layout provides:
 * - Authentication guard
 * - Three-column Twitter-style layout
 * - Sidebar navigation with user profile
 * - Consistent navigation across all social pages
 * - Centralized layout logic (DRY principle)
 */
export default function SocialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authState = useAuth();
  const pathname = usePathname();

  const handleLogin = async () => {
    await authState.login();
  };

  // Helper function to get icons for navigation items
  const getIconForNavItem = (id: string): React.ReactNode => {
    const iconMapping = {
      home: icons.home,
      feed: icons.feed,
      discover: icons.discover,
      notifications: icons.notifications,
      messages: icons.messages,
      profile: icons.profile,
      creator: icons.creator,
      settings: icons.settings,
    };

    const IconComponent =
      iconMapping[id as keyof typeof iconMapping] || icons.home;
    return <IconComponent className="w-5 h-5" aria-hidden="true" />;
  };

  // Get navigation items with icons
  const navigationItems = getNavigationItemsConfig(pathname).map((item) => ({
    ...item,
    icon: getIconForNavItem(item.id),
    active: item.active,
  }));

  return (
    <AuthGuard
      authState={{
        isAuthenticated: authState.isAuthenticated,
        isLoading: authState.isLoading,
        user: authState.user
          ? {
              id: authState.user.id.toString(),
              username: authState.user.username || '',
              displayName: authState.user.bio, // Assuming bio can be used as displayName
              avatar: authState.user.avatar,
              verified: 'Verified' in authState.user.verification_status,
              privacyMode: 'normal', // Updated to valid PrivacyMode string
            }
          : undefined,
      }}
      onLogin={handleLogin}
    >
      <SocialNetworkLayout
        sidebar={
          <Sidebar
            user={
              authState.user
                ? {
                    id: authState.user.id.toString(),
                    username: authState.user.username || '',
                    displayName: authState.user.bio, // Assuming bio can be used as displayName
                    avatar: authState.user.avatar,
                    verified: 'Verified' in authState.user.verification_status,
                    stats: {
                      followers: 1234,
                      following: 567,
                      posts: 89,
                    },
                  }
                : undefined
            }
            navigationItems={navigationItems}
            isAuthenticated={authState.isAuthenticated}
            onLogin={handleLogin}
            onLogout={authState.logout}
            onCreatePost={() => console.log('Create post clicked')}
          />
        }
        rightPanel={
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Trending Topics</h3>
            <div className="space-y-2">
              <div className="p-3 bg-dark-background-secondary rounded-lg">
                <p className="text-sm text-dark-text-secondary">
                  #decentralization
                </p>
                <p className="text-xs text-dark-text-tertiary">12.5K posts</p>
              </div>
              <div className="p-3 bg-dark-background-secondary rounded-lg">
                <p className="text-sm text-dark-text-secondary">#privacy</p>
                <p className="text-xs text-dark-text-tertiary">8.2K posts</p>
              </div>
              <div className="p-3 bg-dark-background-secondary rounded-lg">
                <p className="text-sm text-dark-text-secondary">
                  #whistleblower
                </p>
                <p className="text-xs text-dark-text-tertiary">3.1K posts</p>
              </div>
            </div>
          </div>
        }
      >
        <main className="flex-1 min-h-screen">{children}</main>
      </SocialNetworkLayout>
    </AuthGuard>
  );
}
