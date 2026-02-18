import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ═══════════════════════════════════════════════════════════
 * The Tapestry of Realms — Celestial Navigation
 * ═══════════════════════════════════════════════════════════
 */

const GATE = {
    id: 'the_gate', name: 'THE GATEWAY', icon: '🏛️',
    element: 'Aether', color: '#a855f7', glow: 'rgba(168,85,247,0.5)',
    tier: 0, x: 50, y: 50,
    lore: 'The ancient waypoint where all paths converge.',
};

const REGIONS = [
    { id: 'crystal_tundra', name: 'Crystal Tundra', dir: 'N', tier: 3, element: 'Ice', icon: '❄️', color: '#67e8f9', glow: 'rgba(103,232,249,0.5)', x: 50, y: 8, boss: { name: 'Frost Titan', icon: '🏔️', hp: 1000 }, hazard: 'Blizzard', loot: '5x', lore: 'Frozen expanse of crystal spires.' },
    { id: 'skybreak_plateau', name: 'Skybreak Plateau', dir: 'NE', tier: 2, element: 'Air', icon: '⛰️', color: '#60a5fa', glow: 'rgba(96,165,250,0.5)', x: 78, y: 22, boss: { name: 'Storm Warden', icon: '⚡', hp: 600 }, hazard: 'Gale Winds', loot: '3x', lore: 'Towering mesas above the clouds.' },
    { id: 'ash_ridge', name: 'Ash Ridge', dir: 'E', tier: 1, element: 'Fire', icon: '🔥', color: '#f97316', glow: 'rgba(249,115,22,0.5)', x: 88, y: 50, boss: { name: 'Fire Drake', icon: '🐉', hp: 300 }, hazard: 'Ember Rain', loot: '1.5x', lore: 'Volcanic ridgelines glow orange.' },
    { id: 'iron_pass', name: 'Iron Pass', dir: 'SE', tier: 2, element: 'Metal', icon: '⚙️', color: '#94a3b8', glow: 'rgba(148,163,184,0.5)', x: 78, y: 78, boss: { name: 'Steel Golem', icon: '🤖', hp: 800 }, hazard: 'Mechanical Traps', loot: '3x', lore: 'Rusted automaton remains and rail networks.' },
    { id: 'fog_marsh', name: 'Fog Marsh', dir: 'S', tier: 1, element: 'Water', icon: '🌫️', color: '#a3e635', glow: 'rgba(163,230,53,0.4)', x: 50, y: 92, boss: { name: 'Ghost Crab', icon: '🦀', hp: 250 }, hazard: 'Slow (2x EXP)', loot: '1.5x', lore: 'Bioluminescent wetland in perpetual mist.' },
    { id: 'void_wastes', name: 'Void Wastes', dir: 'SW', tier: 3, element: 'Void', icon: '🕳️', color: '#c084fc', glow: 'rgba(192,132,252,0.5)', x: 22, y: 78, boss: { name: 'Void Sovereign', icon: '👁️', hp: 1200 }, hazard: 'Reality Fractures', loot: '5x', lore: 'Where reality thins and entropy rules.' },
    { id: 'sylvan_glades', name: 'Sylvan Glades', dir: 'W', tier: 1, element: 'Earth', icon: '🌿', color: '#22c55e', glow: 'rgba(34,197,94,0.5)', x: 12, y: 50, boss: { name: 'Elder Treant', icon: '🌳', hp: 400 }, hazard: 'Root Snare', loot: '1.5x', lore: 'Ancient woodlands thick with luminescent moss.' },
    { id: 'abyssal_coast', name: 'Abyssal Coast', dir: 'NW', tier: 2, element: 'Water', icon: '🌊', color: '#3b82f6', glow: 'rgba(59,130,246,0.5)', x: 22, y: 22, boss: { name: 'Leviathan', icon: '🐋', hp: 700 }, hazard: 'Liquidity Flood', loot: '3x', lore: 'Dark cliffs plunging into churning seas.' },
];

