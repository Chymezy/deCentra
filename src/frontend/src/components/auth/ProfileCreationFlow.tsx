'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { authService } from '@/lib/services/auth.service';
import type { UserProfile, ProfileCreationData } from '@/lib/types/auth.types';

interface ProfileCreationFlowProps {
  onComplete?: (profile: UserProfile) => Promise<void> | void;
  className?: string;
}

interface ValidationErrors {
  username?: string;
  bio?: string;
  avatar?: string;
  general?: string;
}

interface ProfileCreationFlowProps {
  onComplete?: (profile: UserProfile) => Promise<void> | void;
  className?: string;
}

interface ProfileCreationFlowProps {
  onComplete?: (profile: UserProfile) => void | Promise<void>;
  className?: string;
}

/**
 * ProfileCreationFlow Component
 * 
 * Comprehensive profile creation form with real-time validation.
 * Integrates with deCentra's backend validation rules and security measures.
 * 
 * Features:
 * - Real-time username availability checking
 * - Client-side validation matching backend rules
 * - Profile preview functionality
 * - Comprehensive error handling
 * - Accessibility compliant (WCAG 2.1 AA)
 */
export function ProfileCreationFlow({ onComplete, className }: ProfileCreationFlowProps = {}) {
  const { createUserProfile } = useAuth();
  
  const [formData, setFormData] = useState<ProfileCreationData>({
    username: '',
    bio: '',
    avatar: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Debounced username availability check
  const checkUsernameAvailability = useCallback(
    async (username: string) => {
      if (!username || username.length < 3) {
        setUsernameAvailable(null);
        return;
      }

      setCheckingUsername(true);
      try {
        // Check username availability via auth service
        const available = await authService.checkUsernameAvailability(username);
        setUsernameAvailable(available);
        
        // Clear any existing username errors if available
        if (available) {
          setErrors(prev => ({ ...prev, username: undefined }));
        }
      } catch (error) {
        console.error('Username availability check failed:', error);
        setUsernameAvailable(null);
        // Don't block user - let them try to submit and get backend error
      } finally {
        setCheckingUsername(false);
      }
    },
    []
  );

  // Real-time username validation (matches backend validation)
  const validateUsername = useCallback(
    async (username: string) => {
      // Clear previous errors
      setErrors(prev => ({ ...prev, username: undefined }));

      // Length validation
      if (username.length > 0 && username.length < 3) {
        setErrors(prev => ({ ...prev, username: 'Username must be at least 3 characters' }));
        return false;
      }
      
      if (username.length > 50) {
        setErrors(prev => ({ ...prev, username: 'Username must be less than 50 characters' }));
        return false;
      }
      
      // Character validation
      if (username && !/^[a-zA-Z0-9_-]+$/.test(username)) {
        setErrors(prev => ({ ...prev, username: 'Username can only contain letters, numbers, underscore, and hyphen' }));
        return false;
      }

      // Start/end validation
      if (username && (username.startsWith('_') || username.startsWith('-') || username.endsWith('_') || username.endsWith('-'))) {
        setErrors(prev => ({ ...prev, username: 'Username cannot start or end with underscore or hyphen' }));
        return false;
      }

      // Consecutive special characters
      if (username && /[_-]{2,}/.test(username)) {
        setErrors(prev => ({ ...prev, username: 'Username cannot have consecutive special characters' }));
        return false;
      }

      // Reserved words check (client-side)
      const reservedWords = ['admin', 'administrator', 'mod', 'moderator', 'system', 'root', 'api', 'support', 'decentra'];
      if (username && reservedWords.includes(username.toLowerCase())) {
        setErrors(prev => ({ ...prev, username: 'Username is reserved and cannot be used' }));
        return false;
      }
      
      // Check availability if format is valid
      if (username.length >= 3) {
        await checkUsernameAvailability(username);
        // If check failed, usernameAvailable will be null, which is handled in the UI
      }
      
      return true;
    },
    [checkUsernameAvailability]
  );

  // Bio validation (matches backend)
  const validateBio = useCallback((bio: string) => {
    if (bio.length > 500) {
      setErrors(prev => ({ ...prev, bio: 'Bio must be less than 500 characters' }));
      return false;
    }
    
    // Basic XSS prevention
    if (bio.includes('<script') || bio.includes('javascript:') || bio.includes('data:')) {
      setErrors(prev => ({ ...prev, bio: 'Bio contains potentially harmful content' }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, bio: undefined }));
    return true;
  }, []);

  // Avatar validation (matches backend)
  const validateAvatar = useCallback((avatar: string) => {
    if (avatar.length > 200) {
      setErrors(prev => ({ ...prev, avatar: 'Avatar must be less than 200 characters' }));
      return false;
    }
    
    // URL validation if it looks like a URL
    if (avatar && (avatar.startsWith('http://') || avatar.startsWith('https://'))) {
      try {
        const url = new URL(avatar);
        if (!avatar.startsWith('https://')) {
          setErrors(prev => ({ ...prev, avatar: 'Avatar URL must use HTTPS' }));
          return false;
        }
        
        // Basic domain whitelist for safety
        const allowedDomains = ['gravatar.com', 'github.com', 'githubusercontent.com', 'cloudflare.com', 'imgur.com'];
        const isAllowed = allowedDomains.some(domain => url.hostname.includes(domain));
        if (!isAllowed) {
          setErrors(prev => ({ ...prev, avatar: 'Avatar URL must be from a trusted domain' }));
          return false;
        }
      } catch {
        setErrors(prev => ({ ...prev, avatar: 'Invalid avatar URL format' }));
        return false;
      }
    }
    
    setErrors(prev => ({ ...prev, avatar: undefined }));
    return true;
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation
    const usernameValid = await validateUsername(formData.username);
    const bioValid = validateBio(formData.bio || '');
    const avatarValid = validateAvatar(formData.avatar || '');
    
    if (!usernameValid || !bioValid || !avatarValid || usernameAvailable === false) {
      return;
    }
    
    setLoading(true);
    setErrors({}); // Clear all errors
    
    try {
      const profile = await createUserProfile(
        formData.username,
        formData.bio || undefined,
        formData.avatar || undefined
      );
      
      // Call onComplete callback if provided and profile was created
      if (onComplete && profile) {
        await onComplete(profile);
      }
      // Success - AuthContext will handle navigation if no onComplete callback
    } catch (error: unknown) {
      // Handle specific backend errors
      const errorMessage = error instanceof Error ? error.message : 'Failed to create profile';
      
      if (errorMessage.includes('Username already taken')) {
        setErrors({ username: 'This username is already taken' });
      } else if (errorMessage.includes('User profile already exists')) {
        setErrors({ general: 'You already have a profile. Try refreshing the page.' });
      } else if (errorMessage.includes('Authentication required')) {
        setErrors({ general: 'Authentication expired. Please log in again.' });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  // Form validation state
  const isFormValid = formData.username.length >= 3 && 
                     !Object.values(errors).some(Boolean) && 
                     usernameAvailable === true;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 ${className || ''}`}>
      <div className="max-w-md w-full">
        {/* Neumorphic Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Create Your Profile
            </h1>
            <p className="text-slate-400 mt-2">
              Join the decentralized social network
            </p>
          </div>
          
          {/* Global Error */}
          {errors.general && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{errors.general}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                Username *
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, username: e.target.value }));
                    validateUsername(e.target.value);
                  }}
                  placeholder="your_username"
                  className={`
                    w-full px-4 py-3 rounded-lg bg-slate-700/50 border transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-purple-500/50
                    ${errors.username 
                      ? 'border-red-500/50 focus:border-red-500' 
                      : 'border-slate-600/50 focus:border-purple-500/50'
                    }
                    text-white placeholder-slate-400
                  `}
                  required
                  disabled={loading}
                />
                {/* Username Status Indicator */}
                {formData.username.length >= 3 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {checkingUsername ? (
                      <div className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full" />
                    ) : usernameAvailable === true ? (
                      <div className="h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : usernameAvailable === false ? (
                      <div className="h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
              {errors.username && (
                <p className="text-red-400 text-xs mt-1">{errors.username}</p>
              )}
              {usernameAvailable === true && formData.username && !errors.username && (
                <p className="text-green-400 text-xs mt-1">✓ Username is available</p>
              )}
            </div>

            {/* Bio Field */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-slate-300 mb-2">
                Bio (Optional)
              </label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, bio: e.target.value }));
                  validateBio(e.target.value);
                }}
                placeholder="Tell the deCentra community about yourself..."
                rows={3}
                className={`
                  w-full px-4 py-3 rounded-lg bg-slate-700/50 border transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none
                  ${errors.bio 
                    ? 'border-red-500/50 focus:border-red-500' 
                    : 'border-slate-600/50 focus:border-purple-500/50'
                  }
                  text-white placeholder-slate-400
                `}
                disabled={loading}
              />
              <div className="flex justify-between mt-1">
                {errors.bio && <p className="text-red-400 text-xs">{errors.bio}</p>}
                <p className="text-slate-500 text-xs ml-auto">{(formData.bio || '').length}/500</p>
              </div>
            </div>

            {/* Avatar Field */}
            <div>
              <label htmlFor="avatar" className="block text-sm font-medium text-slate-300 mb-2">
                Avatar URL (Optional)
              </label>
              <input
                id="avatar"
                type="url"
                value={formData.avatar}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, avatar: e.target.value }));
                  validateAvatar(e.target.value);
                }}
                placeholder="https://example.com/your-avatar.jpg"
                className={`
                  w-full px-4 py-3 rounded-lg bg-slate-700/50 border transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-purple-500/50
                  ${errors.avatar 
                    ? 'border-red-500/50 focus:border-red-500' 
                    : 'border-slate-600/50 focus:border-purple-500/50'
                  }
                  text-white placeholder-slate-400
                `}
                disabled={loading}
              />
              {errors.avatar && (
                <p className="text-red-400 text-xs mt-1">{errors.avatar}</p>
              )}
            </div>

            {/* Profile Preview */}
            {(formData.username || formData.bio || formData.avatar) && (
              <div className="border border-slate-600/50 rounded-lg p-4 bg-slate-700/30">
                <p className="text-sm font-medium text-slate-300 mb-3">Profile Preview:</p>
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {formData.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={formData.avatar} 
                        alt="Avatar preview"
                        className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/30"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                        {formData.username ? formData.username[0].toUpperCase() : '?'}
                      </div>
                    )}
                  </div>
                  {/* Profile Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{formData.username || 'Username'}</p>
                    {formData.bio && (
                      <p className="text-sm text-slate-400 mt-1 break-words">{formData.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className={`
                w-full py-4 px-6 rounded-lg font-medium transition-all duration-200
                ${isFormValid && !loading
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }
                focus:outline-none focus:ring-2 focus:ring-purple-500/50
              `}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  <span>Creating Profile...</span>
                </div>
              ) : (
                'Create Profile'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-slate-500 text-xs">
              By creating a profile, you agree to deCentra&apos;s community guidelines
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
