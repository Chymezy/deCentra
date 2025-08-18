'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { PrivacyMode } from '@/lib/types/auth.types';

// Re-export for backward compatibility
export type { PrivacyMode };

/**
 * Authentication state interface
 */
export interface AuthState {
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
}

export interface LoginFlowProps {
  /**
   * Current authentication state
   */
  authState: AuthState;
  /**
   * Callback when login is initiated
   */
  onLogin: (privacyMode: PrivacyMode) => Promise<void>;
  /**
   * Callback when logout is initiated
   */
  onLogout?: () => Promise<void>;
  /**
   * Whether to show privacy mode selection
   */
  showPrivacyModeSelection?: boolean;
  /**
   * Custom class name
   */
  className?: string;
  /**
   * Whether this is a modal or full page flow
   */
  mode?: 'modal' | 'page';
  /**
   * Title override
   */
  title?: string;
  /**
   * Description override
   */
  description?: string;
}

/**
 * LoginFlow component providing Internet Identity authentication with privacy mode selection
 */
const LoginFlow = React.forwardRef<HTMLDivElement, LoginFlowProps>(
  (
    {
      authState,
      onLogin,
      onLogout,
      showPrivacyModeSelection = true,
      className,
      mode = 'page',
      title,
      description,
    },
    ref
  ) => {
    const [selectedPrivacyMode, setSelectedPrivacyMode] = React.useState<PrivacyMode>('normal');
    const [isLoggingIn, setIsLoggingIn] = React.useState(false);

    const handleLogin = async () => {
      if (authState.isLoading || isLoggingIn) return;

      setIsLoggingIn(true);
      try {
        await onLogin(selectedPrivacyMode);
      } catch (error) {
        console.error('Login failed:', error);
      } finally {
        setIsLoggingIn(false);
      }
    };

    const handleLogout = async () => {
      if (!onLogout || authState.isLoading) return;

      try {
        await onLogout();
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };

    const privacyModes: Array<{
      id: PrivacyMode;
      title: string;
      description: string;
      icon: React.ReactNode;
      features: string[];
    }> = [
      {
        id: 'normal',
        title: 'Standard Mode',
        description: 'Full social features with privacy controls',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ),
        features: ['Public profile', 'Social interactions', 'Creator features', 'Full functionality'],
      },
      {
        id: 'anonymous',
        title: 'Anonymous Mode',
        description: 'Browse and interact without revealing identity',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        ),
        features: ['Hidden identity', 'Anonymous posting', 'Privacy focused', 'Limited interactions'],
      },
      {
        id: 'whistleblower',
        title: 'Whistleblower Mode',
        description: 'Maximum protection for sensitive information',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        ),
        features: ['Maximum anonymity', 'Encrypted communications', 'Legal protections', 'Journalist access'],
      },
    ];

    if (authState.isAuthenticated && authState.user) {
      return (
        <Card ref={ref} className={cn('w-full max-w-md', className)}>
          <CardHeader className="text-center">
            <CardTitle className="text-privacy-success">Welcome Back!</CardTitle>
            <CardDescription>
              You are signed in as {authState.user.displayName || authState.user.username}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-privacy-text-muted mb-2">
                Privacy Mode: <span className="capitalize font-medium text-privacy-accent">
                  {authState.user.privacyMode}
                </span>
              </p>
            </div>
            {onLogout && (
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="w-full"
                disabled={authState.isLoading}
              >
                Sign Out
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <Card
        ref={ref}
        className={cn('w-full max-w-lg', mode === 'modal' && 'border-0 shadow-none', className)}
      >
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {title || 'Welcome to deCentra'}
          </CardTitle>
          <CardDescription>
            {description || 'Choose your privacy level and sign in with Internet Identity'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {authState.error && (
            <div className="p-3 bg-privacy-danger/10 border border-privacy-danger/20 rounded-lg">
              <p className="text-sm text-privacy-danger">{authState.error}</p>
            </div>
          )}

          {showPrivacyModeSelection && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-privacy-text">Select Privacy Mode</h3>
              <div className="space-y-2">
                {privacyModes.map((mode) => (
                  <PrivacyModeOption
                    key={mode.id}
                    mode={mode}
                    selected={selectedPrivacyMode === mode.id}
                    onSelect={setSelectedPrivacyMode}
                    disabled={isLoggingIn || authState.isLoading}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleLogin}
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoggingIn || authState.isLoading}
            >
              {isLoggingIn || authState.isLoading ? (
                <>
                  <LoadingSpinner size="sm" variant="white" className="mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Sign in with Internet Identity
                </>
              )}
            </Button>

            <p className="text-xs text-privacy-text-muted text-center leading-relaxed">
              By signing in, you agree to our Terms of Service and Privacy Policy. 
              Your data remains under your control and fully decentralized.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
);

LoginFlow.displayName = 'LoginFlow';

/**
 * Privacy mode selection component
 */
interface PrivacyModeOptionProps {
  mode: {
    id: PrivacyMode;
    title: string;
    description: string;
    icon: React.ReactNode;
    features: string[];
  };
  selected: boolean;
  onSelect: (mode: PrivacyMode) => void;
  disabled?: boolean;
}

const PrivacyModeOption: React.FC<PrivacyModeOptionProps> = ({
  mode,
  selected,
  onSelect,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(mode.id)}
      disabled={disabled}
      className={cn(
        'w-full p-3 text-left rounded-lg border-2 transition-all duration-200',
        'hover:border-privacy-accent/40 focus:outline-none focus:ring-2 focus:ring-privacy-accent/50',
        selected
          ? 'border-privacy-accent bg-privacy-accent/10'
          : 'border-privacy-border/40 bg-privacy-muted/20',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="flex items-start space-x-3">
        <div className={cn(
          'flex-shrink-0 p-2 rounded-lg',
          selected ? 'bg-privacy-accent text-privacy-dark' : 'bg-privacy-muted text-privacy-text-muted'
        )}>
          {mode.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-privacy-text">{mode.title}</h4>
          <p className="text-sm text-privacy-text-muted mt-1">{mode.description}</p>
          <ul className="mt-2 space-y-1">
            {mode.features.map((feature, index) => (
              <li key={index} className="text-xs text-privacy-text-muted flex items-center">
                <svg className="w-3 h-3 mr-1 text-privacy-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </button>
  );
};

export { LoginFlow, PrivacyModeOption };
