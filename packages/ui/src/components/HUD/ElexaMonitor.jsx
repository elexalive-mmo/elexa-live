import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, TrendingUp, TrendingDown, Users, DollarSign, Globe } from 'lucide-react';

export const ElexaMonitor = ({ data }) => {
    // Default fallback data if API hasn't loaded
    const stats = data?.market_data || {
        price: 0.00000,
        mcap: 0,
        mcap: 0,
        trend: 'flat'
    };

    const economy = data?.economy || { treasury: { balanceSOL: '0.00' } };


    const user = data?.user || { exp: 0, level: 1 };

    // Formatters
    const fmtPrice = (p) => `$${p?.toFixed(5)}`;
    const fmtNum = (n) => {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return n;
    };

    return (
        <div className="w-40 h-24 bg-gray-900 rounded-lg border-2 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] overflow-hidden relative group">
            {/* Screen Content */}
            <div className="absolute inset-1 bg-black/90 rounded overflow-hidden flex flex-col p-1.5 font-mono">
                {/* Header */}
                <div className="flex items-center justify-between text-[8px] text-cyan-400 border-b border-cyan-900 pb-0.5 mb-1">
                    <span className="flex items-center gap-1">
                        <Globe size={8} /> LIVE_FEED
                    </span>
                    <span className="animate-pulse text-green-400">● ON-CHAIN</span>
                </div>

                {/* Animated Feed */}
                <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
                    {/* Price Ticker */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[9px] text-white">
                            <DollarSign size={8} className="text-yellow-400" />
                            <span>ELEXA</span>
                        </div>
                        <motion.div
                            key={stats.price} // Triggers animation on change
                            initial={{ opacity: 0.5, y: -2 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`text-[9px] font-bold ${stats.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}
                        >
                            {fmtPrice(stats.price)}
                        </motion.div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-1">
                        <StatBox label="MCAP" value={fmtNum(stats.mcap)} icon={<TrendingUp size={6} />} />
                        <StatBox label="LVL" value={user.level} icon={<Activity size={6} />} />
                        <StatBox label="TREASURY" value={`${economy.treasury?.balanceSOL || '0'} ◎`} icon={<DollarSign size={6} />} color="yellow" />
                    </div>

                    {/* Scrolling Ticker (Simulated 'News') */}
                    <div className="mt-auto whitespace-nowrap overflow-hidden relative w-full">
                        <motion.div
                            animate={{ x: ["100%", "-100%"] }}
                            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                            className="text-[7px] text-cyan-500/80"
                        >
                            WHALE TRACKER: ACTIVE  ///  RAID POWER: {fmtNum(user.exp)}  ///  NEXT TARGET: $10M MCAP
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* CRT Scanline Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>

            {/* Glitch Overlay (Random) */}
            <motion.div
                animate={{ opacity: [0, 0.05, 0], x: [0, 2, -2, 0] }}
                transition={{ repeat: Infinity, duration: 4, times: [0, 0.1, 1] }}
                className="absolute inset-0 bg-cyan-400/20 mix-blend-overlay pointer-events-none"
            />
        </div>
    );
};

const StatBox = ({ label, value, icon, color }) => (
    <div className={`bg-white/5 rounded px-1 py-0.5 flex flex-col ${color ? `text-${color}-400` : ''}`}>
        <span className="text-[6px] text-white/40 uppercase flex items-center gap-0.5">
            {icon} {label}
        </span>
        <span className="text-[8px] text-white font-bold">{value}</span>
    </div>
);
