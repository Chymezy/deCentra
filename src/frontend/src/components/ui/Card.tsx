'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Card component variants using CVA for consistent styling
 * Implements neumorphic design principles with proper spacing and shadows
 */
const cardVariants = cva(
  'rounded-xl transition-all duration-300 ease-in-out border border-privacy-border/20',
  {
    variants: {
      variant: {
        default: 'bg-privacy-dark shadow-neumorphic-inset',
        elevated:
          'bg-privacy-dark shadow-neumorphic-raised hover:shadow-neumorphic-raised-hover',
        interactive:
          'bg-privacy-dark shadow-neumorphic-inset hover:shadow-neumorphic-raised cursor-pointer',
        flat: 'bg-privacy-dark border-privacy-border/40',
        ghost: 'bg-transparent border-transparent hover:bg-privacy-muted/50',
        // Glassmorphism variants
        glass: 'glass-card backdrop-blur-xl',
        'glass-subtle': `
          bg-gradient-to-br from-glass-dark to-glass-darker backdrop-blur-2xl
          border border-glass-border shadow-glass-soft
          hover:border-glass-border-strong hover:shadow-glass-medium
          transition-all duration-300
        `,
        'glass-elevated': `
          bg-gradient-to-br from-glass-light to-glass-dark backdrop-blur-3xl
          border border-glass-border-strong shadow-glass-strong
          hover:shadow-glass-glow hover:border-indigo-400/30
          transition-all duration-500
        `,
        'glass-interactive': `
          glass-card backdrop-blur-xl cursor-pointer
          hover:bg-gradient-to-br hover:from-indigo-900/10 hover:to-blue-900/10
          hover:border-indigo-400/30 hover:shadow-glass-glow
          active:scale-[0.98] transition-all duration-300
        `,
        // Enhanced glassmorphism variants for social media components
        'glass-social': `
          glass-social-card backdrop-blur-2xl border-social-border
          hover:border-social-hover hover:shadow-glass-glow hover:-translate-y-1
          transition-all duration-300 ease-out
        `,
        'glass-premium': `
          bg-gradient-to-br from-glass-light/90 to-glass-dark/95 backdrop-blur-3xl
          border border-glass-border-accent shadow-glass-strong
          hover:from-glass-light/95 hover:to-glass-dark/98 hover:border-indigo-400/40
          hover:shadow-glass-glow hover:transform hover:scale-[1.01]
          transition-all duration-500 ease-out
        `,
        'glass-post': `
          glass-social-card backdrop-blur-xl border-social-border
          hover:border-social-hover hover:shadow-glass-soft hover:bg-social-glass/90
          focus-within:border-indigo-400/30 focus-within:shadow-glass-glow
          transition-all duration-300 ease-out
        `,
        'glass-nav': `
          glass-nav-enhanced backdrop-blur-2xl border-glass-border
          hover:border-glass-border-strong hover:bg-gradient-to-r hover:from-glass-darker/80 hover:to-glass-dark/85
          transition-all duration-200 ease-out
        `,
        'glass-floating': `
          bg-gradient-to-br from-glass-light/70 to-glass-dark/80 backdrop-blur-2xl
          border border-glass-border shadow-glass-medium animate-float-slow
          hover:shadow-glass-glow hover:border-glass-border-accent
          transition-all duration-400 ease-out
        `,
      },
      size: {
        sm: 'p-3',
        default: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      },
      spacing: {
        none: 'space-y-0',
        sm: 'space-y-2',
        default: 'space-y-3',
        lg: 'space-y-4',
        xl: 'space-y-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      spacing: 'default',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * Whether the card should be focusable for keyboard navigation
   */
  focusable?: boolean;
  /**
   * Whether the card represents loading state
   */
  loading?: boolean;
  /**
   * ARIA label for accessibility
   */
  'aria-label'?: string;
  /**
   * Role for accessibility (defaults to 'article' for content cards)
   */
  role?: string;
}

/**
 * Card component following deCentra design system
 * Implements neumorphic styling with accessibility features
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      size,
      spacing,
      focusable = false,
      loading = false,
      children,
      role = 'article',
      tabIndex,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (focusable && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        // Trigger click event for keyboard users
        (event.currentTarget as HTMLDivElement).click();
      }
      onKeyDown?.(event);
    };

    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, size, spacing }),
          focusable &&
            'focus:outline-none focus:ring-2 focus:ring-privacy-accent/50',
          loading && 'animate-pulse cursor-wait opacity-70',
          className
        )}
        role={role}
        tabIndex={focusable ? (tabIndex ?? 0) : tabIndex}
        onKeyDown={focusable ? handleKeyDown : onKeyDown}
        {...props}
      >
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-privacy-muted/30 rounded animate-pulse" />
            <div className="h-4 bg-privacy-muted/30 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-privacy-muted/30 rounded w-1/2 animate-pulse" />
          </div>
        ) : (
          children
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card Header component for consistent card headers
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-3', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

/**
 * Card Title component with proper typography
 */
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  }
>(({ className, as: Component = 'h3', ...props }, ref) => (
  <Component
    ref={ref as React.Ref<HTMLHeadingElement>}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight text-privacy-text',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

/**
 * Card Description component with muted text
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-privacy-text-muted leading-relaxed', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

/**
 * Card Content component for main content area
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

/**
 * Card Footer component for actions and metadata
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center pt-3 border-t border-privacy-border/20',
      className
    )}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
};
