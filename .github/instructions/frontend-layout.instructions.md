---
applyTo: "**/*.tsx,**/page.tsx,**/layout.tsx"
---

# Frontend Layout & Component Instructions for deCentra

## Layout Architecture

deCentra follows a **Twitter-inspired three-column layout** with enhanced neumorphic styling and privacy-focused design patterns.

### Core Layout Structure

```typescript
// Main application layout structure
src/app/
├── layout.tsx              # Root layout with providers
├── page.tsx               # Landing page for unauthenticated users
├── (auth)/                # Authenticated user routes
│   ├── layout.tsx         # Authenticated layout with sidebar
│   ├── feed/              # Main social feed
│   ├── profile/           # User profiles
│   ├── settings/          # User settings
│   ├── creator/           # Creator dashboard
│   └── whistleblower/     # Anonymous posting
└── components/
    ├── layout/            # Layout components
    ├── social/            # Social network components
    ├── ui/                # Base UI components
    └── forms/             # Form components
```

### Root Layout Implementation

```typescript
// app/layout.tsx - Root application layout
import type { Metadata } from 'next';
import { Inter, Poppins, Roboto } from 'next/font/google';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { ThemeProvider } from '@/lib/contexts/ThemeContext';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import '@/styles/globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const roboto = Roboto({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'deCentra - Censorship-Resistant Social Network',
  description: 'Where governments can\'t ban users, corporations can\'t sell data, and communities govern themselves.',
  keywords: ['social network', 'decentralized', 'privacy', 'censorship-resistant', 'Internet Computer'],
  authors: [{ name: 'deCentra Team' }],
  openGraph: {
    title: 'deCentra - Free & Open Social Network',
    description: 'Join the social network for a free and open internet',
    type: 'website',
    locale: 'en_US',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#4B0082',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${poppins.variable} ${roboto.variable} dark`}
    >
      <body className="font-body bg-dark-background-primary text-dark-text-primary antialiased">
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <div id="root">
                {children}
              </div>
              
              {/* Global UI Elements */}
              <div id="modal-root" />
              <div id="toast-root" />
              <div id="tooltip-root" />
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### Landing Page Layout

```typescript
// app/page.tsx - Public landing page
import { Suspense } from 'react';
import { HeroSection } from '@/components/layout/HeroSection';
import { FeaturesSection } from '@/components/layout/FeaturesSection';
import { SecuritySection } from '@/components/layout/SecuritySection';
import { CallToActionSection } from '@/components/layout/CallToActionSection';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-background-primary">
      <PublicHeader />
      
      <main className="relative">
        <Suspense fallback={<LoadingSpinner />}>
          <HeroSection />
          <FeaturesSection />
          <SecuritySection />
          <CallToActionSection />
        </Suspense>
      </main>
      
      <PublicFooter />
    </div>
  );
}
```

### Authenticated Layout

```typescript
// app/(auth)/layout.tsx - Authenticated user layout
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { SocialNetworkLayout } from '@/components/layout/SocialNetworkLayout';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SocialNetworkLayout
        sidebar={<Sidebar />}
        rightPanel={<TrendsPanel />}
      >
        {children}
      </SocialNetworkLayout>
      
      {/* Mobile Navigation */}
      <MobileNavigation className="lg:hidden" />
    </AuthGuard>
  );
}
```

## Core Layout Components

### Social Network Layout

```typescript
// components/layout/SocialNetworkLayout.tsx
import { ReactNode } from 'react';

interface SocialNetworkLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  rightPanel?: ReactNode;
  className?: string;
}

export function SocialNetworkLayout({
  children,
  sidebar,
  rightPanel,
  className = '',
}: SocialNetworkLayoutProps) {
  return (
    <div className={`min-h-screen bg-dark-background-primary ${className}`}>
      <div className="max-w-7xl mx-auto flex relative">
        {/* Left Sidebar - Fixed position on desktop */}
        {sidebar && (
          <aside className="hidden lg:block w-64 fixed h-full left-0 top-0 z-30">
            <div className="p-4 h-full overflow-y-auto border-r border-dark-border-subtle">
              {sidebar}
            </div>
          </aside>
        )}
        
        {/* Main Content Area */}
        <main 
          className={`
            flex-1 min-h-screen
            ${sidebar ? 'lg:ml-64' : ''}
            ${rightPanel ? 'lg:mr-80' : ''}
          `}
        >
          <div className="max-w-2xl mx-auto border-x border-dark-border-subtle min-h-screen bg-dark-background-secondary">
            {children}
          </div>
        </main>
        
        {/* Right Panel - Fixed position on desktop */}
        {rightPanel && (
          <aside className="hidden lg:block w-80 fixed h-full right-0 top-0 z-30">
            <div className="p-4 h-full overflow-y-auto border-l border-dark-border-subtle">
              {rightPanel}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
```

