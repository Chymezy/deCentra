---
mode: "agent"
description: "Add a complete social network feature (backend + frontend + tests)"
---

# Add Social Feature Instructions

Add comprehensive social networking functionality including user interactions, content discovery, and community features.

## Backend Tasks (Rust + ic-cdk)

### 1. User Relationships
- Add `UserRelationship` (follow, block, mute) with relationship types
- Implement follow/unfollow endpoints with notification triggers
- Add relationship status queries and mutual connection detection
- Include privacy controls for follower visibility

### 2. Content Interaction
- Add `PostInteraction` (like, share, save, report) with interaction tracking
- Implement comment threading with nested replies support
- Add content bookmarking and personal collections
- Include reaction types beyond simple likes

### 3. Discovery Engine
- Add `ContentDiscovery` with algorithmic feed generation
- Implement trending content detection based on engagement velocity
- Add personalized recommendations using interaction history
- Include hashtag and topic-based content organization

### 4. Notifications System
- Add `Notification` with real-time delivery for interactions
- Implement notification preferences and filtering options
- Add batch notification processing for performance
- Include read/unread status tracking

## Frontend Tasks (React + TypeScript)

### 1. Social Feed
- Build infinite scroll feed with optimized rendering
- Add real-time updates for new content and interactions
- Implement feed filtering (following, trending, topics)
- Include content type toggles (posts, photos, videos)

### 2. User Profiles
- Create comprehensive profile pages with activity timelines
- Build follower/following lists with interaction options
- Add profile customization and bio editing
- Implement profile verification and badges

### 3. Discovery Interface
- Build trending content sections with category filters
- Add search functionality for users, content, and hashtags
- Implement recommendation cards for new connections
- Include topic exploration and community discovery

### 4. Interaction Components
- Create engagement buttons (like, comment, share, save)
- Build notification center with real-time updates
- Add comment threading UI with reply functionality
- Implement reaction picker with emoji support

## Code Patterns

Backend relationship example:
```rust
#[ic_cdk::update]
pub async fn follow_user(target_user_id: UserId) -> Result<(), String>

#[ic_cdk::query]
pub fn get_user_feed(user_id: UserId, limit: usize) -> Vec<Post>
```

Frontend component example:
```typescript
export function SocialFeed({ userId }: SocialFeedProps)
export function UserProfile({ userId }: UserProfileProps)
export function NotificationCenter()
```

## Validation Checklist
- [ ] Real-time notifications working
- [ ] Feed algorithm provides engaging content
- [ ] User privacy controls respected
- [ ] Social interactions feel natural
- [ ] Discovery features help users find relevant content