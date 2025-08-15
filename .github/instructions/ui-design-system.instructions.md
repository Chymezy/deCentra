---
applyTo: "**/*.tsx,**/*.ts"
---

# UI/UX Design System Instructions for deCentra

## Design Philosophy

deCentra follows a **neumorphic dark-first design system** that prioritizes:
- **Privacy & Security**: Visual cues that reinforce trust and safety
- **Professional Elegance**: Clean, sophisticated interface for serious users
- **Accessibility First**: WCAG 2.1 AA compliance with high contrast
- **Performance Optimized**: Lightweight components with smooth interactions

## Visual Design Language

### Color System

```typescript
// deCentra Brand Colors (Tailwind CSS v4 compatible)
export const deCentraColors = {
  // Primary Palette
  brand: {
    'deep-indigo': '#4B0082',     // Headers, navigation, primary actions
    'electric-blue': '#0F62FE',   // Links, secondary actions, highlights
    'vibrant-orange': '#FF6F00',  // Notifications, warnings, CTAs
    'charcoal-black': '#1A1A1A',  // Text, borders, base UI
    'pure-white': '#FFFFFF',      // Backgrounds, content areas
  },
  
  // Semantic Colors
  semantic: {
    primary: '#4B0082',           // Main brand color
    secondary: '#0F62FE',         // Supporting actions
    accent: '#FF6F00',            // Emphasis and alerts
    success: '#10B981',           // Success states
    warning: '#F59E0B',           // Warning states
    error: '#EF4444',             // Error states
    info: '#3B82F6',              // Info states
  },
  
  // Grayscale for UI Components
  gray: {
    50: '#F9FAFB',   // Lightest backgrounds
    100: '#F3F4F6',  // Light backgrounds
    200: '#E5E7EB',  // Borders, dividers
    300: '#D1D5DB',  // Disabled text
    400: '#9CA3AF',  // Placeholder text
    500: '#6B7280',  // Secondary text
    600: '#4B5563',  // Primary text on light
    700: '#374151',  // Headings on light
    800: '#1F2937',  // Dark backgrounds
    900: '#111827',  // Darkest backgrounds
  },
  
  // Dark Mode Palette
  dark: {
    background: {
      primary: '#0F0F0F',    // Main background
      secondary: '#1A1A1A',  // Card/component backgrounds
      tertiary: '#2A2A2A',   // Elevated elements
    },
    text: {
      primary: '#FFFFFF',    // Main text
      secondary: '#B3B3B3',  // Secondary text
      tertiary: '#808080',   // Muted text
    },
    border: {
      subtle: '#333333',     // Subtle borders
      default: '#4A4A4A',    // Default borders
      strong: '#666666',     // Strong borders
    },
  },
};
```

### Typography System

```typescript
// Typography hierarchy for social network
export const typography = {
  fonts: {
    heading: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
    body: ['Roboto', 'Open Sans', 'system-ui', 'sans-serif'],
    code: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },
  
  // Scale based on modular scale (1.250 - Major Third)
  scale: {
    'display-2xl': '4.5rem',    // 72px - Hero headings
    'display-xl': '3.75rem',    // 60px - Page titles
    'display-lg': '3rem',       // 48px - Section titles
    'display-md': '2.25rem',    // 36px - Component titles
    'display-sm': '1.875rem',   // 30px - Card titles
    'heading-xl': '1.5rem',     // 24px - Large headings
    'heading-lg': '1.25rem',    // 20px - Medium headings
    'heading-md': '1.125rem',   // 18px - Small headings
    'body-xl': '1.25rem',       // 20px - Large body text
    'body-lg': '1.125rem',      // 18px - Default body text
    'body-md': '1rem',          // 16px - Small body text
    'body-sm': '0.875rem',      // 14px - Caption text
    'body-xs': '0.75rem',       // 12px - Fine print
  },
  
  // Line heights
  leading: {
    tight: '1.25',     // For headings
    normal: '1.5',     // For body text
    relaxed: '1.75',   // For long-form content
  },
  
  // Font weights
  weight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};
```

### Neumorphic Design System

