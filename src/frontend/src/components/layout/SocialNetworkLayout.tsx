'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Main social network layout component following Twitter-inspired design
 * Implements responsive three-column layout with proper accessibility
 * Simplified version without authentication dependencies
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
    return (
      <div
        ref={ref}
        className={cn(
          'min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white',
          'relative overflow-hidden',
          className
        )}
      >
        {/* Animated background elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-900/8 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-900/6 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-3/4 right-1/3 w-64 h-64 bg-orange-900/4 rounded-full blur-3xl animate-float"></div>
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(79,70,229,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(79,70,229,0.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        </div>

        {/* Mobile Header */}
        {mobileHeader && (
          <header className="sticky top-0 z-40 lg:hidden glass-nav-enhanced">
            {mobileHeader}
          </header>
        )}

        {/* Main Layout Container */}
        <div
          className={cn(
            'relative mx-auto flex',
            fullWidth ? 'w-full' : 'max-w-6xl',
            'min-h-screen'
          )}
        >
          {/* Left Sidebar - Desktop Only */}
          {sidebar && (
            <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 shrink-0">
              <div className="sticky top-0 h-screen overflow-y-auto py-4 px-4 glass-nav rounded-r-2xl">
                {sidebar}
              </div>
            </aside>
          )}

          {/* Main Content Area */}
          <main
            className={cn(
              'flex-1 min-w-0 border-x border-glass-border/20',
              'lg:max-w-2xl xl:max-w-xl glass-social-card/50 backdrop-blur-sm'
            )}
            role="main"
            aria-label="Main content"
          >
            <div className="min-h-screen">{children}</div>
          </main>

          {/* Right Panel - Desktop Only */}
          {showRightPanel && rightPanel && (
            <aside className="hidden xl:flex xl:flex-col xl:w-80 shrink-0">
              <div className="sticky top-0 h-screen overflow-y-auto py-4 px-4 glass-nav rounded-l-2xl">
                {rightPanel}
              </div>
            </aside>
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        {mobileNavigation && (
          <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden glass-nav-enhanced border-t border-glass-border/30">
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
              'glass-nav-enhanced border-b border-glass-border/30',
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
  ({ children, className, title, bordered = true }, ref  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'glass-premium rounded-xl p-4 space-y-3 animate-fade-in',
          bordered && 'border border-glass-border shadow-glass-soft',
          className
        )}
      >
        {title && (
          <h2 className="text-lg font-semibold text-white gradient-text-social">{title}</h2>
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
