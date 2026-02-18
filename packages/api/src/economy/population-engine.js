/**
 * ═══════════════════════════════════════════════════════════════
 *  POPULATION ENGINE — "The Breath of the Lands"
 *  
 *  Mints expand the world. Reclaims contract it.
 *  The chain breathes life into the metaverse.
 *
 *  DESIGN:
 *  - 60-MINUTE cooldown between world mutations (PDA-anchored)
 *  - Events queue during cooldown, applied at next sync
 *  - Herald announces aggregate state at each sync (all socials)
 *  - World starts at 1 tile. Grows with activity.
 *
 *  FORMULAS:
 *  Birth Mint:    pop += 6, tiles += 1
 *  Echo Reclaim:  shadowPop += 3, tiles -= 1 (min 1), feralElexamon += 1
 *  Daily Decay:   pop -= 2%, shadowPop -= 5%
 * ═══════════════════════════════════════════════════════════════
 */

const { db } = require('../db');
const { broadcaster } = require('../broadcast');
let tileGenerator = null;
try { tileGenerator = require('../game/tile-generator').tileGenerator; } catch (e) {
    console.warn('[Population] Tile generator not available:', e.message);
}

// === CONSTANTS ===
const MUTATION_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes (Celestial Pulse)
const BIRTH_POP = 6;
const BIRTH_TILES = 1;
const ECHO_SHADOW_POP = 3;
const ECHO_TILE_LOSS = 1;
const ECHO_FERAL_SPAWN = 1;
const DECAY_POP_RATE = 0.02;       // 2% daily
const DECAY_SHADOW_RATE = 0.05;    // 5% daily
const MAX_TILES = 1000000;         // Effectively Endless
const MIN_TILES = 1;               // World can never fully collapse
const PDA_SEED = process.env.EXP_TOKEN_CA || 'So11111111111111111111111111111111111111112';

class PopulationEngine {
    constructor() {
        // Queued events waiting for next mutation window
        this.pendingBirths = 0;
        this.pendingEchoes = 0;
        this.pendingFeralSpawns = 0;
        this.lastSyncTime = null;
        this.active = false;
        this.syncHistory = [];
    }

    /**
     * Start the Population Engine.
     * Runs the hourly sync loop and daily decay.
     */
    async start() {
        this.active = true;

        // Load last mutation timestamp from world state
        try {
            const world = await db.getWorldState();
            this.lastSyncTime = world.lastMutationTs || 0;
        } catch (e) {
            this.lastSyncTime = 0;
        }

        // Hourly sync check (every 5 minutes, but only mutates after cooldown)
        setInterval(() => this.trySyncWorld(), 5 * 60 * 1000);

        // Daily decay at midnight
        this.scheduleDailyDecay();

        console.log(`[Population] 🌍 Engine ACTIVE — PDA Seed: ${PDA_SEED.slice(0, 8)}...`);
        console.log(`[Population] Cooldown: ${MUTATION_COOLDOWN_MS / 60000}min | Birth: +${BIRTH_POP} pop, +${BIRTH_TILES} tile | Echo: +${ECHO_SHADOW_POP} shadow, -${ECHO_TILE_LOSS} tile`);
    }

    // ─────────────────────────────────────────────
    // EVENT INTAKE (queues, doesn't mutate immediately)
    // ─────────────────────────────────────────────

    /**
     * Queue a Birth Mint event.
     * Called by minting.js or buybot when a significant buy occurs.
     */
    queueBirth(source = 'mint', metadata = {}) {
        this.pendingBirths++;
        console.log(`[Population] 📥 Birth queued (${source}). Pending: ${this.pendingBirths} births, ${this.pendingEchoes} echoes.`);
        return { queued: true, pendingBirths: this.pendingBirths, nextSync: this.getNextSyncTime() };
    }

