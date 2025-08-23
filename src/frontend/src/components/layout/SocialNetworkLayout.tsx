'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/contexts/AuthContext';
import { ProfileCreationFlow } from '@/components/auth/ProfileCreationFlow';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import type { UserProfile } from '@/lib/types/auth.types';

/**
 * Main social network layout component following Twitter-inspired design
 * Implements responsive three-column layout with proper accessibility
 */
export interface SocialNetworkLayoutProps {
  /**
   * Left sidebar content (navigation, user profile)
   */
  sidebar?: React.ReactNode;
  /**
   * Main content area (feed, posts, etc.)
   */
  children: React.ReactNode;
  /**
   * Right panel content (trends, suggestions)
   */
  rightPanel?: React.ReactNode;
  /**
   * Custom class name for layout container
   */
  className?: string;
  /**
   * Whether to show the right panel on desktop
   */
  showRightPanel?: boolean;
  /**
   * Whether the layout should be full width (no max-width constraint)
   */
  fullWidth?: boolean;
  /**
   * Header component for mobile view
   */
  mobileHeader?: React.ReactNode;
  /**
   * Bottom navigation for mobile
   */
  mobileNavigation?: React.ReactNode;
}

const SocialNetworkLayout = React.forwardRef<
  HTMLDivElement,
  SocialNetworkLayoutProps
>(
  (
    {
      sidebar,
      children,
      rightPanel,
      className,
      showRightPanel = true,
      fullWidth = false,
      mobileHeader,
      mobileNavigation,
    },
    ref
  ) => {
    const { user, isLoading, refreshAuth } = useAuth();

    // Handle authentication and profile creation flow
    if (!user) {
      return (
        <div className="min-h-screen bg-dark-background-primary flex items-center justify-center">
          <ErrorBoundary
            fallback={({ resetError }) => (
              <div className="max-w-md w-full bg-dark-background-secondary rounded-lg shadow-soft p-6 text-center">
                <h2 className="text-xl font-semibold text-dark-text-primary mb-2">
                  Profile Creation Error
                </h2>
                <p className="text-dark-text-secondary mb-4">
                  Something went wrong while creating your profile. Please try
                  again.
                </p>
                <button
                  onClick={resetError}
                  className="bg-electric-blue hover:bg-electric-blue/90 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            )}
          >
            <ProfileCreationFlow
              onComplete={async (profile: UserProfile) => {
                console.log('Profile created:', profile);
                // Refresh auth state instead of hard reload
                try {
                  await refreshAuth();
                } catch (error) {
                  console.error(
                    'Failed to refresh auth after profile creation:',
                    error
                  );
                  // Fallback to reload only if refresh fails
                  window.location.reload();
                }
              }}
            />
          </ErrorBoundary>
        </div>
      );
    }

    // Show loading state while authentication is in progress
    if (isLoading) {
      return (
        <div className="min-h-screen bg-dark-background-primary flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue"></div>
            <p className="text-dark-text-secondary">Loading...</p>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'min-h-screen bg-privacy-background text-privacy-text',
          className
        )}
      >
        {/* Mobile Header */}
        {mobileHeader && (
          <header className="sticky top-0 z-40 lg:hidden bg-privacy-dark/95 backdrop-blur-sm border-b border-privacy-border/20">
            {mobileHeader}
          </header>
        )}

        {/* Main Layout Container */}
        <div
          className={cn(
            'mx-auto flex',
            fullWidth ? 'w-full' : 'max-w-6xl',
            'min-h-screen'
          )}
        >
          {/* Left Sidebar - Desktop Only */}
          {sidebar && (
            <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 shrink-0">
              <div className="sticky top-0 h-screen overflow-y-auto py-4 px-4">
                {sidebar}
              </div>
            </aside>
          )}

          {/* Main Content Area */}
          <main
            className={cn(
              'flex-1 min-w-0 border-x border-privacy-border/20',
              'lg:max-w-2xl xl:max-w-xl'
            )}
            role="main"
            aria-label="Main content"
          >
            <div className="min-h-screen">{children}</div>
          </main>

          {/* Right Panel - Desktop Only */}
          {showRightPanel && rightPanel && (
            <aside className="hidden xl:flex xl:flex-col xl:w-80 shrink-0">
              <div className="sticky top-0 h-screen overflow-y-auto py-4 px-4">
                {rightPanel}
              </div>
            </aside>
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        {mobileNavigation && (
          <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-privacy-dark/95 backdrop-blur-sm border-t border-privacy-border/20">
            {mobileNavigation}
          </nav>
        )}
      </div>
    );
  }
);

SocialNetworkLayout.displayName = 'SocialNetworkLayout';

/**
 * Content wrapper for main feed area with proper spacing
 */
export interface ContentWrapperProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Whether to add padding for content
   */
  padded?: boolean;
  /**
   * Header content for the content section
   */
  header?: React.ReactNode;
  /**
   * Whether the header should be sticky
   */
  stickyHeader?: boolean;
}

const ContentWrapper = React.forwardRef<HTMLDivElement, ContentWrapperProps>(
  (
    { children, className, padded = true, header, stickyHeader = false },
    ref
  ) => {
    return (
      <div ref={ref} className={cn('w-full', className)}>
        {header && (
          <div
            className={cn(
              'bg-privacy-dark/95 backdrop-blur-sm border-b border-privacy-border/20',
              stickyHeader && 'sticky top-0 z-30',
              padded && 'px-4 py-3'
            )}
          >
            {header}
          </div>
        )}
        <div className={cn(padded && 'px-4 py-2')}>{children}</div>
      </div>
    );
  }
);

ContentWrapper.displayName = 'ContentWrapper';

/**
 * Panel wrapper for sidebar and right panel content
 */
export interface PanelWrapperProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Panel title
   */
  title?: string;
  /**
   * Whether the panel has a border
   */
  bordered?: boolean;
}

const PanelWrapper = React.forwardRef<HTMLDivElement, PanelWrapperProps>(
  ({ children, className, title, bordered = true }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-privacy-dark rounded-xl p-4 space-y-3',
          bordered && 'border border-privacy-border/20 shadow-neumorphic-inset',
          className
        )}
      >
        {title && (
          <h2 className="text-lg font-semibold text-privacy-text">{title}</h2>
        )}
        {children}
      </div>
    );
  }
);

PanelWrapper.displayName = 'PanelWrapper';

/**
 * Responsive grid layout for cards and content
 */
export interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Grid columns configuration
   */
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /**
   * Gap between grid items
   */
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

const ResponsiveGrid = React.forwardRef<HTMLDivElement, ResponsiveGridProps>(
  (
    {
      children,
      className,
      columns = { sm: 1, md: 2, lg: 3, xl: 4 },
      gap = 'md',
    },
    ref
  ) => {
    const gridCols = {
      sm: columns.sm ? `grid-cols-${columns.sm}` : 'grid-cols-1',
      md: columns.md ? `md:grid-cols-${columns.md}` : '',
      lg: columns.lg ? `lg:grid-cols-${columns.lg}` : '',
      xl: columns.xl ? `xl:grid-cols-${columns.xl}` : '',
    };

    const gridGap = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          gridCols.sm,
          gridCols.md,
          gridCols.lg,
          gridCols.xl,
          gridGap[gap],
          className
        )}
      >
        {children}
      </div>
    );
  }
);

ResponsiveGrid.displayName = 'ResponsiveGrid';

export { SocialNetworkLayout, ContentWrapper, PanelWrapper, ResponsiveGrid };
