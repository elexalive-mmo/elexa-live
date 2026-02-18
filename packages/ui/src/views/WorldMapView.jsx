import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Swords, Lock, Footprints, Sparkles } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// THE LANDS OF ELEXA LIVE — 8-Node Star Map v2.0
// Tile-aware: markers correspond to tile ranges.
// XP progression unlocks travel through regions.
// ═══════════════════════════════════════════════════════════════

const REGIONS = [
    {
        id: 'sylvan_glades',
        name: 'Sylvan Glades',
        element: 'Earth',
        tier: 1,
        color: '#22c55e',
        startTile: 1, endTile: 20,
        mapX: 12, mapY: 50,
        lore: 'Ancient woodlands thick with luminescent moss. Sentient trees whisper to those who listen.',
        boss: 'Elder Treant',
        bossHP: 400,
        ambiance: 'Whispers of the forest carry on the breeze. Every leaf feels like a record of the past.',
    },
    {
        id: 'ash_ridge',
        name: 'Ash Ridge',
        element: 'Fire',
        tier: 1,
        color: '#f97316',
        startTile: 21, endTile: 40,
        mapX: 88, mapY: 50,
        lore: 'Volcanic ridgelines glow orange beneath ashen skies. The Grand Forge awaits the patient.',
        boss: 'Fire Drake',
        bossHP: 300,
        ambiance: 'The scent of sulfur and hot metal. The ground hums with geothermal energy.',
    },
    {
        id: 'fog_marsh',
        name: 'Fog Marsh',
        element: 'Water',
        tier: 1,
        color: '#a3e635',
        startTile: 41, endTile: 60,
        mapX: 50, mapY: 92,
        lore: 'Sprawling wetlands wreathed in mist. Bioluminescent fungi light half-submerged paths.',
        boss: 'Ghost Crab',
        bossHP: 250,
        ambiance: 'Mist clings to your skin. The silence is broken only by the bubbling of the mire.',
    },
    {
        id: 'abyssal_coast',
        name: 'Abyssal Coast',
        element: 'Water',
        tier: 2,
        color: '#3b82f6',
        startTile: 61, endTile: 80,
        mapX: 22, mapY: 22,
        lore: 'Dark cliffs plunge into churning seas. Shipwrecks dot the coastline, hiding ancient treasures.',
        boss: 'Leviathan',
        bossHP: 700,
        ambiance: 'The spray of salt water and the rhythmic crashing of waves against iron cliffs.',
    },
    {
        id: 'skybreak_plateau',
        name: 'Skybreak Plateau',
        element: 'Air',
        tier: 2,
        color: '#60a5fa',
        startTile: 81, endTile: 100,
        mapX: 78, mapY: 22,
        lore: 'Towering mesas above the clouds. Ancient wind temples hum with resonant energy.',
        boss: 'Storm Warden',
        bossHP: 600,
        ambiance: 'The air is thin and crisp. Lightning arcs between floating stone islands.',
    },
    {
        id: 'iron_pass',
        name: 'Iron Pass',
        element: 'Metal',
        tier: 2,
        color: '#94a3b8',
        startTile: 101, endTile: 120,
        mapX: 78, mapY: 78,
        lore: 'Rusted automaton remains and ancient rail networks line this narrow mountain pass.',
        boss: 'Steel Golem',
        bossHP: 800,
        ambiance: 'The sound of metal on metal. Steam vents hiss from the mountain side.',
    },
    {
        id: 'crystal_tundra',
        name: 'Crystal Tundra',
        element: 'Ice',
        tier: 3,
        color: '#67e8f9',
        startTile: 121, endTile: 140,
        mapX: 50, mapY: 8,
        lore: 'Vast frozen expanse where crystal spires pierce an eternally overcast sky.',
        boss: 'Frost Titan',
        bossHP: 1000,
        ambiance: 'Bone-chilling cold. The very light seems to refract through the frozen air.',
    },
    {
        id: 'void_wastes',
        name: 'Void Wastes',
        element: 'Void',
        tier: 3,
        color: '#c084fc',
        startTile: 141, endTile: 160,
        mapX: 22, mapY: 78,
        lore: 'Where reality thins and the fabric of the Elexaverse buckles. Purple lightning arcs in the abyss.',
        boss: 'Void Sovereign',
        bossHP: 1200,
        ambiance: 'A low-frequency hum that vibrates in your marrow. The shadows seem to watch back.',
    },
];

