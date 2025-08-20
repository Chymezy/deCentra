'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userService } from '@/lib/services/user.service';
import { useAuth } from '@/lib/contexts/AuthContext';
import { icons } from '@/lib/icons';
import type { 
  ProfileCreationData, 
  ProfileValidationErrors,
  UserProfile 
} from '@/lib/types/user.types';

interface ProfileCreationWizardProps {
  onComplete?: (profile: UserProfile) => void;
  privacyMode?: 'normal' | 'anonymous' | 'whistleblower';
  className?: string;
}

/**
 * ProfileCreationWizard Component
 * 
 * Multi-step wizard for creating user profiles with real-time validation
 * and privacy mode support for whistleblower protection.
 * 
 * Features:
 * - 3-step wizard flow (Username → Bio/Avatar → Review)
 * - Real-time username availability checking
 * - Input validation with user-friendly error messages
 * - Privacy mode indicators
 * - Accessibility compliance (WCAG 2.1 AA)
 * 
 * @param onComplete - Callback when profile creation succeeds
 * @param privacyMode - Privacy mode for enhanced protection
 * @param className - Additional CSS classes
 */
export const ProfileCreationWizard: React.FC<ProfileCreationWizardProps> = ({
  onComplete,
  privacyMode = 'normal',
  className = ''
}) => {
  const router = useRouter();
  const { identity } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState<ProfileCreationData>({
    username: '',
    bio: '',
    avatar: 'US' // User initials fallback instead of emoji
  });
  
  // UI state
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<ProfileValidationErrors>({});
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  // Initialize UserService with current identity
  useEffect(() => {
    if (identity) {
      userService.initialize(identity);
    }
  }, [identity]);

  // Real-time username validation
  const checkUsername = useCallback(async (username: string) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setIsCheckingUsername(true);
    try {
      const result = await userService.checkUsernameAvailability(username);
      if (result.success) {
        setUsernameAvailable(result.data || false);
        if (!result.data) {
          setErrors(prev => ({ ...prev, username: 'Username is already taken' }));
        } else {
          setErrors(prev => ({ ...prev, username: undefined }));
        }
      } else {
        setErrors(prev => ({ ...prev, username: result.error }));
      }
    } catch {
      setErrors(prev => ({ 
        ...prev, 
        username: 'Unable to check username availability' 
      }));
    } finally {
      setIsCheckingUsername(false);
    }
  }, []);

  // Debounced username checking
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.username) {
        checkUsername(formData.username);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.username, checkUsername]);

  const validateStep = (step: number): boolean => {
    const newErrors: ProfileValidationErrors = {};

    if (step === 1) {
      // Username validation
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      } else if (formData.username.length > 50) {
        newErrors.username = 'Username must be less than 50 characters';
      } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
        newErrors.username = 'Username can only contain letters, numbers, underscore, and dash';
      } else if (usernameAvailable === false) {
        newErrors.username = 'Username is already taken';
      }
    }

    if (step === 2) {
      // Bio validation
      if (formData.bio && formData.bio.length > 500) {
        newErrors.bio = 'Bio must be less than 500 characters';
      }
      
      // Avatar validation
      if (formData.avatar && formData.avatar.length > 100) {
        newErrors.avatar = 'Avatar must be less than 100 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsCreating(true);
    try {
      const result = await userService.createProfile(formData);
      
      if (result.success && result.data) {
        if (onComplete) {
          onComplete(result.data);
        } else {
          router.push('/profile');
        }
      } else {
        setErrors({ username: 'error' in result ? result.error : 'Failed to create profile' });
      }
    } catch (error) {
      setErrors({ 
        username: error instanceof Error ? error.message : 'Profile creation failed' 
      });
    } finally {
      setIsCreating(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Choose your username
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          This will be your unique identifier on deCentra. Choose wisely!
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label 
            htmlFor="username" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
          >
            Username
          </label>
          <div className="relative">
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') 
              }))}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="your_username"
              maxLength={50}
              aria-describedby={errors.username ? 'username-error' : 'username-help'}
              aria-invalid={!!errors.username}
            />
            
            {/* Username availability indicator */}
            {formData.username.length >= 3 && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isCheckingUsername ? (
                  <div 
                    className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
                    aria-label="Checking username availability"
                  />
                ) : usernameAvailable === true ? (
                  <icons.check className="w-5 h-5 text-green-500" aria-label="Username available" />
                ) : usernameAvailable === false ? (
                  <icons.close className="w-5 h-5 text-red-500" aria-label="Username taken" />
                ) : null}
              </div>
            )}
          </div>
          
          {errors.username && (
            <p id="username-error" className="mt-2 text-sm text-red-600" role="alert">
              {errors.username}
            </p>
          )}
          
          <p id="username-help" className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            3-50 characters, letters, numbers, underscore, and dash only
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Tell us about yourself
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Add a bio and choose an avatar (optional)
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label 
            htmlFor="bio" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
          >
            Bio (Optional)
          </label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
              errors.bio ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Tell the deCentra community about yourself..."
            rows={4}
            maxLength={500}
            aria-describedby={errors.bio ? 'bio-error' : 'bio-help'}
            aria-invalid={!!errors.bio}
          />
          
          {errors.bio && (
            <p id="bio-error" className="mt-2 text-sm text-red-600" role="alert">
              {errors.bio}
            </p>
          )}
          
          <p id="bio-help" className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {formData.bio?.length || 0}/500 characters
          </p>
        </div>

        <div>
          <label 
            htmlFor="avatar" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
          >
            Avatar
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-2xl">
              {formData.avatar}
            </div>
            <input
              type="text"
              id="avatar"
              value={formData.avatar}
              onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              placeholder="Avatar URL or initials"
              maxLength={100}
              aria-describedby="avatar-help"
            />
          </div>
          <p id="avatar-help" className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Use an emoji or short text as your avatar
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Review your profile
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Make sure everything looks good before creating your profile
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-2xl">
            {formData.avatar}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              @{formData.username}
            </h3>
            {privacyMode !== 'normal' && (
              <span className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                {privacyMode === 'anonymous' ? 'Anonymous Mode' : 'Whistleblower Mode'}
              </span>
            )}
          </div>
        </div>
        
        {formData.bio && (
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Bio</h4>
            <p className="text-gray-600 dark:text-gray-300">{formData.bio}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`max-w-md mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 ${className}`}>
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
              aria-label={`Step ${step}${step <= currentStep ? ' (completed)' : ''}`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={3}
            aria-valuenow={currentStep}
            aria-label={`Profile creation progress: step ${currentStep} of 3`}
          />
        </div>
      </div>

      {/* Step content */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Go to previous step"
        >
          Back
        </button>

        {currentStep < 3 ? (
          <button
            onClick={handleNext}
            disabled={
              (currentStep === 1 && (!formData.username || usernameAvailable === false || isCheckingUsername)) ||
              Object.keys(errors).length > 0
            }
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Go to next step"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isCreating}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            aria-label={isCreating ? 'Creating profile...' : 'Create profile'}
          >
            {isCreating && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{isCreating ? 'Creating...' : 'Create Profile'}</span>
          </button>
        )}
      </div>
    </div>
  );
};