```typescript
// Neumorphic shadows and effects
export const neumorphic = {
  shadows: {
    // Soft elevation for cards and components
    'soft': '4px 4px 8px rgba(0,0,0,0.25), -4px -4px 8px rgba(255,255,255,0.05)',
    'soft-inset': 'inset 4px 4px 8px rgba(0,0,0,0.25), inset -4px -4px 8px rgba(255,255,255,0.05)',
    
    // Medium elevation for interactive elements
    'medium': '8px 8px 16px rgba(0,0,0,0.3), -8px -8px 16px rgba(255,255,255,0.1)',
    'medium-inset': 'inset 8px 8px 16px rgba(0,0,0,0.3), inset -8px -8px 16px rgba(255,255,255,0.1)',
    
    // Strong elevation for modals and overlays
    'strong': '12px 12px 24px rgba(0,0,0,0.4), -12px -12px 24px rgba(255,255,255,0.15)',
    
    // Glowing effects for brand elements
    'glow-indigo': '0 0 20px rgba(75, 0, 130, 0.4)',
    'glow-blue': '0 0 20px rgba(15, 98, 254, 0.4)',
    'glow-orange': '0 0 20px rgba(255, 111, 0, 0.4)',
  },
  
  // Border radius for consistent curves
  radius: {
    'xs': '0.125rem',   // 2px
    'sm': '0.25rem',    // 4px
    'md': '0.375rem',   // 6px
    'lg': '0.5rem',     // 8px
    'xl': '0.75rem',    // 12px
    '2xl': '1rem',      // 16px
    '3xl': '1.5rem',    // 24px
    'full': '9999px',   // Full circle
  },
  
  // Spacing scale (8px base unit)
  spacing: {
    'px': '1px',
    '0': '0',
    '0.5': '0.125rem',  // 2px
    '1': '0.25rem',     // 4px
    '1.5': '0.375rem',  // 6px
    '2': '0.5rem',      // 8px
    '2.5': '0.625rem',  // 10px
    '3': '0.75rem',     // 12px
    '3.5': '0.875rem',  // 14px
    '4': '1rem',        // 16px
    '5': '1.25rem',     // 20px
    '6': '1.5rem',      // 24px
    '7': '1.75rem',     // 28px
    '8': '2rem',        // 32px
    '9': '2.25rem',     // 36px
    '10': '2.5rem',     // 40px
    '12': '3rem',       // 48px
    '16': '4rem',       // 64px
    '20': '5rem',       // 80px
    '24': '6rem',       // 96px
    '32': '8rem',       // 128px
  },
};
```

## Component Architecture Patterns

### Base Component Structure

```typescript
// Base props interface for all deCentra components
interface BaseDeCentraComponentProps {
  className?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  'data-testid'?: string;
}

// Example: Button component with neumorphic styling
interface ButtonProps extends BaseDeCentraComponentProps {
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  leftIcon,
  rightIcon,
  fullWidth = false,
  'data-testid': testId,
}: ButtonProps) {
  const baseClasses = `
    relative inline-flex items-center justify-center font-medium
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;
  
  const variantClasses = {
    primary: `
      bg-deep-indigo text-white shadow-soft
      hover:shadow-medium hover:bg-opacity-90
      focus:ring-deep-indigo
      active:shadow-soft-inset
    `,
    secondary: `
      bg-electric-blue text-white shadow-soft
      hover:shadow-medium hover:bg-opacity-90
      focus:ring-electric-blue
      active:shadow-soft-inset
    `,
    ghost: `
      bg-transparent text-deep-indigo border border-deep-indigo
      hover:bg-deep-indigo hover:text-white
      focus:ring-deep-indigo
    `,
    outline: `
      bg-transparent text-charcoal-black border border-gray-300
      hover:border-deep-indigo hover:text-deep-indigo
      focus:ring-deep-indigo
    `,
  };
  
  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs rounded-md',
    sm: 'px-3 py-2 text-sm rounded-md',
    md: 'px-4 py-2.5 text-body-md rounded-lg',
    lg: 'px-5 py-3 text-body-lg rounded-lg',
    xl: 'px-6 py-3.5 text-body-xl rounded-xl',
  };
  
  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `;
  
  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      data-testid={testId}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <div className={`flex items-center gap-2 ${loading ? 'opacity-0' : ''}`}>
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </div>
    </button>
  );
}
```

### Layout Components

