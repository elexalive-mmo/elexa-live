import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Users, Shield, Zap, Skull, TrendingUp } from 'lucide-react';

const WorldMonitor = () => {
    const [data, setData] = useState(null);
    const [raw, setRaw] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('http://localhost:3020/api/world-state');
                const json = await res.json();
                if (json.structured) setData(json.structured);
                if (json.raw) setRaw(json.raw);
            } catch (e) {
                console.error("Failed to fetch world state", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 1000); // Fast poll for live sim feel
        return () => clearInterval(interval);
    }, []);

    // Simple parser for the raw markdown to extract new fields
    const getField = (regex) => {
        const match = raw.match(regex);
        return match ? match[1] : '---';
    };

    const population = getField(/Population\*\*: (\d+)/);
    const deaths = getField(/Deaths\*\*: (\d+)/);
    const faith = getField(/Dominant Faith\*\*: (.+)/);
    const price = getField(/Price\*\*: \$(.+)/);
    const lastEvent = getField(/LATEST EVENT\n> \*\*(.+)\*\*/);

    if (loading) return null;

    return (
        <div className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors duration-500" />

            {/* Header */}
            <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                        <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-widest uppercase">World Monitor</h2>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs text-blue-300 font-mono">LIVE FEED CONNECTED</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Token Price</p>
                    <p className="text-2xl font-black text-white font-mono">${price}</p>
                </div>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 relative z-10">
                <StatBox label="Population" value={population} icon={Users} color="text-indigo-400" />
                <StatBox label="Graveyard" value={deaths} icon={Skull} color="text-red-400" />
                <StatBox label="Dominant Faith" value={faith} icon={Zap} color="text-yellow-400" />
                <StatBox label="Active Guilds" value={countGuilds(raw)} icon={Shield} color="text-emerald-400" />
            </div>

            {/* Event Log */}
            <div className="relative z-10 bg-black/50 border border-white/5 rounded-xl p-4 font-mono text-sm min-h-[80px] flex flex-col justify-center">
                <p className="text-[10px] text-blue-500 mb-1 uppercase tracking-widest">Latest Network Event</p>
                <AnimatePresence mode='wait'>
                    <motion.p
                        key={lastEvent}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="text-white font-bold leading-tight"
                    >
                        {lastEvent}
                    </motion.p>
                </AnimatePresence>
            </div>

            {/* Scanned Guilds List */}
            <div className="mt-4 relative z-10">
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-tight">Active Guilds</p>
                <div className="flex flex-wrap gap-2">
                    {parseGuilds(raw).map((g, i) => (
                        <motion.span
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-300 flex items-center gap-1"
                        >
                            <Shield className="w-3 h-3 text-white/20" />
                            {g}
                        </motion.span>
                    ))}
                    {parseGuilds(raw).length === 0 && <span className="text-xs text-gray-600 italic">No guilds established...</span>}
                </div>
            </div>
        </div>
    );
};

// Helpers
const StatBox = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col items-start hover:bg-white/10 transition-colors">
        <Icon className={`w-4 h-4 ${color} mb-2`} />
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</span>
        <span className="text-lg font-bold text-white font-mono">{value}</span>
    </div>
);

const countGuilds = (text) => {
    return (text.match(/- \*\*/g) || []).length;
};

const parseGuilds = (text) => {
    const matches = text.match(/- \*\*(.+?)\*\* \[(.+?)\]/g);
    if (!matches) return [];
    return matches.map(m => m.replace('- **', '').replace('**', '')); // Clean up
};

export default WorldMonitor;
