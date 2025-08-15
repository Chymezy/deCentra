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
        elevated: 'bg-privacy-dark shadow-neumorphic-raised hover:shadow-neumorphic-raised-hover',
        interactive: 'bg-privacy-dark shadow-neumorphic-inset hover:shadow-neumorphic-raised cursor-pointer',
        flat: 'bg-privacy-dark border-privacy-border/40',
        ghost: 'bg-transparent border-transparent hover:bg-privacy-muted/50',
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
          focusable && 'focus:outline-none focus:ring-2 focus:ring-privacy-accent/50',
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
  <div
    ref={ref}
    className={cn('pt-0', className)}
    {...props}
  />
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
    className={cn('flex items-center pt-3 border-t border-privacy-border/20', className)}
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
