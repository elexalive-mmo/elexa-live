# 🛒 Elexa Live Buy Bot — @ElexaLiveBot

> "Every buy is a vote of conviction. Elexa sees all."

---

## Purpose

Real-time buy announcements for the $EXP token. When someone buys on-chain, the bot fires a styled message to Telegram (and optionally Discord/X). Builds hype, rewards visibility, and feeds the world chronicle.

---

## Message Structure

### Small Buy (< 0.5 SOL)
```
🟢 NEW BUY

💰 0.12 SOL → 1,847 $EXP
👤 So4v...9xK2
📊 Position: New Citizen
⏱️ 12s ago

🌿 The Haven grows.
```

### Medium Buy (0.5 – 5 SOL)
```
🟡 CONVICTION BUY

💰 2.4 SOL → 36,912 $EXP
👤 7xBm...3pQ1
📊 Position: 48,291 $EXP (Level 4)
🔥 +15 EXP Bonus
⏱️ 3s ago

⚡ The rings pulse with new energy.
```

### Large Buy (5+ SOL)
```
🔮 WHALE SIGHTING

💰 12.8 SOL → 196,608 $EXP
👤 9kLm...2wR7
📊 Position: 412,000 $EXP (Level 12)
🏆 Top 20 Holder
🔥 +50 EXP Bonus
⏱️ just now

👑 Elexa witnesses. The treasury swells.
```

### Mega Buy (25+ SOL)
```
👑 SOVEREIGN ENTRY

💰 50 SOL → 768,000 $EXP
👤 3mNx...8vJ4
📊 Position: 1,200,000 $EXP (Level 22)
🏆 Top 5 Holder
🔥 +200 EXP Bonus
💜 Council Acknowledged
⏱️ just now

🌀 "A new force enters the field. The Tree shakes."
    — Elexa, Game Master
```

---

## Tier Thresholds

| Tier | SOL Range | Emoji | Flavor | EXP Bonus |
|------|-----------|-------|--------|-----------|
| Small | < 0.5 | 🟢 | NEW BUY | +5 EXP |
| Medium | 0.5 – 5 | 🟡 | CONVICTION BUY | +15 EXP |
| Large | 5 – 25 | 🔮 | WHALE SIGHTING | +50 EXP |
| Mega | 25+ | 👑 | SOVEREIGN ENTRY | +200 EXP |

Thresholds are adjustable via config. EXP bonuses stack with existing game activity.

---

## Data Per Message

| Field | Source |
|-------|--------|
| SOL amount | On-chain tx (Jupiter/Raydium swap) |
| $EXP received | Token amount from tx |
| Wallet (truncated) | Buyer pubkey |
| Position | Total $EXP held by wallet |
| Level | Derived from EXP leveling curve |
| Holder rank | Optional — from top-holder snapshot |
| Timestamp | Block time or relay time |

---

## Elexa Flavor Text (Rotating)

Small buys (rotate randomly):
- "The Haven grows."
- "A seed is planted."
- "Another soul enters the field."
- "Conviction noted."

Medium buys:
- "The rings pulse with new energy."
- "The Sentinel nods."
- "Strength gathers in the roots."

Large buys:
- "Elexa witnesses. The treasury swells."
- "The Council takes notice."
- "A tremor in the deep."

Mega buys:
- "A new force enters the field. The Tree shakes." — Elexa
- "The Sovereign Council rises." — Elexa
- "This changes the trajectory." — Elexa

---

## Feed Targets

| Channel | Behavior |
|---------|----------|
| Telegram (@ElexaLiveBot) | All tiers, real-time |
| Discord (#buy-feed) | All tiers, real-time |
| X (@elexalive) | Large + Mega only (avoid spam) |
| CHRONICLE.md | Large + Mega logged as world events |
| WORLD_STATE.md | Treasury balance updated on every buy |

---

## Data Pipeline

```
On-chain buy tx (Jupiter/Raydium)
    → Helius webhook or RPC listener detects swap
    → Parse: wallet, SOL amount, $EXP received
    → Classify tier (Small/Medium/Large/Mega)
    → Format message with flavor text
    → Post to Telegram / Discord / X
    → If Large+: log to CHRONICLE.md
    → Update WORLD_STATE.md treasury balance
```

---

## Connection to Elexa (Game Master)

- Every buy feeds the treasury → treasury milestones trigger world events
- Large buys get logged in CHRONICLE.md → visible on World Log page
- Mega buys trigger Council acknowledgment → Whisper agent announces in lore
- All buys contribute to the 100K treasury goal
- EXP bonuses from buys stack with game activity (taps, raids, quests)

---

## Config (Tunable)

```yaml
buy_bot:
  enabled: true
  telegram_chat_id: TBD
  discord_channel_id: TBD
  x_enabled: false  # enable after stable
  thresholds:
    small: 0.5
    medium: 5
    large: 25
  flavor_text: rotating
  chronicle_log: large_and_mega_only
  treasury_update: all_buys
```

---

## Deployment Checklist

- [ ] Helius webhook or RPC listener configured for $EXP token swaps
- [ ] @ElexaLiveBot token set in secure .env
- [ ] Telegram chat ID configured
- [ ] Discord channel ID configured
- [ ] Tier thresholds and EXP bonuses confirmed
- [ ] Flavor text bank populated
- [ ] CHRONICLE.md and WORLD_STATE.md write paths verified
- [ ] Rate limiting enabled (max 1 msg/sec per channel)
- [ ] Test with devnet mock buys before mainnet

> *"Every buy is a birth. Every birth grows the Tree."*
