// --- CONSTANTS ---
const NAMES = [
    "Satoshi_Jr", "Doge_Whisperer", "Vitalik_But_Buff", "Pepe_Silvia", 
    "Wojak_Horseman", "Carol_from_HR", "Giga_Chadsworth", "Exit_Liquidity",
    "Trust_Me_Bro", "Wifey", "The_Intern", "Gary", "Dev_Ops", "Moon_Boi",
    "Alice", "Bob", "Charlie", "Dave", "Eve", "Frank", "Grace"
];
const ROLES = ["Vagabond", "Miner", "Trader", "Artist", "Architect", "Warlord", "Mystic"]; // Matches Rust Enum
const ASPIRATIONS = ["Moon", "Lambo", "Tech", "Vibes", "Chaos", "Order", "Decentralization"];

class CivilizationEngine {
    constructor() {
        this.names = NAMES;
    }

    tick(worldState) {
        const civ = worldState.civilization;
        const econ = worldState.economy;
        const time = worldState.time;

        // 1. Simulate Life (Sleep/Active)
        this.simulateLife(civ, time);

        // 2. Growth Check (Births)
        this.checkGrowth(civ, econ.phase);

        // 3. Trade & Economy (NPC EXP Swaps)
        this.simulateEconomy(civ, worldState);
    }

    simulateLife(civ, time) {
        const isNight = time > 2000 || time < 600;

        civ.citizens.forEach(c => {
            // Initialize Memory if missing (Migration V2)
            if (!c.memory) c.memory = [];
            
            // Sleep Logic
            if (isNight && Math.random() > 0.3) {
                c.status = 'Sleeping';
            } else {
                c.status = 'Active';
            }

            // Action Logic (Only if Active)
            if (c.status === 'Active' && Math.random() > 0.8) {
                c.exp += 10; // Gain XP for existing
                
                // 10% Chance for a "Memory Event"
                if (Math.random() > 0.9) {
                    this.createMemory(c, civ);
                }

                // 20% Chance to Chat
                if (Math.random() > 0.8) {
                    this.generateChat(c, civ);
                }
            }
        });
    }

    simulateEconomy(civ, worldState) {
        // "NPCs just trade bits of EXP around until their Council Member makes a transaction for them."
        // 1. Pick random pairs to trade
        const activeCitizens = civ.citizens.filter(c => c.status === 'Active' && c.type === 'NPC');
        
        if (activeCitizens.length < 2) return;

        const trader = activeCitizens[Math.floor(Math.random() * activeCitizens.length)];
        const partner = activeCitizens[Math.floor(Math.random() * activeCitizens.length)];

        if (trader.id !== partner.id) {
            // Trade Logic: Small EXP swap represents "Micro-Value"
            const tradeAmount = Math.floor(Math.random() * 5) + 1;
            
            // Trader gains, Partner 'pays' (simulating service/goods exchange)
            // For now, we just mock generation to keep economy flowing upwards
            trader.exp += tradeAmount;
            partner.exp += Math.ceil(tradeAmount * 0.5); // Both gain from interaction (Positive Sum)

            // 2. Council Tribute (Volume Generation)
            // If Trader gets rich, they kick up to Council
            if (trader.exp > 100 && Math.random() > 0.9) {
                // Find relevant council member (mocked for now)
                // In future: Map Role -> Council Member
                worldState.economy.recentTrade = {
                    role: trader.role,
                    action: "TRIBUTE",
                    amount: tradeAmount,
                    timestamp: Date.now()
                };
            }
        }
    }

    createMemory(citizen, civState) {
        const memories = [
            "found a rugged token", "minted an NFT", "got liquidated", 
            "met a whale", "touched grass", "wrote some code", 
            "prayed to Doge", "saw the charts"
        ];
        const event = memories[Math.floor(Math.random() * memories.length)];
        const memory = `Tick ${Date.now()}: ${event}`;
        citizen.memory.push(memory);
        if (citizen.memory.length > 5) citizen.memory.shift(); // Keep last 5
        // console.log(`🧠 MEMORY: ${citizen.name} ${event}`);
    }

    generateChat(citizen, civState) {
        // Simple chat lines for now (can expand with AI later)
        const phrases = ["GM", "WAGMI", "PUMP IT", "LFG", "Dev is based", "Wen Binance?", "Looks rare", "I'm bullish"];
        
        // Context aware
        let contextPhrase = "";
        if (citizen.role === 'Architect') contextPhrase = "Deploying contract...";
        if (citizen.role === 'Trader') contextPhrase = "Charts look good.";
        if (citizen.role === 'Mystic') contextPhrase = "The stars align."; // Replaced 'Faith' checks with Role/Vision
        if (citizen.vision === 'Lambo') contextPhrase = "Wen Binance?";

        const finalPhrase = (Math.random() > 0.7 && contextPhrase) ? contextPhrase : phrases[Math.floor(Math.random() * phrases.length)];
        
        const msg = `[${citizen.name}]: ${finalPhrase}`;
        
        civState.chatLog.push(msg);
        if (civState.chatLog.length > 10) civState.chatLog.shift();
        
        console.log(`   💬 ${msg}`);
    }

    checkGrowth(civ, phase) {
        let spawnChance = 0.2;
        if (phase === 'MIGRATION') spawnChance = 0.05; // Fear
        if (phase === 'ASCENT') spawnChance = 0.5; // FOMO
        if (phase === 'CITADEL') spawnChance = 0.8; // Utopia

        if (Math.random() < spawnChance) {
            const newName = this.names[Math.floor(Math.random() * this.names.length)] + "_" + Math.floor(Math.random()*999);
            const newCit = {
                id: civ.citizens.length + 1,
                owner: "SYSTEM", // NPC
                type: "NPC", // Enum { NPC, Player }
                lifespan: Math.floor(Math.random() * 50000) + 10000, // Ticks until death
                name: newName,
                role: ROLES[Math.floor(Math.random() * ROLES.length)],
                vision: ASPIRATIONS[Math.floor(Math.random() * ASPIRATIONS.length)],
                is_founder: false,
                hp: 100,
                morale: 100,
                level: 1,
                exp: 0,
                birth_tick: Date.now(),
                stats: {
                    strength: Math.floor(Math.random() * 10),
                    intellect: Math.floor(Math.random() * 10),
                    charisma: Math.floor(Math.random() * 10),
                    luck: Math.floor(Math.random() * 10)
                },
                inventory: [], // Empty loot bag
                status: 'Newborn',
                memory: [] 
            };
            civ.citizens.push(newCit);
            civ.population++;
            // console.log(`✨ NEW CITIZEN: ${newName} joined! [${newCit.role}]`);
        }
    }
}

module.exports = CivilizationEngine;
