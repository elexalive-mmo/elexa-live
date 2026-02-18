/**
 * Elexa Live Loot System
 * 5 Tier Rarity Table & Generational Odds
 */

const LOOT_TIERS = {
    COMMON: {
        id: 'common',
        weight: 7000,
        color: '#94a3b8',
        label: 'Common',
        sellValue: 0.001,
        buff: { hp: 5 }
    },
    UNCOMMON: {
        id: 'uncommon',
        weight: 2000,
        color: '#22c55e',
        label: 'Uncommon',
        sellValue: 0.005,
        buff: { spd: 2 }
    },
    RARE: {
        id: 'rare',
        weight: 800,
        color: '#3b82f6',
        label: 'Rare',
        sellValue: 0.02,
        buff: { atk: 5 }
    },
    EPIC: {
        id: 'epic',
        weight: 150,
        color: '#a855f7',
        label: 'Epic',
        sellValue: 0.1,
        buff: { expMulti: 1.2 }
    },
    LEGENDARY: {
        id: 'legendary',
        weight: 50,
        color: '#f59e0b',
        label: 'Legendary',
        sellValue: 1.0,
        buff: { globalShinyOdds: 1.1 }
    }
};

const ITEMS = {
    'ember_shard': { name: 'Ember Shard', tier: 'COMMON', icon: '🔥', desc: 'A warm fragment of the original peaks.' },
    'flame_vial': { name: 'Flame Vial', tier: 'UNCOMMON', icon: '🧪', desc: 'Unstable liquid heat.' },
    'infernarch_mantle': { name: 'Infernarch Mantle', tier: 'RARE', icon: '🧥', desc: 'Woven from the fur of elder fire drakes.' },
    'solarius_orb': { name: 'Solarius Orb', tier: 'EPIC', icon: '🔮', desc: 'Pulsing with the energy of a thousand sunsets.' },
    'eternal_flame_crown': { name: 'Eternal Flame Crown', tier: 'LEGENDARY', icon: '👑', desc: 'The crown of the first fire king.' }
};

class LootSystem {
    constructor() {
        this.totalWeight = Object.values(LOOT_TIERS).reduce((acc, t) => acc + t.weight, 0);
        this.bondingCurveMC = 12000;
        this.armorUnlocked = false;
        this.worldBonusActive = false;
    }

    updateMarketState(marketCap, isATH) {
        this.bondingCurveMC = marketCap;
        if (this.bondingCurveMC >= 80000 && !this.armorUnlocked) {
            this.armorUnlocked = true;
            return "🛡️ **GEN 1 ARMOR FORGE ACTIVE!** The Bonding Curve has breached 80k!";
        }
        this.worldBonusActive = isATH;
        return null;
    }

    rollTier() {
        let roll = Math.floor(Math.random() * this.totalWeight);
        for (const tier of Object.values(LOOT_TIERS)) {
            if (roll < tier.weight) return tier;
            roll -= tier.weight;
        }
        return LOOT_TIERS.COMMON;
    }

    generateDrop(level = 1) {
        const tier = this.rollTier();
        const tierItems = Object.entries(ITEMS).filter(([_, item]) => item.tier === tier.id.toUpperCase());
        if (tierItems.length === 0) return this.fallbackDrop();

        const [id, item] = tierItems[Math.floor(Math.random() * tierItems.length)];

        return {
            id,
            ...item,
            rarity: tier.label,
            color: tier.color,
            bound: false,
            timestamp: Date.now()
        };
    }

    generateLootBox(level, bonusMultiplier = 1.0) {
        const isLucky = Math.random() < (0.1 * bonusMultiplier);
        return {
            id: `box_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            name: isLucky ? '✨ Rare Supply Crate' : '📦 Standard Supply Crate',
            type: 'consumable',
            effect: 'open_loot',
            contentsTier: isLucky ? 'RARE' : 'COMMON',
            rarity: isLucky ? 'rare' : 'common'
        };
    }

    openLootBox(boxItem) {
        const drop = this.generateDrop();
        const quantity = this.worldBonusActive ? 3 : 1;

        return {
            item: drop,
            quantity: quantity,
            message: `You opened ${boxItem.name} and found: ${drop.name} (x${quantity})!`
        };
    }

    fallbackDrop() {
        return { id: 'ember_shard', name: 'Ember Shard', tier: 'COMMON', rarity: 'Common', color: '#94a3b8' };
    }
}

module.exports = { LootSystem, lootEngine: new LootSystem(), LOOT_TIERS, ITEMS };
