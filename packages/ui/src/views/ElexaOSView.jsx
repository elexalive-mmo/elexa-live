import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// HUD Components
import SpectralActionBar from '../components/HUD/SpectralActionBar';
import { PartyWindow } from '../components/OS/PartyWindow';
import MarketChart from '../components/HUD/MarketChart';
import WorldMapV2 from '../components/HUD/WorldMapV2';
import NeuralCommandNexus from '../components/HUD/NeuralCommandNexus';
import { useGameState } from '../hooks/useGameState';
import AudioManager from '../components/HUD/AudioManager';
import SpriteTheater from '../components/HUD/SpriteTheater';
import GoldenTankardView from './GoldenTankardView';
import NexusView from './NexusView';
import { VideoOverlay } from '../components/OS/VideoOverlay';
import BestiaryView from './BestiaryView';
import { ElexaContext } from '../App';
import { Shield, Zap, Activity, Cpu, Sparkles, Moon } from 'lucide-react';

export const ElexaOSView = () => {
    const { state, events, isLive, send } = useGameState();
    const { userStats, partyState } = useContext(ElexaContext);
    const [currentView, setCurrentView] = useState('tavern');

    const handleAction = async (skillId, cost, payload) => {
        await send(skillId, cost || 0, payload || {});
    };

    const recentEvents = events.slice(-8).reverse();

    return (
        <div className="relative w-full h-full bg-[#020205] overflow-hidden text-white font-body">
            {/* Celestial Aether Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-aether" />
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.05] bg-[url('/assets/grain.png')] mix-blend-overlay" />

            <VideoOverlay events={events} />
            <AudioManager />

            {/* Celestial Logo & Sanctuary Status */}
            <div className="absolute top-4 right-8 z-50 flex items-center gap-8">
                <div className="text-right">
                    <h1 className="fantasy-title text-3xl leading-none tracking-wider">
                        ELEXA LIVE
                    </h1>
                    <div className="flex items-center justify-end gap-2 text-celestial-gold/30 mt-1">
                        <div className="h-[1px] w-12 bg-gradient-to-l from-celestial-gold/40 to-transparent" />
                        <span className="text-[8px] uppercase tracking-[0.4em] font-bold">Resonance of the Stars</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-2.5 bg-black/60 border border-celestial-gold/10 rounded-full backdrop-blur-2xl shadow-2xl">
                    <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-celestial-gold shadow-[0_0_10px_rgba(250,204,21,0.6)]' : 'bg-red-900/60'} animate-pulse`} />
                    <span className="text-[10px] text-white/50 font-bold tracking-[0.2em] uppercase font-heading">{isLive ? 'SANCTUARY OPEN' : 'GATES SEALED'}</span>
                </div>
            </div>

            {/* Neural Command Nexus (Unified HUD) */}
            <NeuralCommandNexus
                user={userStats}
                onAction={(action) => {
                    if (action.type === 'COMMAND') handleAction(action.value);
                    if (action.type === 'TAP') handleAction('tap');
                    if (action.type === 'QUICK') handleAction(action.action);
                }}
            />

            {/* The Great Tapestry (Main UI) */}
            <div className="relative z-10 grid grid-cols-12 grid-rows-12 h-screen pt-24 pb-32 px-10 gap-8">

                {/* Left Wing: Party & Identity */}
                <div className="col-span-3 row-span-8 flex flex-col gap-8">
                    <PartyWindow />

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-black/30 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-2xl"
                    >
                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                            <span className="text-[11px] text-celestial-gold font-bold tracking-[0.2em] uppercase font-heading flex items-center gap-2">
                                <Sparkles size={12} className="text-aetheric-purple" />
                                Soul Essence
                            </span>
                            <Moon size={12} className="text-white/10" />
                        </div>

                        {/* User Progression */}
                        <div className="space-y-3">
                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-[0.1em] font-heading">
                                <span className="text-white/80">Level {userStats?.level || 1}</span>
                                <span className="text-celestial-gold/60 italic">{userStats?.rank || 'Wanderer'}</span>
                            </div>
                            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${userStats?.progress || 0}%` }}
                                    className="h-full bg-gradient-to-r from-aetheric-purple to-celestial-gold shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                                />
                            </div>
                        </div>

                        {/* Treasury & Conviction */}
                        <div className="grid grid-cols-1 gap-4 mt-2">
                            <div className="p-5 bg-white/2 border border-white/5 rounded-3xl group hover:border-aetheric-purple/30 transition-all duration-500">
                                <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1">Conviction (EXP)</div>
                                <div className="text-3xl font-bold text-white group-hover:text-aetheric-purple transition-colors font-heading tracking-tight">{userStats?.exp?.toLocaleString() || 0}</div>
                            </div>
                            <div className="p-5 bg-white/2 border border-white/5 rounded-3xl group hover:border-celestial-gold/30 transition-all duration-500">
                                <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1">Faction Renown</div>
                                <div className="text-3xl font-bold text-white group-hover:text-celestial-gold transition-colors font-heading tracking-tight">{userStats?.cred?.toLocaleString() || 0}</div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Heart: The Metaverse Gateway */}
                <div className="col-span-6 row-span-8 relative">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl rounded-[4rem] border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
                        {/* Interior Glows */}
                        <div className="absolute -top-40 -left-40 w-96 h-96 bg-aetheric-purple/5 blur-[120px] rounded-full" />
                        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-celestial-gold/5 blur-[120px] rounded-full" />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentView}
                                initial={{ opacity: 0, scale: 0.99 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.01 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="w-full h-full"
                            >
                                {currentView === 'tavern' && (
                                    <GoldenTankardView
                                        user={userStats}
                                        onNavigate={(id) => {
                                            if (id === 'world_map') setCurrentView('map');
                                            else if (id === 'nexus') setCurrentView('nexus');
                                            else if (id === 'pack_hall') setCurrentView('bestiary');
                                            else handleAction(id);
                                        }}
                                    />
                                )}
                                {currentView === 'map' && <WorldMapV2 onRegionClick={() => { }} />}
                                {currentView === 'bestiary' && <BestiaryView />}
                                {currentView === 'nexus' && (
                                    <NexusView
                                        user={userStats}
                                        chronicles={state.world?.chronicles || []}
                                        onAction={handleAction}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* View Switcher Controls */}
                    {currentView !== 'tavern' && (
                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            onClick={() => setCurrentView('tavern')}
                            className="absolute bottom-10 left-1/2 -translate-x-1/2 px-10 py-3.5 bg-black/80 backdrop-blur-2xl border border-celestial-gold/20 rounded-full text-[11px] font-bold tracking-[0.3em] hover:border-celestial-gold hover:text-celestial-gold transition-all uppercase z-50 shadow-3xl font-heading"
                        >
                            ← Return to Hub
                        </motion.button>
                    )}
                </div>

                {/* Right Wing: Intelligence & Prophecies */}
                <div className="col-span-3 row-span-8 flex flex-col gap-8">
                    {/* Market Constellations */}
                    <div className="h-[45%] bg-black/30 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden relative shadow-2xl">
                        <div className="p-5 bg-white/2 border-b border-white/5 flex justify-between items-center">
                            <span className="text-[10px] text-celestial-gold font-bold tracking-[0.2em] uppercase flex items-center gap-2 font-heading">
                                <Activity size={12} className="text-aetheric-purple" />
                                Aetheric Flux
                            </span>
                            <div className="w-2 h-2 bg-celestial-gold rounded-full animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.4)]" />
                        </div>
                        <MarketChart />
                    </div>

                    {/* The Resonance Feed */}
                    <div className="flex-1 bg-black/30 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-5 bg-white/2 border-b border-white/5">
                            <span className="text-[10px] text-crystal-cyan font-bold tracking-[0.2em] uppercase flex items-center gap-2 font-heading">
                                <Zap size={12} className="text-celestial-gold" />
                                Resonance Feed
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-none">
                            <AnimatePresence>
                                {recentEvents.map((evt, i) => (
                                    <motion.div
                                        key={evt.ts || i}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-[10px] p-5 bg-white/2 border border-white/5 rounded-[2rem] flex flex-col gap-2 group hover:border-celestial-gold/20 transition-all duration-500"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="text-white/40 font-bold uppercase tracking-[0.1em]">{evt.type?.replace(/_/g, ' ')}</div>
                                            <div className="opacity-20 group-hover:opacity-60 transition-opacity">
                                                {evt.type === 'state_update' ? <Zap size={10} className="text-celestial-gold" /> : <Activity size={10} />}
                                            </div>
                                        </div>
                                        <div className="space-y-1 font-body">
                                            {evt.payload?.action && <div className="text-white/20 italic tracking-wide">Deed: {evt.payload.action}</div>}
                                            {evt.payload?.expGain && <div className="text-celestial-gold font-bold tracking-wider">+{evt.payload.expGain} Essence Absorbed</div>}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Divine Horizon: Cinematics */}
                <div className="col-span-12 row-span-4 relative mt-auto">
                    <SpriteTheater party={partyState?.members || state.party || []} />
                </div>
            </div>

            <SpectralActionBar onAction={handleAction} />
        </div>
    );
};