### Sidebar Navigation

```typescript
// components/layout/Sidebar.tsx
import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { 
  HomeIcon,
  SearchIcon,
  BellIcon,
  MailIcon,
  UserIcon,
  CogIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const navigationItems = [
  { name: 'Home', href: '/feed', icon: HomeIcon },
  { name: 'Explore', href: '/explore', icon: SearchIcon },
  { name: 'Notifications', href: '/notifications', icon: BellIcon },
  { name: 'Messages', href: '/messages', icon: MailIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
  { name: 'Creator Studio', href: '/creator', icon: StarIcon },
  { name: 'Whistleblower', href: '/whistleblower', icon: ShieldCheckIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-dark-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-deep-indigo shadow-glow-indigo flex items-center justify-center">
            <span className="text-white font-bold text-sm">dC</span>
          </div>
          <span className="font-heading font-bold text-lg text-dark-text-primary">
            deCentra
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.name}
              variant="ghost"
              size="lg"
              fullWidth
              className="justify-start gap-4 h-12 text-dark-text-secondary hover:text-electric-blue hover:bg-dark-background-tertiary"
              onClick={() => router.push(item.href)}
            >
              <Icon className="w-6 h-6" />
              <span className="font-medium">{item.name}</span>
            </Button>
          );
        })}
      </nav>

      {/* Post Button */}
      <div className="p-4 border-t border-dark-border-subtle">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="mb-4 shadow-glow-indigo"
          onClick={() => router.push('/compose')}
        >
          Post
        </Button>

        {/* User Profile */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-background-tertiary shadow-soft">
          <UserAvatar 
            src={user?.avatarUrl} 
            alt={user?.displayName || user?.username || 'User'} 
            size="md" 
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-dark-text-primary truncate">
              {user?.displayName || user?.username}
            </p>
            <p className="text-sm text-dark-text-tertiary truncate">
              @{user?.username}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            loading={isLoggingOut}
            className="text-dark-text-tertiary hover:text-vibrant-orange"
          >
            <LogoutIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Right Panel (Trends & Discovery)

```typescript
// components/layout/TrendsPanel.tsx
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Input } from '@/components/ui/Input';
import { SearchIcon } from '@heroicons/react/24/outline';

interface TrendingTopic {
  id: string;
  name: string;
  category: string;
  postCount: number;
}

interface SuggestedUser {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  followerCount: number;
  isVerified: boolean;
  avatarUrl?: string;
}