export const WorldMapView = ({ currentTile = 1, onNavigate }) => {
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [hoveredRegion, setHoveredRegion] = useState(null);

    const currentRegion = REGIONS.find(r => currentTile >= r.startTile && currentTile <= r.endTile);
    const isUnlocked = (region) => currentTile >= region.startTile;
    const isCurrentRegion = (region) => currentRegion?.id === region.id;
    const tileProgress = (region) => {
        if (!isUnlocked(region)) return 0;
        const total = region.endTile - region.startTile + 1;
        const current = Math.min(currentTile - region.startTile + 1, total);
        return Math.round((current / total) * 100);
    };

    return (
        <div className="w-full h-full overflow-y-auto p-4 md:p-6">
            {/* Page Header */}
            <div className="mb-4">
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase"
                    style={{ fontVariant: 'small-caps' }}>
                    The Lands of Elexa Live
                </h1>
                <p className="text-white/40 text-xs mt-1">
                    8-Node Star Map v2.0 — Click a region to explore
                </p>
            </div>

            {/* Main Layout */}
            <div className="flex flex-col lg:flex-row gap-4">

                {/* ── LEFT: The Painted Map ── */}
                <div className="relative flex-1 min-h-[400px] lg:min-h-[500px] rounded-xl overflow-hidden border border-white/[0.08]"
                    style={{ boxShadow: '0 4px 40px rgba(0,0,0,0.6)' }}>

                    {/* Map Title Banner */}
                    <div className="absolute top-0 left-0 right-0 z-20 flex justify-center pt-2">
                        <div className="px-4 py-1.5 bg-[#1a1520]/90 border border-amber-700/40 rounded-b-lg backdrop-blur-sm">
                            <span className="text-amber-200/80 text-[10px] font-bold tracking-[0.25em] uppercase">
                                The Lands of Elexa Live
                            </span>
                        </div>
                    </div>

                    {/* Map Image */}
                    <img
                        src="/assets/maps/world_map_v2.jpg"
                        alt="The Lands of Elexa Live"
                        className="w-full h-full object-cover"
                        draggable={false}
                    />

                    {/* Region Markers — positioned over the map */}
                    {REGIONS.map((region) => {
                        const unlocked = isUnlocked(region);
                        const isCurrent = isCurrentRegion(region);
                        const isSelected = selectedRegion?.id === region.id;
                        const isHovered = hoveredRegion === region.id;

                        return (
                            <motion.button
                                key={region.id}
                                onClick={() => unlocked && setSelectedRegion(isSelected ? null : region)}
                                onMouseEnter={() => setHoveredRegion(region.id)}
                                onMouseLeave={() => setHoveredRegion(null)}
                                className="absolute z-10 group"
                                style={{
                                    left: `${region.mapX}%`,
                                    top: `${region.mapY}%`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                                whileHover={unlocked ? { scale: 1.3 } : {}}
                                whileTap={unlocked ? { scale: 0.9 } : {}}
                            >
                                {/* Outer pulse ring */}
                                {(isCurrent || isSelected) && (
                                    <motion.div
                                        className="absolute inset-0 rounded-full"
                                        style={{
                                            border: `2px solid ${region.color}`,
                                            boxShadow: `0 0 12px ${region.color}80`,
                                        }}
                                        animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                    />
                                )}

                                {/* Marker dot */}
                                <div
                                    className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${unlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-40 grayscale'
                                        }`}
                                    style={{
                                        backgroundColor: unlocked ? region.color : '#333',
                                        borderColor: isSelected ? '#fff' : unlocked ? region.color : '#555',
                                        boxShadow: unlocked
                                            ? `0 0 8px ${region.color}60, 0 0 20px ${region.color}20`
                                            : 'none',
                                    }}
                                />

                                {/* Lock icon for locked regions */}
                                {!unlocked && (
                                    <Lock size={8} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50" />
                                )}

                                {/* Hover tooltip */}
                                <AnimatePresence>
                                    {isHovered && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 4 }}
                                            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap
                                                       px-2.5 py-1 rounded-md bg-black/90 border border-white/10 text-[10px] text-white/80 font-medium
                                                       pointer-events-none z-30"
                                        >
                                            <span style={{ color: region.color }}>{region.name}</span>
                                            {!unlocked && <span className="text-red-400 ml-1">🔒</span>}
                                            {isCurrent && <span className="text-cyan-300 ml-1">📍</span>}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        );
                    })}

                    {/* Current position label */}
                    <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1.5 px-2 py-1 bg-black/70 rounded-md backdrop-blur-sm border border-white/10">
                        <Footprints size={12} className="text-purple-400" />
                        <span className="text-white/70 text-[10px] font-mono">
                            Tile {currentTile}/160 — {currentRegion?.name || 'Unknown'}
                        </span>
                    </div>
                </div>

                {/* ── RIGHT: Region Sidebar ── */}
                <div className="lg:w-80 xl:w-96 flex flex-col gap-3">

                    {/* Selected Region Detail */}
                    <AnimatePresence mode="wait">
                        {selectedRegion ? (
                            <motion.div
                                key={selectedRegion.id}
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="mmo-panel rounded-xl p-4"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedRegion.color, boxShadow: `0 0 8px ${selectedRegion.color}60` }} />
                                    <h3 className="text-white font-bold text-sm uppercase tracking-wide">{selectedRegion.name}</h3>
                                    <span className="ml-auto text-[10px] text-white/30 font-mono">Tier {selectedRegion.tier}</span>
                                </div>

                                <p className="text-white/60 text-xs leading-relaxed mb-3">{selectedRegion.lore}</p>

                                {/* Tile Progress */}
                                <div className="mb-3">
                                    <div className="flex justify-between text-[10px] text-white/40 mb-1">
                                        <span>Tiles {selectedRegion.startTile}–{selectedRegion.endTile}</span>
                                        <span>{tileProgress(selectedRegion)}% explored</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: selectedRegion.color }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${tileProgress(selectedRegion)}%` }}
                                            transition={{ duration: 0.6, ease: 'easeOut' }}
                                        />
                                    </div>
                                </div>

                                {/* Boss Info */}
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                                    <Swords size={14} className="text-red-400" />
                                    <div>
                                        <span className="text-red-300 text-xs font-semibold">{selectedRegion.boss}</span>
                                        <span className="text-white/30 text-[10px] ml-2">HP {selectedRegion.bossHP}</span>
                                    </div>
                                </div>

                                {/* Sovereign Land Preview */}
                                <div className="mt-3 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10 flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-amber-400 font-bold tracking-widest uppercase flex items-center gap-1">
                                            🏰 Sovereign Land
                                        </span>
                                        <span className="text-white/30 italic">LOCKED</span>
                                    </div>
                                    <div className="text-[9px] text-white/40 italic leading-tight">
                                        Land ownership manifests at Level 50+. Plots in this region are currently reserved for Sovereigns.
                                    </div>
                                </div>

                                {/* Travel / Tap Button */}
                                {isUnlocked(selectedRegion) && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onNavigate('tap')}
                                        className="mt-3 w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider
                                                   bg-gradient-to-r from-purple-600/80 to-cyan-600/80 text-white
                                                   hover:from-purple-500 hover:to-cyan-500 transition-all"
                                        style={{ boxShadow: '0 0 20px rgba(168,85,247,0.2)' }}
                                    >
                                        <Sparkles size={12} className="inline mr-1.5" />
                                        {isCurrentRegion(selectedRegion) ? 'Tap to Earn XP Here' : 'Travel to Region'}
                                    </motion.button>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mmo-panel rounded-xl p-4 text-center"
                            >
                                <MapPin size={20} className="mx-auto text-white/20 mb-2" />
                                <p className="text-white/30 text-xs">Select a region on the map to view details</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* All Regions List */}
                    <div className="mmo-panel rounded-xl p-4">
                        <h4 className="text-white/50 text-[10px] font-bold uppercase tracking-[0.15em] mb-3">All Regions</h4>
                        <div className="flex flex-col gap-1">
                            {REGIONS.map((region) => {
                                const unlocked = isUnlocked(region);
                                const isCurrent = isCurrentRegion(region);
                                const isSelected = selectedRegion?.id === region.id;

                                return (
                                    <motion.button
                                        key={region.id}
                                        onClick={() => setSelectedRegion(isSelected ? null : region)}
                                        whileTap={{ scale: 0.98 }}
                                        className={`
                                            flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all duration-200
                                            ${isSelected ? 'bg-white/[0.08] ring-1 ring-white/10' : 'hover:bg-white/[0.04]'}
                                            ${!unlocked ? 'opacity-40' : ''}
                                        `}
                                    >
                                        <div
                                            className="w-2 h-2 rounded-full shrink-0"
                                            style={{
                                                backgroundColor: unlocked ? region.color : '#444',
                                                boxShadow: isCurrent ? `0 0 8px ${region.color}` : 'none',
                                            }}
                                        />
                                        <span className={`text-xs font-semibold flex-1 uppercase tracking-wide ${isCurrent ? 'text-white' : unlocked ? 'text-white/70' : 'text-white/30'
                                            }`}>
                                            {region.name}
                                        </span>
                                        <span className="text-[10px] text-white/20 font-mono">
                                            {unlocked ? `Tier ${region.tier}` : '🔒'}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorldMapView;
