---
applyTo: "**"
---

# deCentra General Instructions


## Project Context
**deCentra** is a fully on-chain, censorship-resistant social network built on the Internet Computer Protocol (ICP). This project is being developed for the WCHL 2025 Hackathon with the mission to create a platform where governments can't ban users, corporations can't sell user data, and communities govern themselves.

- This is an Internet Computer Protocol (ICP) project using **Rust with ic-cdk** for canister development with PocketIC testing.
- **Motoko support** is maintained for legacy compatibility but new development uses Rust.
- **Rocket framework** handles off-chain API/proxy operations.
- The frontend is built with Vite, React, and TypeScript, styled with Tailwind CSS v4.

## Backend Stack
- **Primary Language**: Rust with ic-cdk for canisters
- **Testing**: PocketIC for canister integration tests
- **Off-chain**: Rocket framework for API proxy services
- **Legacy**: Motoko (Phase 1) - being refactored to Rust

### Core Architecture
- **Backend**: Single Rust canister (refactored from Motoko) using ic-cdk
- **Off-chain Services**: Rocket framework for API proxy operations  
- **Frontend**: Vite + React + TypeScript with Tailwind CSS v4
- **Authentication**: Internet Identity integration
- **Storage**: 100% on-chain data storage
- **Testing**: PocketIC for canister testing, Vitest for frontend

### Development Phase
- **Current Status**: Phase 2 (Monetization & Growth)
- **Immediate Task**: Refactoring Phase 1 from Motoko → Rust
- **Target Users**: Whistleblowers, creators in censored regions, privacy-conscious users

## Social Network Core Features

### Essential MVP Features (Phase 1 Refactor)
1. **User Management** (FR-1): Internet Identity auth, profile creation
2. **Content System** (FR-2, FR-3): Post creation, editing, content validation
3. **Social Graph** (FR-4, FR-5): Follow/unfollow, like/unlike, comments
4. **Discovery** (FR-6): User search, content search, feed generation

### Phase 2 Features (Current Development)
- Micro-tipping with ICP tokens
- Creator monetization tools
- DAO-based content moderation
- Whistleblower encrypted messaging
- Analytics dashboards

## Code Quality & Standards

### Backend (Rust + ic-cdk)
- Follow CERT secure coding standards (see cert-rust.instructions.md)
- Use strong typing with newtype patterns (UserId, PostId)
- Implement proper error handling with Result<T, E>
- Never use .unwrap(), .expect(), or panic! in production
- Always validate caller() against Principal::anonymous()

### Frontend (React + TypeScript)
- Use Vite with React and TypeScript
- Style with Tailwind CSS v4 (uses `@tailwindcss/vite` plugin)  
- Implement proper Internet Identity integration
- Create type-safe canister service layers
- Follow social network UI/UX patterns

### Formatting & Linting
- **Rust**: Use `cargo fmt` and `cargo clippy` with security-focused rules
- **TypeScript**: Use `prettier` and `eslint` with strict settings
- **Motoko** (legacy): Use `dfinity-foundation.vscode-motoko` formatter
- Run `npm run format` for cross-platform formatting

## Development Workflow

### AI Assistance Guidelines
- **Always** ask clarification questions before implementing features
- **Pause** for human review at critical development points
- **Consider** the social network context in every implementation
- **Prioritize** security and user privacy in all decisions
- **Follow** the feature-driven development workflow

### Critical Security Requirements
- Validate all user input with size limits (MAX_POST_CONTENT, MAX_USERNAME)
- Implement authentication checks for all state-changing operations
- Use proper authorization (users can only modify their own data)
- Add resource limits to prevent DoS attacks
- Sanitize content to prevent XSS and injection attacks

## Development Commands

### Backend Development
```bash
# Format Rust code
cargo fmt

# Run security-focused linting
cargo clippy --all-targets --all-features -- -D warnings

# Run tests
cargo test

# Build and deploy canister
dfx deploy --network local
```

### Frontend Development
```bash
# Start development server
npm run dev

# Type checking
npm run type-check

# Format code
npm run format

# Run tests
npm run test:frontend
```

### Full Project Commands
```bash
# Format all code (Rust + TypeScript)
npm run format

# Run all tests
npm test

# Deploy entire project
./scripts/deploy.sh local
```

## Visual Review Protocol

**MANDATORY**: After any UI changes:
1. Use `openSimpleBrowser` tool to view `http://localhost:5173`
2. Verify social network functionality (posts, profiles, feeds)
3. Confirm changes with user before proceeding
4. Test authentication flow with Internet Identity

## Social Network Architecture Patterns

### Backend Patterns
```rust
// Standard authenticated endpoint
#[ic_cdk::update]
pub async fn create_post(content: String) -> Result<PostId, String> {
    // 1. Authentication
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        return Err("Authentication required".into());
    }
    
    // 2. Input validation
    validate_post_content(&content)?;
    
    // 3. Business logic
    let post_id = create_post_internal(UserId(caller), content)?;
    
    Ok(post_id)
}
```

### Frontend Patterns
```typescript
// Social feature component pattern
export function PostFeed() {
  const { authState } = useAuth();
  const { posts, createPost, loading } = usePosts();

  if (!authState.isAuthenticated) {
    return <LoginPrompt />;
  }

  return (
    <div className="space-y-4">
      <PostForm onSubmit={createPost} />
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

## Changelog Management

When implementing features, update CHANGELOG.md:
- Follow Keep a Changelog format
- Add entries under [Unreleased] > appropriate section
- Use present tense verbs (Add, Fix, Change)
- Focus on user impact, not implementation details
- Maximum 1-2 entries per feature

Example:
```markdown
## [Unreleased]

### Added
- Add user profile management with avatar support for enhanced social interaction
- Add micro-tipping feature allowing ICP token transfers for post appreciation
```

## Project Mission Reminder

Every feature implemented should align with deCentra's core mission:
- **Censorship Resistance**: No single point of failure or control
- **User Data Ownership**: Users own and control their data completely  
- **Community Governance**: DAO-based moderation, not corporate control
- **Privacy Protection**: Anonymous whistleblowing and encrypted messaging
- **Creator Empowerment**: Direct monetization without intermediaries

Remember: We're building the social network for a free and open internet.
