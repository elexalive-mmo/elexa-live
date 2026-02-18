import React from 'react';
import { motion } from 'framer-motion';

/**
 * ExperienceBar
 * A celestial, high-fantasy XP progress bar for the Elexa Live HUD.
 */
const ExperienceBar = ({ currentXp = 0, nextLevelXp = 100, level = 1, rank = 'Novice' }) => {
    const progress = Math.min(Math.max((currentXp / nextLevelXp) * 100, 0), 100);

    return (
        <div className="flex flex-col w-full max-w-md font-body">
            {/* Label Section */}
            <div className="flex justify-between items-end mb-2 px-1">
                <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-celestial-gold uppercase tracking-[0.2em] font-heading leading-tight">LVL {level}</span>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest italic">{rank}</span>
                </div>
                <div className="text-[10px] font-mono text-white/30 tracking-wider">
                    <span className="text-white/60 font-bold">{currentXp.toLocaleString()}</span> / {nextLevelXp.toLocaleString()} XP
                </div>
            </div>

            {/* Bar Container */}
            <div className="relative h-3 w-full bg-black/60 rounded-full border border-white/5 overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.9)]">
                {/* Background Shimmer */}
                <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-transparent via-celestial-gold/20 to-transparent animate-[shimmer_3s_infinite]" />

                {/* Progress Fill */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: 'spring', stiffness: 40, damping: 25 }}
                    className="h-full relative overflow-hidden rounded-full"
                    style={{
                        background: 'linear-gradient(90deg, #4f46e5 0%, #a855f7 50%, #facc15 100%)',
                        boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
                    }}
                >
                    {/* Inner Highlights */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />

                    {/* Celestial Shine */}
                    <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute inset-0 w-1/2 skew-x-[30deg] bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    />
                </motion.div>
            </div>

            {/* Aetheric Underglow */}
            <div className="w-full flex justify-center -mt-1">
                <div className="w-[70%] h-[4px] blur-xl opacity-20 transition-all duration-700"
                    style={{ backgroundColor: progress > 80 ? 'var(--celestial-gold)' : 'var(--aetheric-purple)' }} />
            </div>
        </div>
    );
};

export default ExperienceBar;
