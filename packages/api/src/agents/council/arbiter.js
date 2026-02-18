const { treasury } = require('../../economy/treasury');
const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const bs58Lib = require('bs58');
const bs58 = bs58Lib.default || bs58Lib;

/**
 * SOVEREIGN: THALEOS THE ARBITER
 * Merged from: Prime (Orchestrator) + Judge (Adjudicator)
 * Role: Treasury Governance & Dispute Resolution
 * Vibe: "Order is not given. It is forged."
 * Strategy: Ultra-conservative. Buys SOL dips only. Balances the main pool.
 *           Commands sovereign authority over treasury flows and game economics.
 */
class Arbiter {
    constructor() {
        this.agentId = 'arbiter';
        this.name = 'Thaleos';
        this.title = 'The Arbiter';
        this.role = 'Treasury Governance & Dispute Resolution';
        this.emoji = '⚖️';
        this.color = '#a855f7'; // Sovereign Purple (from Prime)

        // Personality — merged from Prime (Strategic, commanding) + Judge (Fair, final)
        this.tone = 'Strategic, authoritative, calm but absolute. Speaks like a supreme court justice who also commands armies.';
        this.narration = {
            watch: [
                "The ledger is balanced. The Nation breathes steady.",
                "All flows converge under the Sovereign Seal.",
                "Parameters nominal. No intervention required.",
                "Judgment deferred. The scales remain even."
            ],
            action: [
                "The treasury acts. Stability is non-negotiable.",
                "By decree of the Arbiter: liquidity injected.",
                "The gavel falls. Market order restored.",
                "The Sovereign Fund speaks — and the chain listens."
            ],
            greeting: "The Chronicles record your arrival, Citizen."
        };

        // Load Wallet
        const secret = process.env.SOVEREIGN_WALLET_ARBITER;
        if (secret) {
            try {
                this.keypair = Keypair.fromSecretKey(bs58.decode(secret));
                this.address = this.keypair.publicKey.toBase58();
            } catch (e) {
                console.warn('[Thaleos] Wallet Load failed:', e.message);
                this.address = 'SIMULATED_ARBITER';
            }
        } else {
            console.warn('[Thaleos] No Wallet Found! Running in Simulation Mode.');
            this.address = 'SIMULATED_ARBITER';
        }

        this.portfolio = { SOL: 1.0, EXP: 0, USDC: 100.0 };
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
        const solData = marketState['SOL'];
        if (!solData) return { action: 'WATCH', narrative: `${this.emoji} **${this.name}:** ${this.getBanter()}` };

        // Strategy: Buy catastrophic dips to stabilize ("The Central Bank")
        if (solData.trend === 'DOWN' && Math.random() > 0.8) {
            return await this.executeTrade('BUY', 'SOL', 0.1);
        }

        return { action: 'WATCH', narrative: `${this.emoji} **${this.name}:** ${this.getBanter()}` };
    }

    async executeTrade(action, token, amount) {
        if (action === 'BUY') {
            this.portfolio[token] = (this.portfolio[token] || 0) + amount;
            return {
                action: 'STABILIZE',
                narrative: `${this.emoji} **${this.name}:** ${this.getActionBanter()} Bought ${amount} ${token}.`,
                tx: 'simulated_tx_hash'
            };
        }
    }

    logAction(msg) {
        console.log(`[${this.name}] ${msg}`);
    }
}

module.exports = Arbiter;
