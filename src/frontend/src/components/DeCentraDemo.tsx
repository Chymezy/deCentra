'use client';

import React from 'react';
import { SocialNetworkLayout, Sidebar, ContentWrapper } from '@/components/layout';
import { AuthGuard, type AuthState, type PrivacyMode } from '@/components/auth';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { icons } from '@/lib/icons';

/**
 * Demo component showcasing Phase 1 implementation
 * This demonstrates how all the foundational components work together
 */
const DeCentraDemo: React.FC = () => {
  // Mock authentication state
  const [authState, setAuthState] = React.useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
  });

  // Simulate loading for demo
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: 'demo-user',
          username: 'democreattor',
          displayName: 'Demo Creator',
          verified: true,
          privacyMode: 'normal',
        },
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (privacyMode: PrivacyMode) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate login process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 'demo-user',
        username: 'democreattor',
        displayName: 'Demo Creator',
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

  // Navigation items for sidebar
  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      active: true,
    },
    {
      id: 'explore',
      label: 'Explore',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5h5l-5-5H9v10z" />
        </svg>
      ),
      badge: 3,
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
  ];

  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-privacy-background flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading deCentra..." />
      </div>
    );
  }

  return (
    <AuthGuard
      authState={authState}
      onLogin={handleLogin}
      onLogout={handleLogout}
      requiredLevel="public"
    >
      <SocialNetworkLayout
        sidebar={
          <Sidebar
            user={authState.user ? {
              id: authState.user.id,
              username: authState.user.username || '',
              displayName: authState.user.displayName,
              verified: authState.user.verified,
              stats: {
                followers: 1234,
                following: 567,
                posts: 89,
              },
            } : undefined}
            navigationItems={navigationItems}
            isAuthenticated={authState.isAuthenticated}
            onLogin={() => setAuthState(prev => ({ ...prev, isAuthenticated: false }))}
            onLogout={handleLogout}
            onCreatePost={() => alert('Create post clicked!')}
          />
        }
        rightPanel={
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>What&apos;s happening</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium">#deCentralized</p>
                    <p className="text-privacy-text-muted">1,234 posts</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">#Privacy</p>
                    <p className="text-privacy-text-muted">987 posts</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">#OpenSource</p>
                    <p className="text-privacy-text-muted">654 posts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Suggested Follows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Privacy Advocate', username: 'privacyfirst', verified: true },
                    { name: 'Crypto Builder', username: 'web3dev', verified: false },
                    { name: 'Decentralist', username: 'decentral', verified: true },
                  ].map((user) => (
                    <div key={user.username} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <UserAvatar
                          alt={user.name}
                          username={user.username}
                          size="sm"
                          verified={user.verified}
                        />
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-privacy-text-muted">@{user.username}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Follow</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        }
      >
        <ContentWrapper
          header={
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Home</h1>
              <Button size="sm" variant="ghost">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Button>
            </div>
          }
          stickyHeader
        >
          <div className="space-y-4">
            {/* Welcome Card */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <icons.sparkles className="w-5 h-5 text-vibrant-orange" aria-hidden="true" />
                  Welcome to deCentra!
                </CardTitle>
                <CardDescription>
                  You&apos;ve successfully implemented Phase 1 of the deCentra frontend enhancement.
                  This demonstrates our foundational UI components working together.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <icons.check className="w-4 h-4 text-privacy-success mr-2" aria-hidden={true} />
                      Button Component
                    </div>
                    <div className="flex items-center">
                      <icons.check className="w-4 h-4 text-privacy-success mr-2" aria-hidden={true} />
                      Card Component
                    </div>
                    <div className="flex items-center">
                      <icons.check className="w-4 h-4 text-privacy-success mr-2" aria-hidden={true} />
                      Input/Textarea Components
                    </div>
                    <div className="flex items-center">
                      <icons.check className="w-4 h-4 text-privacy-success mr-2" aria-hidden={true} />
                      Loading Spinners
                    </div>
                    <div className="flex items-center">
                      <icons.check className="w-4 h-4 text-privacy-success mr-2" aria-hidden={true} />
                      User Avatars
                    </div>
                    <div className="flex items-center">
                      <icons.check className="w-4 h-4 text-privacy-success mr-2" aria-hidden={true} />
                      Error Boundaries
                    </div>
                    <div className="flex items-center">
                      <icons.check className="w-4 h-4 text-privacy-success mr-2" aria-hidden={true} />
                      Modal Dialogs
                    </div>
                    <div className="flex items-center">
                      <icons.check className="w-4 h-4 text-privacy-success mr-2" aria-hidden={true} />
                      Layout System
                    </div>
                    <div className="flex items-center">
                      <icons.check className="w-4 h-4 text-privacy-success mr-2" aria-hidden={true} />
                      Authentication Flow
                    </div>
                    <div className="flex items-center">
                      <icons.check className="w-4 h-4 text-privacy-success mr-2" aria-hidden={true} />
                      Neumorphic Design
                    </div>
                  </div>
                  <div className="pt-3 border-t border-privacy-border/20">
                    <p className="text-sm text-privacy-text-muted">
                      <strong>Next:</strong> Phase 2 will add social feed components, post creation, 
                      and social interactions. Phase 3 will implement creator monetization and discovery features.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mock Posts */}
            {[1, 2, 3].map((i) => (
              <Card key={i} variant="interactive">
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <UserAvatar
                      alt={`User ${i}`}
                      username={`user${i}`}
                      size="default"
                      verified={i === 1}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">User {i}</span>
                        <span className="text-privacy-text-muted text-sm">@user{i}</span>
                        <span className="text-privacy-text-muted text-sm">·</span>
                        <span className="text-privacy-text-muted text-sm">2h</span>
                      </div>
                      <p className="mt-1 text-privacy-text">
                        This is a mock post to demonstrate the card layout and typography. 
                        Phase 2 will implement the full post component with interactions.
                      </p>
                      <div className="flex items-center space-x-6 mt-3 text-privacy-text-muted">
                        <button className="flex items-center space-x-1 hover:text-privacy-accent transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="text-sm">{i * 3}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-privacy-success transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span className="text-sm">{i * 7}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-privacy-accent transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                          <span className="text-sm">{i * 2}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ContentWrapper>
      </SocialNetworkLayout>
    </AuthGuard>
  );
};

export default DeCentraDemo;
