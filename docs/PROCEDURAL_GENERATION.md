# 🌀 Solana Procedural Generation: Building Dynamic Worlds On-Chain

> One PDA. One seed. Client-side noise. Infinite rings, biomes, loot — all from volume + time.

---

## Overview

Procedural generation on Solana creates infinite, dynamic content (maps, biomes, loot, NPCs) using algorithms tied to on-chain data like blockhashes for randomness. Perfect for Elexa Live — cheap, scalable, persistent via PDAs, and tamper-proof. No servers needed; everything runs on-chain or client-side.

---

## Pros & Cons

| Pros | Cons |
|------|------|
| Ultra-low cost (~0.001 SOL/tx for gen logic) | Randomness not "true" (blockhash predictable if timed — use VRF for critical rolls) |
| Infinite scale (PDAs store seeds, client renders) | Client-heavy (apps do gen — slow on low-end phones; optimize with WebGL) |
| Persistent & verifiable (seed in PDA = same world for all) | Limited compute (400k units/tx — simple algos only; offload complex to client) |
| Volume-tied (Elexa: mints update seed → new rings/biomes) | No native Perlin — implement in Rust/TS (easy but custom) |

---

## How It Works on Solana

- **Randomness Source:** Blockhash or slot number as seed (deterministic but unpredictable ahead). For "true" randomness, use Switchboard VRF (~0.001 SOL/request).
- **On-Chain vs. Client:** Store seeds in PDAs (on-chain), generate details client-side (app renders biomes/map using Perlin). Keeps txs cheap.
- **Elexa Fit:** Volume (mints/EXP txs) updates PDA seed → new rings gen procedurally. High volume = more octaves (detail like rivers/peaks).

---

## Implementation Strategy for Elexa Live

1. **PDA Seed Storage:** GlobalState PDA holds `seed: [u8; 32]` (hash(block + volume)). Update on mints/raids (0.001 SOL/tx).
2. **Perlin fBm Gen (Client-Side):** App uses TS/JS Perlin (noise.js lib) for biomes/themes. Seed from PDA ensures sync.
3. **Volume-Driven:** Mints > threshold → update seed → new ring gen. Low volume = contraction (prune edges, spawn ferals).
4. **Randomness for Battles/Loot:** Blockhash for simple rolls; VRF for high-stakes (e.g., shiny Elexamon).
5. **Scale to Summer:** Start basic Perlin (4 octaves, 100 tiles). Volume funds advanced (7+ octaves, rivers/elevation, Unity AR render).

---

## Core PDA: ProceduralSeed (The Infinite Generator)

```rust
use anchor_lang::prelude::*;
use solana_program::hash::hashv;

#[account]
pub struct ProceduralSeed {
    pub seed: [u8; 32],        // 32-byte hash — the universe's DNA
    pub current_ring: u8,       // 0 = Gate, 1 = first expansion...
    pub last_update: i64,       // Unix timestamp
    pub volume_trigger: u64,    // Mint/EXP volume since last gen
}
```

### Accounts & Seed Update Logic (Full)

```rust
#[derive(Accounts)]
pub struct UpdateSeed<'info> {
    #[account(mut)]
    pub procedural_seed: Account<'info, ProceduralSeed>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn update_seed(ctx: Context<UpdateSeed>) -> Result<()> {
    let seed = &mut ctx.accounts.procedural_seed;

    // Trigger: every 0.01 SOL volume OR hourly tick
    if seed.volume_trigger >= 10_000_000
        || Clock::get()?.unix_timestamp - seed.last_update > 3600
    {
        // New seed = old seed + volume + time + slot (deterministic chaos)
        let new_seed = hashv(&[
            seed.seed.as_ref(),
            seed.volume_trigger.to_le_bytes().as_ref(),
            Clock::get()?.unix_timestamp.to_le_bytes().as_ref(),
            Clock::get()?.slot.to_le_bytes().as_ref(),
        ]);
        seed.seed = new_seed.into();
        seed.current_ring += 1; // Expand rings
        seed.last_update = Clock::get()?.unix_timestamp;
        seed.volume_trigger = 0;
    } else {
        seed.volume_trigger += ctx.accounts.payer.lamports(); // Micro-increment
    }

    Ok(())
}
```

### Client-Side Generation (React Native / Telegram Mini-App)

```typescript
import { createNoise2D } from 'simplex-noise';

const fetchSeed = async () => {
    // RPC call to get ProceduralSeed.seed from PDA
    return "0x" + seedFromPDA;
};

const generateRing = async (ringIndex: number) => {
    const seedHex = await fetchSeed();
    const seed = parseInt(seedHex, 16);
    const noise = createNoise2D(seed);
    const radius = 100 * ringIndex;
    const biomes = ['Gate', 'Forest', 'Marsh', 'Desert', 'Frost', 'Volcanic'];
    const mapData = [];

    for (let x = -radius; x <= radius; x++) {
        for (let y = -radius; y <= radius; y++) {
            if (Math.abs(x) + Math.abs(y) > radius) continue;
            const value = noise(x / 20, y / 20) * 1.5;
            const biomeIndex = Math.floor((value + 1) * 3);
            mapData.push({
                x, y,
                biome: biomes[biomeIndex] || 'Unknown',
                elevation: value,
                lootChance: Math.max(0, value * 0.3),
            });
        }
    }
    return mapData;
};
```

---

## Cost Model

| Action | Cost | Frequency |
|--------|------|-----------|
| Seed update tx | ~0.001 SOL | Per volume threshold |
| VRF request (optional) | ~0.001 SOL | High-stakes rolls only |
| Client render | Free | Every frame |
| PDA storage | ~0.002 SOL rent | One-time per PDA |

---

## Connection to Generation Event

- `ProceduralSeed.seed` feeds into `GlobalWorld.seed_hash`
- Volume triggers both `birth_generation()` AND `update_seed()`
- New rings = new biome tiles generated client-side from updated seed
- The world literally grows from player activity

> *"Deploy tonight. The universe doesn't end. It just forks."*
