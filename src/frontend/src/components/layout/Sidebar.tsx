'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { UserAvatar } from '@/components/ui/UserAvatar';

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

export interface SidebarProps {
  /**
   * Current user profile information
   */
  user?: SidebarUserProfile;
  /**
   * Navigation items
   */
  navigationItems: NavigationItem[];
  /**
   * Whether user is authenticated
   */
  isAuthenticated: boolean;
  /**
   * Login handler for unauthenticated users
   */
  onLogin?: () => void;
  /**
   * Logout handler
   */
  onLogout?: () => void;
  /**
   * Profile click handler
   */
  onProfileClick?: () => void;
  /**
   * Post creation handler
   */
  onCreatePost?: () => void;
  /**
   * Custom class name
   */
  className?: string;
  /**
   * Compact mode for smaller screens
   */
  compact?: boolean;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      user,
      navigationItems,
      isAuthenticated,
      onLogin,
      onLogout,
      onProfileClick,
      onCreatePost,
      className,
      compact = false,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col h-full space-y-4', className)}
      >
        {/* Logo/Brand Section */}
        <div className={cn('px-2', compact && 'text-center')}>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-privacy-accent rounded-lg flex items-center justify-center">
              <span className="text-privacy-dark font-bold text-sm">dC</span>
            </div>
            {!compact && (
              <span className="text-xl font-bold text-privacy-text">
                deCentra
              </span>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1" role="navigation">
          {navigationItems.map((item) => (
            <NavigationLink
              key={item.id}
              item={item}
              compact={compact}
            />
          ))}
        </nav>

        {/* Create Post Button */}
        {isAuthenticated && onCreatePost && (
          <div className="px-2">
            <Button
              onClick={onCreatePost}
              variant="primary"
              size="lg"
              className={cn(
                'w-full',
                compact && 'px-3'
              )}
            >
              {compact ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              ) : (
                'Create Post'
              )}
            </Button>
          </div>
        )}

        {/* User Profile Section */}
        <div className="px-2 pt-4 border-t border-privacy-border/20">
          {isAuthenticated && user ? (
            <UserProfileSection
              user={user}
              onProfileClick={onProfileClick}
              onLogout={onLogout}
              compact={compact}
            />
          ) : (
            <div className="space-y-2">
              <Button
                onClick={onLogin}
                variant="primary"
                size="sm"
                className="w-full"
              >
                {compact ? 'Login' : 'Sign In'}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

Sidebar.displayName = 'Sidebar';

/**
 * Navigation link component
 */
interface NavigationLinkProps {
  item: NavigationItem;
  compact: boolean;
}

const NavigationLink: React.FC<NavigationLinkProps> = ({ item, compact }) => {
  const handleClick = () => {
    if (item.disabled) return;
    item.onClick?.();
  };

  const content = (
    <div
      className={cn(
        'flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200',
        'hover:bg-privacy-muted/20 focus:bg-privacy-muted/20 focus:outline-none focus:ring-2 focus:ring-privacy-accent/50',
        item.active && 'bg-privacy-accent/10 text-privacy-accent border border-privacy-accent/20',
        item.disabled && 'opacity-50 cursor-not-allowed',
        compact && 'justify-center px-2'
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
      <div className="flex-shrink-0">
        {item.icon}
      </div>
      {!compact && (
        <>
          <span className="flex-1 font-medium text-privacy-text">
            {item.label}
          </span>
          {item.badge && (
            <span className="bg-privacy-accent text-privacy-dark text-xs font-bold px-2 py-1 rounded-full">
              {item.badge}
            </span>
          )}
        </>
      )}
    </div>
  );

  if (item.href) {
    return (
      <a href={item.href} className="block">
        {content}
      </a>
    );
  }

  return content;
};

/**
 * User profile section in sidebar
 */
interface UserProfileSectionProps {
  user: SidebarUserProfile;
  onProfileClick?: () => void;
  onLogout?: () => void;
  compact: boolean;
}

const UserProfileSection: React.FC<UserProfileSectionProps> = ({
  user,
  onProfileClick,
  onLogout,
  compact,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <div className="relative">
      <div
        className={cn(
          'flex items-center space-x-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200',
          'hover:bg-privacy-muted/20 focus:bg-privacy-muted/20 focus:outline-none focus:ring-2 focus:ring-privacy-accent/50',
          compact && 'justify-center px-2'
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
          alt={user.displayName || user.username}
          username={user.username}
          size="sm"
          verified={user.verified}
        />
        {!compact && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-privacy-text truncate">
              {user.displayName || user.username}
            </p>
            <p className="text-xs text-privacy-text-muted truncate">
              @{user.username}
            </p>
          </div>
        )}
        {!compact && (
          <svg
            className={cn(
              'h-4 w-4 text-privacy-text-muted transition-transform duration-200',
              showMenu && 'rotate-180'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>

      {/* User Menu Dropdown */}
      {showMenu && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-privacy-dark border border-privacy-border/20 rounded-xl shadow-neumorphic-raised z-50">
          <div className="py-2">
            {user.stats && !compact && (
              <div className="px-4 py-2 border-b border-privacy-border/20">
                <div className="flex justify-between text-xs text-privacy-text-muted">
                  <span>{user.stats.posts} Posts</span>
                  <span>{user.stats.following} Following</span>
                  <span>{user.stats.followers} Followers</span>
                </div>
              </div>
            )}
            <button
              onClick={() => {
                setShowMenu(false);
                onProfileClick?.();
              }}
              className="w-full text-left px-4 py-2 text-sm text-privacy-text hover:bg-privacy-muted/20 transition-colors duration-200"
            >
              View Profile
            </button>
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

export { Sidebar, NavigationLink, UserProfileSection };
