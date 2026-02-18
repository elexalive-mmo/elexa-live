// ELEXA LIVE - TREASURY & $EXP CLAIM ENGINE
// "Legend has it nobody ever has."

const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

const GOAL_USD = 100000;
const SOL_PRICE_MOCK = 150; // TODO: Fetch from Jupiter/Coingecko API

// === THE CLAIM ===
const CLAIM_THRESHOLD = 100_000; // 100,000 $EXP required to unlock
const CLAIM_REWARD_LAMPORTS = 0.1 * LAMPORTS_PER_SOL; // 0.1 SOL worth of $EXP per claim (testnet)

class Treasury {
    constructor() {
        this.balanceSOL = 0;
        this.totalFeesSOL = 0;
        this.history = [];
        this.claimLedger = new Map(); // userId -> { claimed: bool, timestamp }
        this.walletAddress = process.env.TREASURY_WALLET || 'JEFEXVZDh43U8eE27geg4wWPBJaBzTDyyyk15CVzvDy6';

        // Testnet Support
        const isTestnet = process.env.SOLANA_NETWORK === 'devnet';
        this.rpcUrl = isTestnet
            ? 'https://api.devnet.solana.com'
            : (process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');
        this.network = isTestnet ? 'devnet' : 'mainnet-beta';
        this.connection = new Connection(this.rpcUrl, 'confirmed');

        console.log(`[Treasury] Initialized on ${this.network} | Wallet: ${this.walletAddress}`);

        const { wsBroadcast } = require('../ws-broadcast');

        // Start Sync Loop (15s for Charts/Real-time data)
        this.syncBalance();
        setInterval(async () => {
            const oldBalance = this.balanceSOL;
            await this.syncBalance();

            // Broadcast if changed or every cycle for heartbeats
            wsBroadcast.send('MARKET_UPDATE', {
                treasury: this.getStats(),
                timestamp: Date.now()
            });
        }, 15000);
    }

    async syncBalance() {
        try {
            if (!this.walletAddress) return;
            const pubKey = new PublicKey(this.walletAddress);
            const balance = await this.connection.getBalance(pubKey);
            this.balanceSOL = balance / LAMPORTS_PER_SOL;
        } catch (e) {
            console.error('[Treasury] Sync Failed:', e.message);
        }
    }

    deposit(amountSOL, source) {
        this.totalFeesSOL += amountSOL;
        this.history.push({
            amount: amountSOL,
            source,
            timestamp: Date.now(),
            usdValue: amountSOL * SOL_PRICE_MOCK
        });
        this.balanceSOL += amountSOL;
    }

    // === THE CLAIM: 100,000 $EXP ===
    canClaim(userId, userExp) {
        if (userExp < CLAIM_THRESHOLD) return { eligible: false, reason: `Need ${CLAIM_THRESHOLD.toLocaleString()} $EXP. You have ${userExp.toLocaleString()}.` };
        if (this.claimLedger.has(userId)) return { eligible: false, reason: 'Already claimed. Legend status achieved.' };
        return { eligible: true, reason: 'The Treasury awaits your signature.' };
    }

    async processClaim(userId, userExp) {
        const check = this.canClaim(userId, userExp);
        if (!check.eligible) return { success: false, message: check.reason };

        // Record the claim
        this.claimLedger.set(userId, {
            claimed: true,
            exp: userExp,
            timestamp: new Date().toISOString(),
            network: this.network
        });

        // In production: Execute SPL token transfer here
        // For testnet: Log the claim and return success
        console.log(`[TREASURY] ⚡ LEGENDARY CLAIM by ${userId}! ${userExp} $EXP on ${this.network}`);

        return {
            success: true,
            message: `Elexa: "The Treasury opens for the first time. ${userId} claims their destiny."`,
            claim: {
                userId,
                exp: userExp,
                network: this.network,
                timestamp: new Date().toISOString()
            }
        };
    }

    getStats() {
        const totalUSD = this.balanceSOL * SOL_PRICE_MOCK;
        const progress = (totalUSD / GOAL_USD) * 100;

        return {
            balanceSOL: this.balanceSOL.toFixed(4),
            totalRaisedUSD: totalUSD.toFixed(2),
            goalUSD: GOAL_USD,
            progressPercent: Math.min(progress, 100).toFixed(1),
            network: this.network,
            claimThreshold: CLAIM_THRESHOLD,
            totalClaims: this.claimLedger.size
        };
    }
}

module.exports = { treasury: new Treasury(), CLAIM_THRESHOLD };
