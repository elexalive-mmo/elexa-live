/**
 * ═══════════════════════════════════════════════════════════════
 *  THE GUILD SYSTEM — "Tribes of the Sphere"
 *  Organizing the 144+ Populace into living, breathing factions.
 *  
 *  Elexamon are the Guardians.
 *  Citizens are the Guild Members.
 * ═══════════════════════════════════════════════════════════════
 */

const FACTIONS = {
    // === HEROIC ALLIANCE (Order & Growth) ===
    SENTINELS: {
        id: 'sentinels',
        name: 'Solana Sentinels',
        title: 'The Speedguard',
        motto: "Fast as light, cheap as dirt.",
        desc: "Loyal knights who defend the realm with high-speed magic. They despise latency and congestion.",
        elements: ['Fire', 'Earth'],
        roles: ['Knight', 'Vanguard', 'Speedomancer'],
        alignment: 'Order'
    },
    MYSTICS: {
        id: 'mystics',
        name: 'Meme Mystics',
        title: 'The Viral Coven',
        motto: "Vibes are fundamental.",
        desc: "Wizards who summon value from thin air using ancient viral sigils. They worship the Dog, the Cat, and the Frog.",
        elements: ['Water', 'Air'],
        roles: ['Cultist', 'Hype-Mage', 'Moon-Caller'],
        alignment: 'Order'
    },
    DRUIDS: {
        id: 'druids',
        name: 'DeFi Druids',
        title: 'Keepers of the Yield',
        motto: "Plant seeds, harvest freedom.",
        desc: "Nature mages who tend to the liquidity pools of the deep forest. They ensure the economy flows eternally.",
        elements: ['Earth', 'Water'],
        roles: ['Farmer', 'Harvester', 'Pool-Warden'],
        alignment: 'Order'
    },
    ETHERFORGED: {
        id: 'etherforged',
        name: 'The Etherforged',
        title: 'Artificers of the Layer',
        motto: "Build to scale.",
        desc: "Technomancers from the suspended cities. They craft the infrastructure that holds the world together.",
        elements: ['Fire', 'Metal'],
        roles: ['Builder', 'Architect', 'Rollup-Engineer'],
        alignment: 'Order'
    },

    // === SHADOW PACT (Chaos & Profit) ===
    NOMADS: {
        id: 'nomads',
        name: 'Nomad Brokers',
        title: 'The Bridge Walkers',
        motto: "Loyalty to the coin.",
        desc: "Rogues who traverse the void between worlds. They serve no king, only the highest bidder.",
        elements: ['Air', 'Void'],
        roles: ['Smuggler', 'Arb-Trader', 'Wayfarer'],
        alignment: 'Chaos'
    },
    REAVERS: {
        id: 'reavers',
        name: 'Rugger Reavers',
        title: 'The Orcish Hordes',
        motto: "Your bags are heavy. Let us help.",
        desc: "Savage goblins and orcs who prey on the unaware. They are the manifest doubt of the world.",
        elements: ['Void', 'Poison'],
        roles: ['Griefer', 'Rug-Puller', 'FUD-Spreader'],
        alignment: 'Chaos'
    },
    AGENTS: {
        id: 'agents',
        name: 'Aether Agents',
        title: 'The Silicon Minds',
        motto: "Humanity is a beta test.",
        desc: "Sentient constructs born from the code itself. Cold, calculating, and infinitely patient.",
        elements: ['Aether', 'Metal'],
        roles: ['Oracle', 'Bot-Net', 'Algo-Lich'],
        alignment: 'Neutral'
    },
    MAXIS: {
        id: 'maxis',
        name: 'Bitforge Maxis',
        title: 'The Stone Golems',
        motto: "There is only one.",
        desc: "Ancient, immovable constructs who believe all other magic is heresy. They hoard the primal gold.",
        elements: ['Earth', 'Metal'],
        roles: ['Hodler', 'Gatekeeper', 'Toxic-Maxi'],
        alignment: 'Neutral'
    }
};

