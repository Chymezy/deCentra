'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button } from './Button';

/**
 * Modal overlay variants using CVA
 */
const overlayVariants = cva(
  'fixed inset-0 z-50 bg-privacy-dark/80 backdrop-blur-sm transition-all duration-300',
  {
    variants: {
      state: {
        open: 'opacity-100',
        closed: 'opacity-0 pointer-events-none',
      },
      overlayStyle: {
        default: 'bg-privacy-dark/80 backdrop-blur-sm',
        glass: 'bg-gray-950/60 backdrop-blur-xl',
        'glass-heavy': 'bg-gray-950/40 backdrop-blur-3xl',
      },
    },
    defaultVariants: {
      state: 'closed',
      overlayStyle: 'default',
    },
  }
);

/**
 * Modal content variants using CVA
 */
const contentVariants = cva(
  'fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 transition-all duration-300 border border-privacy-border/20 bg-privacy-dark shadow-neumorphic-raised rounded-xl',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        default: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        full: 'max-w-[95vw] max-h-[95vh]',
      },
      state: {
        open: 'opacity-100 scale-100',
        closed: 'opacity-0 scale-95 pointer-events-none',
      },
      variant: {
        default: 'bg-privacy-dark shadow-neumorphic-raised border-privacy-border/20',
        glass: `
          glass-modal backdrop-blur-3xl
          border-glass-border-strong shadow-glass-strong
        `,
        'glass-subtle': `
          bg-gradient-to-br from-glass-dark to-glass-darker backdrop-blur-2xl
          border border-glass-border shadow-glass-medium
        `,
        'glass-elevated': `
          bg-gradient-to-br from-glass-light/80 to-glass-dark/90 backdrop-blur-3xl
          border border-glass-border-strong shadow-glass-strong
          before:absolute before:inset-0 before:rounded-xl
          before:bg-gradient-to-br before:from-indigo-500/5 before:to-blue-500/5
          before:pointer-events-none
        `,
        // Enhanced glassmorphism modal variants for premium social interactions
        'glass-premium': `
          glass-modal-enhanced backdrop-blur-3xl
          border-glass-border-accent shadow-glass-strong
          animate-scale-in transition-all duration-500 ease-out
        `,
        'glass-social': `
          bg-gradient-to-br from-social-glass/90 to-glass-darker/95 backdrop-blur-2xl
          border border-social-border shadow-glass-medium
          hover:border-social-hover transition-all duration-300 ease-out
        `,
        'glass-floating': `
          bg-gradient-to-br from-glass-light/85 to-glass-dark/90 backdrop-blur-3xl
          border border-glass-border-strong shadow-glass-strong animate-float-slow
          before:absolute before:inset-0 before:rounded-xl before:opacity-50
          before:bg-gradient-to-br before:from-indigo-500/10 before:to-blue-500/5
          before:pointer-events-none
        `,
        'glass-enhanced': `
          glass-modal-enhanced backdrop-blur-3xl border-glass-border-accent
          shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(79,70,229,0.2)]
          before:absolute before:inset-0 before:rounded-xl before:opacity-30
          before:bg-gradient-to-br before:from-glass-highlight before:to-transparent
          before:pointer-events-none
        `,
      },
    },
    defaultVariants: {
      size: 'default',
      state: 'closed',
      variant: 'default',
    },
  }
);

export interface ModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof contentVariants> {
  /**
   * Whether the modal is open
   */
  open: boolean;
  /**
   * Callback when modal should close
   */
  onClose: () => void;
  /**
   * Modal title
   */
  title?: string;
  /**
   * Modal description
   */
  description?: string;
  /**
   * Whether to show close button
   */
  showCloseButton?: boolean;
  /**
   * Whether clicking overlay closes modal
   */
  closeOnOverlayClick?: boolean;
  /**
   * Whether pressing Escape closes modal
   */
  closeOnEscape?: boolean;
  /**
   * Custom header content
   */
  header?: React.ReactNode;
  /**
   * Custom footer content
   */
  footer?: React.ReactNode;
  /**
   * Whether to trap focus within modal
   */
  trapFocus?: boolean;
  /**
   * Initial element to focus when modal opens
   */
  initialFocus?: React.RefObject<HTMLElement>;
  /**
   * Element to return focus to when modal closes
   */
  returnFocus?: React.RefObject<HTMLElement>;
  /**
   * ARIA label for the modal
   */
  'aria-label'?: string;
  /**
   * ARIA labelledby for the modal
   */
  'aria-labelledby'?: string;
  /**
   * ARIA describedby for the modal
   */
  'aria-describedby'?: string;
}

/**
 * Modal component following deCentra design system
 * Provides accessible modal dialogs with focus management and keyboard navigation
 */
