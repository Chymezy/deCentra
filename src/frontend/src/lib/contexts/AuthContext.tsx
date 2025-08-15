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
import type { AuthState, AuthContextType, UserProfile } from '@/lib/types';

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
      console.error('Auth initialization error:', error);
      authService.clearIdentity();
      setAuthState({
        isAuthenticated: false,
        identity: null,
        principal: null,
        user: null,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Authentication initialization failed',
      });
    }
  }, [isMounted]);

  // Login function
  const login = useCallback(async () => {
    if (!authClient) {
      console.error('Auth client not initialized');
      return;
    }

    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      await authClient.login({
        identityProvider: icpConfig.identityProvider,
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days in nanoseconds
        // derivationOrigin: icpConfig.derivationOrigin, // Use if configured
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
          console.error('Login error:', error);
          authService.clearIdentity();
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
            error: error || 'Login failed',
          }));
        },
      });
    } catch (error) {
      console.error('Login process error:', error);
      authService.clearIdentity();
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
    }
  }, [authClient]);

  // Logout function
  const logout = useCallback(async () => {
    if (!authClient) return;

    try {
      await authClient.logout();
      authService.clearIdentity();
      setAuthState({
        isAuthenticated: false,
        identity: null,
        principal: null,
        user: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      setAuthState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Logout failed',
      }));
    }
  }, [authClient]);

  // Create user profile function
  const createUserProfile = useCallback(
    async (
      username: string,
      bio?: string,
      avatar?: string
    ): Promise<UserProfile | null> => {
      if (!authState.isAuthenticated || !authState.identity) {
        console.error('User must be authenticated to create profile');
        return null;
      }

      try {
        setAuthState((prev) => ({ ...prev, error: null }));

        const user = await authService.createUserProfile(username, bio, avatar);

        setAuthState((prev) => ({
          ...prev,
          user,
        }));

        return user;
      } catch (error) {
        console.error('Create user profile error:', error);
        setAuthState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to create user profile',
        }));
        return null;
      }
    },
    [authState.isAuthenticated, authState.identity]
  );

  // Update user profile function
  const updateUserProfile = useCallback(
    async (
      username: string,
      bio?: string,
      avatar?: string
    ): Promise<UserProfile | null> => {
      if (!authState.isAuthenticated || !authState.identity) {
        console.error('User must be authenticated to update profile');
        return null;
      }

      try {
        setAuthState((prev) => ({ ...prev, error: null }));

        const user = await authService.updateUserProfile(username, bio, avatar);

        setAuthState((prev) => ({
          ...prev,
          user,
        }));

        return user;
      } catch (error) {
        console.error('Update user profile error:', error);
        setAuthState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to update user profile',
        }));
        return null;
      }
    },
    [authState.isAuthenticated, authState.identity]
  );

  // Refresh auth function
  const refreshAuth = useCallback(async () => {
    await initAuth();
  }, [initAuth]);

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
    login,
    logout,
    createUserProfile,
    updateUserProfile,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
