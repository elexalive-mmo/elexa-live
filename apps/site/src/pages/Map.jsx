import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map as MapIcon, Compass, Navigation, Shield, Users, Zap, Lock } from 'lucide-react';

// --- Region Data (Mirroring DB) ---
const REGIONS = [
    { id: 'haven', name: 'The Haven', x: 50, y: 50, type: 'Save Zone', level: 1, color: 'text-amber-400', border: 'border-amber-500/50' },
    { id: 'frozen_waste', name: 'Frozen Waste', x: 20, y: 30, type: 'Hostile', level: 10, color: 'text-cyan-400', border: 'border-cyan-500/50' },
    { id: 'magma_core', name: 'Magma Core', x: 80, y: 30, type: 'Hostile', level: 25, color: 'text-red-500', border: 'border-red-500/50' },
    { id: 'crystal_spires', name: 'Crystal Spires', x: 85, y: 70, type: 'Elite', level: 40, color: 'text-violet-400', border: 'border-violet-500/50' },
    { id: 'void_nexus', name: 'The Void Nexus', x: 50, y: 85, type: 'Raid', level: 50, color: 'text-fuchsia-600', border: 'border-fuchsia-500/50' },
    { id: 'iron_dunes', name: 'Iron Dunes', x: 15, y: 70, type: 'Hostile', level: 15, color: 'text-orange-400', border: 'border-orange-500/50' },
];

