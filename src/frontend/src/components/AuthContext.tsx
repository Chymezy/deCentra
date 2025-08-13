'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { backend } from '../../../declarations/backend';
import type { UserProfile } from '../../../declarations/backend/backend.did';

interface AuthState {
  isAuthenticated: boolean;
  principal: string | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  needsProfileCreation: boolean;
}

interface AuthContextType extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  createProfile: (
    username: string,
    displayName?: string,
    bio?: string
  ) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Enhanced AuthProvider with Profile Management
 *
 * This enhanced version integrates user profile management with authentication,
 * providing a complete authentication and user state management solution.
 *
 * Features:
 * - Internet Identity authentication
 * - Automatic profile loading and caching
 * - Profile creation detection and onboarding flow
 * - Reactive profile updates
 * - Error handling and loading states
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    principal: null,
    userProfile: null,
    isLoading: true,
    needsProfileCreation: false,
  });

  /**
   * Fetches the user's profile from the backend
   */
  const fetchUserProfile = useCallback(
    async (principalId: string): Promise<UserProfile | null> => {
      try {
        if (!backend) {
          console.error('Backend not available');
          return null;
        }

        const profileResult = await backend.get_my_profile();

        if (profileResult.length > 0 && profileResult[0]) {
          return profileResult[0];
        } else {
          // No profile exists - user needs to create one
          console.log('No profile found for user:', principalId);
          return null;
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
    },
    []
  );

  /**
   * Checks authentication status and loads user profile
   */
  const checkAuthAndLoadProfile = useCallback(async () => {
    try {
      const authClient = await AuthClient.create();
      const isAuthenticated = await authClient.isAuthenticated();

      if (isAuthenticated) {
        const identity = authClient.getIdentity();
        const principalId = identity.getPrincipal().toText();

        // Fetch user profile
        const userProfile = await fetchUserProfile(principalId);

        setAuthState({
          isAuthenticated: true,
          principal: principalId,
          userProfile,
          isLoading: false,
          needsProfileCreation: !userProfile, // Need to create profile if none exists
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          principal: null,
          userProfile: null,
          isLoading: false,
          needsProfileCreation: false,
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthState({
        isAuthenticated: false,
        principal: null,
        userProfile: null,
        isLoading: false,
        needsProfileCreation: false,
      });
    }
  }, [fetchUserProfile]);

  /**
   * Handles user login with Internet Identity
   */
  const login = useCallback(async () => {
    try {
      const authClient = await AuthClient.create();

      await authClient.login({
        identityProvider: process.env.NEXT_PUBLIC_II_CANISTER_URL,
        onSuccess: async () => {
          // After successful login, check auth and load profile
          await checkAuthAndLoadProfile();
        },
        onError: (error) => {
          console.error('Login error:', error);
          alert('Login failed: ' + error);
        },
      });
    } catch (error) {
      console.error('Login setup error:', error);
      alert('Login setup failed: ' + error);
    }
  }, [checkAuthAndLoadProfile]);

  /**
   * Handles user logout
   */
  const logout = useCallback(async () => {
    try {
      const authClient = await AuthClient.create();
      await authClient.logout();

      setAuthState({
        isAuthenticated: false,
        principal: null,
        userProfile: null,
        isLoading: false,
        needsProfileCreation: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  /**
   * Refreshes the user's profile from the backend
   */
  const refreshProfile = useCallback(async () => {
    if (!authState.isAuthenticated || !authState.principal) {
      return;
    }

    const userProfile = await fetchUserProfile(authState.principal);

    setAuthState((prev) => ({
      ...prev,
      userProfile,
      needsProfileCreation: !userProfile,
    }));
  }, [authState.isAuthenticated, authState.principal, fetchUserProfile]);

  /**
   * Creates a new user profile
   */
  const createProfile = useCallback(
    async (
      username: string,
      displayName?: string,
      bio?: string
    ): Promise<boolean> => {
      if (!authState.isAuthenticated || !backend) {
        console.error('Not authenticated or backend not available');
        return false;
      }

      try {
        const result = await backend.create_user_profile(
          username,
          displayName ? [displayName] : [],
          bio ? [bio] : []
        );

        if ('Ok' in result) {
          // Profile created successfully, refresh the profile
          await refreshProfile();
          return true;
        } else {
          console.error('Profile creation failed:', result.Err);
          alert('Profile creation failed: ' + result.Err);
          return false;
        }
      } catch (error) {
        console.error('Profile creation error:', error);
        alert('Profile creation error: ' + error);
        return false;
      }
    },
    [authState.isAuthenticated, refreshProfile]
  );

  // Initialize auth check on mount
  useEffect(() => {
    checkAuthAndLoadProfile();
  }, [checkAuthAndLoadProfile]);

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshProfile,
    createProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

/**
 * Hook to access authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook specifically for checking if user needs to create a profile
 */
export function useProfileCreationStatus() {
  const { needsProfileCreation, isAuthenticated, isLoading } = useAuth();

  return {
    needsProfileCreation: isAuthenticated && needsProfileCreation,
    isReady: !isLoading,
  };
}
