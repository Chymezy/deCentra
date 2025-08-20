/**
 * Authentication Error Handler for deCentra
 * Provides comprehensive error handling and user feedback for authentication failures
 */

export enum AuthErrorType {
  NETWORK_ERROR = 'network_error',
  IDENTITY_PROVIDER_ERROR = 'identity_provider_error',
  SESSION_EXPIRED = 'session_expired',
  INVALID_CREDENTIALS = 'invalid_credentials',
  PERMISSION_DENIED = 'permission_denied',
  BACKEND_UNREACHABLE = 'backend_unreachable',
  PROFILE_CREATION_FAILED = 'profile_creation_failed',
  PRIVACY_MODE_ERROR = 'privacy_mode_error',
  UNKNOWN_ERROR = 'unknown_error',
}

export interface AuthError {
  type: AuthErrorType;
  message: string;
  userMessage: string;
  recoverable: boolean;
  retryable: boolean;
  details?: unknown;
}

/**
 * Parse and classify authentication errors
 */
export function parseAuthError(error: unknown): AuthError {
  const errorString = (error as Error)?.toString() || (error as Error)?.message || String(error);
  
  // Network and connectivity errors
  if (errorString.includes('fetch') || errorString.includes('network') || errorString.includes('ECONNREFUSED')) {
    return {
      type: AuthErrorType.NETWORK_ERROR,
      message: errorString,
      userMessage: 'Network connection failed. Please check your internet connection and try again.',
      recoverable: true,
      retryable: true,
      details: error,
    };
  }

  // Internet Identity specific errors
  if (errorString.includes('UserInterrupt') || errorString.includes('popup')) {
    return {
      type: AuthErrorType.IDENTITY_PROVIDER_ERROR,
      message: errorString,
      userMessage: 'Login was cancelled. Please try again to access your account.',
      recoverable: true,
      retryable: true,
      details: error,
    };
  }

  // Session expiry
  if (errorString.includes('expired') || errorString.includes('timeout')) {
    return {
      type: AuthErrorType.SESSION_EXPIRED,
      message: errorString,
      userMessage: 'Your session has expired. Please log in again to continue.',
      recoverable: true,
      retryable: true,
      details: error,
    };
  }

  // Backend connectivity
  if (errorString.includes('canister') || errorString.includes('ic0.app') || errorString.includes('replica')) {
    return {
      type: AuthErrorType.BACKEND_UNREACHABLE,
      message: errorString,
      userMessage: 'deCentra servers are temporarily unavailable. Please try again in a few moments.',
      recoverable: true,
      retryable: true,
      details: error,
    };
  }

  // Profile creation errors
  if (errorString.includes('profile') || errorString.includes('username')) {
    return {
      type: AuthErrorType.PROFILE_CREATION_FAILED,
      message: errorString,
      userMessage: 'Failed to create or update your profile. Please check your information and try again.',
      recoverable: true,
      retryable: true,
      details: error,
    };
  }

  // Privacy mode errors
  if (errorString.includes('privacy') || errorString.includes('anonymous') || errorString.includes('whistleblower')) {
    return {
      type: AuthErrorType.PRIVACY_MODE_ERROR,
      message: errorString,
      userMessage: 'Privacy mode configuration failed. Please try with normal mode or contact support.',
      recoverable: true,
      retryable: false,
      details: error,
    };
  }

  // Default unknown error
  return {
    type: AuthErrorType.UNKNOWN_ERROR,
    message: errorString,
    userMessage: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    recoverable: false,
    retryable: true,
    details: error,
  };
}

/**
 * Get user-friendly error messages for authentication failures
 */
export function getAuthErrorMessage(error: unknown): string {
  const authError = parseAuthError(error);
  return authError.userMessage;
}

/**
 * Determine if an authentication error is recoverable
 */
export function isAuthErrorRecoverable(error: unknown): boolean {
  const authError = parseAuthError(error);
  return authError.recoverable;
}

/**
 * Determine if an authentication error should allow retry
 */
export function shouldRetryAuthOperation(error: unknown): boolean {
  const authError = parseAuthError(error);
  return authError.retryable;
}

/**
 * Get suggested recovery actions for authentication errors
 */
export function getAuthErrorRecoveryActions(error: unknown): string[] {
  const authError = parseAuthError(error);
  
  switch (authError.type) {
    case AuthErrorType.NETWORK_ERROR:
      return [
        'Check your internet connection',
        'Try refreshing the page',
        'Disable VPN if enabled',
        'Try again in a few moments',
      ];
      
    case AuthErrorType.IDENTITY_PROVIDER_ERROR:
      return [
        'Try logging in again',
        'Allow popups in your browser',
        'Clear browser cache and cookies',
        'Try a different browser',
      ];
      
    case AuthErrorType.SESSION_EXPIRED:
      return [
        'Click "Login" to sign in again',
        'Check if your system clock is correct',
        'Contact support if problem persists',
      ];
      
    case AuthErrorType.BACKEND_UNREACHABLE:
      return [
        'Wait a few minutes and try again',
        'Check the deCentra status page',
        'Try refreshing the page',
        'Contact support if outage persists',
      ];
      
    case AuthErrorType.PROFILE_CREATION_FAILED:
      return [
        'Check that your username is unique',
        'Ensure all required fields are filled',
        'Try a different username',
        'Contact support if problem continues',
      ];
      
    case AuthErrorType.PRIVACY_MODE_ERROR:
      return [
        'Try using normal login mode',
        'Check your browser supports required features',
        'Contact support for privacy mode issues',
      ];
      
    default:
      return [
        'Try refreshing the page',
        'Clear browser cache and cookies',
        'Try a different browser',
        'Contact support with error details',
      ];
  }
}

/**
 * Log authentication errors for monitoring and debugging
 */
export function logAuthError(error: unknown, context?: string): void {
  const authError = parseAuthError(error);
  
  console.error('[deCentra Auth Error]', {
    type: authError.type,
    context: context || 'Unknown context',
    message: authError.message,
    userMessage: authError.userMessage,
    recoverable: authError.recoverable,
    retryable: authError.retryable,
    timestamp: new Date().toISOString(),
    details: authError.details,
  });
  
  // In production, you might want to send this to a logging service
  if (process.env.NODE_ENV === 'production' && authError.type !== AuthErrorType.IDENTITY_PROVIDER_ERROR) {
    // TODO: Implement production error reporting
    // Example: sendToErrorReporting(authError, context);
  }
}