'use client';

import React from 'react';
import Image from 'next/image';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Avatar component variants using CVA for consistent styling
 */
const avatarVariants = cva(
  'relative inline-flex items-center justify-center overflow-hidden rounded-full bg-privacy-muted border-2 border-privacy-border/40 shadow-neumorphic-inset transition-all duration-200',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        default: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-16 w-16 text-xl',
        '2xl': 'h-20 w-20 text-2xl',
        '3xl': 'h-24 w-24 text-3xl',
      },
      variant: {
        default: 'border-privacy-border/40',
        accent: 'border-privacy-accent/60 shadow-neumorphic-raised',
        success: 'border-privacy-success/60',
        warning: 'border-privacy-warning/60',
        danger: 'border-privacy-danger/60',
        ghost: 'border-transparent shadow-none',
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-neumorphic-raised hover:border-privacy-accent/40 focus:outline-none focus:ring-2 focus:ring-privacy-accent/50',
        false: '',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
      interactive: false,
    },
  }
);

/**
 * Status indicator variants for online/offline status
 */
const statusVariants = cva(
  'absolute rounded-full border-2 border-privacy-dark',
  {
    variants: {
      size: {
        xs: 'h-1.5 w-1.5 -bottom-0 -right-0',
        sm: 'h-2 w-2 -bottom-0 -right-0',
        default: 'h-2.5 w-2.5 -bottom-0.5 -right-0.5',
        lg: 'h-3 w-3 -bottom-0.5 -right-0.5',
        xl: 'h-3.5 w-3.5 -bottom-0.5 -right-0.5',
        '2xl': 'h-4 w-4 -bottom-1 -right-1',
        '3xl': 'h-5 w-5 -bottom-1 -right-1',
      },
      status: {
        online: 'bg-privacy-success',
        away: 'bg-privacy-warning',
        busy: 'bg-privacy-danger',
        offline: 'bg-privacy-text-muted',
      },
    },
    defaultVariants: {
      size: 'default',
      status: 'offline',
    },
  }
);

export interface UserAvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  /**
   * User's profile image URL
   */
  src?: string;
  /**
   * Alt text for the image (required for accessibility)
   */
  alt: string;
  /**
   * Fallback text (usually initials) when image fails to load
   */
  fallback?: string;
  /**
   * Username for display purposes
   */
  username?: string;
  /**
   * User's online status
   */
  status?: 'online' | 'away' | 'busy' | 'offline';
  /**
   * Whether to show status indicator
   */
  showStatus?: boolean;
  /**
   * Whether the avatar is verified (shows verification badge)
   */
  verified?: boolean;
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Click handler for interactive avatars
   */
  onAvatarClick?: () => void;
  /**
   * Error handler for failed image loads
   */
  onImageError?: () => void;
}

/**
 * UserAvatar component following deCentra design system
 * Provides profile images with fallbacks, status indicators, and accessibility features
 */
