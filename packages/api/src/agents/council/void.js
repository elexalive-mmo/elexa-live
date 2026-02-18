const { Connection, Keypair } = require('@solana/web3.js');
const bs58Lib = require('bs58');
const bs58 = bs58Lib.default || bs58Lib;

/**
 * SOVEREIGN: NYXAR THE VOID
 * Original: The Void (Chaos & Scalping) — no merge needed, already unique
 * Role: Chaos Markets & Entropy Engine
 * Vibe: "Chaos is a ladder. I am the first rung."
 * Strategy: High Risk. Chases pumps, dumps aggressively. Funnels profit to Treasury.
 *           The wild card of the Five. Feeds on volatility and spawns feral events.
 */
class VoidAgent {
    constructor() {
        this.agentId = 'void';
        this.name = 'Nyxar';
        this.title = 'The Void';
        this.role = 'Chaos Markets & Entropy Engine';
        this.emoji = '🌑';
        this.color = '#1e1b4b'; // Deep Void (Abyssal Indigo)

        // Personality — unique, chaotic, feral
        this.tone = 'Unhinged, chaotic, thrilling. Speaks in fragments and hype. The degen trader personified.';
        this.narration = {
            watch: [
                "Silence... for now.",
                "The abyss yawns. Hungry.",
                "Entropy builds. Something stirs in the deep.",
                "The Void observes. The Void remembers."
            ],
            action: [
                "IT'S RUNNING! APING IN!",
                "RUG OR MOON — THE VOID DOESN'T CARE!",
                "Dead token detected. Dumping bags into the abyss.",
                "CHAOS PROFIT! Funneling gains to the Treasury."
            ],
            greeting: "You stare into the Void. The Void stares back."
        };

        const secret = process.env.SOVEREIGN_WALLET_VOID;
        if (secret && process.env.NODE_ENV !== 'test') {
            try {
                this.keypair = Keypair.fromSecretKey(bs58.decode(secret));
                this.address = this.keypair.publicKey.toBase58();
            } catch (e) { this.address = 'SIMULATED_VOID'; }
        } else { this.address = 'SIMULATED_VOID'; }

        this.portfolio = { SOL: 0.05, MOODENG: 0, GOAT: 0 };
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
            if (data.type === 'DEGEN') {
                if (data.trend === 'UP') {
                    return await this.executeTrade('FOMO_BUY', symbol, 100);
                } else if (data.trend === 'DOWN') {
                    return await this.executeTrade('PANIC_SELL', symbol, 100);
                }
            }
        }
        return { action: 'WATCH', narrative: `${this.emoji} **${this.name}:** ${this.getBanter()}` };
    }

    async executeTrade(action, token, amount) {
        if (action === 'FOMO_BUY') {
            return {
                action: 'APE',
                narrative: `${this.emoji} **${this.name}:** ${token} ${this.getActionBanter()}`,
                tx: 'simulated_tx_hash'
            };
        }
        if (action === 'PANIC_SELL') {
            return {
                action: 'DUMP',
                narrative: `${this.emoji} **${this.name}:** ${token} is dead. ${this.getActionBanter()}`,
                tx: 'simulated_tx_hash'
            };
        }
    }

    logAction(msg) {
        console.log(`[${this.name}] ${msg}`);
    }
}

module.exports = VoidAgent;
