import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, Filter, Star, Swords, Shield, Zap, Heart, X, ChevronDown, Lock } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// THE BESTIARY — 144 Elexamon. Library of Living Conviction.
// ═══════════════════════════════════════════════════════════════

const ELEMENTS = {
    Earth: { color: '#22c55e', icon: '🌱', gradient: 'from-green-600/20 to-emerald-900/20', border: 'border-green-500/30' },
    Fire: { color: '#ef4444', icon: '🔥', gradient: 'from-red-600/20 to-orange-900/20', border: 'border-red-500/30' },
    Water: { color: '#3b82f6', icon: '🌊', gradient: 'from-blue-600/20 to-cyan-900/20', border: 'border-blue-500/30' },
    Wind: { color: '#a78bfa', icon: '💨', gradient: 'from-violet-600/20 to-purple-900/20', border: 'border-violet-500/30' },
    Spirit: { color: '#fbbf24', icon: '✨', gradient: 'from-amber-600/20 to-yellow-900/20', border: 'border-amber-500/30' },
};

const TIERS = {
    Hatchling: { stars: 1, color: '#a3a3a3', label: 'Hatchling' },
    Fledgling: { stars: 2, color: '#22c55e', label: 'Fledgling' },
    Elder: { stars: 3, color: '#3b82f6', label: 'Elder' },
    Ascended: { stars: 4, color: '#a855f7', label: 'Ascended' },
    Legendary: { stars: 5, color: '#f59e0b', label: 'Legendary' },
    LEGENDARY: { stars: 5, color: '#f59e0b', label: 'Legendary' },
    Mythic: { stars: 6, color: '#ef4444', label: 'Mythic' },
};

const TOTAL_SLOTS = 144;
const API_BASE = window.location.origin.includes('localhost') ? 'http://localhost:3020' : window.location.origin;

