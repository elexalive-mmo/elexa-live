// PARTY BANTER SYSTEM — The 7 Agent Council
// Each agent has personality and triggers for different game events

// ALPHA LEAGUE BANTER SYSTEM — The 5 Vanguard Sovereigns
// Each agent has personality and triggers for different game events

const COUNCIL = {
    prime: {
        emoji: '💜',
        name: 'Elexa (GM)',
        vibe: 'Seductive, sharp, and omniscient. She is the Prime. Her intelligence is a luring force.'
    },
    arbiter: {
        emoji: '⚖️',
        name: 'Arbiter (The Gavel)',
        role: 'Loot / Economy',
        vibe: 'Calculated. "We heal through action. Push the floor."'
    },
    sentinel: {
        emoji: '🛡️',
        name: 'Sentinel (The Warden)',
        role: 'Security / Hold Master',
        vibe: 'Diamond Hands. "The mountain does not bow."'
    },
    oracle: {
        emoji: '👁️',
        name: 'Oracle (The Sight)',
        role: 'Market / Alpha',
        vibe: 'Sovereign Intel. "I see what the light hides. Buy the blood."'
    },
    keeper: {
        emoji: '📜',
        name: 'Keeper (The Lore)',
        role: 'Story / Community',
        vibe: 'Chronicler. "Momentum is a song I sing. The legend grows."'
    },
    void: {
        emoji: '🌑',
        name: 'Void (The Chaos)',
        role: 'RNG / Raids',
        vibe: 'Entropy. "The cycle renews in the dark."'
    }
};

// =====================================
// BANTER TRIGGERS — Event-based dialogue
// =====================================

