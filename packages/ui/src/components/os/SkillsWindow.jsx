import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Shield, Eye, Code, Globe, Twitter, MessageCircle, Wallet, TrendingUp, Sword, Anchor, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const SKILLS = [
    { id: 'grok', name: 'Grok-3 Logic', version: 'v3.0.1', icon: Brain, status: 'active', desc: 'Core reasoning engine.' },
    { id: 'solana', name: 'Solana Uplink', version: 'v1.4.2', icon: Wallet, status: 'active', desc: 'Wallet & RPC connection.' },
    { id: 'twitter', name: 'X Presence', version: 'v2.1.0', icon: Twitter, status: 'standby', desc: 'Social signal monitoring.' },
    { id: 'telegram', name: 'Tele-Soul', version: 'v3.4.0', icon: MessageCircle, status: 'active', desc: 'Primary user interface.' },
    { id: 'vision', name: 'Ocular Net', version: 'v1.1.5', icon: Eye, status: 'active', desc: 'Visual recognition.' },
    { id: 'security', name: 'Aegis Shield', version: 'v4.0.0', icon: Shield, status: 'active', desc: 'Threat detection.' },
    { id: 'web', name: 'Web Walker', version: 'v2.2.1', icon: Globe, status: 'active', desc: 'Internet traversal.' },
    { id: 'code', name: 'Code Synthesizer', version: 'v1.0.0', icon: Code, status: 'beta', desc: 'Self-modification.' },
];

export const SkillsWindow = () => {
    const [activeTab, setActiveTab] = useState('modules'); // 'modules' or 'progress'
    const [stats, setStats] = useState({ exp: 0, level: 0, rank: 'Observer', stats: { str: 0, con: 0, int: 0 } });

    const fetchStats = async () => {
        try {
            const res = await fetch('http://localhost:3020/api/user/justin');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (e) { }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    const nextLevelXP = [100, 300, 600, 1000, 2000, 5000, 10000, 25000, 50000, 100000][stats.level] || 100000;
    const progress = Math.min(100, (stats.exp / nextLevelXP) * 100);

    return (
        <div className="h-full flex flex-col bg-black/40 backdrop-blur-md relative overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/5 bg-white/[0.02]">
                <button
                    onClick={() => setActiveTab('modules')}
                    className={cn(
                        "flex-1 py-3 text-[10px] font-black tracking-widest uppercase transition-all",
                        activeTab === 'modules' ? "text-purple-400 border-b border-purple-500 bg-purple-500/5" : "text-white/30 hover:text-white/60"
                    )}
                >
                    System Modules
                </button>
                <button
                    onClick={() => setActiveTab('progress')}
                    className={cn(
                        "flex-1 py-3 text-[10px] font-black tracking-widest uppercase transition-all",
                        activeTab === 'progress' ? "text-purple-400 border-b border-purple-500 bg-purple-500/5" : "text-white/30 hover:text-white/60"
                    )}
                >
                    Operator Progress
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activeTab === 'modules' ? (
                    <div className="space-y-3">
                        {SKILLS.map((skill, i) => (
                            <motion.div
                                key={skill.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white/[0.03] border border-white/5 hover:border-purple-500/30 rounded-xl p-3 flex items-center gap-4 group transition-colors"
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center border transition-colors",
                                    skill.status === 'active' ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                                        skill.status === 'beta' ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" :
                                            "bg-white/5 border-white/10 text-white/40"
                                )}>
                                    <skill.icon size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-sm text-white/90">{skill.name}</h3>
                                        <span className="font-mono text-[9px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">{skill.version}</span>
                                    </div>
                                    <p className="text-[10px] text-white/50 truncate mt-0.5">{skill.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Level Card */}
                        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10 rounded-2xl p-4 relative overflow-hidden group">
                            <div className="relative z-10 flex items-center justify-between mb-4">
                                <div>
                                    <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">Operator Level</span>
                                    <h2 className="text-3xl font-black text-white italic">{stats.level}</h2>
                                    <Badge variant="outline" className="border-purple-500/50 text-purple-400 text-[10px] font-black uppercase tracking-tighter shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                                        {stats.rank}
                                    </Badge>
                                </div>
                                <Award size={48} className="text-white/5 group-hover:text-purple-500/20 transition-colors duration-500" />
                            </div>

                            {/* XP Bar */}
                            <div className="space-y-1.5 relative z-10">
                                <div className="flex justify-between text-[9px] font-mono text-white/40">
                                    <span>EXP: {stats.exp.toLocaleString()}</span>
                                    <span>NEXT: {nextLevelXP.toLocaleString()}</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                    />
                                </div>
                            </div>

                            {/* Decorative Background Icon */}
                            <TrendingUp size={120} className="absolute -bottom-8 -right-8 text-white/[0.02] transform rotate-12" />
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 gap-3">
                            <StatBar icon={<Sword size={14} />} label="Raider (STR)" value={stats.stats.str} color="#ef4444" desc="Stream Flow & Engagement" />
                            <StatBar icon={<Anchor size={14} />} label="Whale (CON)" value={stats.stats.con} color="#3b82f6" desc="System Stability & Value" />
                            <StatBar icon={<Code size={14} />} label="Dev (INT)" value={Math.floor(stats.stats.int)} color="#10b981" desc="Logic & Architecture" />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-white/5 bg-white/[0.02] flex justify-between items-center text-[10px] text-white/30 font-mono">
                <span>SYSTEM_V3.5.0</span>
                <span className="text-green-400">OPERATOR_SYNCED</span>
            </div>
        </div>
    );
};

const StatBar = ({ icon, label, value, color, desc }) => (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex flex-col gap-2 group hover:bg-white/[0.05] transition-all">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white/5 text-white/60 group-hover:text-white transition-colors">
                    {icon}
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white/80 uppercase tracking-tight">{label}</span>
                    <span className="text-[8px] text-white/30 font-mono">{desc}</span>
                </div>
            </div>
            <span className="text-sm font-black italic" style={{ color }}>{value}</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (value / 1000) * 100)}%` }}
                style={{ backgroundColor: color }}
                className="h-full shadow-[0_0_5px_rgba(255,255,255,0.2)]"
            />
        </div>
    </div>
);

