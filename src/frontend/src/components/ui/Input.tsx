'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Input component variants using CVA for consistent styling
 * Implements neumorphic design principles with proper focus states
 */
const inputVariants = cva(
  'flex w-full rounded-lg border bg-privacy-dark transition-all duration-200 ease-in-out placeholder:text-privacy-text-muted focus:outline-none focus:ring-2 focus:ring-privacy-accent/50 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-privacy-border/40 shadow-neumorphic-inset focus:shadow-neumorphic-raised',
        ghost: 'border-transparent bg-transparent hover:bg-privacy-muted/20 focus:bg-privacy-dark focus:border-privacy-border/40',
        filled: 'border-privacy-border/60 bg-privacy-muted/20 focus:bg-privacy-dark',
        outline: 'border-privacy-border bg-transparent hover:border-privacy-accent/50',
      },
      size: {
        sm: 'h-8 px-3 py-1 text-sm',
        default: 'h-10 px-3 py-2',
        lg: 'h-12 px-4 py-3 text-lg',
      },
      state: {
        default: '',
        error: 'border-privacy-danger focus:ring-privacy-danger/50',
        success: 'border-privacy-success focus:ring-privacy-success/50',
        warning: 'border-privacy-warning focus:ring-privacy-warning/50',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      state: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /**
   * Label for the input field
   */
  label?: string;
  /**
   * Helper text or error message
   */
  helperText?: string;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Icon to display at the start of the input
   */
  startIcon?: React.ReactNode;
  /**
   * Icon to display at the end of the input
   */
  endIcon?: React.ReactNode;
  /**
   * Whether to show character count
   */
  showCharCount?: boolean;
  /**
   * Maximum character length
   */
  maxLength?: number;
}

/**
 * Input component following deCentra design system
 * Implements neumorphic styling with accessibility features
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      state,
      label,
      helperText,
      required,
      startIcon,
      endIcon,
      showCharCount,
      maxLength,
      value,
      id,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const helperTextId = `${inputId}-helper`;
    const charCountId = `${inputId}-char-count`;
    
    const currentLength = typeof value === 'string' ? value.length : 0;

    const describedBy = [
      helperText && helperTextId,
      showCharCount && charCountId,
      ariaDescribedBy,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="space-y-2 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-privacy-text leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {required && <span className="text-privacy-danger ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-privacy-text-muted">
              {startIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={cn(
              inputVariants({ variant, size, state }),
              startIcon && 'pl-10',
              endIcon && 'pr-10',
              className
            )}
            value={value}
            maxLength={maxLength}
            aria-describedby={describedBy || undefined}
            aria-invalid={state === 'error'}
            aria-required={required}
            {...props}
          />
          
          {endIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-privacy-text-muted">
              {endIcon}
            </div>
          )}
        </div>

        <div className="flex justify-between items-start">
          {helperText && (
            <p
              id={helperTextId}
              className={cn(
                'text-xs leading-relaxed',
                state === 'error' && 'text-privacy-danger',
                state === 'success' && 'text-privacy-success',
                state === 'warning' && 'text-privacy-warning',
                state === 'default' && 'text-privacy-text-muted'
              )}
            >
              {helperText}
            </p>
          )}
          
          {showCharCount && maxLength && (
            <span
              id={charCountId}
              className={cn(
                'text-xs text-privacy-text-muted',
                currentLength > maxLength * 0.9 && 'text-privacy-warning',
                currentLength >= maxLength && 'text-privacy-danger'
              )}
            >
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Textarea component variants using CVA for consistent styling
 */
const textareaVariants = cva(
  'flex w-full rounded-lg border bg-privacy-dark transition-all duration-200 ease-in-out placeholder:text-privacy-text-muted focus:outline-none focus:ring-2 focus:ring-privacy-accent/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
  {
    variants: {
      variant: {
        default: 'border-privacy-border/40 shadow-neumorphic-inset focus:shadow-neumorphic-raised',
        ghost: 'border-transparent bg-transparent hover:bg-privacy-muted/20 focus:bg-privacy-dark focus:border-privacy-border/40',
        filled: 'border-privacy-border/60 bg-privacy-muted/20 focus:bg-privacy-dark',
        outline: 'border-privacy-border bg-transparent hover:border-privacy-accent/50',
      },
      size: {
        sm: 'px-3 py-2 text-sm min-h-[80px]',
        default: 'px-3 py-2 min-h-[100px]',
        lg: 'px-4 py-3 text-lg min-h-[120px]',
      },
      state: {
        default: '',
        error: 'border-privacy-danger focus:ring-privacy-danger/50',
        success: 'border-privacy-success focus:ring-privacy-success/50',
        warning: 'border-privacy-warning focus:ring-privacy-warning/50',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      state: 'default',
    },
  }
);

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  /**
   * Label for the textarea field
   */
  label?: string;
  /**
   * Helper text or error message
   */
  helperText?: string;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Whether to show character count
   */
  showCharCount?: boolean;
  /**
   * Maximum character length
   */
  maxLength?: number;
  /**
   * Whether to auto-resize based on content
   */
  autoResize?: boolean;
}

/**
 * Textarea component following deCentra design system
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      size,
      state,
      label,
      helperText,
      required,
      showCharCount,
      maxLength,
      autoResize,
      value,
      id,
      onChange,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const helperTextId = `${inputId}-helper`;
    const charCountId = `${inputId}-char-count`;
    
    const currentLength = typeof value === 'string' ? value.length : 0;

    // Auto-resize functionality
    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [value, autoResize]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(event);
      
      if (autoResize) {
        const textarea = event.target;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };

    const describedBy = [
      helperText && helperTextId,
      showCharCount && charCountId,
      ariaDescribedBy,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="space-y-2 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-privacy-text leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {required && <span className="text-privacy-danger ml-1">*</span>}
          </label>
        )}
        
        <textarea
          ref={(node) => {
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
            textareaRef.current = node;
          }}
          id={inputId}
          className={cn(
            textareaVariants({ variant, size, state }),
            autoResize && 'overflow-hidden',
            className
          )}
          value={value}
          maxLength={maxLength}
          onChange={handleChange}
          aria-describedby={describedBy || undefined}
          aria-invalid={state === 'error'}
          aria-required={required}
          {...props}
        />

        <div className="flex justify-between items-start">
          {helperText && (
            <p
              id={helperTextId}
              className={cn(
                'text-xs leading-relaxed',
                state === 'error' && 'text-privacy-danger',
                state === 'success' && 'text-privacy-success',
                state === 'warning' && 'text-privacy-warning',
                state === 'default' && 'text-privacy-text-muted'
              )}
            >
              {helperText}
            </p>
          )}
          
          {showCharCount && maxLength && (
            <span
              id={charCountId}
              className={cn(
                'text-xs text-privacy-text-muted',
                currentLength > maxLength * 0.9 && 'text-privacy-warning',
                currentLength >= maxLength && 'text-privacy-danger'
              )}
            >
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Input, Textarea, inputVariants, textareaVariants };
