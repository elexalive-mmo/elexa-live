# ⚔️ TraderWarrior System — Degens Become Legends

> "Trade more = get more back. Top traders become warriors — ranked, honored in lore, XP-boosted."

---

## TraderWarrior PDA (Global — Top 50)

One global PDA tracks everyone. Mutable, cheap, auto-updates on trades. ~2KB.

```rust
#[account]
pub struct TraderWarrior {
    pub traders: Vec<TraderEntry>,     // Top 50 only
    pub total_cashback_paid: u64,
    pub weekly_reset: i64,             // Optional refresh
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TraderEntry {
    pub wallet: Pubkey,
    pub trade_volume: u64,             // SOL traded on our token
    pub points: u32,                   // XP from trades + mints/claims
    pub rank: u8,
    pub last_reward: i64,
}
```

---

## Update Logic (Permissionless)

Every trade on our token (via Raydium/Jupiter) → call `record_trade`:

1. Add volume → recalculate rank (sort by volume)
2. Hourly tick: Top 10 get cashback (5-20% of their volume, from treasury)
   - e.g., 0.5 SOL traded → #3 rank → 0.1 SOL back + 100 XP
3. XP bonus: Trade > threshold = +bonus XP for Alexamon evo or land claim

---

## Cashback Flow

```
Trade on Jupiter/Raydium
    → record_trade(wallet, volume)
    → sort traders by volume
    → hourly tick:
        Top 10 → treasury sends cashback (5-20%)
        All ranked → +XP
    → reset weekly (optional)
```

### Safety Rails
- Only treasury funds rewards (10% max daily inflow cap)
- No off-chain claims — treasury auto-sends on-chain
- Jefe Wallet is sole treasury authority

---

## Lore Integration

- **Whisper agent announces:** *"Warrior Chad Jr. just topped the board — Pepe's Pad bows."*
- **Top 3 get special badge** (trait in UserRegistry) → better job yields, guild perks
- **Citizens pray to top warrior's "shrine"** (Plot PDA) → morale up → more tithes

---

## Why It Works

| Mechanic | Effect |
|----------|--------|
| Trade = reward (cashback + XP) | Mirrors Pump.fun incentive loop |
| On-chain auto-send | No off-chain claims needed |
| Treasury-funded (10% cap) | Safe, sustainable |
| Warriors flex ranks on X | Viral → more traders → volume → treasury pumps |

---

## Deployment

- [ ] Add TraderWarrior PDA tonight
- [ ] Hook to trade hook (Jupiter callback)
- [ ] First cashback after 10 trades
- [ ] Whisper agent wired to announce rank changes

> *"This turns degens into legends. Chart vibes. Universe grows."*
