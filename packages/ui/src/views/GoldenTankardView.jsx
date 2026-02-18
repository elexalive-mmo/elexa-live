import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Hammer, Sparkles, Map, Zap, Moon, ScrollText, ShoppingCart } from 'lucide-react';

/**
 * The Golden Tankard — Central Hub
 * "Elexa Chronicles: Origins of the Sacred Hall"
 */
const GoldenTankardView = ({ user = {}, onNavigate }) => {
    const [hoveredNode, setHoveredNode] = useState(null);
    const [showQuestBoard, setShowQuestBoard] = useState(false);
    const [showMarketplace, setShowMarketplace] = useState(false);
    const [marketListings, setMarketListings] = useState({ land: [], elexamon: [] });
    const [marketTab, setMarketTab] = useState('land'); // 'land' or 'elexamon'

    const fetchMarketings = async () => {
        try {
            const lRes = await fetch('/api/marketplace/land');
            const lData = await lRes.json();
            const eRes = await fetch('/api/marketplace/elexamon');
            const eData = await eRes.json();

            setMarketListings({
                land: lData.listings || [],
                elexamon: eData.listings || []
            });
        } catch (e) {
            console.error('Marketplace sync failed', e);
        }
    };

    const DAILY_QUESTS = [
        { id: 'q_tavern_talk', title: 'Aetheric Whisper', reward: 50, desc: 'Commune with Elexa regarding the ancient Chronicles.' },
        { id: 'q_bounty', title: 'Titan Slayer', reward: 100, desc: 'Banish a Primal Titan from the regional borders.' },
        { id: 'q_explorer', title: 'Realm Strider', reward: 150, desc: 'Tread upon 5 undiscovered tiles in the Tundra.' },
    ];

    const TAVERN_NODES = [
        { id: 'quest_board', name: 'Quest Board', icon: <Sparkles />, desc: 'Sacred Tasks', color: 'text-crystal-cyan' },
        { id: 'marketplace', name: 'Marketplace', icon: <ShoppingCart />, desc: 'Trade & Claim', color: 'text-emerald-400' },
        { id: 'pack_hall', name: 'Pack Hall', icon: <Users />, desc: 'Bonds of the Soul', color: 'text-aetheric-purple' },
        { id: 'blacksmith', name: 'The Forge', icon: <Hammer />, desc: 'Arcane Crafting', color: 'text-celestial-gold' },
        { id: 'world_map', name: 'World Map', icon: <Map />, desc: 'The Great Tapestry', color: 'text-emerald-500' },
    ];

    const showNexus = (user.level || 1) >= 10;

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden font-body">
            {/* Ambient Atmosphere */}
            <div className="absolute inset-0 z-0 bg-aether opacity-60 pointer-events-none" />

            {/* Background Texture/Art */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center mix-blend-overlay opacity-30 pointer-events-none"
                style={{ backgroundImage: "url('/assets/backgrounds/bg_celestial_hall.jpg')" }}
            />

            {/* Main Tavern Content */}
            <div className="z-10 w-full max-w-6xl px-10 flex flex-col items-center gap-12">
                <motion.header
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="text-center"
                >
                    <div className="flex items-center justify-center gap-6 mb-4">
                        <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-celestial-gold/40 to-transparent" />
                        <h1 className="fantasy-title text-6xl tracking-[0.1em]">
                            THE GOLDEN TANKARD
                        </h1>
                        <div className="h-[1px] w-20 bg-gradient-to-l from-transparent via-celestial-gold/40 to-transparent" />
                    </div>
                    <p className="text-[11px] font-bold text-celestial-gold/30 uppercase tracking-[0.6em] italic">
                        The Sacred Hall of Chronicles
                    </p>
                </motion.header>

                {/* Interaction Nodes */}
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 w-full">
                    {TAVERN_NODES.map((node, i) => (
                        <motion.button
                            key={node.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            onMouseEnter={() => setHoveredNode(node.id)}
                            onMouseLeave={() => setHoveredNode(null)}
                            onClick={() => {
                                if (node.id === 'quest_board') setShowQuestBoard(true);
                                else if (node.id === 'marketplace') {
                                    setShowMarketplace(true);
                                    fetchMarketings();
                                }
                                else onNavigate(node.id);
                            }}
                            className="bg-black/30 backdrop-blur-3xl border border-white/5 hover:border-celestial-gold/40 rounded-[2.5rem] p-8 transition-all duration-500 flex flex-col items-center gap-6 relative group"
                        >
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-black/40 border border-white/5 group-hover:bg-celestial-gold/10 group-hover:border-celestial-gold/30 transition-all duration-500 shadow-xl ${node.color}`}>
                                {React.cloneElement(node.icon, { size: 36 })}
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-white group-hover:text-celestial-gold transition-colors font-heading tracking-wide">{node.name}</h3>
                                <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-1 italic">{node.desc}</p>
                            </div>

                            {/* Hover Sparkle */}
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        </motion.button>
                    ))}

                    {/* The Nexus — Episodic High Fantasy */}
                    {showNexus && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            onClick={() => onNavigate('nexus')}
                            className="bg-celestial-gold/5 backdrop-blur-3xl border-2 border-celestial-gold/20 hover:border-celestial-gold/60 rounded-[2.5rem] p-8 transition-all duration-500 flex flex-col items-center gap-6 relative group overflow-hidden"
                        >
                            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-celestial-gold/10 border border-celestial-gold/40 group-hover:scale-110 shadow-[0_0_30px_rgba(250,204,21,0.2)] transition-all duration-700 text-celestial-gold">
                                <Moon size={36} fill="currentColor" className="opacity-80" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-celestial-gold font-heading tracking-[0.1em]">THE NEXUS</h3>
                                <p className="text-[10px] text-celestial-gold/40 uppercase tracking-[0.3em] mt-1 font-bold">Divine Path</p>
                            </div>

                            {/* Pulse Effect */}
                            <div className="absolute inset-0 bg-celestial-gold/5 animate-pulse" />
                        </motion.button>
                    )}
                </div>

                {/* The Keeper's Welcome */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-black/40 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/5 max-w-2xl text-center shadow-3xl"
                >
                    <p className="text-[15px] text-white/50 leading-relaxed italic font-serif">
                        "Welcome to the Tankard, Noble Soul. Quench thy thirst for glory, study the sacred boards, and prepare for the next cycle.
                        The Aetheric weave of Elexa awaits thy touch."
                    </p>
                </motion.div>
            </div>

            {/* Overlays */}
            <AnimatePresence>
                {showQuestBoard && (
                    <motion.div
                        key="quest-board"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.98, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-black/60 border border-celestial-gold/20 w-full max-w-xl p-12 rounded-[3.5rem] relative shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden"
                        >
                            {/* Decor */}
                            <div className="absolute top-0 left-0 w-32 h-32 bg-celestial-gold/5 blur-[80px]" />

                            <button
                                onClick={() => setShowQuestBoard(false)}
                                className="absolute top-8 right-8 text-white/20 hover:text-celestial-gold transition-colors"
                            >
                                <Zap size={24} className="rotate-45" />
                            </button>

                            <div className="text-center mb-10">
                                <h2 className="fantasy-title text-4xl mb-2 flex items-center justify-center gap-4">
                                    <ScrollText className="text-celestial-gold" /> ACCOUNTS OF BATTLE
                                </h2>
                                <p className="text-[10px] text-celestial-gold/30 tracking-[0.4em] uppercase font-bold">Thy Sacred Duties</p>
                            </div>

                            <div className="space-y-6">
                                {DAILY_QUESTS.map((q, i) => (
                                    <motion.div
                                        key={q.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="p-6 rounded-[2rem] bg-white/2 border border-white/5 hover:border-celestial-gold/20 transition-all duration-500 group"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="text-[16px] font-bold text-white font-heading tracking-wide group-hover:text-celestial-gold transition-colors">{q.title}</h4>
                                            <span className="text-[11px] font-bold text-celestial-gold/80 tracking-widest">+{q.reward} ESSENCE</span>
                                        </div>
                                        <p className="text-[13px] text-white/30 mb-5 italic font-body tracking-wide">{q.desc}</p>
                                        <button
                                            onClick={() => {
                                                onNavigate(q.id);
                                                setShowQuestBoard(false);
                                            }}
                                            className="w-full py-4 rounded-2xl bg-celestial-gold/10 border border-celestial-gold/20 text-celestial-gold text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-celestial-gold hover:text-black hover:tracking-[0.4em] transition-all duration-500 font-heading"
                                        >
                                            ACCEPT THE SACRED DEED
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {showMarketplace && (
                    <motion.div
                        key="marketplace"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.98, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-black/60 border border-emerald-500/20 w-full max-w-2xl p-12 rounded-[3.5rem] relative shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[80vh]"
                        >
                            <button
                                onClick={() => setShowMarketplace(false)}
                                className="absolute top-8 right-8 text-white/20 hover:text-emerald-400 transition-colors"
                            >
                                <Zap size={24} className="rotate-45" />
                            </button>

                            <div className="text-center mb-10">
                                <h2 className="fantasy-title text-4xl mb-2 flex items-center justify-center gap-4">
                                    <ShoppingCart className="text-emerald-400" /> THE MARKETPLACE
                                </h2>
                                <p className="text-[10px] text-emerald-400/30 tracking-[0.4em] uppercase font-bold">Live Listings from the Chain</p>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-4 mb-8">
                                <button
                                    onClick={() => setMarketTab('land')}
                                    className={`flex-1 py-3 rounded-xl border transition-all ${marketTab === 'land' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/10 text-white/40'}`}
                                >
                                    LAND CLAIMS
                                </button>
                                <button
                                    onClick={() => setMarketTab('elexamon')}
                                    className={`flex-1 py-3 rounded-xl border transition-all ${marketTab === 'elexamon' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-white/5 border-white/10 text-white/40'}`}
                                >
                                    ELEXAMON
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                {marketTab === 'land' ? (
                                    marketListings.land.length > 0 ? (
                                        marketListings.land.map(listing => (
                                            <div key={listing.id} className="p-6 rounded-2xl bg-white/2 border border-white/5 flex justify-between items-center hover:border-emerald-500/40 transition-all">
                                                <div>
                                                    <h4 className="text-white font-bold">{listing.name}</h4>
                                                    <p className="text-[11px] text-white/40 uppercase tracking-widest">{listing.biome} • {listing.structures.length}/5 Structures</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-emerald-400 font-bold mb-2">{listing.price} SOL</p>
                                                    <button className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold uppercase hover:bg-emerald-500 hover:text-black transition-all">CLAIM LAND</button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-white/20 text-center py-10 italic">Searching for available Land claims...</p>
                                    )
                                ) : (
                                    marketListings.elexamon.length > 0 ? (
                                        marketListings.elexamon.map(mon => (
                                            <div key={mon.id} className="p-6 rounded-2xl bg-white/2 border border-white/5 flex justify-between items-center hover:border-purple-500/40 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                                                        <span className="text-2xl opacity-50">✨</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-bold">{mon.name}</h4>
                                                        <p className="text-[11px] text-white/40 uppercase tracking-widest">{mon.element} • {mon.tier} • {mon.type}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-purple-400 font-bold mb-2">{mon.price} SOL</p>
                                                    <button className="px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/40 text-purple-400 text-[10px] font-bold uppercase hover:bg-purple-500 hover:text-black transition-all">MINT MON</button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-white/20 text-center py-10 italic">No Elexamon manifestations active...</p>
                                    )
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Horizon */}
            <div className="absolute bottom-0 w-full h-48 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        </div>
    );
};

export default GoldenTankardView;
