// WHALE TRACKER — Operation Flip the Whale
// Target: a3W4qutoEJA4232T2gwZUfgYJTetr96pU4SJMwppump (The White Whale)
// Goal: Flip their Market Cap ($100M at start)

const axios = require('axios'); // Monitor only

const TARGET_CONTRACT = 'a3W4qutoEJA4232T2gwZUfgYJTetr96pU4SJMwppump';
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

class WhaleTracker {
    constructor() {
        this.whaleMC = 100_000_000; // Fallback
        this.ourMC = 0; // Updated by Price Oracle
        this.gap = 100_000_000;
        this.lastCheck = null;
    }

    async start() {
        console.log(`[WhaleTracker] 🐋 Tracking White Whale (${TARGET_CONTRACT})...`);
        this.checkLoop();
    }

    async checkLoop() {
        await this.updateStats();
        setTimeout(() => this.checkLoop(), CHECK_INTERVAL);
    }

    async updateStats() {
        try {
            // Live Fetch from DexScreener
            const response = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${TARGET_CONTRACT}`);
            if (response.data && response.data.pairs && response.data.pairs.length > 0) {
                // Get the pair with highest liquidity
                const bestPair = response.data.pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
                if (bestPair && bestPair.fdv) {
                    this.whaleMC = bestPair.fdv;
                    console.log(`[WhaleTracker] 📡 Live Data: Whale MC $${(this.whaleMC / 1e6).toFixed(2)}M`);
                }
            } else {
                console.log(`[WhaleTracker] ⚠️ No live data for target. Using fallback.`);
            }

            this.lastCheck = new Date();
            this.calculateGap();

            console.log(`[WhaleTracker] Status: Target $${(this.whaleMC / 1e6).toFixed(2)}M | Us $${(this.ourMC / 1e6).toFixed(2)}M | Gap $${(this.gap / 1e6).toFixed(2)}M`);
        } catch (e) {
            console.error('[WhaleTracker] Failed to update stats:', e.message);
        }
    }

    setOurMC(mc) {
        this.ourMC = mc;
        this.calculateGap();
    }

    calculateGap() {
        this.gap = Math.max(0, this.whaleMC - this.ourMC);
    }

    getStatus() {
        const percent = this.ourMC > 0 ? (this.ourMC / this.whaleMC) * 100 : 0;
        return {
            target: this.whaleMC,
            current: this.ourMC,
            gap: this.gap,
            percentFlipped: percent.toFixed(2) + '%',
            flipped: this.ourMC > this.whaleMC
        };
    }
}

module.exports = { WhaleTracker, TARGET_CONTRACT };
