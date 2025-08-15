---
applyTo: "**/*auth*,**/*login*,**/*Auth*"
---

# Authentication & User Experience Instructions for deCentra

## Authentication Architecture

deCentra uses **Internet Identity** for secure, privacy-preserving authentication integrated with a sophisticated user experience flow.

### Authentication States & Flows

```typescript
// Authentication state management
export interface AuthState {
  // Core authentication
  isAuthenticated: boolean;
  isLoading: boolean;
  principal: string | null;
  
  // User profile data
  userProfile: UserProfile | null;
  
  // Authentication flow state
  authStep: AuthStep;
  error: AuthError | null;
  
  // Session management
  sessionExpiry: number | null;
  lastActivity: number;
  
  // Privacy settings
  anonymousMode: boolean;
  whistleblowerMode: boolean;
}

export enum AuthStep {
  Initial = 'initial',
  InternetIdentityLogin = 'ii_login',
  ProfileCreation = 'profile_creation',
  ProfileCompletion = 'profile_completion',
  OnboardingTour = 'onboarding_tour',
  Authenticated = 'authenticated',
  SessionExpired = 'session_expired',
  Error = 'error',
}

export interface UserProfile {
  id: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  location?: string;
  website?: string;
  
  // Account metadata
  createdAt: bigint;
  verificationStatus: VerificationStatus;
  privacySettings: PrivacySettings;
  
  // Social stats
  followersCount: number;
  followingCount: number;
  postsCount: number;
  
  // Creator features
  isCreator: boolean;
  creatorSettings?: CreatorSettings;
  
  // Whistleblower protection
  hasAnonymousAccess: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'followers' | 'private';
  allowDirectMessages: 'everyone' | 'followers' | 'none';
  showOnlineStatus: boolean;
  allowTagging: boolean;
  dataExportEnabled: boolean;
  analyticsOptOut: boolean;
}
```

### Authentication Context Provider

