class ReligionEngine {
    constructor() {
        this.gods = {
            PEPE: "🐸 PEPE (Growth)",
            DOGE: "🐕 DOGE (Community)",
            WOJAK: "😭 WOJAK (Despair)",
            CHAD: "🗿 CHAD (Conquest)"
        };
    }

    tick(worldState) {
        // React to Price Action
        // We'll calculate a 'delta' from prev price if we had history, 
        // for now we'll deduce sentiment from EconomyEngine's random walk result.
        
        // 1. Conversions
        // If price is HIGH -> PEPE
        // If price is LOW -> WOJAK
        // If price is FLAT -> DOGE
        
        // (Mock logic since we don't store history in this simplifed 'tick' yet, 
        // but EconomyEngine updates price in place. We'll use random chance for flavor here)
        
        const econ = worldState.economy;
        const civ = worldState.civilization;

        civ.citizens.forEach(c => {
            if (Math.random() > 0.9) { // 10% chance to change faith
                if (econ.sentiment === 'Euphoric') c.faith = 'Pepe';
                else if (econ.sentiment === 'Panic') c.faith = 'Wojak';
                else c.faith = 'Doge';
            }
        });

        // 2. Guild Formation
        // If > 5 people share a faith, form a Guild
        const counts = civ.citizens.reduce((acc, c) => {
            acc[c.faith] = (acc[c.faith] || 0) + 1;
            return acc;
        }, {});

        for (const [faith, count] of Object.entries(counts)) {
            if (faith === 'None') continue;
            if (count >= 5) {
                // Check if guild exists
                if (!civ.guilds) civ.guilds = [];
                const guildName = `${faith} Believers`;
                if (!civ.guilds.find(g => g.name === guildName)) {
                    civ.guilds.push({ name: guildName, faith, land: 1 });
                    console.log(`🏰 NEW GUILD FORMED: ${guildName}`);
                }
            }
        }
    }
}

module.exports = ReligionEngine;
