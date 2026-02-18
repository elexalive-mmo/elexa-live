import React, { useState, useEffect, useCallback } from 'react';

/**
 * ═══════════════════════════════════════════════════════════
 * Tap2Earn — Region-Based with Environment Backgrounds
 * ═══════════════════════════════════════════════════════════
 *
 * Players tap from their current region. Background changes
 * based on region. Risk/reward scales with distance from Gate.
 */

const TAP_COOLDOWN = 0.5;

// === CANONICAL 7-REGION + GATE SYSTEM ===
const GATE = {
    id: 'the_gate', name: 'THE GATE', element: 'Aether', icon: '🏛️',
    color: '#a855f7', tier: 0, lootMult: 1,
    bgGradient: 'linear-gradient(180deg, #0f0f23 0%, #1e1b4b 50%, #2e1065 100%)',
    ambience: null
};

const REGIONS = {
    crystal_tundra: { id: 'crystal_tundra', name: 'Crystal Tundra', element: 'Ice', icon: '❄️', color: '#67e8f9', tier: 3, lootMult: 5, bgGradient: 'linear-gradient(180deg, #0c1445 0%, #1e3a5f 40%, #67e8f9 100%)', ambience: 'snowfall', hazard: 'Blizzard' },
    skybreak_plateau: { id: 'skybreak_plateau', name: 'Skybreak Plateau', element: 'Air', icon: '⛰️', color: '#60a5fa', tier: 2, lootMult: 3, bgGradient: 'linear-gradient(180deg, #1e1b4b 0%, #3730a3 30%, #60a5fa 70%, #e2e8f0 100%)', ambience: 'windstorm', hazard: 'Gale Winds' },
    ash_ridge: { id: 'ash_ridge', name: 'Ash Ridge', element: 'Fire', icon: '🔥', color: '#f97316', tier: 1, lootMult: 1.5, bgGradient: 'linear-gradient(180deg, #1c1917 0%, #7c2d12 40%, #f97316 80%, #fbbf24 100%)', ambience: 'embers', hazard: 'Ember Rain' },
    iron_pass: { id: 'iron_pass', name: 'Iron Pass', element: 'Metal', icon: '⚙️', color: '#94a3b8', tier: 2, lootMult: 3, bgGradient: 'linear-gradient(180deg, #0f172a 0%, #334155 40%, #94a3b8 80%, #cbd5e1 100%)', ambience: 'gears', hazard: 'Mechanical Traps' },
    fog_marsh: { id: 'fog_marsh', name: 'Fog Marsh', element: 'Water', icon: '🌫️', color: '#a3e635', tier: 1, lootMult: 1.5, bgGradient: 'linear-gradient(180deg, #0a0f0a 0%, #1a2e1a 40%, #4ade80 80%, #a3e635 100%)', ambience: 'fog', hazard: 'Slow (2x EXP)' },
    void_wastes: { id: 'void_wastes', name: 'Void Wastes', element: 'Void', icon: '🕳️', color: '#c084fc', tier: 3, lootMult: 5, bgGradient: 'linear-gradient(180deg, #0a0014 0%, #2e1065 40%, #7c3aed 70%, #c084fc 100%)', ambience: 'void', hazard: 'Reality Fractures' },
    sylvan_glades: { id: 'sylvan_glades', name: 'Sylvan Glades', element: 'Earth', icon: '🌿', color: '#22c55e', tier: 1, lootMult: 1.5, bgGradient: 'linear-gradient(180deg, #052e16 0%, #166534 40%, #22c55e 70%, #bbf7d0 100%)', ambience: 'forest', hazard: 'Root Snare' },
    abyssal_coast: { id: 'abyssal_coast', name: 'Abyssal Coast', element: 'Water', icon: '🌊', color: '#3b82f6', tier: 2, lootMult: 3, bgGradient: 'linear-gradient(180deg, #0c1445 0%, #1e3a5f 30%, #3b82f6 60%, #60a5fa 100%)', ambience: 'ocean', hazard: 'Liquidity Flood' },
};

const TIER_COLORS = { 0: '#22c55e', 1: '#fbbf24', 2: '#f97316', 3: '#ef4444' };
const TIER_NAMES = { 0: 'SAFE ZONE', 1: 'NEAR REACHES', 2: 'MID FRONTIER', 3: 'DEEP WILDS' };

