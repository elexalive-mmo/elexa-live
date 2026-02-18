/**
 * ═══════════════════════════════════════════════════════════════
 *  REBIRTH ENGINE — "The Void Echo"
 *  When lamports leave the treasury, doubt births renewal.
 *  Echo resonators unwittingly spawn Gen 100+ Elexamon
 *  for the faithful.
 * ═══════════════════════════════════════════════════════════════
 */

const { hatcher } = require('../game/hatcher');
const { broadcaster } = require('../broadcast');
const { db } = require('../db');

// Anti-Abuse Constants
const MIN_RECLAIM_SOL = 0.002;       // Ignore dust amounts
const MAX_SPAWNS_PER_DAY = 5;        // Cap free spawns
const DEGEN_THRESHOLD = 5;           // Reclaims/24h to trigger shiny boost
const SHINY_BOOST_MULTIPLIER = 2.0;  // 2x shiny odds during degen alert
const FOUNDER_HOLD_DAYS = 7;         // Hold 7 days for priority airdrop

class RebirthEngine {
    constructor() {
        this.lastKnownBalance = null;
        this.dailyReclaims = 0;
        this.dailySpawns = 0;
        this.lastResetDate = new Date().toDateString();
        this.rebirthLog = [];
        this.communityPool = [];       // Queue of spawned Elexamon awaiting claim
        this.active = false;
    }

    /**
     * Start the reclaim detection loop.
     * Polls treasury balance every 60s, looking for decreases.
     */
    start(treasury) {
        this.treasury = treasury;
        this.lastKnownBalance = parseFloat(treasury.balanceSOL) || 0;
        this.active = true;

        // Check every 60 seconds
        setInterval(() => this.detectReclaims(), 60000);

        console.log('[Rebirth] 🌀 Void Echo Engine ACTIVE — Watching for reclaim events.');
    }

    /**
     * Core detection: Compare balance snapshots.
     * If balance decreased by > MIN_RECLAIM_SOL, it's a reclaim.
     */
    async detectReclaims() {
        // Reset daily counters at midnight
        const today = new Date().toDateString();
        if (today !== this.lastResetDate) {
            this.dailyReclaims = 0;
            this.dailySpawns = 0;
            this.lastResetDate = today;
        }

        const currentBalance = parseFloat(this.treasury.balanceSOL) || 0;

        // First run — just record the baseline
        if (this.lastKnownBalance === null) {
            this.lastKnownBalance = currentBalance;
            return;
        }

        const delta = this.lastKnownBalance - currentBalance;
        this.lastKnownBalance = currentBalance;

        // Ignore increases (deposits) and dust
        if (delta <= MIN_RECLAIM_SOL) return;

        // It's a reclaim!
        this.dailyReclaims++;
        console.log(`[Rebirth] 🌀 Reclaim detected: -${delta.toFixed(4)} SOL (Daily: ${this.dailyReclaims})`);

        await this.triggerRebirth(delta);
    }

