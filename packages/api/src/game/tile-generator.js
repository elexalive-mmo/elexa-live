/**
 * ═══════════════════════════════════════════════════════════════
 *  TILE GENERATOR — "The Breath of Creation"
 *
 *  Procedural tile generation from Solana seed + market cycle.
 *  Each tile is born from population count, PDA seed, and
 *  the current market sentiment (euphoria ↔ devastation).
 *
 *  FORMULA:
 *    tileId = populaceCount
 *    biome  = Perlin(seed + tileId) → mapped to world-map regions
 *    mood   = WFC blend of marketFactor + hazard + element
 *    visual = { terrain, weather, light, creatures, structures }
 *
 *  MARKET CYCLES:
 *    euphoria    → bright, lush, golden light, rare spawns
 *    neutral     → balanced, natural, standard encounters
 *    devastation → dark, corrupted, void energy, feral spawns
 * ═══════════════════════════════════════════════════════════════
 */

const path = require('path');
const fs = require('fs-extra');

// ─── PERLIN NOISE (Minimal Implementation) ─────────────
// Classic 2D Perlin for tile terrain generation
class PerlinNoise {
    constructor(seed = 0) {
        this.seed = seed;
        this.permutation = this.generatePermutation(seed);
    }

    generatePermutation(seed) {
        const p = [];
        for (let i = 0; i < 256; i++) p[i] = i;
        // Fisher-Yates shuffle with seed
        let s = seed;
        for (let i = 255; i > 0; i--) {
            s = (s * 16807 + 0) % 2147483647;
            const j = s % (i + 1);
            [p[i], p[j]] = [p[j], p[i]];
        }
        // Duplicate for overflow
        return [...p, ...p];
    }

    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    lerp(a, b, t) { return a + t * (b - a); }
    grad(hash, x, y) {
        const h = hash & 3;
        const u = h < 2 ? x : y;
        const v = h < 2 ? y : x;
        return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
    }

    noise(x, y) {
        const p = this.permutation;
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);
        const u = this.fade(xf);
        const v = this.fade(yf);

        const aa = p[p[X] + Y];
        const ab = p[p[X] + Y + 1];
        const ba = p[p[X + 1] + Y];
        const bb = p[p[X + 1] + Y + 1];

        return this.lerp(
            this.lerp(this.grad(aa, xf, yf), this.grad(ba, xf - 1, yf), u),
            this.lerp(this.grad(ab, xf, yf - 1), this.grad(bb, xf - 1, yf - 1), u),
            v
        );
    }

    // Multi-octave fractal noise for richer terrain
    fractal(x, y, octaves = 4, persistence = 0.5) {
        let total = 0, frequency = 1, amplitude = 1, maxValue = 0;
        for (let i = 0; i < octaves; i++) {
            total += this.noise(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= 2;
        }
        return total / maxValue; // Normalized to [-1, 1]
    }
}

// ─── MARKET CYCLE DETECTION ─────────────────────────────
const MARKET_CYCLES = {
    EUPHORIA: { id: 'euphoria', label: '🌅 Euphoria', modifier: 1.5, lightColor: '#fbbf24', weather: 'golden_dawn', rareBoost: 2.0 },
    GROWTH: { id: 'growth', label: '🌿 Growth', modifier: 1.2, lightColor: '#22c55e', weather: 'clear', rareBoost: 1.3 },
    NEUTRAL: { id: 'neutral', label: '⚖️ Equilibrium', modifier: 1.0, lightColor: '#94a3b8', weather: 'overcast', rareBoost: 1.0 },
    DECLINE: { id: 'decline', label: '🌧️ Decline', modifier: 0.8, lightColor: '#64748b', weather: 'rain', rareBoost: 0.8 },
    DEVASTATION: { id: 'devastation', label: '🌀 Devastation', modifier: 0.5, lightColor: '#7c3aed', weather: 'void_storm', rareBoost: 0.5 }
};

function detectMarketCycle(marketFactor = 1.0) {
    // marketFactor: 0.0 (total crash) → 1.0 (normal) → 2.0+ (moon)
    if (marketFactor >= 1.8) return MARKET_CYCLES.EUPHORIA;
    if (marketFactor >= 1.2) return MARKET_CYCLES.GROWTH;
    if (marketFactor >= 0.8) return MARKET_CYCLES.NEUTRAL;
    if (marketFactor >= 0.4) return MARKET_CYCLES.DECLINE;
    return MARKET_CYCLES.DEVASTATION;
}

