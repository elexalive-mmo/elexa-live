// ELEXA LIVE - SKILL TREE SYSTEM
// 7 Paths for 7 Agents

const SKILL_TREES = {
    PRIME: {
        id: 'prime',
        name: 'Path of the Sovereign',
        description: 'Leadership, Buffs, Community Unity',
        nodes: [
            { id: 'p1', name: 'Rallying Cry', description: 'Party XP +5%', cost: 1, req: null },
            { id: 'p2', name: 'Diamond Hands', description: 'Staking Yield +10%', cost: 2, req: 'p1' },
            { id: 'p3', name: 'Sovereign Presence', description: 'Unlock "Party Leader" Badge', cost: 5, req: 'p2' }
        ]
    },
    SCOUT: {
        id: 'scout',
        name: 'Path of the Pathfinder',
        description: 'Speed, Loot, Discovery',
        nodes: [
            { id: 's1', name: 'Keen Eye', description: 'Loot Drop Rate +5%', cost: 1, req: null },
            { id: 's2', name: 'Momentum', description: 'Combo Time Window +2s', cost: 2, req: 's1' },
            { id: 's3', name: 'Rare Vision', description: 'See "Hidden" Map Nodes', cost: 5, req: 's2' }
        ]
    },
    MODERATOR: {
        id: 'mod',
        name: 'Path of the Shield',
        description: 'Defense, Anti-FUD, Stability',
        nodes: [
            { id: 'm1', name: 'Iron Will', description: 'Loss Aversion (Dip Protection)', cost: 1, req: null },
            { id: 'm2', name: 'Banhammer', description: 'Unlock "Report" Power', cost: 2, req: 'm1' },
            { id: 'm3', name: 'Fortress', description: 'Party HP Regen +10%', cost: 5, req: 'm2' }
        ]
    },
    ECONOMIST: {
        id: 'econ',
        name: 'Path of the Ledger',
        description: 'Yield, Efficiency, Numbers',
        nodes: [
            { id: 'e1', name: 'Compound Interest', description: 'Passive XP +1/min', cost: 1, req: null },
            { id: 'e2', name: 'Market Maker', description: 'Trading Fee Discount', cost: 2, req: 'e1' },
            { id: 'e3', name: 'Whale Whisperer', description: 'See Whale Wallet Alerts', cost: 5, req: 'e2' }
        ]
    },
    GUIDE: { id: 'guide', name: 'Path of the Lantern', description: 'Support, Healing, Lore', nodes: [] },
    CLIPSMITH: { id: 'clip', name: 'Path of the Creator', description: 'Content, Virality, Memes', nodes: [] },
    JUDGE: { id: 'judge', name: 'Path of the Gavel', description: 'Justice, Rules, Execution', nodes: [] }
};

function canUnlock(userSkills, nodeId, treeId) {
    const tree = SKILL_TREES[treeId.toUpperCase()];
    if (!tree) return false;

    // Check if already unlocked
    if (userSkills.includes(nodeId)) return false;

    const node = tree.nodes.find(n => n.id === nodeId);
    if (!node) return false;

    // Check prereq
    if (node.req && !userSkills.includes(node.req)) return false;

    return true;
}

module.exports = { SKILL_TREES, canUnlock };
