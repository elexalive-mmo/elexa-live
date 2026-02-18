import React, { useState, useEffect } from 'react';
import { Button, Card } from '@elexa/ui';
import { Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGameMaster } from '../App';

// Logic from legacy Tap2Earn.jsx
const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1800, 3000, 5000, 8000, 12000];

export default function TapPage() {
    const [exp, setExp] = useState(0);
    const [level, setLevel] = useState(1);
    const [clicks, setClicks] = useState([]);
    const [region, setRegion] = useState("Trench Lowlands");
    const [tile, setTile] = useState(1);

    // Level Calc
    useEffect(() => {
        let lvl = 1;
        for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
            if (exp >= LEVEL_THRESHOLDS[i]) lvl = i + 1;
        }
        setLevel(lvl);
    }, [exp]);

    const handleTap = (e) => {
        setExp(prev => prev + 5);
        setTile(prev => (prev % 100) + 1);

        // Region Logic
        if (tile >= 20 && tile < 40) setRegion("Ignis Peaks");
        else if (tile >= 40 && tile < 60) setRegion("Azure Depths");
        else if (tile >= 60) setRegion("Frostguard Depths");
        else if (tile < 20) setRegion("Trench Lowlands");

        // Float Animation
        const id = Date.now();
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setClicks(prev => [...prev, { id, x, y, val: "+5 XP" }]);
        setTimeout(() => {
            setClicks(prev => prev.filter(c => c.id !== id));
        }, 1000);
    };

    const nextLevelXp = LEVEL_THRESHOLDS[level] || 12000;
    const progress = Math.min((exp / nextLevelXp) * 100, 100);

    const { isGM } = useGameMaster();
    // ... existing state ... 

    return (
        <div className={`p-6 min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden font-sans ${isGM ? 'grayscale-[0.5] contrast-125' : ''}`}>

            {/* GM Data Overlay */}
            {isGM && (
                <div className="absolute top-4 left-4 font-mono text-[10px] text-green-500 bg-black/80 p-2 border border-green-500/30 rounded z-20">
                    <div>&gt; NETWORK: MAINNET</div>
                    <div>&gt; TPS: 2400</div>
                    <div>&gt; CLICK_MULTIPLIER: 1.0</div>
                    <div>&gt; SESSION_ID: {Date.now().toString().slice(-6)}</div>
                </div>
            )}

            {/* Background Glow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-elexa-primary/20 rounded-full blur-[100px] pointer-events-none ${isGM ? 'animate-pulse bg-red-500/10' : ''}`} />

            <div className="text-center mb-8 relative z-10 space-y-2">
                <h1 className="text-xl font-bold bg-gradient-to-r from-elexa-primary to-elexa-secondary bg-clip-text text-transparent uppercase tracking-widest">{region}</h1>
                <div className="text-xs text-white/50">Tile {tile}/100 • Level {level}</div>

                <div className="text-5xl font-display font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    {exp} <span className="text-lg text-white/50">XP</span>
                </div>

                {/* XP Bar */}
                <div className="w-64 h-2 bg-white/10 rounded-full mx-auto overflow-hidden mt-4">
                    <div className={`h-full bg-gradient-to-r from-elexa-primary to-elexa-secondary transition-all ${isGM ? 'bg-green-500' : ''}`} style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            {/* Tap Button / Area */}
            <div className="relative w-64 h-64">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleTap}
                    className={`w-full h-full rounded-full bg-gradient-to-b from-[#2e1065] to-[#0f0a1e] border-4 border-elexa-primary/50 shadow-[0_0_50px_rgba(139,92,246,0.3)] flex items-center justify-center group relative overflow-hidden ${isGM ? 'border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : ''}`}
                >
                    <div className="absolute inset-0 bg-[url('https://placehold.co/400x400/2e1065/FFF/png?text=')] opacity-20 mix-blend-overlay group-hover:scale-110 transition-transform duration-500"></div>
                    {/* Icon or Text */}
                    {isGM ? (
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-mono text-green-400 font-bold">EXEC</span>
                            <span className="text-[10px] text-green-600">Fn.Tap()</span>
                        </div>
                    ) : (
                        <Zap size={80} className="text-white drop-shadow-lg group-hover:text-elexa-accent transition-colors duration-300" />
                    )}
                </motion.button>

                {/* Floating Numbers */}
                <AnimatePresence>
                    {clicks.map(click => (
                        <motion.div
                            key={click.id}
                            initial={{ opacity: 1, y: click.y - 20, x: click.x }}
                            animate={{ opacity: 0, y: click.y - 100 }}
                            exit={{ opacity: 0 }}
                            className="absolute font-bold text-elexa-accent text-xl pointer-events-none"
                        >
                            {click.val}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="mt-8 text-white/50 text-sm">
                Tap to farm Soul Dust & EXP | 5 Min Hold Bonus Active
            </div>
        </div>
    );
}
