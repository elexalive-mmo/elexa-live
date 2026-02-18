import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MMO_ROLES = {
    Tank: { id: 'Tank', icon: '🛡️', color: 'text-blue-400', desc: '30% Damage Reduction', effect: 'Mitigation' },
    Healer: { id: 'Healer', icon: '🌿', color: 'text-green-400', desc: '+1 HP Party Sustain', effect: 'Sustain' },
    DPS: { id: 'DPS', icon: '⚔️', color: 'text-red-400', desc: 'Double Crit Chance', effect: 'Burst' },
    Support: { id: 'Support', icon: '📜', color: 'text-purple-400', desc: '+20% XP for Party', effect: 'Insight' }
};

const WorldIntelView = ({ user, worldState, onAction }) => {
    const [switching, setSwitching] = useState(false);

    const currentRole = user?.mmoRole || 'Tank';
    const totalMints = worldState?.totalMints || 0;
    const urbanization = worldState?.urbanizationLevel || 0;
    const progressToNext = (totalMints % 10) * 10; // Every 10 mints = 100%

    const handleRoleSwitch = async (roleId) => {
        setSwitching(true);
        await onAction('switch_role', { role: roleId });
        setSwitching(false);
    };

    return (
        <div className="min-h-screen pb-24 pt-6 px-4 bg-slate-950 text-slate-100 overflow-y-auto">
            {/* Header: Regional tactical HUD */}
            <header className="mb-6 relative overflow-hidden p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl">
                <div className="absolute top-0 right-0 p-2 opacity-20 text-4xl">🌍</div>
                <h2 className="text-xs font-bold tracking-[0.2em] text-purple-400 uppercase mb-1">Regional Tactical Intel</h2>
                <h1 className="text-2xl font-black italic tracking-tight">{worldState?.region || 'Trench Lowlands'}</h1>
                <p className="text-xs text-slate-400 mt-1 max-w-[80%] italic">"Structures are evolving through economic stimulus."</p>

                <div className="mt-4 flex gap-3">
                    <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 flex items-center gap-2">
                        <span className="text-xs font-bold text-white/50">TIER</span>
                        <span className="text-xs font-black text-purple-300 uppercase underline decoration-purple-500/50">Village</span>
                    </div>
                    <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 flex items-center gap-2">
                        <span className="text-xs font-bold text-white/50">BUFF</span>
                        <span className="text-xs font-black text-green-400">+5% XP</span>
                    </div>
                </div>
            </header>

            {/* Economic Stimulus & Urbanization */}
            <section className="mb-6 p-4 rounded-2xl bg-black/40 border border-white/10">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Economic Stimulus</h3>
                        <p className="text-sm font-bold">Urbanization Lv. {urbanization}</p>
                    </div>
                    <span className="text-[10px] font-mono text-purple-400">{totalMints} Mints</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressToNext}%` }}
                        className="h-full bg-gradient-to-r from-purple-600 to-emerald-500"
                    />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 italic text-center">Structure height scales with Total Mints</p>
            </section>

            {/* Party Role Manager */}
            <section className="mb-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">MMO Party Role</h3>
                <div className="grid grid-cols-2 gap-3">
                    {Object.values(MMO_ROLES).map((role) => {
                        const isActive = currentRole === role.id;
                        return (
                            <motion.button
                                key={role.id}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => !isActive && handleRoleSwitch(role.id)}
                                disabled={switching}
                                className={`p-3 rounded-xl border flex flex-col items-start transition-all ${isActive
                                        ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/10'
                                        : 'bg-black/40 border-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl">{role.icon}</span>
                                    <span className={`text-xs font-black uppercase ${isActive ? 'text-purple-300' : 'text-slate-400'}`}>
                                        {role.id}
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-tight text-left">{role.desc}</p>
                                {isActive && (
                                    <div className="mt-2 w-full text-center py-0.5 bg-purple-500/30 rounded text-[9px] font-black tracking-tighter text-purple-200">
                                        ACTIVE
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </section>

            {/* Local Provenance Scroll */}
            <section className="p-4 rounded-2xl bg-black/40 border border-white/10 h-48 flex flex-col">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Local Provenance
                </h3>
                <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[10px]">
                    <div className="text-emerald-400/80">[SYSTEM] World growth logic initialized.</div>
                    <div className="text-slate-400">[WORLD] Trench Lowlands (Village) discovered.</div>
                    <div className="text-purple-400">[GROWTH] Urbanization Level {urbanization} reached.</div>
                    <div className="text-slate-500">[LOCAL] Awaiting on-chain launch...</div>
                </div>
            </section>
        </div>
    );
};

export default WorldIntelView;
