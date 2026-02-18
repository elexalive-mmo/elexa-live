import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
// ELEXAMON — The Creatures of Conviction
// "Born from market energy, shaped by diamond hands"
// ═══════════════════════════════════════════════════════════════

// Element styling with lore
const ELEMENTS = {
    Earth: {
        color: '#22c55e',
        gradient: 'from-green-500 to-emerald-600',
        description: 'Born from stable accumulation',
        icon: '🌱'
    },
    Fire: {
        color: '#ef4444',
        gradient: 'from-red-500 to-orange-600',
        description: 'Forged in market heat',
        icon: '🔥'
    },
    Air: {
        color: '#3b82f6',
        gradient: 'from-blue-400 to-cyan-500',
        description: 'Shaped by community velocity',
        icon: '💨'
    },
    Wind: { // Map Wind to Air styling
        color: '#3b82f6',
        gradient: 'from-blue-400 to-cyan-500',
        description: 'The breath of the market',
        icon: '🌬️'
    },
    Water: {
        color: '#06b6d4',
        gradient: 'from-cyan-500 to-blue-600',
        description: 'Drawn from liquid depth',
        icon: '🌊'
    },
    Void: {
        color: '#6b7280',
        gradient: 'from-gray-600 to-slate-800',
        description: 'Emerged from the deep ledger',
        icon: '🌑'
    },
    Spirit: { // Map Spirit to Void/Purple styling
        color: '#a855f7',
        gradient: 'from-purple-600 to-indigo-900',
        description: 'The ghost in the machine',
        icon: '✨'
    },
    Crystal: {
        color: '#ec4899',
        gradient: 'from-pink-500 to-rose-600',
        description: 'Rare market manifestation',
        icon: '💎'
    }
};

// Tier styling
const TIERS = {
    Hatchling: { stars: 1, label: '★', glow: 'shadow-sm shadow-orange-500/50', border: 'border-orange-400/50' },
    Warrior: { stars: 2, label: '★★', glow: 'shadow-md shadow-red-500/60', border: 'border-red-400/60' },
    Elder: { stars: 3, label: '★★★', glow: 'shadow-lg shadow-white/60', border: 'border-white/70' },
    Ascended: { stars: 5, label: '★★★★★', glow: 'shadow-2xl shadow-yellow-400/80', border: 'border-yellow-300/80', isLegendary: true },
    Mythic: { stars: 4, label: '★★★★', glow: 'shadow-xl shadow-purple-500/70 animate-pulse', border: 'border-purple-400/50' },
    "OG Origin": { stars: 5, label: '★★★★★', glow: 'shadow-2xl shadow-yellow-500/80', border: 'border-yellow-400/80', isLegendary: true },
    "Legendary": { stars: 5, label: '★★★★★', glow: 'shadow-2xl shadow-cyan-500/80', border: 'border-cyan-400/80', isLegendary: true }
};

// Villager role icons
const ROLES = {
    Harvester: { icon: '🌾', desc: 'Collects Soul Dust passively' },
    Scout: { icon: '🔭', desc: 'Reveals secrets on the map' },
    Guardian: { icon: '🛡️', desc: 'Reduces party damage in raids' },
    Sage: { icon: '📜', desc: 'Boosts XP gain from all sources' },
    Merchant: { icon: '💰', desc: 'Unlocks special shop items' },
    Artisan: { icon: '🔨', desc: 'Speeds up town construction' }
};