const UserAvatar = React.forwardRef<HTMLDivElement, UserAvatarProps>(
  (
    {
      className,
      size,
      variant,
      interactive,
      src,
      alt,
      fallback,
      username,
      status,
      showStatus = false,
      verified = false,
      loading = false,
      onAvatarClick,
      onImageError,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageLoaded, setImageLoaded] = React.useState(false);

    // Generate fallback initials from username or alt text
    const getInitials = React.useCallback(() => {
      if (fallback) return fallback;

      const text = username || alt || '';
      return text
        .split(' ')
        .map((word) => word.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();
    }, [fallback, username, alt]);

    const handleImageError = () => {
      setImageError(true);
      onImageError?.();
    };

    const handleImageLoad = () => {
      setImageLoaded(true);
      setImageError(false);
    };

    const handleClick = () => {
      if (interactive && onAvatarClick) {
        onAvatarClick();
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (interactive && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onAvatarClick?.();
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          avatarVariants({ size, variant, interactive }),
          loading && 'animate-pulse',
          className
        )}
        onClick={handleClick}
        onKeyDown={interactive ? handleKeyDown : undefined}
        tabIndex={interactive ? 0 : undefined}
        role={interactive ? 'button' : 'img'}
        aria-label={interactive ? `View ${username || alt}'s profile` : alt}
        {...props}
      >
        {/* Main avatar content */}
        {loading ? (
          <div className="w-full h-full bg-privacy-muted/50 animate-pulse" />
        ) : src && !imageError ? (
          <>
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={cn(
                'object-cover transition-opacity duration-200',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-privacy-muted text-privacy-text-muted font-medium">
                {getInitials()}
              </div>
            )}
          </>
        ) : (
          <span className="text-privacy-text-muted font-medium select-none">
            {getInitials()}
          </span>
        )}

        {/* Status indicator */}
        {showStatus && status && (
          <div
            className={cn(statusVariants({ size, status }))}
            aria-label={`Status: ${status}`}
            title={`Status: ${status}`}
          />
        )}

        {/* Verification badge */}
        {verified && (
          <div
            className={cn(
              'absolute rounded-full bg-privacy-accent border-2 border-privacy-dark flex items-center justify-center',
              size === 'xs' && 'h-2 w-2 -bottom-0 -right-0',
              size === 'sm' && 'h-2.5 w-2.5 -bottom-0 -right-0',
              size === 'default' && 'h-3 w-3 -bottom-0.5 -right-0.5',
              size === 'lg' && 'h-3.5 w-3.5 -bottom-0.5 -right-0.5',
              size === 'xl' && 'h-4 w-4 -bottom-0.5 -right-0.5',
              size === '2xl' && 'h-5 w-5 -bottom-1 -right-1',
              size === '3xl' && 'h-6 w-6 -bottom-1 -right-1'
            )}
            aria-label="Verified user"
            title="Verified user"
          >
            <svg
              className={cn(
                'text-white',
                size === 'xs' && 'h-1 w-1',
                size === 'sm' && 'h-1.5 w-1.5',
                size === 'default' && 'h-2 w-2',
                size === 'lg' && 'h-2.5 w-2.5',
                size === 'xl' && 'h-3 w-3',
                size === '2xl' && 'h-3.5 w-3.5',
                size === '3xl' && 'h-4 w-4'
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
    );
  }
);

UserAvatar.displayName = 'UserAvatar';

/**
 * AvatarGroup component for displaying multiple avatars
 */
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum number of avatars to show before showing count
   */
  max?: number;
  /**
   * Size of avatars in the group
   */
  size?: VariantProps<typeof avatarVariants>['size'];
  /**
   * Children should be UserAvatar components
   */
  children: React.ReactNode;
  /**
   * Total count for overflow display
   */
  total?: number;
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  (
    { className, max = 3, size = 'default', children, total, ...props },
    ref
  ) => {
    const childrenArray = React.Children.toArray(children);
    const visibleChildren = childrenArray.slice(0, max);
    const remainingCount = total ? total - max : childrenArray.length - max;

    return (
      <div
        ref={ref}
        className={cn('flex items-center -space-x-2', className)}
        {...props}
      >
        {visibleChildren.map((child, index) => {
          if (React.isValidElement<UserAvatarProps>(child)) {
            return React.cloneElement(child, {
              key: index,
              size,
              className: cn(
                'border-2 border-privacy-dark ring-2 ring-privacy-dark',
                child.props.className
              ),
            } as Partial<UserAvatarProps>);
          }
          return child;
        })}

        {remainingCount > 0 && (
          <div
            className={cn(
              avatarVariants({ size, variant: 'default' }),
              'bg-privacy-muted text-privacy-text-muted font-medium border-2 border-privacy-dark ring-2 ring-privacy-dark'
            )}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

export { UserAvatar, AvatarGroup, avatarVariants, statusVariants };
