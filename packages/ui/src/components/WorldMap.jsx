import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
// THE ELEXAVERSE WORLD MAP — Where Legends Are Forged
// ═══════════════════════════════════════════════════════════════

// Region data with deep lore
const REGIONS = [
    {
        name: 'Trench Lowlands',
        startTile: 1, endTile: 20,
        color: '#4a7c59', icon: '🌿',
        element: 'Earth',
        lore: 'The Deep / Crash of 2026. Where legends begin.',
        mood: 'Alpha Leader 🎒: "Every diamond hand was once a trembling fist. Keep moving."',
        ambiance: 'Mist rises from stagnant pools. The air tastes of doubt and determination.'
    },
    {
        name: 'Ignis Peaks',
        startTile: 21, endTile: 40,
        color: '#ef4444', icon: '🌋',
        element: 'Fire',
        lore: 'The Recovery Surge. Rising momentum and fiery recovery.',
        mood: 'Scout 🔭: "I see mirages of gains ahead... or are they real? Push forward."',
        ambiance: 'Volcanic strongholds forged in market heat.'
    },
    {
        name: 'Azure Glades',
        startTile: 41, endTile: 60,
        color: '#3b82f6', icon: '🌲',
        element: 'Water',
        lore: 'The Bull Hunt. Hunting bull gains in lush but deceptive terrain.',
        mood: 'Economist ⚖️: "The tide flows with sentiment. Ride it, or be swept under."',
        ambiance: 'Lush mercantilist structures and commerce dens.'
    },
    {
        name: 'Crystal Spire',
        startTile: 61, endTile: 80,
        color: '#a855f7', icon: '💎',
        element: 'Air',
        lore: 'The Eternal Ride. Sustained crystalline challenges.',
        mood: 'Judge 📜: "The forest tests not your speed, but your stillness. Hold."',
        ambiance: 'Forbidden towers of Conviction and Staked Glory.'
    },
    {
        name: 'Radiant Summit',
        startTile: 81, endTile: 100,
        color: '#ffffff', icon: '🏙️',
        element: 'Light',
        lore: 'The Ascendance. BTC $1M territory. Glass towers of Radiant City.',
        mood: 'Prime 💜: "You did not just reach the City. You became worthy of it."',
        ambiance: 'The final ascent to total urbanization.'
    }
];

// Boss encounters with personality
const BOSSES = {
    15: {
        name: "Valentine's Tyrant",
        icon: '💔',
        title: 'Heartbreaker of the Trenches',
        taunt: '"Your love for gains ends here. Prepare to bleed conviction."',
        hp: 100
    },
    30: {
        name: 'Dust Serpent',
        icon: '🐍',
        title: 'Devourer of Paper Hands',
        taunt: '"I have swallowed a thousand portfolios. Yours looks... tender."',
        hp: 150
    },
    50: {
        name: 'Whale Horror',
        icon: '🐋',
        title: 'The Market Manipulator',
        taunt: '"I am the wave that crashes against your conviction. Can you swim?"',
        hp: 300
    },
    70: {
        name: 'Doubt Wraith',
        icon: '👻',
        title: 'Phantom of the FUD',
        taunt: '"I am every fear you ever suppressed. Shall we... talk?"',
        hp: 200
    },
    85: {
        name: 'Exchange Titan',
        icon: '⚡',
        title: 'Keeper of Liquidity',
        taunt: '"Your little adventure amuses me. Now face true volume."',
        hp: 500
    },
    100: {
        name: 'The Eternal Grind',
        icon: '👑',
        title: 'Final Boss — The Cycle Itself',
        taunt: '"I am the beginning. I am the end. I am... inevitable."',
        hp: 1000
    }
};

// Secrets scattered across tiles
const SECRETS = {
    7: { type: 'chest', icon: '📦', hint: 'Something glimmers beneath the mud...' },
    23: { type: 'oasis', icon: '🏝️', hint: 'A mirage? No... real respite from the heat.' },
    42: { type: 'portal', icon: '🌀', hint: 'Reality bends here. Step through?' },
    66: { type: 'shrine', icon: '⛩️', hint: 'Ancient runes glow with stored XP...' },
    88: { type: 'npc', icon: '🧙', hint: 'The Archivist awaits with forgotten knowledge.' }
};

