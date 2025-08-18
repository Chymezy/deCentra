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

  // Helper function to get icons for navigation items (using emoji temporarily)
  const getIconForNavItem = (id: string): React.ReactNode => {
    const icons = {
      home: '🏠',
      feed: '📰',
      discover: '🔍',
      notifications: '🔔',
      messages: '💬',
      profile: '👤',
      creator: '💰',
      settings: '⚙️',
    };
    
    return <span className="text-lg">{icons[id as keyof typeof icons] || '🏠'}</span>;
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