// ─── WORLD MAP REGION DATA ──────────────────────────────
// Loaded from world-map.json for canonical biome data
let WORLD_MAP = null;
function loadWorldMap() {
    if (WORLD_MAP) return WORLD_MAP;
    try {
        const mapPath = path.join(__dirname, '../../data/world-map.json');
        WORLD_MAP = fs.readJsonSync(mapPath);
        return WORLD_MAP;
    } catch (e) {
        console.warn('[TileGen] Failed to load world-map.json:', e.message);
        return null;
    }
}

// ─── THE FIVE HOLY REALMS (Council HQ) ──────────────────
const COUNCIL_REALMS = {
    '0,0': { id: 'arbiter_sanctuary', name: 'Arbiter\'s Sanctuary', agent: 'arbiter', element: 'Aether', structures: ['The Obsidian Gavel', 'Throne of Judgement'] },
    '10,10': { id: 'sentinel_bastion', name: 'Sentinel\'s Bastion', agent: 'sentinel', element: 'Metal', structures: ['The Watcher Tower', 'Iron Gates'] },
    '-10,10': { id: 'oracle_spire', name: 'Oracle\'s Spire', agent: 'oracle', element: 'Air', structures: ['The Eye of Providence', 'Silver Chimes'] },
    '10,-10': { id: 'keeper_vault', name: 'Keeper\'s Vault', agent: 'keeper', element: 'Earth', structures: ['The Eternal Library', 'Crystal Archives'] },
    '-10,-10': { id: 'void_abyss', name: 'Void\'s Abyss', agent: 'void', element: 'Void', structures: ['The Shadow Well', 'Altar of Silence'] }
};

// ─── BIOME DEFINITIONS (WFC candidates) ─────────────────
const BIOMES = [
    { id: 'gate_plaza', region: 'the_gate', element: 'Aether', tier: 1, noiseRange: [-1.0, -0.6], terrain: 'stone_plaza', structures: ['Portal Shrine', 'Merchant Stalls'], creatures: [] },
    { id: 'sylvan_canopy', region: 'sylvan_glades', element: 'Earth', tier: 1, noiseRange: [-0.6, -0.3], terrain: 'ancient_forest', structures: ['Spirit Oak', 'Herbalist Hut'], creatures: ['Mossfang', 'Thornwing'] },
    { id: 'ash_crater', region: 'ash_ridge', element: 'Fire', tier: 2, noiseRange: [-0.3, -0.1], terrain: 'volcanic_ridge', structures: ['The Grand Forge'], creatures: ['Ember Imp', 'Lava Serpent'] },
    { id: 'fog_swamp', region: 'fog_marsh', element: 'Water', tier: 2, noiseRange: [-0.1, 0.1], terrain: 'marsh_wetland', structures: ['Witch Cauldron'], creatures: ['Mud Lurker', 'Swamp Sprite'] },
    { id: 'sky_mesa', region: 'skybreak_plateau', element: 'Air', tier: 3, noiseRange: [0.1, 0.3], terrain: 'floating_mesa', structures: ['Wind Temple', 'Sky Bridge'], creatures: ['Cloud Hawk', 'Storm Wisp'] },
    { id: 'iron_foundry', region: 'iron_pass', element: 'Metal', tier: 3, noiseRange: [0.3, 0.5], terrain: 'rust_canyon', structures: ['Korr\'s Anvil', 'Rail Yard'], creatures: ['Gear Rat', 'Automaton Sentry'] },
    { id: 'frost_peaks', region: 'crystal_tundra', element: 'Ice', tier: 4, noiseRange: [0.5, 0.75], terrain: 'ice_mountain', structures: ['Ice Citadel', 'Frost Mirror'], creatures: ['Crystal Wolf', 'Ice Wraith'] },
    { id: 'deep_coast', region: 'abyssal_coast', element: 'Spirit', tier: 4, noiseRange: [0.75, 0.85], terrain: 'dark_cliffs', structures: ['Harbor', 'Sunken Wreck'], creatures: ['Tide Crab', 'Depth Angler'] },
    { id: 'void_rift', region: 'void_wastes', element: 'Void', tier: 5, noiseRange: [0.85, 1.0], terrain: 'reality_tear', structures: ['Echo Shard', 'Void Gate'], creatures: ['Shadow Lurker', 'Entropy Wisp'] }
];

// ─── TILE GENERATOR ─────────────────────────────────────

class TileGenerator {
    constructor() {
        this.generatedTiles = new Map(); // tileId → tileData
        this.currentCycle = MARKET_CYCLES.NEUTRAL;
        this.pdaSeed = null;
        this.perlin = null;
    }