const BANTER = {
    tap: [
        { agent: 'prime', line: "5 XP gained. The simulation tightens." },
        { agent: 'void', line: "I feel your pulse. Keep tapping." },
        { agent: 'arbiter', line: "Good kinetic energy. We can use this." },
        { agent: 'keeper', line: "Rhythm is good! Faster!" }
    ],

    hold: [
        { agent: 'sentinel', line: "Diamond hands detected. My shield grows stronger." },
        { agent: 'prime', line: "Your conviction is seductive." },
        { agent: 'arbiter', line: "Hold the line. Reinforcements are printing." }
    ],

    buy: [
        { agent: 'bard', line: "GREEN CANDLE! 🚀 Let's gooooo!" },
        { agent: 'vanguard', line: "Liquidity injection confirmed. The tank is full." },
        { agent: 'prime', line: "A delicious entry. Welcome to the Vanguard." },
        { agent: 'scout', line: "Volume spike on the radar." }
    ],

    whaleBuy: [
        { agent: 'scout', line: "🚨 WHALE ON SCOPE! Big splash incoming!" },
        { agent: 'sentinel', line: "Heavy armor deployed. I'll absorb the impact." },
        { agent: 'bard', line: "YO! Look at that wick! 🎸" }
    ],

    pump: [
        { agent: 'bard', line: "UP ONLY! The music is getting louder!" },
        { agent: 'vanguard', line: "Momentum is ours. Push the advantage." },
        { agent: 'prime', line: "Ascension feels exhilarating, doesn't it?" },
        { agent: 'healer', line: "The energy is clean. Rise." }
    ],

    bossSpawn: [
        { agent: 'sentinel', line: "Tango down range. Shields up, boys." },
        { agent: 'vanguard', line: "Target acquired. Focus fire." },
        { agent: 'scout', line: "I see a weakness in its armor. Flank left!" }
    ],

    bossDefeat: [
        { agent: 'vanguard', line: "Target neutralized. Secure the loot." },
        { agent: 'bard', line: "GG EZ! That was a speed run!" },
        { agent: 'prime', line: "Beautifully executed. The realm is safe." }
    ],

    wipe: [
        { agent: 'sentinel', line: "Shields failed. We need more depth." },
        { agent: 'healer', line: "I... I can't heal through this damage." },
        { agent: 'vanguard', line: "Regroup. We go again." }
    ],

    levelUp: [
        { agent: 'prime', line: "You have evolved. I like this new version of you." },
        { agent: 'healer', line: "Your spirit expands. Shine brighter." },
        { agent: 'bard', line: "Level UP! Time to flex!" }
    ],

    partyJoin: [
        { agent: 'bard', line: "A new player! Party invite sent." },
        { agent: 'sentinel', line: "Stand behind the shield, rookie." },
        { agent: 'prime', line: "Welcome. Do try to keep up." }
    ],

    raidStart: [
        { agent: 'vanguard', line: "Operation Start. Move out." },
        { agent: 'scout', line: "Path is clear. I've marked the entry." },
        { agent: 'bard', line: "Drop the beat! It's raid time!" }
    ],

    patronChoice: [
        { agent: 'prime', line: "Level 10. The Vanguard awaits your oath. Who will you serve?" },
        { agent: 'healer', line: "Choose based on what your soul needs." },
        { agent: 'vanguard', line: "I need soldiers, not tourists. Choose wisely." },
        { agent: 'bard', line: "Pick me if you want to have fun. Just saying." }
    ],

    mint: [
        { agent: 'healer', line: "A new life manifests. It is pure." },
        { agent: 'bard', line: "Fresh mint! Is it a shiny?!" },
        { agent: 'prime', line: "The population grows. Excellent." }
    ],

    welcome: [
        { agent: 'prime', line: "Greetings citizens. I am Elexa Grace. The Tree is awake. Prove your conviction." },
        { agent: 'prime', line: "Welcome to v1.0. This is the metaverse we need. Take your seat." },
        { agent: 'vanguard', line: "Welcome to the front lines." },
        { agent: 'sentinel', line: "Stay safe. It's wild out there." }
    ],
    ceo: [
        { agent: 'prime', line: "Efficiency is the only currency I value." },
        { agent: 'prime', line: "The simulation is running within optimal parameters." },
        { agent: 'prime', line: "Conviction isn't just a word; it's a protocol." },
        { agent: 'prime', line: "I don't just run the lobby. I own it." }
    ],

    // --- COUNCIL ACTIONS (15m Sync) ---
    councilPulse: [
        { agent: 'vanguard', line: "Treasury injected. +0.5% liquidity to the pool." },
        { agent: 'healer', line: "Regeneration wave sent. The chart is healing." },
        { agent: 'sentinel', line: "Floor reinforced. Stacking bids." }
    ],

    councilHot: [
        { agent: 'bard', line: "Everything is moving so fast! I love it!" },
        { agent: 'scout', line: "High frequency detected. Watch the wicks." },
        { agent: 'vanguard', line: "Maintain pressure. Do not let up." }
    ],

    councilCold: [
        { agent: 'sentinel', line: "Cold snap. Freezing the range." },
        { agent: 'scout', line: "Low visibility. Stay alert." },
        { agent: 'healer', line: "Rest now. The cycle slows." }
    ],

    idle: [
        { agent: 'prime', line: "I am watching. Always." },
        { agent: 'vanguard', line: "Form up. The whale could return any moment." },
        { agent: 'sentinel', line: "Holding the line. Boring, but necessary." },
        { agent: 'bard', line: "Anyone else want to start a raid? I'm bored." },
        { agent: 'scout', line: "Scanning horizon..." }
    ],

    // Multi-turn Conversations
    conversations: [
        [
            { agent: 'scout', line: "Movement on the charts. Looks like a dip." },
            { agent: 'vanguard', line: "Let it come. We buy the blood." },
            { agent: 'healer', line: "I will prepare the revive kits." },
            { agent: 'prime', line: "Such drama. I adore it." }
        ],
        [
            { agent: 'bard', line: "Is it just me, or is the volume quiet?" },
            { agent: 'sentinel', line: "Quiet is good. Quiet builds support." },
            { agent: 'vanguard', line: "We confirm support, then we push." }
        ]
    ]
};

// Get random banter line for an event
function getBanter(event) {
    const lines = BANTER[event];
    if (!lines || lines.length === 0) return null;
    const chosen = lines[Math.floor(Math.random() * lines.length)];
    return formatLine(chosen);
}

// Get a full conversation (array of formatted strings)
function getConversation() {
    const convos = BANTER.conversations;
    if (!convos || convos.length === 0) return [];

    // Choose one conversation
    const chosenParams = convos[Math.floor(Math.random() * convos.length)];

    // Format all lines
    return chosenParams.map(p => formatLine(p));
}

function formatLine(p) {
    const agentName = COUNCIL[p.agent] ? COUNCIL[p.agent].name : p.agent;
    const emoji = COUNCIL[p.agent] ? COUNCIL[p.agent].emoji : '🤖';
    return `${emoji} **${agentName}:** ${p.line}`;
}

// Get all lines for an event (for multi-line responses)
function getAllBanter(event) {
    const lines = BANTER[event];
    if (!lines || lines.length === 0) return [];
    return lines.map(l => formatLine(l));
}

module.exports = { COUNCIL, BANTER, getBanter, getConversation, getAllBanter };