const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className,
      size,
      open,
      onClose,
      title,
      description,
      showCloseButton = true,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      header,
      footer,
      trapFocus = true,
      initialFocus,
      returnFocus,
      children,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const modalRef = React.useRef<HTMLDivElement>(null);
    const titleId = React.useId();
    const descriptionId = React.useId();
    const [lastActiveElement, setLastActiveElement] =
      React.useState<HTMLElement | null>(null);

    // Focus management
    React.useEffect(() => {
      if (open) {
        // Store the currently focused element
        setLastActiveElement(document.activeElement as HTMLElement);

        // Focus initial element or modal
        const elementToFocus = initialFocus?.current || modalRef.current;
        if (elementToFocus) {
          elementToFocus.focus();
        }
      } else {
        // Return focus to stored element or returnFocus element
        const elementToFocus = returnFocus?.current || lastActiveElement;
        if (elementToFocus) {
          elementToFocus.focus();
        }
      }
    }, [open, initialFocus, returnFocus, lastActiveElement]);

    // Focus trap
    React.useEffect(() => {
      if (!open || !trapFocus) return;

      const handleTabKey = (event: KeyboardEvent) => {
        if (event.key !== 'Tab' || !modalRef.current) return;

        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      return () => document.removeEventListener('keydown', handleTabKey);
    }, [open, trapFocus]);

    // Escape key handler
    React.useEffect(() => {
      if (!open || !closeOnEscape) return;

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [open, closeOnEscape, onClose]);

    // Body scroll lock
    React.useEffect(() => {
      if (open) {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = originalStyle;
        };
      }
    }, [open]);

    const handleOverlayClick = (event: React.MouseEvent) => {
      if (closeOnOverlayClick && event.target === event.currentTarget) {
        onClose();
      }
    };

    if (!open) return null;

    return (
      <>
        {/* Overlay */}
        <div
          className={overlayVariants({ state: open ? 'open' : 'closed' })}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />

        {/* Modal Content */}
        <div
          ref={(node) => {
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
            (modalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          className={cn(
            contentVariants({ size, state: open ? 'open' : 'closed' }),
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy || (title ? titleId : undefined)}
          aria-describedby={
            ariaDescribedBy || (description ? descriptionId : undefined)
          }
          tabIndex={-1}
          {...props}
        >
          {/* Header */}
          {(header || title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 pb-4">
              <div className="flex-1">
                {header || (
                  <div>
                    {title && (
                      <h2
                        id={titleId}
                        className="text-lg font-semibold text-privacy-text leading-none tracking-tight"
                      >
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p
                        id={descriptionId}
                        className="text-sm text-privacy-text-muted mt-2 leading-relaxed"
                      >
                        {description}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="ml-4 h-8 w-8 p-0 hover:bg-privacy-muted/20"
                  aria-label="Close modal"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="px-6 pb-6">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-2 p-6 pt-4 border-t border-privacy-border/20">
              {footer}
            </div>
          )}
        </div>
      </>
    );
  }
);

Modal.displayName = 'Modal';

/**
 * Confirmation Modal component for destructive actions
 */
export interface ConfirmModalProps
  extends Omit<ModalProps, 'children' | 'footer'> {
  /**
   * Confirmation message
   */
  message: string;
  /**
   * Confirm button text
   */
  confirmText?: string;
  /**
   * Cancel button text
   */
  cancelText?: string;
  /**
   * Confirm button variant
   */
  confirmVariant?:
    | 'primary'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'ghost'
    | 'link';
  /**
   * Whether the action is destructive
   */
  destructive?: boolean;
  /**
   * Callback when confirmed
   */
  onConfirm: () => void;
  /**
   * Whether confirm button is loading
   */
  loading?: boolean;
}

const ConfirmModal = React.forwardRef<HTMLDivElement, ConfirmModalProps>(
  (
    {
      message,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      confirmVariant = 'primary',
      destructive = false,
      onConfirm,
      loading = false,
      onClose,
      ...props
    },
    ref
  ) => {
    const handleConfirm = () => {
      onConfirm();
    };

    return (
      <Modal
        ref={ref}
        onClose={onClose}
        size="sm"
        footer={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              {cancelText}
            </Button>
            <Button
              variant={destructive ? 'destructive' : confirmVariant}
              onClick={handleConfirm}
              loading={loading}
            >
              {confirmText}
            </Button>
          </div>
        }
        {...props}
      >
        <p className="text-privacy-text leading-relaxed">{message}</p>
      </Modal>
    );
  }
);

ConfirmModal.displayName = 'ConfirmModal';

/**
 * Hook for managing modal state
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};

export { Modal, ConfirmModal, overlayVariants, contentVariants };