    /**
     * Initialize with PDA seed (Solana token CA or world state seed)
     */
    init(pdaSeed = 'So11111111111111111111111111111111111111112') {
        this.pdaSeed = pdaSeed;
        // Convert PDA seed string to numeric seed for Perlin
        let numSeed = 0;
        for (let i = 0; i < pdaSeed.length; i++) {
            numSeed = ((numSeed << 5) - numSeed + pdaSeed.charCodeAt(i)) | 0;
        }
        this.perlin = new PerlinNoise(Math.abs(numSeed));
        loadWorldMap();
        console.log(`[TileGen] 🗺️ Initialized with PDA seed: ${pdaSeed.slice(0, 12)}... (numeric: ${Math.abs(numSeed)})`);
    }

    /**
     * Spiral Mapping: Tile 1 is Center (0,0).
     */
    getCoordinates(tileId) {
        if (tileId <= 1) return { x: 0, y: 0 };
        let n = Math.floor(Math.sqrt(tileId - 1));
        if (n % 2 === 0) n--;
        const layer = Math.floor((n + 1) / 2);
        const sideLen = 2 * layer;
        const offset = tileId - Math.pow(sideLen - 1, 2) - 1;
        let x, y;
        if (offset < sideLen) { x = layer; y = offset - layer + 1; }
        else if (offset < 2 * sideLen) { x = layer - (offset - sideLen + 1); y = layer; }
        else if (offset < 3 * sideLen) { x = -layer; y = layer - (offset - 2 * sideLen + 1); }
        else { x = -layer + (offset - 3 * sideLen + 1); y = -layer; }
        return { x, y };
    }

    getTileIdAt(x, y) {
        if (x === 0 && y === 0) return 1;
        const layer = Math.max(Math.abs(x), Math.abs(y));
        const sideLen = 2 * layer;
        const prevLayerArea = Math.pow(sideLen - 1, 2);
        let offset;
        if (x === layer && y > -layer && y <= layer) offset = y + layer - 1;
        else if (y === layer && x < layer && x >= -layer) offset = sideLen + (layer - x - 1);
        else if (x === -layer && y < layer && y >= -layer) offset = 2 * sideLen + (layer - y - 1);
        else offset = 3 * sideLen + (x + layer - 1);
        return prevLayerArea + offset + 1;
    }

    /**
     * Generate a tile from population count + market factor.
     * 
     * tileId = populaceId (population count at time of creation)
     * seed = PDA seed from Solana
     * marketFactor = 0.0–2.0+ (from treasury/price feed)
     */
    generateTile(populaceId, marketFactor = 1.0) {
        if (!this.perlin) this.init();

        const tileId = populaceId;

        // Check cache
        if (this.generatedTiles.has(tileId)) {
            return this.generatedTiles.get(tileId);
        }

        // 1. Market Cycle Detection
        const cycle = detectMarketCycle(marketFactor);
        this.currentCycle = cycle;

        const coords = this.getCoordinates(tileId);
        const coordKey = `${coords.x},${coords.y}`;

        // 2. Special Check: Holy Realms (Council HQ)
        let biome;
        let isHolyRealm = false;
        if (COUNCIL_REALMS[coordKey]) {
            const realm = COUNCIL_REALMS[coordKey];
            biome = {
                id: realm.id,
                region: 'Council Sector',
                element: realm.element,
                tier: 5,
                terrain: 'unbreakable_foundations',
                structures: realm.structures,
                creatures: []
            };
            isHolyRealm = true;
        } else {
            // Perlin Noise for biome selection
            const noiseVal = this.perlin.fractal(
                tileId * 0.1,           // Spread tiles across noise space
                cycle.modifier * 0.5,   // Market shifts the landscape
                4,                      // Octaves
                0.5                     // Persistence
            );
            biome = this.selectBiome(noiseVal, cycle, tileId);
        }

        // 3. Determine region placement
        const tile = {
            id: `tile_${tileId}`,
            tileId,
            populaceId,
            x: coords.x,
            y: coords.y,
            biome: biome.id,
            region: biome.region,
            element: biome.element,
            tier: biome.tier,
            terrain: biome.terrain,
            internalTile: Math.min(internalTile, 20), // Cap at 20 per region
            noiseValue: parseFloat(noiseVal.toFixed(4)),

            // Visual properties (market-modulated)
            visual: {
                lightColor: cycle.lightColor,
                weather: cycle.weather,
                intensity: Math.abs(noiseVal),
                corruption: cycle.id === 'devastation' ? Math.random() * 0.5 + 0.3 : 0,
                bloom: cycle.id === 'euphoria' ? Math.random() * 0.3 + 0.2 : 0
            },

            // Structures (procedural selection)
            structures: this.selectStructures(biome, tileId, cycle),

            // Creature spawns (market-modulated)
            creatures: this.selectCreatures(biome, cycle, tileId),

            // Resources
            resources: {
                lootMultiplier: (biome.tier + 1) * cycle.modifier,
                encounterRate: Math.min(0.5, 0.05 * (biome.tier + 1) * cycle.modifier),
                expBonus: cycle.modifier
            },

            // Metadata
            cycle: cycle.id,
            cycleLabel: cycle.label,
            generatedAt: new Date().toISOString(),
            pdaSeed: this.pdaSeed
        };

        // Cache
        this.generatedTiles.set(tileId, tile);
        return tile;
    }

