import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Shield, Zap, TrendingUp, Cpu } from 'lucide-react';

export const WalletConsole = ({ userStats }) => {
    const stats = [
        { label: 'SOL BALANCE', value: '4.20 ◎', icon: <Wallet size={14} />, color: 'text-emerald-400' },
        { label: 'EXP POOL', value: userStats?.totalExp || 0, icon: <Zap size={14} />, color: 'text-purple-400' },
        { label: 'FACTION RANK', value: userStats?.rank || 'Novice', icon: <Shield size={14} />, color: 'text-blue-400' },
        { label: 'NEXUS POWER', value: '88.5%', icon: <Cpu size={14} />, color: 'text-cyan-400' }
    ];

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-50 w-64"
        >
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-900/40 to-transparent p-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-white/50 tracking-[0.2em] uppercase">Wallet Terminal</span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="p-4 space-y-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="group cursor-help transition-all duration-300 hover:translate-x-1">
                            <div className="flex items-center gap-3 mb-1">
                                <div className={`${stat.color} opacity-60 group-hover:opacity-100 transition-opacity`}>
                                    {stat.icon}
                                </div>
                                <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{stat.label}</span>
                            </div>
                            <div className="text-sm font-mono font-bold text-white pl-6 group-hover:text-cyan-300 transition-colors">
                                {stat.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Status */}
                <div className="p-4 pt-0">
                    <div className="h-[1px] w-full bg-white/5 mb-3" />
                    <div className="flex justify-between items-center text-[8px] font-mono text-white/20 uppercase">
                        <span>Status: Connected</span>
                        <div className="flex items-center gap-1">
                            <TrendingUp size={8} />
                            <span>82ms</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
