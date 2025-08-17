'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { SocialNetworkLayout } from '@/components/layout/SocialNetworkLayout';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/lib/contexts/AuthContext';
import { type PrivacyMode } from '@/components/auth/LoginFlow';
import { 
  toComponentAuthState, 
  toSidebarUserProfile, 
  getNavigationItemsConfig
} from '@/lib/types/unified-auth.types';
import { usePathname } from 'next/navigation';

export default function NotificationsPage() {
  const authState = useAuth();
  const pathname = usePathname();

  const handleLogin = async (privacyMode: PrivacyMode) => {
    await authState.login(privacyMode);
  };

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

  // Convert auth state for AuthGuard using unified utilities
  const authStateForGuard = toComponentAuthState({
    ...authState,
    privacyMode: authState.privacyMode,
  });

  // Convert user for Sidebar using unified utilities
  const sidebarUser = authState.user ? toSidebarUserProfile(authState.user) : undefined;

  // Get navigation items with active state using unified utilities
  const navItemsConfig = getNavigationItemsConfig(pathname);
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
            user={sidebarUser}
            navigationItems={navigationItems}
            isAuthenticated={authState.isAuthenticated}
          />
        }
      >
        <div className="flex flex-col items-center justify-center min-h-96">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-heading font-bold text-white">
              🔔 Notifications
            </h1>
            <p className="text-xl text-white/70 font-body max-w-lg">
              Stay updated with likes, comments, follows, and mentions from your deCentra community.
            </p>
            <div className="bg-dark-gray shadow-neumorphic-inset rounded-xl p-8 border border-white/5 max-w-md mx-auto">
              <h3 className="text-lg font-heading font-bold text-electric-blue mb-4">
                Coming Soon
              </h3>
              <ul className="space-y-2 text-white/70 font-body text-left">
                <li className="flex items-start">
                  <span className="text-vibrant-orange mr-2">•</span>
                  Real-time notifications
                </li>
                <li className="flex items-start">
                  <span className="text-vibrant-orange mr-2">•</span>
                  Push notifications
                </li>
                <li className="flex items-start">
                  <span className="text-vibrant-orange mr-2">•</span>
                  Customizable alerts
                </li>
                <li className="flex items-start">
                  <span className="text-vibrant-orange mr-2">•</span>
                  Privacy-focused delivery
                </li>
              </ul>
            </div>
          </div>
        </div>
      </SocialNetworkLayout>
    </AuthGuard>
  );
}
