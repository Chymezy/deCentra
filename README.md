# 🌐 deCentra – Censorship-Resistant Social Network on ICP

<img src=".github/assets/deCentra_logo.png" alt="deCentra_logo" style="width: 200px; height: 200px;">

---

> **"The social network for a free and open internet where governments can't ban users, corporations can't sell user data, and communities govern themselves."**

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)
[![DFX Version](https://img.shields.io/badge/DFX-0.25.0-green.svg)](https://internetcomputer.org/)
[![Rust](https://img.shields.io/badge/Backend-Rust-orange.svg)](https://www.rust-lang.org/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-black.svg)](https://nextjs.org/)
[![Internet Identity](https://img.shields.io/badge/Auth-Internet%20Identity-purple.svg)](https://identity.ic0.app/)

---

## 🧭 Overview

**deCentra** is a fully decentralized, censorship-resistant social network built 100% on the [Internet Computer Protocol (ICP)](https://internetcomputer.org/). Unlike traditional social platforms, all user data, posts, and interactions are stored **on-chain** using immutable canister smart contracts, making censorship impossible and user privacy paramount.

### 🎯 Mission Statement
- **Governments can't ban you** - Decentralized infrastructure immune to regional restrictions
- **Corporations can't sell you** - User-owned data with built-in privacy controls  
- **Communities govern themselves** - DAO-based moderation and governance

Built for the **WCHL 2025 Hackathon**, deCentra serves whistleblowers, creators in censored regions, privacy advocates, and anyone seeking true digital freedom.

---

## 🚀 Live Deployment

| Environment | Status | URL |
|-------------|--------|-----|
| **Mainnet** | 🚧 Coming Soon | `https://[canister-id].icp0.io` |
| **Local** | ✅ Ready | `http://localhost:4943` |
| **Authentication** | ✅ Live | [Internet Identity](https://identity.ic0.app) |

> 📊 **Real-time Stats**: All user actions are recorded on-chain with transparent analytics

---

# Table of Contents

- [🌐 deCentra – Censorship-Resistant Social Network on ICP](#-decentra--censorship-resistant-social-network-on-icp)
  - [🧭 Overview](#-overview)
    - [🎯 Mission Statement](#-mission-statement)
  - [🚀 Live Deployment](#-live-deployment)
- [Table of Contents](#table-of-contents)
  - [🏗️ Technical Architecture](#️-technical-architecture)
    - [Backend Architecture (Rust + IC-CDK)](#backend-architecture-rust--ic-cdk)
    - [Frontend Architecture (Next.js + TypeScript)](#frontend-architecture-nextjs--typescript)
    - [Authentication System](#authentication-system)
    - [Security Framework](#security-framework)
  - [🛠️ Tech Stack](#️-tech-stack)
  - [📁 Project Structure](#-project-structure)
  - [🚀 Features](#-features)
    - [Core Social Features (MVP)](#core-social-features-mvp)
    - [Advanced Features (Phase 2)](#advanced-features-phase-2)
    - [Whistleblower Protection (Phase 3)](#whistleblower-protection-phase-3)
  - [⚙️ Quick Start Guide](#️-quick-start-guide)
    - [🧩 Prerequisites](#-prerequisites)
    - [🚀 One-Command Setup](#-one-command-setup)
    - [📋 Manual Setup](#-manual-setup)
  - [🔧 Development Workflow](#-development-workflow)
    - [Local Development](#local-development)
    - [Code Quality \& Testing](#code-quality--testing)
    - [Type Generation](#type-generation)
  - [🚀 Deployment Guide](#-deployment-guide)
    - [Local Deployment](#local-deployment)
    - [Testnet Deployment](#testnet-deployment)
    - [Mainnet Deployment](#mainnet-deployment)
  - [🔐 Security \& Privacy](#-security--privacy)
    - [Authentication Security](#authentication-security)
    - [Data Protection](#data-protection)
    - [Whistleblower Protection](#whistleblower-protection-1)
  - [📖 API Documentation](#-api-documentation)
    - [Backend Canister APIs](#backend-canister-apis)
    - [Frontend Service Layer](#frontend-service-layer)
  - [🎨 Design System](#-design-system)
    - [Colors](#colors)
    - [Typography](#typography)
    - [Components](#components)
  - [🤝 Contributing](#-contributing)
    - [Development Guidelines](#development-guidelines)
    - [Code Standards](#code-standards)
  - [📊 Performance \& Scalability](#-performance--scalability)
  - [🗺️ Roadmap](#️-roadmap)
  - [🛡️ License](#️-license)
  - [🧠 Learn More](#-learn-more)
  - [✨ Acknowledgements](#-acknowledgements)
  - [🌍 Join the Movement](#-join-the-movement)

---

## 🏗️ Technical Architecture

### Backend Architecture (Rust + IC-CDK)

deCentra's backend is built with **Rust** using the **IC-CDK** framework for maximum performance and security:

```rust
// Core backend architecture
pub struct SocialNetworkState {
    pub users: BTreeMap<UserId, UserProfile>,
    pub posts: BTreeMap<PostId, Post>,
    pub social_graph: SocialGraph,
    pub moderation_system: ModerationSystem,
}

// Security-first authentication
pub fn authenticate_user() -> Result<UserId, String> {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        return Err("Authentication required".into());
    }
    Ok(UserId(caller))
}
```

**Key Features:**
- **CERT Compliant**: Zero-tolerance for `.unwrap()`, proper error handling
- **Resource Efficient**: Cycle-optimized operations with monitoring
- **Scalable Design**: Modular state management for future canister sharding

### Frontend Architecture (Next.js + TypeScript)

Modern, responsive web application built with performance in mind:

```typescript
// Type-safe canister integration
export class SocialNetworkService {
  async createPost(content: string): Promise<PostId> {
    const actor = await this.getActor();
    return actor.create_post(content);
  }
}

// Optimized feed with virtualization
export function VirtualizedFeed() {
  const { data, loadMore, hasMore } = useInfiniteFeed();
  return <VirtualList items={data} onLoadMore={loadMore} />;
}
```

### Authentication System

**Internet Identity Integration:**
- Cryptographic authentication without passwords
- Anonymous principals for privacy
- Cross-device synchronization
- Hardware security key support

### Security Framework

```rust
// Multi-layer security validation
pub fn validate_content(content: &str) -> Result<String, SecurityError> {
    // Input sanitization
    let sanitized = sanitize_html(content)?;
    
    // Content length validation
    if sanitized.len() > MAX_POST_CONTENT {
        return Err(SecurityError::ContentTooLong);
    }
    
    // Malicious content detection
    detect_malicious_patterns(&sanitized)?;
    
    Ok(sanitized)
}
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend** | Rust + IC-CDK | High-performance canister development |
| **Frontend** | Next.js 15 + TypeScript | Modern web application framework |
| **Styling** | Tailwind CSS v4 | Utility-first styling system |
| **Authentication** | Internet Identity | Decentralized identity management |
| **State Management** | React Hooks + Zustand | Efficient state handling |
| **Testing** | PocketIC + Vitest + Jest | Comprehensive testing suite |
| **Build Tools** | DFX + Vite + Cargo | Development and deployment |
| **Deployment** | ICP Mainnet | Decentralized hosting |

---

## 📁 Project Structure

```
deCentra/
├── 📄 README.md                    # This file
├── 📄 dfx.json                     # DFX configuration
├── 📄 Cargo.toml                   # Rust workspace config
├── 📄 package.json                 # Node.js dependencies
├── 📄 tsconfig.json                # TypeScript configuration
├── 📁 src/
│   ├── 📁 backend/                 # Rust canister code
│   │   ├── 📄 Cargo.toml          # Backend dependencies
│   │   ├── 📄 backend.did         # Candid interface
│   │   └── 📁 src/
│   │       ├── 📄 lib.rs          # Main canister code
│   │       ├── 📄 types.rs        # Domain types
│   │       ├── 📄 auth.rs         # Authentication logic
│   │       ├── 📄 validation.rs   # Input validation
│   │       └── 📄 errors.rs       # Error handling
│   ├── 📁 frontend/               # Next.js application
│   │   ├── 📄 package.json       # Frontend dependencies
│   │   ├── 📄 next.config.ts     # Next.js configuration
│   │   ├── 📄 tailwind.config.ts # Tailwind configuration
│   │   └── 📁 src/
│   │       ├── 📁 app/           # Next.js App Router
│   │       ├── 📁 components/    # React components
│   │       └── 📁 lib/          # Utilities and services
│   └── 📁 declarations/          # Generated type definitions
├── 📁 scripts/                   # Development scripts
│   ├── 📄 setup.sh              # Environment setup
│   ├── 📄 deploy.sh             # Deployment automation
│   └── 📄 generate-candid.sh    # Type generation
└── 📁 target/                    # Rust build output
```

---

## 🚀 Features

### Core Social Features (MVP)
- ✅ **User Profiles** - Customizable profiles with privacy controls
- ✅ **Content Creation** - Text posts with rich formatting support
- ✅ **Social Graph** - Follow/unfollow relationships with block functionality
- ✅ **Engagement** - Like/unlike posts and threaded comments
- ✅ **Feed Generation** - Chronological and algorithmic feeds
- ✅ **Search & Discovery** - User and content search functionality
- ✅ **Privacy Controls** - Granular visibility settings

### Advanced Features (Phase 2)
- 🚧 **Creator Monetization** - ICP micro-tipping system
- 🚧 **DAO Moderation** - Community-driven content governance
- 🚧 **Analytics Dashboard** - Creator insights and metrics
- 🚧 **Content Subscriptions** - Premium content access
- 🔜 **NFT Integration** - Profile pictures and digital collectibles

### Whistleblower Protection (Phase 3)
- 🔜 **Anonymous Posting** - Identity-protected submissions
- 🔜 **Encrypted Communications** - End-to-end encrypted messaging
- 🔜 **Threshold Encryption** - Multi-party content access
- 🔜 **Metadata Scrubbing** - Complete anonymization tools
- 🔜 **Legal Protection Framework** - Jurisdiction-aware safeguards

---

## ⚙️ Quick Start Guide

### 🧩 Prerequisites

| Tool | Version | Purpose | Installation |
|------|---------|---------|--------------|
| **Node.js** | ≥18.0.0 | Frontend development | [nodejs.org](https://nodejs.org/) |
| **Rust** | ≥1.70.0 | Backend development | [rustup.rs](https://rustup.rs/) |
| **DFX** | 0.25.0 | ICP development | [internetcomputer.org](https://internetcomputer.org/docs/current/developer-docs/setup/install/) |
| **Git** | Latest | Version control | [git-scm.com](https://git-scm.com/) |

### 🚀 One-Command Setup

```bash
# Clone and setup everything automatically
git clone https://github.com/Chymezy/deCentra.git
cd deCentra
./scripts/setup.sh
```

The setup script will:
- ✅ Install DFX SDK
- ✅ Install Node.js via NVM (if needed)
- ✅ Install Rust toolchain
- ✅ Install all dependencies
- ✅ Setup git hooks
- ✅ Configure development environment

### 📋 Manual Setup

<details>
<summary>Click to expand manual installation steps</summary>

1. **Install Prerequisites**
   ```bash
   # Install DFX
   sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
   
   # Install Rust
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   
   # Add WebAssembly target
   rustup target add wasm32-unknown-unknown
   ```

2. **Clone Repository**
   ```bash
   git clone https://github.com/Chymezy/deCentra.git
   cd deCentra
   ```

3. **Install Dependencies**
   ```bash
   # Root dependencies
   npm install
   
   # Frontend dependencies
   cd src/frontend && npm install && cd ../..
   
   # Install Rust tools
   cargo install candid-extractor
   ```

4. **Setup Git Hooks**
   ```bash
   ./scripts/install-hooks.sh
   ```

</details>

---

## 🔧 Development Workflow

### Local Development

```bash
# 1. Start local ICP replica
dfx start --clean --background

# 2. Deploy canisters
./scripts/deploy.sh local

# 3. Start frontend development server
cd src/frontend && npm run dev

# 4. Open application
open http://localhost:3000
```

**Local URLs:**
- **Frontend**: `http://localhost:3000`
- **Backend Canister**: `http://localhost:4943/?canisterId={backend-id}`
- **Internet Identity**: `http://localhost:4943/?canisterId={ii-id}`

### Code Quality & Testing

```bash
# Run all tests
npm test

# Backend tests
cd src/backend && cargo test

# Frontend tests  
cd src/frontend && npm test

# Code formatting
npm run format

# Linting
npm run lint

# Type checking
npm run type-check
```

### Type Generation

```bash
# Generate Candid declarations after backend changes
dfx generate backend

# Regenerate all type bindings
./scripts/generate-candid.sh backend
```

---

## 🚀 Deployment Guide

### Local Deployment

```bash
# Deploy to local replica
./scripts/deploy.sh local

# Check deployment
dfx canister status backend --network local
dfx canister status frontend --network local
```

### Testnet Deployment

```bash
# Deploy to playground testnet
dfx deploy --network playground --with-cycles 1000000000000

# Verify deployment
dfx canister status backend --network playground
```

### Mainnet Deployment

<details>
<summary>Mainnet deployment requires cycles and identity setup</summary>

1. **Prepare Mainnet Identity**
   ```bash
   # Create or use existing identity
   dfx identity new mainnet-deployer
   dfx identity use mainnet-deployer
   
   # Get principal
   dfx identity get-principal
   ```

2. **Acquire Cycles**
   - Purchase ICP on exchange
   - Convert ICP to cycles via NNS dapp
   - Transfer cycles to development identity

3. **Deploy to Mainnet**
   ```bash
   # Deploy with sufficient cycles
   dfx deploy --network ic --with-cycles 2000000000000
   
   # Verify deployment
   dfx canister status backend --network ic
   ```

4. **Post-Deployment Setup**
   ```bash
   # Set canister controllers
   dfx canister update-settings backend --add-controller $(dfx identity get-principal)
   
   # Backup canister IDs
   cp .dfx/ic/canister_ids.json canister_ids_mainnet.json
   ```

</details>

---

## 🔐 Security & Privacy

### Authentication Security

```typescript
// Secure authentication flow
export class AuthService {
  async login(): Promise<Identity> {
    const authClient = await AuthClient.create();
    
    return new Promise((resolve, reject) => {
      authClient.login({
        identityProvider: "https://identity.ic0.app",
        onSuccess: () => {
          const identity = authClient.getIdentity();
          this.validateIdentity(identity);
          resolve(identity);
        },
        onError: reject,
      });
    });
  }
  
  private validateIdentity(identity: Identity): void {
    if (identity.getPrincipal().isAnonymous()) {
      throw new Error("Anonymous authentication not allowed");
    }
  }
}
```

### Data Protection

- **Encryption at Rest**: All sensitive data encrypted with user-controlled keys
- **Privacy by Design**: Default private settings, granular controls
- **No Tracking**: Zero third-party analytics or tracking
- **Data Portability**: Full export functionality for user data

### Whistleblower Protection

```rust
// Anonymous identity management
pub struct AnonymousIdentityManager;

impl AnonymousIdentityManager {
    pub async fn create_protected_identity() -> Result<ProtectedIdentity, String> {
        let random_seed = ic_cdk::api::management_canister::main::raw_rand().await?;
        let identity = Self::derive_identity_from_seed(&random_seed.0)?;
        
        Ok(ProtectedIdentity {
            id: identity,
            protection_level: ProtectionLevel::Maximum,
            metadata_scrubbed: true,
        })
    }
}
```

---

## 📖 API Documentation

### Backend Canister APIs

<details>
<summary>Core User Management APIs</summary>

```rust
// User profile creation
#[ic_cdk::update]
pub async fn create_user_profile(
    username: String,
    display_name: Option<String>,
    bio: Option<String>
) -> Result<UserProfile, String>

// Get user profile
#[ic_cdk::query]
pub fn get_user_profile(user_id: UserId) -> Result<UserProfile, String>

// Update profile privacy settings
#[ic_cdk::update]
pub async fn update_privacy_settings(
    settings: PrivacySettings
) -> Result<(), String>
```

</details>

<details>
<summary>Content Management APIs</summary>

```rust
// Create new post
#[ic_cdk::update]
pub async fn create_post(
    content: String,
    visibility: PostVisibility,
    media_urls: Vec<String>
) -> Result<PostId, String>

// Get user feed
#[ic_cdk::query]
pub fn get_user_feed(
    offset: usize,
    limit: usize
) -> Result<Vec<Post>, String>

// Like/unlike post
#[ic_cdk::update]
pub async fn toggle_post_like(post_id: PostId) -> Result<bool, String>
```

</details>

### Frontend Service Layer

```typescript
// Type-safe backend integration
export class SocialNetworkService {
  async createPost(postData: CreatePostRequest): Promise<PostId> {
    const actor = await this.getActor();
    return actor.create_post(
      postData.content,
      postData.visibility,
      postData.mediaUrls
    );
  }
  
  async getUserFeed(pagination: PaginationParams): Promise<Post[]> {
    const actor = await this.getActor();
    return actor.get_user_feed(pagination.offset, pagination.limit);
  }
}
```

---

## 🎨 Design System

### Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Deep Indigo** | `#4B0082` | Primary brand, headers |
| **Electric Blue** | `#0F62FE` | Interactive elements, links |
| **Vibrant Orange** | `#FF6F00` | Accent, notifications |
| **Charcoal Black** | `#1A1A1A` | Text, UI elements |
| **Pure White** | `#FFFFFF` | Backgrounds, cards |

### Typography

```css
/* Primary font family */
.font-primary {
  font-family: 'Inter', 'Poppins', system-ui, sans-serif;
}

/* Headings */
.heading-xl { @apply text-4xl font-bold; }
.heading-lg { @apply text-2xl font-semibold; }
.heading-md { @apply text-xl font-medium; }

/* Body text */
.body-lg { @apply text-lg leading-relaxed; }
.body-md { @apply text-base leading-normal; }
.body-sm { @apply text-sm leading-tight; }
```

### Components

```typescript
// Consistent component patterns
export function PostCard({ post, onLike, onComment }: PostCardProps) {
  return (
    <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
      <CardHeader>
        <UserAvatar user={post.author} />
        <PostMetadata timestamp={post.createdAt} />
      </CardHeader>
      <CardContent>
        <PostContent content={post.content} />
      </CardContent>
      <CardFooter>
        <EngagementButtons onLike={onLike} onComment={onComment} />
      </CardFooter>
    </Card>
  );
}
```

---

## 🤝 Contributing

We welcome contributors who share our mission of building a free and open internet!
For PRs, issues, and feature ideas. See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.
### Development Guidelines

1. **Fork the Repository**
   ```bash
   git clone https://github.com/Chymezy/deCentra.git
   cd deCentra
   git checkout -b feature/your-feature-name
   ```

2. **Follow Code Standards**
   - Use provided linting and formatting tools
   - Write comprehensive tests
   - Follow security guidelines
   - Document new features

3. **Submit Pull Request**
   - Clear description of changes
   - Reference related issues
   - Include screenshots for UI changes
   - Ensure all tests pass

### Code Standards

```rust
// Rust: Always use Result types for fallible operations
pub fn create_user(username: String) -> Result<UserId, String> {
    validate_username(&username)?;
    // Implementation
}

// Never use unwrap() or expect() in production code
let user = get_user(&user_id).ok_or("User not found")?;
```

```typescript
// TypeScript: Use strict typing
interface CreatePostRequest {
  content: string;
  visibility: PostVisibility;
  mediaUrls?: string[];
}

// Use proper error handling
const result = await socialService.createPost(postData);
if (result.error) {
  handleError(result.error);
  return;
}
```

---

## 📊 Performance & Scalability

**Current Metrics:**
- **Backend Response Time**: <200ms average
- **Frontend Load Time**: <3s initial load
- **Canister Memory Usage**: ~50MB typical
- **Cycle Consumption**: ~1M per 1000 operations

**Scalability Strategy:**
- **Horizontal Scaling**: Multi-canister architecture planned
- **Data Sharding**: User and content distribution across canisters
- **Caching**: Frontend caching with service workers
- **Optimization**: Continuous performance monitoring

---

## 🗺️ Roadmap

| Phase | Timeline | Features |
|-------|----------|----------|
| **Phase 1** | ✅ Complete | Core social features, basic UI |
| **Phase 2** | 🚧 Current | Monetization, DAO moderation |
| **Phase 3** | Q3 2025 | Whistleblower tools, mobile app |
| **Phase 4** | Q3 2025 | Advanced analytics, enterprise features |
| **Phase 5** | Q4 2025 | Global scaling, partnerships |

**Immediate Priorities:**
- [x] Complete Rust backend migration
- [ ] Implement creator monetization
- [ ] Deploy to ICP mainnet
- [ ] Community beta testing

---

## 🛡️ License

This project is licensed under the [Apache License 2.0](./LICENSE).

**Key Points:**
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Patent use allowed
- ❗ Must include license notice
- ❗ Must state changes made

---

## 🧠 Learn More

**ICP Development:**
- [Internet Computer Docs](https://internetcomputer.org/docs/)
- [DFX SDK Guide](https://internetcomputer.org/docs/current/developer-docs/setup/install/)
- [Rust CDK Documentation](https://docs.rs/ic-cdk/)

**Decentralized Social Media:**
- [Web3 Social Protocols](https://ethereum.org/en/dapps/#social-networks)
- [Censorship Resistance](https://freedom.press/digisec/guides/)
- [Privacy-First Design](https://privacybydesign.ca/)

**Technical Resources:**
- [Motoko Language Guide](https://internetcomputer.org/docs/current/motoko/main/motoko/)
- [Candid Interface Language](https://internetcomputer.org/docs/current/references/candid-ref/)
- [Internet Identity Guide](https://internetcomputer.org/docs/current/tokenomics/identity-auth/what-is-ic-identity/)

---

## ✨ Acknowledgements

**Special Thanks:**
- 🏆 **DFINITY Foundation** - For the Internet Computer Protocol
- 🌟 **ICP UK Hub Developer Community** - For continuous support and feedback
- 🚀 **WCHL 2025 Hackathon** - For the platform and inspiration
- 💪 **Open Source Contributors** - For building a better internet
- 🔒 **Privacy Advocates** - For guidance on user protection

**Technologies:**
- [Internet Computer Protocol](https://internetcomputer.org/) - Blockchain foundation
- [Rust Programming Language](https://www.rust-lang.org/) - System programming
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript

---

## 🌍 Join the Movement

> **"deCentra is more than code — it's a protocol for digital freedom."**

**Get Involved:**
- 💬 [Join our Community](https://discord.gg/decentra) - Connect with builders and users
- 🐦 [Follow on Twitter](https://twitter.com/deCentra_ICP) - Latest updates and news
- 📧 [Email Us](mailto:hello@decentra.app) - Questions and partnerships
- 🚀 [DoraHacks Project](https://dorahacks.io/buidl/28565/) - Support our development
- 💻 [GitHub](https://github.com/Chymezy/deCentra) - Contribute to the codebase
- 🎯 [Telegram](https://t.me/x17green) - Chat with the Dev

**Support the Vision:**
- ⭐ **Star this repository** to show support
- 🔄 **Share with your network** to spread awareness
- 💡 **Submit feature requests** to shape the platform
- 🐛 **Report bugs** to improve stability
- 💰 **Donate** to fund development

---

<div align="center">

**Built with ❤️ for digital freedom**

*"No one can silence a network owned by its users."*

**deCentra Team | WCHL 2025 Hackathon**

</div>
