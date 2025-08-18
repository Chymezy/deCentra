'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui';
import { UserAvatar } from '@/components/ui';
import { Textarea } from '@/components/ui';

interface PostComposerProps {
  onPost?: (content: string) => void;
  placeholder?: string;
  compact?: boolean;
  className?: string;
}

export function PostComposer({
  onPost,
  placeholder = "What's happening on the decentralized web?",
  compact = false,
  className = '',
}: PostComposerProps) {
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePost = async () => {
    if (!content.trim() || !isAuthenticated) return;

    setIsPosting(true);
    try {
      await onPost?.(content.trim());
      setContent('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handlePost();
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Card className={`border-b border-dark-background-tertiary ${className}`}>
      <div className="p-4">
        <div className="flex space-x-3">
          <UserAvatar 
            src={user?.avatar}
            alt={user?.username || 'User'}
            fallback={user?.username?.substring(0, 2).toUpperCase() || '👤'}
            size="default"
            className="flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setContent(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full bg-transparent text-dark-text-primary placeholder-dark-text-tertiary resize-none text-lg leading-relaxed focus:outline-none border-none"
              rows={compact ? 2 : 3}
              maxLength={10000}
              disabled={isPosting}
            />
            
            <div className="flex justify-between items-center mt-3">
              <div className="flex space-x-3">
                <PostComposerButton 
                  icon="📷" 
                  tooltip="Add media"
                  onClick={() => {/* TODO: Implement media upload */}}
                />
                <PostComposerButton 
                  icon="📊" 
                  tooltip="Add poll"
                  onClick={() => {/* TODO: Implement polls */}}
                />
                <PostComposerButton 
                  icon="😊" 
                  tooltip="Add emoji"
                  onClick={() => {/* TODO: Implement emoji picker */}}
                />
                <PostComposerButton 
                  icon="📍" 
                  tooltip="Add location"
                  onClick={() => {/* TODO: Implement location */}}
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-sm text-dark-text-tertiary">
                  {content.length}/10000
                </div>
                <Button
                  onClick={handlePost}
                  disabled={!content.trim() || isPosting}
                  variant="primary"
                  size="sm"
                  className="px-6"
                >
                  {isPosting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface PostComposerButtonProps {
  icon: string;
  tooltip: string;
  onClick: () => void;
  disabled?: boolean;
}

function PostComposerButton({ 
  icon, 
  tooltip, 
  onClick, 
  disabled = false 
}: PostComposerButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="hover:bg-dark-background-secondary rounded-full p-2 text-electric-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title={tooltip}
      aria-label={tooltip}
    >
      <span className="text-xl">{icon}</span>
    </button>
  );
}
