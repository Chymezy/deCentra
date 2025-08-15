---
applyTo: "**/*.tsx,**/*.ts,**/page.tsx,**/layout.tsx"
---

# Frontend Enhancement Master Instructions for deCentra

## 🎯 UI/UX Transformation Objectives

Transform deCentra's frontend from basic landing page to a **sophisticated Twitter-inspired social network** with:
- **Neumorphic dark-first design** with professional elegance
- **Three-column layout** (sidebar, main feed, discovery panel)
- **Privacy-focused features** (anonymous mode, whistleblower protection)
- **Creator monetization** (ICP tipping, subscriptions, analytics)
- **Accessibility-first** implementation (WCAG 2.1 AA compliance)

## 📐 Design System Foundation

### Color Palette (Already implemented in Tailwind)
```typescript
// Brand colors are configured in tailwind.config.ts
'deep-indigo': '#4B0082',      // Headers, navigation, primary actions
'electric-blue': '#0F62FE',    // Links, highlights, secondary actions  
'vibrant-orange': '#FF6F00',   // Notifications, warnings, CTAs
'charcoal-black': '#1A1A1A',   // Text, borders, base UI
'pure-white': '#FFFFFF',       // Backgrounds, content areas

// Dark mode palette for components
'dark-background-primary': '#0F0F0F',    // Main app background
'dark-background-secondary': '#1A1A1A',  // Card backgrounds
'dark-background-tertiary': '#2A2A2A',   // Elevated elements
'dark-text-primary': '#FFFFFF',          // Main text
'dark-text-secondary': '#B3B3B3',        // Secondary text
'dark-text-tertiary': '#808080',         // Muted text
```

### Typography Scale
```typescript
// Use configured font families
font-heading: ['Inter', 'Poppins', 'system-ui', 'sans-serif']
font-body: ['Roboto', 'Open Sans', 'system-ui', 'sans-serif']
font-code: ['JetBrains Mono', 'monospace']

// Typography hierarchy
text-display-2xl: '4.5rem',    // Hero headings
text-display-xl: '3.75rem',    // Page titles
text-heading-xl: '1.5rem',     // Component titles
text-body-lg: '1.125rem',      // Default body text
text-body-md: '1rem',          // Small body text
```

### Neumorphic Shadows
```typescript
// Enhanced shadow system (already in tailwind.config.ts)
shadow-soft: '4px 4px 8px rgba(0,0,0,0.25), -4px -4px 8px rgba(255,255,255,0.05)'
shadow-medium: '8px 8px 16px rgba(0,0,0,0.3), -8px -8px 16px rgba(255,255,255,0.1)'
shadow-strong: '12px 12px 24px rgba(0,0,0,0.4), -12px -12px 24px rgba(255,255,255,0.15)'
shadow-glow-indigo: '0 0 20px rgba(75, 0, 130, 0.4)'
```

## 🏗️ Component Architecture Requirements

### 1. Base UI Components (Priority: CRITICAL)
Create in `src/components/ui/`:
- **Button.tsx** - All variants (primary, secondary, ghost, outline) with neumorphic styling
- **Card.tsx** - Container component with soft shadows and proper spacing
- **Input.tsx** - Form inputs with validation states and dark mode styling
- **Textarea.tsx** - Multi-line text input with character counting
- **Modal.tsx** - Overlay components for dialogs and forms
- **LoadingSpinner.tsx** - Loading indicators with brand colors
- **UserAvatar.tsx** - User avatars with verification badges and status indicators
- **ErrorBoundary.tsx** - Error handling component for graceful failures

### 2. Layout Components (Priority: HIGH)
Create in `src/components/layout/`:
- **SocialNetworkLayout.tsx** - Three-column Twitter-style layout
- **Sidebar.tsx** - Left navigation with user profile and menu items
- **TrendsPanel.tsx** - Right panel with trending topics and user suggestions
- **MobileNavigation.tsx** - Bottom tab bar for mobile devices
- **PublicHeader.tsx** - Header for unauthenticated users
- **PublicFooter.tsx** - Footer for landing page

### 3. Authentication Components (Priority: HIGH)
Create in `src/components/auth/`:
- **LoginFlow.tsx** - Internet Identity login with privacy mode selection
- **ProfileCreationFlow.tsx** - Multi-step profile setup wizard
- **AuthGuard.tsx** - Route protection and authentication flow management
- **OnboardingTour.tsx** - Welcome tour for new users