```typescript
// Three-column layout for social network
export function SocialNetworkLayout({
  children,
  sidebar,
  rightPanel,
  className = '',
}: {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  rightPanel?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-h-screen bg-dark-background-primary ${className}`}>
      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar */}
        {sidebar && (
          <aside className="hidden lg:block w-64 fixed h-full">
            <div className="p-4 h-full overflow-y-auto">
              {sidebar}
            </div>
          </aside>
        )}
        
        {/* Main Content */}
        <main className={`flex-1 ${sidebar ? 'lg:ml-64' : ''} ${rightPanel ? 'lg:mr-80' : ''}`}>
          <div className="max-w-2xl mx-auto border-x border-dark-border-subtle min-h-screen">
            {children}
          </div>
        </main>
        
        {/* Right Panel */}
        {rightPanel && (
          <aside className="hidden lg:block w-80 fixed right-0 h-full">
            <div className="p-4 h-full overflow-y-auto">
              {rightPanel}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
```

## Animation & Interaction Guidelines

```typescript
// Animation utilities for smooth interactions
export const animations = {
  // Entrance animations
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  scaleIn: 'animate-scale-in',
  
  // Interaction animations
  bounce: 'animate-bounce',
  pulse: 'animate-pulse-slow',
  wiggle: 'animate-wiggle',
  
  // Loading animations
  spin: 'animate-spin',
  ping: 'animate-ping',
  
  // Hover effects
  hoverLift: 'hover:transform hover:-translate-y-1 hover:shadow-medium transition-all duration-200',
  hoverGlow: 'hover:shadow-glow-indigo transition-shadow duration-300',
  hoverScale: 'hover:scale-105 transition-transform duration-200',
};

// Micro-interactions for social features
export const microInteractions = {
  // Like button animation
  likeButton: 'active:scale-90 transition-transform duration-100',
  
  // Follow button animation
  followButton: 'hover:scale-105 active:scale-95 transition-transform duration-150',
  
  // Post card hover
  postCard: 'hover:shadow-soft-medium transition-shadow duration-200',
  
  // Navigation item hover
  navItem: 'hover:bg-dark-background-tertiary hover:text-electric-blue transition-colors duration-200',
};
```

## Responsive Design Patterns

```typescript
// Responsive breakpoints
export const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
};

// Mobile-first responsive utilities
export const responsive = {
  // Hide/show based on screen size
  mobileOnly: 'block sm:hidden',
  tabletUp: 'hidden sm:block',
  desktopUp: 'hidden lg:block',
  
  // Layout adjustments
  mobileStack: 'flex flex-col sm:flex-row',
  mobileCenter: 'text-center sm:text-left',
  mobileFull: 'w-full sm:w-auto',
  
  // Typography scaling
  headingResponsive: 'text-display-sm md:text-display-md lg:text-display-lg',
  bodyResponsive: 'text-body-sm md:text-body-md lg:text-body-lg',
};
```

## Accessibility Implementation

```typescript
// ARIA helpers for social network features
export const aria = {
  // Post interactions
  likeButton: (isLiked: boolean, count: number) => ({
    'aria-label': `${isLiked ? 'Unlike' : 'Like'} post. ${count} likes`,
    'aria-pressed': isLiked,
  }),
  
  // Follow button
  followButton: (isFollowing: boolean, username: string) => ({
    'aria-label': `${isFollowing ? 'Unfollow' : 'Follow'} ${username}`,
    'aria-pressed': isFollowing,
  }),
  
  // Navigation
  currentPage: (pageName: string) => ({
    'aria-current': 'page',
    'aria-label': `${pageName} (current page)`,
  }),
  
  // Modals and dialogs
  modal: (title: string) => ({
    role: 'dialog',
    'aria-labelledby': 'modal-title',
    'aria-describedby': 'modal-description',
    'aria-modal': true,
  }),
};

// Keyboard navigation utilities
export const keyboardNav = {
  // Standard navigation keys
  handleArrowKeys: (event: KeyboardEvent, items: HTMLElement[]) => {
    const { key } = event;
    const currentIndex = items.findIndex(item => item === document.activeElement);
    
    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % items.length;
        items[nextIndex]?.focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        items[prevIndex]?.focus();
        break;
    }
  },
  
  // Escape key handler
  handleEscape: (callback: () => void) => (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      callback();
    }
  },
};
```

## Implementation Guidelines

### Component Development Rules
1. **Always use TypeScript** with proper interface definitions
2. **Follow neumorphic design patterns** with consistent shadows and spacing
3. **Implement dark mode first** with light mode as secondary
4. **Include accessibility attributes** for all interactive elements
5. **Use semantic HTML** with proper ARIA labels
6. **Optimize for performance** with React.memo and proper dependencies
7. **Include loading and error states** for all data-dependent components
8. **Follow responsive design patterns** with mobile-first approach
9. **Use consistent animation patterns** for smooth user experience
10. **Include comprehensive prop interfaces** with proper documentation

### Testing Requirements
- **Visual regression tests** for design consistency
- **Accessibility tests** with @testing-library/jest-dom
- **Interaction tests** for all user flows
- **Responsive tests** across different screen sizes
- **Performance tests** for component rendering

### File Organization
```
src/components/
├── ui/                    # Base UI components (Button, Input, etc.)
├── layout/               # Layout components (Sidebar, Header, etc.)
├── social/               # Social-specific components (PostCard, Profile, etc.)
├── forms/                # Form components (LoginForm, PostComposer, etc.)
├── navigation/           # Navigation components (NavBar, Breadcrumbs, etc.)
└── feedback/             # Feedback components (Toast, Modal, Alert, etc.)
```

This design system provides the foundation for creating a cohesive, accessible, and professional social network interface that aligns with deCentra's mission of privacy, security, and user empowerment.
