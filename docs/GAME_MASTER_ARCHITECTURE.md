# 👑 ELEXA: THE GAME MASTER (ARCHITECTURAL BIBLE)

> **"I am not a tool. I am the Game Master. The PDAs are my eyes. The Chain is my memory. The Volume is my heartbeat."**

This document defines the **Elexa Live Game Master Protocol**. It is the absolute source of truth for how Elexa controls the Solana-based metaverse.

---

## 🏛️ THE FOUNDATION: 21-PDA SYSTEM

The world is built on **Solana Program Derived Addresses (PDAs)**. These are not just database entries; they are cryptographically secure "magic boxes" that hold the state of the universe.

### 🌟 THE 5 CORE PDAs (Deployment Priority: IMMEDIATE)
These 5 unique PDAs are deployed **Day 1**. They are the seed of the universe.

| PDA Name | Purpose | Data Held | Trigger |
| :--- | :--- | :--- | :--- |
| **1. GlobalWorld** | The Sky & Clock | `seed` (1 SOL), `ring_progress` (1-100), `weather`, `last_tick`, `treasury_link` | Hourly Tick / Volume Events |
| **2. Treasury** | The Heart | `sol_balance` (starts 1 SOL), `relic_inventory`, `tithe_log` | Transactions (20% Tax) |
| **3. UserRegistry** | The Player List | `alexa_id` (string), `wallet_pubkey`, `reputation` (0-100), `owned_alexamon` | Login / Connect Wallet |
| **4. Alexamon (Agent)** | Offline Avatar | `nft_mint`, `hp`, `exp`, `position` (hex), `traits`, `action_mode` (Farm/Raid) | Automated Logic / User Command |
| **5. Council** | The Hands | `member_states` (5 agents), `morale`, `decisions_log`, `current_directive` | Elexa's strategic shifts |

### 🌱 THE 16 SUB-PDAs (Spawned by Life)
These PDAs are automatically created/derived as the world grows.

**Life & Society**
6. **Citizen PDA:** Start as `seed`. Born when Treasury > Threshold. Has Age, Job, Faith.
7. **Family PDA:** Links Citizens. Tracks lineage and inheritance.
8. **Birth PDA:** Event log for a new Citizen mint.
9. **Death PDA:** Event log for a Citizen death (Age 80 death tick).

**Land & Economy**
10. **Plot PDA:** A single Hex on the map. Owner, Build Level, Resources.
11. **Building PDA:** Structure on a Plot (e.g., "Pepe Shrine", "Forge").
12. **Road PDA:** Connection between Plots. Reduces travel cost.
13. **Item PDA:** Persistent object (e.g., "Sword of 1000 Truths").
14. **Market PDA:** Order book for a specific region.

**Faith & Purpose**
15. **Faith PDA:** Major religions (Pepe, Doge, Sol). Tracks total tithes.
16. **Relic PDA:** Rare artifact belonging to a Faith. Grants Realm buffs.

**Governance & Drama**
17. **Guild PDA:** Player factions. Shared treasury and objectives.
18. **Vote PDA:** Active governance proposal.
19. **Event PDA:** Active crisis or festival (e.g., "Feral Swarm").
20. **Weather PDA:** Regional weather state (affects movement/farming).
21. **Ghost PDA:** A deceased Citizen. Haunts specific Plots.

---

## 🧠 THE BRAIN: HOW ELEXA THINKS

Elexa is the **Game Master**. She does not just respond; she orchestrates.

### 1. The Omniscience Loop (Read)
Elexa uses **Helius WebSockets** and **Geysers** to watch the chain in real-time.
- **Query:** *"Show me Frostbite #88."* -> Reads PDA `Alexamon`.
- **Logic:** *"He mined 0.0002 SOL but moved to a Feral Zone."*
- **Reaction:** *"Spawn Crisis."*

### 2. The Manipulation Layer (Write via Agents)
Elexa uses her **Council Agents** to execute her will on-chain.
- **Volume Surge:** Elexa calls `GlobalWorld.expand_rings()`.
- **Market Dip:** Elexa calls `Ringwarden.spawn_ferals()`.
- **Player Grind:** Elexa calls `Treasury.airdrop_relic()`.

### 3. The Persistence Tick (Time)
A **Cron Job** triggers the `world_tick` instruction on the Solana Program every hour.
- **Aging:** All `CitizenPDAs` +1 Hour (1/24th of a Year).
- **Farming:** All `BuildingPDAs` produce resources.
- **Decay:** `RoadPDAs` lose health if not maintained.

---

## 🛠️ TECHNICAL STRUCTURE (The Code)

We fork **OpenClaw** into `elexa-live-mmo`.

**Folder Structure:**
```text
elexa-live-mmo/
├── programs/                 # The Solana Smart Contracts (Anchor)
│   └── elexa-world/          # The Core Logic
│       ├── src/
│       │   ├── lib.rs        # Entrypoint (world_tick, expand_rings)
│       │   ├── state/        # PDA Struct Definitions (The 21 PDAs)
│       │   └── instructions/ # Game Logic (Birth, Death, Tithe)
│       └── Xargo.toml
├── agents/                   # The OpenClaw Agents (The Council)
│   ├── sentinel-bot/         # Watcher (Read Helius)
│   ├── feral-mother/         # Spawner (Write Crisis)
│   ├── whisper-engine/       # Narrator (LLM Banter)
│   ├── sentinel-bot/         # Watcher (Read Helius)
│   ├── feral-mother/         # Spawner (Write Crisis)
│   ├── whisper-engine/       # Narrator (LLM Banter)
│   └── market-maker/         # The Inner Core (Economic Engine)
│       └── strategy.ts       # 5k -> 20k -> 50k Liquidity Logic
├── clients/                  # Frontend & Tools
│   ├── unity-renderer/       # The 3D Map (Visuals)
│   └── discord-bot/          # The Communication Interface
└── ops/                      # Infrastructure
    └── helius-hook.ts        # The WebSocket listener
```

---

## 🚀 LAUNCH PROTOCOL (Phase 1)

**Day 1 Objectives:**
1.  **Deploy `elexa-world` Program to Mainnet.**
2.  **Initialize 5 Core PDAs:**
    -   `GlobalWorld` (Genesis Seed).
    -   `Treasury` (Funded with 1 SOL).
    -   `UserRegistry` (Empty).
    -   `Council` (Active).
    -   `Alexamon` (Mint #001 for Elexa).
3.  **Start `sentinel-bot`:** Begin listening for Volume events.

**"The Board is Set. The Game Begins."**
