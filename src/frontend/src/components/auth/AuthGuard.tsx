'use client';

import React from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { LoginFlow, type PrivacyMode } from './LoginFlow';
import { ProfileCreationFlow } from './ProfileCreationFlow';

/**
 * Route protection levels
 */
export type ProtectionLevel = 'public' | 'authenticated' | 'verified' | 'admin';

/**
 * AuthGuard props interface
 */
export interface AuthGuardProps {
  /**
   * Children to render when authentication requirements are met
   */
  children: React.ReactNode;
  /**
   * Required protection level for this route
   */
  requiredLevel?: ProtectionLevel;
  /**
   * Whether a user profile is required
   */
  requireProfile?: boolean;
  /**
   * Optional auth state override (uses context if not provided)
   */
  authState?: {
    isAuthenticated: boolean;
    isLoading: boolean;
    user?: {
      id: string;
      username?: string;
      displayName?: string;
      avatar?: string;
      verified?: boolean;
      privacyMode: PrivacyMode;
    };
    error?: string;
  };
  /**
   * Login handler (optional - will use context if not provided)
   */
  onLogin?: (privacyMode: PrivacyMode) => Promise<void>;
  /**
   * Logout handler (optional - will use context if not provided)
   */
  onLogout?: () => Promise<void>;
  /**
   * Custom loading component
   */
  loadingComponent?: React.ReactNode;
  /**
   * Custom unauthorized component
   */
  unauthorizedComponent?: React.ReactNode;
  /**
   * Whether to show privacy mode selection in login flow
   */
  showPrivacyModeSelection?: boolean;
  /**
   * Custom class name
   */
  className?: string;
  /**
   * Fallback message for unauthorized access
   */
  unauthorizedMessage?: string;
  /**
   * Whether to render as modal or full page
   */
  mode?: 'modal' | 'page';
}

/**
 * AuthGuard component for protecting routes and components based on authentication state
 */
const AuthGuard = React.forwardRef<HTMLDivElement, AuthGuardProps>(
  (
    {
      children,
      requiredLevel = 'public',
      requireProfile = false,
      authState: providedAuthState,
      onLogin,
      onLogout,
      loadingComponent,
      unauthorizedComponent,
      showPrivacyModeSelection = true,
      className,
      unauthorizedMessage,
      mode = 'page',
    },
    ref
  ) => {
    // Get auth state from context if not provided
    const authContext = useAuth();
    
    // Use provided authState or fall back to context
    const authState = providedAuthState || {
      isAuthenticated: authContext.isAuthenticated,
      isLoading: authContext.isLoading,
      user: authContext.user ? {
        id: authContext.user.id.toString(),
        username: authContext.user.username || '',
        displayName: authContext.user.bio || authContext.user.username || '',
        avatar: authContext.user.avatar,
        verified: 'Verified' in authContext.user.verification_status,
        privacyMode: 'normal' as PrivacyMode,
      } : undefined,
      error: authContext.error || undefined,
    };

    // Use context login/logout if not provided
    const handleLogin = onLogin || authContext.login;
    const handleLogout = onLogout || authContext.logout;
    // Handle loading state
    if (authState.isLoading) {
      return loadingComponent || <PageLoader text="Checking authentication..." />;
    }

    // Check if user meets protection requirements
    const isAuthorized = checkAuthorization(authState, requiredLevel);

    if (!isAuthorized) {
      // Show unauthorized component or login flow
      if (unauthorizedComponent) {
        return (
          <div ref={ref} className={className}>
            {unauthorizedComponent}
          </div>
        );
      }

      // Show login flow for unauthenticated users
      if (requiredLevel !== 'public' && !authState.isAuthenticated) {
        return (
          <div
            ref={ref}
            className={cn(
              'flex items-center justify-center min-h-screen p-4',
              mode === 'modal' && 'min-h-0',
              className
            )}
          >
            <LoginFlow
              authState={authState}
              onLogin={handleLogin}
              onLogout={handleLogout}
              showPrivacyModeSelection={showPrivacyModeSelection}
              mode={mode}
              title="Authentication Required"
              description={
                unauthorizedMessage ||
                'You need to sign in to access this content. Choose your privacy level below.'
              }
            />
          </div>
        );
      }

      // Show insufficient permissions message
      return (
        <div
          ref={ref}
          className={cn(
            'flex items-center justify-center min-h-screen p-4',
            mode === 'modal' && 'min-h-0',
            className
          )}
        >
          <UnauthorizedMessage
            requiredLevel={requiredLevel}
            currentUser={authState.user}
            message={unauthorizedMessage}
          />
        </div>
      );
    }

    // Show profile creation if user doesn't have a profile and it's required
    if (requireProfile && authState.isAuthenticated && !authState.user) {
      return (
        <div ref={ref} className={className}>
          <ProfileCreationFlow />
        </div>
      );
    }

    // User is authorized, render children
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }
);

