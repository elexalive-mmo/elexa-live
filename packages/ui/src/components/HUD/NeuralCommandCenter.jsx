import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Hexagon } from 'lucide-react';

export const NeuralCommandCenter = ({ exp = 0, onClick, isTapping, level = 1 }) => {
    const progress = (exp % 1000) / 10; // Simple percentage of current level progress

    return (
        <div className="flex flex-col items-center justify-center py-8 px-8 rounded-[40px] bg-[#0a0a0f]/80 backdrop-blur-md border border-[#fbbf24]/20 relative group overflow-hidden shadow-[0_0_40px_rgba(251,191,36,0.05)] cursor-pointer select-none"
            onClick={onClick}>

            {/* Background Texture (Stardust) */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
            <div className="absolute inset-0 bg-radial-gradient(circle_at_center, rgba(139,92,246,0.1), transparent 70%) pointer-events-none" />

            {/* The Arcane Focus */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{
                    scale: isTapping ? 0.95 : 1,
                    opacity: 1
                }}
                className="relative w-48 h-48 mb-4 flex items-center justify-center"
            >
                {/* Outer Rune Ring (Slow Rotate) */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-[#fbbf24]/10 border-dashed"
                />

                {/* Middle Mana Ring (Progress) */}
                <svg className="absolute inset-2 w-44 h-44 -rotate-90">
                    <circle
                        cx="88" cy="88" r="84"
                        stroke="rgba(251,191,36,0.05)"
                        strokeWidth="3"
                        fill="none"
                    />
                    <motion.circle
                        cx="88" cy="88" r="84"
                        stroke="#fbbf24"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray="527.78"
                        initial={{ strokeDashoffset: 527.78 }}
                        animate={{ strokeDashoffset: 527.78 - (527.78 * progress) / 100 }}
                        className="drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]"
                    />
                </svg>

                {/* Inner Crystal Core */}
                <div className="w-24 h-24 relative flex items-center justify-center z-10">
                    <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="relative"
                    >
                        <Hexagon className={`w-20 h-20 text-[#8b5cf6] fill-[#8b5cf6]/20 drop-shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-transform duration-100 ${isTapping ? 'scale-90' : 'scale-100'}`} />
                        <Sparkles className="w-10 h-10 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </motion.div>
                </div>

                {/* Magical Glow */}
                <div className="absolute inset-0 rounded-full bg-[#8b5cf6]/10 blur-3xl group-hover:bg-[#8b5cf6]/20 transition-all duration-1000" />

                {/* Level Up Text Float */}
                <AnimatePresence>
                    {isTapping && (
                        <motion.div
                            initial={{ opacity: 0, y: 0, scale: 0.5 }}
                            animate={{ opacity: 1, y: -80, scale: 1.2 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                        >
                            <div className="text-lg font-bold text-[#fbbf24] drop-shadow-[0_0_10px_rgba(251,191,36,0.8)] flex items-center gap-1">
                                <Sparkles className="w-4 h-4" />
                                <span>+15 EXP</span>
                            </div>
                            <div className="text-sm font-bold text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)] animate-pulse">
                                -{1 + Math.floor(level / 10)} HP
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Text Overlay */}
            <h2 className="text-lg font-fantasy text-[#fbbf24] tracking-widest uppercase mb-1 drop-shadow-md">Arcane Focus</h2>
            <p className="text-[10px] text-[#fbbf24]/60 font-mono tracking-[0.1em] uppercase text-center">
                Level {level} • Status: Active
            </p>
        </div>
    );
};
