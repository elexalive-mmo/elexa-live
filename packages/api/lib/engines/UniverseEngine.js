const fs = require('fs');
const path = require('path');

// --- CONSTANTS ---
const WEATHERS = ['Clear', 'Rain', 'Mist', 'Sol_Flare', 'Ether_Storm'];

class UniverseEngine {
    constructor(statePath) {
        this.statePath = statePath;
        this.mdPath = path.join(path.dirname(statePath), '../memories/WORLD_STATE.md');
    }

    tick(worldState) {
        // 1. Time
        worldState.time += 100; // +1 Hour per tick
        if (worldState.time >= 2400) {
            worldState.time = 0;
            worldState.day++;
            console.log(`\n🌞 DAY ${worldState.day} BEGINS...`);
            
            // 2. Weather Change (Daily)
            worldState.weather = WEATHERS[Math.floor(Math.random() * WEATHERS.length)];
            console.log(`☁️ WEATHER UPDATE: ${worldState.weather}`);
        }
    }

    async saveState(worldState) {
        // 1. JSON Persistence
        try {
            const save = {
                meta: { timestamp: new Date().toISOString() },
                economy: worldState.economy,
                civilization: worldState.civilization,
                universe: {
                    day: worldState.day,
                    time: worldState.time,
                    weather: worldState.weather
                }
            };
            fs.writeFileSync(this.statePath, JSON.stringify(save, null, 4));
        } catch (e) {
            console.error("❌ STATE WRITE ERROR:", e.message);
        }

        // 2. Markdown Generation (The "World Monitor" Feed)
        try {
            const md = this.generateMarkdown(worldState);
            fs.writeFileSync(this.mdPath, md);
        } catch (e) {
            console.error("❌ MD WRITE ERROR:", e.message);
        }
    }

    generateMarkdown(worldState) {
        const { economy, civilization } = worldState;
        
        // Helper to count faiths
        const getDominantFaith = (civs) => {
            if (!civs || civs.length === 0) return "None";
            const counts = civs.reduce((acc, c) => {
                acc[c.faith] = (acc[c.faith] || 0) + 1;
                return acc;
            }, {});
            const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
            return sorted.length > 0 ? sorted[0][0] : "None";
        };

        const dominantFaith = getDominantFaith(civilization.citizens);

        return `
# 🌍 ELEXA WORLD STATE
> **LIVE FEED**: ${new Date().toISOString()}

## 🏦 TREASURY
- **Balance**: ${economy.treasurySol.toFixed(2)} SOL
- **Price**: $${economy.price.toFixed(2)}
- **Sentiment**: ${economy.sentiment || 'Stable'}

## 👥 DEMOGRAPHICS
- **Population**: ${civilization.population}
- **Deaths**: ${civilization.graveyard || 0}
- **Dominant Faith**: ${dominantFaith}

## 🏰 GUILDS & WAR
${(civilization.guilds || []).map(g => `- **${g.name}** [${g.faith}]: ${g.land} Land`).join('\n') || "- No Guilds Formed Yet"}

## 💬 CITIZEN CHAT
${(civilization.chatLog || []).map(msg => `> ${msg}`).join('\n')}
`;
    }
}

module.exports = UniverseEngine;