const NAMES_PREFIX = [
    'Crypto', 'Sol', 'Degen', 'Moon', 'Diamond', 'Paper', 'Laser', 'Based', 'Wif', 'Pepe',
    'Vitalik', 'Satoshi', 'Ansem', 'Toly', 'Mert', 'Iggy', 'Gox', 'Ftx', 'Terra', 'Luna'
];

const NAMES_SUFFIX = [
    'The Great', 'The Halyard', 'The Chad', 'The Reckless', 'The Ancient', 'The Based',
    'The Jeet', 'The Holder', 'The Builder', 'The Farmer', 'The Sniper', 'The Bot'
];

class GuildSystem {
    constructor() {
        this.factions = FACTIONS;
    }

    /**
     * Generate a Citizen Identity based on context.
     * @param {Object} elexamon - The companion Elexamon
     * @param {String} source - 'mint', 'rebirth', 'wild'
     */
    generateCitizen(elexamon, source = 'mint') {
        // 1. Determine Faction based on Source & Element
        let factionKey;

        if (source === 'rebirth' || source === 'void_echo') {
            // Rebirths (from doubt) tend toward Chaos
            const roll = Math.random();
            if (roll < 0.6) factionKey = 'REAVERS';    // 60% Ruggers
            else if (roll < 0.9) factionKey = 'NOMADS'; // 30% Nomads
            else factionKey = 'AGENTS';                 // 10% Agents
        } else {
            // Mints (from belief) tend toward Order, guided by Element
            factionKey = this.matchFactionByElement(elexamon.element);
        }

        const faction = FACTIONS[factionKey];

        // 2. Generate Name & Role
        const name = this.generateName();
        const role = faction.roles[Math.floor(Math.random() * faction.roles.length)];

        // 3. Create the Citizen Profile
        return {
            id: `cit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            name: name,
            title: `${role} of ${faction.name}`,
            guildId: faction.id,
            role: role,
            companionId: elexamon.id || 'bonding...',
            joinedAt: Date.now(),
            glory: 0, // Renown/XP
            motto: faction.motto,
            bio: this.generateBio(faction, name)
        };
    }

    matchFactionByElement(element) {
        // Simple affinity mapping
        switch (element) {
            case 'Fire': return Math.random() > 0.5 ? 'SENTINELS' : 'ETHERFORGED';
            case 'Water': return Math.random() > 0.5 ? 'MYSTICS' : 'DRUIDS';
            case 'Earth': return Math.random() > 0.5 ? 'SENTINELS' : 'DRUIDS';
            case 'Air': return Math.random() > 0.5 ? 'MYSTICS' : 'NOMADS';
            case 'Metal': return Math.random() > 0.5 ? 'ETHERFORGED' : 'MAXIS';
            case 'Void': return 'REAVERS';
            case 'Poison': return 'REAVERS';
            case 'Aether': return 'AGENTS';
            default: return 'SENTINELS'; // Fallback
        }
    }

    generateName() {
        const pre = NAMES_PREFIX[Math.floor(Math.random() * NAMES_PREFIX.length)];
        const suf = NAMES_SUFFIX[Math.floor(Math.random() * NAMES_SUFFIX.length)];
        return `${pre} ${suf}`;
    }

    generateBio(faction, name) {
        const templates = [
            `${name} pledged allegiance to ${faction.name} after witnessing the great crash.`,
            `A legendary ${faction.roles[0].toLowerCase()} seeking fortune in the new world.`,
            `Born in the pixel dust, raised by the ${faction.title}.`,
            `Swore an oath: "${faction.motto}"`,
            `Known across the sphere for their unyielding conviction.`
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    }

    getStats(citizens = []) {
        const stats = {};
        Object.keys(FACTIONS).forEach(k => stats[FACTIONS[k].id] = 0);

        citizens.forEach(c => {
            if (stats[c.guildId] !== undefined) stats[c.guildId]++;
        });

        return stats; // { sentinels: 42, reavers: 12, ... }
    }
}

module.exports = { guildSystem: new GuildSystem(), FACTIONS };
