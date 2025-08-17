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

export default function SettingsPage() {
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
              ⚙️ Settings
            </h1>
            <p className="text-xl text-white/70 font-body max-w-2xl mx-auto">
              Configure your deCentra experience with privacy-first controls and customization options.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Privacy Settings */}
            <div className="bg-dark-gray shadow-neumorphic rounded-xl p-8 border border-white/5">
              <h2 className="text-2xl font-heading font-bold text-electric-blue mb-6">
                🔒 Privacy & Security
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-heading font-semibold text-white mb-2">
                      Profile Visibility
                    </h4>
                    <p className="text-white/70 font-body text-sm mb-3">
                      Control who can see your profile and posts
                    </p>
                    <select className="w-full px-4 py-2 bg-dark-gray shadow-neumorphic-inset rounded-lg text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-electric-blue/50">
                      <option>Public</option>
                      <option>Followers Only</option>
                      <option>Private</option>
                    </select>
                  </div>
                  <div>
                    <h4 className="text-lg font-heading font-semibold text-white mb-2">
                      Anonymous Mode
                    </h4>
                    <p className="text-white/70 font-body text-sm mb-3">
                      Enable anonymous posting and browsing
                    </p>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" />
                      <span className="text-white">Enable anonymous mode</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-heading font-semibold text-white mb-2">
                      Whistleblower Protection
                    </h4>
                    <p className="text-white/70 font-body text-sm mb-3">
                      Enhanced privacy for sensitive content
                    </p>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" />
                      <span className="text-white">Enable whistleblower mode</span>
                    </label>
                  </div>
                  <div>
                    <h4 className="text-lg font-heading font-semibold text-white mb-2">
                      Data Encryption
                    </h4>
                    <p className="text-white/70 font-body text-sm mb-3">
                      End-to-end encryption for messages
                    </p>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" defaultChecked />
                      <span className="text-white">Always encrypt messages</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-dark-gray shadow-neumorphic rounded-xl p-8 border border-white/5">
              <h2 className="text-2xl font-heading font-bold text-electric-blue mb-6">
                🔔 Notifications
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-heading font-semibold text-white">
                      Push Notifications
                    </h4>
                    <p className="text-white/70 font-body text-sm">
                      Receive notifications for new activity
                    </p>
                  </div>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" defaultChecked />
                    <span className="text-white">Enabled</span>
                  </label>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-heading font-semibold text-white">
                      Email Notifications
                    </h4>
                    <p className="text-white/70 font-body text-sm">
                      Get important updates via email
                    </p>
                  </div>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" />
                    <span className="text-white">Enabled</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-dark-gray shadow-neumorphic rounded-xl p-8 border border-white/5">
              <h2 className="text-2xl font-heading font-bold text-electric-blue mb-6">
                👤 Account
              </h2>
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-heading font-semibold text-white mb-4">
                    Internet Identity
                  </h4>
                  <p className="text-white/70 font-body text-sm mb-4">
                    Your account is secured with Internet Identity: {authState.user?.id ? String(authState.user.id).substring(0, 16) + '...' : 'Not connected'}
                  </p>
                  <button className="btn-secondary">
                    Manage Identity
                  </button>
                </div>
                <div>
                  <h4 className="text-lg font-heading font-semibold text-white mb-4">
                    Data Export
                  </h4>
                  <p className="text-white/70 font-body text-sm mb-4">
                    Download all your data in a portable format
                  </p>
                  <button className="btn-secondary">
                    Export Data
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="bg-dark-gray shadow-neumorphic-inset rounded-xl p-8 border border-white/5">
              <h2 className="text-2xl font-heading font-bold text-white mb-6">
                🔧 Advanced
              </h2>
              <div className="space-y-4">
                <p className="text-white/70 font-body">
                  Advanced settings and developer options are coming in future updates. 
                  deCentra is committed to giving users full control over their experience.
                </p>
                <div className="flex gap-4">
                  <button className="btn-secondary flex-1" disabled>
                    Developer Mode
                  </button>
                  <button className="btn-secondary flex-1" disabled>
                    API Access
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SocialNetworkLayout>
    </AuthGuard>
  );
}
