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

export default function FeedPage() {
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
        rightPanel={
          <div className="space-y-4">
            <div className="bg-privacy-background-secondary p-4 rounded-lg shadow-soft">
              <h3 className="text-lg font-heading font-semibold text-privacy-text mb-3">
                What&apos;s trending
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-privacy-text">#deCentralized</p>
                  <p className="text-privacy-text-muted">2,134 posts</p>
                </div>
                <div>
                  <p className="font-medium text-privacy-text">#Web3Social</p>
                  <p className="text-privacy-text-muted">1,892 posts</p>
                </div>
                <div>
                  <p className="font-medium text-privacy-text">#PrivacyFirst</p>
                  <p className="text-privacy-text-muted">1,456 posts</p>
                </div>
                <div>
                  <p className="font-medium text-privacy-text">#Censorship</p>
                  <p className="text-privacy-text-muted">987 posts</p>
                </div>
                <div>
                  <p className="font-medium text-privacy-text">#Whistleblower</p>
                  <p className="text-privacy-text-muted">743 posts</p>
                </div>
              </div>
            </div>

            <div className="bg-privacy-background-secondary p-4 rounded-lg shadow-soft">
              <h3 className="text-lg font-heading font-semibold text-privacy-text mb-3">
                Who to follow
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-electric-blue rounded-full flex items-center justify-center text-white font-bold text-sm">
                    A
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-privacy-text text-sm">@activist_journalist</p>
                    <p className="text-privacy-text-muted text-xs">Verified journalist</p>
                  </div>
                  <button className="bg-electric-blue hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium transition-colors">
                    Follow
                  </button>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-vibrant-orange rounded-full flex items-center justify-center text-white font-bold text-sm">
                    W
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-privacy-text text-sm">@whistleblower_anon</p>
                    <p className="text-privacy-text-muted text-xs">Anonymous source</p>
                  </div>
                  <button className="bg-electric-blue hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium transition-colors">
                    Follow
                  </button>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-deep-indigo rounded-full flex items-center justify-center text-white font-bold text-sm">
                    C
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-privacy-text text-sm">@crypto_creator</p>
                    <p className="text-privacy-text-muted text-xs">Creator & developer</p>
                  </div>
                  <button className="bg-electric-blue hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium transition-colors">
                    Follow
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <div className="flex flex-col items-center justify-center min-h-96">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-heading font-bold text-white">
              📰 Your Feed
            </h1>
            <p className="text-xl text-white/70 font-body max-w-lg">
              Your personalized social feed is coming soon. Follow users, create posts, and engage with the community.
            </p>
            <div className="bg-dark-gray shadow-neumorphic-inset rounded-xl p-8 border border-white/5 max-w-md mx-auto">
              <h3 className="text-lg font-heading font-bold text-electric-blue mb-4">
                Coming Soon
              </h3>
              <ul className="space-y-2 text-white/70 font-body text-left">
                <li className="flex items-start">
                  <span className="text-vibrant-orange mr-2">•</span>
                  Personalized feed algorithm
                </li>
                <li className="flex items-start">
                  <span className="text-vibrant-orange mr-2">•</span>
                  Post creation and editing
                </li>
                <li className="flex items-start">
                  <span className="text-vibrant-orange mr-2">•</span>
                  Like, comment & share
                </li>
                <li className="flex items-start">
                  <span className="text-vibrant-orange mr-2">•</span>
                  Real-time notifications
                </li>
                <li className="flex items-start">
                  <span className="text-vibrant-orange mr-2">•</span>
                  Creator monetization
                </li>
              </ul>
            </div>
          </div>
        </div>
      </SocialNetworkLayout>
    </AuthGuard>
  );
}