    /**
     * Queue an Echo Reclaim event.
     * Called by rebirth.js when a reclaim is detected.
     */
    queueEcho(source = 'reclaim', metadata = {}) {
        this.pendingEchoes++;
        this.pendingFeralSpawns++;
        console.log(`[Population] 📥 Echo queued (${source}). Pending: ${this.pendingBirths} births, ${this.pendingEchoes} echoes.`);
        return { queued: true, pendingEchoes: this.pendingEchoes, nextSync: this.getNextSyncTime() };
    }

    // ─────────────────────────────────────────────
    // WORLD MUTATION (rate-limited, hourly)
    // ─────────────────────────────────────────────

    /**
     * Attempt to sync world state.
     * Only mutates if cooldown has elapsed AND there are pending events.
     */
    async trySyncWorld() {
        const now = Date.now();
        const elapsed = now - (this.lastSyncTime || 0);

        // Cooldown check
        if (elapsed < MUTATION_COOLDOWN_MS) {
            return { synced: false, reason: 'cooldown', remainingMs: MUTATION_COOLDOWN_MS - elapsed };
        }

        // Nothing to sync?
        if (this.pendingBirths === 0 && this.pendingEchoes === 0) {
            return { synced: false, reason: 'no_events' };
        }

        // === EXECUTE WORLD MUTATION ===
        const result = await this.applyMutation();
        return result;
    }

    /**
     * Apply all pending events to world state in a single atomic update.
     */
    async applyMutation() {
        const births = this.pendingBirths;
        const echoes = this.pendingEchoes;
        const feralSpawns = this.pendingFeralSpawns;

        // Calculate net changes
        const popGain = births * BIRTH_POP;
        const shadowGain = echoes * ECHO_SHADOW_POP;
        const tileGain = births * BIRTH_TILES;
        const tileLoss = echoes * ECHO_TILE_LOSS;
        const netTiles = tileGain - tileLoss;

        let snapshot = {};

        try {
            await db.update(state => {
                if (!state.worldState) state.worldState = {};
                const ws = state.worldState;

                // Apply population changes
                ws.populace = Math.max(0, (ws.populace || 0) + popGain);
                ws.shadowPop = Math.max(0, (ws.shadowPop || 0) + shadowGain);
                ws.feralElexamon = Math.max(0, (ws.feralElexamon || 0) + feralSpawns);

                // Apply tile changes (clamped)
                const currentTiles = ws.unlockedTiles || 1;
                ws.unlockedTiles = Math.max(MIN_TILES, Math.min(MAX_TILES, currentTiles + netTiles));

                // Lifetime counters
                ws.totalBirths = (ws.totalBirths || 0) + births;
                ws.totalEchoes = (ws.totalEchoes || 0) + echoes;

                // PDA anchor
                ws.lastMutationTs = Date.now();
                ws.pdaSeed = PDA_SEED;

                snapshot = {
                    populace: ws.populace,
                    shadowPop: ws.shadowPop,
                    unlockedTiles: ws.unlockedTiles,
                    feralElexamon: ws.feralElexamon,
                    totalBirths: ws.totalBirths,
                    totalEchoes: ws.totalEchoes,
                    births,
                    echoes,
                    netTiles
                };

                return state;
            });

            // Reset queues
            this.pendingBirths = 0;
            this.pendingEchoes = 0;
            this.pendingFeralSpawns = 0;
            this.lastSyncTime = Date.now();

            // Log
            this.syncHistory.push({
                timestamp: new Date().toISOString(),
                ...snapshot
            });

            // Keep only last 24 syncs
            if (this.syncHistory.length > 24) {
                this.syncHistory = this.syncHistory.slice(-24);
            }

            console.log(`[Population] 🌍 WORLD MUTATION — +${births} births (+${popGain} pop, +${tileGain} tiles), +${echoes} echoes (+${shadowGain} shadow, -${tileLoss} tiles, +${feralSpawns} feral)`);
            console.log(`[Population]    State: ${snapshot.populace} pop | ${snapshot.shadowPop} shadow | ${snapshot.unlockedTiles} tiles | ${snapshot.feralElexamon} feral`);

            // === PROCEDURAL TILE GENERATION ===
            // Each birth generates a new tile from Perlin + market cycle
            let newTiles = [];
            if (tileGenerator && births > 0) {
                if (!tileGenerator.perlin) tileGenerator.init(PDA_SEED);
                const startId = snapshot.populace - popGain + 1;
                for (let i = 0; i < births; i++) {
                    const tile = tileGenerator.generateTile(startId + (i * BIRTH_POP), 1.0);
                    newTiles.push(tile);
                    console.log(`[Population] 🗺️ Tile born: ${tile.id} — ${tile.biome} (${tile.element}, Tier ${tile.tier})`);
                }
                snapshot.newTiles = newTiles;
            }

            // === HERALD BROADCAST (aggregate state) ===
            await this.heraldAnnounce(snapshot);

            return { synced: true, snapshot };

        } catch (e) {
            console.error('[Population] Mutation failed:', e.message);
            return { synced: false, reason: 'error', error: e.message };
        }
    }

