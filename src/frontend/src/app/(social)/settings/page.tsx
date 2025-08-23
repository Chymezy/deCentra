'use client';

import { icons } from '@/lib/icons';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-dark-background-primary">
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="mb-4 flex justify-center">
            <icons.settings
              className="w-16 h-16 text-dark-text-secondary"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-2xl font-bold text-dark-text-primary mb-2">
            Settings
          </h1>
          <p className="text-dark-text-secondary mb-4">
            User preferences and privacy controls
          </p>
          <p className="text-dark-text-tertiary text-sm">
            Comprehensive settings for privacy, security, and personalization
            will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
}
