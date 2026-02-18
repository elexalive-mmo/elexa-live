import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Filter, Diamond, Zap, Shield, Flame, Droplets, Wind, Sparkles, Lock } from 'lucide-react';

// --- Genesis Data (Mocked from Treasury) ---
const LISTINGS = [
    { id: 'neonix_0000', name: 'Neonix #0000', tier: 'Legendary', element: 'Spirit', price: 50.0, image: 'https://gateway.pinata.cloud/ipfs/bafkreifsvwv3tacb3ruki77csvsr', seller: 'Jefe (Treasury)' },
    { id: 'frost_088_1', name: 'Frostbyte #088', tier: 'Elite', element: 'Ice', price: 8.88, image: 'https://gateway.pinata.cloud/ipfs/bafkreifsvwv3tacb3ruki77csvsr', seller: 'Jefe (Treasury)', edition: '#1/7' },
    { id: 'frost_088_2', name: 'Frostbyte #088', tier: 'Elite', element: 'Ice', price: 9.50, image: 'https://gateway.pinata.cloud/ipfs/bafkreifsvwv3tacb3ruki77csvsr', seller: 'Jefe (Treasury)', edition: '#2/7' },
    { id: 'frost_088_3', name: 'Frostbyte #088', tier: 'Elite', element: 'Ice', price: 10.0, image: 'https://gateway.pinata.cloud/ipfs/bafkreifsvwv3tacb3ruki77csvsr', seller: 'Jefe (Treasury)', edition: '#3/7' },
];

const RARITY_COLORS = {
    'Legendary': 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.2)]',
    'Elite': 'border-violet-400 shadow-[0_0_15px_rgba(167,139,250,0.2)]',
    'Common': 'border-slate-600',
};

const ELEMENT_ICONS = {
    'Spirit': <Sparkles size={14} className="text-amber-400" />,
    'Ice': <Droplets size={14} className="text-cyan-400" />,
    'Fire': <Flame size={14} className="text-red-400" />,
    'Wind': <Wind size={14} className="text-green-400" />,
};

const NFTCard = ({ nft }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`relative group bg-[#0a0a10] border ${RARITY_COLORS[nft.tier] || 'border-white/10'} rounded-xl overflow-hidden cursor-pointer`}
        >
            {/* Image Container */}
            <div className="aspect-square relative overflow-hidden bg-black/50">
                {/* Fallback Image / Gradient if link breaks */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 to-amber-900/20" />
                <div className="absolute inset-0 flex items-center justify-center text-white/10 font-black text-4xl uppercase tracking-tighter transform -rotate-12">
                    Elexamon
                </div>

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a10] to-transparent opacity-60" />

                {/* Batch Badge */}
                {nft.edition && (
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur border border-white/10 px-2 py-1 rounded text-[9px] font-mono text-white/80">
                        {nft.edition}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 relative">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-white text-sm tracking-wide">{nft.name}</h3>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                            {ELEMENT_ICONS[nft.element]} {nft.element} • {nft.tier}
                        </div>
                    </div>
                </div>

                {/* Price Mockup */}
                <div className="flex items-center justify-between mt-4 bg-white/5 rounded-lg p-2 border border-white/5 group-hover:border-amber-500/30 transition-colors">
                    <div className="text-[9px] text-slate-500 uppercase">Buy Now</div>
                    <div className="flex items-center gap-1 font-mono font-bold text-white">
                        <img src="https://cryptologos.cc/logos/solana-sol-logo.png?v=026" className="w-3 h-3 grayscale group-hover:grayscale-0 transition-all" alt="SOL" />
                        {nft.price} SOL
                    </div>
                </div>

                {/* Hover Glow */}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </div>
        </motion.div>
    );
};

export default function SoulSwap() {
    const [filter, setFilter] = useState('All');

    return (
        <div className="min-h-screen bg-[#030014] text-white pt-20 pb-32 px-4 md:px-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <div className="max-w-7xl mx-auto mb-12 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Diamond className="text-amber-400" size={24} />
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-500">
                                Soul Swap
                            </h1>
                        </div>
                        <p className="text-slate-400 max-w-md text-sm md:text-base">
                            The premium marketplace for Elexamon. Retrieve lost souls from the Treasury. Verified on-chain via Helius.
                        </p>
                    </div>

                    {/* Stats Ticker */}
                    <div className="flex gap-4 md:gap-8 bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-md">
                        <div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Floor Price</div>
                            <div className="font-mono font-bold text-lg text-white">8.88 SOL</div>
                        </div>
                        <div className="w-px bg-white/10" />
                        <div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">24h Volume</div>
                            <div className="font-mono font-bold text-lg text-emerald-400">142 SOL</div>
                        </div>
                        <div className="w-px bg-white/10" />
                        <div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Listed</div>
                            <div className="font-mono font-bold text-lg text-amber-400">4</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between gap-4 relative z-10">
                {/* Search */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by ID or Name..."
                        className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                    {['All', 'Legendary', 'Elite', 'Rare', 'Common'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${filter === f
                                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 relative z-10">
                {LISTINGS.map((nft) => (
                    <NFTCard key={nft.id} nft={nft} />
                ))}

                {/* Placeholder / Empty State for grid fullness */}
                {[1, 2, 3, 4].map(i => (
                    <div key={`empty-${i}`} className="aspect-square rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-center opacity-30">
                        <Lock size={24} className="text-white/20" />
                    </div>
                ))}
            </div>
        </div>
    );
}