    // ─────────────────────────────────────────────
    // DAILY DECAY
    // ─────────────────────────────────────────────

    scheduleDailyDecay() {
        // Run at midnight
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        const msUntilMidnight = midnight.getTime() - now.getTime();

        setTimeout(() => {
            this.applyDecay();
            // Then every 24 hours
            setInterval(() => this.applyDecay(), 24 * 60 * 60 * 1000);
        }, msUntilMidnight);

        console.log(`[Population] ⏰ Daily decay scheduled in ${Math.round(msUntilMidnight / 60000)} minutes.`);
    }

    async applyDecay() {
        try {
            let decayReport = {};

            await db.update(state => {
                if (!state.worldState) return state;
                const ws = state.worldState;

                const popBefore = ws.populace || 0;
                const shadowBefore = ws.shadowPop || 0;

                // Natural decay
                const popLoss = Math.floor(popBefore * DECAY_POP_RATE);
                const shadowLoss = Math.floor(shadowBefore * DECAY_SHADOW_RATE);

                ws.populace = Math.max(0, popBefore - popLoss);
                ws.shadowPop = Math.max(0, shadowBefore - shadowLoss);

                decayReport = {
                    popLoss,
                    shadowLoss,
                    populace: ws.populace,
                    shadowPop: ws.shadowPop
                };

                return state;
            });

            console.log(`[Population] 🌙 DAILY DECAY — Pop: -${decayReport.popLoss} (${decayReport.populace} remain) | Shadow: -${decayReport.shadowLoss} (${decayReport.shadowPop} remain)`);

            // Herald: Silent decay announcement (just Twitter/X for atmosphere)
            if (decayReport.popLoss > 0 || decayReport.shadowLoss > 0) {
                const decayMsg = this.formatDecayMessage(decayReport);
                await broadcaster.broadcast(decayMsg, ['telegram', 'discord', 'twitch', 'x']);
            }

        } catch (e) {
            console.error('[Population] Decay failed:', e.message);
        }
    }

    // ─────────────────────────────────────────────
    // HERALD INTEGRATION (hourly aggregate)
    // ─────────────────────────────────────────────

    /**
     * Herald announces the AGGREGATE world state after each mutation.
     * Not per-event — only at sync boundaries.
     * Broadcasts to ALL channels including X (Twitter).
     */
    async heraldAnnounce(snapshot) {
        const msg = this.formatSyncMessage(snapshot);
        try {
            await broadcaster.broadcast(msg, ['telegram', 'discord', 'twitch', 'x']);
            console.log(`[Population] 📯 Herald broadcast dispatched to all channels.`);
        } catch (e) {
            console.error('[Population] Herald broadcast failed:', e.message);
        }
    }

