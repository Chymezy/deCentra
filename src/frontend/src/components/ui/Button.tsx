import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Button variant styles using class-variance-authority for type safety
const buttonVariants = cva(
  // Base styles - neumorphic design foundation
  `
    relative inline-flex items-center justify-center font-medium
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-background-primary
    disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
    active:transform active:scale-95
  `,
  {
    variants: {
      variant: {
        // Primary variant with deep indigo and glow effect
        primary: `
          bg-deep-indigo text-white shadow-soft
          hover:shadow-glow-indigo hover:bg-opacity-90
          focus:ring-deep-indigo
          active:shadow-soft-inset
        `,
        // Secondary variant with electric blue
        secondary: `
          bg-electric-blue text-white shadow-soft
          hover:shadow-glow-blue hover:bg-opacity-90
          focus:ring-electric-blue
          active:shadow-soft-inset
        `,
        // Ghost variant for subtle actions
        ghost: `
          bg-transparent text-dark-text-primary border border-dark-border-subtle
          hover:bg-dark-background-tertiary hover:text-electric-blue hover:border-electric-blue
          focus:ring-electric-blue
          active:bg-dark-background-secondary
        `,
        // Outline variant for secondary actions
        outline: `
          bg-transparent text-dark-text-secondary border border-dark-border-default
          hover:border-electric-blue hover:text-electric-blue hover:shadow-soft
          focus:ring-electric-blue
          active:bg-dark-background-tertiary
        `,
        // Destructive variant for dangerous actions
        destructive: `
          bg-red-600 text-white shadow-soft
          hover:bg-red-700 hover:shadow-medium
          focus:ring-red-500
          active:shadow-soft-inset
        `,
        // Link variant for text-like buttons
        link: `
          bg-transparent text-electric-blue underline-offset-4
          hover:underline hover:text-electric-blue
          focus:ring-electric-blue
          active:text-deep-indigo
        `,
      },
      size: {
        xs: 'px-2.5 py-1.5 text-xs rounded-md min-h-[28px]',
        sm: 'px-3 py-2 text-sm rounded-md min-h-[32px]',
        md: 'px-4 py-2.5 text-body-md rounded-lg min-h-[40px]',
        lg: 'px-5 py-3 text-body-lg rounded-lg min-h-[44px]',
        xl: 'px-6 py-3.5 text-body-xl rounded-xl min-h-[48px]',
        icon: 'h-10 w-10 rounded-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  // Loading state with spinner
  loading?: boolean;
  // Icon components
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  // Accessibility
  'aria-label'?: string;
  'data-testid'?: string;
}

/**
 * Button component with neumorphic styling and comprehensive accessibility support.
 * 
 * Features:
 * - Neumorphic design with soft shadows and hover effects
 * - Multiple variants (primary, secondary, ghost, outline, destructive, link)
 * - Loading state with spinner
 * - Icon support (left/right)
 * - Full accessibility compliance (WCAG 2.1 AA)
 * - Type-safe variants with class-variance-authority
 * 
 * @example
 * <Button variant="primary" size="md" leftIcon={<PlusIcon />} loading={isSubmitting}>
 *   Create Post
 * </Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      disabled,
      children,
      leftIcon,
      rightIcon,
      'aria-label': ariaLabel,
      'data-testid': testId,
      onClick,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      // Enhanced keyboard accessibility
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isDisabled) {
          onClick?.(e as unknown as React.MouseEvent<HTMLButtonElement>);
        }
      }
    };

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={isDisabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        aria-disabled={isDisabled}
        data-testid={testId}
        {...props}
      >
        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Button Content */}
        <div 
          className={cn(
            'flex items-center justify-center gap-2',
            loading && 'opacity-0'
          )}
        >
          {leftIcon && (
            <span className="flex-shrink-0" aria-hidden="true">
              {leftIcon}
            </span>
          )}
          
          {children && <span className="truncate">{children}</span>}
          
          {rightIcon && (
            <span className="flex-shrink-0" aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </div>
      </button>
    );
  }
);

Button.displayName = 'Button';

// Export button variants for external use
export { buttonVariants };
