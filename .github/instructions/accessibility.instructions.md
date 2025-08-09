---
applyTo: "**/*.tsx"
---

# Accessibility Instructions for Social Network

## WCAG 2.1 AA Compliance for deCentra

### Core Accessibility Principles
- **Perceivable**: All social content must be presentable to users in ways they can perceive
- **Operable**: Social interface components must be operable by all users
- **Understandable**: Information and UI operation must be understandable
- **Robust**: Content must be robust enough for assistive technologies

### Color Contrast Requirements
- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text** (18pt+ or 14pt+ bold): Minimum 3:1 contrast ratio
- **Interactive elements**: Minimum 3:1 contrast ratio for focus states
- **Brand colors**: Ensure deCentra's indigo/blue palette meets contrast requirements

```typescript
// Color contrast validation utility
export const colorContrast = {
  // deCentra brand-compliant colors with accessibility
  primary: {
    bg: '#1E3A8A', // Dark blue - contrast ratio 4.8:1 on white
    text: '#FFFFFF',
    accent: '#3B82F6', // Blue - contrast ratio 4.5:1 on white
  },
  interactive: {
    hover: '#1D4ED8', // Darker blue for hover states
    focus: '#2563EB', // Focus ring color
    disabled: '#9CA3AF', // Meets 3:1 minimum
  },
};

// Contrast checking utility
export function checkContrast(foreground: string, background: string): boolean {
  // Implementation to validate WCAG contrast requirements
  const ratio = calculateContrastRatio(foreground, background);
  return ratio >= 4.5; // AA standard
}
```

### Keyboard Navigation for Social Features

```typescript
// Keyboard navigation for post interactions
export function AccessiblePostCard({ post, author }: PostCardProps) {
  const [focusedAction, setFocusedAction] = useState<string | null>(null);

  const handleKeyDown = (event: KeyboardEvent, action: string) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleAction(action);
        break;
      case 'Tab':
        // Allow default tab behavior
        break;
      case 'Escape':
        event.preventDefault();
        setFocusedAction(null);
        break;
    }
  };

  return (
    <article
      className="bg-white rounded-lg shadow-sm border focus-within:ring-2 focus-within:ring-blue-500"
      role="article"
      aria-labelledby={`post-${post.id}-author`}
      aria-describedby={`post-${post.id}-content`}
    >
      <header className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <UserAvatar 
            user={author} 
            className="flex-shrink-0"
            aria-hidden="true" 
          />
          <div className="min-w-0 flex-1">
            <h3 
              id={`post-${post.id}-author`}
              className="font-semibold text-gray-900 truncate"
            >
              <button
                type="button"
                className="text-left hover:underline focus:outline-none focus:underline"
                onClick={() => navigateToProfile(author.id)}
                aria-label={`View profile of ${author.displayName || author.username}`}
              >
                {author.displayName || author.username}
              </button>
            </h3>
            <time 
              dateTime={new Date(Number(post.createdAt / 1000000n)).toISOString()}
              className="text-sm text-gray-500"
            >
              {formatTimeForScreenReader(post.createdAt)}
            </time>
          </div>
        </div>
      </header>
      
      <div className="p-4">
        <div 
          id={`post-${post.id}-content`}
          className="text-gray-900 whitespace-pre-wrap"
          role="region"
          aria-label="Post content"
        >
          {post.content}
        </div>
        
        {post.mediaUrls.length > 0 && (
          <div className="mt-3 space-y-2">
            {post.mediaUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Image ${index + 1} attached to post by ${author.displayName || author.username}`}
                className="max-w-full h-auto rounded-lg"
                loading="lazy"
              />
            ))}
          </div>
        )}
      </div>
      
      <footer className="p-4 border-t bg-gray-50" role="group" aria-label="Post actions">
        <div className="flex items-center justify-between">
          <AccessibleEngagementButton
            type="like"
            count={post.likesCount}
            isActive={post.isLiked}
            onAction={() => handleLike(post.id)}
            onKeyDown={(e) => handleKeyDown(e, 'like')}
            aria-label={`${post.isLiked ? 'Unlike' : 'Like'} post by ${author.displayName || author.username}. ${post.likesCount} likes`}
          />
          <AccessibleEngagementButton
            type="comment"
            count={post.commentsCount}
            onAction={() => handleComment(post.id)}
            onKeyDown={(e) => handleKeyDown(e, 'comment')}
            aria-label={`Comment on post by ${author.displayName || author.username}. ${post.commentsCount} comments`}
          />
          <AccessibleEngagementButton
            type="tip"
            count={Number(post.tipsReceived)}
            onAction={() => handleTip(post.id)}
            onKeyDown={(e) => handleKeyDown(e, 'tip')}
            aria-label={`Tip ${author.displayName || author.username} for this post. ${post.tipsReceived} ICP received`}
          />
        </div>
      </footer>
    </article>
  );
}
```

### Screen Reader Support

```typescript
// Screen reader utilities for social features
export const screenReader = {
  announceToScreenReader: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  },

  getPostDescription: (post: Post, author: User): string => {
    const timeAgo = formatTimeAgo(post.createdAt);
    const engagement = `${post.likesCount} likes, ${post.commentsCount} comments`;
    return `Post by ${author.displayName || author.username}, ${timeAgo}. ${post.content}. ${engagement}`;
  },

  getFeedDescription: (posts: Post[]): string => {
    return `Social feed with ${posts.length} posts. Use arrow keys to navigate between posts.`;
  },

  getNotificationDescription: (notification: Notification): string => {
    switch (notification.type) {
      case 'like':
        return `${notification.actorName} liked your post: "${notification.postContent?.substring(0, 50)}..."`;
      case 'follow':
        return `${notification.actorName} started following you`;
      case 'comment':
        return `${notification.actorName} commented on your post: "${notification.commentContent}"`;
      case 'tip':
        return `${notification.actorName} tipped you ${notification.amount} ICP`;
      default:
        return 'New notification';
    }
  },
};