```typescript
// lib/contexts/AuthContext.tsx
import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { canisterId, createActor } from '@/declarations/backend';

interface AuthContextType {
  state: AuthState;
  
  // Authentication actions
  login: () => Promise<void>;
  logout: () => Promise<void>;
  
  // Profile management
  createProfile: (profileData: ProfileCreationData) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  
  // Session management
  refreshSession: () => Promise<void>;
  extendSession: () => Promise<void>;
  
  // Privacy modes
  enableAnonymousMode: () => Promise<void>;
  enableWhistleblowerMode: () => Promise<void>;
  disablePrivacyModes: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  
  // Initialize authentication on app load
  useEffect(() => {
    initializeAuth();
  }, []);
  
  // Session timeout handling
  useEffect(() => {
    if (state.sessionExpiry) {
      const timeout = setTimeout(() => {
        handleSessionExpiry();
      }, state.sessionExpiry - Date.now());
      
      return () => clearTimeout(timeout);
    }
  }, [state.sessionExpiry]);
  
  // Activity tracking for session extension
  useEffect(() => {
    const handleActivity = () => {
      if (state.isAuthenticated) {
        dispatch({ type: 'UPDATE_LAST_ACTIVITY', payload: Date.now() });
      }
    };
    
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [state.isAuthenticated]);

  const initializeAuth = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const authClient = await AuthClient.create({
        idleOptions: {
          disableIdle: false,
          idleTimeout: 30 * 60 * 1000, // 30 minutes
        },
      });
      
      const isAuthenticated = await authClient.isAuthenticated();
      
      if (isAuthenticated) {
        const identity = authClient.getIdentity();
        const principal = identity.getPrincipal().toString();
        
        // Create actor for backend communication
        const agent = new HttpAgent({
          host: process.env.NEXT_PUBLIC_IC_HOST || 'https://localhost:4943',
          identity,
        });
        
        if (process.env.NODE_ENV === 'development') {
          await agent.fetchRootKey();
        }
        
        const backendActor = createActor(canisterId, { agent });
        
        // Fetch user profile
        try {
          const userProfile = await backendActor.get_user_profile();
          
          if (userProfile) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                principal,
                userProfile,
                authStep: AuthStep.Authenticated,
              },
            });
          } else {
            // User needs to create profile
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                principal,
                userProfile: null,
                authStep: AuthStep.ProfileCreation,
              },
            });
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          dispatch({
            type: 'AUTH_ERROR',
            payload: {
              type: 'PROFILE_FETCH_ERROR',
              message: 'Failed to load user profile',
            },
          });
        }
      } else {
        dispatch({ type: 'AUTH_CLEAR' });
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      dispatch({
        type: 'AUTH_ERROR',
        payload: {
          type: 'INITIALIZATION_ERROR',
          message: 'Failed to initialize authentication',
        },
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_AUTH_STEP', payload: AuthStep.InternetIdentityLogin });
      
      const authClient = await AuthClient.create();
      
      await new Promise<void>((resolve, reject) => {
        authClient.login({
          identityProvider: process.env.NEXT_PUBLIC_INTERNET_IDENTITY_URL || 
                          'https://identity.ic0.app/#authorize',
          maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days
          onSuccess: resolve,
          onError: reject,
        });
      });
      
      // Re-initialize auth to fetch profile
      await initializeAuth();
      
    } catch (error) {
      console.error('Login failed:', error);
      dispatch({
        type: 'AUTH_ERROR',
        payload: {
          type: 'LOGIN_ERROR',
          message: 'Login failed. Please try again.',
        },
      });
    }
  };

  const logout = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const authClient = await AuthClient.create();
      await authClient.logout();
      
      // Clear all user data
      dispatch({ type: 'AUTH_CLEAR' });
      
      // Redirect to landing page
      window.location.href = '/';
      
    } catch (error) {
      console.error('Logout failed:', error);
      dispatch({
        type: 'AUTH_ERROR',
        payload: {
          type: 'LOGOUT_ERROR',
          message: 'Logout failed. Please refresh the page.',
        },
      });
    }
  };

  const createProfile = async (profileData: ProfileCreationData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const authClient = await AuthClient.create();
      const identity = authClient.getIdentity();
      const agent = new HttpAgent({
        host: process.env.NEXT_PUBLIC_IC_HOST || 'https://localhost:4943',
        identity,
      });
      
      if (process.env.NODE_ENV === 'development') {
        await agent.fetchRootKey();
      }
      
      const backendActor = createActor(canisterId, { agent });
      
      const result = await backendActor.create_user_profile(
        profileData.username,
        profileData.displayName || null,
        profileData.bio || null,
        profileData.avatarUrl || null
      );
      
      if ('Ok' in result) {
        const userProfile = result.Ok;
        dispatch({
          type: 'PROFILE_CREATED',
          payload: userProfile,
        });
        
        // Move to onboarding tour
        dispatch({ type: 'SET_AUTH_STEP', payload: AuthStep.OnboardingTour });
      } else {
        throw new Error(result.Err);
      }
      
    } catch (error) {
      console.error('Profile creation failed:', error);
      dispatch({
        type: 'AUTH_ERROR',
        payload: {
          type: 'PROFILE_CREATION_ERROR',
          message: error instanceof Error ? error.message : 'Profile creation failed',
        },
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const enableAnonymousMode = async () => {
    try {
      // Enable anonymous browsing mode
      dispatch({ type: 'ENABLE_ANONYMOUS_MODE' });
      
      // Clear tracking data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user_analytics');
        sessionStorage.clear();
      }
      
    } catch (error) {
      console.error('Failed to enable anonymous mode:', error);
    }
  };

  const enableWhistleblowerMode = async () => {
    try {
      // Enable whistleblower protection mode
      dispatch({ type: 'ENABLE_WHISTLEBLOWER_MODE' });
      
      // Enhanced privacy measures
      if (typeof window !== 'undefined') {
        // Clear all tracking
        localStorage.clear();
        sessionStorage.clear();
        
        // Disable browser history
        history.replaceState(null, '', '/whistleblower');
      }
      
    } catch (error) {
      console.error('Failed to enable whistleblower mode:', error);
    }
  };

  const value: AuthContextType = {
    state,
    login,
    logout,
    createProfile,
    updateProfile,
    refreshSession,
    extendSession,
    enableAnonymousMode,
    enableWhistleblowerMode,
    disablePrivacyModes,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### Authentication UI Components

```typescript
// components/auth/LoginFlow.tsx
import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ShieldCheckIcon, LockClosedIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export function LoginFlow() {
  const { state, login } = useAuth();
  const [selectedMode, setSelectedMode] = useState<'normal' | 'anonymous' | 'whistleblower'>('normal');

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-background-primary">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-dark-text-secondary">
            Connecting to Internet Identity...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-background-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-deep-indigo shadow-glow-indigo flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">dC</span>
          </div>
          <h1 className="font-heading font-bold text-2xl text-dark-text-primary">
            Welcome to deCentra
          </h1>
          <p className="text-dark-text-secondary mt-2">
            The social network for a free and open internet
          </p>
        </div>

        {/* Login Mode Selection */}
        <div className="space-y-3">
          <h2 className="font-medium text-dark-text-primary">Choose your access mode:</h2>
          
          {/* Normal Mode */}
          <Card 
            className={`
              p-4 cursor-pointer transition-all duration-200
              ${selectedMode === 'normal' ? 'ring-2 ring-electric-blue shadow-glow-blue' : 'hover:shadow-soft'}
            `}
            onClick={() => setSelectedMode('normal')}
          >
            <div className="flex items-start gap-3">
              <GlobeAltIcon className="w-6 h-6 text-electric-blue mt-1" />
              <div>
                <h3 className="font-medium text-dark-text-primary">Standard Access</h3>
                <p className="text-sm text-dark-text-secondary mt-1">
                  Full social features with your public identity
                </p>
              </div>
            </div>
          </Card>

          {/* Anonymous Mode */}
          <Card 
            className={`
              p-4 cursor-pointer transition-all duration-200
              ${selectedMode === 'anonymous' ? 'ring-2 ring-electric-blue shadow-glow-blue' : 'hover:shadow-soft'}
            `}
            onClick={() => setSelectedMode('anonymous')}
          >
            <div className="flex items-start gap-3">
              <LockClosedIcon className="w-6 h-6 text-vibrant-orange mt-1" />
              <div>
                <h3 className="font-medium text-dark-text-primary">Anonymous Browsing</h3>
                <p className="text-sm text-dark-text-secondary mt-1">
                  Browse privately without creating a public profile
                </p>
              </div>
            </div>
          </Card>

          {/* Whistleblower Mode */}
          <Card 
            className={`
              p-4 cursor-pointer transition-all duration-200
              ${selectedMode === 'whistleblower' ? 'ring-2 ring-electric-blue shadow-glow-blue' : 'hover:shadow-soft'}
            `}
            onClick={() => setSelectedMode('whistleblower')}
          >
            <div className="flex items-start gap-3">
              <ShieldCheckIcon className="w-6 h-6 text-deep-indigo mt-1" />
              <div>
                <h3 className="font-medium text-dark-text-primary">Whistleblower Protection</h3>
                <p className="text-sm text-dark-text-secondary mt-1">
                  Maximum security and anonymity for sensitive information
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Login Button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={login}
          disabled={state.isLoading}
          className="shadow-glow-indigo"
        >
          Continue with Internet Identity
        </Button>

        {/* Security Notice */}
        <Card className="p-4 bg-deep-indigo bg-opacity-10 border-deep-indigo">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="w-5 h-5 text-deep-indigo mt-0.5" />
            <div>
              <h3 className="font-medium text-dark-text-primary mb-1">
                Secure & Private
              </h3>
              <p className="text-sm text-dark-text-secondary">
                deCentra uses Internet Identity for secure authentication without passwords. 
                Your data stays 100% on-chain and private.
              </p>
            </div>
          </div>
        </Card>

        {/* Error Display */}
        {state.error && (
          <Card className="p-4 bg-red-500 bg-opacity-10 border-red-500">
            <p className="text-red-400 text-sm">{state.error.message}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
```

### Profile Creation Flow

```typescript
// components/auth/ProfileCreationFlow.tsx
import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface ProfileCreationData {
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}

export function ProfileCreationFlow() {
  const { createProfile, state } = useAuth();
  const [formData, setFormData] = useState<ProfileCreationData>({
    username: '',
    displayName: '',
    bio: '',
    avatarUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);

  const validateUsername = (username: string): string | null => {
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 50) return 'Username must be less than 50 characters';
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return 'Username can only contain letters, numbers, underscores, and hyphens';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    // Validate username
    const usernameError = validateUsername(formData.username);
    if (usernameError) {
      newErrors.username = usernameError;
    }
    
    // Validate bio length
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      try {
        await createProfile(formData);
      } catch (error) {
        console.error('Profile creation failed:', error);
      }
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-dark-background-primary flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6">
          <div className="text-center mb-6">
            <h1 className="font-heading font-bold text-xl text-dark-text-primary">
              Create Your Profile
            </h1>
            <p className="text-dark-text-secondary mt-2">
              Let's set up your deCentra identity
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-dark-text-primary mb-2">
                Username *
              </label>
              <Input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="your_username"
                error={errors.username}
                className="lowercase"
              />
              <p className="text-xs text-dark-text-tertiary mt-1">
                This will be your unique identifier on deCentra
              </p>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-dark-text-primary mb-2">
                Display Name
              </label>
              <Input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="Your Display Name"
              />
            </div>

            <Button
              type="button"
              variant="primary"
              fullWidth
              onClick={() => setStep(2)}
              disabled={!formData.username || !!validateUsername(formData.username)}
            >
              Continue
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-dark-background-primary flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6">
          <div className="text-center mb-6">
            <h1 className="font-heading font-bold text-xl text-dark-text-primary">
              Complete Your Profile
            </h1>
            <p className="text-dark-text-secondary mt-2">
              Add some personal touches (optional)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar Preview */}
            <div className="flex justify-center">
              <UserAvatar
                src={formData.avatarUrl}
                alt={formData.displayName || formData.username}
                size="xl"
              />
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block text-sm font-medium text-dark-text-primary mb-2">
                Avatar URL
              </label>
              <Input
                type="url"
                value={formData.avatarUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, avatarUrl: e.target.value }))}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-dark-text-primary mb-2">
                Bio
              </label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                rows={3}
                maxLength={500}
                error={errors.bio}
              />
              <p className="text-xs text-dark-text-tertiary mt-1">
                {formData.bio?.length || 0}/500 characters
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={state.isLoading}
              >
                Create Profile
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return null;
}
```

### Auth Guard Component

```typescript
// components/auth/AuthGuard.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { LoginFlow } from './LoginFlow';
import { ProfileCreationFlow } from './ProfileCreationFlow';
import { OnboardingTour } from './OnboardingTour';
import { AuthStep } from '@/lib/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

