// ELEXA LIVE - QUEST SYSTEM
// Chain-based quest logic

// ELEXA LIVE - QUEST & RAID SYSTEM ARCHITECTURE
// Community Milestones vs. Individual Deeds

const INDIVIDUAL_QUESTS = {
    q_tutorial: {
        id: 'q_tutorial',
        title: 'The Awakening',
        description: 'Connect your wallet and tap the Orb for the first time.',
        xpReward: 50,
        reqLevel: 0
    },
    q_scout_1: {
        id: 'q_scout_1',
        title: 'First Steps',
        description: 'Perform 10 Taps and explore 1 Tile.',
        xpReward: 100,
        reqLevel: 2
    },
    q_art_genesis: {
        id: 'q_art_genesis',
        title: 'The Great Tapestry',
        description: 'Submit an artwork for one of the 144 Elexamon.',
        xpReward: 1000,
        reqLevel: 5
    }
};

const COMMUNITY_QUESTS = {
    cq_tapestry: {
        id: 'cq_tapestry',
        title: 'The 144 Manifestations',
        description: 'Fulfill the 144 artworks for the First Generation Elexamon NFTs.',
        goal: 144,
        unit: 'Artworks',
        reward: 'GEN 1 Whitelist + Role',
        trackingKey: 'totalArtworks'
    },
    cq_land_sale: {
        id: 'cq_land_sale',
        title: 'Highlands Expansion',
        description: 'Sell the first 8 Land Tiles for development.',
        goal: 8,
        unit: 'SOL',
        reward: 'Expansion Unlocked',
        trackingKey: 'totalLandSold'
    },
    cq_gen1_sellout: {
        id: 'cq_gen1_sellout',
        title: 'First Generation Sellout',
        description: 'Cleanse the ledger by selling out the first generation NFTs.',
        goal: 1000, // Example goal
        unit: 'Mints',
        price: '0.03 SOL',
        trackingKey: 'gen1Mints'
    }
};

function checkQuestCompletion(user, questId, context) {
    const quest = INDIVIDUAL_QUESTS[questId];
    if (!quest) return false;

    const stats = user.stats || {};

    if (questId === 'q_tutorial' && context.action === 'tap') return true;
    if (questId === 'q_scout_1' && stats.taps >= 10 && stats.tilesExplored >= 1) return true;
    if (questId === 'q_art_genesis' && stats.artSubmissions >= 1) return true;

    return false;
}

module.exports = { INDIVIDUAL_QUESTS, COMMUNITY_QUESTS, checkQuestCompletion };
