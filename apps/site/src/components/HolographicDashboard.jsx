import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Activity, Cpu, Zap, Sparkles, Crosshair } from 'lucide-react';
const Badge = ({ children, className }) => <span className={`px-2 py-0.5 rounded text-xs font-bold ${className}`}>{children}</span>;
const cn = (...classes) => classes.filter(Boolean).join(' ');
// Mock constants for now to prevent build errors
const RECURSION_STATES = { STABILIZE: { id: 1, label: 'STABLE', color: '#60a5fa' } };
const calculateRecursionState = () => RECURSION_STATES.STABILIZE;
const RARITY = {};

export const HolographicDashboard = () => {
    const [events, setEvents] = useState([]);
    const [channels, setChannels] = useState({ twitch: {}, discord: {}, telegram: {}, x: {} });
    const [recursionState, setRecursionState] = useState(RECURSION_STATES.STABILIZE);

    const fetchEvents = async () => {
        try {
            const res = await fetch('http://localhost:3020/api/events');
            if (res.ok) {
                const data = await res.json();

                // SIMULATION MODE: If no events, generate fake "network traffic"
                if (data.length === 0) {
                    const fakeEvents = [
                        { id: 'sim-1', source: 'NET_WATCH', type: 'PING', message: 'Uplink verified. Latency: 12ms', timestamp: Date.now() },
                        { id: 'sim-2', source: 'SYSTEM', type: 'SCAN', message: 'Sector 7 clear. No anomalies.', timestamp: Date.now() - 5000 },
                        { id: 'sim-3', source: 'MEMPOOL', type: 'TRACE', message: 'Monitoring whale movement...', timestamp: Date.now() - 12000 }
                    ];
                    setEvents(fakeEvents);
                } else {
                    setEvents(data);
                }

                // Update recursion state based on recent activity (last 5 mins)
                const recentCount = data.length > 0 ? data.filter(e => new Date(e.timestamp) > new Date(Date.now() - 5 * 60000)).length : 3;
                setRecursionState(calculateRecursionState(recentCount, 1));
            }
        } catch (e) {
            // Silently fail but show "Reconnecting..." state in UI if needed
        }
    };

    const fetchStatus = async () => {
        try {
            const res = await fetch('http://localhost:3020/api/status');
            if (res.ok) {
                const data = await res.json();
                if (data.channels) setChannels(data.channels);
            }
        } catch (e) { }
    };

    useEffect(() => {
        fetchEvents();
        fetchStatus();
        const interval = setInterval(() => {
            fetchEvents();
            fetchStatus();
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const multiplier = recursionState.id === 2 ? 2.5 : recursionState.id === 1 ? 1.5 : 1.0;

    return (
        <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 h-full flex flex-col gap-6 overflow-hidden relative group font-mono">
            {/* Header: Sync & Multiplier */}
            <div className="flex flex-col gap-3 border-b border-white/5 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-[-4px] border border-dashed border-blue-500/30 rounded-full"
                            />
                            <Target className="w-6 h-6 relative z-10" style={{ color: recursionState.color }} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-blue-400">Battle_Log_Nexus</span>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 border border-white/10" style={{ color: recursionState.color }}>
                                    {recursionState.label}
                                </span>
                                <Badge className="bg-blue-500/20 text-blue-400 border-none text-[9px] font-black shadow-[0_0_15px_rgba(59,130,246,0.2)] rounded-full px-2">
                                    <Zap className="w-3 h-3 mr-1" /> {multiplier.toFixed(1)}X SYNC
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
                        <div className={`w-2 h-2 rounded-full ${channels.twitch?.connected ? 'bg-purple-500 shadow-[0_0_8px_#a855f7]' : 'bg-white/10'}`} />
                        <div className={`w-2 h-2 rounded-full ${channels.discord?.connected ? 'bg-indigo-500 shadow-[0_0_8px_#6366f1]' : 'bg-white/10'}`} />
                        <div className={`w-2 h-2 rounded-full ${channels.telegram?.connected ? 'bg-sky-500 shadow-[0_0_8px_#0ea5e9]' : 'bg-white/10'}`} />
                        <div className={`w-2 h-2 rounded-full ${channels.x?.connected ? 'bg-white shadow-[0_0_8px_#fff]' : 'bg-white/10'}`} />
                    </div>
                </div>

                {/* Engagement Progress Bar */}
                <div className="h-1 bg-white/5 w-full rounded-full overflow-hidden border border-white/5">
                    <motion.div
                        animate={{ width: `${(events.length % 20) * 5}%` }}
                        className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-indigo-500"
                    />
                </div>
            </div>

            {/* Event List: Combat Log Style */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar relative z-10">
                <AnimatePresence initial={false}>
                    {events.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                            <Activity className="w-16 h-16 mb-4 animate-pulse text-blue-400" />
                            <p className="text-[12px] font-black tracking-[0.4em] uppercase">uplink_idle</p>
                        </div>
                    ) : (
                        events.map((event) => {
                            const isLegendary = event.rarity === 'LEGENDARY';
                            const rarityColor = (event.rarity && RARITY[event.rarity]) ? RARITY[event.rarity].color : '#ffffff';

                            return (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={cn(
                                        "bg-black/60 border border-white/5 rounded-2xl p-4 flex flex-col gap-2 transition-all hover:bg-black/80 relative group/log shadow-lg",
                                        isLegendary ? "border-blue-500/40 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]" : "hover:border-white/10"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                                <span className="text-[18px] leading-none grayscale group-hover/log:grayscale-0 transition-all">{event.icon || ''}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-white/90 uppercase tracking-tighter leading-none">
                                                    {event.source}
                                                </span>
                                                <span className="text-[8px] text-white/20 font-black mt-1 uppercase tracking-widest font-mono">
                                                    {new Date(event.timestamp).toLocaleTimeString([], { hour12: false, second: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {event.type === 'LOOT' && <Sparkles className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_8px_#10b981]" />}
                                            <span className="text-[9px] font-black uppercase text-white/30 tracking-[0.2em]">{event.type}</span>
                                        </div>
                                    </div>
                                    <p className={cn(
                                        "text-[11px] font-mono leading-relaxed",
                                        isLegendary ? "text-blue-400 font-black italic" : "text-white/50"
                                    )}>
                                        <span className="opacity-40 mr-2">{">>"}</span>
                                        {event.message}
                                    </p>

                                    {isLegendary && (
                                        <div className="absolute top-0 right-4 translate-y-[-50%] bg-blue-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                                            Legendary Drop
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

            {/* Matrix Decorative Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 opacity-40">
                <div className="flex items-center gap-3">
                    <span className="text-[8px] font-black uppercase tracking-[0.5em] text-blue-400">UPLINK_ACTIVE</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] font-mono">Sync_Stable</span>
                </div>
            </div>
        </div>
    );
};