export function AuthGuard({ children, requireProfile = true }: AuthGuardProps) {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!state.isLoading && !state.isAuthenticated) {
      router.push('/login');
    }
  }, [state.isAuthenticated, state.isLoading, router]);

  // Loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-dark-background-primary flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-dark-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!state.isAuthenticated) {
    return <LoginFlow />;
  }

  // Authentication flow handling
  switch (state.authStep) {
    case AuthStep.ProfileCreation:
      return <ProfileCreationFlow />;
    
    case AuthStep.OnboardingTour:
      return <OnboardingTour />;
    
    case AuthStep.Authenticated:
      // Check if profile is required
      if (requireProfile && !state.userProfile) {
        return <ProfileCreationFlow />;
      }
      return <>{children}</>;
    
    default:
      return <LoadingSpinner />;
  }
}
```

## Authentication Implementation Guidelines

### 1. Security Best Practices
- Use Internet Identity for secure, passwordless authentication
- Implement proper session management with timeout handling
- Clear sensitive data on logout
- Use HTTPS for all authentication flows

### 2. Privacy Protection
- Support anonymous browsing mode
- Implement whistleblower protection features
- Clear tracking data when privacy modes are enabled
- Respect user privacy preferences

### 3. User Experience
- Smooth authentication flow with clear steps
- Progressive profile creation
- Proper loading and error states
- Accessible form validation

### 4. State Management
- Centralized authentication state
- Proper error handling and recovery
- Session persistence across page reloads
- Activity-based session extension

### 5. Integration Patterns
- Auth guards for protected routes
- Conditional rendering based on auth state
- Proper integration with Internet Identity
- Backend actor management

This authentication system provides a secure, privacy-focused, and user-friendly experience that aligns with deCentra's mission of user empowerment and data ownership.
