import React, { useState, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, User, Star, Trophy, Map as MapIcon, X } from 'lucide-react';
import { ElexaContext } from '../App';
import { NeuralCommandCenter } from '../components/HUD/NeuralCommandCenter'; // The Arcane Focus
import { FactionHUD } from '../components/HUD/FactionHUD'; // The Guild Board

// Logic Synced with Backend (leveling.js)
const getExpForLevel = (level) => level <= 1 ? 0 : Math.floor(100 * Math.pow(level - 1, 2.5));

export const TileView = ({ citizenAddress, activeBoss }) => {
    const { userStats, handleAction } = useContext(ElexaContext);
    const [isTapping, setIsTapping] = useState(false);
    const [showFactions, setShowFactions] = useState(false);
    const [isRestingState, setIsRestingState] = useState(false); // Local UI state for instant feedback

    // Sync with backend state if available
    const isResting = isRestingState || (userStats?.restActive || false);

    const toggleRest = () => {
        const newState = !isResting;
        setIsRestingState(newState);
        handleAction('rest', 0, { active: newState });
    };

    // Derive Leveling Progress
    const level = userStats?.level || 1;
    const totalExp = userStats?.totalExp || 0;

    const handleTap = () => {
        setIsTapping(true);

        // Client-Side Prediction for Snappy UI
        // EXP is fixed at 15 for taps
        // Damage is 1 + Floor(Level / 10)
        const predictedDamage = 1 + Math.floor(level / 10);

        // Trigger backend action - 15 EXP defined in EXP_SOURCES.tap
        handleAction('tap', 0, { tile: 1 }).then(res => {
            // Optional: Validate server response here if needed
        });

        setTimeout(() => setIsTapping(false), 150);
    };

    // Dynamic Backgrounds based on Level
    const environments = [
        { level: 1, img: '/assets/backgrounds/road.png', name: 'Trench Lowlands', region: 'Lowlands' },
        { level: 10, img: '/assets/backgrounds/forest.png', name: 'Sylvan Glades', region: 'The Deep' },
        { level: 20, img: '/assets/backgrounds/beach.png', name: 'Sunlit Cove', region: 'The Shores' },
        { level: 30, img: '/assets/backgrounds/tavern.png', video: '/assets/videos/tavernanimation.mp4', name: 'Centurion District', region: 'Radiant City' },
    ];

    const currentEnv = [...environments].reverse().find(e => level >= e.level) || environments[0];

    return (
        <div className="fixed inset-0 bg-[#050510] text-white font-serif overflow-hidden select-none">
            {/* Environment Background */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentEnv.img}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2 }}
                    className="absolute inset-0"
                >
                    {currentEnv.video ? (
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        >
                            <source src={currentEnv.video} type="video/mp4" />
                        </video>
                    ) : (
                        <img
                            src={currentEnv.img}
                            alt={currentEnv.name}
                            className="w-full h-full object-cover"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none" />
                </motion.div>
            </AnimatePresence>

            {/* HUD - Top Status */}
            <div className="relative z-10 p-4 pt-10 flex justify-between items-start pointer-events-none">
                {/* Logo Section */}
                <div className="flex flex-col items-start gap-4 pointer-events-auto">
                    <motion.img
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        src="/assets/branding/elexa_live_logo_raw.png"
                        alt="ELEXA LIVE"
                        className="w-32 h-auto object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => window.location.hash = 'lobby'} // Route to lobby
                    />

                    <div className="glass-stone p-4 rounded-[2rem] shadow-2xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-1.5 bg-[#fbbf24]/10 rounded-xl border border-[#fbbf24]/30">
                                <Shield className="w-4 h-4 text-[#fbbf24]" />
                            </div>
                            <div>
                                <span className="text-[9px] uppercase tracking-[0.3em] text-white/30 block leading-none mb-1">{currentEnv.region}</span>
                                <span className="text-sm font-fantasy tracking-widest uppercase text-[#fefce8] drop-shadow-md">{currentEnv.name}</span>
                            </div>
                        </div>
                        {/* Discovery Progress */}
                        <div className="flex gap-1 mt-2">
                            {environments.map((e, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1 flex-1 rounded-full ${level >= e.level ? 'bg-[#fbbf24] shadow-[0_0_5px_orange]' : 'bg-white/10'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Stats & Faction Toggle */}
                <div className="flex flex-col gap-3 items-end pointer-events-auto">
                    <div className="glass-stone p-4 rounded-3xl shadow-2xl text-right">
                        <div className="flex items-center gap-3 justify-end mb-1">
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 block leading-none mb-1">Citizen Grade</span>
                                <span className="text-xl font-black text-[#fbbf24]">{level}</span>
                            </div>
                            <div className="p-2 bg-[#fbbf24]/10 rounded-xl border border-[#fbbf24]/30">
                                <Trophy className="w-5 h-5 text-[#fbbf24] drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                            </div>
                        </div>
                        <p className="text-[9px] text-[#fbbf24]/60 font-mono tracking-tighter">
                            {totalExp.toLocaleString()} / {getExpForLevel(level + 1).toLocaleString()} $EXP
                        </p>
                    </div>

                    {/* Faction Toggle Button */}
                    <button
                        onClick={() => setShowFactions(!showFactions)}
                        className="p-3 glass-stone rounded-full hover:bg-[#fbbf24]/10 transition-colors border border-[#fbbf24]/30 group"
                    >
                        {showFactions ? (
                            <X className="w-5 h-5 text-[#fbbf24]" />
                        ) : (
                            <MapIcon className="w-5 h-5 text-[#fbbf24] group-hover:scale-110 transition-transform" />
                        )}
                    </button>

                    {/* Faction HUD Overlay */}
                    <AnimatePresence>
                        {showFactions && (
                            <motion.div
                                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                                className="w-64 max-h-[60vh] overflow-y-auto custom-scrollbar"
                            >
                                <FactionHUD />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* RAID BOSS HUD */}
            <AnimatePresence>
                {activeBoss && activeBoss.hp > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-72"
                    >
                        <div className="glass-stone px-4 py-3 rounded-xl border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)] backdrop-blur-md">
                            <div className="flex justify-between items-center text-xs text-red-100 mb-2 font-fantasy tracking-widest uppercase">
                                <span className="flex items-center gap-2 drop-shadow-md font-bold">
                                    <span className="text-xl animate-pulse">👹</span> {activeBoss.name || 'World Boss'}
                                </span>
                                <span className="font-mono text-red-300 font-bold">{Math.ceil(activeBoss.hp).toLocaleString()} HP</span>
                            </div>
                            <div className="h-2 bg-black/80 rounded-full overflow-hidden border border-white/10 relative shadow-inner">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-red-600 via-red-500 to-orange-500 box-shadow-[0_0_10px_orange]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (activeBoss.hp / activeBoss.maxHp) * 100)}%` }}
                                    transition={{ type: "spring", stiffness: 50, damping: 10 }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* DA:O STYLE PARTY SIDEBAR (Left) */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 space-y-3 flex flex-col items-center">
                <div className="text-[8px] uppercase tracking-[0.3em] text-white/20 rotate-[-90deg] origin-center -translate-y-12 mb-8 h-0 w-0 whitespace-nowrap opacity-40">CONSENSUS_SQUAD</div>
                {[
                    { name: 'OnPointDavid', hp: 85, role: 'Shield', color: 'bg-cyan-500', level: 95 },
                    { name: 'BixbySol', hp: 60, role: 'Zap', color: 'bg-purple-500', level: 92 },
                    { name: 'BigCo7', hp: 100, role: 'User', color: 'bg-amber-500', level: 88 }
                ].map((member, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + (i * 0.1) }}
                        className="relative group pointer-events-auto cursor-help"
                    >
                        <div className="w-12 h-12 rounded-full border border-white/10 bg-black/60 overflow-hidden p-[2px] shadow-lg group-hover:border-white/30 transition-all">
                            <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center opacity-40">
                                <User className="w-5 h-5 text-white/20" />
                            </div>
                        </div>
                        {/* HP Bar Overlay */}
                        <div className="absolute -bottom-1 left-1 right-1 h-1 bg-black/80 rounded-full overflow-hidden border border-white/5">
                            <div className={`h-full ${member.color} shadow-[0_0_5px_rgba(255,255,255,0.2)]`} style={{ width: `${member.hp}%` }} />
                        </div>
                    </motion.div>
                ))}

                {/* Lobby Return Button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => window.location.hash = 'lobby'}
                    className="mt-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors pointer-events-auto"
                >
                    <Star className="w-4 h-4 text-white/40" />
                </motion.button>

                {/* Campfire Toggle */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={toggleRest}
                    className={`mt-4 w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-300 pointer-events-auto ${isResting ? 'bg-orange-500/20 border-orange-500/50 shadow-[0_0_15px_orange]' : 'bg-black/40 border-white/10 hover:border-orange-500/30'}`}
                >
                    <div className={`transition-all duration-500 ${isResting ? 'animate-pulse text-orange-400' : 'text-white/40'}`}>
                        🔥
                    </div>
                </motion.button>
            </div>

            {/* Central Tap Area: Arcane Focus */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pointer-events-auto">
                <NeuralCommandCenter
                    exp={totalExp}
                    level={level}
                    onClick={handleTap}
                    isTapping={isTapping}
                />
            </div>

            {/* Bottom ID Bar - Citizen ID Style */}
            <div className="absolute bottom-6 left-0 right-0 px-8 flex flex-col items-center pointer-events-none">
                <div className="glass-stone px-6 py-2 rounded-full flex items-center gap-4 shadow-xl">
                    <User className="w-3 h-3 text-white/40" />
                    <span className="text-[10px] text-white/60 font-mono tracking-widest">{citizenAddress}</span>
                    <div className="h-3 w-[1px] bg-white/10" />
                    <span className="text-[10px] text-[#fbbf24] font-bold tracking-widest">VERIFIED CITIZEN</span>
                </div>
            </div>

            {/* CAMPFIRE OVERLAY (Safe Haven) */}
            <AnimatePresence>
                {isResting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]"
                    >
                        {/* Vignette */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_0%,black_100%)] opacity-80" />

                        {/* Fire Effect Helper */}
                        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-orange-900/40 to-transparent mix-blend-screen" />

                        <div className="relative z-10 flex flex-col items-center gap-4">
                            <motion.div
                                className="text-6xl filter drop-shadow-[0_0_20px_orange]"
                                animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                            >
                                🔥
                            </motion.div>
                            <div className="text-center">
                                <h2 className="text-2xl font-fantasy text-orange-100 tracking-widest drop-shadow-md">RESTING</h2>
                                <p className="text-xs text-orange-300/60 font-mono mt-1 animate-pulse">HP Regenerating... Safe Mode Active</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