const WorldMap = ({ currentTile = 1, partyHP = 100, activeBoss = null, onTileClick, onBossFight }) => {
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [hoveredTile, setHoveredTile] = useState(null);
    const [showBossEncounter, setShowBossEncounter] = useState(false);

    const currentRegion = REGIONS.find(r => currentTile >= r.startTile && currentTile <= r.endTile);
    const progressPercent = Math.floor((currentTile / 100) * 100);

    // Check for boss on current tile
    useEffect(() => {
        if (BOSSES[currentTile] && !activeBoss) {
            setShowBossEncounter(true);
        }
    }, [currentTile, activeBoss]);

    // Generate tile grid for selected region
    const renderTiles = (region) => {
        const tiles = [];
        for (let i = region.startTile; i <= region.endTile; i++) {
            const isCurrent = i === currentTile;
            const isUnlocked = i <= currentTile;
            const isBoss = BOSSES[i];
            const isSecret = SECRETS[i];
            const isHovered = hoveredTile === i;

            tiles.push(
                <motion.div
                    key={i}
                    onClick={() => isUnlocked && onTileClick?.(i)}
                    onMouseEnter={() => setHoveredTile(i)}
                    onMouseLeave={() => setHoveredTile(null)}
                    whileHover={isUnlocked ? { scale: 1.15, zIndex: 10 } : {}}
                    whileTap={isUnlocked ? { scale: 0.95 } : {}}
                    className={`
                        relative w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold
                        transition-all duration-300 border
                        ${isCurrent ? 'ring-2 ring-cyan-400 neon-border animate-pulse border-white' : 'border-white/5'}
                        ${isUnlocked ? 'cursor-pointer hover:border-cyan-400/50 hover:bg-white/5' : 'cursor-not-allowed'}
                        ${isBoss ? 'bg-gradient-to-br from-red-600/40 to-black hover:from-red-600' : ''}
                        ${isSecret && isUnlocked ? 'bg-gradient-to-br from-amber-500/30 to-black' : ''}
                        ${!isUnlocked ? 'bg-black/40 grayscale' : ''}
                    `}
                    style={{ opacity: isUnlocked ? 1 : 0.3 }}
                >
                    {isBoss ? (
                        <span className="text-lg">{BOSSES[i].icon}</span>
                    ) : isSecret && isUnlocked ? (
                        <span className="text-lg">{SECRETS[i].icon}</span>
                    ) : (
                        <span className={isUnlocked ? 'text-white/80' : 'text-white/30'}>{i}</span>
                    )}

                    {/* Current position marker */}
                    {isCurrent && (
                        <motion.div
                            className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        />
                    )}
                </motion.div>
            );
        }
        return tiles;
    };

    return (
        <div className="relative p-6 mmo-panel rounded-2xl overflow-hidden">
            {/* Nebula Background Effect */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500 rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase flex items-center gap-2 drop-shadow-lg">
                        <span className="text-cyan-400">[</span> THE ELEXAVERSE <span className="text-cyan-400">]</span>
                    </h2>
                    <p className="text-cyan-300/40 text-[10px] mt-1 font-bold tracking-[0.2em] uppercase">
                        "Where every tap echoes through eternity"
                    </p>
                </div>
                <div className="flex flex-col items-end gap-1 text-sm">
                    <span className="text-purple-300 font-mono">
                        📍 Tile {currentTile} / 100
                    </span>
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-black/50 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <span className="text-white/60 text-xs">{progressPercent}%</span>
                    </div>
                </div>
            </div>

            {/* Party HP Bar */}
            <div className="relative z-10 mb-6 p-3 bg-black/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-green-300 text-sm font-semibold">🛡️ PARTY CONVICTION</span>
                    <span className="text-white font-mono">{partyHP}/100</span>
                </div>
                <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full ${partyHP > 60 ? 'bg-green-500' : partyHP > 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        animate={{ width: `${partyHP}%` }}
                        transition={{ type: 'spring' }}
                    />
                </div>
                {partyHP <= 30 && (
                    <p className="text-red-400 text-xs mt-1 animate-pulse">⚠️ Conviction wavering! Hold to heal!</p>
                )}
            </div>

            {/* Current Region Banner */}
            {currentRegion && (
                <motion.div
                    key={currentRegion.name}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 mb-6 p-4 rounded-xl overflow-hidden"
                    style={{
                        background: `linear-gradient(135deg, ${currentRegion.color}50, ${currentRegion.color}20, transparent)`,
                        borderLeft: `4px solid ${currentRegion.color}`
                    }}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-3xl">{currentRegion.icon}</span>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{currentRegion.name}</h3>
                                    <span className="text-xs text-white/50">Element: {currentRegion.element}</span>
                                </div>
                            </div>
                            <p className="text-white/70 text-sm italic mt-2">"{currentRegion.lore}"</p>
                        </div>
                    </div>

                    {/* Ambient Description */}
                    <p className="text-white/40 text-xs mt-3 border-t border-white/10 pt-2">
                        {currentRegion.ambiance}
                    </p>

                    {/* Mood Quote */}
                    <motion.p
                        key={currentRegion.mood}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-purple-300 text-sm mt-3 font-medium"
                    >
                        {currentRegion.mood}
                    </motion.p>
                </motion.div>
            )}

            {/* Region Grid */}
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {REGIONS.map((region) => {
                    const isUnlocked = currentTile >= region.startTile;
                    const isActive = selectedRegion?.name === region.name;
                    const isCurrent = currentRegion?.name === region.name;

                    return (
                        <motion.div
                            key={region.name}
                            onClick={() => isUnlocked && setSelectedRegion(isActive ? null : region)}
                            whileHover={isUnlocked ? { scale: 1.02, y: -2 } : {}}
                            className={`
                                p-3 rounded-xl cursor-pointer transition-all relative overflow-hidden
                                ${isActive ? 'ring-2 ring-white shadow-lg shadow-purple-500/20' : ''}
                                ${isCurrent ? 'ring-2 ring-purple-400/50' : ''}
                                ${isUnlocked ? '' : 'opacity-40 cursor-not-allowed grayscale'}
                            `}
                            style={{
                                background: `linear-gradient(135deg, ${region.color}40, ${region.color}10)`,
                                borderLeft: `3px solid ${region.color}`
                            }}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl">{region.icon}</span>
                                <span className="text-white font-semibold text-sm">{region.name}</span>
                            </div>
                            <p className="text-white/40 text-xs">Tiles {region.startTile}–{region.endTile}</p>

                            {!isUnlocked && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <span className="text-sm text-red-300">🔒</span>
                                </div>
                            )}

                            {isCurrent && (
                                <motion.div
                                    className="absolute top-1 right-1 w-2 h-2 bg-purple-400 rounded-full"
                                    animate={{ opacity: [1, 0.3, 1] }}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                />
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Tile Detail View */}
            <AnimatePresence>
                {selectedRegion && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="relative z-10 p-4 bg-black/40 rounded-xl backdrop-blur-sm border border-white/10"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-white font-bold flex items-center gap-2">
                                {selectedRegion.icon} {selectedRegion.name}
                                <span className="text-xs text-white/40 font-normal">— Tap a tile to travel</span>
                            </h4>
                            <button
                                onClick={() => setSelectedRegion(null)}
                                className="text-white/50 hover:text-white text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-8 gap-2">
                            {renderTiles(selectedRegion)}
                        </div>

                        {/* Tile Hover Info */}
                        {hoveredTile && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-3 p-2 bg-black/50 rounded-lg text-xs"
                            >
                                {BOSSES[hoveredTile] ? (
                                    <div className="text-red-300">
                                        <span className="font-bold">{BOSSES[hoveredTile].icon} {BOSSES[hoveredTile].name}</span>
                                        <span className="block text-white/50">{BOSSES[hoveredTile].title}</span>
                                        <span className="block italic text-red-400/70 mt-1">{BOSSES[hoveredTile].taunt}</span>
                                    </div>
                                ) : SECRETS[hoveredTile] ? (
                                    <div className="text-yellow-300">
                                        <span className="font-bold">{SECRETS[hoveredTile].icon} Secret</span>
                                        <span className="block text-white/50 italic">{SECRETS[hoveredTile].hint}</span>
                                    </div>
                                ) : (
                                    <span className="text-white/50">Tile {hoveredTile} — Safe passage</span>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Boss Encounter Modal */}
            <AnimatePresence>
                {showBossEncounter && BOSSES[currentTile] && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-gradient-to-br from-red-900/90 to-black p-6 rounded-2xl border border-red-500/50 max-w-md w-full text-center"
                        >
                            <motion.span
                                className="text-6xl block mb-4"
                                animate={{ rotate: [0, -10, 10, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                {BOSSES[currentTile].icon}
                            </motion.span>
                            <h3 className="text-2xl font-bold text-red-400 mb-1">
                                ⚔️ BOSS ENCOUNTER ⚔️
                            </h3>
                            <p className="text-white text-xl font-bold mb-1">
                                {BOSSES[currentTile].name}
                            </p>
                            <p className="text-red-300/60 text-sm italic mb-4">
                                {BOSSES[currentTile].title}
                            </p>
                            <p className="text-white/80 italic mb-6 text-sm">
                                {BOSSES[currentTile].taunt}
                            </p>

                            <div className="flex gap-3 justify-center">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setShowBossEncounter(false);
                                        onBossFight?.(BOSSES[currentTile]);
                                    }}
                                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold rounded-lg"
                                >
                                    ⚔️ ENGAGE
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowBossEncounter(false)}
                                    className="px-6 py-3 bg-white/10 text-white font-bold rounded-lg"
                                >
                                    🏃 Retreat
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Legend */}
            <div className="relative z-10 mt-6 flex flex-wrap gap-4 text-xs text-white/50 border-t border-white/10 pt-4">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-400 rounded animate-pulse"></span> You Are Here</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded"></span> Boss</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded"></span> Secret</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-white/20 rounded"></span> Explored</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-black/50 rounded"></span> Locked</span>
            </div>

            {/* Prime's Whisper */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="relative z-10 text-center text-purple-300/40 text-xs italic mt-4"
            >
                💜 "The map is not the territory. The territory is your conviction." — Prime
            </motion.p>
        </div>
    );
};

export default WorldMap;
