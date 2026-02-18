import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, Shield, Activity, Zap, Star, Sparkles, Sword, Skull } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ElexaContext } from '@/App';

const API_BASE = 'http://localhost:3020';

export const PartyWindow = () => {
    const { userStats, partyState, raidState, handleAction } = useContext(ElexaContext);
    const [isCreating, setIsCreating] = useState(false);
    const [partyName, setPartyName] = useState('');
    const [joinId, setJoinId] = useState('');

    const createParty = async () => {
        if (!partyName) return;
        try {
            await fetch(`${API_BASE}/api/party/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userStats.username, name: partyName })
            });
            setIsCreating(false);
        } catch (e) {
            console.error(e);
        }
    };

    const joinParty = async () => {
        if (!joinId) return;
        try {
            await fetch(`${API_BASE}/api/party/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userStats.username, partyId: joinId })
            });
            setJoinId('');
        } catch (e) {
            console.error(e);
        }
    };

    const leaveParty = async () => {
        try {
            await fetch(`${API_BASE}/api/party/leave`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userStats.username })
            });
        } catch (e) {
            console.error(e);
        }
    };

    const setRole = async (role) => {
        try {
            await fetch(`${API_BASE}/api/party/role`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userStats.username, role })
            });
        } catch (e) {
            console.error(e);
        }
    };

    // Derived State
    const hasParty = partyState && partyState.id && !partyState.id.startsWith('solo_');
    const members = partyState?.members || [];
    const isFullSquad = members.length === 4;
    const synergyBonus = isFullSquad ? 1.5 : 1.0; // Simplified client-side check

    return (
        <div className="flex flex-col h-full bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 font-sans relative overflow-hidden">
            {/* GRID OVERLAY */}
            <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />

            {/* HEADER */}
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-3 relative z-10">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <h3 className="font-black text-[11px] uppercase tracking-[0.3em] text-blue-400">
                        {hasParty ? partyState.name : 'SQUAD_SYNCHRONIZATION'}
                    </h3>
                </div>
                {hasParty && (
                    <Badge className={cn(
                        "text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full backdrop-blur-xl border",
                        isFullSquad ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    )}>
                        {isFullSquad ? 'SYNERGY ACTIVE (1.5x)' : 'SYNC_STABLE'}
                    </Badge>
                )}
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10 space-y-4">
                {!hasParty ? (
                    <div className="flex flex-col gap-4 text-center items-center justify-center h-full text-white/40">
                        <Users className="w-12 h-12 opacity-20 mb-2" />
                        <p className="text-[10px] uppercase tracking-widest">No Active Neural Link</p>

                        <div className="flex flex-col gap-2 w-full">
                            {isCreating ? (
                                <div className="flex gap-2">
                                    <input
                                        className="bg-black/50 border border-white/20 rounded px-2 py-1 text-xs w-full text-white"
                                        placeholder="Squad Name..."
                                        value={partyName}
                                        onChange={e => setPartyName(e.target.value)}
                                    />
                                    <button onClick={createParty} className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 text-[10px] font-bold px-3 rounded uppercase">Confirm</button>
                                </div>
                            ) : (
                                <button onClick={() => setIsCreating(true)} className="bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 text-blue-400 text-[10px] font-black py-2 rounded uppercase tracking-widest w-full transition-all">
                                    Initialize Squad
                                </button>
                            )}

                            <div className="flex gap-2">
                                <input
                                    className="bg-black/50 border border-white/20 rounded px-2 py-1 text-xs w-full text-white"
                                    placeholder="Enter Neural ID (Party ID)..."
                                    value={joinId}
                                    onChange={e => setJoinId(e.target.value)}
                                />
                                <button onClick={joinParty} className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 text-[10px] font-bold px-3 rounded uppercase">Join</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ROLES INFO ALERT */}
                        <div className="bg-blue-900/20 border border-blue-500/20 p-2 rounded text-[9px] text-blue-200/80 mb-2">
                            Select a unique role for full synergy bonus.
                        </div>

                        {members.map((memberId, i) => {
                            const isMe = memberId === userStats.username?.toLowerCase();
                            const role = partyState.roles?.[memberId] || 'Vanguard';

                            // Determine Icon/Color based on Role
                            let roleIcon = <Sword className="w-4 h-4 text-red-400" />;
                            let roleColor = 'text-red-400';
                            if (role === 'Bulwark') { roleIcon = <Shield className="w-4 h-4 text-blue-400" />; roleColor = 'text-blue-400'; }
                            if (role === 'Guardian') { roleIcon = <Activity className="w-4 h-4 text-emerald-400" />; roleColor = 'text-emerald-400'; }
                            if (role === 'Scout') { roleIcon = <Zap className="w-4 h-4 text-yellow-400" />; roleColor = 'text-yellow-400'; }

                            // You can add logic here to fetch full user details if available, 
                            // but for now we use ID/Role from party state.

                            return (
                                <motion.div
                                    key={memberId}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white/5 border border-white/5 rounded-xl p-3 hover:border-white/10 transition-colors group relative"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center border border-white/10 group-hover:border-white/20 relative overflow-hidden">
                                                {memberId === partyState.leader && (
                                                    <Crown className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 z-10" />
                                                )}
                                                {roleIcon}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("text-xs font-bold uppercase", isMe ? "text-white" : "text-white/60")}>
                                                        {memberId}
                                                    </span>
                                                    {isMe && <Badge className="text-[8px] bg-white/10 px-1 py-0 h-4">YOU</Badge>}
                                                </div>
                                                <div className="flex gap-2 mt-1">
                                                    {isMe ? (
                                                        <select
                                                            value={role}
                                                            onChange={(e) => setRole(e.target.value)}
                                                            className="bg-black/40 border border-white/10 rounded text-[9px] text-white/50 uppercase outline-none focus:border-blue-500/50"
                                                        >
                                                            <option value="Vanguard">Vanguard</option>
                                                            <option value="Bulwark">Bulwark</option>
                                                            <option value="Guardian">Guardian</option>
                                                            <option value="Scout">Scout</option>
                                                        </select>
                                                    ) : (
                                                        <span className={cn("text-[9px] uppercase tracking-wide", roleColor)}>{role}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        <button onClick={leaveParty} className="mt-4 text-[9px] text-red-400/60 hover:text-red-400 uppercase tracking-widest w-full text-center py-2 border-t border-white/5">
                            Sever Connection
                        </button>
                    </>
                )}

                {/* RAID SECTION */}
                {raidState && raidState.active && (
                    <div className="mt-6 pt-6 border-t border-white/10 relative">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-rose-400">
                                <Skull className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Active Operation</span>
                            </div>
                            <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-[8px]">LIVE</Badge>
                        </div>

                        <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-3 relative overflow-hidden">
                            <h4 className="text-xs font-bold text-rose-200 uppercase mb-1">{raidState.target}</h4>
                            <p className="text-[9px] text-rose-200/60 mb-3 block truncate">{raidState.link}</p>

                            <div className="flex justify-between text-[9px] font-mono text-rose-400 mb-1">
                                <span>PROGRESS</span>
                                <span>{Math.floor((raidState.current / raidState.goal) * 100)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mb-3">
                                <motion.div
                                    className="h-full bg-rose-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(raidState.current / raidState.goal) * 100}%` }}
                                />
                            </div>

                            <button
                                onClick={() => {
                                    window.open(raidState.link, '_blank');
                                    // Assuming they return to confirm
                                    fetch(`${API_BASE}/api/raid/report`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ userId: userStats.username })
                                    });
                                }}
                                className="w-full bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black py-2 rounded uppercase tracking-widest transition-colors"
                            >
                                Engage Target & Report
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* FOOTER */}
            <div className="mt-4 pt-4 border-t border-white/5 relative z-10">
                <div className="flex items-center justify-between text-[9px] font-black uppercase text-white/30 tracking-[0.3em]">
                    <span>Neural_Throughput</span>
                    <span className={cn("transition-colors", isFullSquad ? "text-purple-400" : "text-blue-400")}>
                        {isFullSquad ? '+1.50X SYNC' : '+1.00X SYNC'}
                    </span>
                </div>
            </div>
        </div>
    );
};