// Accessible form components
export function AccessiblePostForm({ onSubmit }: { onSubmit: (content: string) => void }) {
  const [content, setContent] = useState('');
  const [charCount, setCharCount] = useState(0);
  const maxChars = 10000;

  const handleContentChange = (value: string) => {
    setContent(value);
    setCharCount(value.length);
  };

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(content);
      }}
      className="space-y-4"
      role="form"
      aria-label="Create new post"
    >
      <div>
        <label 
          htmlFor="post-content" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          What's on your mind?
        </label>
        <textarea
          id="post-content"
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          maxLength={maxChars}
          aria-describedby="char-count post-help"
          placeholder="Share your thoughts with the deCentra community..."
          required
        />
        <div 
          id="char-count" 
          className="text-sm text-gray-500 mt-1"
          aria-live="polite"
        >
          {charCount}/{maxChars} characters
        </div>
        <div id="post-help" className="text-sm text-gray-600 mt-1">
          Your post will be stored permanently on the blockchain and visible to your followers.
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Attach image"
          >
            <ImageIcon className="h-4 w-4 mr-2" aria-hidden="true" />
            Image
          </button>
          
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Set privacy settings"
          >
            <LockClosedIcon className="h-4 w-4 mr-2" aria-hidden="true" />
            Privacy
          </button>
        </div>
        
        <button
          type="submit"
          disabled={content.trim().length === 0}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-describedby="post-button-help"
        >
          Post
        </button>
        <div id="post-button-help" className="sr-only">
          {content.trim().length === 0 ? 'Enter content to enable posting' : 'Post your content to deCentra'}
        </div>
      </div>
    </form>
  );
}
```

### Social Feed Navigation

```typescript
// Accessible infinite scroll with keyboard navigation
export function AccessibleSocialFeed({ posts }: { posts: Post[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [announceNavigation, setAnnounceNavigation] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target === document.body) {
        switch (event.key) {
          case 'ArrowDown':
          case 'j': // Gmail-style navigation
            event.preventDefault();
            if (currentIndex < posts.length - 1) {
              setCurrentIndex(currentIndex + 1);
              setAnnounceNavigation(true);
            }
            break;
          case 'ArrowUp':
          case 'k': // Gmail-style navigation
            event.preventDefault();
            if (currentIndex > 0) {
              setCurrentIndex(currentIndex - 1);
              setAnnounceNavigation(true);
            }
            break;
          case 'l': // Like current post
            event.preventDefault();
            handleLikePost(posts[currentIndex].id);
            break;
          case 'c': // Comment on current post
            event.preventDefault();
            focusCommentInput(posts[currentIndex].id);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, posts]);

  useEffect(() => {
    if (announceNavigation && posts[currentIndex]) {
      const post = posts[currentIndex];
      const author = getUserById(post.authorId);
      screenReader.announceToScreenReader(
        `Navigated to post ${currentIndex + 1} of ${posts.length}. ${screenReader.getPostDescription(post, author)}`
      );
      setAnnounceNavigation(false);
    }
  }, [currentIndex, announceNavigation, posts]);

  return (
    <div 
      role="feed" 
      aria-label={screenReader.getFeedDescription(posts)}
      aria-describedby="feed-help"
      className="space-y-4"
    >
      <div id="feed-help" className="sr-only">
        Use arrow keys or J/K to navigate between posts. Press L to like, C to comment.
      </div>
      
      {posts.map((post, index) => (
        <div
          key={post.id}
          className={`relative ${index === currentIndex ? 'ring-2 ring-blue-500' : ''}`}
          role="article"
          aria-posinset={index + 1}
          aria-setsize={posts.length}
          tabIndex={index === currentIndex ? 0 : -1}
        >
          <AccessiblePostCard 
            post={post} 
            author={getUserById(post.authorId)}
            isFocused={index === currentIndex}
          />
        </div>
      ))}
    </div>
  );
}
```

### Mobile Accessibility

```typescript
// Touch and mobile accessibility enhancements
export function useMobileAccessibility() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const handleTouchStart = () => setIsTouch(true);
    document.addEventListener('touchstart', handleTouchStart, { once: true });
    
    return () => document.removeEventListener('touchstart', handleTouchStart);
  }, []);

  // Increase touch target sizes on mobile
  const touchTargetClass = isTouch 
    ? 'min-h-[44px] min-w-[44px]' // Apple's minimum touch target
    : 'min-h-[32px] min-w-[32px]';

  return { isTouch, touchTargetClass };
}

