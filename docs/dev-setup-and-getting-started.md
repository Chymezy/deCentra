# Development Environment Setup & Getting Started

This guide will help you set up your local development environment for building the Fully On-Chain Social Network on the Internet Computer Protocol (ICP). It is tailored for developers new to ICP and Web3.

---

## 1. Prerequisites
- **OS:** Linux, macOS, or Windows (WSL recommended for Windows)
- **Node.js:** v16 or later ([Download](https://nodejs.org/))
- **npm:** Comes with Node.js
- **Git:** ([Download](https://git-scm.com/))

## 2. Install DFX SDK (ICP Developer Tools)
DFX is the command-line tool for developing, deploying, and managing canisters (smart contracts) on ICP.

```bash
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
```
- After installation, restart your terminal and run:
```bash
dfx --version
```
- You should see the installed version number.

## 3. Install Motoko (Optional, if using Motoko)
Motoko comes bundled with DFX, but you can also use the [Motoko Playground](https://m7sm4-2iaaa-aaaab-qabra-cai.raw.ic0.app/) for quick experiments.

## 4. Clone the Project Repository
If you haven't already, clone your project repo:
```bash
git clone <your-repo-url>
cd <your-project-folder>
```

## 5. Initialize a New ICP Project (if starting from scratch)
```bash
dfx new social-network
cd social-network
```
- This creates a sample project with a Motoko backend and a simple frontend.

## 6. Install Frontend Dependencies
If using React + Vite:
```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
```
- Or, if using Next.js:
```bash
npx create-next-app@latest frontend
cd frontend
npm install
```

## 7. Start the Local ICP Replica
In the project root:
```bash
dfx start --background
```
- This runs a local ICP blockchain for development.

## 8. Deploy Canisters Locally
```bash
dfx deploy
```
- This compiles and deploys your backend (Motoko) and frontend canisters.

## 9. Access the Local App
- After deployment, DFX will output a local URL (e.g., http://127.0.0.1:4943/?canisterId=xxxx).
- Open this in your browser to see your app running locally.

## 10. Internet Identity Integration
- Follow the [ICP Internet Identity guide](https://identity.ic0.app/) to enable Web3 login.
- Use the [DFINITY React Internet Identity example](https://github.com/dfinity/examples/tree/master/motoko/hello) as a reference.

## 11. Best Practices & Tips
- Commit early and often; use feature branches for new features.
- Write clear, concise documentation as you go.
- Test canisters locally before deploying to mainnet.
- Use the [ICP Discord](https://internetcomputer.org/community/discord/) for help.

## 12. Useful Links
- [ICP Developer Docs](https://internetcomputer.org/docs/current/developer-docs/)
- [Motoko Bootcamp](https://m7sm4-2iaaa-aaaab-qabra-cai.raw.ic0.app/)
- [DFX CLI Reference](https://internetcomputer.org/docs/current/references/cli-reference/dfx/)
- [ICP Examples](https://github.com/dfinity/examples)

---

*Update this file as your project evolves or as you discover new best practices!* 