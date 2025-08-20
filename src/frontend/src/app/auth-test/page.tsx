'use client';

import React from 'react';
import { LoginFlow, type AuthState, type PrivacyMode } from '@/components/auth/LoginFlow';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { icons } from '@/lib/icons';

/**
 * Authentication testing page to validate login flow
 */
export default function AuthTestPage() {
  const [authState, setAuthState] = React.useState<AuthState>({
    isAuthenticated: false,
    isLoading: false,
  });

  const handleLogin = async (privacyMode: PrivacyMode) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate login process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 'test-user',
        username: 'testuser',
        displayName: 'Test User',
        verified: true,
        privacyMode,
      },
    });
  };

  const handleLogout = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate logout process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const handleResetDemo = () => {
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <div className="min-h-screen bg-privacy-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-privacy-text flex items-center">
              <icons.lock className="w-5 h-5 mr-2" aria-hidden={true} />
              Authentication Flow Testing
            </CardTitle>
            <CardDescription className="text-privacy-text-muted">
              Test the privacy-focused authentication system with mode selection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={handleResetDemo} variant="outline">
                Reset Demo
              </Button>
              <div className="text-sm text-privacy-text-muted flex items-center">
                Current State: {authState.isAuthenticated ? (
                  <span className="flex items-center ml-1">
                    <icons.check className="w-4 h-4 text-green-500 mr-1" aria-hidden={true} />
                    Authenticated
                  </span>
                ) : (
                  <span className="flex items-center ml-1">
                    <icons.close className="w-4 h-4 text-red-500 mr-1" aria-hidden={true} />
                    Not Authenticated
                  </span>
                )}
                {authState.user && ` (${authState.user.privacyMode} mode)`}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Authentication Component */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-heading text-privacy-text mb-4 flex items-center gap-2">
              <icons.sparkles className="w-5 h-5" aria-hidden="true" />
              Login Flow
            </h2>
            <LoginFlow
              authState={authState}
              onLogin={handleLogin}
              onLogout={handleLogout}
              showPrivacyModeSelection={true}
              mode="page"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-heading text-privacy-text mb-4 flex items-center gap-2">
              <icons.chart className="w-5 h-5" aria-hidden="true" />
              State Information
            </h2>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Authentication State</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-privacy-text-muted overflow-auto">
                  {JSON.stringify(authState, null, 2)}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Privacy Modes Explained</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium text-privacy-text flex items-center">
                    <icons.user className="w-4 h-4 text-blue-500 mr-2" aria-hidden={true} />
                    Standard Mode
                  </div>
                  <div className="text-privacy-text-muted">Full social features with customizable privacy controls</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-privacy-text flex items-center">
                    <icons.eye className="w-4 h-4 text-yellow-500 mr-2" aria-hidden={true} />
                    Anonymous Mode
                  </div>
                  <div className="text-privacy-text-muted">Browse and interact without revealing personal identity</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-privacy-text flex items-center">
                    <icons.shield className="w-4 h-4 text-red-500 mr-2" aria-hidden={true} />
                    Whistleblower Mode
                  </div>
                  <div className="text-privacy-text-muted">Maximum protection for sensitive information sharing</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
