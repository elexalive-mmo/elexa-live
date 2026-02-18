import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Zap, Leaf, Hammer, Boxes, Ghost, Skull } from 'lucide-react';
import { cn } from '@/lib/utils';

const FACTION_ICONS = {
    sentinels: Shield,
    mystics: Zap,
    druids: Leaf,
    etherforged: Hammer,
    nomads: Boxes,
    reavers: Skull,
    agents: Ghost,
    maxis: Users // Fallback
};

const FACTION_COLORS = {
    sentinels: 'bg-red-500',
    mystics: 'bg-blue-500',
    druids: 'bg-emerald-500',
    etherforged: 'bg-orange-500',
    nomads: 'bg-purple-500',
    reavers: 'bg-gray-500', // Or Poison Green? Let's stick to stone/void
    agents: 'bg-indigo-500',
    maxis: 'bg-yellow-500'
};

export const FactionHUD = () => {
    const [stats, setStats] = useState({});
    const [total, setTotal] = useState(0);
    const [recent, setRecent] = useState([]);

    const fetchData = async () => {
        try {
            // Mock data for now until API endpoint is wired, or fetch real if available
            const res = await fetch('http://localhost:3020/api/guilds'); // Need to create this endpoint?
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats);
                setTotal(data.total);
                setRecent(data.recent);
            } else {
                // Fallback Mock for visual dev
                setStats({
                    sentinels: 42, mystics: 38, druids: 25, etherforged: 30,
                    nomads: 15, reavers: 12, agents: 8, maxis: 50
                });
                setTotal(220);
                setRecent([
                    { name: "Satoshi's Shadow", guild: "Reavers", time: "Just now" },
                    { name: "Vitalik The Grey", guild: "Etherforged", time: "1m ago" }
                ]);
            }
        } catch (e) {
            // Fallback Mock
            setStats({
                sentinels: 42, mystics: 38, druids: 25, etherforged: 30,
                nomads: 15, reavers: 12, agents: 8, maxis: 50
            });
            setTotal(220);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    // Sort guilds by population for the leaderboard
    const sortedGuilds = Object.entries(stats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5); // Top 5

    return (
        <div className="bg-[#1a1b26] border-2 border-[#fbbf24]/20 rounded-lg p-4 font-serif relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            {/* Header: The Guild Board */}
            <div className="flex items-center justify-between border-b-2 border-[#fbbf24]/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center bg-[#fbbf24]/10 rounded border border-[#fbbf24]/30">
                        <Users className="w-5 h-5 text-[#fbbf24]" />
                    </div>
                    <div>
                        <h2 className="text-[#fbbf24] text-sm font-bold tracking-wider uppercase">Faction Halls</h2>
                        <span className="text-[#fbbf24]/50 text-[10px] uppercase tracking-widest">Populace: {total}</span>
                    </div>
                </div>
                {/* Wax Seal Effect */}
                <div className="w-8 h-8 rounded-full bg-red-900 border-2 border-red-800 shadow-inner flex items-center justify-center">
                    <span className="text-[8px] text-red-200 font-bold opacity-70">LIVE</span>
                </div>
            </div>

            {/* Leaderboard Bars */}
            <div className="space-y-3 relative z-10">
                {sortedGuilds.map(([guildId, count], i) => {
                    const Icon = FACTION_ICONS[guildId] || Users;
                    const percent = ((count / total) * 100).toFixed(0);

                    return (
                        <div key={guildId} className="group relative">
                            <div className="flex justify-between text-[10px] uppercase tracking-wider text-[#fbbf24]/80 mb-1 pl-1">
                                <span className="flex items-center gap-1.5">
                                    <span className="text-[#fbbf24]/40 font-mono">#{i + 1}</span>
                                    {guildId}
                                </span>
                                <span className="font-mono text-[#fbbf24]">{count}</span>
                            </div>

                            {/* Bar Container */}
                            <div className="h-2 w-full bg-[#0f1115] rounded-full overflow-hidden border border-[#fbbf24]/10">
                                {/* Liquid Fill */}
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percent}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className={cn("h-full relative", FACTION_COLORS[guildId] || 'bg-[#fbbf24]')}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                                </motion.div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Census Ticker (Paper Scroll style) */}
            <div className="mt-4 pt-3 border-t-2 border-[#fbbf24]/10 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1a1b26] px-2 text-[9px] text-[#fbbf24]/40 uppercase tracking-widest">
                    Recent Arrivals
                </div>
                <div className="h-12 overflow-hidden relative mask-linear-fade">
                    <AnimatePresence>
                        {recent.map((rec, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ delay: i * 0.2 }} // Stagger
                                className="text-[10px] text-[#fbbf24]/70 font-mono flex justify-between items-center py-0.5 border-b border-[#fbbf24]/5 last:border-0"
                            >
                                <span>{rec.name}</span>
                                <span className="opacity-50 text-[8px] uppercase">{rec.guild}</span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Background Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />
        </div>
    );
};
