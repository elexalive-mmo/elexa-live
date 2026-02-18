const fs = require('fs');
const path = require('path');
const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const bs58 = require('bs58');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Load Council Keys
const SECRETS_DIR = path.join(__dirname, '../packages/api/data/secrets/council');
const ROLES = ['arbiter', 'sentinel', 'oracle', 'keeper', 'void'];
const councilWallets = {};

console.log("🏦 COUNCIL MARKET MAKER SIMULATION: INITIALIZING...");

try {
    ROLES.forEach(role => {
        const secretPath = path.join(SECRETS_DIR, `${role}.json`);
        if (fs.existsSync(secretPath)) {
            const secret = JSON.parse(fs.readFileSync(secretPath, 'utf8'));
            councilWallets[role] = Keypair.fromSecretKey(new Uint8Array(secret));
            console.log(`✅ LOADED: ${role.toUpperCase()} -> ${councilWallets[role].publicKey.toBase58().slice(0,8)}...`);
        } else {
            console.log(`⚠️ MISSING KEY for ${role}`);
        }
    });
} catch (e) {
    console.error("❌ FAILED TO LOAD KEYS:", e.message);
    process.exit(1);
}

// Simulation Loop
// Simulation State
let marketState = {
    price: 0.00000005, // $5k start
    mcap: 5000,      // Starting Mcap ($5k)
    phase: 'BONDING_CURVE',   // BONDING_CURVE -> MIGRATION -> ASCENT -> CITADEL
    supply: 1000000000, // 1B Supply
    solPrice: 150,    // Fixed for sim
    treasurySol: 1.5, // Seed
    recentTrade: null
};

const PHASES = {
    BONDING_CURVE: { name: '🌱 BONDING CURVE ($5k-$60k)', target: 60000 },
    MIGRATION: { name: '🌊 MIGRATION (The Filter)', target: 250000 },
    ASCENT: { name: '🚀 THE ASCENT ($250k-$1M)', target: 1000000 },
    CITADEL: { name: '🏰 CITADEL (Civilization)', target: 10000000 }
};

const TOKENS = ['SOL', 'USDC', 'EXP', 'JUP', 'BONK'];

function updateMarket() {
    // Random Walk with Bias based on Phase
    let bias = 0;
    if (marketState.phase === 'BONDING_CURVE') bias = 0.05; // Strong Buy Pressure
    if (marketState.phase === 'MIGRATION') bias = -0.01; // Chop/Dump risk
    if (marketState.phase === 'ASCENT') bias = 0.02; // Steady moon
    if (marketState.phase === 'CITADEL') bias = 0.005; // Stable

    const volatility = Math.random() * 0.1 - 0.04;
    const change = volatility + bias;
    
    marketState.price = marketState.price * (1 + change);
    marketState.mcap = marketState.price * marketState.supply * marketState.solPrice;
}

function checkPhaseTransitions() {
    if (marketState.phase === 'BONDING_CURVE' && marketState.mcap > PHASES.BONDING_CURVE.target) {
        marketState.phase = 'MIGRATION';
        console.log(`\n🚨 MILESTONE: BONDING CURVE COMPLETED AT $${Math.floor(marketState.mcap)}!`);
        console.log("   🌊 MIGRATING LIQUIDITY TO RAYDIUM... SENTINEL DEPLOYING DEFENSES.\n");
    }
    else if (marketState.phase === 'MIGRATION' && marketState.mcap > PHASES.MIGRATION.target) {
        marketState.phase = 'ASCENT';
        console.log(`\n🚀 MILESTONE: MIGRATION STABILIZED. ENTERING THE ASCENT.`);
        console.log("   >>> ORGANIC GROWTH MODE ACTIVATED.\n");
    }
    else if (marketState.phase === 'ASCENT' && marketState.mcap > PHASES.ASCENT.target) {
        marketState.phase = 'CITADEL';
        console.log(`\n🏰 MILESTONE: CITADEL REACHED. TREASURY ACCUMULATION BEGINS.`);
        console.log("   >>> TARGET: $100,000 TREASURY BALANCE.\n");
    }
}

