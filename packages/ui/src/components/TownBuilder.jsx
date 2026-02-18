import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
// TOWN BUILDER — Construct Your Corner of Radiant City
// "Every building is a testament to conviction"
// ═══════════════════════════════════════════════════════════════

// Building definitions with lore
const BUILDINGS = {
    cozy_tent: {
        name: 'Cozy Tent',
        emoji: '⛺',
        tier: 1,
        cost: 0,
        description: 'A humble beginning. Every empire started with a single step.',
        effect: 'Unlocks town building. +1 Elexamon slot.',
        lore: 'The first shelter in the wilderness. It remembers the cold nights before conviction set in.'
    },
    soulDust_well: {
        name: 'Soul Dust Well',
        emoji: '🪨',
        tier: 1,
        cost: 50,
        description: 'Draws Soul Dust from the earth passively.',
        effect: '+5 Soul Dust per hour',
        lore: 'They say the well taps into crystallized hope from fallen traders. The deeper you dig, the purer the dust.'
    },
    elexamon_nest: {
        name: 'Elexamon Nest',
        emoji: '🪹',
        tier: 1,
        cost: 100,
        description: 'A cozy home for your creatures.',
        effect: '+2 Elexamon villager slots',
        lore: 'The Elexamon gather here at dusk. If you listen closely, you can hear them humming rally songs.'
    },
    trading_post: {
        name: 'Trading Post',
        emoji: '🏪',
        tier: 2,
        cost: 250,
        description: 'Barter goods with travelers and allies.',
        effect: 'Unlocks item trading. +10% sell value.',
        lore: 'Merchants from all corners of the Elexaverse pass through. Their gossip is as valuable as their wares.'
    },
    watchtower: {
        name: 'Watchtower',
        emoji: '🗼',
        tier: 2,
        cost: 300,
        description: 'Eyes on the horizon. Know what comes.',
        effect: '+1 tile vision. Early warning on raids.',
        lore: 'The tower keeper has seen every crash and every rally. Her logs are prophecy in hindsight.'
    },
    tavern: {
        name: 'Traveler\'s Tavern',
        emoji: '🍺',
        tier: 2,
        cost: 400,
        description: 'Where legends are shared and alliances forged.',
        effect: '+15% Party HP regen. Guild recruitment.',
        lore: 'The ale is brewed from fermented hope. One drink and you\'ll believe anything is possible.'
    },
    shrine_of_hodl: {
        name: 'Shrine of HODL',
        emoji: '⛩️',
        tier: 3,
        cost: 750,
        description: 'A sacred place of unwavering conviction.',
        effect: '+25% XP gain. Passive meditation.',
        lore: 'Carved from a single block of crystallized resolve. Pilgrims kneel here during every dip.'
    },
    arcane_library: {
        name: 'Arcane Library',
        emoji: '📚',
        tier: 3,
        cost: 1000,
        description: 'Knowledge is the ultimate alpha.',
        effect: 'Unlock quests. Research bonuses.',
        lore: 'Every chart pattern, every historical cycle, preserved in scrolls. The librarian speaks only in riddles.'
    },
    radiant_spire: {
        name: 'Radiant Spire',
        emoji: '🏛️',
        tier: 4,
        cost: 5000,
        description: 'The crown jewel of your town. You made it.',
        effect: 'Prestige status. 2x all passive bonuses.',
        lore: 'This tower pierces the veil between worlds. From its balcony, you can see where the next cycle begins.'
    }
};

// Happiness moods based on town state
const HAPPINESS_LEVELS = {
    0: { label: 'Desolate', icon: '💀', color: 'text-gray-500' },
    20: { label: 'Struggling', icon: '😟', color: 'text-red-400' },
    40: { label: 'Stable', icon: '😐', color: 'text-yellow-400' },
    60: { label: 'Content', icon: '😊', color: 'text-green-400' },
    80: { label: 'Thriving', icon: '😄', color: 'text-blue-400' },
    100: { label: 'Radiant', icon: '🌟', color: 'text-purple-400' }
};

