'use client';

import React from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';

/**
 * SocialErrorBoundary - Error boundary for social network components
 *
 * Provides graceful error handling with React Query integration:
 * - Catches React component errors
 * - Provides retry functionality
 * - Integrates with React Query error reset
 * - User-friendly error messaging
 */

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-dark-background-secondary rounded-lg border border-dark-background-tertiary">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-dark-text-primary mb-2">
          Something went wrong
        </h3>

        <p className="text-dark-text-secondary mb-4">
          We encountered an error while loading this content. This might be a
          temporary issue.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-dark-text-tertiary hover:text-dark-text-secondary">
              Error details
            </summary>
            <pre className="mt-2 p-2 bg-dark-background-primary rounded text-xs text-red-400 overflow-auto">
              {error.message}
              {error.stack && '\n\n' + error.stack}
            </pre>
          </details>
        )}

        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-electric-blue hover:bg-electric-blue/80 text-white rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

// Simple React Error Boundary implementation
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class SimpleErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback: React.ComponentType<ErrorFallbackProps>;
    onReset?: () => void;
  },
  ErrorBoundaryState
> {
  constructor(props: {
    children: React.ReactNode;
    fallback: React.ComponentType<ErrorFallbackProps>;
    onReset?: () => void;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SocialErrorBoundary caught an error:', error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}

interface SocialErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

export function SocialErrorBoundary({
  children,
  fallback = ErrorFallback,
}: SocialErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <SimpleErrorBoundary fallback={fallback} onReset={reset}>
          {children}
        </SimpleErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
