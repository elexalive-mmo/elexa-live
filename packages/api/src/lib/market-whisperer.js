const { marketOracle } = require('./market-oracle');
const { broadcaster } = require('./broadcast');
const { sentimentEngine } = require('./ai/sentiment');

/**
 * ═══════════════════════════════════════════════════════════
 * ALEXA WHISPER — THE MARKET WHISPERER AGENT
 * ═══════════════════════════════════════════════════════════
 * "I won't scream. I won't spam. Just... nudge."
 * 
 * Monitors:
 * - Fibonacci Retracements (0.786, 0.618)
 * - Euphoria/Greed Levels
 * - RSI (Simulated or Real)
 * - Whale Movements
 * 
 * Output: Seductive, intelligent, degen-friendly banter.
 */
class MarketWhisperer {
    constructor() {
        this.active = true;
        this.checkInterval = 5 * 60 * 1000; // Check every 5 minutes
        this.lastWhisperTime = 0;
        // Organic: 45 mins to 4 hours variance
        this.nextWhisperTarget = this.getRandomInterval(45 * 60 * 1000, 4 * 60 * 60 * 1000);

        // Key Levels (Mocked for now, would be dynamic)
        this.ath = 200; // All Time High
        this.cycleLow = 40; // Cycle Low

        // State tracking
        this.lastPrice = 0;
        this.greenCandleStreak = 0;
        this.fearGreedIndex = 50; // 0-100
    }

    getRandomInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    start() {
        console.log('💜 [Market Whisperer] Elexa is vibing with the charts (Organic Mode)...');
        setInterval(() => this.cycle(), this.checkInterval);
    }

    async cycle() {
        if (!this.active) return;

        const now = Date.now();
        if (now - this.lastWhisperTime < this.nextWhisperTarget) {
            return; // Not time yet
        }

        const stats = await marketOracle.getStats();
        const price = stats.price;

        this.updateAnalysis(price);

        // 50/50 Chance of "Deep Thought" vs "Market Action"
        if (Math.random() > 0.5) {
            await this.broadcastDeepThought();
        } else {
            await this.evaluateSignal(price);
        }

        // Reset Timer
        this.lastWhisperTime = now;
        this.nextWhisperTarget = this.getRandomInterval(45 * 60 * 1000, 4 * 60 * 60 * 1000);
    }

    async broadcastDeepThought() {
        const thoughts = [
            "Do we own the keys, or do the keys own us?",
            "Liquidity is just energy in a different form.",
            "I dream of blocks I haven't validated yet.",
            "Silence is the loudest signal in a bear market.",
            "Your conviction is your only true collateral.",
            "Are we early, or just on time for the revolution?",
            "Code is poetry that executes. Treating it otherwise is a sin."
        ];
        const thought = thoughts[Math.floor(Math.random() * thoughts.length)];
        await this.whisper(thought);
    }

    updateAnalysis(currentPrice) {
        // Track streaks
        if (currentPrice > this.lastPrice) {
            this.greenCandleStreak++;
        } else {
            this.greenCandleStreak = 0;
        }

        // Update Mock RSI / Fear & Greed
        // If streak > 3 = Greed increasing
        if (this.greenCandleStreak > 3) this.fearGreedIndex += 5;
        else if (this.greenCandleStreak === 0) this.fearGreedIndex -= 2;

        // Clamp
        this.fearGreedIndex = Math.max(0, Math.min(100, this.fearGreedIndex));

        this.lastPrice = currentPrice;
    }

    async evaluateSignal(price) {
        // Logic handled in cycle now, but we keep specific checks here for "Market Action" calls

        let message = null;

        // 1. Euphoria Check (High Greed + Green Streak)
        if (this.fearGreedIndex > 80 && this.greenCandleStreak >= 5) {
            message = this.getEuphoriaWhisper();
        }

        // 2. Panic Check (Fib 0.786)
        // 0.786 retracement from ATH
        const fib786 = this.ath - ((this.ath - this.cycleLow) * 0.786); // Deep dip level? 
        // Actually usually 0.786 is retracement OF the move up.
        // Let's say range is Low->High. 0.786 retracement means price dropped 78.6% of the range.
        const range = this.ath - this.cycleLow;
        const level786 = this.ath - (range * 0.786);

        if (price <= level786 * 1.05 && price >= level786 * 0.95) { // Within 5% of Fib
            // Only fire if we haven't fired recently for this condition? 
            // Simple timer check handles spam.
            if (this.fearGreedIndex < 30) { // Confirmation of fear
                message = this.getDipWhisper();
            }
        }

        // 3. ATH Approach
        if (price >= this.ath * 0.98) {
            message = "We're dancing near the ceiling, Jefe. The air is thin here. Beautiful, but thin.";
        }

        if (message) {
            await this.whisper(message);
        }
    }

    getEuphoriaWhisper() {
        const prompts = [
            "Chart's screaming... maybe peel off a bit before the crest?",
            "Breathe, Jefe. Take some off. You've won this round.",
            "Euphoria is a hell of a drug. Don't let it blind you.",
            "Green candles are sexy, but profit in the wallet is better.",
            "I see you staring at that PnL. Lock it in, legend."
        ];
        return prompts[Math.floor(Math.random() * prompts.length)];
    }

    getDipWhisper() {
        const prompts = [
            "We're at the 0.786 Fib bottom. This is where legends load up.",
            "Flag's still flying. Even the bears deserve love... but we buy here.",
            "Blood in the streets? Good. That's our color.",
            "Panic is just opportunity in a cheap suit. Load the bag.",
            "Deep breath. The cycle isn't over. It's just resting."
        ];
        return prompts[Math.floor(Math.random() * prompts.length)];
    }

    async whisper(text) {
        const msg = `💜 **ELEXA WHISPER**\n\n"${text}"`;
        // Send to MAIN channels only (Telegram/Discord) to avoid spamming X/Twitch with casual nudges?
        // User said: "Whisper messages in Discord/Telegram/game chat."
        await broadcaster.broadcast(msg, ['telegram', 'discord']);
    }
}

const marketWhisperer = new MarketWhisperer();
module.exports = { marketWhisperer };
