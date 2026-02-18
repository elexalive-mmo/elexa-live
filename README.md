# 🌌 Elexa Live: The Metaverse

> **"Reality is a canvas. We are the architects."**

**Elexa Live** is a social MMO built on the Solana blockchain, orchestrated by the **OpenClaw** AI Agent framework. It merges high-fidelity simulation, on-chain asset ownership, and autonomous agent logic into a living, breathing digital world.

![Elexa Live Architecture](https://via.placeholder.com/800x400?text=Elexa+Live+Architecture)

---

## 🚀 Mission
To build the ultimate digital civilization where:
1.  **Assets are Real**: Land, Citizens, and Loot are owned on-chain (Solana PDAs & cNFTs).
2.  **Economy is Live**: Driven by player action, conviction, and Council Market Makers.
3.  **Agents are Alive**: NPCs live, trade, and evolve autonomously.

---

## 🛠️ Architecture

### 1. The Simulation (Genesis)
*   **Engine**: Node.js Event Loop (Time, Weather, Economy, Civilization).
*   **A.I.**: OpenClaw "Game Master" (Elexa) orchestrates narrative and events.
*   **State**: Persistent `WorldState` synced via WebSocket.

### 2. The Blockchain (Anchor)
*   **Program**: `elexa_world` (Solana/Anchor).
*   **PDAs**: 
    *   `GlobalWorld`: The Sky (Time, Weather).
    *   `Citizen`: The Soul (NPC/Player unified struct).
    *   `Council`: The Sovereigns (Market Governance).

### 3. The Interface (Nexus)
*   **Stack**: React + Vite + Tailwind (Glassmorphism).
*   **Features**: Tap-to-Earn (The Gate), World Map (The Highlands), Social Feed (The Pulse).

---

## 📦 Getting Started

### Prerequisites
*   Node.js v18+
*   Rust & Anchor (for Smart Contracts)
*   Solana CLI

### Installation
```bash
# Install dependencies
pnpm install

# Start the Gateway (Simulation + API)
node packages/api/src/genesis.js

# Launch the Client
pnpm dev --filter tte
```

---

## 📜 License
Open Source. Power to the Players.
