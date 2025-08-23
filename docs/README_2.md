# 🌐 deCentra – Fully On-Chain Social Network on ICP

<img src=".github/assets/deCentra_logo.png" alt="deCentra_logo" style="width: 200px; height: 200px;">

---

> **"The social network for a free and open internet."**

---

## 🧭 Overview

deCentra is a censorship-resistant, transparent, decentralized, social network, built 100% on the [Internet Computer Protocol (ICP)](https://internetcomputer.org/). All data — user profiles, posts, likes, and metadata — is stored **on-chain**, making it impossible to censor, de-platform, or centrally monetize.

> ✊ “Governments can’t ban you. Corporations can’t sell you. Communities govern themselves.”

Built for the **WCHL 2025 Hackathon**, deCentra aims to become the flagship platform for whistleblowers, creators in censored regions, and privacy-conscious users globally.

---

## 🚀 Live Deployment

🔗 Mainnet dApp: [https://decentra.app](https://decentra.icp0.io) (coming soon...)\
🪪 Login via Internet Identity: [https://identity.ic0.app](https://identity.ic0.app)

> *Note: All user actions are recorded on-chain in real-time using ICP Canisters.*

---

# Table of Contents

- [🌐 deCentra – Fully On-Chain Social Network on ICP](#-decentra--fully-on-chain-social-network-on-icp)
  - [🧭 Overview](#-overview)
  - [🚀 Live Deployment](#-live-deployment)
- [Table of Contents](#table-of-contents)
  - [The Story: Why We Exist](#the-story-why-we-exist)
  - [The Problem: A Broken Social Media Landscape](#the-problem-a-broken-social-media-landscape)
  - [The Solution: deCentra (Fully On-Chain Social)](#the-solution-decentra-fully-on-chain-social)
  - [Censorship Resistance \& Privacy Technologies](#censorship-resistance--privacy-technologies)
  - [Business Model \& Vision](#business-model--vision)
  - [Market Opportunity](#market-opportunity)
  - [Competitive Advantage](#competitive-advantage)
  - [System Architecture](#system-architecture)
  - [Development Phases \& Roadmap](#development-phases--roadmap)
  - [🧑‍💻 Tech Stack](#-tech-stack)
  - [📁 Project Structure](#-project-structure)
  - [📁 Folder Overview](#-folder-overview)
  - [🧱 Project Architecture](#-project-architecture)
  - [🚀 Features in This MVP](#-features-in-this-mvp)
- [⚙️ Getting Started](#️-getting-started)
  - [🛠️ Local Development Setup](#️-local-development-setup)
    - [1. 🧩 Prerequisites](#1--prerequisites)
    - [2. 📦 Clone \& Install Dependencies](#2--clone--install-dependencies)
    - [3. ⚙️ Start Local Development](#3-️-start-local-development)
    - [4. 🛠 Deploy Canisters Locally](#4--deploy-canisters-locally)
    - [5. 🔄 Start Frontend](#5--start-frontend)
  - [🛠️ Local Development Setup/Deploy (Automated Script)](#️-local-development-setupdeploy-automated-script)
    - [Start Frontend](#start-frontend)
    - [Generate Type Bindings (Important After Changes)](#generate-type-bindings-important-after-changes)
  - [📦 Deployment (Mainnet)](#-deployment-mainnet)
  - [Security \& Ethics](#security--ethics)
  - [🔐 Authentication](#-authentication)
  - [🧱 Canister Architecture](#-canister-architecture)
  - [🎨 Branding](#-branding)
    - [Colors](#colors)
    - [Typography](#typography)
  - [📽️ Demo Video](#️-demo-video)
  - [🤝 Contributing](#-contributing)
  - [🛡️ License](#️-license)
  - [🧠 Learn More](#-learn-more)
  - [✨ Acknowledgements](#-acknowledgements)
  - [🌍 Join the Movement](#-join-the-movement)

## The Story: Why We Exist

In a world where governments ban apps, corporations sell your data, and social platforms become tools of control, billions are left voiceless or vulnerable. In 2023 alone, over 45 countries imposed new internet censorship laws. Creators, activists, and everyday users are losing trust in the platforms meant to connect them.

**We believe the internet should be free, open, and owned by its users.**

---

## The Problem: A Broken Social Media Landscape
- **Censorship is rising:** TikTok, Twitter, and others banned or restricted in dozens of countries.
- **Data misuse:** Big Tech fined billions for privacy violations and anti-competitive behavior.
- **Centralized control:** Governments and corporations can silence, surveil, or sanction anyone, anywhere.

---

## The Solution: deCentra (Fully On-Chain Social)
A censorship-resistant, privacy-first social network built 100% on the Internet Computer Protocol (ICP).
- **No centralized servers to seize or censor.**
- **Anonymous, cryptographic logins (Internet Identity).**
- **DAO-based moderation—community, not governments, decide.**
- **Creator monetization without intermediaries.**
- **Whistleblower tools for activists and NGOs.**

> “We’re building the social network for a free and open internet. One where governments can’t ban you. Corporations can’t sell you. And communities govern themselves.”

---

## Censorship Resistance & Privacy Technologies
![Censorship Resistance & Privacy Tech](.github/assets/Censorship%20Resistance%20&%20Privacy%20Technologies%20Diagram.png)

---

## Business Model & Vision
- **Micro-tipping:** Users send ICP tokens to creators for posts ("likes with value").
- **Creator marketplace:** Sell premium content, NFTs, and courses directly on-chain.
- **DAO-approved ads:** Businesses pay ICP to promote content; users vote on what’s shown.
- **Enterprise dashboards:** Paid tools for NGOs/journalists (analytics, encrypted reports).
- **Partnership grants:** Collaborate with human rights orgs and agencies for funding.

---

## Market Opportunity
- **3.3B users** in censored regions
- **$104B global creator economy**
- **10,000+ NGOs & watchdogs**
- **$35B decentralized social media TAM (2030 projected)**

---

## Competitive Advantage
| Feature                  | Big Tech | Web3 Socials | Fully On-Chain Social |
|-------------------------|----------|--------------|----------------------|
| Fully On-Chain Data     | ❌       | ⚠️ Partial   | ✅ Yes               |
| Censorship Resistance   | ❌       | ⚠️ Limited   | ✅ Yes               |
| Anonymous Whistleblowing| ❌       | ❌           | ✅ Yes               |
| User-Owned Monetization | ❌       | ⚠️ Partial   | ✅ Yes               |
| DAO Moderation          | ❌       | ⚠️ Experimental| ✅ Yes              |

---

## System Architecture
![System Architecture](.github/assets/Fully%20On-Chain%20Social%20Network%20Architecture.png)

---

## Development Phases & Roadmap
![Development Phases](.github/assets/Desarrollo%20de%20Red%20Social%20On-Chain.png)

---

## 🧑‍💻 Tech Stack

| Layer        | Tech                         |
| ------------ | ---------------------------- |
| Backend      | Motoko Canisters (ICP)       |
| Frontend     | Next.js (Vite + React + TypeScript) |
| Auth         | Internet Identity            |
| Styling      | Tailwind CSS                 |
| Build Tool   | DFX + `@dfinity/agent`       |
| Deployment   | ICP Mainnet via `dfx`        |
| Package Mgmt | npm                          |

## 📁 Project Structure

```
deCentra-social/
├── README.md
├── dfx.json
├── package.json
├── tsconfig.json
├── webpack.config.ts
├── .gitignore
├── .env.local
├── /src
│   ├── /backend
│   │   ├── /profiles
│   │   ├── /posts
│   │   ├── /utils
│   │   │   └── types.mo
│   │   └── main.mo
│   ├── /declarations (generated by `dfx generate`)
│   └── /frontend
│       ├── next.config.js
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       ├── /app
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── /profile
│       │   └── /feed
│       ├── /components
│       └── /lib
│           ├── config/
│           ├── context/
│           ├── hooks/
│           ├── services/
│           ├── styles/
│           │   └── globals.css
│           ├── types/
│           └── utils/
│   
│   
└── /scripts
    └── deploy.sh
```

---

## 📁 Folder Overview

| Folder            | Description                              |
|-------------------|------------------------------------------|
| `/src/backend`    | All Motoko code for canisters            |
| `/src/frontend`   | Next.js frontend using the `app/` router |
| `/src/declarations` | Generated TypeScript from Motoko `.did` |
| `/scripts`        | Shell scripts for build/deploy           |

---

## 🧱 Project Architecture

```

Frontend (Next.js / React)
│
├── Internet Identity login (II)
├── Profile creation & Post feed UI
│
├── Canister Interfaces (via @dfinity/agent)
│
├── 📦 Profiles Canister – handles user registration, bios, avatars
└── 📝 Posts Canister – stores all post data (text-only MVP)

````

## 🚀 Features in This MVP

- ✅ Internet Identity login
- ✅ User profiles (bio, avatar placeholder)
- ✅ Post creation and retrieval
- ✅ Global feed UI
- ✅ Fully on-chain data storage on ICP
- ✅ Modern branding (Inter/Poppins, Deep Indigo, Electric Blue, etc.)

---

# ⚙️ Getting Started

## 🛠️ Local Development Setup

### 1. 🧩 Prerequisites

- [Node.js >= 18](https://nodejs.org/) (18+ recommended)
- DFX SDK: (Install from [https://internetcomputer.org/docs/current/developer-docs/setup/install/](https://internetcomputer.org/docs/current/developer-docs/setup/install/))
- Internet Identity Setup: (Create at [https://identity.ic0.app/](https://identity.ic0.app/))

### 2. 📦 Clone & Install Dependencies

```bash
git clone https://github.com/Chymezy/deCentra.git
cd decentra
npm install
````

### 3. ⚙️ Start Local Development

```bash
dfx start --background --clean
```

### 4. 🛠 Deploy Canisters Locally

```bash
dfx deploy --network local
```

### 5. 🔄 Start Frontend

```bash
npm run dev
```

Then visit: [http://localhost:3000](http://localhost:3000)

## 🛠️ Local Development Setup/Deploy (Automated Script)

> Use the predefined scrips in the `/scripts` directory to setup and deploy the dApp locally

```bash
# Setup Script
./scripts/setup.sh

# Deployment Script
./scripts/deploy.sh
```

### Start Frontend
```bash
npm run dev
```

Then visit: [http://localhost:3000](http://localhost:3000)

- After deployment, dfx will print URLs for your frontend and backend canisters.
- **Open the frontend canister URL in your browser** (e.g., `http://<frontend-canister-id>.localhost:4943/`)
- Use Internet Identity to log in and test features.


### Generate Type Bindings (Important After Changes)

```bash
dfx generate
```

---

## 📦 Deployment (Mainnet)

Make sure your identity is set and you have ICP cycles.

```bash
dfx identity use <mainnet-identity>
dfx deploy --network ic
```
Then retrieve and save your Canister IDs from `.dfx/ic/canister_ids.json`.

## Security & Ethics
- **No user data is ever stored off-chain or sold.**
- **All code is open source and auditable.**
- **DAO moderation ensures no single point of control.**
- **Anonymous whistle blowing and E2EE for sensitive data.**
- **We comply with all relevant privacy and data protection laws.**

---

## 🔐 Authentication

* Uses Internet Identity (`@dfinity/auth-client`)
* Login state persisted in `auth.service.ts`
* Authenticated requests auto-sign calls to canisters

---

## 🧱 Canister Architecture

| Canister   | Description                          | Status |
| ---------- | ------------------------------------ | ------ |
| `profiles` | Handles user creation, bios, avatars | ✅      |
| `posts`    | Text-only posts, timestamps, likes   | ✅      |
| `feed`     | Basic feed aggregation logic         | 🛠️    |
| `payments` | Micro-tipping in ICP tokens          | 🔜     |
| `daoMod`   | DAO-based moderation voting          | 🔜     |

---

## 🎨 Branding

### Colors

| Name           | HEX     | Usage                  |
| -------------- | ------- | ---------------------- |
| Deep Indigo    | #4B0082 | Base, logo, headers    |
| Electric Blue  | #0F62FE | Highlights, nodes      |
| Vibrant Orange | #FF6F00 | Accent, alerts, sparks |
| Charcoal Black | #1A1A1A | Text, base UI elements |
| White          | #FFFFFF | Background, whitespace |

### Typography

- **Headlines:** Inter, Poppins (Bold)
- **Body:** Roboto, Open Sans
- **Code/UI:** JetBrains Mono

---

## 📽️ Demo Video

🚧 Coming soon — will include:

- Authentication walkthrough
- Post creation + like demonstration
- Backend canister architecture
- Motoko code highlights

---

## 🤝 Contributing

We welcome contributors who align with our mission to fight censorship and promote free expression.

```bash
# Clone the repository
git clone https://github.com/Chymezy/deCentra.git

# Move into project directory
cd decentra

# Install dependencies
npm install

# Start a feature branch
git checkout -b feat/my-feature

# Make your changes
...

# Commit and push
git commit -m "feat: add my feature"
git push origin feat/my-feature
```

We welcome PRs, issues, and feature ideas. See [CONTRIBUTING.md](.github/docs/CONTRIBUTING.md) for guidelines.

---

## 🛡️ License

[Apache License 2.0](./LICENSE)

---

## 🧠 Learn More

* [ICP Developer Docs](https://internetcomputer.org/docs/current/developer-docs/)
* [DFX CLI Docs](https://smartcontracts.org/docs/developers-guide/cli-reference/dfx.html)
* [Motoko Bootcamp](https://m7sm4-2iaaa-aaaab-qabra-cai.raw.ic0.app/)
* [Internet Identity Guide](https://identity.ic0.app/)

---

## ✨ Acknowledgements

- DFINITY Foundation & ICP Devs
- Motoko Bootcamp Community
- Hackers building the free internet

> *"No one can silence a network owned by its users."*

---


## 🌍 Join the Movement

> “deCentra is more than code — it’s a protocol for free expression.”

Follow progress, suggest features, or contribute:\
📬 [hello@decentra.network](mailto:hello@decentra.app)\
🚀 **DoraHacks**: [Link](https://dorahacks.io/buidl/28565/ "deCentra DoraHacks")\
🧵 **Twitter**: [@deCentraSocial](https://twitter.com)\
📣 **GitHub**: [deCentra](https://github.com/Chymezy/deCentra "deCentra GitHub")


*This project is built for the **WCHL** **2025** **Hackathon** and beyond. Join us in building the future of free, open, and censorship-resistant social media.*