// Ring connections (outer perimeter) + all spokes to gate
const CONNECTIONS = [
    // Spokes (Gate → each region)
    ...REGIONS.map(r => ({ from: GATE, to: r })),
    // Perimeter ring
    { from: REGIONS[0], to: REGIONS[1] }, // N → NE
    { from: REGIONS[1], to: REGIONS[2] }, // NE → E
    { from: REGIONS[2], to: REGIONS[3] }, // E → SE
    { from: REGIONS[3], to: REGIONS[4] }, // SE → S
    { from: REGIONS[4], to: REGIONS[5] }, // S → SW
    { from: REGIONS[5], to: REGIONS[6] }, // SW → W
    { from: REGIONS[6], to: REGIONS[7] }, // W → NW
    { from: REGIONS[7], to: REGIONS[0] }, // NW → N
];

const TIER_COLORS = { 0: '#22c55e', 1: '#fbbf24', 2: '#f97316', 3: '#ef4444' };
const TIER_LABELS = { 0: 'Sanctuary', 1: 'Wanderer', 2: 'Seeker', 3: 'Transcendent' };

function getAll() { return [GATE, ...REGIONS]; }

export default function WorldMapV2({ onRegionClick, currentRegion = 'the_gate', currentTile = 0, worldState = {} }) {
    const [hovered, setHovered] = useState(null);
    const [stars] = useState(() => Array.from({ length: 40 }, () => ({
        x: Math.random() * 100, y: Math.random() * 100,
        d: Math.random() * 5, s: 0.8 + Math.random() * 1.5
    })));

    const activeNode = useMemo(() =>
        getAll().find(n => n.id === currentRegion) || GATE
        , [currentRegion]);

    const visited = useMemo(() => {
        const v = new Set(['the_gate']);
        if (worldState?.visitedRegions) worldState.visitedRegions.forEach(r => v.add(r));
        if (currentRegion) v.add(currentRegion);
        return v;
    }, [worldState, currentRegion]);

    return (
        <div className="relative w-full h-full bg-[#020205] overflow-hidden rounded-[3rem] border border-white/5 shadow-inner">
            {/* Deep Space / Aether */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-aether opacity-10" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(15,15,40,0.5)_0%,_rgba(2,2,5,1)_80%)]" />
                {stars.map((p, i) => (
                    <motion.div key={i} className="absolute rounded-full bg-white"
                        style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s }}
                        animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.2, 1] }}
                        transition={{ duration: 3 + p.d, repeat: Infinity, ease: 'easeInOut' }}
                    />
                ))}
            </div>

            {/* SVG Connections - Lay lines or Aetheric Paths */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacit-40" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="aetherPath" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(250,204,21,0.1)" />
                        <stop offset="50%" stopColor="rgba(168,85,247,0.3)" />
                        <stop offset="100%" stopColor="rgba(0,242,255,0.1)" />
                    </linearGradient>
                </defs>
                {CONNECTIONS.map((c, i) => {
                    const a = visited.has(c.from.id) && visited.has(c.to.id);
                    return (
                        <line key={i}
                            x1={c.from.x} y1={c.from.y} x2={c.to.x} y2={c.to.y}
                            stroke={a ? 'url(#aetherPath)' : 'rgba(255,255,255,0.03)'}
                            strokeWidth={a ? '0.4' : '0.2'}
                            strokeDasharray={a ? 'none' : '1,2'}
                        />
                    );
                })}
            </svg>

            {/* THE GATEWAY (Center Hub) */}
            <motion.div className="absolute z-30 cursor-pointer"
                style={{ left: `${GATE.x}%`, top: `${GATE.y}%`, transform: 'translate(-50%,-50%)' }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                onClick={() => onRegionClick?.('the_gate')}
            >
                <motion.div className="absolute -inset-8 rounded-full border border-celestial-gold/10"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }}
                    transition={{ duration: 5, repeat: Infinity }}
                />
                {activeNode.id === 'the_gate' && (
                    <motion.div className="absolute -inset-6 rounded-full"
                        style={{ backgroundColor: GATE.glow, filter: 'blur(20px)' }}
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />
                )}
                <div className="w-18 h-18 rounded-full bg-black/80 backdrop-blur-3xl border border-celestial-gold/30 flex items-center justify-center shadow-[0_0_40px_rgba(250,204,21,0.2)] group hover:border-celestial-gold transition-all duration-500">
                    <span className="text-3xl drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] group-hover:scale-110 transition-transform">{GATE.icon}</span>
                </div>
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                    <div className="fantasy-title text-[10px] tracking-[0.3em] font-bold">THE GATEWAY</div>
                    <div className="text-[7px] text-crystal-cyan/40 uppercase tracking-widest font-bold">Divine Sanctuary</div>
                </div>
            </motion.div>

            {/* Region Nodes */}
            {REGIONS.map((r, idx) => {
                const isActive = activeNode.id === r.id;
                const isVisited = visited.has(r.id);
                const isHov = hovered === r.id;
                const fogged = !isVisited;
                const tierColor = TIER_COLORS[r.tier];

                return (
                    <motion.div key={r.id} className="absolute z-20 cursor-pointer"
                        style={{ left: `${r.x}%`, top: `${r.y}%`, transform: 'translate(-50%,-50%)' }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.1, type: 'spring', stiffness: 150 }}
                        onMouseEnter={() => setHovered(r.id)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => onRegionClick?.(r.id)}
                    >
                        {/* Active Pulse */}
                        {isActive && (
                            <>
                                <motion.div className="absolute -inset-8 rounded-full"
                                    style={{ border: `1px solid ${r.color}` }}
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                />
                                <motion.div className="absolute -inset-4 rounded-full"
                                    style={{ backgroundColor: r.glow, filter: 'blur(15px)' }}
                                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            </>
                        )}

                        {/* Node Aspect */}
                        <div className={`relative w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-500 ${fogged ? 'bg-black/80 border-white/5 grayscale blur-[0.5px]'
                            : isActive ? 'bg-white/5 border-white/40 shadow-2xl scale-110'
                                : 'bg-black/60 border-white/10 hover:border-white/30 hover:scale-105'
                            }`} style={{
                                boxShadow: isActive ? `0 0 30px ${r.glow}` : isHov ? `0 0 20px ${r.glow}` : 'none'
                            }}>
                            <span className={`text-xl transition-all duration-500 ${fogged ? 'opacity-10' : 'group-hover:scale-110'}`}
                                style={{ filter: isActive ? `drop-shadow(0 0 10px ${r.color})` : undefined }}>
                                {fogged ? '◈' : r.icon}
                            </span>

                            {/* Guardian Presence */}
                            {!fogged && r.boss && (
                                <motion.div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-950/90 border border-red-500/40 flex items-center justify-center shadow-xl"
                                    animate={{ scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}>
                                    <span className="text-[10px]">{r.boss.icon}</span>
                                </motion.div>
                            )}

                            {/* Depth Sigil */}
                            {!fogged && (
                                <div className="absolute -bottom-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center border bg-black/90 shadow-md"
                                    style={{ borderColor: `${tierColor}40` }}>
                                    <span className="text-[8px] font-bold font-heading" style={{ color: tierColor }}>{r.tier}</span>
                                </div>
                            )}

                            {/* Resonance Tracer (Current Player) */}
                            {isActive && (
                                <motion.div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-crystal-cyan border border-white/60"
                                    animate={{ scale: [1, 1.3, 1], boxShadow: ['0 0 5px #00f2ff', '0 0 15px #00f2ff', '0 0 5px #00f2ff'] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                            )}
                        </div>

                        {/* Node Text Decoration */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                            <div className={`text-[9px] font-bold uppercase tracking-[0.2em] font-heading ${fogged ? 'text-white/10' : isActive ? 'text-white' : 'text-white/40'}`}
                                style={{ color: isActive ? r.color : undefined, textShadow: isActive ? `0 0 10px ${r.glow}` : 'none' }}>
                                {fogged ? '???' : r.name}
                            </div>
                            {!fogged && (
                                <div className="text-[7px] uppercase tracking-[0.3em] font-bold opacity-30 mt-1" style={{ color: `${tierColor}` }}>
                                    {r.element} • {r.loot}
                                </div>
                            )}
                        </div>

                        {/* Divine Revelation (Tooltip) */}
                        <AnimatePresence>
                            {isHov && !fogged && (
                                <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute bottom-[4.5rem] left-1/2 -translate-x-1/2 w-60 bg-black/95 border border-white/10 backdrop-blur-3xl rounded-[1.5rem] p-5 pointer-events-none z-50 shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
                                    style={{ borderLeft: `2px solid ${r.color}` }}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="text-2xl">{r.icon}</div>
                                        <div>
                                            <div className="text-[11px] font-bold text-white uppercase tracking-wider font-heading">{r.name}</div>
                                            <div className="text-[7px] uppercase tracking-[0.2em] flex items-center gap-2 opacity-60">
                                                <span className="font-bold" style={{ color: tierColor }}>{TIER_LABELS[r.tier].toUpperCase()}</span>
                                                <span className="w-1 h-1 bg-white/20 rounded-full" />
                                                <span style={{ color: r.color }}>{r.element.toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-white/40 leading-relaxed italic mb-4 font-serif">"{r.lore}"</p>
                                    <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-3">
                                        <div>
                                            <span className="text-[7px] text-white/20 uppercase block mb-0.5">Guardian</span>
                                            <span className="text-[8px] text-red-400 font-bold tracking-tight">{r.boss.icon} {r.boss.name}</span>
                                        </div>
                                        <div>
                                            <span className="text-[7px] text-white/20 uppercase block mb-0.5">Artifacts</span>
                                            <span className="text-[8px] font-bold" style={{ color: tierColor }}>{r.loot} MULTIPLIER</span>
                                        </div>
                                    </div>
                                    <div className="text-[8px] text-orange-400/60 mt-3 flex items-center gap-1 uppercase font-bold tracking-widest">
                                        <span className="animate-pulse">⚠</span> {r.hazard}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}

            {/* Tapestry Footer */}
            <div className="absolute bottom-6 left-0 right-0 z-40 flex justify-center">
                <motion.div className="flex items-center gap-6 px-8 py-3 bg-black/80 border border-white/5 rounded-full backdrop-blur-3xl shadow-2xl"
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
                    <div className="flex items-center gap-3">
                        <motion.div className="w-2.5 h-2.5 rounded-full bg-crystal-cyan"
                            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 2, repeat: Infinity }} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] font-heading" style={{ color: activeNode.color }}>
                            {activeNode.name}
                        </span>
                    </div>
                    <div className="w-px h-5 bg-white/5" />
                    <span className="text-[9px] font-mono text-white/20 tracking-widest">
                        {currentRegion === 'the_gate' ? 'SANCTUARY' : `RESONANCE DEPTH ${currentTile}/20`}
                    </span>
                </motion.div>
            </div>

            {/* Map Frame Label */}
            <div className="absolute top-6 left-8 z-40">
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-celestial-gold font-bold uppercase tracking-[0.4em] font-heading">The Tapestry of Realms</span>
                    <span className="text-[7px] text-white/10 uppercase tracking-[0.5em] font-bold italic">Celestial Navigation v2.0</span>
                </div>
            </div>

            {/* Legend */}
            <div className="absolute top-4 right-4 z-40 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[7px] text-white/30 uppercase tracking-wider font-bold">Risk Tiers</span>
                </div>
                {Object.entries(TIER_COLORS).map(([tier, color]) => (
                    <div key={tier} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-[7px] text-white/30 uppercase tracking-widest font-bold">
                            T{tier} — {TIER_LABELS[tier]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
