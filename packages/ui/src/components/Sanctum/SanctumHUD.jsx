import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Palette, Sparkles, Save, X, Settings2 } from 'lucide-react';

export const SanctumHUD = ({ onExit, onSave, sanctumConfig, setSanctumConfig }) => {
    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
            {/* Top Bar */}
            <div className="flex justify-between items-start pointer-events-auto">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onExit}
                    className="p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white/70 hover:text-white transition-all shadow-xl"
                >
                    <X size={20} />
                </motion.button>

                <div className="flex gap-3">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-3 shadow-xl"
                    >
                        <Sparkles size={16} className="text-purple-400" />
                        <span className="text-[10px] font-black text-white/50 tracking-widest uppercase">Metaverse Window Active</span>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex justify-between items-end pointer-events-auto">
                {/* Customization Panel */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex gap-4 p-2 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl"
                >
                    <ControlBtn
                        icon={<Palette size={18} />}
                        label="Ambience"
                        onClick={() => { }} // TODO: Mood selector
                    />
                    <ControlBtn
                        icon={<Eye size={18} />}
                        label="View Mode"
                        onClick={() => { }}
                    />
                    <ControlBtn
                        icon={<Settings2 size={18} />}
                        label="Config"
                        onClick={() => { }}
                    />
                    <div className="w-[1px] h-10 bg-white/10 mx-2" />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onSave}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-black text-[10px] tracking-widest uppercase shadow-lg shadow-purple-500/20"
                    >
                        Sync Sanctum
                    </motion.button>
                </motion.div>

                {/* Legend Header */}
                <div className="text-right">
                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase mb-1">Elexa Sanctum</h2>
                    <p className="text-[9px] font-mono text-cyan-400 opacity-60 uppercase tracking-widest italic">Aetheric Resonance Verified // Gen 1</p>
                </div>
            </div>

            {/* Glassmorphic Frame Overlay */}
            <div className="absolute inset-0 border-[24px] border-black/20 pointer-events-none rounded-[40px] shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
        </div>
    );
};

const ControlBtn = ({ icon, label, onClick }) => (
    <motion.button
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
        onClick={onClick}
        className="flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-colors gap-1.5"
    >
        <div className="text-white/40 group-hover:text-white transition-colors">
            {icon}
        </div>
        <span className="text-[7px] font-bold text-white/30 uppercase tracking-tighter">{label}</span>
    </motion.button>
);
