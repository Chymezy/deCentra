'use client';

import type React from 'react';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  useCallback,
} from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { icpConfig } from '@/lib/config/icp.config';
import { authService } from '@/lib/services/auth.service';
import { logAuthError, getAuthErrorMessage } from '@/lib/utils/auth-error-handler';
import type { AuthState, AuthContextType, UserProfile, PrivacyMode } from '@/lib/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    identity: null,
    principal: null,
    user: null,
    isLoading: true,
    error: null,
  });

  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>('normal');

  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Track if component is mounted (client-side)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize authentication
  const initAuth = useCallback(async () => {
    // Only run on client-side
    if (!isMounted) return;

    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const client = await AuthClient.create({
        idleOptions: {
          idleTimeout: 1000 * 60 * 30, // 30 minutes
          disableDefaultIdleCallback: true,
        },
      });

      setAuthClient(client);

      const isAuthenticated = await client.isAuthenticated();

      if (isAuthenticated) {
        const identity = client.getIdentity();
        const principal = identity.getPrincipal();

        // Configure auth service with authenticated identity
        authService.setIdentity(identity);

        // Try to get user profile
        try {
          const user = await authService.getCurrentUser();

          setAuthState({
            isAuthenticated: true,
            identity,
            principal,
            user,
            isLoading: false,
            error: null,
          });
        } catch (profileError) {
          console.warn(
            'User profile not found, user may need to complete registration:',
            profileError
          );
          setAuthState({
            isAuthenticated: true,
            identity,
            principal,
            user: null,
            isLoading: false,
            error: null,
          });
        }
      } else {
        authService.clearIdentity();
        setAuthState({
          isAuthenticated: false,
          identity: null,
          principal: null,
          user: null,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error);
      logAuthError(error, 'auth_initialization');
      console.error('Auth initialization error:', error);
      authService.clearIdentity();
      setAuthState({
        isAuthenticated: false,
        identity: null,
        principal: null,
        user: null,
        isLoading: false,
        error: errorMessage,
      });
    }
  }, [isMounted]);

  // Login function
  const login = useCallback(async (privacyModeParam?: PrivacyMode) => {
    if (!authClient) {
      console.error('Auth client not initialized');
      return;
    }

    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Set privacy mode
      const selectedPrivacyMode = privacyModeParam || 'normal';
      setPrivacyMode(selectedPrivacyMode);

      // Implement privacy mode logic
      const identityProvider = icpConfig.identityProvider;
      let maxTimeToLive = BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000); // 7 days in nanoseconds

      switch (selectedPrivacyMode) {
        case 'anonymous':
          // For anonymous mode, use shorter session and special derivation
          maxTimeToLive = BigInt(24 * 60 * 60 * 1000 * 1000 * 1000); // 1 day
          console.log('Anonymous mode: Using shorter session duration');
          break;
        case 'whistleblower':
          // For whistleblower mode, use very short session and extra security
          maxTimeToLive = BigInt(2 * 60 * 60 * 1000 * 1000 * 1000); // 2 hours
          console.log('Whistleblower mode: Using enhanced security settings');
          break;
        default:
          console.log('Normal mode: Using standard security settings');
      }

      await authClient.login({
        identityProvider,
        maxTimeToLive,
        onSuccess: async () => {
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal();

          // Configure auth service with authenticated identity
          authService.setIdentity(identity);

          setAuthState((prev) => ({
            ...prev,
            isAuthenticated: true,
            identity,
            principal,
            isLoading: false,
          }));

          // Try to get existing user profile
          try {
            const user = await authService.getCurrentUser();

            setAuthState((prev) => ({
              ...prev,
              user,
            }));
          } catch (profileError) {
            console.warn(
              'User profile not found after login, user may need to complete registration:',
              profileError
            );
            // User is authenticated but doesn't have a profile yet
          }
        },
        onError: (error) => {
          const errorMessage = getAuthErrorMessage(error);
          logAuthError(error, 'login');
          console.error('Login error:', error);
          authService.clearIdentity();
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
            error: errorMessage,
          }));
        },
      });
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error);
      logAuthError(error, 'login_process');
      console.error('Login process error:', error);
      authService.clearIdentity();
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [authClient]);

  // Logout function
  const logout = useCallback(async () => {
    if (!authClient) return;

    try {
      await authClient.logout();
      authService.clearIdentity();
      
      // Reset privacy mode on logout
      setPrivacyMode('normal');
      
      setAuthState({
        isAuthenticated: false,
        identity: null,
        principal: null,
        user: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error);
      logAuthError(error, 'logout');
      console.error('Logout error:', error);
      setAuthState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
    }
  }, [authClient]);

  // Enhanced profile creation with UserService integration
  const createUserProfile = useCallback(
    async (username: string, bio?: string, avatar?: string): Promise<UserProfile | null> => {
      if (!authClient || !authState.isAuthenticated || !authState.identity) {
        console.error('User must be authenticated to create profile');
        return null;
      }

      try {
        setAuthState((prev) => ({ ...prev, error: null, isLoading: true }));

        // Import UserService dynamically to avoid circular dependencies
        const { userService } = await import('@/lib/services/user.service');
        
        // Initialize UserService with current identity
        await userService.initialize(authState.identity);

        // Create profile using UserService
        const result = await userService.createProfile({
          username,
          bio: bio || '',
          avatar: avatar || '' // Let UserAvatar component handle fallback display
        });

        if (result.success && result.data) {
          // Update auth state with new profile
          setAuthState((prev) => ({
            ...prev,
            user: result.data,
            isLoading: false
          }));

          return result.data;
        } else {
          throw new Error('error' in result ? result.error : 'Profile creation failed');
        }
      } catch (error) {
        const errorMessage = getAuthErrorMessage(error);
        logAuthError(error, 'create_user_profile');
        console.error('Create user profile error:', error);
        setAuthState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false
        }));
        
        return null;
      }
    },
    [authClient, authState.isAuthenticated, authState.identity]
  );

  // Enhanced profile update with UserService integration
  const updateUserProfile = useCallback(
    async (
      username: string,
      bio?: string,
      avatar?: string
    ): Promise<UserProfile | null> => {
      if (!authClient || !authState.isAuthenticated || !authState.identity) {
        console.error('User must be authenticated to update profile');
        return null;
      }

      try {
        setAuthState((prev) => ({ ...prev, error: null, isLoading: true }));

        // Import UserService dynamically to avoid circular dependencies
        const { userService } = await import('@/lib/services/user.service');
        
        // Initialize UserService with current identity
        await userService.initialize(authState.identity);

        // Update profile using UserService
        const result = await userService.updateProfile({
          username,
          bio: bio || '',
          avatar: avatar || '' // Let UserAvatar component handle fallback display
        });

        if (result.success && result.data) {
          // Update auth state with updated profile
          setAuthState((prev) => ({
            ...prev,
            user: result.data,
            isLoading: false
          }));

          return result.data;
        } else {
          throw new Error('error' in result ? result.error : 'Profile update failed');
        }
      } catch (error) {
        const errorMessage = getAuthErrorMessage(error);
        logAuthError(error, 'update_user_profile');
        console.error('Update user profile error:', error);
        setAuthState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false
        }));
        
        return null;
      }
    },
    [authClient, authState.isAuthenticated, authState.identity]
  );

  // Refresh auth function with error recovery
  const refreshAuth = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, error: null }));
      await initAuth();
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error);
      logAuthError(error, 'auth_refresh');
      console.error('Auth refresh error:', error);
      setAuthState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
    }
  }, [initAuth]);

  // Clear authentication errors
  const clearAuthError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  // Set privacy mode function
  const updatePrivacyMode = useCallback((mode: PrivacyMode) => {
    setPrivacyMode(mode);
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Handle idle timeout
  useEffect(() => {
    if (authClient && authState.isAuthenticated) {
      const handleIdleTimeout = () => {
        if (process.env.NODE_ENV === 'development') {
          console.debug('Session expired due to inactivity');
        }
        logout();
      };

      // Set up idle callback
      authClient.idleManager?.registerCallback?.(handleIdleTimeout);

      return () => {
        authClient.idleManager?.registerCallback?.(handleIdleTimeout);
      };
    }
  }, [authClient, authState.isAuthenticated, logout]);

  const contextValue: AuthContextType = {
    ...authState,
    privacyMode,
    login,
    logout,
    createUserProfile,
    updateUserProfile,
    refreshAuth,
    clearAuthError,
    setPrivacyMode: updatePrivacyMode,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
