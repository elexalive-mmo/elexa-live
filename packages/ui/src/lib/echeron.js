// Echeron Constants (Subtle Integration)
// Used for XP scaling and streak bonuses

export const PHI = 1.618;  // Golden ratio for multipliers

// XP Action Rewards
export const ACTION_REWARDS = {
    // Chat & Engagement
    chat: 5,
    command: 10,
    react: 3,

    // Twitch Actions
    twitch_message: 10,
    twitch_follow: 50,
    twitch_sub: 200,
    twitch_raid: 300,
    twitch_bits: 1,  // per bit

    // Twitter/X Actions
    x_like: 5,
    x_retweet: 15,
    x_reply: 20,
    x_follow: 50,

    // Contributions
    contribute: 100,
    referral: 250
};

// Streak multiplier (based on consecutive days)
export const getStreakMultiplier = (days) => {
    if (days < 2) return 1;
    return Math.min(1 + (days * 0.1), PHI);  // Max 1.618x
};

// Level thresholds
export const LEVEL_THRESHOLDS = [
    0,      // Level 0
    100,    // Level 1
    300,    // Level 2
    600,    // Level 3
    1000,   // Level 4
    2000,   // Level 5
    5000,   // Level 6
    10000,  // Level 7
    25000,  // Level 8
    50000,  // Level 9
    100000  // Level 10
];

// Rank names
export const RANKS = [
    'Observer',
    'Watcher',
    'Participant',
    'Contributor',
    'Navigator',
    'Guardian',
    'Architect',
    'Luminary',
    'Ascended',
    'Transcendent',
    'Eternal'
];

export const getLevelFromXP = (xp) => {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (xp >= LEVEL_THRESHOLDS[i]) return i;
    }
    return 0;
};

export const getRankFromLevel = (level) => RANKS[Math.min(level, RANKS.length - 1)];

export const RECURSION_STATES = {
    COLLAPSE: { id: 0, color: '#ef4444', label: 'Collapse', icon: '📉' },
    STABILIZE: { id: 1, color: '#eab308', label: 'Stable', icon: '⚖️' },
    TRANSCEND: { id: 2, color: '#a855f7', label: 'Transcend', icon: '🔮' }
};

export const LAMBDA_CRITICAL = (PHI + Math.sqrt(PHI * PHI + 4)) / 2;

export const calculateRecursionState = (recentEventsCount, streak) => {
    // Simple logic based on theory: High activity + High streak = Transcend
    const energy = recentEventsCount * (streak > 0 ? streak : 1);

    if (energy < 2) return RECURSION_STATES.COLLAPSE;
    if (energy > 20) return RECURSION_STATES.TRANSCEND;
    return RECURSION_STATES.STABILIZE;
};

// === elexa.land Core Mechanics ===

export const RARITY = {
    COMMON: { id: 'common', color: '#9ca3af', label: 'Fragment', chance: 0.5 },    // 50%
    UNCOMMON: { id: 'uncommon', color: '#22c55e', label: 'Cache', chance: 0.25 }, // 25%
    RARE: { id: 'rare', color: '#3b82f6', label: 'Protocol', chance: 0.15 },      // 15%
    EPIC: { id: 'epic', color: '#a855f7', label: 'Construct', chance: 0.08 },     // 8%
    LEGENDARY: { id: 'legendary', color: '#f97316', label: 'Core', chance: 0.02 }  // 2%
};

export const CLASSES = {
    RAIDER: { id: 'raider', label: 'Raider', stat: 'STR', desc: 'Flow & Velocity' },
    WHALE: { id: 'whale', label: 'Whale', stat: 'CON', desc: 'Stability & Value' },
    DEV: { id: 'dev', label: 'Dev', stat: 'INT', desc: 'Logic & Architecture' }
};

export const LOOT_TABLE = [
    { type: 'xp_boost', label: 'Data Stim', rarity: 'COMMON', value: 10 },
    { type: 'xp_boost', label: 'Neural Patch', rarity: 'UNCOMMON', value: 50 },
    { type: 'badge', label: 'Blue Key', rarity: 'RARE', value: 100 },
    { type: 'badge', label: 'Void Shard', rarity: 'EPIC', value: 500 },
    { type: 'item', label: 'Genesis Core', rarity: 'LEGENDARY', value: 1000 }
];
