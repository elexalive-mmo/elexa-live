import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Zap, Shield, Sparkles, Command } from 'lucide-react';

const NeuralCommandNexus = ({ user, onAction }) => {
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const level = user?.level || 1;
    const progress = user?.progress || 0;
    const rank = user?.rank || 'Citizen';

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            onAction({ type: 'COMMAND', value: inputValue.trim() });
            setInputValue('');
        }
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
            {/* Status Aura */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-mono tracking-widest text-[#a855f7] whitespace-nowrap">
                <Shield className="w-3 h-3" />
                <span>LVL {level}</span>
                <span className="text-white/30">|</span>
                <span>{rank.toUpperCase()}</span>
                <span className="text-white/30">|</span>
                <div className="flex items-center gap-2">
                    <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-[#a855f7] to-[#6366f1]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="text-[10px] text-white/50">{progress}%</span>
                </div>
            </div>

            {/* Neural Command Bar */}
            <motion.div
                className={`relative flex items-center gap-3 p-2 rounded-2xl border transition-all duration-500 ${isFocused
                        ? 'bg-black/60 border-[#a855f7] shadow-[0_0_30px_rgba(168,85,247,0.2)]'
                        : 'bg-black/40 border-white/10 backdrop-blur-xl'
                    }`}
            >
                <div className={`p-2 rounded-xl transition-colors ${isFocused ? 'bg-[#a855f7]/20 text-[#a855f7]' : 'bg-white/5 text-white/40'}`}>
                    <Command className="w-5 h-5" />
                </div>

                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="ENTER NEURAL COMMAND..."
                    className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder:text-white/20"
                />

                <div className="flex items-center gap-2 px-2">
                    <button
                        onClick={() => onAction({ type: 'QUICK', action: 'BLINK' })}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all group relative"
                    >
                        <Zap className="w-4 h-4" />
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">BLINK</span>
                    </button>
                    <button
                        onClick={() => onAction({ type: 'QUICK', action: 'BANISH' })}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all group relative"
                    >
                        <Shield className="w-4 h-4" />
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">BANISH</span>
                    </button>
                </div>
            </motion.div>

            {/* Tap Shortcut (Center functionality) */}
            <motion.div
                className="absolute -right-24 bottom-0 p-4 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/30 backdrop-blur-md cursor-pointer group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onAction({ type: 'TAP' })}
            >
                <Sparkles className="w-6 h-6 text-[#a855f7] group-hover:animate-pulse" />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">PULSE</div>
            </motion.div>
        </div>
    );
};

export default NeuralCommandNexus;
