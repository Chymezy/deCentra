'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Loading spinner variants using CVA for consistent styling
 */
const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-solid border-current border-r-transparent',
  {
    variants: {
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        default: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
        '2xl': 'h-16 w-16',
      },
      variant: {
        default: 'text-privacy-accent',
        muted: 'text-privacy-text-muted',
        primary: 'text-privacy-primary',
        secondary: 'text-privacy-secondary',
        success: 'text-privacy-success',
        warning: 'text-privacy-warning',
        danger: 'text-privacy-danger',
        white: 'text-white',
      },
      thickness: {
        thin: 'border-[1px]',
        default: 'border-2',
        thick: 'border-[3px]',
        'extra-thick': 'border-4',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
      thickness: 'default',
    },
  }
);

/**
 * Pulsing dot variants for alternative loading style
 */
const pulseVariants = cva('inline-flex space-x-1', {
  variants: {
    size: {
      xs: 'space-x-0.5',
      sm: 'space-x-1',
      default: 'space-x-1.5',
      lg: 'space-x-2',
      xl: 'space-x-2.5',
      '2xl': 'space-x-3',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const dotVariants = cva('rounded-full bg-current animate-pulse', {
  variants: {
    size: {
      xs: 'h-1 w-1',
      sm: 'h-1.5 w-1.5',
      default: 'h-2 w-2',
      lg: 'h-2.5 w-2.5',
      xl: 'h-3 w-3',
      '2xl': 'h-4 w-4',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /**
   * Loading text to display alongside spinner
   */
  text?: string;
  /**
   * Whether to show pulsing dots instead of spinner
   */
  type?: 'spinner' | 'dots' | 'bars';
  /**
   * Whether to center the spinner
   */
  center?: boolean;
  /**
   * Whether to show as overlay
   */
  overlay?: boolean;
  /**
   * Custom aria-label for accessibility
   */
  'aria-label'?: string;
}

/**
 * Loading spinner component following deCentra design system
 * Provides multiple loading animation types with accessibility features
 */
const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  (
    {
      className,
      size,
      variant,
      thickness,
      text,
      type = 'spinner',
      center = false,
      overlay = false,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const LoadingIcon = () => {
      switch (type) {
        case 'dots':
          return (
            <div className={cn(pulseVariants({ size }))}>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    dotVariants({ size }),
                    variant === 'default' && 'text-privacy-accent',
                    variant === 'muted' && 'text-privacy-text-muted',
                    variant === 'primary' && 'text-privacy-primary',
                    variant === 'secondary' && 'text-privacy-secondary',
                    variant === 'success' && 'text-privacy-success',
                    variant === 'warning' && 'text-privacy-warning',
                    variant === 'danger' && 'text-privacy-danger',
                    variant === 'white' && 'text-white'
                  )}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.6s',
                  }}
                />
              ))}
            </div>
          );

        case 'bars':
          return (
            <div className={cn(pulseVariants({ size }))}>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'bg-current animate-pulse',
                    size === 'xs' && 'h-3 w-0.5',
                    size === 'sm' && 'h-4 w-0.5',
                    size === 'default' && 'h-5 w-1',
                    size === 'lg' && 'h-6 w-1',
                    size === 'xl' && 'h-8 w-1.5',
                    size === '2xl' && 'h-10 w-2',
                    variant === 'default' && 'text-privacy-accent',
                    variant === 'muted' && 'text-privacy-text-muted',
                    variant === 'primary' && 'text-privacy-primary',
                    variant === 'secondary' && 'text-privacy-secondary',
                    variant === 'success' && 'text-privacy-success',
                    variant === 'warning' && 'text-privacy-warning',
                    variant === 'danger' && 'text-privacy-danger',
                    variant === 'white' && 'text-white'
                  )}
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: '0.8s',
                  }}
                />
              ))}
            </div>
          );

        default:
          return (
            <div
              className={cn(spinnerVariants({ size, variant, thickness }))}
              aria-hidden="true"
            />
          );
      }
    };

    const content = (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-2',
          center && 'justify-center w-full',
          className
        )}
        role="status"
        aria-label={ariaLabel || (text ? `Loading: ${text}` : 'Loading')}
        {...props}
      >
        <LoadingIcon />
        {text && (
          <span
            className={cn(
              'text-sm font-medium',
              variant === 'default' && 'text-privacy-text',
              variant === 'muted' && 'text-privacy-text-muted',
              variant === 'primary' && 'text-privacy-primary',
              variant === 'secondary' && 'text-privacy-secondary',
              variant === 'success' && 'text-privacy-success',
              variant === 'warning' && 'text-privacy-warning',
              variant === 'danger' && 'text-privacy-danger',
              variant === 'white' && 'text-white'
            )}
          >
            {text}
          </span>
        )}
        <span className="sr-only">Loading...</span>
      </div>
    );

    if (overlay) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-privacy-dark/80 backdrop-blur-sm">
          <div className="rounded-xl bg-privacy-dark p-6 shadow-neumorphic-raised border border-privacy-border/20">
            {content}
          </div>
        </div>
      );
    }

    return content;
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

/**
 * Page loading component for full-page loading states
 */
const PageLoader = React.forwardRef<
  HTMLDivElement,
  Omit<LoadingSpinnerProps, 'overlay'> & {
    /**
     * Minimum height for the loader container
     */
    minHeight?: string;
  }
>(({ minHeight = '50vh', className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-center w-full', className)}
    style={{ minHeight }}
  >
    <LoadingSpinner size="xl" center {...props} />
  </div>
));

PageLoader.displayName = 'PageLoader';

/**
 * Button loading component for inline button loading states
 */
const ButtonLoader = React.forwardRef<
  HTMLDivElement,
  Omit<LoadingSpinnerProps, 'size' | 'center'>
>(({ className, ...props }, ref) => (
  <LoadingSpinner
    ref={ref}
    size="sm"
    className={cn('mr-2', className)}
    {...props}
  />
));

ButtonLoader.displayName = 'ButtonLoader';

export {
  LoadingSpinner,
  PageLoader,
  ButtonLoader,
  spinnerVariants,
  pulseVariants,
  dotVariants,
};
