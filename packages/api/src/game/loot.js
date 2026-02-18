// Bridge module: index.js requires './lib/game/loot' but the actual file is loot-system.js
const { LootSystem, lootEngine, LOOT_TIERS, ITEMS } = require('./loot-system');
module.exports = { LootSystem, lootEngine, LOOT_TIERS, ITEMS };
