/**
 * ELEXA LIVE - COUNCIL AGENT (BASE CLASS)
 * "A Mind of Their Own, A Wallet in the Void."
 */

const { vault } = require('../security/vault');
const fs = require('fs-extra');
const path = require('path');

class CouncilAgent {
    constructor(agentId) {
        this.agentId = agentId;
        this.identity = null;
        this.wallet = null;
        this.memory = {};
        this.agentDir = path.join(__dirname, '../../data/agents', agentId);
    }

    async awaken() {
        console.log(`[Council] 👁️ Awaking agent: ${this.agentId}...`);

        // 1. Load Identity
        const soulPath = path.join(this.agentDir, 'SOUL.md');
        if (await fs.exists(soulPath)) {
            this.identity = await fs.readFile(soulPath, 'utf8');
        }

        // 2. Load Memory
        const memoryPath = path.join(this.agentDir, 'memory.json');
        if (await fs.exists(memoryPath)) {
            this.memory = await fs.readJson(memoryPath);
        }

        // 3. Decrypt Wallet
        this.wallet = await vault.loadWallet(this.agentId);
        if (this.wallet) {
            console.log(`[Council] 🔒 ${this.agentId} has accessed their secure vault.`);
        } else {
            console.warn(`[Council] ⚠️ ${this.agentId} has no secured wallet. Sovereign actions restricted.`);
        }
    }

    /**
     * The decision cycle.
     * Returns a 'Manifestation' (Action + Narrative)
     */
    async manifest(worldState, marketStats) {
        // Base logic: Analyze and decide
        // Sub-classes (Arbiter, Sentinel, etc) will override this.
        return {
            agent: this.agentId,
            action: 'OBSERVE',
            narrative: 'The cycle continues. I am watching.'
        };
    }

    async saveMemory() {
        const memoryPath = path.join(this.agentDir, 'memory.json');
        await fs.writeJson(memoryPath, this.memory);
    }

    /**
     * Helper to log actions to the world ledger.
     */
    logAction(narrative) {
        console.log(`[Council Agent: ${this.agentId}] ${narrative}`);
    }
}

module.exports = { CouncilAgent };
