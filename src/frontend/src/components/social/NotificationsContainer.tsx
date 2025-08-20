'use client';

import { useState } from 'react';
import { icons } from '@/lib/icons';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'tip' | 'mention' | 'repost';
  title: string;
  description: string;
  time: string;
  read: boolean;
  avatar?: string;
}

export function NotificationsContainer() {
  const [filter, setFilter] = useState<'all' | 'mentions' | 'likes' | 'follows'>('all');

  // Mock notifications data
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'like',
      title: 'alice_crypto liked your post',
      description: 'Privacy isn\'t about hiding something. It\'s about protecting...',
      time: '2 hours ago',
      read: false,
    },
    {
      id: '2',
      type: 'follow',
      title: 'bob_privacy started following you',
      description: 'Check out their profile',
      time: '5 hours ago',
      read: false,
    },
    {
      id: '3',
      type: 'tip',
      title: 'You received a tip!',
      description: '2.5 ICP for your post about decentralization',
      time: '1 day ago',
      read: true,
    },
    {
      id: '4',
      type: 'comment',
      title: 'eve_anonymity commented on your post',
      description: 'This is exactly what we need for true digital freedom!',
      time: '2 days ago',
      read: true,
    },
    {
      id: '5',
      type: 'mention',
      title: 'You were mentioned in a post',
      description: 'charlie_crypto: "@your_username check this out..."',
      time: '3 days ago',
      read: true,
    },
  ];

  const getIcon = (type: Notification['type']) => {
    const iconMapping = {
      like: icons.like,
      comment: icons.messages,
      follow: icons.profile,
      tip: icons.money,
      mention: icons.megaphone,
      repost: icons.repost,
    };
    
    const IconComponent = iconMapping[type] || icons.notifications;
    return <IconComponent className="w-5 h-5" aria-hidden="true" />;
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'mentions') return notification.type === 'mention';
    if (filter === 'likes') return notification.type === 'like';
    if (filter === 'follows') return notification.type === 'follow';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="p-4 border-b border-dark-background-tertiary">
        <h1 className="text-xl font-bold text-dark-text-primary">Notifications</h1>
        {unreadCount > 0 && (
          <p className="text-sm text-dark-text-secondary mt-1">
            {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
          </p>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-dark-background-tertiary">
        <div className="flex">
          {[
            { id: 'all', label: 'All' },
            { id: 'mentions', label: 'Mentions' },
            { id: 'likes', label: 'Likes' },
            { id: 'follows', label: 'Follows' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`flex-1 py-3 text-center text-sm font-medium transition-colors relative ${
                filter === tab.id
                  ? 'text-electric-blue'
                  : 'text-dark-text-secondary hover:text-dark-text-primary'
              }`}
            >
              {tab.label}
              {filter === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-electric-blue"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-dark-background-tertiary">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-dark-text-secondary text-lg mb-2">No notifications</p>
            <p className="text-dark-text-tertiary">
              We&apos;ll notify you when something happens!
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 hover:bg-dark-background-secondary/50 transition-colors cursor-pointer ${
                !notification.read ? 'bg-dark-background-secondary/20' : ''
              }`}
            >
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-deep-indigo/20 rounded-full flex items-center justify-center">
                    {getIcon(notification.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${
                      notification.read ? 'text-dark-text-primary' : 'text-dark-text-primary font-semibold'
                    }`}>
                      {notification.title}
                    </p>
                    <span className="text-xs text-dark-text-tertiary">{notification.time}</span>
                  </div>
                  <p className="text-sm text-dark-text-secondary mt-1 line-clamp-2">
                    {notification.description}
                  </p>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-electric-blue rounded-full mt-2"></div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mark All Read Button */}
      {unreadCount > 0 && (
        <div className="p-4 border-t border-dark-background-tertiary">
          <button className="w-full py-2 px-4 bg-dark-background-secondary text-dark-text-primary rounded-lg hover:bg-dark-background-tertiary transition-colors">
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
}