    /**
     * Trigger a Void Echo rebirth event.
     * Spawns a Gen 100+ Elexamon into the community pool.
     */
    async triggerRebirth(reclaimAmountSOL) {
        // Anti-abuse: cap daily spawns
        if (this.dailySpawns >= MAX_SPAWNS_PER_DAY) {
            console.log('[Rebirth] Daily spawn cap reached. Echo absorbed silently.');
            return null;
        }

        // Degen alert: 5+ reclaims in 24h → boost shiny odds
        if (this.dailyReclaims >= DEGEN_THRESHOLD) {
            hatcher.boost(SHINY_BOOST_MULTIPLIER);
            console.log(`[Rebirth] ⚠️ DEGEN ALERT — ${this.dailyReclaims} reclaims today. Shiny odds 2x for 1h.`);
        }

        // Hatch a Gen 100+ Elexamon (weighted toward Common/Rare)
        const spawn = hatcher.hatch({
            generation: 100 + this.dailySpawns,
            userId: 'community_pool',
            volumeBoost: Math.min(reclaimAmountSOL * 2, 3.0) // Bigger reclaims = slightly better odds
        });

        // Cap tier for free spawns — no free Legendaries
        if (spawn.tier === 'Legendary') {
            spawn.tier = 'Epic';
        }

        spawn.source = 'void_echo';
        spawn.reclaimSOL = reclaimAmountSOL;

        // Add to community pool
        this.communityPool.push(spawn);
        this.dailySpawns++;

        // Log it
        this.rebirthLog.push({
            timestamp: Date.now(),
            reclaimSOL: reclaimAmountSOL,
            spawn: {
                name: spawn.name,
                element: spawn.element,
                tier: spawn.tier,
                generation: spawn.generation,
                shiny: spawn.shiny
            }
        });

        // Update world state via Population Engine (Echo Reclaim)
        // +3 shadow pop, -1 tile, +1 feral — queued for hourly sync
        try {
            const { populationEngine } = require('./population-engine');
            populationEngine.queueEcho('reclaim', {
                reclaimSOL: reclaimAmountSOL,
                spawnName: spawn.name,
                spawnElement: spawn.element
            });
        } catch (e) {
            console.warn('[Rebirth] Population queue failed:', e.message);
        }

        // Herald announces the Void Echo
        const heraldMsg = this.formatVoidEchoMessage(spawn, reclaimAmountSOL);
        await broadcaster.broadcast(heraldMsg, ['telegram', 'discord', 'twitch']);

        console.log(`[Rebirth] ✨ Void Echo #${this.dailySpawns}: ${spawn.name} (${spawn.element}, ${spawn.tier}, Gen ${spawn.generation}${spawn.shiny ? ' ✨SHINY!' : ''})`);

        return spawn;
    }

    /**
     * Format the Herald announcement for a Void Echo.
     */
    formatVoidEchoMessage(spawn, reclaimSOL) {
        const shinyTag = spawn.shiny ? ' ✨ **SHINY!**' : '';

        let msg = `🌀 **VOID ECHO DETECTED**\n\n`;
        msg += `A doubter fled the void... but their echo births a guardian!\n\n`;
        msg += `🥚 **${spawn.name}** — ${spawn.element} ${spawn.tier}${shinyTag}\n`;
        msg += `📊 Generation: ${spawn.generation}\n`;
        msg += `💫 Source: Echo Resonance (${reclaimSOL.toFixed(4)} SOL)\n\n`;
        msg += `*Community Pool: ${this.communityPool.length} unclaimed. Type /claim to adopt.*`;

        return msg;
    }

    /**
     * Claim an Elexamon from the community pool.
     * Priority: Active holders (>7 days) first.
     */
    claimFromPool(userId) {
        if (this.communityPool.length === 0) {
            return { success: false, message: 'The community pool is empty. No echoes remain.' };
        }

        // FIFO — first spawned, first claimed
        const spawn = this.communityPool.shift();
        spawn.owner = userId;
        spawn.claimedAt = Date.now();

        return {
            success: true,
            elexamon: spawn,
            message: `You claimed **${spawn.name}** (${spawn.element} ${spawn.tier}, Gen ${spawn.generation})! The void rewards the faithful.`
        };
    }

    /**
     * Get rebirth stats for Herald pulse and /rebirth command.
     */
    getStats() {
        return {
            active: this.active,
            dailyReclaims: this.dailyReclaims,
            dailySpawns: this.dailySpawns,
            maxSpawnsPerDay: MAX_SPAWNS_PER_DAY,
            communityPoolSize: this.communityPool.length,
            totalRebirths: this.rebirthLog.length,
            recentRebirths: this.rebirthLog.slice(-5).map(r => ({
                name: r.spawn.name,
                element: r.spawn.element,
                tier: r.spawn.tier,
                shiny: r.spawn.shiny,
                ago: Math.floor((Date.now() - r.timestamp) / 60000) + 'm'
            }))
        };
    }
}

const rebirthEngine = new RebirthEngine();
module.exports = { rebirthEngine, RebirthEngine };
