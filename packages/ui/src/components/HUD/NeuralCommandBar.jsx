import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mic, Radio, Zap, Radar, Send, Terminal, Flame, Shield, Activity as Pulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';



export const NeuralCommandBar = ({ onAction, userExp = 0 }) => {
    const [cmd, setCmd] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);

    const handleCmd = async () => {
        if (!cmd.trim()) return;
        setIsSyncing(true);
        await onAction('Command', 0, cmd);
        setCmd('');
        setTimeout(() => setIsSyncing(false), 800);
    };

    const progress = (userExp % 1000) / 10;

    return (
        <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-[54rem] bg-black/60 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-50 flex items-center gap-2 mx-auto mt-4"
        >
            {/* Celestial Essence Hub */}
            <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center ml-2">
                <svg className="w-full h-full -rotate-90 p-1">
                    <circle cx="20" cy="20" r="18" stroke="rgba(255,255,255,0.02)" strokeWidth="2.5" fill="none" />
                    <circle
                        cx="20"
                        cy="20"
                        r="18"
                        stroke="var(--celestial-gold)"
                        strokeWidth="2.5"
                        fill="none"
                        strokeDasharray="113.1"
                        strokeDashoffset={113.1 - (113.1 * progress) / 100}
                        className="transition-all duration-1000 opacity-60"
                        style={{ filter: 'drop-shadow(0 0 5px var(--celestial-gold))' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className={cn("w-5 h-5 text-celestial-gold transition-all duration-700", isSyncing ? "animate-spin scale-110 opacity-100" : "opacity-30")} />
                </div>
            </div>

            {/* Sacred Deeds - Quick Actions */}
            <div className="flex gap-1 pr-4 border-r border-white/5 mr-2">
                <CmdBtn icon={<Zap />} label="AETHERIC BLINK" onClick={() => {
                    const blinkUrl = `https://solana.com/blink?raid=${Date.now()}`;
                    window.open(`https://twitter.com/intent/tweet?text=The Aetheric Pulse is Rising! Join the Celestial Raid: ${blinkUrl}`, '_blank');
                    onAction('Blink Shared', 0);
                }} color="text-crystal-cyan group-hover:drop-shadow-[0_0_10px_var(--crystal-cyan)]" />
                <CmdBtn icon={<Flame />} label="BANISH DISSONANCE" onClick={() => onAction('tap', 0)} color="text-orange-500 animate-pulse" />
                <CmdBtn icon={<Radio />} label="DIVINE BROADCAST" onClick={() => onAction('Broadcast', 10)} color="text-aetheric-purple" />
                <CmdBtn icon={<Mic />} label="SOUL COMMUNION" onClick={() => onAction('Comms', 5)} color="text-mana-blue" />
                <CmdBtn icon={<Radar />} label="RESONANCE SCAN" onClick={() => onAction('Scan', 10)} color="text-celestial-gold" />
            </div>

            {/* Sacred Command Input */}
            <div className="flex-1 relative font-body">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none opacity-20">
                    <Terminal size={12} className="text-white" />
                </div>
                <input
                    value={cmd}
                    onChange={e => setCmd(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleCmd()}
                    placeholder="Whisper a command to the Aether..."
                    className="w-full bg-transparent border-none outline-none text-white text-[12px] pl-8 pr-4 placeholder:text-white/10 h-12 tracking-wide font-body"
                />
            </div>

            <button
                onClick={handleCmd}
                disabled={isSyncing}
                className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group mr-1",
                    isSyncing ? "bg-celestial-gold/5" : "hover:bg-white/5"
                )}
            >
                <Send className={cn("w-4 h-4 text-white/30 transition-all duration-500", !isSyncing && "group-hover:text-celestial-gold group-hover:translate-x-1 group-hover:scale-110")} />
            </button>
        </motion.div>
    );
};

const CmdBtn = ({ icon, onClick, color, label }) => (
    <motion.button
        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.03)' }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all bg-transparent group"
        title={label}
    >
        {React.cloneElement(icon, { className: cn("w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity", color) })}
    </motion.button>
);