### 4. Social Network Components (Priority: HIGH)
Create in `src/components/social/`:
- **feed/FeedContainer.tsx** - Main feed with infinite scroll and virtualization
- **feed/PostCard.tsx** - Individual post display with interactions
- **feed/PostComposer.tsx** - Post creation form with media upload
- **interactions/LikeButton.tsx** - Animated like button with optimistic updates
- **interactions/CommentSection.tsx** - Comment thread display and creation
- **interactions/FollowButton.tsx** - Follow/unfollow with user relationship status
- **profile/UserProfile.tsx** - Complete user profile display
- **creator/TipButton.tsx** - ICP tipping interface with modal
- **creator/CreatorDashboard.tsx** - Analytics and monetization dashboard

### 5. Landing Page Enhancement (Priority: MEDIUM)
Enhance existing landing page:
- **HeroSection.tsx** - Hero with deCentra mission and CTA
- **FeaturesSection.tsx** - Key features showcase
- **SecuritySection.tsx** - Privacy and security emphasis
- **CallToActionSection.tsx** - Sign-up encouragement

## 🔧 Implementation Strategy

### Phase 1: Foundation (Week 1)
1. **Update Tailwind configuration** ✅ (Already done)
2. **Create base UI components** (Button, Card, Input, Modal, etc.)
3. **Implement layout architecture** (SocialNetworkLayout, Sidebar, TrendsPanel)
4. **Set up authentication flow** (LoginFlow, AuthGuard, ProfileCreation)

### Phase 2: Core Social Features (Week 2)
1. **Build feed components** (FeedContainer, PostCard, PostComposer)
2. **Implement social interactions** (Like, Comment, Follow, Share)
3. **Create user profile system** (Profile display, editing, stats)
4. **Add mobile responsiveness** (MobileNavigation, responsive layouts)

### Phase 3: Advanced Features (Week 3)
1. **Creator monetization** (TipButton, CreatorDashboard, analytics)
2. **Enhanced discovery** (Search, trending topics, user suggestions)
3. **Privacy features** (Anonymous mode, whistleblower protection)
4. **Performance optimization** (Virtualization, lazy loading, caching)

### Phase 4: Polish & Testing (Week 4)
1. **Accessibility implementation** (ARIA labels, keyboard navigation)
2. **Error handling** (Error boundaries, fallback states)
3. **Animation enhancements** (Smooth transitions, micro-interactions)
4. **Performance testing** (Bundle optimization, load testing)

## 📱 Responsive Design Requirements

### Mobile-First Approach
```typescript
// Responsive breakpoints (already configured)
sm: '640px',   // Mobile landscape
md: '768px',   // Tablet
lg: '1024px',  // Desktop
xl: '1280px',  // Large desktop

// Layout adaptations
- Mobile: Single column with bottom navigation
- Tablet: Two columns (main + one sidebar)
- Desktop: Three columns (sidebar + main + trends)
```

### Component Responsiveness
- **Sidebar**: Hidden on mobile, slide-out drawer on tablet, fixed on desktop
- **TrendsPanel**: Hidden on mobile/tablet, visible on desktop
- **PostCard**: Full width on mobile, constrained on desktop
- **Navigation**: Bottom tabs on mobile, sidebar on desktop

## 🎨 Component Styling Guidelines

### Consistent Visual Patterns
```typescript
// Card component example
<Card className="p-4 bg-dark-background-secondary shadow-soft hover:shadow-medium transition-shadow duration-200">
  {children}
</Card>

// Button component example  
<Button 
  variant="primary" 
  size="md"
  className="shadow-glow-indigo hover:shadow-glow-blue transition-all duration-200"
>
  {children}
</Button>

// Interactive element hover states
hover:shadow-medium hover:bg-opacity-90 transition-all duration-200
```

### Accessibility Requirements
```typescript
// ARIA labels for all interactive elements
aria-label="Like post. 5 likes"
aria-pressed={isLiked}
role="button"
tabIndex={0}

// Keyboard navigation support
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleClick();
  }
}}

// Focus indicators
focus:ring-2 focus:ring-electric-blue focus:ring-offset-2 focus:ring-offset-dark-background-primary
```

