// ELEXAMON - EVOLUTIONARY LEVELING SYSTEM (1-100)
// "The path to 100 is the path to godhood."

// Exponential curve for Elexamon (finer granularity for long-term growth)
const BASE_XP = 50;
const POWER = 2.2; // Slightly gentler than humans to allow for higher level peaks

/**
 * Calculate XP required for Elexamon Level N
 */
function getXpForLevel(level) {
    if (level <= 1) return 0;
    return Math.floor(BASE_XP * Math.pow(level - 1, POWER));
}

/**
 * Calculate Elexamon Level from XP (Cap 100)
 */
function getLevelFromXp(xp) {
    // For high levels, we use binary search or approximation to avoid O(N) loops
    if (xp <= 0) return 1;

    // Quick approximation for start point
    let level = Math.floor(Math.pow(xp / BASE_XP, 1 / POWER)) + 1;

    // Fine-tune
    while (getXpForLevel(level + 1) <= xp && level < 100) {
        level++;
    }
    // Correct if overshot
    while (getXpForLevel(level) > xp && level > 1) {
        level--;
    }

    return Math.min(100, level);
}

/**
 * Get Evolutionary Tier based on Level
 */
function getEvolutionTier(level) {
    if (level >= 100) return 'ASCENDED';
    if (level >= 80) return 'ELDER';
    if (level >= 50) return 'STALWART';
    if (level >= 25) return 'FLEDGLING';
    return 'HATCHLING';
}

/**
 * Calculate progress to next level (0.0 to 1.0)
 */
function getProgressToNextLevel(xp, currentLevel) {
    if (currentLevel >= 100) return 1.0;
    const currentLevelXp = getXpForLevel(currentLevel);
    const nextLevelXp = getXpForLevel(currentLevel + 1);
    const diff = nextLevelXp - currentLevelXp;
    if (diff <= 0) return 1.0;
    return (xp - currentLevelXp) / diff;
}

module.exports = {
    getXpForLevel,
    getLevelFromXp,
    getEvolutionTier,
    getProgressToNextLevel
};
