'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { SocialNetworkLayout } from '@/components/layout/SocialNetworkLayout';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/lib/contexts/AuthContext';
import { 
  toComponentAuthState, 
  toSidebarUserProfile, 
  getNavigationItemsConfig,
  type PrivacyMode 
} from '@/lib/types/auth.types';
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

  const handleLogin = async (privacyMode: PrivacyMode) => {
    await authState.login(privacyMode);
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
    
    const IconComponent = iconMapping[id as keyof typeof iconMapping] || icons.home;
    return <IconComponent className="w-5 h-5" aria-hidden="true" />;
  };

  // Get navigation items with icons
  const navigationItems = getNavigationItemsConfig(pathname).map(item => ({
    ...item,
    icon: getIconForNavItem(item.id),
    active: item.active,
  }));

  // Convert auth state for sidebar
  const sidebarUser = authState.user ? toSidebarUserProfile(authState.user) : undefined;
  const componentAuthState = toComponentAuthState(authState);

  return (
    <AuthGuard
      authState={componentAuthState}
      onLogin={handleLogin}
    >
      <SocialNetworkLayout
        sidebar={
          <Sidebar
            user={sidebarUser}
            navigationItems={navigationItems}
            isAuthenticated={authState.isAuthenticated}
          />
        }
        rightPanel={
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Trending Topics</h3>
            <div className="space-y-2">
              <div className="p-3 bg-dark-background-secondary rounded-lg">
                <p className="text-sm text-dark-text-secondary">#decentralization</p>
                <p className="text-xs text-dark-text-tertiary">12.5K posts</p>
              </div>
              <div className="p-3 bg-dark-background-secondary rounded-lg">
                <p className="text-sm text-dark-text-secondary">#privacy</p>
                <p className="text-xs text-dark-text-tertiary">8.2K posts</p>
              </div>
              <div className="p-3 bg-dark-background-secondary rounded-lg">
                <p className="text-sm text-dark-text-secondary">#whistleblower</p>
                <p className="text-xs text-dark-text-tertiary">3.1K posts</p>
              </div>
            </div>
          </div>
        }
      >
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </SocialNetworkLayout>
    </AuthGuard>
  );
}
