'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAuth } from '@/lib/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { icons } from '@/lib/icons';
import Link from 'next/link';
import Image from 'next/image';
import type { UserProfile } from '@/lib/types';

/**
 * Navigation item interface
 */
export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  active?: boolean;
  disabled?: boolean;
}

/**
 * User profile information for sidebar
 */
export interface SidebarUserProfile {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  verified?: boolean;
  stats?: {
    followers: number;
    following: number;
    posts: number;
  };
}

/**
 * Enhanced sidebar navigation component with neumorphic design
 */
export default function Sidebar() {
  const pathname = usePathname();
  
  // Use AuthContext directly like in LandingPage
  const { 
    isAuthenticated, 
    isLoading: authLoading, 
    login, 
    logout,
    clearAuthError,
    user,
    principal
  } = useAuth();

  // Format principal ID for display (privacy-respecting)
  const formatPrincipalId = (principalId: string): string => {
    if (principalId.length <= 12) return principalId;
    return `${principalId.slice(0, 6)}...${principalId.slice(-6)}`;
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

  // Navigation items
  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      href: '/',
      icon: getIconForNavItem('home'),
      active: pathname === '/',
    },
    {
      id: 'feed',
      label: 'Feed',
      href: '/feed',
      icon: getIconForNavItem('feed'),
      active: pathname.startsWith('/feed'),
    },
    {
      id: 'discover',
      label: 'Discover',
      href: '/discover',
      icon: getIconForNavItem('discover'),
      active: pathname.startsWith('/discover'),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      href: '/notifications',
      icon: getIconForNavItem('notifications'),
      active: pathname.startsWith('/notifications'),
    },
    {
      id: 'messages',
      label: 'Messages',
      href: '/messages',
      icon: getIconForNavItem('messages'),
      active: pathname.startsWith('/messages'),
    },
    {
      id: 'profile',
      label: 'Profile',
      href: '/profile',
      icon: getIconForNavItem('profile'),
      active: pathname.startsWith('/profile'),
    },
    {
      id: 'creator',
      label: 'Creator',
      href: '/creator',
      icon: getIconForNavItem('creator'),
      active: pathname.startsWith('/creator'),
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/settings',
      icon: getIconForNavItem('settings'),
      active: pathname.startsWith('/settings'),
    },
  ];

  // Handle create post functionality
  const handleCreatePost = () => {
    console.log('Create post clicked');
    // TODO: Implement create post modal or navigation
  };

  const handleLogin = async () => {
    try {
      clearAuthError?.();
      await login('normal'); // Default to normal mode, can be enhanced later
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 glass-premium backdrop-blur-2xl rounded-r-2xl p-4">
      {/* Enhanced Logo/Brand Section */}
      <div className="px-2 animate-social-pulse">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <Image
              src="/images/decentra-logo.png"
              alt="deCentra Logo"
              width={32}
              height={32}
              className="rounded-lg shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300"
            />
            <div className="absolute inset-0 bg-indigo-500/20 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
          </div>
          <span className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            deCentra
          </span>
        </Link>
      </div>

      {/* Enhanced Navigation Items */}
      <nav className="flex-1 space-y-2 animate-social-bounce" role="navigation">
        {navigationItems.map((item, index) => (
          <div key={item.id} className={`animate-social-bounce animation-delay-${300 + index * 100}`}>
            <NavigationLink item={item} />
          </div>
        ))}
      </nav>

      {/* Enhanced Create Post Button - Show when authenticated */}
      {isAuthenticated && (
        <div className="px-2 animate-fade-in-up animation-delay-500">
          <Button
            onClick={handleCreatePost}
            variant="glass-primary"
            size="lg"
            className="w-full hover:transform hover:scale-105 transition-all duration-300"
          >
            <span className="flex items-center justify-center space-x-2">
              <span>✨</span>
              <span>Create Post</span>
            </span>
          </Button>
        </div>
      )}

      {/* Enhanced User Profile Section */}
      <div className="px-2 pt-4 border-t border-glass-border/40 animate-fade-in-up animation-delay-700">
        {isAuthenticated ? (
          user ? (
            <UserProfileSection
              user={user}
              onProfileClick={() => console.log('Profile clicked')}
              onLogout={handleLogout}
            />
          ) : (
            // Authenticated but no user profile - show minimal authenticated state
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-300">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">👤</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-300">Principal ID</span>
                    <span className="text-xs text-gray-400 font-mono">
                      {principal ? formatPrincipalId(principal.toString()) : 'Loading...'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-400 hover:text-gray-200 transition-colors duration-200"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )
        ) : authLoading ? (
          // Show loading state when auth is being determined
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center space-x-2 text-gray-300">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-400"></div>
              <span className="text-sm">Connecting...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Button
              onClick={handleLogin}
              variant="glass-primary"
              size="sm"
              className="w-full hover:transform hover:scale-105 transition-all duration-300"
            >
              <span className="flex items-center justify-center space-x-2">
                <span>🔐</span>
                <span>Sign In</span>
              </span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Navigation link component
 */
interface NavigationLinkProps {
  item: NavigationItem;
}

const NavigationLink: React.FC<NavigationLinkProps> = ({ item }) => {
  const handleClick = () => {
    if (item.disabled) return;
    item.onClick?.();
  };

  // If item has href, use Link for client-side navigation
  if (item.href && !item.disabled) {
    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ease-out group',
          'glass-interactive hover:glow-social cursor-pointer',
          item.active &&
            'glass-button-primary glow-social border border-indigo-400/30',
          item.disabled && 'opacity-50 cursor-not-allowed'
        )}
        aria-label={item.label}
        aria-current={item.active ? 'page' : undefined}
        onClick={() => {
          // Allow Link to handle navigation, but also call onClick if provided
          item.onClick?.();
        }}
      >
        <div className="flex-shrink-0 text-gray-300 group-hover:text-white group-hover:scale-110 transition-all duration-300">
          {item.icon}
        </div>
        <span className="flex-1 font-medium text-gray-300 group-hover:text-white transition-colors duration-300">
          {item.label}
        </span>
        {item.badge && (
          <span className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-glass-soft animate-social-pulse">
            {item.badge}
          </span>
        )}
      </Link>
    );
  }

  // Fallback for items without href (e.g., logout, custom actions)
  return (
    <div
      className={cn(
        'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ease-out group',
        'glass-interactive hover:glow-social cursor-pointer',
        item.active &&
          'glass-button-primary glow-social border border-indigo-400/30',
        item.disabled && 'opacity-50 cursor-not-allowed'
      )}
      role="button"
      tabIndex={item.disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={item.label}
      aria-current={item.active ? 'page' : undefined}
    >
      <div className="flex-shrink-0 text-gray-300 group-hover:text-white group-hover:scale-110 transition-all duration-300">
        {item.icon}
      </div>
      <span className="flex-1 font-medium text-gray-300 group-hover:text-white transition-colors duration-300">
        {item.label}
      </span>
      {item.badge && (
        <span className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-glass-soft animate-social-pulse">
          {item.badge}
        </span>
      )}
    </div>
  );
};

/**
 * User profile section in sidebar
 */
interface UserProfileSectionProps {
  user: UserProfile;
  onProfileClick?: () => void;
  onLogout?: () => void;
}

const UserProfileSection: React.FC<UserProfileSectionProps> = ({
  user,
  onProfileClick,
  onLogout,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <div className="relative">
      <div
        className={cn(
          'flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 ease-out',
          'glass-social-card hover:glow-social group'
        )}
        onClick={() => setShowMenu(!showMenu)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setShowMenu(!showMenu);
          }
        }}
        aria-label="User menu"
        aria-expanded={showMenu}
      >
        <UserAvatar
          src={user.avatar}
          alt={user.username}
          username={user.username}
          size="sm"
          variant="glass-primary"
          interactive={true}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white gradient-text-social truncate group-hover:scale-105 transition-transform duration-300">
            {user.username}
          </p>
          <p className="text-xs text-gray-300 truncate group-hover:text-gray-200 transition-colors duration-300">
            @{user.username}
          </p>
        </div>
        <svg
          className={cn(
            'h-4 w-4 text-gray-300 transition-all duration-300 group-hover:text-white group-hover:scale-110',
            showMenu && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* User Menu Dropdown */}
      {showMenu && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-privacy-dark border border-privacy-border/20 rounded-xl shadow-neumorphic-raised z-50">
          <div className="py-2">
            <div className="px-4 py-2 border-b border-privacy-border/20">
              <div className="flex justify-between text-xs text-privacy-text-muted">
                <span>{Number(user.post_count)} Posts</span>
                <span>{Number(user.following_count)} Following</span>
                <span>{Number(user.follower_count)} Followers</span>
              </div>
            </div>
            <Link
              href="/profile"
              onClick={() => {
                setShowMenu(false);
                onProfileClick?.();
              }}
              className="block w-full text-left px-4 py-2 text-sm text-privacy-text hover:bg-privacy-muted/20 transition-colors duration-200"
            >
              View Profile
            </Link>
            <button
              onClick={() => {
                setShowMenu(false);
                onLogout?.();
              }}
              className="w-full text-left px-4 py-2 text-sm text-privacy-danger hover:bg-privacy-danger/10 transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export { NavigationLink, UserProfileSection };