    formatSyncMessage(s) {
        const tileBar = '█'.repeat(Math.min(20, Math.floor(s.unlockedTiles / 7))) +
            '░'.repeat(Math.max(0, 20 - Math.floor(s.unlockedTiles / 7)));

        let msg = `🌍 **THE LANDS BREATHE** — World Sync\n\n`;

        // Net growth or contraction
        if (s.births > 0 && s.echoes === 0) {
            msg += `🏗️ **EXPANSION** — ${s.births} birth${s.births > 1 ? 's' : ''} breathe life into the Gate.\n`;
            msg += `+${s.births * BIRTH_POP} citizens walk new ground. +${s.births * BIRTH_TILES} tile${s.births > 1 ? 's' : ''} unlocked.\n\n`;
        } else if (s.echoes > 0 && s.births === 0) {
            msg += `🌀 **CONTRACTION** — ${s.echoes} echo${s.echoes > 1 ? 'es' : ''} ripple through the void.\n`;
            msg += `+${s.echoes * ECHO_SHADOW_POP} shadows haunt the border. ${s.echoes} feral Elexamon stir in the wastes.\n\n`;
        } else if (s.births > 0 && s.echoes > 0) {
            msg += `⚖️ **FLUX** — ${s.births} birth${s.births > 1 ? 's' : ''}, ${s.echoes} echo${s.echoes > 1 ? 'es' : ''}. The balance shifts.\n\n`;
        }

        msg += `👥 **Populace**: ${s.populace} citizens | ${s.shadowPop} shadows\n`;
        msg += `🗺️ **Territory**: ${s.unlockedTiles}/${MAX_TILES} tiles [${tileBar}]\n`;
        msg += `🐾 **Feral Elexamon**: ${s.feralElexamon} roaming the wilds\n`;

        // Tile generation details
        if (s.newTiles && s.newTiles.length > 0) {
            const tileNames = s.newTiles.map(t => `${t.biome} (${t.element})`).join(', ');
            msg += `🗺️ **New Terrain**: ${tileNames}\n`;
            const cycle = s.newTiles[0].cycleLabel || '⚖️ Equilibrium';
            msg += `🌡️ **Market Cycle**: ${cycle}\n`;
        }

        msg += `📊 **Lifetime**: ${s.totalBirths} births | ${s.totalEchoes} echoes\n\n`;
        msg += `*The Lands grow with conviction. The Void feeds on doubt.* 💜`;

        return msg;
    }

    formatDecayMessage(d) {
        let msg = `🌙 **NIGHTFALL** — The Lands rest.\n\n`;
        msg += `${d.popLoss} citizens retire to the shadows. ${d.shadowLoss} echoes fade to nothing.\n`;
        msg += `👥 ${d.populace} remain. ${d.shadowPop} shadows linger.\n\n`;
        msg += `*"Even empires must sleep. But the faithful return with dawn."* 💜`;
        return msg;
    }

    // ─────────────────────────────────────────────
    // STATUS API
    // ─────────────────────────────────────────────

    getNextSyncTime() {
        if (!this.lastSyncTime) return 'now';
        const nextSync = this.lastSyncTime + MUTATION_COOLDOWN_MS;
        const remaining = Math.max(0, nextSync - Date.now());
        return remaining === 0 ? 'now' : `${Math.ceil(remaining / 60000)}min`;
    }

    async getStatus() {
        const world = await db.getWorldState();
        return {
            active: this.active,
            populace: world.populace || 0,
            shadowPop: world.shadowPop || 0,
            unlockedTiles: world.unlockedTiles || 1,
            maxTiles: MAX_TILES,
            feralElexamon: world.feralElexamon || 0,
            totalBirths: world.totalBirths || 0,
            totalEchoes: world.totalEchoes || 0,
            pending: {
                births: this.pendingBirths,
                echoes: this.pendingEchoes,
                feralSpawns: this.pendingFeralSpawns
            },
            nextSync: this.getNextSyncTime(),
            cooldownMinutes: MUTATION_COOLDOWN_MS / 60000,
            pdaSeed: PDA_SEED,
            tileGenerator: tileGenerator ? tileGenerator.getStats() : null,
            recentSyncs: this.syncHistory.slice(-5)
        };
    }
}

const populationEngine = new PopulationEngine();
module.exports = { populationEngine, BIRTH_POP, ECHO_SHADOW_POP, MUTATION_COOLDOWN_MS };
