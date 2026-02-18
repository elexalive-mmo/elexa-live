import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ElexamonCard from '../components/ElexamonCard';

// ═══════════════════════════════════════════════════════════════
// MANIFESTATION HUB — The Path of the Origin
// ═══════════════════════════════════════════════════════════════

const ManifestationHub = ({ user, gameState, onAction }) => {
    const [selectedEgg, setSelectedEgg] = useState(null);
    const [selectionStep, setSelectionStep] = useState('list'); // 'list', 'pick', 'confirm'
    const [filter, setFilter] = useState('all');

    const manifestations = user?.inventory?.filter(i => i.type === 'EGG') || [];

    // OG 144 Pool (Simplified preview for selection)
    // We'll pull these from the game state if provided, or use placeholders
    const pool = gameState?.elexamonPool || [];

    const handleClaim = async (elexamonId) => {
        if (!selectedEgg) return;

        try {
            const res = await fetch('/api/action/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id || 'justin',
                    eggInstanceId: selectedEgg.instanceId,
                    elexamonId: elexamonId
                })
            });
            const data = await res.json();
            if (data.success) {
                onAction?.('MANIFESTED', elexamonId);
                setSelectionStep('list');
                setSelectedEgg(null);
            }
        } catch (e) {
            console.error('Claim failed:', e);
        }
    };

    return (
        <div className="flex flex-col h-full bg-black/40 backdrop-blur-md p-6 overflow-y-auto custom-scrollbar">
            <header className="mb-8">
                <h1 className="text-3xl font-black text-white tracking-widest uppercase italic">
                    Manifestation <span className="text-purple-500">Hub</span>
                </h1>
                <p className="text-purple-300/60 text-sm">Bond with your First Generation companions.</p>
            </header>

            {selectionStep === 'list' && (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span>🥚</span> Available Manifestations
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {manifestations.map(egg => (
                            <motion.div
                                key={egg.instanceId}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => { setSelectedEgg(egg); setSelectionStep('pick'); }}
                                className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 p-6 rounded-2xl cursor-pointer hover:border-purple-500 transition-colors"
                            >
                                <div className="text-4xl mb-4">🥚</div>
                                <h3 className="text-lg font-bold text-white">{egg.name}</h3>
                                <p className="text-xs text-purple-300/50 mb-4">A chaotic cluster of data waiting to take form.</p>
                                <button className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs uppercase tracking-widest transition-all">
                                    Initiate Bond
                                </button>
                            </motion.div>
                        ))}
                        {manifestations.length === 0 && (
                            <div className="col-span-full py-12 text-center bg-white/5 rounded-2xl border border-white/10 italic text-white/30">
                                "No manifestations detected in your core. Level up to synchronize more."
                            </div>
                        )}
                    </div>
                </div>
            )}

            {selectionStep === 'pick' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSelectionStep('list')}
                            className="text-purple-400 hover:text-white text-xs flex items-center gap-2"
                        >
                            ← Return to Inventory
                        </button>
                        <h2 className="text-xl font-bold text-white">Choose Your Origin</h2>
                    </div>

                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                        {['all', 'Earth', 'Fire', 'Air', 'Water'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f.toLowerCase())}
                                className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${filter === f.toLowerCase() ? 'bg-purple-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {pool.filter(p => filter === 'all' || p.element.toLowerCase() === filter).map(mon => (
                            <ElexamonCard
                                key={mon.id}
                                elexamon={{
                                    ...mon,
                                    tier: 'OG Origin',
                                    element: mon.element.charAt(0).toUpperCase() + mon.element.slice(1)
                                }}
                                size="small"
                                onClick={() => handleClaim(mon.id)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManifestationHub;