const TownBuilder = ({
    buildings = [],
    soulDust = 0,
    happiness = 50,
    elexamonInTown = [],
    onBuild,
    onUpgrade
}) => {
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [buildMode, setBuildMode] = useState(false);

    // Get happiness level
    const getHappinessLevel = () => {
        const levels = Object.keys(HAPPINESS_LEVELS).map(Number).sort((a, b) => b - a);
        for (const level of levels) {
            if (happiness >= level) return HAPPINESS_LEVELS[level];
        }
        return HAPPINESS_LEVELS[0];
    };

    const happinessLevel = getHappinessLevel();

    // Available buildings to construct
    const availableBuildings = Object.entries(BUILDINGS).filter(
        ([id]) => !buildings.find(b => b.id === id)
    );

    // Celebrate new buildings
    const [showCelebration, setShowCelebration] = useState(null);
    useEffect(() => {
        if (buildings.length > 0) {
            // Assume the last building added is the new one
            const newBuilding = buildings[buildings.length - 1];
            setShowCelebration(newBuilding.id);
            setTimeout(() => setShowCelebration(null), 3000);
        }
    }, [buildings.length]);

    // Calculate town value
    const townValue = buildings.reduce((sum, b) => sum + (BUILDINGS[b.id]?.cost || 0), 0);

    return (
        <div
            className="w-full h-full relative overflow-hidden bg-cover bg-center rounded-2xl border border-purple-500/30 shadow-2xl"
            style={{ backgroundImage: 'url(/assets/backgrounds/town-bg.jpg)' }}
        >
            {/* Dark Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 pointer-events-none" />

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">

                <AnimatePresence>
                    {showCelebration && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1.5 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 bg-black/60 backdrop-blur-sm"
                        >
                            <div className="text-center">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ repeat: 5, duration: 0.2 }}
                                    className="text-6xl mb-2"
                                >
                                    🏗️
                                </motion.div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                                    Construction Complete!
                                </h2>
                                <p className="text-purple-300 font-mono text-sm">
                                    {BUILDINGS[showCelebration]?.name || 'New Structure'}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header HUD */}
                <div className="flex items-center justify-between mb-8">
                    <div className="bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2 drop-shadow-md">
                            🏘️ YOUR VILLAGE
                        </h2>
                        <p className="text-purple-200/80 text-xs mt-1 italic">
                            "Build not for today, but for epochs to come"
                        </p>
                    </div>

                    <div className="flex gap-4">
                        {/* Resource Pills */}
                        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-purple-500/30 flex items-center gap-2">
                            <span className="text-purple-300 font-mono text-sm font-bold">
                                ✨ {soulDust.toLocaleString()} Soul Dust
                            </span>
                        </div>
                        <div className={`bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 ${happinessLevel.color}`}>
                            {happinessLevel.icon} <span className="font-bold text-sm">{happinessLevel.label}</span>
                        </div>
                    </div>
                </div>

                {/* Main Stats Grid - Floating */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 text-center border border-white/5 hover:border-purple-500/30 transition-colors">
                        <span className="block text-3xl font-bold text-white mb-1">{buildings.length}</span>
                        <span className="text-xs text-white/60 uppercase tracking-widest">Buildings</span>
                    </div>
                    <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 text-center border border-white/5 hover:border-purple-500/30 transition-colors">
                        <span className="block text-3xl font-bold text-white mb-1">{elexamonInTown.length}</span>
                        <span className="text-xs text-white/60 uppercase tracking-widest">Villagers</span>
                    </div>
                    <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 text-center border border-white/5 hover:border-purple-500/30 transition-colors">
                        <span className="block text-3xl font-bold text-purple-300 mb-1">{townValue.toLocaleString()}</span>
                        <span className="text-xs text-white/60 uppercase tracking-widest">Town Value</span>
                    </div>
                </div>

                {/* Happiness Bar */}
                <div className="mb-8 p-4 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm font-semibold flex items-center gap-2">
                            🎭 Village Happiness
                        </span>
                        <span className={`text-sm font-mono font-bold ${happinessLevel.color}`}>{happiness}%</span>
                    </div>
                    <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                            className={`h-full ${happiness > 80 ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500' :
                                happiness > 60 ? 'bg-green-500' :
                                    happiness > 40 ? 'bg-yellow-500' :
                                        'bg-red-500'
                                }`}
                            animate={{ width: `${happiness}%` }}
                            transition={{ type: 'spring', damping: 20 }}
                        />
                    </div>
                    <p className="text-[11px] text-white/50 mt-2 italic">
                        {happiness >= 80 ? 'The villagers sing songs of your wisdom!' :
                            happiness >= 60 ? 'A peaceful village with hopeful residents.' :
                                happiness >= 40 ? 'Basic needs met, but morale could improve.' :
                                    'Unrest brewing. Build more amenities!'}
                    </p>
                </div>

                {/* Constructed Buildings - Grid Overlay */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold text-md drop-shadow-md border-l-4 border-purple-500 pl-3">
                            🏗️ Constructed
                        </h3>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setBuildMode(!buildMode)}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-lg backdrop-blur-md border ${buildMode
                                ? 'bg-red-500/20 text-red-300 border-red-500/50 hover:bg-red-500/30'
                                : 'bg-purple-600 text-white border-purple-500 hover:bg-purple-500'
                                }`}
                        >
                            {buildMode ? '✕ Cancel Construction' : '+ Build Structure'}
                        </motion.button>
                    </div>

                    {buildings.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {buildings.map((building) => {
                                const data = BUILDINGS[building.id];
                                if (!data) return null;
                                return (
                                    <motion.div
                                        key={building.id}
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        onClick={() => setSelectedBuilding(building.id)}
                                        className="p-4 bg-black/60 backdrop-blur-md rounded-xl cursor-pointer border border-white/10 hover:border-purple-500 hover:bg-black/70 transition-all group shadow-lg"
                                    >
                                        <div className="text-4xl text-center mb-2 group-hover:scale-110 transition-transform duration-300">{data.emoji}</div>
                                        <p className="text-white text-xs font-bold text-center truncate group-hover:text-purple-300 transition-colors">{data.name}</p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-black/40 backdrop-blur-sm rounded-xl border border-white/5 border-dashed">
                            <span className="text-5xl mb-4 block opacity-50">⛺</span>
                            <p className="text-white/70 text-lg font-medium">No buildings yet</p>
                            <p className="text-white/40 text-sm mt-1">Tap "+ Build Structure" to lay your first foundation</p>
                        </div>
                    )}
                </div>

                {/* Build Mode Drawer */}
                <AnimatePresence>
                    {buildMode && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="fixed inset-x-4 bottom-4 top-1/3 bg-gray-900/95 backdrop-blur-xl rounded-t-2xl border-t border-purple-500/50 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] flex flex-col z-40"
                        >
                            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                                <h4 className="text-white font-bold text-lg flex items-center gap-2">
                                    📋 Blueprints <span className="text-xs font-normal text-white/50 bg-white/10 px-2 py-0.5 rounded-full">{availableBuildings.length} available</span>
                                </h4>
                                <button onClick={() => setBuildMode(false)} className="text-white/50 hover:text-white">✕</button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {availableBuildings.map(([id, building]) => {
                                    const canAfford = soulDust >= building.cost;
                                    return (
                                        <motion.div
                                            key={id}
                                            whileHover={{ scale: 1.01 }}
                                            onClick={() => canAfford && onBuild?.(id)}
                                            className={`
                                                relative p-4 rounded-xl flex items-center gap-4 transition-all border
                                                ${canAfford
                                                    ? 'bg-gradient-to-r from-gray-800 to-gray-800/50 border-white/10 cursor-pointer hover:border-purple-500 hover:shadow-lg hover:from-gray-800 hover:to-purple-900/20'
                                                    : 'bg-black/40 border-transparent opacity-50 cursor-not-allowed grayscale'}
                                            `}
                                        >
                                            <div className="w-12 h-12 bg-black/30 rounded-lg flex items-center justify-center text-3xl shadow-inner border border-white/5">
                                                {building.emoji}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-white font-bold">{building.name}</span>
                                                    <span className="text-[10px] text-white/40 bg-white/10 px-1.5 rounded uppercase tracking-wider">Tier {building.tier}</span>
                                                </div>
                                                <p className="text-xs text-white/60 mb-1">{building.description}</p>
                                                <p className="text-xs text-green-300 font-medium flex items-center gap-1">
                                                    ✨ {building.effect}
                                                </p>
                                            </div>

                                            <div className="text-right min-w-[80px]">
                                                <span className={`text-md font-mono font-bold block ${canAfford ? 'text-purple-300' : 'text-red-400'}`}>
                                                    {building.cost}
                                                </span>
                                                <span className="text-[10px] text-white/30 uppercase">Soul Dust</span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Detail Modal */}
                <AnimatePresence>
                    {selectedBuilding && BUILDINGS[selectedBuilding] && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 p-6 backdrop-blur-sm"
                            onClick={() => setSelectedBuilding(null)}
                        >
                            <motion.div
                                className="bg-gray-900 border border-purple-500/50 rounded-2xl w-full max-w-md p-6 relative shadow-2xl"
                                onClick={e => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => setSelectedBuilding(null)}
                                    className="absolute top-4 right-4 text-white/50 hover:text-white"
                                >
                                    ✕
                                </button>

                                <div className="flex flex-col items-center text-center mb-6">
                                    <div className="w-24 h-24 bg-gradient-to-br from-purple-900/30 to-black rounded-full flex items-center justify-center text-6xl mb-4 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                                        {BUILDINGS[selectedBuilding].emoji}
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">{BUILDINGS[selectedBuilding].name}</h2>
                                    <div className="flex gap-2 mt-2">
                                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">Tier {BUILDINGS[selectedBuilding].tier}</span>
                                    </div>
                                </div>

                                <div className="space-y-4 bg-black/30 p-4 rounded-xl border border-white/5">
                                    <div>
                                        <h4 className="text-white/50 text-xs uppercase tracking-wider mb-1">Effect</h4>
                                        <p className="text-green-300 text-sm font-medium">{BUILDINGS[selectedBuilding].effect}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-white/50 text-xs uppercase tracking-wider mb-1">Lore</h4>
                                        <p className="text-white/70 text-sm italic leading-relaxed">"{BUILDINGS[selectedBuilding].lore}"</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <button className="bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm border border-white/10 transition-colors">
                                            Upgrade (Locked)
                                        </button>
                                        <button className="bg-red-500/20 hover:bg-red-500/30 text-red-300 py-2 rounded-lg text-sm border border-red-500/30 transition-colors">
                                            Demolish
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Quote */}
                {!buildMode && (
                    <div className="mt-8 text-center pb-4">
                        <p className="text-white/30 text-xs font-serif italic">
                            💜 "A town is not built of stone, but of conviction compounded daily." — Prime
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TownBuilder;