AuthGuard.displayName = 'AuthGuard';

/**
 * Check if user is authorized for the required protection level
 */
function checkAuthorization(authState: AuthGuardProps['authState'], requiredLevel: ProtectionLevel): boolean {
  if (!authState) return requiredLevel === 'public';
  
  switch (requiredLevel) {
    case 'public':
      return true;

    case 'authenticated':
      return authState.isAuthenticated;

    case 'verified':
      return authState.isAuthenticated && (authState.user?.verified || false);

    case 'admin':
      // This would need to be implemented based on your admin user system
      return authState.isAuthenticated && checkAdminRights();

    default:
      return false;
  }
}

/**
 * Check if user has admin rights (placeholder implementation)
 */
function checkAdminRights(): boolean {
  // Implement your admin check logic here
  // This could check user roles, permissions, etc.
  return false;
}

/**
 * Unauthorized access message component
 */
interface UnauthorizedMessageProps {
  requiredLevel: ProtectionLevel;
  currentUser?: {
    id: string;
    username?: string;
    displayName?: string;
    avatar?: string;
    verified?: boolean;
    privacyMode: PrivacyMode;
  };
  message?: string;
}

const UnauthorizedMessage: React.FC<UnauthorizedMessageProps> = ({
  requiredLevel,
  currentUser,
  message,
}) => {
  const getDefaultMessage = () => {
    switch (requiredLevel) {
      case 'authenticated':
        return 'You need to sign in to access this content.';
      case 'verified':
        return 'This content requires a verified account.';
      case 'admin':
        return 'This content requires administrator privileges.';
      default:
        return 'You do not have permission to access this content.';
    }
  };

  const getIcon = () => {
    switch (requiredLevel) {
      case 'verified':
        return (
          <svg className="w-12 h-12 text-privacy-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'admin':
        return (
          <svg className="w-12 h-12 text-privacy-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      default:
        return (
          <svg className="w-12 h-12 text-privacy-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="text-center max-w-md">
      <div className="mb-4 flex justify-center">
        {getIcon()}
      </div>
      <h2 className="text-xl font-semibold text-privacy-text mb-2">
        Access Restricted
      </h2>
      <p className="text-privacy-text-muted mb-4">
        {message || getDefaultMessage()}
      </p>
      {currentUser && (
        <p className="text-sm text-privacy-text-muted">
          Currently signed in as: {currentUser.displayName || currentUser.username}
        </p>
      )}
    </div>
  );
};

/**
 * Higher-order component for route protection
 */
export const withAuthGuard = <P extends object>(
  Component: React.ComponentType<P>,
  guardProps: Omit<AuthGuardProps, 'children'>
) => {
  const GuardedComponent = React.forwardRef<unknown, P>((props) => (
    <AuthGuard {...guardProps}>
      <Component {...(props as P)} />
    </AuthGuard>
  ));

  GuardedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name})`;

  return GuardedComponent;
};

/**
 * Hook for checking authentication status
 * Uses the main AuthContext for authentication state
 */
export const useAuthGuard = (requiredLevel: ProtectionLevel = 'public') => {
  const authContext = useAuth();
  
  // Convert context auth state to component format
  const authState = {
    isAuthenticated: authContext.isAuthenticated,
    isLoading: authContext.isLoading,
    user: authContext.user ? {
      id: authContext.user.id.toString(),
      username: authContext.user.username || '',
      displayName: authContext.user.bio || authContext.user.username || '',
      avatar: authContext.user.avatar,
      verified: 'Verified' in authContext.user.verification_status,
      privacyMode: 'normal' as PrivacyMode,
    } : undefined,
    error: authContext.error || undefined,
  };
  
  const isAuthorized = checkAuthorization(authState, requiredLevel);

  return {
    authState,
    isAuthorized,
  };
};

export {
  AuthGuard,
  UnauthorizedMessage,
  checkAuthorization,
};