import { ElexaContext } from '../App';
import { useContext } from 'react';
import ExperienceBar from '../components/ui/ExperienceBar';
import { LEVEL_THRESHOLDS } from '../lib/constants';

// Ambient particle system
function AmbienceLayer({ type, color }) {
    if (!type) return null;
    const count = type === 'snowfall' ? 30 : type === 'embers' ? 20 : type === 'fog' ? 8 : type === 'void' ? 15 : 12;
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="particle" style={{
                    '--x': `${Math.random() * 100}%`,
                    '--delay': `${Math.random() * 5}s`,
                    '--duration': `${3 + Math.random() * 4}s`,
                    '--size': `${type === 'fog' ? 40 + Math.random() * 60 : 2 + Math.random() * 4}px`,
                    '--color': type === 'embers' ? '#f97316' : type === 'void' ? '#c084fc' : type === 'fog' ? 'rgba(255,255,255,0.03)' : color || '#fff',
                    '--opacity': type === 'fog' ? 0.15 : 0.4 + Math.random() * 0.4,
                }} />
            ))}
        </div>
    );
}

export default function Tap2Earn() {
    const { userStats, handleAction } = useContext(ElexaContext);
    const [regionId, setRegionId] = useState('the_gate');
    const [depth, setDepth] = useState(0);
    const [partyHP, setPartyHP] = useState(100);
    const [boss, setBoss] = useState(null);
    const [canTap, setCanTap] = useState(true);
    const [cooldown, setCooldown] = useState(0);
    const [lastAction, setLastAction] = useState(null);
    const [showSkills, setShowSkills] = useState(false);
    const [tapAnimation, setTapAnimation] = useState(false);

    const currentRegion = regionId === 'the_gate' ? GATE : (REGIONS[regionId] || GATE);
    const tierColor = TIER_COLORS[currentRegion.tier];
    const tierName = TIER_NAMES[currentRegion.tier];
    const baseXp = 5;
    const effectiveXp = Math.floor(baseXp * (currentRegion.lootMult || 1));

    const calculateLevel = (exp) => {
        let lvl = 1;
        for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
            if (exp >= LEVEL_THRESHOLDS[i]) lvl = i + 1;
        }
        return lvl;
    };

    const fetchState = useCallback(async () => {
        try {
            const res = await fetch('/api/raid/status');
            const data = await res.json();
            if (data.world?.currentRegion) setRegionId(data.world.currentRegion);
            if (data.world?.currentTile !== undefined) setDepth(data.world.currentTile);
            setPartyHP(data.world?.partyHP || 100);
            setBoss(data.world?.activeBoss || null);
        } catch (e) {
            console.error('[Tap2Earn] Fetch error:', e);
        }
    }, []);

    useEffect(() => {
        fetchState();
        const interval = setInterval(fetchState, 5000);
        return () => clearInterval(interval);
    }, [fetchState]);

    useEffect(() => {
        if (!canTap && cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
        if (cooldown === 0 && !canTap) setCanTap(true);
    }, [canTap, cooldown]);

    const handleTap = async () => {
        // Liquid Tap Flow enabled

        setCanTap(false);
        setCooldown(TAP_COOLDOWN);
        setTapAnimation(true);
        setTimeout(() => setTapAnimation(false), 300);

        const data = await handleAction('tap', 0, { region: regionId });
        if (data) {
            if (data.user?.level > userStats.level) {
                setLastAction(`🎉 LEVEL UP! You reached Level ${data.user.level}!`);
            }

            if (data.world?.currentRegion) setRegionId(data.world.currentRegion);
            if (data.world?.currentTile !== undefined) setDepth(data.world.currentTile);
            setPartyHP(data.world?.partyHP || partyHP);

            if (data.encounter) {
                setBoss(data.encounter);
                setLastAction(`⚔️ BOSS: ${data.encounter.name}!`);
            } else if (data.user?.level <= userStats.level) {
                setLastAction(`👣 ${currentRegion.name} Depth ${depth} | +${effectiveXp} XP (${currentRegion.lootMult}x)`);
            }
        } else {
            setLastAction('❌ Connection error');
        }
    };

    const progressBar = (current, max) => Math.floor((current / max) * 100);
    const { level } = userStats;
    const nextLevelXp = LEVEL_THRESHOLDS[level] || 12000;

    const renderSkillTree = () => {
        const skills = ['Iron Hold', 'Aegis Sync', 'Vault Rebate', 'Eternal Stand', 'Treasury Ward'];
        return (
            <div className="skill-tree-panel">
                <div className="skill-tree-header">
                    <h3>🛡️ SENTINEL SKILL TREE</h3>
                    <button onClick={() => setShowSkills(false)}>✕</button>
                </div>
                <div className="skill-tree-nodes">
                    {skills.map((skill, i) => (
                        <div key={skill} className={`skill-node ${i < level - 5 ? 'unlocked' : ''}`}>
                            <div className="node-circle">{i < level - 5 ? '✓' : i + 1}</div>
                            <span>{skill}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="tap2earn relative overflow-hidden">
            {/* Dynamic Environment Background */}
            <div className="absolute inset-0 z-0 transition-all duration-1000"
                style={{ background: currentRegion.bgGradient }} />

            {/* Ambient Particles */}
            <AmbienceLayer type={currentRegion.ambience} color={currentRegion.color} />

            {/* Cinematic Overlays */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none z-[2]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none z-[2]" />
            <div className="crt-scanline z-[2]" />

            {/* Content Wrapper */}
            <div className="relative z-10 w-full max-w-md flex flex-col items-center">

                {/* Title Emblem */}
                <div className="mt-8 mb-6 animate-pulse relative mix-blend-screen bg-transparent">
                    <img
                        src="/assets/branding/logo_full.jpg"
                        alt="ELEXA.LIVE"
                        className="w-64 h-auto object-cover rounded-full shadow-[0_0_30px_rgba(168,85,247,0.5)] border-2 border-transparent mask-image-gradient"
                        style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}
                    />
                </div>

                {/* Region + Risk Tier Banner */}
                <div className="w-full max-w-[350px] mb-3 flex items-center justify-center gap-3 py-2 px-4 rounded-xl"
                    style={{
                        background: `linear-gradient(90deg, ${currentRegion.color}15, transparent, ${currentRegion.color}15)`,
                        borderBottom: `2px solid ${currentRegion.color}50`
                    }}>
                    <span className="text-lg">{currentRegion.icon}</span>
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-black uppercase tracking-[0.15em]"
                            style={{ color: currentRegion.color, textShadow: `0 0 10px ${currentRegion.color}60` }}>
                            {currentRegion.name}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest"
                            style={{ color: tierColor }}>
                            {tierName} • {currentRegion.element}
                        </span>
                    </div>
                    <div className="flex flex-col items-center px-2 py-1 rounded-lg"
                        style={{ background: `${tierColor}15`, border: `1px solid ${tierColor}40` }}>
                        <span className="text-[8px] text-white/40 uppercase">TIER</span>
                        <span className="text-sm font-black" style={{ color: tierColor }}>{currentRegion.tier}</span>
                    </div>
                </div>

                {/* Stats Header */}
                <div className="stats-bar">
                    <div className="stat-item">
                        <span className="stat-label">DEPTH</span>
                        <span className="stat-value">{depth}/20</span>
                    </div>
                    <div className="stat-item realm-badge" style={{ borderColor: currentRegion.color }}>
                        <span className="stat-label">LOOT</span>
                        <span className="stat-value" style={{ color: tierColor }}>{currentRegion.lootMult}x</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">LEVEL</span>
                        <span className="stat-value">{userStats.level}</span>
                    </div>
                </div>

                {/* Hazard Warning (if not safe zone) */}
                {currentRegion.hazard && (
                    <div className="w-full max-w-[350px] my-2 px-3 py-1.5 rounded-lg flex items-center gap-2"
                        style={{
                            background: `${tierColor}10`,
                            border: `1px solid ${tierColor}30`
                        }}>
                        <span className="text-[10px]">⚠️</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: `${tierColor}cc` }}>
                            {currentRegion.hazard}
                        </span>
                    </div>
                )}

                {/* XP Progress */}
                <div className="xp-section flex justify-center w-full px-6">
                    <ExperienceBar
                        currentXp={userStats.exp || 0}
                        nextLevelXp={userStats.nextLevelXp || 1000}
                        level={userStats.level || 1}
                        rank={userStats.rank || 'Novice'}
                    />
                </div>

                {/* HP Bars */}
                <div className="hp-section">
                    <div className="hp-bar party">
                        <span>🛡️ PARTY</span>
                        <div className="hp-bar-container">
                            <div className="hp-fill" style={{ width: `${partyHP}%` }} />
                        </div>
                        <span>{partyHP}/100</span>
                    </div>

                    {boss && (
                        <div className="hp-bar boss">
                            <span>⚔️ {boss.name}</span>
                            <div className="hp-bar-container">
                                <div className="hp-fill boss-hp" style={{ width: `${progressBar(boss.hp, boss.maxHp)}%` }} />
                            </div>
                            <span>{boss.hp}/{boss.maxHp}</span>
                        </div>
                    )}

                    {!boss && (
                        <div className="area-clear">
                            ✨ Area Clear — Tap to advance!
                        </div>
                    )}
                </div>

                {/* Last Action */}
                {lastAction && (
                    <div className="last-action">
                        {lastAction}
                    </div>
                )}

                {/* TAP BUTTON */}
                <button
                    className={`tap-button ${!canTap ? 'disabled' : ''} ${tapAnimation ? 'tapped' : ''}`}
                    onClick={handleTap}
                    disabled={!canTap}
                >
                    <div className="relative w-full h-full rounded-full overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.6)] border-4"
                        style={{ borderColor: `${currentRegion.color}60` }}>
                        <video autoPlay loop muted playsInline className="w-full h-full object-cover scale-110">
                            <source src="/assets/tokens/tap_loop.mp4" type="video/mp4" />
                        </video>
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-50 pointer-events-none" />
                    </div>

                    {!canTap && (
                        <div className="cooldown-overlay">
                            <span className="cooldown-num">{cooldown}</span>
                            <span className="tap-text-cd">RECHARGING</span>
                        </div>
                    )}
                </button>

                {/* Actions Grid */}
                <div className="actions-grid">
                    <div className="action-btn" onClick={handleTap}>
                        <span>👆</span>
                        <span>TAP</span>
                        <span className="xp-gain">+{effectiveXp} XP</span>
                    </div>
                    <div className="action-btn">
                        <span>💎</span>
                        <span>HOLD</span>
                        <span className="xp-gain">+{effectiveXp * 2} XP</span>
                    </div>
                    <div className="action-btn">
                        <span>💰</span>
                        <span>BUY</span>
                        <span className="xp-gain">+{Math.floor(15 * (currentRegion.lootMult || 1))} DMG</span>
                    </div>
                    <div className="action-btn" onClick={() => level >= 10 && setShowSkills(true)}>
                        <span>📖</span>
                        <span>SKILLS</span>
                        <span className="xp-gain">{level >= 10 ? 'OPEN' : 'LV10'}</span>
                    </div>
                </div>

            </div>
            {showSkills && renderSkillTree()}

            <style>{`
                .tap2earn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 1rem;
                    min-height: 100vh;
                    color: white;
                    font-family: 'Outfit', sans-serif;
                    transition: background 0.5s ease;
                }

                /* Ambient Particles */
                .particle {
                    position: absolute;
                    left: var(--x);
                    top: -10px;
                    width: var(--size);
                    height: var(--size);
                    background: var(--color);
                    border-radius: 50%;
                    opacity: var(--opacity);
                    animation: particle-fall var(--duration) linear var(--delay) infinite;
                }
                @keyframes particle-fall {
                    0% { transform: translateY(-10px) translateX(0); opacity: var(--opacity); }
                    50% { transform: translateY(50vh) translateX(20px); opacity: var(--opacity); }
                    100% { transform: translateY(100vh) translateX(-10px); opacity: 0; }
                }

                /* Stats Bar */
                .stats-bar {
                    display: flex;
                    gap: 1rem;
                    margin: 0.5rem 0;
                }
                .stat-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 0.5rem 1rem;
                    background: rgba(0,0,0,0.3);
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .realm-badge { border: 2px solid; }
                .stat-label {
                    font-size: 0.6rem;
                    color: rgba(255,255,255,0.6);
                    text-transform: uppercase;
                }
                .stat-value {
                    font-size: 0.85rem;
                    font-weight: bold;
                }

                /* XP Section */
                .xp-section {
                    width: 100%;
                    max-width: 350px;
                    margin: 0.5rem 0;
                }
                .xp-label {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.75rem;
                    margin-bottom: 0.3rem;
                }
                .xp-bar-container {
                    height: 14px;
                    background: rgba(0,0,0,0.4);
                    border-radius: 7px;
                    border: 1px solid rgba(201,162,39,0.3);
                    overflow: hidden;
                    position: relative;
                }
                .xp-bar-fill {
                    height: 100%;
                    border-radius: 7px;
                    transition: width 0.3s ease;
                }
                .xp-bar-glow {
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    opacity: 0.3;
                    filter: blur(4px);
                }

                /* HP Section */
                .hp-section {
                    width: 100%;
                    max-width: 350px;
                    margin: 0.5rem 0;
                }
                .hp-bar {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.7rem;
                    margin: 0.3rem 0;
                }
                .hp-bar-container {
                    flex: 1;
                    height: 10px;
                    background: rgba(0,0,0,0.4);
                    border-radius: 5px;
                    overflow: hidden;
                }
                .hp-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #22c55e, #84cc16);
                    transition: width 0.3s;
                }
                .hp-fill.boss-hp {
                    background: linear-gradient(90deg, #ef4444, #f97316);
                }
                .area-clear {
                    text-align: center;
                    padding: 0.8rem;
                    background: rgba(168,85,247,0.1);
                    border: 1px solid rgba(168,85,247,0.3);
                    border-radius: 8px;
                    color: #a855f7;
                    font-size: 0.85rem;
                }

                /* Last Action */
                .last-action {
                    padding: 0.5rem 1rem;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(201,162,39,0.3);
                    border-radius: 8px;
                    font-size: 0.8rem;
                    margin: 0.5rem 0;
                }

                /* TAP Button */
                .tap-button {
                    width: 220px;
                    height: 220px;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    margin: 1rem 0;
                    transition: all 0.1s cubic-bezier(0.34, 1.56, 0.64, 1);
                    position: relative;
                    z-index: 20;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .tap-button:active { transform: scale(0.92); }
                .tap-button.tapped { transform: scale(0.95); }

                /* Cooldown Overlay */
                .cooldown-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.7);
                    backdrop-filter: blur(4px);
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid #ef4444;
                }
                .cooldown-num {
                    font-size: 3rem;
                    font-weight: 900;
                    color: #ef4444;
                    text-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
                }
                .tap-text-cd {
                    font-size: 1rem;
                    font-weight: bold;
                    color: #fca5a5;
                    letter-spacing: 2px;
                }

                /* Actions Grid */
                .actions-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 0.5rem;
                    width: 100%;
                    max-width: 350px;
                    margin-top: 1rem;
                }
                .action-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 0.6rem;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(201,162,39,0.2);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .action-btn:hover {
                    background: rgba(168,85,247,0.2);
                    border-color: #a855f7;
                }
                .action-btn span:first-child { font-size: 1.2rem; }
                .action-btn span:nth-child(2) {
                    font-size: 0.65rem;
                    font-weight: bold;
                    color: rgba(255,255,255,0.8);
                }
                .xp-gain {
                    font-size: 0.55rem;
                    color: #22c55e;
                }

                /* Skill Tree Panel */
                .skill-tree-panel {
                    position: fixed;
                    bottom: 0; left: 0; right: 0;
                    background: linear-gradient(to top, #0f0f23 0%, rgba(15,15,35,0.95) 100%);
                    border-top: 2px solid #c9a227;
                    padding: 1rem;
                    animation: slideUp 0.3s ease;
                    z-index: 50;
                }
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .skill-tree-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                .skill-tree-header h3 {
                    margin: 0;
                    font-size: 1rem;
                    color: #c9a227;
                }
                .skill-tree-header button {
                    background: transparent;
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 0.3rem 0.6rem;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .skill-tree-nodes {
                    display: flex;
                    justify-content: space-around;
                    gap: 0.5rem;
                }
                .skill-node {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.3rem;
                }
                .node-circle {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 2px solid rgba(255,255,255,0.2);
                    background: rgba(0,0,0,0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    color: rgba(255,255,255,0.4);
                }
                .skill-node.unlocked .node-circle {
                    border-color: #22c55e;
                    background: rgba(34,197,94,0.2);
                    color: #22c55e;
                }
                .skill-node span:last-child {
                    font-size: 0.6rem;
                    color: rgba(255,255,255,0.6);
                    text-align: center;
                }
            `}</style>
        </div>
    );
}
