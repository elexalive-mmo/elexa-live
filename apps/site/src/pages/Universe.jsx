import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Map as MapIcon, RotateCcw, ArrowLeft, Terminal, Activity, Users, Cloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameMaster } from '../App';

export default function UniversePage() {
    const navigate = useNavigate();
    const { isGM } = useGameMaster();
    const [simState, setSimState] = useState(null);

    useEffect(() => {
        if (!isGM) return;
        const fetchSim = async () => {
            try {
                const res = await fetch('http://localhost:3020/api/world-state');
                const data = await res.json();
                if (data.success) {
                    setSimState(data.structured);
                }
            } catch (e) { console.error("Sim Fetch Error", e); }
        };
        const interval = setInterval(fetchSim, 1000);
        return () => clearInterval(interval);
    }, [isGM]);

    // ... (Existing UI Logic for Book/Non-GM) ...
    const [bookOpen, setBookOpen] = useState(false);
    const handleOpenBook = () => setBookOpen(true);

    if (isGM) {
        return (
            <div className="w-full h-screen bg-black text-green-500 font-mono p-8 overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/dummy/giphy.gif')] opacity-10 pointer-events-none" /> {/* Matrix Rain Placeholder */}

                <header className="flex justify-between items-center border-b border-green-900 pb-4 mb-8">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Terminal className="w-6 h-6" />
                        ELEXA_CORE // UNIVERSE_STATE
                    </h1>
                    <div className="flex gap-4 text-xs">
                        <span>TICK: {simState?.meta?.timestamp || 'SYNCING...'}</span>
                        <span className="animate-pulse">● LIVE</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[calc(100vh-150px)]">

                    {/* LEFT: ECONOMY */}
                    <div className="border border-green-900/50 p-6 rounded bg-black/50 backdrop-blur">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Activity size={20} /> ECONOMIC_ENGINE</h2>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-green-900/10 p-4 rounded">
                                <div className="text-xs opacity-50">MARKET CAP</div>
                                <div className="text-2xl font-bold">${Math.floor(simState?.economy?.mcap || 0).toLocaleString()}</div>
                            </div>
                            <div className="bg-green-900/10 p-4 rounded">
                                <div className="text-xs opacity-50">PRICE</div>
                                <div className="text-2xl font-bold">${(simState?.economy?.price || 0).toFixed(6)}</div>
                            </div>
                            <div className="bg-green-900/10 p-4 rounded">
                                <div className="text-xs opacity-50">PHASE</div>
                                <div className="text-xl font-bold text-amber-500">{simState?.phase || 'INIT'}</div>
                            </div>
                            <div className="bg-green-900/10 p-4 rounded">
                                <div className="text-xs opacity-50">TREASURY</div>
                                <div className="text-xl font-bold">{simState?.economy?.treasuryBalance || 0} SOL</div>
                            </div>
                        </div>

                        <div className="h-[200px] overflow-hidden border-t border-green-900/30 pt-4">
                            <div className="text-xs opacity-50 mb-2">LATEST_TRANSACTION</div>
                            {simState?.economy?.recentTrade ? (
                                <motion.div
                                    key={simState.economy.recentTrade.timestamp}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-sm font-mono"
                                >
                                    <span className="text-yellow-500">[{simState.economy.recentTrade.timestamp}]</span>
                                    <span className="text-cyan-400"> {simState.economy.recentTrade.role?.toUpperCase()}</span>
                                    <span className="ml-2">
                                        {simState.economy.recentTrade.action} {simState.economy.recentTrade.amount} {simState.economy.recentTrade.tokenIn} ➔ {simState.economy.recentTrade.tokenOut}
                                    </span>
                                </motion.div>
                            ) : <div className="text-gray-500 italic">Waiting for Block...</div>}
                        </div>
                    </div>

                    {/* RIGHT: CIVILIZATION & FAITH */}
                    <div className="border border-green-900/50 p-6 rounded bg-black/50 backdrop-blur flex flex-col gap-6">
                        {/* Status Header */}
                        <div>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Users size={20} /> CIVILIZATION_LOG</h2>
                            <div className="flex gap-4 text-sm text-green-400/80 font-mono">
                                <div className="flex items-center gap-2"><Cloud size={14} /> {simState?.weather || 'Clear'}</div>
                                <div>DAY: {simState?.day || 1}</div>
                                <div>POP: {simState?.population || 0}</div>
                            </div>
                        </div>

                        {/* Guilds / Faith */}
                        <div className="border-t border-green-900/30 pt-4">
                            <h3 className="text-xs font-bold text-green-700 mb-2 uppercase tracking-widest">Active Guilds</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {(simState?.guilds || []).length > 0 ? (
                                    simState.guilds.map((g, i) => (
                                        <div key={i} className="bg-green-900/10 px-2 py-1 rounded text-xs flex justify-between">
                                            <span>{g.name}</span>
                                            <span className="font-bold">{g.members}</span>
                                        </div>
                                    ))
                                ) : <div className="text-xs text-green-900 italic">No Guilds Formed Yet</div>}
                            </div>
                        </div>

                        {/* Mind Stream Placeholder */}
                        <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs md:text-sm scrollbar-hide border-t border-green-900/30 pt-4">
                            <div className="text-xs opacity-50 mb-2">MIND_STREAM_UPLINK</div>
                            <div className="text-center text-gray-500 py-4 italic text-[10px]">
                                Listen to the thoughts of the people...<br />
                                (Available in Holographic Dashboard)
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="absolute top-8 right-8 text-green-500/50 hover:text-green-500 flex items-center gap-2 text-[10px] uppercase tracking-widest border border-green-900 px-3 py-1 rounded"
                >
                    <ArrowLeft size={14} /> EXIT MATRIX
                </button>
            </div>
        );
    }

    // --- ORIGINAL PLAYER VIEW (UNCHANGED) ---
    return (
        <div className="relative w-full h-screen flex items-center justify-center font-serif text-amber-100 overflow-hidden bg-black">
            {/* Background - Library Video Loop if available, or static fallback with overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[url('/assets/backgrounds/library.png')] bg-cover bg-center opacity-40" />
                <div className="absolute inset-0 bg-black/60" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">

                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-4xl md:text-6xl font-black tracking-widest text-amber-500 mb-8 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] uppercase"
                >
                    The Archives
                </motion.h1>

                {/* The Mystic Book */}
                <div className="relative group cursor-pointer" onClick={handleOpenBook}>
                    <motion.div
                        className="relative w-[300px] h-[400px] md:w-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-2xl border-4 border-amber-900/50 bg-[#0a0a0a]"
                        initial={{ scale: 0.9 }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                    >
                        {/* Book Video Loop */}
                        {!bookOpen ? (
                            <div className="w-full h-full bg-amber-900/20 flex items-center justify-center">
                                <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80">
                                    <source src="/assets/backgrounds/book.mp4" type="video/mp4" />
                                </video>
                            </div>
                        ) : (
                            <div className="w-full h-full bg-[#1a120b] p-8 flex flex-col items-center text-center bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]">
                                <span className="text-amber-500/50 text-6xl mb-4">❦</span>
                                <h2 className="text-2xl font-bold text-amber-900 mb-6 uppercase tracking-widest">Chronicles of Elexa</h2>
                                <p className="text-amber-900/70 italic mb-8 text-sm leading-relaxed">
                                    "The realms are shifting. The code is being rewritten. Choose your path, Traveler."
                                </p>

                                <div className="flex flex-col gap-3 w-full max-w-[200px]">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate('/map'); }}
                                        className="bg-amber-900 text-amber-100 px-4 py-2 rounded border border-amber-700 hover:bg-amber-800 transition-colors uppercase text-xs font-bold tracking-widest flex items-center justify-center gap-2"
                                    >
                                        <MapIcon size={14} /> World Map
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate('/gateway'); }}
                                        className="bg-transparent text-amber-900 px-4 py-2 rounded border border-amber-900/30 hover:bg-amber-900/10 transition-colors uppercase text-xs font-bold tracking-widest flex items-center justify-center gap-2"
                                    >
                                        <RotateCcw size={14} /> Open Gateway
                                    </button>
                                </div>
                            </div>
                        )}
                        {/* Hover Glow */}
                        <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </motion.div>

                    {!bookOpen && (
                        <div className="absolute -bottom-12 left-0 right-0 text-center">
                            <span className="text-[10px] text-amber-500/50 uppercase tracking-[0.3em] animate-pulse">Tap to Open</span>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="absolute top-8 left-8 text-white/30 hover:text-white flex items-center gap-2 text-[10px] uppercase tracking-widest transition-colors"
                >
                    <ArrowLeft size={14} /> Return
                </button>

            </div>
        </div>
    );
}
