const fs = require('fs');
const path = require('path');
const { Keypair } = require('@solana/web3.js');

// --- CONSTANTS ---
const PHASES = {
    BONDING_CURVE: { name: '🌱 BONDING CURVE ($5k-$60k)', target: 60000 },
    MIGRATION: { name: '🌊 MIGRATION (The Filter)', target: 250000 },
    ASCENT: { name: '🚀 THE ASCENT ($250k-$1M)', target: 1000000 },
    CITADEL: { name: '🏰 CITADEL (Civilization)', target: 10000000 }
};
const ROLES = ['arbiter', 'sentinel', 'oracle', 'keeper', 'void'];

// SAFETY FLAG: Set to false to ACTUALLY TRADE (Dangerous)
const DRY_RUN = true; 

class EconomyEngine {
    constructor() {
        this.councilWallets = {};
        this.loadKeys();
    }

    loadKeys() {
        // Path relative to packages/api/lib/engines/
        const SECRETS_DIR = path.join(__dirname, '../../data/secrets/council');
        try {
            ROLES.forEach(role => {
                const secretPath = path.join(SECRETS_DIR, `${role}.json`);
                if (fs.existsSync(secretPath)) {
                    const secret = JSON.parse(fs.readFileSync(secretPath, 'utf8'));
                    this.councilWallets[role] = Keypair.fromSecretKey(new Uint8Array(secret));
                }
            });
            console.log(`🏦 ECONOMY: Loaded ${Object.keys(this.councilWallets).length} Council Keys.`);
            console.log(`🛡️ SAFETY MODE: ${DRY_RUN ? 'ON (Simulation Only)' : 'OFF (Real Trading Active)'}`);
        } catch (e) {
            console.warn("⚠️ ECONOMY: Failed to load keys (Running in Mock Mode).", e);
        }
    }

    tick(worldState) {
        const econ = worldState.economy;

        // 1. Market Movement (Random Walk with Bias)
        let bias = 0;
        if (econ.phase === 'BONDING_CURVE') bias = 0.05; 
        if (econ.phase === 'MIGRATION') bias = -0.01;
        if (econ.phase === 'ASCENT') bias = 0.02;
        if (econ.phase === 'CITADEL') bias = 0.005;

        // "Real" Price check would go here later
        const volatility = Math.random() * 0.1 - 0.04;
        const change = volatility + bias;
        
        econ.price = econ.price * (1 + change);
        econ.mcap = econ.price * econ.supply * econ.solPrice;

        // 2. Phase Check
        this.checkPhase(econ);

        // 3. Council Trades (Simulated or Real)
        this.simulateCouncilTrade(econ);
    }

    checkPhase(econ) {
        // Transition Logic
        if (econ.phase === 'BONDING_CURVE' && econ.mcap > PHASES.BONDING_CURVE.target) {
            econ.phase = 'MIGRATION';
            console.log(`\n🚨 MILESTONE: BONDING CURVE COMPLETED ($${Math.floor(econ.mcap)})!`);
        } else if (econ.phase === 'MIGRATION' && econ.mcap > PHASES.MIGRATION.target) {
            econ.phase = 'ASCENT';
            console.log(`\n🚀 MILESTONE: MIGRATION STABILIZED!`);
        } else if (econ.phase === 'ASCENT' && econ.mcap > PHASES.ASCENT.target) {
            econ.phase = 'CITADEL';
            console.log(`\n🏰 MILESTONE: CITADEL REACHED!`);
        }
    }

    async simulateCouncilTrade(econ) {
        const role = ROLES[Math.floor(Math.random() * ROLES.length)];
        const wallet = this.councilWallets[role];
        
        if (!wallet) return; // Should not happen if keys loaded

        // Trade Logic based on phase
        let action = 'HOLD';
        let amount = '0';
        let tokenIn = 'SOL';
        let tokenOut = 'EXP';

        if (econ.phase === 'BONDING_CURVE') {
            if (role === 'keeper') { action = 'LP_ADD'; amount = (Math.random() * 2).toFixed(2); }
            else { action = 'SWAP'; amount = (Math.random() * 5).toFixed(2); }
        } else if (econ.phase === 'MIGRATION') {
            if (role === 'sentinel' && econ.mcap < 55000) { action = 'BUY_WALL'; amount = '20'; }
            else { action = Math.random() > 0.5 ? 'SWAP' : 'ARB_TRADE'; amount = '10'; }
        } else {
             action = Math.random() > 0.6 ? 'SWAP' : 'SELL';
             amount = '50';
        }

        if (action !== 'HOLD') {
            const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
            
            // Log for Simulation
            console.log(`💸 TRADE: [${role.toUpperCase()}] ${action} ${amount} ${tokenIn}`);

            if (DRY_RUN) {
                // Just update state
                econ.recentTrade = { role, action, amount, tokenIn, tokenOut, timestamp };
            } else {
                // TODO: Execute Real Transaction via Jupiter / Raydium SDK
                // logic.executeTrade(wallet, action, amount...)
                console.log("⚠️ REAL TRADE SKIPPED (Not Implemented)");
            }
        }
    }
}

module.exports = EconomyEngine;
