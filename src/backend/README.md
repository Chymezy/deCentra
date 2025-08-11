# deCentra Rust Backend

A high-performance, security-focused Rust backend for the deCentra censorship-resistant social network, built on the Internet Computer Protocol (ICP).

## 🚀 Features

### Core Social Network Features
- **User Management**: Secure profile creation and management with Internet Identity
- **Content System**: Post creation, editing, and management with privacy controls
- **Social Graph**: Follow/unfollow relationships and engagement tracking
- **Comment System**: Threaded comments with moderation capabilities
- **Feed Algorithm**: Chronological feeds with privacy filtering
- **Engagement**: Like/unlike posts with real-time metrics

### Security & Privacy
- **Strong Authentication**: Internet Identity integration with anti-spam measures
- **Input Validation**: Comprehensive validation against XSS, injection, and spam
- **Rate Limiting**: DoS protection with user-specific limits
- **Privacy Controls**: Granular visibility settings for posts and profiles
- **Content Moderation**: Framework for DAO-based community moderation

### Performance & Scalability
- **Memory Efficiency**: Optimized data structures with BTreeMap indexing
- **Cycle Management**: Resource-aware operations with monitoring
- **Pagination**: Efficient large dataset handling
- **Type Safety**: Strong typing with newtype patterns (UserId, PostId)

## 📁 Architecture

```
src/backend/
├── Cargo.toml          # Rust dependencies and configuration
├── src/
│   ├── lib.rs          # Main canister logic and API endpoints
│   ├── types.rs        # Type definitions and data structures
│   ├── validation.rs   # Input validation and security checks
│   ├── auth.rs         # Authentication and authorization
│   └── errors.rs       # Comprehensive error handling
```

### Key Components

#### 🔐 Authentication (`auth.rs`)
- Internet Identity integration
- Anonymous caller rejection
- Rate limiting framework
- Permission checking system

#### 📝 Types (`types.rs`)
- Strong typed identifiers (UserId, PostId, CommentId)
- Complete data structures for social features
- Privacy settings and visibility controls
- Platform statistics tracking

#### ✅ Validation (`validation.rs`)
- Username validation with reserved word checking
- Content validation with spam/XSS prevention
- URL validation with domain whitelisting
- Comprehensive security pattern detection

#### ❌ Error Handling (`errors.rs`)
- Structured error types for all operations
- User-friendly error messages
- Error categorization for monitoring
- Retry logic for transient failures

## 🛡️ Security Standards

The backend follows deCentra's security-first approach:

### Input Validation
- All user inputs validated against size limits
- XSS and injection prevention
- Spam detection with pattern matching
- Safe URL validation with whitelisting

### Authentication & Authorization
- Mandatory Internet Identity authentication
- Anonymous caller rejection
- Resource ownership validation
- Rate limiting per user and action type

### Privacy Protection
- Granular privacy controls
- Content visibility filtering
- User blocking support
- Data minimization principles

## 📚 API Documentation

### User Management

#### `create_user_profile(username: String, bio: Option<String>, avatar: Option<String>) -> Result<UserProfile, String>`
Creates a new user profile with privacy controls.

**Security**: Requires authenticated user, validates all inputs, prevents duplicate usernames.

#### `update_user_profile(username: String, bio: Option<String>, avatar: Option<String>) -> Result<UserProfile, String>`
Updates an existing user profile.

**Security**: Only profile owner can update, validates all inputs.

#### `get_user_profile(user_id: UserId) -> Option<UserProfile>`
Retrieves a user profile with privacy filtering.

### Content Management

#### `create_post(content: String, visibility: Option<PostVisibility>) -> Result<PostId, String>`
Creates a new post with content validation.

**Security**: Requires authentication, validates content, rate limited.

#### `get_post(post_id: PostId) -> Option<Post>`
Retrieves a post with privacy checks.

#### `get_user_feed(offset: Option<usize>, limit: Option<usize>) -> Result<Vec<FeedPost>, String>`
Gets personalized feed with privacy filtering and pagination.

### Engagement

#### `like_post(post_id: PostId) -> Result<(), String>`
Likes a post with duplicate prevention.

#### `unlike_post(post_id: PostId) -> Result<(), String>`
Removes a like from a post.

#### `add_comment(post_id: PostId, content: String) -> Result<Comment, String>`
Adds a comment to a post with validation.

## 🚀 Deployment

### Prerequisites
- Rust 1.70+
- DFX 0.15+
- Internet Computer SDK

### Build and Deploy

```bash
# Install dependencies
cd src/backend
cargo check

# Build the canister
dfx build backend

# Deploy locally
dfx start --clean
dfx deploy backend

# Deploy to mainnet
dfx deploy --network ic backend
```

### Testing

```bash
# Health check
dfx canister call backend health_check

# Create a user profile
dfx canister call backend create_user_profile '("alice_doe", opt "Digital rights activist", opt "👩‍💻")'

# Create a post
dfx canister call backend create_post '("Hello from deCentra!", opt variant { Public })'

# Get platform stats
dfx canister call backend get_platform_stats
```

## 🔄 Migration from Motoko

The Rust backend replaces the original Motoko implementation with significant improvements:

### Key Improvements
- **Enhanced Security**: Comprehensive input validation and authentication
- **Better Error Handling**: Structured errors with user-friendly messages
- **Type Safety**: Strong typing prevents runtime errors
- **Performance**: Optimized data structures and algorithms
- **Scalability**: Designed for large-scale social network usage

### Migration Process
1. **Backup**: Original Motoko code is preserved
2. **Build**: New Rust backend compiles successfully
3. **Test**: Comprehensive testing of all features
4. **Data**: Fresh start recommended for development

Use the migration script:
```bash
./scripts/migrate-to-rust.sh
```

## 📊 Performance Considerations

### Memory Usage
- BTreeMap for efficient ordered storage
- Indexed lookups for user posts and social graph
- Compact data structures to minimize memory footprint

### Cycle Efficiency
- Pagination to prevent cycle exhaustion
- Efficient algorithms for social network operations
- Resource monitoring and limits

### Scalability
- Designed for millions of users and posts
- Efficient indexing for fast queries
- Batch operations for bulk updates

## 🤝 Contributing

1. Follow Rust best practices and security guidelines
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure all security validations are in place

## 📄 License

This project is part of deCentra and follows the project's license terms.

---

**deCentra**: Building the social network for a free and open internet where governments can't ban users, corporations can't sell user data, and communities govern themselves. 🌐✊
