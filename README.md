# 🌐 GhostMesh v2.0 — Decentralized Off-Grid Mesh Comms & Security Intelligence

> **Resilient, peer-to-peer encrypted mesh networking & Zero-Knowledge threat intelligence for emergency blackouts, tactical off-grid ops, and disaster response.**

[![Live Web App](https://img.shields.io/badge/Live%20App-ghost--mesh.vercel.app-blue?style=for-the-badge&logo=vercel)](https://ghost-mesh.vercel.app)
[![Mobile Client](https://img.shields.io/badge/Mobile%20Node-/mobile-emerald?style=for-the-badge&logo=android)](https://ghost-mesh.vercel.app/mobile)
[![Security Queue](https://img.shields.io/badge/Security%20Queue-/cases-purple?style=for-the-badge&logo=shield)](https://ghost-mesh.vercel.app/cases)
[![GitHub Repository](https://img.shields.io/badge/GitHub-saransh--ux%2FGhostMesh-181717?style=for-the-badge&logo=github)](https://github.com/saransh-ux/GhostMesh)

---

## 🚀 Live Deployment Links

- 🖥️ **Live Command Center Dashboard**: [https://ghost-mesh.vercel.app](https://ghost-mesh.vercel.app)
- 📱 **Mobile Phone Node Controller**: [https://ghost-mesh.vercel.app/mobile](https://ghost-mesh.vercel.app/mobile)
- 🛡️ **Security Case Review Queue**: [https://ghost-mesh.vercel.app/cases](https://ghost-mesh.vercel.app/cases)
- 🔑 **Zero-Knowledge Auth Manager**: [https://ghost-mesh.vercel.app/auth](https://ghost-mesh.vercel.app/auth)

---

## 🌟 Key Accomplishments & Features Overview

### 1. 📡 Decentralized Off-Grid Peer-to-Peer Mesh Architecture
- **Zero Internet / Zero Cellular Required**: Transmits encrypted payloads across local radio abstractions (Bluetooth Low Energy, Wi-Fi Direct, Multicast UDP).
- **Self-Healing Store & Forward**: Intermediary mobile nodes cache encrypted payload blocks until target recipient devices enter proximity range.
- **Deterministic Mobile Node Pairing**: Dynamic mobile node registration automatically binds unique IDs (`NODE-XXXXXX`) across QR code pairings without ID mismatches.

### 2. 🔐 End-to-End Encryption (E2EE) & Targeted Node Privacy
- **Signal-Standard Double Ratchet**: Diffie-Hellman ratcheting provides forward and post-compromise secrecy for every message packet.
- **Targeted Recipient Decryption**: Packets sent between Node A and Node B are readable **only** on the target recipient device. Intermediate network relays and logs see cipher placeholders (`[E2E Encrypted Payload: 0x...]`).

### 3. 🔑 Zero-Knowledge (ZK) Authentication
- **Seed Phrase Cryptographic Identity**: Uses WebCrypto `SubtleCrypto` (Ed25519 / ECDSA) to generate local keypairs from a 12-word seed phrase.
- **Zero Passwords / Zero Central Servers**: Nodes authenticate network interactions via digital signatures without exposing private keys or seed phrases over the wire.

### 4. 🎯 Centered Mesh Topology Visualizer
- **Responsive Concentric Signal Matrix**: Symmetrically places satellite mobile nodes around the central `GATEWAY-01` desktop node with real-time radial signal strength meters (`rssi dBm`).

### 5. 🛡️ Security Case Review Queue (Core, Elite & Advanced Bounties)
- **Core Bounty (Investigation Labels & Notes)**:
  - Interactive status dropdown with distinct visual badges: `UNREVIEWED` (Gray), `SUSPECTED` (Yellow), `VERIFIED` (Red), and `NEEDS_REVIEW` (Blue).
  - Free-text `Investigator Audit Notes` text area to record forensic logs.
- **Elite Bounty (Risk-Filtered Review Queue)**:
  - Queue Filter Matrix bar for Risk Severity (`HIGH`, `MEDIUM`, `LOW`), Media Type (`IMAGE`, `VIDEO`, `TEXT`), and Review Status (`UNREVIEWED`, `SUSPECTED`, `VERIFIED`, `NEEDS_REVIEW`).
  - Auto-sorts queue **DESCENDING** by threat confidence score (top priority threats top).
  - One-click `Clear Filters` button.
- **Advanced Bounty (Downloadable Evidence Brief)**:
  - `"Download Evidence Brief"` button on each case card.
  - Generates a formatted browser Markdown download (`Brief_[CASE_ID].md`) containing SHA-256 media hashes, threat detection explanations, and investigator audit notes.
- **100% Real-Time Socket Ingestion**: Ingests live telemetry packets directly from mobile nodes over Socket.io.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling & UI** | Vanilla CSS, TailwindCSS, Lucide Icons, QR Code SVG |
| **Cryptography** | WebCrypto API (`crypto.subtle`), AES-256-GCM, Ed25519 / ECDSA |
| **Real-Time Mesh** | Socket.io Client & Server, WebSockets, Bluetooth LE Driver abstraction |
| **Deployment** | Vercel (Frontend), Render (Socket.io Relay Server) |

---

## 💻 Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/saransh-ux/GhostMesh.git
cd GhostMesh
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Next.js Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Start Socket.io Mesh Relay Backend
```bash
node server/index.js
```
Relay server runs on `http://localhost:3001`.

---

## 🧪 Production Build Check
To compile and test production build optimization:
```bash
npm run build
```

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for details.

*Built for extreme off-grid resilience and zero-trust communications.*