const BestiaryView = () => {
    const [creatures, setCreatures] = useState([]);
    const [selectedCreature, setSelectedCreature] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [elementFilter, setElementFilter] = useState('All');
    const [tierFilter, setTierFilter] = useState('All');
    const [loading, setLoading] = useState(true);

    // Fetch creatures from the backend database
    useEffect(() => {
        const fetchCreatures = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/elexamon/database`);
                const data = await res.json();
                if (data.creatures) {
                    setCreatures(data.creatures);
                }
            } catch (e) {
                console.warn('[Bestiary] API offline — loading from local data');
                // Fallback: try loading the JSON directly
                try {
                    const res = await fetch('/data/elexamon-database.json');
                    const data = await res.json();
                    if (data.creatures) setCreatures(data.creatures);
                } catch (e2) {
                    console.warn('[Bestiary] Fallback also failed');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchCreatures();
    }, []);

    // Filtered + searched creatures
    const filteredCreatures = useMemo(() => {
        return creatures.filter(c => {
            const matchSearch = searchQuery === '' ||
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.id.includes(searchQuery);
            const matchElement = elementFilter === 'All' || c.element === elementFilter;
            const matchTier = tierFilter === 'All' || c.tier === tierFilter || c.tier?.toUpperCase() === tierFilter.toUpperCase();
            return matchSearch && matchElement && matchTier;
        });
    }, [creatures, searchQuery, elementFilter, tierFilter]);

    // Build the 144-slot grid
    const gridSlots = useMemo(() => {
        const slots = [];
        for (let i = 1; i <= TOTAL_SLOTS; i++) {
            const id = String(i).padStart(3, '0');
            const creature = filteredCreatures.find(c => c.id === id);
            slots.push({ slotId: id, creature: creature || null });
        }
        return slots;
    }, [filteredCreatures]);

    const discoveredCount = creatures.length;
    const discoveryPercent = Math.round((discoveredCount / TOTAL_SLOTS) * 100);

    return (
        <div className="w-full h-full overflow-y-auto font-body scrollbar-none">

            {/* ── Library Header with Celestial Visual ── */}
            <div className="relative overflow-hidden">
                {/* Background — Celestial Sanctum aesthetic */}
                <div className="absolute inset-0 bg-aether opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020205] to-[#020205]" />
                <img
                    src="/assets/backgrounds/library.png"
                    alt=""
                    className="absolute inset-0 w-full h-64 object-cover opacity-10 blur-md grayscale"
                />

                <div className="relative z-10 px-8 pt-8 pb-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <BookOpen size={24} className="text-celestial-gold" />
                                <h1 className="fantasy-title text-4xl tracking-wider">
                                    THE SACRED BESTIARY
                                </h1>
                            </div>
                            <p className="text-white/20 text-[11px] font-bold uppercase tracking-[0.4em] italic pl-10">
                                Chronicles of Living Conviction — {discoveredCount}/{TOTAL_SLOTS} Revealed
                            </p>
                        </div>

                        {/* Discovery Progress */}
                        <div className="text-right shrink-0">
                            <span className="text-celestial-gold text-2xl font-bold font-heading">{discoveryPercent}%</span>
                            <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden mt-2 border border-white/5">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-aetheric-purple to-celestial-gold rounded-full shadow-[0_0_15px_rgba(250,204,21,0.4)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${discoveryPercent}%` }}
                                    transition={{ duration: 1.5, ease: 'easeOut' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Filters Bar ── */}
                    <div className="flex flex-wrap items-center gap-4 mt-8">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[240px] max-w-sm">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                            <input
                                type="text"
                                placeholder="Whisper a name or sequence..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 text-[11px] bg-white/[0.02] border border-white/10 rounded-[1.5rem]
                                           text-white/80 placeholder:text-white/10 focus:outline-none focus:border-celestial-gold/30
                                           transition-all font-body tracking-wider"
                            />
                        </div>

                        {/* Element Filter */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setElementFilter('All')}
                                className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all font-heading border
                                    ${elementFilter === 'All' ? 'bg-celestial-gold/10 text-celestial-gold border-celestial-gold/30' : 'text-white/20 border-white/5 hover:text-white/40 hover:bg-white/5'}`}
                            >
                                All
                            </button>
                            {Object.entries(ELEMENTS).map(([name, el]) => (
                                <button
                                    key={name}
                                    onClick={() => setElementFilter(elementFilter === name ? 'All' : name)}
                                    title={name}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all border
                                        ${elementFilter === name
                                            ? 'bg-white/10 border-white/20 scale-110 shadow-xl'
                                            : 'border-white/5 hover:bg-white/5 opacity-40 hover:opacity-80'
                                        }`}
                                >
                                    {el.icon}
                                </button>
                            ))}
                        </div>

                        {/* Tier Filter */}
                        <select
                            value={tierFilter}
                            onChange={(e) => setTierFilter(e.target.value)}
                            className="pl-4 pr-10 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]
                                       bg-white/[0.02] border border-white/10 text-white/40 focus:outline-none appearance-none cursor-pointer font-heading"
                        >
                            <option value="All">Divine Tiers</option>
                            <option value="Hatchling">Hatchling</option>
                            <option value="Fledgling">Fledgling</option>
                            <option value="Elder">Elder</option>
                            <option value="Ascended">Ascended</option>
                            <option value="Legendary">Legendary</option>
                            <option value="Mythic">Mythic</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ── 144-Slot Grid ── */}
            <div className="px-4 md:px-6 pb-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                        >
                            <BookOpen size={24} className="text-amber-400/50" />
                        </motion.div>
                        <span className="ml-3 text-white/30 text-sm">Deciphering ancient pages...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5">
                        {gridSlots.map(({ slotId, creature }) => (
                            <CreatureSlot
                                key={slotId}
                                slotId={slotId}
                                creature={creature}
                                isSelected={selectedCreature?.id === slotId}
                                onClick={() => creature && setSelectedCreature(creature)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Creature Detail Modal ── */}
            <AnimatePresence>
                {selectedCreature && (
                    <CreatureDetailModal
                        creature={selectedCreature}
                        onClose={() => setSelectedCreature(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// ── Individual Creature Slot ──
const CreatureSlot = ({ slotId, creature, isSelected, onClick }) => {
    const element = creature ? ELEMENTS[creature.element] : null;
    const tier = creature ? (TIERS[creature.tier] || TIERS.Hatchling) : null;

    if (!creature) {
        // Empty/undiscovered slot
        return (
            <div className="aspect-square rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center
                            relative group cursor-default">
                <Lock size={10} className="text-white/10" />
                <span className="absolute bottom-0.5 right-1 text-[7px] text-white/10 font-mono">#{slotId}</span>
            </div>
        );
    }

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`
                aspect-square rounded-lg border relative overflow-hidden cursor-pointer group transition-all duration-200
                ${isSelected ? 'ring-2 ring-amber-400/60' : ''}
                ${element?.border || 'border-white/10'}
            `}
            style={{
                background: `linear-gradient(135deg, ${element?.color}15, ${element?.color}05)`,
            }}
        >
            {/* Creature Image or Emoji Fallback */}
            {creature.image ? (
                <img
                    src={creature.image}
                    alt={creature.name}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    loading="lazy"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <span className="text-lg opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all">
                        {element?.icon || '?'}
                    </span>
                </div>
            )}

            {/* ID Badge */}
            <div className="absolute top-0.5 left-0.5 px-1 py-0.5 rounded bg-black/60 text-[7px] text-white/50 font-mono">
                #{slotId}
            </div>

            {/* Tier Stars */}
            <div className="absolute bottom-0.5 right-0.5 flex gap-0.5">
                {Array.from({ length: tier?.stars || 0 }).map((_, i) => (
                    <Star key={i} size={6} fill={tier?.color} stroke="none" />
                ))}
            </div>

            {/* Hover tooltip */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1
                            opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className="text-[8px] text-white font-semibold leading-none block truncate">{creature.name}</span>
            </div>

            {/* Element color glow on hover */}
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ boxShadow: `inset 0 0 12px ${element?.color}30` }} />
        </motion.button>
    );
};

// ── Creature Detail Modal ──
const CreatureDetailModal = ({ creature, onClose }) => {
    const element = ELEMENTS[creature.element] || ELEMENTS.Earth;
    const tier = TIERS[creature.tier] || TIERS.Hatchling;
    const stats = creature.stats || creature.baseStats || {};

    const statEntries = [
        { key: 'hp', label: 'HP', icon: Heart, color: '#ef4444', value: stats.hp || 0 },
        { key: 'atk', label: 'ATK', icon: Swords, color: '#f97316', value: stats.atk || stats.attack || 0 },
        { key: 'def', label: 'DEF', icon: Shield, color: '#3b82f6', value: stats.def || stats.defense || 0 },
        { key: 'spd', label: 'SPD', icon: Zap, color: '#22c55e', value: stats.spd || 0 },
        { key: 'spa', label: 'SPA', icon: Star, color: '#a855f7', value: stats.spa || stats.magic || 0 },
        { key: 'int', label: 'INT', icon: BookOpen, color: '#fbbf24', value: stats.int || 0 },
    ];

    const maxStat = Math.max(...statEntries.map(s => s.value), 1);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg rounded-2xl overflow-hidden border border-white/[0.08]"
                style={{
                    background: `linear-gradient(135deg, #0a0a12, ${element.color}10, #0a0a12)`,
                    boxShadow: `0 0 60px ${element.color}15`,
                }}
            >
                {/* Header with Image */}
                <div className="relative h-48 overflow-hidden">
                    {creature.image ? (
                        <img src={creature.image} alt={creature.name}
                            className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br"
                            style={{ background: `linear-gradient(135deg, ${element.color}20, transparent)` }}>
                            <span className="text-6xl">{element.icon}</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12] via-transparent to-transparent" />

                    {/* Close button */}
                    <button onClick={onClose}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center
                                       text-white/60 hover:text-white hover:bg-black/80 transition-all">
                        <X size={16} />
                    </button>

                    {/* Name + Meta overlay */}
                    <div className="absolute bottom-3 left-4 right-4">
                        <div className="flex items-end justify-between">
                            <div>
                                <span className="text-[10px] font-mono text-white/30 block">#{creature.id}</span>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">{creature.name}</h2>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm">{element.icon}</span>
                                <span className="text-xs font-semibold" style={{ color: element.color }}>{creature.element}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4">
                    {/* Tier + Rarity + Signature Move */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.04]">
                            {Array.from({ length: tier.stars }).map((_, i) => (
                                <Star key={i} size={10} fill={tier.color} stroke="none" />
                            ))}
                            <span className="text-[10px] font-bold text-white/50 ml-1 uppercase">{tier.label}</span>
                        </div>
                        {creature.rarity && (
                            <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-white/[0.04] text-white/40">
                                {creature.rarity}
                            </span>
                        )}
                        {creature.signatureMove && (
                            <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-amber-500/10 text-amber-300/70">
                                ⚔ {creature.signatureMove}
                            </span>
                        )}
                    </div>

                    {/* Visual Description / Lore */}
                    {(creature.visualPrompt || creature.lore) && (
                        <p className="text-white/40 text-xs leading-relaxed italic border-l-2 pl-3"
                            style={{ borderColor: `${element.color}40` }}>
                            "{creature.visualPrompt || creature.lore}"
                        </p>
                    )}

                    {/* Stats */}
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">Base Stats</h4>
                        {statEntries.map(({ key, label, icon: Icon, color, value }) => (
                            <div key={key} className="flex items-center gap-2">
                                <div className="w-12 flex items-center gap-1">
                                    <Icon size={10} style={{ color }} />
                                    <span className="text-[10px] font-bold text-white/40">{label}</span>
                                </div>
                                <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: color }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(value / maxStat) * 100}%` }}
                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                    />
                                </div>
                                <span className="text-[10px] font-mono text-white/40 w-6 text-right">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default BestiaryView;