const HexNode = ({ region, isSelected, onClick, population = 0 }) => {
    // Dynamic Visuals based on Population (Evolution)
    const isCity = region.id === 'haven' && population > 50;
    const isMetropolis = region.id === 'haven' && population > 200;

    return (
        <motion.div
            className={`absolute cursor-pointer flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 group`}
            style={{ left: `${region.x}%`, top: `${region.y}%` }}
            onClick={() => onClick(region)}
            whileHover={{ scale: 1.1, zIndex: 10 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
            {/* Hexagon Shape */}
            <div className={`relative w-16 h-16 md:w-24 md:h-24 flex items-center justify-center transition-all duration-1000 ${isMetropolis ? 'scale-125' : ''}`}>
                <div className={`absolute inset-0 backdrop-blur-sm clip-hex border-2 transition-colors duration-300
                    ${isMetropolis ? 'bg-amber-900/60 border-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.4)]' :
                        isCity ? 'bg-amber-900/40 border-amber-400' :
                            isSelected ? 'bg-amber-900/40 border-amber-400' :
                                'bg-black/60 md:bg-black/40 border-white/10 group-hover:border-white/40'}`}
                    style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />

                {/* Inner Glow */}
                {isSelected && <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full" />}

                {/* Icon */}
                <div className={`relative z-10 ${isSelected ? 'text-amber-400' : 'text-slate-400 group-hover:text-white'}`}>
                    {region.id === 'haven' ? <Shield size={24} /> :
                        region.id === 'void_nexus' ? <Zap size={24} /> :
                            <MapIcon size={24} />}
                </div>

                {/* Level Badge */}
                <div className="absolute -top-2 -right-2 bg-black/80 border border-white/20 px-1.5 py-0.5 rounded text-[9px] font-mono text-xs">
                    LV{region.level}
                </div>
            </div>

            {/* Label */}
            <div className={`mt-2 font-mono text-[10px] md:text-xs tracking-wider uppercase bg-black/50 px-2 py-0.5 rounded backdrop-blur ${isSelected ? 'text-amber-400 border border-amber-500/30' : 'text-slate-500'}`}>
                {region.name}
            </div>
        </motion.div>
    );
};

const Map = () => {
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [simState, setSimState] = useState(null);
    const containerRef = useRef(null);

    // Fetch World State for Dynamic Visuals
    useEffect(() => {
        const fetchState = async () => {
            try {
                const res = await fetch('http://localhost:3020/api/world-state');
                const data = await res.json();
                if (data.success) setSimState(data.structured);
            } catch (e) { console.error("Map Sync Error", e); }
        };
        fetchState();
        const interval = setInterval(fetchState, 5000);
        return () => clearInterval(interval);
    }, []);

    // Initial Zoom In Effect
    useEffect(() => {
        setSelectedRegion(REGIONS[0]); // Default to Haven
    }, []);

    return (
        <div className="relative w-full h-screen bg-[#050505] overflow-hidden text-white font-sans selection:bg-amber-500/30">

            {/* --- BACKGROUND LAYER: HEX MESH --- */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-30" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05)_0%,rgba(0,0,0,0)_70%)]" />
            </div>

            {/* Grid Lines (Graph Paper effect) */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />


            {/* --- INTERACTIVE MAP CONTAINER --- */}
            <div
                ref={containerRef}
                className="relative w-full h-full"
            >
                {/* Expanding Rings Animation from Haven */}
                <motion.div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full pointer-events-none"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0, 0.1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />

                {/* Connection Lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                    <defs>
                        <linearGradient id="gradientLine" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
                            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    {/* Simple connections radiating from Haven */}
                    {REGIONS.filter(r => r.id !== 'haven').map((r, i) => (
                        <motion.line
                            key={`link-haven-${r.id}`}
                            x1="50%" y1="50%"
                            x2={`${r.x}%`} y2={`${r.y}%`}
                            stroke="url(#gradientLine)"
                            strokeWidth="1"
                            strokeDasharray="5,5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, delay: i * 0.2 }}
                        />
                    ))}
                </svg>

                {/* Nodes */}
                {REGIONS.map(region => (
                    <HexNode
                        key={region.id}
                        region={region}
                        isSelected={selectedRegion?.id === region.id}
                        onClick={setSelectedRegion}
                        population={simState?.population || 0}
                    />
                ))}
            </div>

            {/* --- GRAPHOMORPHISM UI OVERLAYS --- */}

            {/* Top Left: Location Info */}
            <div className="absolute top-8 left-8 z-50">
                <div className="flex items-center gap-3 mb-2">
                    <Compass className="text-amber-400 animate-spin-slow" size={20} />
                    <h2 className="text-xl font-black tracking-widest uppercase">Elexa<span className="text-amber-500">World</span></h2>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                    SECTOR: AETHERIC_GRID_ALPHA<br />
                    COORDINATES: {selectedRegion ? `${selectedRegion.x}, ${selectedRegion.y}` : 'SCANNING...'}
                </div>
            </div>

            {/* Bottom Right: Detail Panel */}
            <AnimatePresence mode="wait">
                {selectedRegion && (
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        className="absolute top-24 right-8 w-80 bg-black/80 backdrop-blur-md border-l-2 border-amber-500/50 p-6 shadow-2xl z-50"
                        style={{ clipPath: 'polygon(20px 0, 100% 0, 100% 100%, 0 100%, 0 20px)' }}
                    >
                        {/* Decorative Header Line */}
                        <div className="absolute top-0 right-0 w-16 h-1 bg-amber-500" />

                        <h3 className={`text-2xl font-bold uppercase mb-1 ${selectedRegion.color}`}>{selectedRegion.name}</h3>
                        <div className="flex items-center gap-2 mb-4 text-xs font-mono text-slate-400 border-b border-white/10 pb-2">
                            <span className="bg-white/10 px-1 rounded">{selectedRegion.type}</span>
                            <span>•</span>
                            <span>Threat Level: {selectedRegion.level}</span>
                        </div>

                        <p className="text-sm text-slate-300 leading-relaxed mb-6">
                            {(regionDescriptions[selectedRegion.id] || "No data available for this sector.")}
                        </p>

                        {/* Action Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white/5 p-2 border border-white/10 rounded">
                                <div className="text-[10px] text-slate-500 uppercase">Active Players</div>
                                <div className="text-lg font-mono text-white flex items-center gap-2">
                                    <Users size={14} className="text-green-400" />
                                    {selectedRegion.id === 'haven' ? (simState?.population || '...') : Math.floor(Math.random() * 50) + 12}
                                </div>
                            </div>
                            <div className="bg-white/5 p-2 border border-white/10 rounded">
                                <div className="text-[10px] text-slate-500 uppercase">Resonance</div>
                                <div className="text-lg font-mono text-white flex items-center gap-2">
                                    <Zap size={14} className="text-amber-400" />
                                    {Math.floor(Math.random() * 90)}%
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-black font-bold uppercase tracking-wider text-sm clip-button transition-colors relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <span className="relative flex items-center justify-center gap-2">
                                <Navigation size={16} /> warp to sector
                            </span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Vignette & Grain Overlay (Cinematic Feel) */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] z-40" />
        </div>
    );
};

// --- Mock Descriptions ---
const regionDescriptions = {
    haven: "The last safe harbor in the digital expanse. New Agents begin their journey here, safe from the Primal Dissonance.",
    frozen_waste: "A datascape frozen by the Glitch. Home to Frostbytes and ancient cold-storage archives.",
    magma_core: "High-volatile memory sectors where the heat of processing power melts the very grid.",
    crystal_spires: "Crystalline data structures piercing the sky. Pure, ordered logic rules here.",
    void_nexus: "The source of the Dissonance. Highly dangerous. Raid-level threats detected."
};

export default Map;
