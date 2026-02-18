import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CombatOverlay = ({ activeBoss, partyHP, user, storyFeed = [], worldBubble = {}, onAction }) => {
    const [lastDmg, setLastDmg] = useState(0);
    const [strikeType, setStrikeType] = useState('Tactical Strike');
    const [shake, setShake] = useState(false);

    const themeColor = worldBubble?.color || '#00f2ff'; // Aurora Cyan default

    useEffect(() => {
        if (activeBoss?.lastHit) {
            setLastDmg(activeBoss.lastHit);
            setStrikeType(activeBoss.strikeType || 'Tactical Strike');
            setShake(true);
            const timer = setTimeout(() => setShake(false), 200);
            return () => clearTimeout(timer);
        }
    }, [activeBoss?.hp]);

    if (!activeBoss) return null;

    const hpPercent = (activeBoss.hp / activeBoss.maxHp) * 100;

    return (
        <div className="fixed inset-0 pointer-events-none z-[8000] flex flex-col justify-between overflow-hidden">

            {/* 🛡️ THE GOD-BAR (Boss HP Section) */}
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full pt-10 px-10 flex flex-col items-center"
            >
                <div className="w-full max-w-4xl relative">
                    {/* Decorative Frame */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent blur-md" />

                    <div className="flex justify-between items-end mb-2 px-4 relative z-10">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-cyan-400/80 drop-shadow-sm">
                                [ LEGENDARY ENCOUNTER ]
                            </span>
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white drop-shadow-2xl">
                                {activeBoss.name}
                            </h2>
                        </div>
                        <div className="text-right font-mono text-sm font-bold text-cyan-300">
                            {activeBoss.hp.toLocaleString()} / {activeBoss.maxHp.toLocaleString()} REVERSAL HP
                        </div>
                    </div>

                    {/* Crystalline Progress Frame */}
                    <div className="h-4 w-full bg-black/80 border border-white/20 rounded-full overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${hpPercent}%` }}
                            className="h-full relative"
                            style={{
                                background: `linear-gradient(90deg, #00f2ff, #a855f7)`,
                                filter: 'brightness(1.2)'
                            }}
                        >
                            {/* Inner Shimmer */}
                            <motion.div
                                className="absolute inset-0 bg-white/20"
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                            />
                        </motion.div>
                    </div>
                </div>
            </motion.header>

            {/* 🌌 COMBAT THEATRE (Center) */}
            <div className="flex-1 flex items-center justify-center">
                <AnimatePresence>
                    {shake && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, y: 50 }}
                            animate={{ scale: 1.8, opacity: 1, y: -150 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center pointer-events-none"
                        >
                            <span className="text-6xl font-black italic drop-shadow-[0_0_20px_rgba(0,242,255,0.8)] text-white">
                                -{lastDmg}
                            </span>
                            <span className="text-xs font-bold tracking-widest text-cyan-400 bg-black/60 px-4 py-1 rounded-full border border-cyan-500/30 uppercase mt-2">
                                {strikeType}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ⚔️ THE CLASS ACTION BAR (Bottom) */}
            <motion.footer
                initial={{ y: 150, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full flex justify-center pb-8 px-6 pointer-events-auto"
            >
                <div className="relative group">
                    {/* Background Bloom */}
                    <div className="absolute -inset-6 bg-cyan-500/10 rounded-full blur-3xl opacity-50 transition-opacity group-hover:opacity-100" />

                    <div className="mmo-panel flex items-center gap-6 p-1.5 px-8 rounded-full border border-white/20 shadow-2xl relative z-10">

                        {/* 1. Identity Gem */}
                        <div className="flex flex-col items-center group/gem cursor-pointer">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-t from-black to-gray-800 border-2 border-white/10 flex items-center justify-center text-2xl shadow-lg relative overflow-hidden">
                                {user?.mmoRole === 'Healer' ? '🌿' : user?.mmoRole === 'Tank' ? '🛡️' : '⚔️'}
                                <div className="absolute inset-0 bg-cyan-400/10 opacity-0 group-hover/gem:opacity-100 transition-opacity" />
                            </div>
                            <span className="text-[9px] font-bold text-white/40 uppercase mt-1 tracking-tighter">ROLE</span>
                        </div>

                        {/* 2. Vitality Core */}
                        <div className="w-48">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase">CONVICTION</span>
                                <span className="text-xs font-mono text-white/60">{partyHP}%</span>
                            </div>
                            <div className="h-3 w-full bg-black/60 rounded-full border border-white/5 p-[1px]">
                                <motion.div
                                    animate={{ width: `${partyHP}%` }}
                                    className={`h-full rounded-full ${partyHP > 30 ? 'bg-cyan-500 shadow-[0_0_10px_#00f2ff]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}
                                />
                            </div>
                        </div>

                        {/* 3. PRIMARY ACTION (Maneuver) */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onAction('taps')}
                            className="relative px-10 py-4 rounded-full overflow-hidden group/btn"
                        >
                            {/* Stone Texture / Obsidian Background */}
                            <div className="absolute inset-0 bg-gradient-to-b from-gray-700 to-black border-t-2 border-white/20" />
                            <div className="absolute inset-0 bg-cyan-400/0 group-hover/btn:bg-cyan-400/10 transition-colors" />

                            <span className="relative z-10 text-white font-black italic tracking-tighter text-lg uppercase flex items-center gap-2">
                                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_#00f2ff]" />
                                MANEUVER
                            </span>
                        </motion.button>

                        {/* 4. Secondary/Soul Dust Gem */}
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-black/80 border border-white/10 flex items-center justify-center text-base text-cyan-400 shadow-inner">
                                ✨
                            </div>
                            <span className="text-[9px] font-bold text-white/40 uppercase mt-1 tracking-tighter">SKILL</span>
                        </div>

                        {/* 5. Rank Identifier */}
                        <div className="text-right border-l border-white/10 pl-6 hidden md:block">
                            <h4 className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] leading-none">Alpha Leader</h4>
                            <div className="text-lg font-black italic tracking-tighter text-white">LV. {user?.level || 111}</div>
                        </div>
                    </div>
                </div>

                {/* Narrative Whispers */}
                <div className="absolute bottom-1 w-full text-center pointer-events-none">
                    <AnimatePresence mode="popLayout">
                        {storyFeed.slice(-1).map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-[10px] font-bold italic tracking-wider text-cyan-300/60 uppercase"
                            >
                                {item.msg || "The Sphere pulses with conviction..."}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </motion.footer>

            {/* 🚪 THE GATES OF DESTINY (Victory / Path Selection) */}
            <AnimatePresence>
                {activeBoss.hp <= 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-[9000] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center pointer-events-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-6xl font-black italic tracking-tighter text-white uppercase drop-shadow-[0_0_30px_rgba(0,242,255,0.5)]">
                                Victory
                            </h2>
                            <p className="text-cyan-400 font-bold tracking-[0.4em] uppercase mt-2">
                                Choose Your Path
                            </p>
                        </motion.div>

                        <div className="flex gap-8">
                            {[
                                { id: 'IGNIS_PEAKS', label: 'Gate of Ash', icon: '🔥', desc: 'Into the Peaks' },
                                { id: 'SYLVAN_GLADES', label: 'Gate of Life', icon: '🌿', desc: 'Into the Glades' },
                                { id: 'CRYSTAL_TUNDRA', label: 'Gate of Frost', icon: '❄️', desc: 'Into the Tundra' }
                            ].map((gate) => (
                                <motion.button
                                    key={gate.id}
                                    whileHover={{ scale: 1.05, borderColor: '#00f2ff' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => onAction('select_path', 0, { regionId: gate.id })}
                                    className="w-64 p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center gap-4 group transition-colors"
                                >
                                    <span className="text-5xl group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all">
                                        {gate.icon}
                                    </span>
                                    <div className="text-center">
                                        <h3 className="text-white font-black uppercase tracking-widest">{gate.label}</h3>
                                        <p className="text-[10px] text-white/40 uppercase mt-1">{gate.desc}</p>
                                    </div>
                                    <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="w-1/3 h-full bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CombatOverlay;
