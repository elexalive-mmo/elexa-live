/**
 * Elexa Live: Launch Projection Simulator (v1.1)
 * Scenarios: 1M Market Cap Peak vs. 30K Market Cap Peak
 * Calibration: 1.0 factor = 100K MC
 */

const { TileGenerator, detectMarketCycle } = require('../lib/game/tile-generator');
const tg = new TileGenerator();
tg.init('E1exA_L1ve_Launch_Seed_2026');

function simulate(name, dayData) {
    let totalPop = 10; // Initial seed citizens
    let totalTiles = 1;
    let worldLog = [];

    dayData.forEach((day, index) => {
        // marketCap is in K (so 1000 = 1M)
        const factor = day.marketCap / 100; // Normalize so 100K = 1.0 factor
        const cycle = detectMarketCycle(factor);

        const births = day.births;
        const echoes = day.echoes || 0;

        const popGain = births * 6;
        const tileGain = births;
        const tileLoss = echoes;

        totalPop += popGain;
        totalTiles = Math.max(1, totalTiles + tileGain - tileLoss);

        // Generate new tiles for this day
        const newTiles = [];
        for (let i = 0; i < tileGain; i++) {
            newTiles.push(tg.generateTile(totalTiles - tileGain + i + 1, factor));
        }

        const stats = {
            day: index + 1,
            marketCap: day.marketCap >= 1000 ? `${day.marketCap / 1000}M` : `${day.marketCap}K`,
            marketFactor: factor.toFixed(2),
            cycle: cycle.label,
            totalPopulation: totalPop,
            totalTiles: totalTiles,
            expansionRadius: Math.max(...newTiles.map(t => Math.max(Math.abs(t.x), Math.abs(t.y))) || [0]),
            newBiomes: [...new Set(newTiles.map(t => t.biome))]
        };

        worldLog.push(stats);
    });

    return worldLog;
}

const scenarioA = [
    { marketCap: 100, births: 15 },    // Day 1: 100K (Bonding)
    { marketCap: 1000, births: 60 },   // Day 2: 1M (Peak)
    { marketCap: 800, births: 10 }     // Day 3: 800K (Consolidation)
];

const scenarioB = [
    { marketCap: 20, births: 3 },      // Day 1: 20K
    { marketCap: 30, births: 5 },      // Day 2: 30K
    { marketCap: 15, births: 1, echoes: 4 } // Day 3: 15K (Contraction)
];

const resultsA = simulate("THE MOON (1M PEAK)", scenarioA);
const resultsB = simulate("THE DRIFT (30K PEAK)", scenarioB);

process.stdout.write(JSON.stringify({ resultsA, resultsB }, null, 2));