const ElexamonCard = ({
    elexamon,
    size = 'medium', // 'small', 'medium', 'large'
    onClick,
    showStats = true,
    showQuote = true,
    animated = true
}) => {
    const [flipped, setFlipped] = useState(false);

    const element = ELEMENTS[elexamon.element] || ELEMENTS.Crystal;
    const tier = TIERS[elexamon.tier] || TIERS.Hatchling;
    const role = elexamon.villagerRole ? ROLES[elexamon.villagerRole] : null;

    const sizeClasses = {
        small: 'w-32 h-44',
        medium: 'w-48 h-64',
        large: 'w-64 h-80'
    };

    const handleClick = () => {
        if (onClick) {
            onClick(elexamon);
        } else {
            setFlipped(!flipped);
        }
    };

    return (
        <motion.div
            className={`relative ${sizeClasses[size]} perspective-1000 cursor-pointer`}
            onClick={handleClick}
            whileHover={animated ? { scale: 1.05, rotateY: 5 } : {}}
            whileTap={animated ? { scale: 0.98 } : {}}
        >
            <AnimatePresence mode="wait">
                {!flipped ? (
                    <motion.div
                        key="front"
                        className={`
                            absolute inset-0 rounded-2xl overflow-hidden
                            bg-gradient-to-br ${element.gradient}
                            border-2 ${tier.border || 'border-white/30'} ${tier.glow}
                            flex flex-col backdrop-blur-md bg-opacity-80
                            shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]
                        `}
                        initial={{ rotateY: 180 }}
                        animate={{ rotateY: 0 }}
                        exit={{ rotateY: -180 }}
                        transition={{ duration: 0.4 }}
                    >
                        {/* 🎞️ High-Fidelity Video Background (for Legendary/Origin) */}
                        {elexamon.video && (
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
                            >
                                <source src={elexamon.video} type="video/mp4" />
                            </video>
                        )}

                        {/* Holographic Overlay (Only for Legendary/Elite tiers) */}
                        {(tier.isLegendary || elexamon.tier === 'Mythic') && (
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/30 pointer-events-none animate-[pulse_2s_infinite] mix-blend-color-dodge" />
                        )}

                        {/* Scanline Effect */}
                        <div className="absolute inset-0 bg-[url('/assets/patterns/scanlines.png')] opacity-10 pointer-events-none mix-blend-overlay" />

                        {/* Card Header */}
                        <div className="p-2 bg-black/30 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-xs truncate">
                                    {elexamon.name}
                                </span>
                                <span className="text-[9px] text-white/50 uppercase tracking-tighter">
                                    Lv {elexamon.level || 1}
                                </span>
                            </div>
                            <span className="text-yellow-300 text-xs">{tier.label}</span>
                        </div>

                        {/* Creature Display */}
                        <div className="flex-1 flex items-center justify-center relative p-2">
                            {elexamon.image ? (
                                <motion.img
                                    src={elexamon.image}
                                    alt={elexamon.name}
                                    className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                                    animate={animated ? { scale: [1, 1.05, 1] } : {}}
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                />
                            ) : (
                                <motion.span
                                    className="text-5xl"
                                    animate={animated ? {
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0]
                                    } : {}}
                                    transition={{ repeat: Infinity, duration: 3 }}
                                >
                                    {elexamon.emoji}
                                </motion.span>
                            )}

                            {/* Element Badge */}
                            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/40 rounded-full px-2 py-0.5">
                                <span className="text-xs">{element.icon}</span>
                                <span className="text-white text-[10px] font-semibold">{elexamon.element}</span>
                            </div>
                        </div>

                        {/* Stats Bar */}
                        {showStats && (
                            <div className="p-2 bg-black/40 space-y-1">
                                <div className="flex justify-between text-[10px] text-white/70">
                                    <span>⚔️ ATK</span>
                                    <span>{elexamon.baseStats?.attack || 10}</span>
                                </div>
                                <div className="flex justify-between text-[10px] text-white/70">
                                    <span>🛡️ DEF</span>
                                    <span>{elexamon.baseStats?.defense || 10}</span>
                                </div>
                                <div className="flex justify-between text-[10px] text-white/70">
                                    <span>✨ MAG</span>
                                    <span>{elexamon.baseStats?.magic || 10}</span>
                                </div>
                            </div>
                        )}

                        {/* Villager Role */}
                        {role && (
                            <div className="p-1 bg-black/50 text-center">
                                <span className="text-[10px] text-white/80">
                                    {role.icon} {elexamon.villagerRole}
                                </span>
                            </div>
                        )}

                        {/* Tier Indicator */}
                        <div className="absolute top-2 right-2">
                            <div className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-[10px] text-white font-bold">
                                {tier.stars}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="back"
                        className={`
                            absolute inset-0 rounded-2xl overflow-hidden
                            bg-gradient-to-br from-gray-900 to-gray-800
                            border-2 border-white/20
                            p-3 flex flex-col
                        `}
                        initial={{ rotateY: -180 }}
                        animate={{ rotateY: 0 }}
                        exit={{ rotateY: 180 }}
                        transition={{ duration: 0.4 }}
                    >
                        {/* Back Header */}
                        <div className="text-center mb-2">
                            <h4 className="text-white font-bold text-sm">{elexamon.name}</h4>
                            <p className="text-xs text-white/50">{elexamon.tier} • {elexamon.element}</p>
                        </div>

                        {/* Origin Story */}
                        <div className="flex-1 overflow-y-auto">
                            <p className="text-[10px] text-white/70 italic leading-relaxed">
                                "{elexamon.lore || `A mysterious ${elexamon.element} creature from the depths of the Elexaverse.`}"
                            </p>
                        </div>

                        {/* Quote */}
                        {showQuote && elexamon.quote && (
                            <div className="mt-2 p-2 bg-purple-500/20 rounded-lg">
                                <p className="text-[10px] text-purple-300 italic text-center">
                                    "{elexamon.quote}"
                                </p>
                            </div>
                        )}

                        {/* Evolution Chain */}
                        {elexamon.evolvesTo && (
                            <div className="mt-2 text-center">
                                <span className="text-[10px] text-white/50">Evolves to:</span>
                                <span className="text-[10px] text-purple-300 ml-1">{elexamon.evolvesTo}</span>
                            </div>
                        )}

                        {/* Tap to flip hint */}
                        <p className="text-[10px] text-white/30 text-center mt-2">
                            Tap to flip
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Collection Grid Component
export const ElexamonGrid = ({ elexamons, onSelect }) => {
    return (
        <div className="p-4 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    🐾 YOUR ELEXAMON
                </h2>
                <span className="text-purple-300/60 text-sm">
                    {elexamons.length} Creatures
                </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {elexamons.map((mon) => (
                    <ElexamonCard
                        key={mon.id}
                        elexamon={mon}
                        size="small"
                        onClick={() => onSelect?.(mon)}
                    />
                ))}
            </div>

            {elexamons.length === 0 && (
                <div className="text-center py-8">
                    <span className="text-4xl mb-2 block">🥚</span>
                    <p className="text-white/50 text-sm">
                        No Elexamon yet. Explore the world to find eggs!
                    </p>
                </div>
            )}

            {/* Lore Footer */}
            <p className="text-center text-purple-300/30 text-xs italic mt-4">
                "They remember every tap you made. They grow with your conviction." — Prime
            </p>
        </div>
    );
};

// Featured Elexamon Spotlight
export const ElexamonSpotlight = ({ elexamon }) => {
    if (!elexamon) return null;

    const element = ELEMENTS[elexamon.element] || ELEMENTS.Crystal;
    const tier = TIERS[elexamon.tier] || TIERS.Hatchling;
    const role = elexamon.villagerRole ? ROLES[elexamon.villagerRole] : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
                relative p-6 rounded-2xl overflow-hidden
                bg-gradient-to-br ${element.gradient}
                border border-white/20 ${tier.glow}
            `}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black rounded-full blur-2xl" />
            </div>

            <div className="relative z-10 flex items-start gap-6">
                {/* Large Emoji */}
                {/* Large Display (Image or Emoji) */}
                <motion.div
                    className="w-32 h-32 flex items-center justify-center"
                    animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, 3, -3, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                >
                    {elexamon.image ? (
                        <img
                            src={elexamon.image}
                            alt={elexamon.name}
                            className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                        />
                    ) : (
                        <span className="text-7xl">{elexamon.emoji}</span>
                    )}
                </motion.div>

                {/* Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-2xl font-bold text-white">{elexamon.name}</h3>
                        <span className="text-[14px] font-mono text-white/50 bg-black/20 px-2 py-0.5 rounded border border-white/10 ml-2">LV {elexamon.level || 1}</span>
                        <span className="text-yellow-300 ml-auto">{tier.label}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-white/70 mb-3">
                        <span>{element.icon} {elexamon.element}</span>
                        <span>•</span>
                        <span>{elexamon.tier}</span>
                        {role && <span>• {role.icon} {elexamon.villagerRole}</span>}
                    </div>

                    <p className="text-white/80 text-sm italic mb-4">
                        "{elexamon.lore || element.description}"
                    </p>

                    {/* Stats */}
                    <div className="flex gap-6">
                        <div className="text-center">
                            <span className="block text-xl font-bold text-white">{elexamon.baseStats?.attack || 10}</span>
                            <span className="text-[10px] text-white/50">⚔️ ATK</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-xl font-bold text-white">{elexamon.baseStats?.defense || 10}</span>
                            <span className="text-[10px] text-white/50">🛡️ DEF</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-xl font-bold text-white">{elexamon.baseStats?.magic || 10}</span>
                            <span className="text-[10px] text-white/50">✨ MAG</span>
                        </div>
                    </div>

                    {/* Role Benefit */}
                    {role && (
                        <div className="mt-4 p-2 bg-black/30 rounded-lg">
                            <span className="text-xs text-white/80">
                                <span className="font-semibold">{role.icon} Village Bonus:</span> {role.desc}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Evolution */}
            {elexamon.evolvesTo && (
                <div className="relative z-10 mt-4 text-center border-t border-white/20 pt-3">
                    <span className="text-white/50 text-xs">Can evolve to: </span>
                    <span className="text-purple-200 text-xs font-semibold">{elexamon.evolvesTo}</span>
                </div>
            )}

            {/* Quote */}
            {elexamon.quote && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="relative z-10 text-center text-white/40 text-xs italic mt-3"
                >
                    "{elexamon.quote}"
                </motion.p>
            )}
        </motion.div>
    );
};

export default ElexamonCard;
