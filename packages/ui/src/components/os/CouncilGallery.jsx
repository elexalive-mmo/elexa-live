import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Shield, Crown, Check, X, Loader2, ChevronLeft, ChevronRight, Globe } from 'lucide-react';

/**
 * ═══════════════════════════════════════════════════════════
 * COUNCIL GALLERY — The Seat of Manifestation
 * ═══════════════════════════════════════════════════════════
 * High-fidelity interface for community art review.
 */
export const CouncilGallery = ({ onManifest }) => {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [name, setName] = useState('');
    const [isManifesting, setIsManifesting] = useState(false);

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const res = await fetch('http://localhost:3020/api/council/queue');
                const data = await res.json();
                if (data.success) {
                    setQueue(data.queue);
                }
            } catch (e) {
                console.error('[Council] Failed to fetch queue:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchQueue();
    }, []);

    const handleNext = () => setCurrentIndex(prev => (prev + 1) % queue.length);
    const handlePrev = () => setCurrentIndex(prev => (prev - 1 + queue.length) % queue.length);

    const handleManifestClick = async () => {
        if (!name || queue.length === 0) return;
        setIsManifesting(true);
        const item = queue[currentIndex];

        try {
            const res = await fetch('http://localhost:3020/api/council/manifest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: item.userId,
                    ipfsHash: item.ipfsHash,
                    elexamonName: name
                })
            });
            const data = await res.json();
            if (data.success) {
                // Remove from local queue
                setQueue(prev => prev.filter((_, i) => i !== currentIndex));
                if (currentIndex >= queue.length - 1) setCurrentIndex(0);
                setName('');
                if (onManifest) onManifest(data.submission);
            }
        } catch (e) {
            console.error('[Council] Manifestation failed:', e);
        } finally {
            setIsManifesting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-celestial-gold opacity-50">
                <Loader2 className="animate-spin" size={32} />
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Scanning the Aether...</span>
            </div>
        );
    }

    if (queue.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                    <Shield className="text-white/10" size={32} />
                </div>
                <h3 className="text-sm font-bold text-white/40 uppercase tracking-[0.2em] font-heading">The Tapestry is Empty</h3>
                <p className="text-[11px] text-white/20 italic mt-2">"Waiting for community threads to be submitted..."</p>
            </div>
        );
    }

    const currentItem = queue[currentIndex];

    return (
        <div className="relative h-full flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-celestial-gold/10 border border-celestial-gold/30 rounded-lg">
                        <Crown size={14} className="text-celestial-gold" />
                    </div>
                    <div>
                        <h3 className="text-[12px] font-bold text-white uppercase tracking-[0.2em] font-heading">Council Review</h3>
                        <p className="text-[8px] text-white/20 uppercase tracking-[0.3em] font-bold">{queue.length} Submissions Pending</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handlePrev} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors">
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={handleNext} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Main Display */}
            <div className="flex-1 flex gap-8 overflow-hidden min-h-0">
                {/* Art Preview */}
                <div className="flex-[1.5] relative rounded-[2rem] overflow-hidden border border-white/10 bg-black/40 group">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentItem.ipfsHash}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            src={currentItem.ipfsHash}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                            alt="Submission"
                        />
                    </AnimatePresence>

                    {/* Artistic Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                    <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end">
                        <div>
                            <span className="text-[9px] text-celestial-gold font-bold uppercase tracking-[0.3em] block mb-1">Contributor</span>
                            <span className="text-lg font-bold text-white font-heading">@{currentItem.username}</span>
                        </div>
                        <a
                            href={currentItem.ipfsHash}
                            target="_blank"
                            rel="noreferrer"
                            className="p-3 bg-black/60 backdrop-blur-md border border-white/20 rounded-full hover:bg-celestial-gold hover:text-black transition-all"
                        >
                            <Globe size={16} />
                        </a>
                    </div>
                </div>

                {/* Controls & Metadata */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="bg-white/2 border border-white/5 rounded-[1.5rem] p-6 space-y-4 shadow-xl">
                        <div className="flex items-center gap-2 text-[10px] text-crystal-cyan font-bold tracking-[0.2em] uppercase">
                            <Sparkles size={12} /> Manifestation Details
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold block mb-2 px-1">Manifested Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter Elexamon Name..."
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-[13px] text-white focus:border-celestial-gold/50 outline-none transition-all placeholder:text-white/10 font-body"
                                />
                            </div>

                            <div className="p-4 bg-celestial-gold/5 border border-celestial-gold/20 rounded-2xl">
                                <p className="text-[11px] text-celestial-gold/60 leading-relaxed italic font-serif">
                                    "Manifestation will weave this image into the Gen 1 Merkle Tree. This action is irreversible once the consensus is reached."
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleManifestClick}
                        disabled={!name || isManifesting}
                        className={`w-full py-5 rounded-[2rem] font-bold text-[13px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 relative overflow-hidden font-heading ${!name || isManifesting
                                ? 'bg-white/2 text-white/10 cursor-not-allowed border border-white/5'
                                : 'bg-gradient-to-r from-celestial-gold to-orange-400 text-black shadow-[0_10px_40px_rgba(250,204,21,0.2)] hover:scale-[1.02]'
                            }`}
                    >
                        {isManifesting ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
                        {isManifesting ? 'WEAVING...' : 'MANIFEST INTO TREE'}
                    </button>

                    <div className="mt-auto flex justify-between items-center text-[9px] text-white/10 font-bold tracking-[0.2em] uppercase px-2">
                        <span>Submitted on {new Date(currentItem.timestamp).toLocaleDateString()}</span>
                        <span>IPFS: V1 CID</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CouncilGallery;