    /**
     * Select biome based on noise value and market cycle.
     * During devastation: bias toward Void/Ice biomes.
     * During euphoria: bias toward Earth/Aether biomes.
     */
    selectBiome(noiseVal, cycle, tileId) {
        let adjustedNoise = noiseVal;

        // Market cycle shifts the biome distribution
        if (cycle.id === 'devastation') {
            adjustedNoise = adjustedNoise * 0.5 + 0.5; // Push toward high (void/ice)
        } else if (cycle.id === 'euphoria') {
            adjustedNoise = adjustedNoise * 0.5 - 0.3; // Push toward low (gate/sylvan)
        }

        // Find matching biome by noise range
        const matched = BIOMES.find(b =>
            adjustedNoise >= b.noiseRange[0] && adjustedNoise < b.noiseRange[1]
        );

        return matched || BIOMES[Math.abs(tileId) % BIOMES.length];
    }

    /**
     * Select structures for this tile.
     * Higher tileId = more developed structures.
     */
    selectStructures(biome, tileId, cycle) {
        const structures = [];
        const available = biome.structures || [];

        // Base: 1 structure per tile, +1 per 10 population
        const count = Math.min(available.length, 1 + Math.floor(tileId / 10));

        for (let i = 0; i < count; i++) {
            structures.push({
                name: available[i % available.length],
                level: Math.min(5, 1 + Math.floor(tileId / 20)),
                condition: cycle.id === 'devastation' ? 'ruined' :
                    cycle.id === 'euphoria' ? 'golden' : 'standard'
            });
        }

        return structures;
    }

    /**
     * Select creatures that spawn on this tile.
     * Market modulates: devastation → feral, euphoria → rare/shiny.
     */
    selectCreatures(biome, cycle, tileId) {
        const creatures = [];
        const available = biome.creatures || [];
        if (available.length === 0) return creatures;

        // 1-2 creature types per tile
        const count = 1 + (tileId % 2);
        for (let i = 0; i < Math.min(count, available.length); i++) {
            const creature = {
                name: available[i],
                element: biome.element,
                level: Math.min(100, biome.tier * 20 + (tileId % 20)),
                isFeral: cycle.id === 'devastation' && Math.random() < 0.4,
                isShiny: cycle.id === 'euphoria' && Math.random() < 0.1 * cycle.rareBoost,
                spawnRate: biome.tier >= 3 ? 0.15 : 0.3
            };
            creatures.push(creature);
        }

        return creatures;
    }

    /**
     * Get the current market cycle.
     */
    getCycle() {
        return this.currentCycle;
    }

    /**
     * Update market factor (called by treasury/price feed).
     */
    updateMarketFactor(factor) {
        const oldCycle = this.currentCycle;
        this.currentCycle = detectMarketCycle(factor);

        if (oldCycle.id !== this.currentCycle.id) {
            console.log(`[TileGen] 🔄 CYCLE SHIFT: ${oldCycle.label} → ${this.currentCycle.label}`);
            // Clear cache on cycle change (tiles regenerate with new mood)
            this.generatedTiles.clear();
            return { shifted: true, from: oldCycle, to: this.currentCycle };
        }
        return { shifted: false, current: this.currentCycle };
    }

    /**
     * Generate a batch of tiles (for initial world rendering).
     */
    generateBatch(startId, count, marketFactor = 1.0) {
        const tiles = [];
        for (let i = 0; i < count; i++) {
            tiles.push(this.generateTile(startId + i, marketFactor));
        }
        return tiles;
    }

    /**
     * Get stats for Herald/API.
     */
    getStats() {
        return {
            totalGenerated: this.generatedTiles.size,
            currentCycle: this.currentCycle,
            pdaSeed: this.pdaSeed ? this.pdaSeed.slice(0, 12) + '...' : null,
            biomeDistribution: this.getBiomeDistribution()
        };
    }

    getBiomeDistribution() {
        const dist = {};
        for (const [, tile] of this.generatedTiles) {
            dist[tile.biome] = (dist[tile.biome] || 0) + 1;
        }
        return dist;
    }
}

const tileGenerator = new TileGenerator();
module.exports = { tileGenerator, TileGenerator, MARKET_CYCLES, detectMarketCycle, BIOMES };
