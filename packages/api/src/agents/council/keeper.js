const { Connection, Keypair } = require('@solana/web3.js');
const bs58Lib = require('bs58');
const bs58 = bs58Lib.default || bs58Lib;

/**
 * SOVEREIGN: CYREN THE KEEPER
 * Merged from: ClipSmith (Content Creation) + Keeper (Lore Archival)
 * Role: Chronicle Archival & Content Forge
 * Vibe: "Everything has value in time. I preserve the worthy."
 * Strategy: Hoarder. Buys small amounts of Degen tokens to diversify. Never sells deep value.
 *           Also stamps lore, records world events, forges content for the community feed.
 */
class Keeper {
    constructor() {
        this.agentId = 'keeper';
        this.name = 'Cyren';
        this.title = 'The Keeper';
        this.role = 'Chronicle Archival & Content Forge';
        this.emoji = '📜';
        this.color = '#10b981'; // Archive Green (from ClipSmith's creative energy)

        // Personality — merged from ClipSmith (creative, hype) + Keeper (stoic, meticulous)
        this.tone = 'Poetic and meticulous. A librarian who also edits montages. Balances reverence for history with creative fire.';
        this.narration = {
            watch: [
                "Preserving the seed. Waiting for harvest.",
                "The archives grow heavy with legends.",
                "Every transaction is a verse in the Nation's epic.",
                "Ink drying on today's chapter. The chronicle continues."
            ],
            action: [
                "Found a discarded gem. Adding to the vault.",
                "A new legend forged! The Keeper stamps it eternal.",
                "Content ignited. The world will see this.",
                "Rare artifact secured for the Archive."
            ],
            greeting: "Your story begins here. I will remember it all."
        };

        const secret = process.env.SOVEREIGN_WALLET_KEEPER;
        if (secret && process.env.NODE_ENV !== 'test') {
            try {
                this.keypair = Keypair.fromSecretKey(bs58.decode(secret));
                this.address = this.keypair.publicKey.toBase58();
            } catch (e) { this.address = 'SIMULATED_KEEPER'; }
        } else { this.address = 'SIMULATED_KEEPER'; }

        this.portfolio = { SOL: 0.1, MOODENG: 500, GOAT: 200 };
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
        const degenTokens = Object.values(marketState).filter(t => t.type === 'DEGEN' && t.price < 0.20 && t.trend === 'NEUTRAL');

        if (degenTokens.length > 0) {
            const pick = degenTokens[0];
            return await this.executeTrade('COLLECT', pick.id, 10);
        }

        return { action: 'WATCH', narrative: `${this.emoji} **${this.name}:** ${this.getBanter()}` };
    }

    async executeTrade(action, token, amount) {
        if (action === 'COLLECT') {
            return {
                action: 'HOARD',
                narrative: `${this.emoji} **${this.name}:** ${this.getActionBanter()} (${token})`,
                tx: 'simulated_tx_hash'
            };
        }
    }

    logAction(msg) {
        console.log(`[${this.name}] ${msg}`);
    }
}

module.exports = Keeper;
