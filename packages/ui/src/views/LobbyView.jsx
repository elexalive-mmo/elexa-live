import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Map as MapIcon, Shield, Zap, MessageSquare, LogOut, Activity } from 'lucide-react';
import { ElexaContext } from '../App';

/**
 * LobbyView — The Living Room / Home Base
 * Inspired by Dragon Age Origins and the provided Aetheric Concept.
 */
export const LobbyView = ({ user }) => {
    const { handleAction } = useContext(ElexaContext);
    const [members, setMembers] = useState([]);
    const [activeTab, setActiveTab] = useState('map'); // map, chat, strategy

    // Poll Party Status
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const partyId = user.partyId || 'alpha_league';
                const res = await fetch(`http://localhost:3020/api/party/${partyId}/members`);
                const data = await res.json();
                if (data.success) {
                    setMembers(data.members);
                }
            } catch (e) {
                console.warn('[Lobby] Member sync failed');
            }
        };

        // Set initial location
        fetch('http://localhost:3020/api/user/presence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.username, location: 'lobby', status: 'relaxing' })
        });

        fetchMembers();
        const interval = setInterval(fetchMembers, 5000);
        return () => clearInterval(interval);
    }, [user.partyId, user.username]);

    return (
        <div className="fixed inset-0 bg-[#050508] text-white font-serif overflow-hidden">
            {/* Background: Atmospheric Video Overlay */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-50"
                >
                    <source src="/assets/videos/tavernanimation.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/40 to-black/80" />
            </div>

            {/* Dragon Age Style Party Sidebar (Left) */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 space-y-4">
                <div className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-6 rotate-[-90deg] origin-left translate-x-4">Consensus Group</div>
                {members.map((member, idx) => (
                    <motion.div
                        key={member.id}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`relative w-16 h-16 rounded-full border-2 ${member.presence?.status === 'online' ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'border-white/10'} bg-black/60 group cursor-pointer overflow-hidden p-[2px]`}
                    >
                        <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-neutral-800 to-black flex items-center justify-center">
                            <Users className="w-6 h-6 text-white/20" />
                        </div>
                        {/* Member Tooltip/Vitals */}
                        <div className="absolute left-20 top-0 hidden group-hover:block bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl w-48 shadow-2xl pointer-events-none">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-black tracking-widest">{member.username}</span>
                                <span className="text-[10px] text-purple-400 font-mono">LVL {member.level}</span>
                            </div>
                            <div className="text-[9px] text-white/40 uppercase tracking-widest mb-2">{member.mmoRole || 'Citizen'}</div>
                            <div className="space-y-1">
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[80%]" />
                                </div>
                                <div className="flex justify-between text-[8px] text-white/20">
                                    <span>VITALITY</span>
                                    <span>80%</span>
                                </div>
                            </div>
                            {member.inventory?.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-white/5">
                                    <div className="text-[8px] text-white/20 mb-1">RECENT LOOT</div>
                                    <div className="flex gap-1">
                                        {member.inventory.map((item, i) => (
                                            <div key={i} className="w-6 h-6 bg-white/5 rounded-md border border-white/5 flex items-center justify-center text-[10px]" title={item.name}>
                                                💎
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Central Holographic Map Table */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-[800px] h-[400px]">
                    {/* Table Base Shadow */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[100px] bg-purple-500/10 blur-[60px] rounded-full" />

                    {/* Hologram Animation */}
                    <motion.div
                        animate={{
                            y: [0, -10, 0],
                            opacity: [0.7, 0.9, 0.7]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="relative z-10 w-full h-full flex items-center justify-center"
                    >
                        <div className="relative">
                            {/* Map Glow */}
                            <div className="absolute inset-0 bg-cyan-400/20 blur-[100px] animate-pulse" />
                            <img
                                src="/assets/branding/consensus_map_hologram.png"
                                alt="Consensus Map"
                                className="w-full h-auto opacity-80 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)] pointer-events-auto"
                            />

                            {/* Scanning Line */}
                            <motion.div
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-[2px] bg-cyan-400/40 shadow-[0_0_10px_cyan] pointer-events-none"
                            />

                            {/* Ping Points */}
                            <div className="absolute top-[40%] left-[30%] w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_purple] animate-ping" />
                            <div className="absolute top-[60%] left-[70%] w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_10px_amber] animate-ping" />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Bottom HUD: Commands & Communication */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-8 flex justify-between items-end">
                {/* Left: Party Stats Summary */}
                <div className="flex gap-8">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-3xl min-w-[160px]">
                        <div className="flex items-center gap-2 mb-2 text-purple-400">
                            <Activity className="w-4 h-4" />
                            <span className="text-[10px] font-black tracking-widest uppercase">Global Consensus</span>
                        </div>
                        <div className="text-2xl font-black">1.4B SOL</div>
                        <div className="text-[9px] text-white/30 uppercase mt-1 tracking-tighter">Volume Injected Since Epoch</div>
                    </div>
                </div>

                {/* Center: Command Wheel / Quick Actions */}
                <div className="flex gap-4">
                    <button className="w-14 h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center transition-all group active:scale-95">
                        <MessageSquare className="w-6 h-6 text-white/40 group-hover:text-purple-400 transition-colors" />
                    </button>
                    <button className="w-14 h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center transition-all group active:scale-95">
                        <MapIcon className="w-6 h-6 text-white/40 group-hover:text-cyan-400 transition-colors" />
                    </button>
                    <button
                        onClick={() => window.location.hash = 'wild'} // Placeholder for transitioning back to combat
                        className="px-8 h-14 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 rounded-2xl flex items-center gap-3 shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all active:scale-95"
                    >
                        <Zap className="w-5 h-5 fill-white" />
                        <span className="text-sm font-black tracking-widest uppercase">To The Wild</span>
                    </button>
                </div>

                {/* Right: Room Controls */}
                <div className="flex gap-4">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-3xl text-right">
                        <div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Presence</div>
                        <div className="flex items-center gap-2 justify-end">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_green]" />
                            <span className="text-xs font-mono">{members.length} ONLINE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlays / Branded Elements */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
                <img
                    src="/assets/branding/elexa_live_logo_raw.png"
                    alt="ELEXA LIVE"
                    className="w-48 h-auto object-contain drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                />
                <div className="mt-2 text-[10px] uppercase tracking-[1em] text-white/20 font-light">The Master Command</div>
            </div>
        </div>
    );
};
