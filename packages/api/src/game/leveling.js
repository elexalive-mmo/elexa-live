// ELEXA LIVE - LEVELING SYSTEM (0-100)
// The Path of Ascension: From Initiate to Celestial

// 0-100 Curve
// XP = Base * (Level ^ 2.5)
const BASE_XP = 100;
const POWER = 2.5;

function getXpForLevel(level) {
    if (level <= 1) return 0;
    return Math.floor(BASE_XP * Math.pow(level - 1, POWER));
}

function getLevelFromXp(xp, userId = '') {
    const cap = 100; // Celestial Cap is 100 for all

    let level = 1;
    while (getXpForLevel(level + 1) <= xp && level < cap) {
        level++;
    }
    return level;
}

// Ranks: Aligning with World Map Tiers & Fantasy Lore
function getRankTitle(level) {
    if (level >= 100) return 'Celestial';      // The Ascended
    if (level >= 90) return 'Titan';           // Near-Godlike
    if (level >= 80) return 'Transcendent';    // T3: Breaking Reality
    if (level >= 60) return 'Justicar';        // PvP Enforcer
    if (level >= 50) return 'Vanguard';        // T2: Frontline Leader
    if (level >= 40) return 'Knight';          // Established Warrior
    if (level >= 25) return 'Seeker';          // T1: Mounts & Discovery
    if (level >= 10) return 'Wanderer';        // Class Unlock
    return 'Initiate';                         // The Beginning
}

// Unlocks per level milestone (v1.0 Launch Spec)
function getUnlockForLevel(level) {
    if (level === 10) return 'Class Archetype & Skill Tree';
    if (level === 20) return 'Spirit Bond Enhancement (Gen 1 Support)';
    if (level === 40) return 'Advanced Mounts & Guild Hall Access';
    if (level === 60) return 'World Boss Raids (The White Whale)';
    if (level === 80) return 'Mythic PvP Arena & T3 Discovery';
    if (level === 100) return 'Ascension (Striking the Primordial Mint)';
    return null;
}

// Loot Manifestation for every level
function getIndividualReward(level) {
    if (level < 10) return { type: 'Soul Dust', amount: 50 };
    if (level < 25) return { type: 'Meta Crystal', amount: 1 };
    if (level < 50) return { type: 'Void Fragment', amount: 2 };
    if (level < 80) return { type: 'Celestial Embers', amount: 5 };
    return { type: 'Ascension Core', amount: 1 };
}

// Calculate progress to next level (0.0 to 1.0)
function getProgressToNextLevel(xp, currentLevel) {
    if (currentLevel >= 100) return 1.0;
    const currentLevelXp = getXpForLevel(currentLevel);
    const nextLevelXp = getXpForLevel(currentLevel + 1);
    return (xp - currentLevelXp) / (nextLevelXp - currentLevelXp);
}

module.exports = {
    getXpForLevel,
    getLevelFromXp,
    getRankTitle,
    getUnlockForLevel,
    getIndividualReward,
    getProgressToNextLevel
};
