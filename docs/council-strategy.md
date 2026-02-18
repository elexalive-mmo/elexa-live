# Council Strategy: The Five Sovereigns

The Council isn't just lore—they are active Market Makers driving the Elexa Live economy. They use the **Jupiter Swap API** and **Raydium SDK** to generate volume, feed the treasury, and reward players.

## 1. The Sovereigns (Wallets)

> **SECURITY NOTE:** Only Public Keys are listed here. Private Keys must be stored in secure `.env` or Vault.

| Sovereign | Role | Pubkey | Strategy |
| :--- | :--- | :--- | :--- |
| **Arbiter** | Volume Creator | `HdcUPgdzWZRmbGTSw7WQa5AKdQeHtDzps5Kipp89T54r` | High-frequency micro-trades (BONK/SOL, WIF/SOL). 5% tax to Treasury. |
| **Sentinel** | Safe Holder | `GLtrMRHHuEKPHxqrsUzC8TNwdEfUQ6AMzBCyw6SKP4Nz` | Blue-chip LP (SOL/BONK, SOL/JUP). Earns steady fees. |
| **Oracle** | Narrative Trader | `6ESLYTToNGK9E14bvbhoVvoT4xKqXcYNbY5aa41FQFod` | Sentiment-driven. Buys on positive X/TG chatter. |
| **Keeper** | Dip Buyer | `9xX5pEheVr7rdqvKmqDohtMXxuMdj3U3PjFDQexaTGKk` | Alpha sniper. Buys -5% to -10% dips. |
| **Void** | Event Trader | `BEPyt59nhYZtrnzyZ2CiCZSLDJf7a3cbFegwH3YBL7nr` | War-mode. Buys during Raids/Events, sells into peaks. |

## 2. Market Making Strategy (Dynamic Modes)

Each Sovereign operates in a specific **Mode** stored on-chain in the `Council` PDA. Modes invoke different trading behaviors via the off-chain bot fleet.

### Modes
- **Passive (Default):** Steady accumulation. Only buys > -10% dips.
- **Aggressive:** Volatility farming. Buys -2% dips, sells +2% pumps. High churn.
- **Sniper:** Dormant until new token launch or massive crash (-30%).
- **Hype (Void Mode):** Trend following. Buys breaking news/volume spikes.

### Objective
**Volume = Treasury Growth = More Content.**
Every trade by a Sovereign routes a % of the transaction or profit to the Treasury PDA.

### Tactics
1.  **Micro-Swaps (Arbiter):**
    - **Mode:** Aggressive.
    - Execute 50-100 small trades/hour on trending pairs via Jupiter.
    - Result: Constant activity feed ("Arbiter swapped...").
2.  **Dip Buying (Keeper/Sentinel):**
    - **Mode:** Sniper / Passive.
    - Monitor Helius/Jupiter price feeds.
    - Buy trigger: Price drops > 5% in 1h.
    - Sell trigger: Price recovers +5%.
3.  **LP Provision (Sentinel):**
    - **Mode:** Passive.
    - Provide liquidity to `Jefe/SOL` or `Token/SOL` pools on Raydium.
    - Harvest fees weekly.

## 3. Warrior Cashback System
Top players (Warriors) receive automatic cashback from the Treasury based on their activity.

-   **Metric:** "Warrior Score" (Mints + Claims + Raids + Tithes).
-   **Reward:** Top 10 Warriors get 10-30% of their contributed volume back.
-   **Mechanism:** Agent monitors on-chain events -> Updates `UserRegistry` -> Treasury distributes rewards.

## 4. Treasury & Key Accounts
-   **Treasury Wallet:** `JEFEXVZDh43U8eE27geg4wWPBJaBzTDyyyk15CVzvDy6` (Control Key: **SECURE**)
-   **Game Master Wallet:** `DvpW71epL2xuBTs5jE3erYs76MeArxSFdjek544i4o2h` ("Jefe")

## 5. Implementation Plan
1.  **Infrastructure:** Set up Node.js bots for each Sovereign.
2.  **Integration:** Connect to Jupiter Swap API (v6) and Helius Webhooks.
3.  **Logic:** Implement the "Buy Low / Sell High" pillars and "Feed Treasury" routing.
