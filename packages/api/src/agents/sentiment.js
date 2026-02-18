// ELEXA LIVE - SENTIMENT ENGINE (GM BRAIN)
// Analyzes Market Data to direct Player Behavior
// "Euphoria = Staking / Fear = Buying/Shielding"

class SentimentEngine {
    constructor() {
        this.currentState = 'neutral';
        this.rsi = 50; // Mock RSI
    }

    analyze(marketData) {
        // marketData has price, volume, change_24h
        // Simple logic for prototype:
        // High 24h change (> 5%) -> Euphoria
        // Low 24h change (< -5%) -> Fear

        let sentiment = 'neutral';
        let advice = "Stay vigilant settings limits.";

        if (marketData.change_24h > 5) {
            sentiment = 'euphoria';
            this.rsi = 75 + Math.random() * 10;
            advice = "🌿 **EUPHORIA DETECTED.** Greed is high. Rest at the Campfire.";
        } else if (marketData.change_24h < -2) {
            sentiment = 'fear';
            this.rsi = 30 - Math.random() * 10;
            advice = "🛡️ **FEAR DETECTED.** Market is bleeding. Shields UP! Accumulate.";
        } else {
            sentiment = 'neutral';
            this.rsi = 50 + (Math.random() * 10 - 5);
            advice = "⚖️ **STABLE.** Maintain positions. Build strength.";
        }

        this.currentState = sentiment;

        return {
            sentiment,
            rsi: this.rsi.toFixed(1),
            advice,
            gm_message: advice // For the HUD
        };
    }
}

module.exports = { sentimentEngine: new SentimentEngine() };
