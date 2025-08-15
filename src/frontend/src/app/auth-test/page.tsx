'use client';

import React from 'react';
import { LoginFlow, type AuthState, type PrivacyMode } from '@/components/auth/LoginFlow';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

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
            <CardTitle className="text-privacy-text">🔐 Authentication Flow Testing</CardTitle>
            <CardDescription className="text-privacy-text-muted">
              Test the privacy-focused authentication system with mode selection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={handleResetDemo} variant="outline">
                Reset Demo
              </Button>
              <div className="text-sm text-privacy-text-muted">
                Current State: {authState.isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
                {authState.user && ` (${authState.user.privacyMode} mode)`}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Authentication Component */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-heading text-privacy-text mb-4">🎭 Login Flow</h2>
            <LoginFlow
              authState={authState}
              onLogin={handleLogin}
              onLogout={handleLogout}
              showPrivacyModeSelection={true}
              mode="page"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-heading text-privacy-text mb-4">📊 State Information</h2>
            
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
                  <div className="font-medium text-privacy-text">🔵 Standard Mode</div>
                  <div className="text-privacy-text-muted">Full social features with customizable privacy controls</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-privacy-text">🟡 Anonymous Mode</div>
                  <div className="text-privacy-text-muted">Browse and interact without revealing personal identity</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-privacy-text">🔴 Whistleblower Mode</div>
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
