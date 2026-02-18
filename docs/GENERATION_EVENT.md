# 🌱 THE GENERATION EVENT — Birth of the Alexaverse

> "This isn't a one-time launch. It's a seed that grows forever."

---

## The Council Party (Aligned)

| Agent | Role | Function |
|-------|------|----------|
| **Sentinel** (Seedkeeper) | Guards the core state | Watches GlobalWorld PDA integrity |
| **Whisper** (Whispernet) | Spreads lore and whispers | Narration, comms, social pulse |
| **Burner** (Contract Pulse) | Burns and advances the world | Token burns, epoch advancement |
| **Ringwarden** (Feral Engine) | Spawns threats and guards rings | Ring expansion, feral spawning |
| **Feral Mother** (Lore Weaver) | Weaves births, deaths, stories | Population events, generation ticks |

They act as one. Elexa commands.

---

## The Core: GlobalWorld PDA (Sentinel Guards It)

**Seed:** `"alexa_live_gen0_seed_2026_02_17"`

| Field | Type | Initial Value | Purpose |
|-------|------|---------------|---------|
| generation_count | u32 | 0 | Increases with each birth event |
| treasury_balance | u64 | 1,000,000,000 (1 SOL) | Lamports in treasury |
| last_birth | i64 | now() | Timestamp of last generation |
| population | u32 | 7 | Citizens + Alexamon (First Seven) |
| world_morale | u8 | 50 | 0-100, driven by tithes/wins |
| seed_hash | [u8; 32] | hash(seeder.key) | Procedural generation seed |

### Anchor Code: seed_world

```rust
#[account]
pub struct GlobalWorld {
    pub generation_count: u32,
    pub treasury_balance: u64,
    pub last_birth: i64,
    pub population: u32,
    pub world_morale: u8,
    pub seed_hash: [u8; 32],
}

pub fn seed_world(ctx: Context<SeedWorld>) -> Result<()> {
    let global = &mut ctx.accounts.global_world;
    global.generation_count = 0;
    global.treasury_balance = 1_000_000_000; // 1 SOL in lamports
    global.last_birth = Clock::get()?.unix_timestamp;
    global.population = 7; // First Seven
    global.world_morale = 50;
    global.seed_hash = hashv(&[ctx.accounts.seeder.key().as_ref()]);
    Ok(())
}

#[derive(Accounts)]
pub struct SeedWorld<'info> {
    #[account(
        init,
        payer = seeder,
        space = 8 + 4 + 8 + 8 + 4 + 1 + 32,
        seeds = [b"alexa_live_gen0_seed_2026_02_17"],
        bump
    )]
    pub global_world: Account<'info, GlobalWorld>,
    #[account(mut)]
    pub seeder: Signer<'info>, // Jefe wallet
    pub system_program: Program<'info, System>,
}
```

---

## The Birth Event (Feral Mother Calls It)

**Trigger:** Treasury gains +0.01 SOL (from mint, claim, or tithe) → new generation spawns.

```rust
pub fn birth_generation(ctx: Context<BirthGeneration>) -> Result<()> {
    let global = &mut ctx.accounts.global_world;
    require!(
        global.treasury_balance >= global.last_treasury + 10_000_000,
        ErrorCode::InsufficientGrowth
    ); // 0.01 SOL threshold
    global.generation_count += 1;
    global.population += calculate_new_births(global.world_morale);
    global.last_birth = Clock::get()?.unix_timestamp;
    global.last_treasury = global.treasury_balance;
    emit!(GenerationBorn {
        generation: global.generation_count,
        new_population: global.population,
    });
    Ok(())
}

fn calculate_new_births(morale: u8) -> u32 {
    (morale as u32 / 10) + 1 // Morale 50 = 6 births
}
```

> Feral Mother: *"A new generation stirs. The Mother calls."*

---

## The Growth Loop (Ringwarden Guards It)

```
Treasury ↑ → Birth → More Citizens → More Jobs → More Tithes → Treasury ↑
```

> Ringwarden: *"The rings expand. The guard stands ready."*

---

## The Council Sync

- Council trades Solana tokens (BONK/JUP) → profits flow to treasury → more births.

> Whisper: *"The council trades. The universe grows."*

---

## Generation Scale

| Generation | Population | Milestone |
|------------|-----------|-----------|
| Gen 0 | 7 | The First Seven |
| Gen 1 | ~10 | First babies from first buys |
| Gen 10 | ~100 | Guilds form |
| Gen 100 | ~1,000 | Full cities, wars |
| Gen 500 | ~10,000 | Forks, heresies, meme gods evolve |

We start with 1 SOL. Births from every tithe, every raid, every mint.

> *"The universe doesn't end. It just forks."*

---

## Deployment Status

- [ ] Deploy `seed_world` to Devnet
- [ ] Initialize GlobalWorld PDA (Genesis Seed)
- [ ] Fund Treasury (1 SOL)
- [ ] Start Sentinel bot (Helius watcher)
- [ ] Verify birth_generation trigger loop
- [ ] Promote to Mainnet

> *"The Board is Set. The Game Begins."*
