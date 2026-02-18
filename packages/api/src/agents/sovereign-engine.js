const { db } = require('../db');
const { treasury } = require('../economy/treasury');
const { wsBroadcast } = require('../ws-broadcast');
const { memeMarketService } = require('../economy/meme-market');

const Arbiter = require('./council/arbiter');
const Sentinel = require('./council/sentinel');
const Oracle = require('./council/oracle');
const Keeper = require('./council/keeper');
const VoidAgent = require('./council/void');

/**
 * SOVEREIGN ENGINE (FORMERLY COUNCIL ENGINE)
 * "The 5 Pillars of the Elexa Economy."
 */
class SovereignEngine {
    constructor() {
        this.agents = {
            arbiter: new Arbiter(),
            sentinel: new Sentinel(),
            oracle: new Oracle(),
            keeper: new Keeper(),
            void: new VoidAgent()
        };
        this.active = false;
    }

    async init() {
        console.log('[Sovereign Engine] 🌌 Awakening the Five...');
        for (const agent of Object.values(this.agents)) {
            await agent.awaken();
        }
        this.active = true;

        // Start Sovereign Loop (Sync with 60s Market Pulse)
        this.startLoop();
    }

    startLoop() {
        // Run immediately then every 60 seconds
        this.runCycle();
        setInterval(() => this.runCycle(), 60 * 1000);
    }

    async runCycle() {
        if (!this.active) return;

        // 1. Get Market Data (The Void Exchange)
        await memeMarketService.updatePrices();
        const marketState = await memeMarketService.getMarketState();
        const worldData = await db.getWorldState();

        // 2. Process Turns
        for (const agent of Object.values(this.agents)) {
            try {
                // Pass Market Data + World Data
                const manifestation = await agent.processTurn(marketState, worldData);

                if (manifestation && manifestation.action !== 'WATCH') {
                    // Broadcast significant Sovereign Actions
                    const event = {
                        type: 'SOVEREIGN_ACTION',
                        agent: agent.name,
                        emoji: agent.emoji,
                        action: manifestation.action,
                        narrative: manifestation.narrative,
                        tx: manifestation.tx
                    };

                    wsBroadcast.send('SOVEREIGN_ACTION', event);
                    console.log(`[Sovereign Engine] ${agent.name} ACTED: ${manifestation.action}`);
                }
            } catch (e) {
                console.error(`[Sovereign Engine] Error in agent ${agent.agentId}:`, e.message);
            }
        }
    }

    // API: Get Status of all Sovereigns for Frontend
    getStatus() {
        const status = {};
        for (const [key, agent] of Object.entries(this.agents)) {
            status[key] = {
                name: agent.name,
                role: agent.role,
                address: agent.address,
                portfolio: agent.portfolio
            };
        }
        return status;
    }
}

module.exports = { sovereignEngine: new SovereignEngine() };