## 🔐 Security & Privacy Implementation

### Data Protection Patterns
```typescript
// Secure content rendering
const sanitizeContent = (content: string) => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
    ALLOWED_ATTR: [],
  });
};

// Privacy mode handling
const enableAnonymousMode = () => {
  // Clear tracking data
  localStorage.removeItem('user_analytics');
  sessionStorage.clear();
  
  // Disable user identification
  setAnonymousMode(true);
};
```

### Input Validation
```typescript
// Content validation
const validatePostContent = (content: string): ValidationResult => {
  if (!content.trim()) {
    return { isValid: false, error: 'Content cannot be empty' };
  }
  
  if (content.length > 10000) {
    return { isValid: false, error: 'Content too long (max 10,000 characters)' };
  }
  
  // Check for potentially harmful content
  if (containsPotentialXSS(content)) {
    return { isValid: false, error: 'Content contains invalid characters' };
  }
  
  return { isValid: true };
};
```

## ⚡ Performance Requirements

### Optimization Strategies
```typescript
// Component memoization
export const PostCard = React.memo(function PostCard({ post, onUpdate }) {
  // Component implementation
});

// Virtualization for large lists
import { FixedSizeList as VirtualList } from 'react-window';

// Lazy loading for images
<img 
  src={imageUrl} 
  loading="lazy" 
  className="w-full h-48 object-cover"
  alt={altText}
/>

// Code splitting for routes
const CreatorDashboard = lazy(() => import('./components/creator/CreatorDashboard'));
```

### Caching Strategy
```typescript
// React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Infinite scroll with caching
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['feed', feedType],
  queryFn: ({ pageParam = 0 }) => fetchFeed(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});
```

## 🧪 Testing Requirements

### Component Testing
```typescript
// Test component rendering and interactions
describe('PostCard', () => {
  it('renders post content correctly', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText(mockPost.content)).toBeInTheDocument();
  });
  
  it('handles like interaction', async () => {
    const user = userEvent.setup();
    render(<PostCard post={mockPost} />);
    
    const likeButton = screen.getByRole('button', { name: /like/i });
    await user.click(likeButton);
    
    expect(mockLikeFunction).toHaveBeenCalledWith(mockPost.id);
  });
});
```

### Accessibility Testing
```typescript
// Test keyboard navigation and screen reader support
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should not have accessibility violations', async () => {
  const { container } = render(<PostCard post={mockPost} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 📋 Implementation Checklist

### ✅ Foundation Components
- [ ] Button component with all variants and states
- [ ] Card component with neumorphic styling  
- [ ] Input/Textarea with validation
- [ ] Modal/Dialog system
- [ ] Loading and error states
- [ ] User avatar with verification badges

### ✅ Layout Architecture
- [ ] Three-column responsive layout
- [ ] Sidebar navigation with user profile
- [ ] Trends/discovery right panel
- [ ] Mobile bottom navigation
- [ ] Route-based layout switching

### ✅ Authentication Flow
- [ ] Internet Identity integration
- [ ] Multi-step profile creation
- [ ] Privacy mode selection
- [ ] Session management
- [ ] Route protection

### ✅ Social Features
- [ ] Infinite scroll feed with virtualization
- [ ] Post creation with media upload
- [ ] Like/comment/share interactions
- [ ] User profiles and following
- [ ] Search and discovery

### ✅ Creator Monetization
- [ ] ICP tipping system
- [ ] Creator dashboard with analytics
- [ ] Subscription management
- [ ] Revenue tracking

### ✅ Accessibility & Performance
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Performance optimization
- [ ] Error boundaries

## 🎯 Success Metrics

### User Experience Goals
- **Load time**: Initial page load < 3 seconds
- **Interaction**: UI response time < 100ms
- **Accessibility**: 100% WCAG 2.1 AA compliance
- **Performance**: Lighthouse score > 90
- **Mobile**: Responsive design on all screen sizes

### Technical Goals
- **Code coverage**: > 80% test coverage
- **Bundle size**: < 500KB gzipped
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Error rate**: < 1% component error rate

This comprehensive instruction set provides AI agents with everything needed to transform deCentra's frontend into a sophisticated, accessible, and privacy-focused social network that rivals modern platforms while maintaining the project's core values of decentralization and user empowerment.