export function TrendsPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-text-tertiary" />
          <Input
            placeholder="Search deCentra"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-dark-background-primary border-dark-border-subtle focus:border-electric-blue"
          />
        </div>
      </Card>

      {/* Trending Topics */}
      <Card className="p-4">
        <h2 className="font-heading font-bold text-lg text-dark-text-primary mb-4">
          Trending Topics
        </h2>
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <button
              key={topic.id}
              className="w-full text-left p-3 rounded-lg hover:bg-dark-background-tertiary transition-colors duration-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-dark-text-tertiary">
                    {index + 1} · Trending in {topic.category}
                  </p>
                  <p className="font-medium text-dark-text-primary">
                    #{topic.name}
                  </p>
                  <p className="text-sm text-dark-text-tertiary">
                    {topic.postCount.toLocaleString()} posts
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Suggested Users */}
      <Card className="p-4">
        <h2 className="font-heading font-bold text-lg text-dark-text-primary mb-4">
          Who to Follow
        </h2>
        <div className="space-y-4">
          {suggestedUsers.map((user) => (
            <div key={user.id} className="flex items-start gap-3">
              <UserAvatar 
                src={user.avatarUrl} 
                alt={user.displayName} 
                size="md"
                verified={user.isVerified}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="font-medium text-dark-text-primary truncate">
                    {user.displayName}
                  </p>
                  {user.isVerified && (
                    <CheckBadgeIcon className="w-4 h-4 text-electric-blue" />
                  )}
                </div>
                <p className="text-sm text-dark-text-tertiary truncate">
                  @{user.username}
                </p>
                <p className="text-sm text-dark-text-secondary mt-1 line-clamp-2">
                  {user.bio}
                </p>
                <p className="text-xs text-dark-text-tertiary mt-1">
                  {user.followerCount.toLocaleString()} followers
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-2 border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-white"
              >
                Follow
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Privacy Notice */}
      <Card className="p-4 bg-deep-indigo bg-opacity-10 border-deep-indigo">
        <div className="flex items-start gap-3">
          <ShieldCheckIcon className="w-5 h-5 text-deep-indigo mt-0.5" />
          <div>
            <h3 className="font-medium text-dark-text-primary mb-1">
              Your Privacy Matters
            </h3>
            <p className="text-sm text-dark-text-secondary">
              deCentra doesn't track or sell your data. Your social interactions remain private and secure.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

### Mobile Navigation

```typescript
// components/layout/MobileNavigation.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { 
  HomeIcon,
  SearchIcon,
  BellIcon,
  UserIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface MobileNavigationProps {
  className?: string;
}

export function MobileNavigation({ className = '' }: MobileNavigationProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('feed');

  const navigationItems = [
    { id: 'feed', name: 'Home', href: '/feed', icon: HomeIcon },
    { id: 'explore', name: 'Explore', href: '/explore', icon: SearchIcon },
    { id: 'compose', name: 'Post', href: '/compose', icon: PlusIcon },
    { id: 'notifications', name: 'Notifications', href: '/notifications', icon: BellIcon },
    { id: 'profile', name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  const handleNavigation = (item: typeof navigationItems[0]) => {
    setActiveTab(item.id);
    router.push(item.href);
  };

  return (
    <nav className={`
      fixed bottom-0 left-0 right-0 z-50
      bg-dark-background-secondary border-t border-dark-border-subtle
      shadow-strong
      ${className}
    `}>
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isCompose = item.id === 'compose';
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="md"
              className={`
                flex-1 flex flex-col items-center gap-1 p-3 rounded-lg
                ${isCompose ? 'bg-deep-indigo text-white shadow-glow-indigo' : ''}
                ${isActive && !isCompose ? 'text-electric-blue' : 'text-dark-text-tertiary'}
                hover:text-electric-blue hover:bg-dark-background-tertiary
              `}
              onClick={() => handleNavigation(item)}
            >
              <Icon className={`w-6 h-6 ${isCompose ? 'w-5 h-5' : ''}`} />
              <span className="text-xs font-medium">
                {item.name}
              </span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
```

## Component Implementation Guidelines

### 1. Layout Consistency
- Use consistent padding and spacing (8px base unit)
- Apply neumorphic shadows for depth and hierarchy
- Maintain dark mode as primary with proper contrast ratios
- Use responsive design patterns for mobile/tablet/desktop

### 2. Navigation Patterns
- Fixed sidebar on desktop with smooth hover animations
- Mobile-first responsive navigation with bottom tab bar
- Clear visual indication of current page/section
- Accessible keyboard navigation support

### 3. Content Areas
- Maximum content width for readability (2xl: 672px)
- Proper content hierarchy with typography scale
- Card-based layouts with consistent spacing
- Loading states and error boundaries

### 4. Interactive Elements
- Smooth transitions for all hover/focus states
- Loading indicators for async operations
- Clear visual feedback for user actions
- Accessible focus indicators and ARIA labels

### 5. Performance Optimization
- Lazy loading for images and heavy components
- Code splitting for route-based optimization
- Efficient state management with proper memoization
- Optimistic updates for better user experience

### 6. Security & Privacy
- No user tracking or analytics by default
- Secure content rendering with XSS protection
- Privacy-focused design patterns
- Clear privacy controls and settings

This layout architecture provides the foundation for a professional, accessible, and privacy-focused social network that aligns with deCentra's mission while delivering an exceptional user experience across all devices.
