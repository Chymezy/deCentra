'use client';

import React from 'react';
import { Button } from './Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './Card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export interface ErrorBoundaryProps {
  /**
   * Children to render when no error
   */
  children: React.ReactNode;
  /**
   * Custom fallback component to render when error occurs
   */
  fallback?: React.ComponentType<ErrorFallbackProps>;
  /**
   * Callback when error occurs
   */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /**
   * Whether to show detailed error information (useful for development)
   */
  showDetails?: boolean;
  /**
   * Custom error message to display instead of default
   */
  message?: string;
  /**
   * Whether the error boundary should reset automatically
   */
  resetOnPropsChange?: boolean;
  /**
   * Reset keys - when these change, the error boundary resets
   */
  resetKeys?: Array<string | number | boolean | null | undefined>;
}

export interface ErrorFallbackProps {
  /**
   * The error that occurred
   */
  error: Error;
  /**
   * Error info from React
   */
  errorInfo?: React.ErrorInfo;
  /**
   * Function to reset the error boundary
   */
  resetError: () => void;
  /**
   * Whether to show detailed error information
   */
  showDetails?: boolean;
  /**
   * Custom error message
   */
  message?: string;
}

/**
 * Default error fallback component
 */
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  resetError,
  showDetails = false,
  message,
}) => {
  const [detailsVisible, setDetailsVisible] = React.useState(false);

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card variant="elevated" className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-privacy-danger/10 flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-privacy-danger"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <CardTitle className="text-privacy-danger">
            Something went wrong
          </CardTitle>
          <CardDescription>
            {message || 'An unexpected error occurred. Please try again.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button
              onClick={resetError}
              variant="primary"
              size="sm"
              className="w-full"
            >
              Try Again
            </Button>

            <Button
              onClick={() => window.location.reload()}
              variant="ghost"
              size="sm"
              className="w-full"
            >
              Reload Page
            </Button>
          </div>

          {showDetails && (
            <div className="space-y-2">
              <Button
                onClick={() => setDetailsVisible(!detailsVisible)}
                variant="ghost"
                size="sm"
                className="w-full text-xs"
              >
                {detailsVisible ? 'Hide' : 'Show'} Error Details
              </Button>

              {detailsVisible && (
                <div className="bg-privacy-muted/20 rounded-lg p-3 text-xs space-y-2">
                  <div>
                    <p className="font-medium text-privacy-text mb-1">Error:</p>
                    <p className="text-privacy-text-muted font-mono break-all">
                      {error.name}: {error.message}
                    </p>
                  </div>

                  {error.stack && (
                    <div>
                      <p className="font-medium text-privacy-text mb-1">
                        Stack Trace:
                      </p>
                      <pre className="text-privacy-text-muted font-mono text-xs whitespace-pre-wrap break-all">
                        {error.stack}
                      </pre>
                    </div>
                  )}

                  {errorInfo?.componentStack && (
                    <div>
                      <p className="font-medium text-privacy-text mb-1">
                        Component Stack:
                      </p>
                      <pre className="text-privacy-text-muted font-mono text-xs whitespace-pre-wrap break-all">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Error Boundary component following deCentra design system
 * Catches JavaScript errors anywhere in the child component tree and displays a fallback UI
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (
        resetKeys?.some(
          (resetKey, idx) => prevProps.resetKeys?.[idx] !== resetKey
        )
      ) {
        this.resetErrorBoundary();
      }
    }

    if (
      hasError &&
      resetOnPropsChange &&
      prevProps.children !== this.props.children
    ) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
      });
    }, 0);
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback: Fallback, showDetails, message } = this.props;

    if (hasError && error) {
      if (Fallback) {
        return (
          <Fallback
            error={error}
            errorInfo={errorInfo}
            resetError={this.resetErrorBoundary}
            showDetails={showDetails}
            message={message}
          />
        );
      }

      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={errorInfo}
          resetError={this.resetErrorBoundary}
          showDetails={showDetails}
          message={message}
        />
      );
    }

    return children;
  }
}

/**
 * Hook for creating error boundaries in functional components
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
};

/**
 * HOC for wrapping components with error boundary
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = React.forwardRef<unknown, P>((props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...(props as P)} />
    </ErrorBoundary>
  ));

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

export { DefaultErrorFallback };
