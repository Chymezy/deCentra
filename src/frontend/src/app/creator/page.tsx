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

export default function CreatorPage() {
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
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-heading font-bold text-white mb-4">
              ⭐ Creator Hub
            </h1>
            <p className="text-xl text-white/70 font-body max-w-2xl mx-auto">
              Monetize your content with ICP tokens, build your audience, and access powerful analytics in the decentralized creator economy.
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Analytics Card */}
            <div className="bg-dark-gray shadow-neumorphic rounded-xl p-6 border border-white/5">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">📊</span>
                <h3 className="text-xl font-heading font-bold text-electric-blue">
                  Analytics
                </h3>
              </div>
              <p className="text-white/70 font-body mb-4">
                Track your content performance, audience growth, and engagement metrics.
              </p>
              <ul className="space-y-2 text-sm text-white/60">
                <li>• Post performance tracking</li>
                <li>• Audience demographics</li>
                <li>• Engagement analytics</li>
                <li>• Revenue insights</li>
              </ul>
            </div>

            {/* Monetization Card */}
            <div className="bg-dark-gray shadow-neumorphic rounded-xl p-6 border border-white/5">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">💰</span>
                <h3 className="text-xl font-heading font-bold text-electric-blue">
                  Monetization
                </h3>
              </div>
              <p className="text-white/70 font-body mb-4">
                Earn ICP tokens through tips, subscriptions, and premium content.
              </p>
              <ul className="space-y-2 text-sm text-white/60">
                <li>• Micro-tipping system</li>
                <li>• Subscription tiers</li>
                <li>• Premium content gates</li>
                <li>• Direct payouts</li>
              </ul>
            </div>

            {/* Tools Card */}
            <div className="bg-dark-gray shadow-neumorphic rounded-xl p-6 border border-white/5">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">🛠️</span>
                <h3 className="text-xl font-heading font-bold text-electric-blue">
                  Creator Tools
                </h3>
              </div>
              <p className="text-white/70 font-body mb-4">
                Advanced content creation and management tools for creators.
              </p>
              <ul className="space-y-2 text-sm text-white/60">
                <li>• Scheduled posting</li>
                <li>• Content templates</li>
                <li>• Bulk management</li>
                <li>• Collaboration tools</li>
              </ul>
            </div>

            {/* Community Card */}
            <div className="bg-dark-gray shadow-neumorphic rounded-xl p-6 border border-white/5">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">👥</span>
                <h3 className="text-xl font-heading font-bold text-electric-blue">
                  Community
                </h3>
              </div>
              <p className="text-white/70 font-body mb-4">
                Build and engage with your audience through interactive features.
              </p>
              <ul className="space-y-2 text-sm text-white/60">
                <li>• Fan engagement tools</li>
                <li>• Live interaction features</li>
                <li>• Community management</li>
                <li>• Supporter recognition</li>
              </ul>
            </div>

            {/* Privacy Card */}
            <div className="bg-dark-gray shadow-neumorphic rounded-xl p-6 border border-white/5">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">🔒</span>
                <h3 className="text-xl font-heading font-bold text-electric-blue">
                  Privacy & Security
                </h3>
              </div>
              <p className="text-white/70 font-body mb-4">
                Protect your identity and content with advanced privacy controls.
              </p>
              <ul className="space-y-2 text-sm text-white/60">
                <li>• Anonymous creator mode</li>
                <li>• Content encryption</li>
                <li>• Access controls</li>
                <li>• Identity protection</li>
              </ul>
            </div>

            {/* Getting Started Card */}
            <div className="bg-dark-gray shadow-neumorphic-inset rounded-xl p-6 border border-white/5">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">🚀</span>
                <h3 className="text-xl font-heading font-bold text-white">
                  Getting Started
                </h3>
              </div>
              <p className="text-white/70 font-body mb-4">
                Ready to become a deCentra creator? All features are coming soon in Phase 2!
              </p>
              <button className="w-full btn-primary mt-4" disabled>
                Join Creator Beta
              </button>
            </div>
          </div>
        </div>
      </SocialNetworkLayout>
    </AuthGuard>
  );
}
