import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Award, Target, BarChart3, Flame, DollarSign, Lock, Check, Clock, Layers, Brain, Activity, Zap, ExternalLink, Sparkles, Users } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSolanaPrice } from '@/lib/hooks';
import { AGENT_COUNCIL } from '@/lib/constants';
import { cn } from '@/lib/utils';

export const InnerCircleView = ({ onExit, userStats }) => {
    const solana = useSolanaPrice();

    return (
        <div className="min-h-screen bg-[#050508] text-white p-8 font-mono">
            {/* Header */}
            <header className="flex items-center justify-between mb-16 relative z-50">
                <div className="flex items-center gap-6">
                    <button onClick={onExit} className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center hover:scale-105 transition-transform shadow-2xl shadow-purple-500/20 group">
                        <Crown className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black tracking-normal italic leading-none">
                            <span className="text-white tracking-[0.2em]">ELEXA.</span>
                            <span className="bg-gradient-to-r from-blue-400 to-emerald-500 bg-clip-text text-transparent uppercase text-3xl">RAID</span>
                        </h1>
                        <div className="flex gap-2 mt-2">
                            <Badge className="bg-blue-500/10 text-blue-300 text-[9px] font-black tracking-widest border border-blue-500/20">UPLINK_STABLE</Badge>
                            <Badge className="bg-emerald-500/10 text-emerald-300 text-[9px] font-black tracking-widest border border-emerald-500/20 italic">AUTHORIZED</Badge>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-black mb-1">Treasury_Sync</span>
                        <div className="bg-white/[0.02] border border-white/10 rounded-xl px-6 py-2 backdrop-blur-3xl">
                            <span className="font-black text-lg text-emerald-400 font-mono">${(solana.price * 12.5).toFixed(2)} USD</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-12 gap-10 relative z-10">
                {/* Left Column - Power Progression */}
                <div className="col-span-4 space-y-10">
                    <Card className="bg-white/[0.02] border-white/10 overflow-hidden relative group rounded-3xl">
                        <CardContent className="p-10 relative">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-black mb-1">Operator_Level</span>
                                    <span className="text-5xl font-black text-white italic tracking-tighter">{userStats.level}</span>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <span className="text-[10px] text-white/20 uppercase tracking-widest mb-1 font-mono">Rank</span>
                                    <span className="text-base font-black text-blue-400 uppercase tracking-tighter italic">{userStats.rank}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-[11px] font-mono">
                                    <span className="text-white/40 uppercase tracking-widest">Neural_Sync</span>
                                    <span className="text-blue-400 font-black">{((userStats.exp % 1000) / 10).toFixed(1)}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(userStats.exp % 1000) / 10}%` }}
                                        transition={{ duration: 1.5, ease: "circOut" }}
                                        className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-purple-500"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-6">
                        <PowerCard label="Active Synchrony" value="44 OPERATORS" desc="Live_Bridge" />
                        <PowerCard label="Neural Multiplier" value="1.618X" desc="Optimal_Flow" />
                    </div>

                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-8 italic">Available_Quests</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                        <Target size={18} className="text-blue-400" />
                                    </div>
                                    <span className="text-[11px] font-black uppercase text-white/80 font-mono tracking-tight">World Raid // Neon Citadel</span>
                                </div>
                                <span className="text-xs font-black text-emerald-400 italic">READY</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center Column - Network Council */}
                <div className="col-span-8 flex flex-col gap-10">
                    <Card className="bg-white/[0.01] border-white/10 p-10 rounded-[2.5rem] relative overflow-hidden">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                    <Users className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-[0.4em] text-white">Supreme Network Council</h3>
                            </div>
                            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-[10px] tracking-widest italic font-mono uppercase rounded-full px-4">Godbound_Entities</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {AGENT_COUNCIL.map((agent) => (
                                <motion.div
                                    key={agent.id}
                                    whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                                    className="p-6 rounded-[2rem] border border-white/5 bg-black/40 backdrop-blur-xl transition-all group cursor-pointer relative overflow-hidden"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center border border-white/10 group-hover:border-blue-500/40 transition-all">
                                                <span className="text-4xl">{agent.icon}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-3">
                                                <span className="text-base font-black text-white/90 uppercase italic">{agent.name}</span>
                                                <Badge className="bg-blue-500/10 text-blue-400 border-none text-[9px] h-5 rounded-full px-2">LVL {agent.level}</Badge>
                                            </div>
                                            <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono mt-1 font-bold">{agent.class}</span>
                                        </div>
                                    </div>
                                    <p className="mt-5 text-[10px] text-white/40 leading-relaxed font-mono uppercase italic tracking-wider line-clamp-2 border-t border-white/5 pt-4">
                                        {agent.power}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </Card>

                    <div className="flex gap-8 mt-auto">
                        <Button className="flex-1 h-16 bg-blue-600 text-white hover:bg-blue-500 font-black tracking-[0.2em] uppercase text-xl rounded-2xl shadow-2xl group transition-all">
                            <Zap size={24} className="mr-4 group-hover:scale-125 transition-transform" /> ACTIVATE RAID SYNC
                        </Button>
                        <div className="flex-[0.8] bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden flex flex-col justify-center">
                            <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                            <span className="text-[9px] text-blue-400 uppercase font-black tracking-[0.3em]">Raid Master Proclamation</span>
                            <p className="text-[10px] text-white/30 font-mono mt-2 leading-tight uppercase italic">The Supreme Council awaits your command. Every action reverberates through the system. Synchronize now.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Aesthetic */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
                <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.1),transparent_50%)]" />
            </div>
        </div>
    );
};

const PowerCard = ({ label, value, desc }) => (
    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-md relative group overflow-hidden">
        <span className="text-[9px] text-blue-400 uppercase tracking-[0.4em] font-black mb-2 block italic">{label}</span>
        <span className="text-3xl font-black text-white italic tracking-tighter block">{value}</span>
        <span className="text-[9px] text-emerald-400 font-bold uppercase font-mono mt-3 block tracking-widest">{desc}</span>
    </div>
);
