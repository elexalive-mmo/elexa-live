import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shield, Zap, ShoppingBag, BookOpen, Crown, Skull } from 'lucide-react';

export default function TapToEarn() {
    const [level, setLevel] = useState(1);
    const [xp, setXp] = useState(0);
    const [xpToNext, setXpToNext] = useState(1000);
    const [depth, setDepth] = useState(0);
    const [depthMax, setDepthMax] = useState(20);
    const [partyHealth, setPartyHealth] = useState(100);
    const [clicks, setClicks] = useState([]);
    const [isHolding, setIsHolding] = useState(false);

    // Simulate Party Health Regen
    useEffect(() => {
        const interval = setInterval(() => {
            setPartyHealth(prev => Math.min(prev + 1, 100));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleTap = (e) => {
        // Add XP
        const xpGain = 5 + Math.floor(level * 0.5); // Scaling XP
        const newXp = xp + xpGain;

        // Level Up Logic
        if (newXp >= xpToNext) {
            setLevel(prev => prev + 1);
            setXp(newXp - xpToNext);
            setXpToNext(prev => Math.floor(prev * 1.2)); // +20% harder each level
            // Trigger Level Up Effect (could add sound/visual here)
        } else {
            setXp(newXp);
        }

        // Advance Depth occasionally
        if (Math.random() > 0.8) {
            setDepth(prev => Math.min(prev + 1, depthMax));
        }

        // Floating Text Animation
        const id = Date.now();
        const rect = e.currentTarget.getBoundingClientRect();
        // Center of the coin
        const x = rect.width / 2;
        const y = rect.height / 2;
        // Random slight offset
        const randomX = (Math.random() - 0.5) * 80;
        const randomY = (Math.random() - 0.5) * 80;

        setClicks(prev => [...prev, { id, x: x + randomX, y: y + randomY, val: `+${xpGain}` }]);

        // Cleanup
        setTimeout(() => {
            setClicks(prev => prev.filter(c => c.id !== id));
        }, 1000);
    };

    return (
        <div className="h-screen w-full bg-[#050511] text-white font-sans overflow-hidden flex flex-col relative select-none">

            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-900/10 rounded-full blur-[80px] pointer-events-none" />

            {/* HEADER: The Gate */}
            <div className="w-full flex justify-center pt-8 pb-4 relative z-10">
                <div className="w-full max-w-sm px-4">
                    <div className="bg-[#1a1a2e]/80 backdrop-blur-md border border-purple-500/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(88,28,135,0.15)] relative overflow-hidden">
                        {/* Header Badge */}
                        <div className="flex flex-col items-center justify-center mb-4">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-purple-400"><Shield size={16} /></span>
                                <h1 className="text-xl font-black uppercase tracking-[0.2em] text-white drop-shadow-md">THE GATE</h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">SAFE ZONE • AETHER</span>
                                <div className="px-2 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-[8px] font-mono text-zinc-400">
                                    TIER <span className="text-white font-bold text-[10px]">0</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <StatBox label="DEPTH" value={`${depth}/${depthMax}`} />
                            <StatBox label="LOOT" value="1x" color="text-emerald-400" />
                            <StatBox label="LVL" value={level} />
                        </div>

                        {/* XP Bar */}
                        <div className="mb-1">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="text-[10px] font-black italic text-amber-400 uppercase tracking-widest">LVL {level}</span>
                                <span className="text-[9px] font-mono text-white/40">{xp} / {xpToNext} XP</span>
                            </div>
                            <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-amber-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(xp / xpToNext) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PARTY HEALTH */}
            <div className="w-full max-w-sm mx-auto px-6 mb-6 relative z-10">
                <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                        <Shield size={12} className="text-blue-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">PARTY</span>
                    </div>
                    <span className="text-[10px] font-mono text-white/50">{partyHealth}/100</span>
                </div>
                <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden border border-white/10">
                    <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                        animate={{ width: `${partyHealth}%` }}
                    />
                </div>
            </div>

            {/* ACTION BAR */}
            <div className="w-full max-w-sm mx-auto px-6 mb-8 relative z-10">
                <button className="w-full py-3 bg-[#2e1065]/50 hover:bg-[#2e1065] border border-purple-500/30 rounded-xl flex items-center justify-center gap-2 group transition-all">
                    <Sparkles size={16} className="text-purple-400 group-hover:text-purple-200 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-purple-200 group-hover:text-white">Area Clear — Tap to advance!</span>
                </button>
            </div>

            {/* MAIN TAP AREA - THE COIN (3D TILT) */}
            <div className="flex-1 flex items-center justify-center relative z-10 w-full mb-12 perspective-1000">
                <div className="relative w-80 h-80">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95, rotateX: 10, rotateY: 10 }}
                        onClick={handleTap}
                        className="w-full h-full rounded-full relative focus:outline-none group"
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* Outer Glow */}
                        <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-[60px] animate-pulse group-hover:bg-amber-400/30 transition-colors" />

                        {/* The High-Fidelity Coin Image */}
                        <div className="absolute inset-0 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform transition-transform duration-200">
                            <img
                                src="/exp_token.png"
                                alt="EXP Token"
                                className="w-full h-full object-contain drop-shadow-2xl"
                                style={{ filter: 'drop-shadow(0 0 15px rgba(245,158,11,0.3))' }}
                            />

                            {/* Dynamic Shine Layer */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay" />
                        </div>
                    </motion.button>

                    {/* Floating Text Container */}
                    <AnimatePresence>
                        {clicks.map(click => (
                            <motion.div
                                key={click.id}
                                initial={{ opacity: 1, y: click.y - 40, x: click.x, scale: 0.5, rotate: (Math.random() - 0.5) * 30 }}
                                animate={{ opacity: 0, y: click.y - 180, scale: 1.5 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="absolute top-0 left-0 pointer-events-none"
                            >
                                <span className="text-4xl font-black text-amber-300 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] stroke-black tracking-tighter" style={{ textShadow: '0 0 20px rgba(245,158,11,0.8)' }}>
                                    {click.val}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* BOTTOM DOCK */}
            <div className="w-full bg-[#0a0a14] border-t border-white/5 px-6 py-4 relative z-20">
                <div className="max-w-md mx-auto grid grid-cols-4 gap-4">
                    <DockItem icon={<Crown size={20} />} label="TAP" sub="+5 XP" active />
                    <DockItem icon={<Zap size={20} />} label="HOLD" sub="+10 XP" />
                    <DockItem icon={<ShoppingBag size={20} />} label="BUY" sub="+15 DMG" />
                    <DockItem icon={<BookOpen size={20} />} label="SKILLS" sub="LV10" />
                </div>
            </div>
        </div>
    );
}

const StatBox = ({ label, value, color = "text-white" }) => (
    <div className="bg-black/40 border border-white/5 rounded-lg p-2 flex flex-col items-center justify-center">
        <span className="text-[9px] text-white/30 font-black uppercase tracking-widest mb-1">{label}</span>
        <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
);

const DockItem = ({ icon, label, sub, active }) => (
    <div className={`flex flex-col items-center gap-1 cursor-pointer group ${active ? 'opacity-100' : 'opacity-40 hover:opacity-80'} transition-opacity`}>
        <div className={`p-2 rounded-xl mb-1 ${active ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-white/10 text-white'}`}>
            {icon}
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest text-white">{label}</span>
        <span className="text-[8px] font-mono text-emerald-400">{sub}</span>
    </div>
);
