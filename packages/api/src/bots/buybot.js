// SOLANA BUY BOT — Chain Event Listener
// Monitors $EXP token buys and triggers game events
// Uses Helius webhooks OR direct RPC polling

const { Connection, PublicKey } = require('@solana/web3.js');
const EventEmitter = require('events');

class SolanaBuyBot extends EventEmitter {
    constructor(config = {}) {
        super();

        // Configuration
        this.tokenMint = config.tokenMint || null; // $EXP token mint address
        this.rpcUrl = config.rpcUrl || 'https://api.mainnet-beta.solana.com';
        this.heliusApiKey = config.heliusApiKey || process.env.HELIUS_API_KEY;
        this.pollInterval = config.pollInterval || 5000; // 5 seconds

        this.connection = null;
        this.isRunning = false;
        this.lastSignature = null;
        this.simulationMode = false;

        // Simulation disabled by default to prevent spam. 
        // Use manual triggers or real transaction monitoring.
        this.simulationMode = false;

        // Buy thresholds for game effects
        this.thresholds = {
            micro: 0.01,    // 0.01 SOL = +5 XP, +5 Party HP
            small: 0.1,     // 0.1 SOL = +15 XP, +15 Party HP, +10 Boss Damage
            medium: 1.0,    // 1 SOL = +50 XP, +25 Party HP, +25 Boss Damage
            large: 10.0,    // 10 SOL = +200 XP, +50 Party HP, +100 Boss Damage
            whale: 100.0    // 100+ SOL = WHALE ALERT! Special event
        };
    }

    async start() {
        if (!this.tokenMint) {
            if (this.simulationMode) {
                console.log('[BuyBot] No token mint configured. Running in SIMULATION mode (Dev only).');
                this.startSimulation();
            } else {
                console.log('[BuyBot] No token mint configured and not in dev mode. BuyBot is dormant.');
            }
            return;
        }

        try {
            this.connection = new Connection(this.rpcUrl, 'confirmed');
            this.isRunning = true;
            console.log('[BuyBot] Started monitoring for $EXP buys...');

            // Start polling loop
            this.pollLoop();
        } catch (error) {
            console.error('[BuyBot] Failed to start:', error.message);
        }
    }

    async pollLoop() {
        while (this.isRunning) {
            try {
                await this.checkForNewBuys();
            } catch (error) {
                console.error('[BuyBot] Poll error:', error.message);
            }
            await this.sleep(this.pollInterval);
        }
    }

    async checkForNewBuys() {
        if (!this.connection || !this.tokenMint) return;

        try {
            // Get recent signatures for the token
            const signatures = await this.connection.getSignaturesForAddress(
                new PublicKey(this.tokenMint),
                { limit: 10 }
            );

            for (const sig of signatures) {
                if (this.lastSignature && sig.signature === this.lastSignature) break;

                // Parse transaction for buy data
                const tx = await this.connection.getParsedTransaction(sig.signature);
                if (tx) {
                    const buyData = this.parseBuyTransaction(tx);
                    if (buyData) {
                        this.emit('buy', buyData);
                    }
                }
            }

            if (signatures.length > 0) {
                this.lastSignature = signatures[0].signature;
            }
        } catch (error) {
            console.error('[BuyBot] Check error:', error.message);
        }
    }

    parseBuyTransaction(tx) {
        // Simplified parsing - would need DEX-specific logic in production
        try {
            const postBalances = tx.meta?.postBalances || [];
            const preBalances = tx.meta?.preBalances || [];

            // Find the SOL transfer amount (buy indicator)
            const solDiff = preBalances.reduce((acc, pre, i) => {
                const diff = (pre - (postBalances[i] || 0)) / 1e9;
                return diff > 0 ? acc + diff : acc;
            }, 0);

            if (solDiff > 0) {
                return {
                    amount: solDiff,
                    signature: tx.transaction.signatures[0],
                    timestamp: new Date(),
                    tier: this.getBuyTier(solDiff)
                };
            }
        } catch (e) {
            // Failed to parse
        }
        return null;
    }

    getBuyTier(solAmount) {
        if (solAmount >= this.thresholds.whale) return 'whale';
        if (solAmount >= this.thresholds.large) return 'large';
        if (solAmount >= this.thresholds.medium) return 'medium';
        if (solAmount >= this.thresholds.small) return 'small';
        return 'micro';
    }

    // Game effects per buy tier (Alpha League Triggers)
    static getBuyEffects(tier) {
        const effects = {
            micro: { xp: 5, partyHP: 5, bossDamage: 5, alert: false, agent: 'vanguard' }, // Vanguard Micro-Heal
            small: { xp: 15, partyHP: 15, bossDamage: 10, alert: false, agent: 'healer' }, // Healer Pulse
            medium: { xp: 50, partyHP: 25, bossDamage: 25, alert: true, agent: 'sentinel' }, // Sentinel Shield
            large: { xp: 200, partyHP: 50, bossDamage: 100, alert: true, agent: 'scout' }, // Scout Flare
            whale: { xp: 1000, partyHP: 100, bossDamage: 500, alert: true, special: 'WHALE_EVENT', agent: 'bard' } // Bard Hype
        };
        return effects[tier] || effects.micro;
    }

    // Simulation mode for development
    startSimulation() {
        console.log('[BuyBot] Simulation mode active. Will emit random buys...');
        this.isRunning = true;

        // Emit simulated buys every 30-60 seconds
        const simulate = () => {
            if (!this.isRunning) return;

            const tiers = ['micro', 'micro', 'micro', 'small', 'small', 'medium', 'large'];
            const tier = tiers[Math.floor(Math.random() * tiers.length)];
            const amounts = { micro: 0.05, small: 0.5, medium: 2.5, large: 15, whale: 150 };

            this.emit('buy', {
                amount: amounts[tier],
                signature: 'SIM_' + Date.now(),
                timestamp: new Date(),
                tier: tier,
                simulated: true
            });

            // Random interval 30-90 seconds
            const nextIn = 30000 + Math.random() * 60000;
            setTimeout(simulate, nextIn);
        };

        // First buy in 10 seconds
        setTimeout(simulate, 10000);
    }

    stop() {
        this.isRunning = false;
        console.log('[BuyBot] Stopped.');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = { SolanaBuyBot };
