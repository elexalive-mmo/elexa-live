import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SKILLS_MOCK = [
    { id: 'strike', icon: '⚔️', label: 'Strike', cooldown: 0, maxCooldown: 1500 },
    { id: 'fireball', icon: '🔥', label: 'Fire', cooldown: 2000, maxCooldown: 5000 },
    { id: 'heal', icon: '🌿', label: 'Mend', cooldown: 0, maxCooldown: 8000 },
    { id: 'shield', icon: '🛡️', label: 'Guard', cooldown: 5000, maxCooldown: 12000 },
    { id: 'blink', icon: '✨', label: 'Phase', cooldown: 0, maxCooldown: 10000 },
    { id: 'ult', icon: '⚡', label: 'Nova', cooldown: 15000, maxCooldown: 30000, isUlt: true },
];

export default function SpectralActionBar({ onAction }) {
    const [skills, setSkills] = useState(SKILLS_MOCK);
    const [globalCD, setGlobalCD] = useState(false);

    const handleCast = (skillId) => {
        if (globalCD) return;

        const skill = skills.find(s => s.id === skillId);
        if (skill.cooldown > 0) return;

        if (onAction) onAction(skillId, 0);

        setGlobalCD(true);
        setTimeout(() => setGlobalCD(false), 500);

        setSkills(prev => prev.map(s =>
            s.id === skillId
                ? { ...s, cooldown: s.maxCooldown }
                : s
        ));
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setSkills(prev => prev.map(s => ({
                ...s,
                cooldown: Math.max(0, s.cooldown - 100)
            })));
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000] flex items-end gap-5 px-10 py-5 rounded-[3rem] bg-black/60 backdrop-blur-3xl border border-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.8)]">
            {/* Aetheric Soul Bar Glow */}
            <div className="absolute -inset-10 bg-aetheric-purple/10 rounded-full blur-[100px] pointer-events-none" />

            {skills.map((s, i) => (
                <motion.div
                    key={s.id}
                    whileHover={s.cooldown === 0 ? { y: -8, scale: 1.1 } : {}}
                    whileTap={s.cooldown === 0 ? { scale: 0.9 } : {}}
                    onClick={() => handleCast(s.id)}
                    className={`
                        relative group cursor-pointer
                        ${s.isUlt ? 'w-24 h-24 -mb-3' : 'w-16 h-16'}
                        flex flex-col items-center justify-center transition-all duration-500
                    `}
                >
                    {/* Sacred Slot Frame */}
                    <div className={`
                        absolute inset-0 rounded-[1.25rem] border transition-all duration-700
                        ${s.cooldown === 0
                            ? 'border-celestial-gold/40 bg-gradient-to-b from-white/5 to-black/80 shadow-[0_0_20px_rgba(250,204,21,0.2)] group-hover:border-celestial-gold'
                            : 'border-white/5 bg-black/90'}
                        ${s.isUlt && s.cooldown === 0 ? 'border-crystal-cyan shadow-[0_0_30px_rgba(0,242,255,0.4)] px-1' : ''}
                    `} />

                    {/* Divine Icon */}
                    <div className={`relative z-10 text-3xl transition-all duration-500 ${s.cooldown > 0 ? 'opacity-20 grayscale blur-[2px]' : 'group-hover:scale-125'}`}>
                        {s.icon}
                    </div>

                    {/* Mana/Soul Recharge Overlay */}
                    <AnimatePresence>
                        {s.cooldown > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute bottom-0 left-0 w-full bg-aetheric-purple/15 border-t border-aetheric-purple/30 rounded-b-[1.25rem] backdrop-blur-[4px]"
                                style={{ height: `${(s.cooldown / s.maxCooldown) * 100}%` }}
                            />
                        )}
                    </AnimatePresence>

                    {/* Sigil Keybind */}
                    <div className="absolute -top-2 -right-2 z-20 bg-black/90 border border-white/10 rounded-lg px-2 py-0.5 text-[9px] font-bold text-white/40 font-heading">
                        {i + 1}
                    </div>

                    {/* Tooltip Label */}
                    <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        <span className="text-[8px] font-bold text-white/30 tracking-[0.3em] uppercase">{s.label}</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
