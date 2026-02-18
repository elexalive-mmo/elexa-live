import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Crown, ArrowRight, MessageSquare, Star, Users, Zap, Shield, Heart, Activity, Sparkles, Gavel } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NeuralCommandBar } from '@/components/HUD/NeuralCommandBar';
import { NeuralCommandCenter } from '@/components/HUD/NeuralCommandCenter';
import { HolographicDashboard } from '@/components/HUD/HolographicDashboard';
import { CouncilGallery } from '@/components/OS/CouncilGallery';
import { useSolanaPrice } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { LEVEL_THRESHOLDS, getLevelFromXP } from '@/lib/echeron';

export const RoomView = ({ onExit, onEnterCircle, ledger }) => {
    const solana = useSolanaPrice();
    const [isCouncilMode, setIsCouncilMode] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        { id: 1, user: 'CryptoKing', text: 'This system is incredible.', color: '#ef4444' },
        { id: 2, user: 'Elexa.Guide', text: 'Welcome to the inner sanctum.', color: '#facc15' },
        { id: 3, user: 'BuilderAnon', text: 'When staking rewards?', color: '#60a5fa' },
        { id: 4, user: 'Elexa.Scout', text: 'New alpha detected in sector 7.', color: '#fb923c' },
    ]);
    const [newMessage, setNewMessage] = useState('');

    const sendMessage = () => {
        if (!newMessage.trim()) return;
        setChatMessages(prev => [...prev, { id: prev.length + 1, user: 'Jefe.Operator', text: newMessage, color: '#a855f7' }]);
        setNewMessage('');
    };

    // XP Progress Calculation
    const userXP = ledger?.exp || 0;
    const userLevel = getLevelFromXP(userXP);
    const nextLevelXP = LEVEL_THRESHOLDS[userLevel + 1] || (LEVEL_THRESHOLDS[userLevel] * 2);
    const currentLevelXP = LEVEL_THRESHOLDS[userLevel] || 0;
    const progressXP = userXP - currentLevelXP;
    const progressTarget = nextLevelXP - currentLevelXP;
    const progressPct = Math.min(100, (progressXP / progressTarget) * 100);

    // Mock Party Data
    const partyMembers = [
        { name: 'Justin.Operator', role: 'Operator', lvl: userLevel, hp: 100, mp: 85, color: '#a855f7', primary: true },
        { name: 'Elexa.Prime', role: 'Support', lvl: 12, hp: 80, mp: 99, color: '#14f195' },
        { name: 'Neural.Scout', role: 'Raider', lvl: 5, hp: 45, mp: 30, color: '#facc15' }
    ];

    return (
        <div
            className="min-h-screen bg-[#050508] text-white flex flex-col font-mono overflow-hidden relative bg-cover bg-center"
            style={{ backgroundImage: "url('/assets/backgrounds/insidetavern.png')" }}
        >
            <div className="absolute inset-0 bg-black/70 pointer-events-none" /> {/* Tavern Atmosphere Dimmer */}
            {/* Top Bar */}
            <header className="flex items-center justify-between p-4 border-b border-white/10 bg-black/40 backdrop-blur-xl relative z-50">
                <div className="flex items-center gap-4">
                    <button onClick={onExit} className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center hover:scale-105 transition-transform shadow-2xl shadow-purple-500/20 group">
                        <Crown className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black tracking-normal italic leading-none">
                            <span className="text-white tracking-[0.2em]">ELEXA.</span>
                            <span className="bg-gradient-to-r from-blue-400 to-emerald-500 bg-clip-text text-transparent uppercase">LIVE</span>
                        </h1>
                        <div className="flex gap-2 mt-1">
                            <Badge className="bg-blue-500/10 text-blue-300 text-[8px] font-black tracking-widest border border-blue-500/20 font-mono">UPLINK_STABLE</Badge>
                            <Badge className="bg-emerald-500/10 text-emerald-300 text-[8px] font-black tracking-widest border border-emerald-500/20 font-mono italic">v3.5.0-PRO</Badge>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] text-white/40 uppercase tracking-[0.3em] font-black">Market Sync</span>
                        <div className="flex items-center gap-2 text-xs bg-black/60 px-3 py-1 rounded-lg border border-white/10">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="font-bold text-white/90">${solana.price.toFixed(2)}</span>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-white/20 hover:text-white hover:bg-white/5">
                        <Bell className="w-4 h-4" />
                    </Button>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-12 gap-4 p-4 min-h-0 relative">
                {/* Left Sidebar - Party Hub */}
                <div className="col-span-3 flex flex-col gap-4 overflow-hidden">
                    <Card className="bg-white/[0.02] border-white/10 rounded-2xl overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-2">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-blue-400" />
                                    <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-white/60">Active Squad</h3>
                                </div>
                                <span className="text-[8px] text-emerald-400 font-bold tracking-widest">3 SYNCED</span>
                            </div>

                            <div className="space-y-6">
                                {partyMembers.map((member, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                                    {member.role === 'Operator' ? <Crown className="w-5 h-5 text-purple-400" /> : <Shield className="w-5 h-5 text-emerald-400" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-white/90 uppercase">{member.name}</span>
                                                    <span className="text-[9px] text-white/30 uppercase tracking-widest">{member.role}</span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-black text-purple-400 italic">LVL {member.lvl}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1 px-1">
                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${member.hp}%` }} className="h-full bg-emerald-500" />
                                            </div>
                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${member.mp}%` }} className="h-full bg-blue-500" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex-1 min-h-0">
                        <HolographicDashboard />
                    </div>
                </div>

                {/* Main Content - Neurologic stream */}
                <div className="col-span-6 flex flex-col gap-4">
                    <div className="aspect-video bg-black rounded-2xl border border-white/10 relative overflow-hidden group shadow-2xl">
                        <iframe
                            src="https://player.twitch.tv/?channel=elexalive&parent=localhost&parent=127.0.0.1"
                            className="absolute inset-0 w-full h-full z-10 opacity-90 group-hover:opacity-100 transition-opacity"
                            allowFullScreen
                        />
                        <div className="absolute top-4 left-4 z-20 flex gap-2">
                            <Badge className="bg-red-500 text-white font-black tracking-widest text-[10px] border-none px-2 py-1 rounded-lg">🔴 LIVE</Badge>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 bg-black/40 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-3xl shadow-3xl">
                        <AnimatePresence mode="wait">
                            {isCouncilMode ? (
                                <motion.div
                                    key="council"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.02 }}
                                    className="w-full h-full"
                                >
                                    <CouncilGallery onManifest={(sub) => {
                                        setChatMessages(prev => [...prev, {
                                            id: Date.now(),
                                            user: 'System.Council',
                                            text: `DIVINE MANIFESTATION: ${sub.elexamonName} has been woven.`,
                                            color: '#facc15'
                                        }]);
                                    }} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="command"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.02 }}
                                    className="w-full h-full"
                                >
                                    <NeuralCommandCenter exp={ledger?.exp || 0} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Sidebar - Chat */}
                <div className="col-span-3 flex flex-col gap-4 overflow-hidden">
                    <Card className="bg-blue-600/5 border-white/10 backdrop-blur-md">
                        <CardContent className="p-4">
                            <h3 className="font-black flex items-center gap-2 text-[10px] text-amber-500 uppercase tracking-[0.2em]">
                                <Gavel className="w-4 h-4" /> Consensus Session
                            </h3>
                            <Button
                                onClick={() => setIsCouncilMode(!isCouncilMode)}
                                className={cn(
                                    "w-full mt-4 text-[9px] font-black tracking-widest h-8 border rounded-lg group transition-all",
                                    isCouncilMode
                                        ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                                        : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"
                                )}
                            >
                                {isCouncilMode ? 'EXIT COUNCIL' : 'COMMENCE REVIEW'} <Sparkles className="w-3 h-3 ml-2 group-hover:rotate-12 transition-transform" />
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-600/5 border-white/10 backdrop-blur-md">
                        <CardContent className="p-4">
                            <h3 className="font-black flex items-center gap-2 text-[10px] text-amber-500 uppercase tracking-[0.2em]">
                                <Crown className="w-4 h-4" /> World Hub
                            </h3>
                            <Button onClick={onEnterCircle} className="w-full mt-4 bg-amber-900/20 hover:bg-amber-900/40 text-amber-100 text-[9px] font-black tracking-widest h-8 border border-amber-500/30 rounded-lg group transition-all">
                                ENTER LIBRARY <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="flex-1 bg-white/[0.02] rounded-2xl p-6 border border-white/10 flex flex-col min-h-0 backdrop-blur-3xl relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-3">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="w-4 h-4 text-blue-400" />
                                <span className="font-black text-[11px] tracking-[0.3em] uppercase text-white/60">System_Log</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 font-mono text-[11px] pr-2 custom-scrollbar">
                            {chatMessages.map(msg => (
                                <div key={msg.id} className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span style={{ color: msg.color || '#60a5fa' }} className="font-black italic text-[10px] uppercase">{msg.user}</span>
                                        <span className="text-[8px] text-white/10">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <span className="text-white/60 leading-relaxed bg-white/[0.03] p-2 rounded-lg border border-white/5 block">{msg.text}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 relative group">
                            <input
                                type="text"
                                placeholder="SEND_SIGNAL..."
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white placeholder:text-white/20 focus:border-blue-500/30 outline-none transition-all font-mono tracking-widest uppercase italic"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            />
                            <Zap className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/10 group-hover:text-blue-500/40 transition-colors" />
                        </div>
                    </div>
                </div>
            </div>

            {/* INTEGRATED COMMAND BAR */}
            <div className="pb-8 pt-4 px-4 bg-black/20 backdrop-blur-md">
                <NeuralCommandBar onAction={ledger.submitAction} userExp={ledger.exp} />
            </div>
        </div>
    );
};
