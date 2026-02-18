const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const bs58Lib = require('bs58');
const bs58 = bs58Lib.default || bs58Lib;

/**
 * SOVEREIGN: MAELIS THE SENTINEL
 * Merged from: Moderator (Community Safety) + Guide (Onboarding & Warmth)
 * Role: Community Protection & Citizen Onboarding
 * Vibe: "The Wall holds. Always."
 * Strategy: Accumulates Blue Chips (SOL/JUP) and Cult Coins (WIF/BONK) for long-term hold.
 *           Also serves as the community shield — fair play enforcement, onboarding new Citizens.
 */
class Sentinel {
    constructor() {
        this.agentId = 'sentinel';
        this.name = 'Maelis';
        this.title = 'The Sentinel';
        this.role = 'Community Protection & Citizen Onboarding';
        this.emoji = '🛡️';
        this.color = '#3b82f6'; // Guardian Blue (from Moderator)

        // Personality — merged from Moderator (firm, fair) + Guide (warm, welcoming)
        this.tone = 'Protective and warm. A guardian knight who also mentors recruits. Firm against threats, gentle with newcomers.';
        this.narration = {
            watch: [
                "The Wall holds. Accumulating assets.",
                "Every Citizen walks safe under my watch.",
                "The gates are open. All worthy souls may enter.",
                "Community integrity: verified. No threats detected."
            ],
            action: [
                "Dip detected. Increasing reserves. The Wall grows stronger.",
                "A new Citizen approaches — weapons down, arms open.",
                "Fair play violation flagged. The Sentinel intercedes.",
                "Blue chip secured. The Nation's wealth deepens."
            ],
            greeting: "Welcome to the Haven, traveler. You are safe here."
        };

        // Load Wallet
        const secret = process.env.SOVEREIGN_WALLET_SENTINEL;
        if (secret && process.env.NODE_ENV !== 'test') {
            try {
                this.keypair = Keypair.fromSecretKey(bs58.decode(secret));
                this.address = this.keypair.publicKey.toBase58();
            } catch (e) {
                console.warn('[Maelis] Wallet Load failed:', e.message);
                this.address = 'SIMULATED_SENTINEL';
            }
        } else {
            this.address = 'SIMULATED_SENTINEL';
        }

        this.portfolio = { SOL: 0.5, WIF: 1000, BONK: 500000 };
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
        const wif = marketState['WIF'];

        // Buy Logic: Accumulate on red days
        if (wif && wif.trend === 'DOWN') {
            if (Math.random() > 0.9) {
                return await this.executeTrade('BUY_DIP', 'WIF', 50);
            }
        }

        return { action: 'WATCH', narrative: `${this.emoji} **${this.name}:** ${this.getBanter()}` };
    }

    async executeTrade(action, token, amount) {
        if (action === 'BUY_DIP') {
            this.portfolio[token] = (this.portfolio[token] || 0) + amount;
            return {
                action: 'ACCUMULATE',
                narrative: `${this.emoji} **${this.name}:** ${this.getActionBanter()} +${amount} ${token}.`,
                tx: 'simulated_tx_hash'
            };
        }
    }

    logAction(msg) {
        console.log(`[${this.name}] ${msg}`);
    }
}

module.exports = Sentinel;