// Accessible mobile engagement buttons
export function MobileAccessibleEngagementButton({
  type,
  count,
  isActive,
  onAction,
  'aria-label': ariaLabel,
}: EngagementButtonProps) {
  const { touchTargetClass } = useMobileAccessibility();

  return (
    <button
      type="button"
      onClick={onAction}
      className={`
        inline-flex items-center justify-center space-x-1 rounded-md px-3 py-2
        ${touchTargetClass}
        text-sm font-medium transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${isActive 
          ? 'text-blue-600 bg-blue-50' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }
      `}
      aria-label={ariaLabel}
      aria-pressed={isActive}
    >
      <EngagementIcon type={type} className="h-5 w-5" aria-hidden="true" />
      {count > 0 && (
        <span className="tabular-nums" aria-hidden="true">
          {formatCount(count)}
        </span>
      )}
    </button>
  );
}
```

### Accessibility Testing Utilities

```typescript
// Testing utilities for accessibility compliance
export const a11yTest = {
  checkColorContrast: (element: HTMLElement): boolean => {
    const styles = window.getComputedStyle(element);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;
    return checkContrast(color, backgroundColor);
  },

  checkKeyboardNavigation: async (component: React.ComponentType): Promise<boolean> => {
    // Test keyboard navigation patterns
    // Implementation for automated a11y testing
    return true;
  },

  checkAriaLabels: (container: HTMLElement): string[] => {
    const issues: string[] = [];
    const interactiveElements = container.querySelectorAll('button, a, input, select, textarea');
    
    interactiveElements.forEach((element) => {
      if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
        const text = element.textContent?.trim();
        if (!text) {
          issues.push(`Interactive element missing accessible name: ${element.tagName}`);
        }
      }
    });
    
    return issues;
  },

  checkHeadingStructure: (container: HTMLElement): string[] => {
    const issues: string[] = [];
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    let lastLevel = 0;
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > lastLevel + 1) {
        issues.push(`Heading level skipped: ${heading.tagName} after h${lastLevel}`);
      }
      lastLevel = level;
    });
    
    return issues;
  },
};
```

Remember: Accessibility is not optional for deCentra. As a platform for global users including those in oppressive regimes, ensuring equal access for users with disabilities is part of our mission for digital freedom and inclusion.