function simulateTrade() {
    updateMarket();
    checkPhaseTransitions();

    const role = ROLES[Math.floor(Math.random() * ROLES.length)];
    const wallet = councilWallets[role];
    if (!wallet) return;

    let action, tokenIn, tokenOut, amount, logColor;
    
    // AI Logic based on New Roadmap
    if (marketState.phase === 'BONDING_CURVE') {
        // KEEPER ensures steady growth along the curve
        if (role === 'keeper') { action = 'LP_ADD'; tokenIn = 'SOL'; tokenOut = 'EXP'; amount = (Math.random() * 2).toFixed(2); logColor = '\x1b[32m'; } // Green
        else { action = 'SWAP'; tokenIn = 'SOL'; tokenOut = 'EXP'; amount = (Math.random() * 5).toFixed(2); logColor = '\x1b[36m'; } // Cyan
    } 
    else if (marketState.phase === 'MIGRATION') {
        // SENTINEL Defends the Migration Floor
        if (marketState.mcap < 55000) {
            if (role === 'sentinel') { action = 'BUY_WALL'; amount = (Math.random() * 20).toFixed(2); logColor = '\x1b[32m'; } // Green Defense
            else { action = 'HOLD'; amount = '0'; }
        } else {
            // Volatile chop
            action = Math.random() > 0.5 ? 'SWAP' : 'ARB_TRADE';
            amount = (Math.random() * 10).toFixed(2);
            logColor = '\x1b[33m'; // Yellow
        }
    }
    else if (marketState.phase === 'ASCENT') {
        // SLOW & STEADY: Arbiter & Oracle guide it up
        if (role === 'void' && Math.random() > 0.8) { action = 'BURN'; amount = (Math.random() * 1000).toFixed(0); tokenIn = 'EXP'; tokenOut = 'NULL'; logColor = '\x1b[31m'; }
        else {
             // 60% Buy / 40% Sell for organic uptrend
             const weights = role === 'oracle' ? 0.7 : 0.6;
             action = Math.random() < weights ? 'SWAP' : 'SELL';
             amount = (Math.random() * 50).toFixed(2);
             logColor = '\x1b[35m'; // Magenta
        }
    }
    else if (marketState.phase === 'CITADEL') {
        // TREASURY FOCUS: Accumulate $100k
        action = 'Use_App'; // Simulating App usage revenue
        amount = (Math.random() * 0.1).toFixed(4);
        marketState.treasurySol += parseFloat(amount); // Tax revenue
        logColor = '\x1b[32m'; // Green

        if (marketState.treasurySol * marketState.solPrice > 100000) {
             console.log(`\n👑 VICTORY: TREASURY REACHED $100,000! THE GOLDEN AGE.`);
             process.exit(0);
        }
    }

    if (action && action !== 'HOLD') {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        console.log(`${logColor}[${timestamp}] 🔁 ${role.toUpperCase()} | Phase: ${marketState.phase} | Mcap: $${Math.floor(marketState.mcap)}`);
        console.log(`         Action: ${action} ${amount} ${tokenIn} -> ${tokenOut}\x1b[0m`);
        
        marketState.recentTrade = { role, action, amount, tokenIn, tokenOut, timestamp };
        updateSharedState();
    }
}

// --- SHARED STATE WRITER ---
const STATE_PATH = path.join(__dirname, '../packages/api/data/simulation_state.json');

function updateSharedState() {
    try {
        let currentState = {};
        if (fs.existsSync(STATE_PATH)) {
            currentState = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
        }
        
        currentState.economy = {
            price: marketState.price,
            mcap: marketState.mcap,
            phase: marketState.phase,
            supply: marketState.supply,
            recentTrade: marketState.recentTrade
        };
        currentState.meta = { timestamp: new Date().toISOString() };

        fs.writeFileSync(STATE_PATH, JSON.stringify(currentState, null, 4));
    } catch (e) { /* ignore collision */ }
}

// Run simulation
console.log("\n🚀 MARKET MAKERS ACTIVE. Generating Volume...");
setInterval(simulateTrade, 3000); // Trade every 3 seconds
