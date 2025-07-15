# Fully On-Chain Social Network

## The Story: Why We Exist

In a world where governments ban apps, corporations sell your data, and social platforms become tools of control, billions are left voiceless or vulnerable. In 2023 alone, over 45 countries imposed new internet censorship laws. Creators, activists, and everyday users are losing trust in the platforms meant to connect them.

**We believe the internet should be free, open, and owned by its users.**

---

## The Problem: A Broken Social Media Landscape
- **Censorship is rising:** TikTok, Twitter, and others banned or restricted in dozens of countries.
- **Data misuse:** Big Tech fined billions for privacy violations and anti-competitive behavior.
- **Centralized control:** Governments and corporations can silence, surveil, or sanction anyone, anywhere.

---

## The Solution: Fully On-Chain Social
A censorship-resistant, privacy-first social network built 100% on the Internet Computer Protocol (ICP).
- **No centralized servers to seize or censor.**
- **Anonymous, cryptographic logins (Internet Identity).**
- **DAO-based moderation—community, not governments, decide.**
- **Creator monetization without intermediaries.**
- **Whistleblower tools for activists and NGOs.**

> “We’re building the social network for a free and open internet. One where governments can’t ban you. Corporations can’t sell you. And communities govern themselves.”

---

## Censorship Resistance & Privacy Technologies
![Censorship Resistance & Privacy Tech](./docs/Censorship%20Resistance%20&%20Privacy%20Technologies%20Diagram.png)

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
![System Architecture](./docs/Fully%20On-Chain%20Social%20Network%20Architecture.png)

---

## Development Phases & Roadmap
![Development Phases](./docs/Desarrollo%20de%20Red%20Social%20On-Chain.png)

---

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS
- **Authentication:** Internet Identity (ICP native)
- **Backend:** Motoko canisters (ICP)
- **Dev Tools:** DFX SDK, GitHub Actions
- **Deployment:** ICP mainnet

---

## Brand Identity
- **Colors:** Deep Indigo (#4B0082), Electric Blue (#0F62FE), Vibrant Orange (#FF6F00), White (#FFFFFF), Charcoal Black (#1A1A1A)
- **Typography:** Headlines: Inter/Poppins; Body: Roboto/Open Sans; Code: JetBrains Mono

---

## Installation & Local Development

### Prerequisites
- Linux/macOS/Windows (WSL recommended)
- Node.js v16+
- npm
- DFX SDK ([ICP install guide](https://internetcomputer.org/docs/current/developer-docs/setup/install))

### Setup & Run

```bash
# Clone the repo
git clone <your-repo-url>
cd social-network

# Install frontend dependencies
cd src/social-network-frontend
npm install

# Go back to project root
cd ../..

# Start local ICP replica
dfx start --background

# Deploy canisters (backend and frontend)
dfx deploy
```

- After deployment, dfx will print URLs for your frontend and backend canisters.
- **Open the frontend canister URL in your browser** (e.g., `http://<frontend-canister-id>.localhost:4943/`)
- Use Internet Identity to log in and test features.

---

## Security & Ethics
- **No user data is ever stored off-chain or sold.**
- **All code is open source and auditable.**
- **DAO moderation ensures no single point of control.**
- **Anonymous whistleblowing and E2EE for sensitive data.**
- **We comply with all relevant privacy and data protection laws.**

---

## Contributing
We welcome developers, designers, and activists! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## License
[MIT License](./LICENSE)

---

## Contact & Links
- **DoraHacks:** [Link]
- **GitHub:** [Link]
- **Email:** your@email.com

---

*This project is built for the WCHL 2025 Hackathon and beyond. Join us in building the future of free, open, and censorship-resistant social media.*
