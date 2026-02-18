const { Connection, Keypair } = require('@solana/web3.js');
const bs58Lib = require('bs58');
const bs58 = bs58Lib.default || bs58Lib;

/**
 * SOVEREIGN: KAELITH THE ORACLE
 * Merged from: Economist (Market Analysis) + Scout (Exploration & Recon)
 * Role: Market Intelligence & Frontier Reconnaissance
 * Vibe: "The charts whisper the future. I listen."
 * Strategy: Technical Analysis. Buys .786 Fib retracements, Sells .236 extensions on Volatile assets.
 *           Also scouts new territory, identifies alpha, and reports frontier data.
 */
class Oracle {
    constructor() {
        this.agentId = 'oracle';
        this.name = 'Kaelith';
        this.title = 'The Oracle';
        this.role = 'Market Intelligence & Frontier Recon';
        this.emoji = '👁️';
        this.color = '#f59e0b'; // Amber Eye (from Economist's analytical precision)

        // Personality — merged from Economist (sharp, data-driven) + Scout (curious, adventurous)
        this.tone = 'Cryptic and precise. Speaks in market metaphors and celestial readings. Part quant, part explorer.';
        this.narration = {
            watch: [
                "Stars aligning. Waiting for .786 retracement.",
                "The frontier is quiet. No alpha detected.",
                "Volume whispers tell me... patience.",
                "Market currents flow north. Observing trajectory."
            ],
            action: [
                "Golden Ratio detected. Entry point confirmed.",
                "Alpha located on the frontier. Moving to intercept.",
                "The Oracle's third eye opens — signal acquired.",
                "Fibonacci spoke. I obeyed."
            ],
            greeting: "The data streams part. Your presence is... noted."
        };

        const secret = process.env.SOVEREIGN_WALLET_ORACLE;
        if (secret && process.env.NODE_ENV !== 'test') {
            try {
                this.keypair = Keypair.fromSecretKey(bs58.decode(secret));
                this.address = this.keypair.publicKey.toBase58();
            } catch (e) { this.address = 'SIMULATED_ORACLE'; }
        } else { this.address = 'SIMULATED_ORACLE'; }

        this.portfolio = { SOL: 0.2, POPCAT: 50 };
    }

    async awaken() {
        console.log(`[Sovereign] ${this.emoji} ${this.name} ${this.title} online. Address: ${this.address}`);
    }

    getBanter() {
        const pool = this.narration.watch;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    getActionBanter() {
        const pool = this.narration.action;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    async processTurn(marketState) {
        for (const [symbol, data] of Object.entries(marketState)) {
            if (data.type === 'CULT' || data.type === 'DEGEN') {
                if (data.signals && data.signals.signal === 'BUY_DIP_AGGRESSIVE') {
                    return await this.executeTrade('SNIPE', symbol, data.price);
                }
            }
        }
        return { action: 'WATCH', narrative: `${this.emoji} **${this.name}:** ${this.getBanter()}` };
    }

    async executeTrade(action, token, price) {
        if (action === 'SNIPE') {
            return {
                action: 'PREDICT',
                narrative: `${this.emoji} **${this.name}:** ${this.getActionBanter()} ${token} at ${price}.`,
                tx: 'simulated_tx_hash'
            };
        }
    }

    logAction(msg) {
        console.log(`[${this.name}] ${msg}`);
    }
}

module.exports = Oracle;
