'use client';

import React, { useState } from 'react';
import { useAuth } from '../AuthContext';

interface ProfileCreationWizardProps {
  onComplete: () => void;
  onSkip?: () => void;
}

/**
 * ProfileCreationWizard Component
 * 
 * A comprehensive onboarding flow for new users to create their deCentra profile.
 * This component guides users through the essential setup steps required before
 * they can fully participate in the social network.
 * 
 * Features:
 * - Step-by-step profile creation process
 * - Real-time username validation
 * - Privacy-focused default settings
 * - Accessibility-compliant form design
 * - Integration with backend profile creation API
 * 
 * Required for new users after Internet Identity authentication.
 */
export default function ProfileCreationWizard({ 
  onComplete, 
  onSkip 
}: ProfileCreationWizardProps) {
  const { createProfile, principal } = useAuth();

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    bio: '',
  });

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 3;

  /**
   * Validates the username according to backend requirements
   */
  const validateUsername = (username: string): string | null => {
    if (username.length < 3) {
      return 'Username must be at least 3 characters long';
    }
    if (username.length > 50) {
      return 'Username must be less than 50 characters';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return 'Username can only contain letters, numbers, underscores, and hyphens';
    }
    return null;
  };

  /**
   * Validates the display name
   */
  const validateDisplayName = (displayName: string): string | null => {
    if (displayName.length > 100) {
      return 'Display name must be less than 100 characters';
    }
    return null;
  };

  /**
   * Validates the bio
   */
  const validateBio = (bio: string): string | null => {
    if (bio.length > 500) {
      return 'Bio must be less than 500 characters';
    }
    return null;
  };

  /**
   * Handles form field changes with real-time validation
   */
  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear existing error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Real-time validation for username
    if (field === 'username') {
      const error = validateUsername(value);
      if (error) {
        setErrors(prev => ({ ...prev, username: error }));
      }
    }
  };

  /**
   * Validates the current step
   */
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      const usernameError = validateUsername(formData.username);
      if (usernameError) {
        newErrors.username = usernameError;
      }
    } else if (currentStep === 2) {
      const displayNameError = validateDisplayName(formData.displayName);
      if (displayNameError) {
        newErrors.displayName = displayNameError;
      }
    } else if (currentStep === 3) {
      const bioError = validateBio(formData.bio);
      if (bioError) {
        newErrors.bio = bioError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Moves to the next step
   */
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  /**
   * Moves to the previous step
   */
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  /**
   * Submits the profile creation form
   */
  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await createProfile(
        formData.username,
        formData.displayName || undefined,
        formData.bio || undefined
      );

      if (success) {
        onComplete();
      }
      // Error handling is done in the createProfile function
    } catch (error) {
      console.error('Profile creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Renders the current step content
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-4">👤</div>
              <h2 className="text-2xl font-heading font-bold text-deep-indigo mb-2">
                Choose Your Username
              </h2>
              <p className="text-charcoal-black/70">
                This will be your unique identifier on deCentra. Choose wisely - you can&apos;t change it later!
              </p>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-charcoal-black mb-2">
                Username *
              </label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) => handleFieldChange('username', e.target.value)}
                placeholder="your_username"
                className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-deep-indigo focus:border-transparent transition-all ${
                  errors.username ? 'border-red-500' : 'border-gray-200'
                }`}
                maxLength={50}
                autoComplete="username"
                aria-describedby={errors.username ? 'username-error' : undefined}
              />
              {errors.username && (
                <p id="username-error" className="text-red-500 text-sm mt-2">
                  {errors.username}
                </p>
              )}
              <p className="text-gray-500 text-sm mt-2">
                3-50 characters. Letters, numbers, underscores, and hyphens only.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-4">✨</div>
              <h2 className="text-2xl font-heading font-bold text-deep-indigo mb-2">
                Display Name (Optional)
              </h2>
              <p className="text-charcoal-black/70">
                This is how others will see your name. You can change this anytime.
              </p>
            </div>

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-charcoal-black mb-2">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={formData.displayName}
                onChange={(e) => handleFieldChange('displayName', e.target.value)}
                placeholder="Your Display Name"
                className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-deep-indigo focus:border-transparent transition-all ${
                  errors.displayName ? 'border-red-500' : 'border-gray-200'
                }`}
                maxLength={100}
                autoComplete="name"
                aria-describedby={errors.displayName ? 'display-name-error' : undefined}
              />
              {errors.displayName && (
                <p id="display-name-error" className="text-red-500 text-sm mt-2">
                  {errors.displayName}
                </p>
              )}
              <p className="text-gray-500 text-sm mt-2">
                Up to 100 characters. Leave blank to use your username.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="text-blue-500 text-xl">💡</div>
                <div>
                  <h4 className="font-semibold text-blue-900">Privacy Tip</h4>
                  <p className="text-blue-800 text-sm">
                    Your display name is public. You can always update your privacy settings later.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-4">📝</div>
              <h2 className="text-2xl font-heading font-bold text-deep-indigo mb-2">
                Tell Us About Yourself (Optional)
              </h2>
              <p className="text-charcoal-black/70">
                Share a bit about yourself with the deCentra community.
              </p>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-charcoal-black mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleFieldChange('bio', e.target.value)}
                placeholder="Tell the community about yourself, your interests, or what you hope to achieve on deCentra..."
                className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-deep-indigo focus:border-transparent transition-all resize-none ${
                  errors.bio ? 'border-red-500' : 'border-gray-200'
                }`}
                rows={4}
                maxLength={500}
                aria-describedby={errors.bio ? 'bio-error' : undefined}
              />
              {errors.bio && (
                <p id="bio-error" className="text-red-500 text-sm mt-2">
                  {errors.bio}
                </p>
              )}
              <p className="text-gray-500 text-sm mt-2">
                {formData.bio.length}/500 characters
              </p>
            </div>

            <div className="bg-gradient-to-r from-deep-indigo/10 to-electric-blue/10 border border-deep-indigo/20 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="text-deep-indigo text-xl">🔒</div>
                <div>
                  <h4 className="font-semibold text-deep-indigo">Default Privacy Settings</h4>
                  <ul className="text-deep-indigo/80 text-sm space-y-1 mt-1">
                    <li>• Profile: Public (you can change this)</li>
                    <li>• Posts: Public by default</li>
                    <li>• Messages: Followers only</li>
                    <li>• Searchable: Yes (helps people find you)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-heading font-bold text-deep-indigo">
                Welcome to deCentra!
              </h1>
              <p className="text-sm text-charcoal-black/70">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
            {onSkip && currentStep === 1 && (
              <button
                onClick={onSkip}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Skip for now
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex space-x-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full flex-1 ${
                    i + 1 <= currentStep ? 'bg-deep-indigo' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 text-deep-indigo border border-deep-indigo rounded-xl hover:bg-deep-indigo/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Back
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                disabled={!!errors.username || !!errors.displayName || !!errors.bio}
                className="px-6 py-2 bg-deep-indigo text-white rounded-xl hover:bg-deep-indigo/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !!errors.username || !!errors.displayName || !!errors.bio}
                className="px-6 py-2 bg-deep-indigo text-white rounded-xl hover:bg-deep-indigo/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
              </button>
            )}
          </div>

          {principal && (
            <p className="text-xs text-gray-500 mt-4 text-center">
              Identity: {principal.slice(0, 8)}...{principal.slice(-8)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
