import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Shield, Sword, Book, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const SkillsView = ({ onExit, user }) => {
    const skills = [
        { id: 'sentinel', name: 'Sentinel Identity', icon: <Shield />, level: 1, max: 5, desc: 'Unlocks the Guardian class path.' },
        { id: 'raid', name: 'Raid Tactics', icon: <Sword />, level: 0, max: 5, desc: 'Increases damage against World Bosses.' },
        { id: 'wealth', name: 'Fortune Seeker', icon: <Star />, level: 2, max: 10, desc: 'Boosts drop rate of rare items.' },
        { id: 'lore', name: 'Ancient Knowledge', icon: <Book />, level: 1, max: 3, desc: 'Reveals hidden map locations.' },
    ];

    return (
        <div className="relative w-full min-h-screen flex flex-col font-serif text-amber-100 overflow-hidden">
            {/* Background - Library */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: "url('/assets/backgrounds/library.png')" }}
            >
                <div className="absolute inset-0 bg-black/80" />
            </div>

            {/* Header */}
            <header className="relative z-10 p-6 flex justify-between items-center bg-black/40 backdrop-blur-md border-b border-amber-900/30">
                <Button onClick={onExit} variant="ghost" className="text-amber-500 hover:text-amber-200 hover:bg-amber-900/20">
                    <ArrowLeft className="nr-2 h-4 w-4" /> BACK TO ARCHIVES
                </Button>
                <h1 className="text-2xl font-black tracking-widest text-amber-500">GRIMOIRE OF SKILLS</h1>
            </header>

            {/* Content */}
            <div className="relative z-10 p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto w-full">
                {skills.map((skill, index) => (
                    <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-[#1a1612] border border-amber-900/50 rounded-xl p-6 relative overflow-hidden group hover:border-amber-500/50 transition-colors"
                    >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-5" />

                        <div className="relative z-10 flex items-start gap-4">
                            <div className={`p-3 rounded-lg bg-black/40 border border-amber-500/20 ${skill.level > 0 ? 'text-amber-400' : 'text-gray-600'}`}>
                                {React.cloneElement(skill.icon, { className: 'w-8 h-8' })}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-amber-200 group-hover:text-amber-100">{skill.name}</h3>
                                    <span className="text-xs font-mono text-amber-500/60 bg-black/30 px-2 py-1 rounded">LVL {skill.level}/{skill.max}</span>
                                </div>
                                <p className="text-sm text-amber-100/60 mb-4">{skill.desc}</p>

                                {/* Progress Bar */}
                                <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className="h-full bg-amber-600"
                                        style={{ width: `${(skill.level / skill.max) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Upgrade Button (Mock) */}
                        <div className="mt-4 flex justify-end">
                            <button className="text-[10px] uppercase tracking-widest font-bold text-amber-500 hover:text-amber-300 transition-colors disabled:opacity-30" disabled={skill.level === skill.max}>
                                {skill.level === skill.max ? 'MASTERED' : 'TRAIN (1000 XP)'}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
