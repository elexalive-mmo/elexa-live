import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, History, Zap, Play, Info, BookOpen, Scroll } from 'lucide-react';

/**
 * The Nexus — Divine Synthesis & Sacred Accounts
 */
const NexusView = ({ user = {}, chronicles = [], onAction }) => {
    const [activeTab, setActiveTab] = useState('chronicles');
    const [prompt, setPrompt] = useState('');
    const [isWeaving, setIsWeaving] = useState(false);

    const handleManifest = async () => {
        if (!prompt || user.exp < 50) return;
        setIsWeaving(true);
        await onAction('generate_nexus', 50, { prompt });
        setPrompt('');
        setTimeout(() => setIsWeaving(false), 3000); // Simulate processing
    };

    return (
        <div className="relative w-full h-full flex flex-col bg-black/60 overflow-hidden font-body">
            {/* Celestial Aether Backdrop */}
            <div className="absolute inset-0 z-0 bg-aether opacity-40 pointer-events-none" />
            <div
                className="absolute inset-0 z-0 bg-cover bg-center opacity-20 pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: "url('/assets/backgrounds/bg_celestial_archives.jpg')" }}
            />

            {/* Crystalline Header */}
            <header className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20 backdrop-blur-xl">
                <div>
                    <h2 className="fantasy-title text-3xl tracking-wider">THE NEXUS</h2>
                    <p className="text-[10px] text-celestial-gold/40 uppercase tracking-[0.4em] font-bold">Divine Synthesis & Sacred Accounts</p>
                </div>
                <div className="text-right">
                    <span className="text-[9px] text-white/20 uppercase tracking-[0.2em] block font-bold mb-1">Soul Essence</span>
                    <span className="text-2xl font-bold text-white font-heading tracking-tight">{user.exp?.toLocaleString() || 0} <span className="text-celestial-gold">EXP</span></span>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="flex border-b border-white/5 bg-white/2">
                <button
                    onClick={() => setActiveTab('chronicles')}
                    className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all font-heading ${activeTab === 'chronicles' ? 'text-celestial-gold bg-celestial-gold/10 shadow-[inset_0_-2px_0_var(--celestial-gold)]' : 'text-white/30 hover:text-white'}`}
                >
                    <div className="flex items-center justify-center gap-3">
                        <BookOpen size={16} /> Sacred Accounts {chronicles.length > 0 && `(${chronicles.length})`}
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('manifest')}
                    className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all font-heading ${activeTab === 'manifest' ? 'text-crystal-cyan bg-crystal-cyan/10 shadow-[inset_0_-2px_0_var(--crystal-cyan)]' : 'text-white/30 hover:text-white'}`}
                >
                    <div className="flex items-center justify-center gap-3">
                        <Sparkles size={16} /> Divine Vision
                    </div>
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-10 relative scrollbar-none">
                <AnimatePresence mode="wait">
                    {activeTab === 'chronicles' ? (
                        <motion.div
                            key="chronicles"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {chronicles.length > 0 ? chronicles.map((chap, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ x: 5 }}
                                    className="bg-black/40 backdrop-blur-3xl p-6 rounded-[2rem] border border-white/5 hover:border-celestial-gold/30 transition-all duration-500 group relative overflow-hidden"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="text-[14px] font-bold text-celestial-gold uppercase font-heading tracking-wide">Account {i + 1}: {chap.title || 'The Eternal Weave'}</h4>
                                        <span className="text-[10px] text-white/20 font-bold">{new Date(chap.ts).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-[14px] text-white/50 leading-relaxed italic mb-5 font-serif">"{chap.summary}"</p>
                                    <button className="flex items-center gap-2 text-[10px] font-bold text-crystal-cyan opacity-0 group-hover:opacity-100 transition-all duration-500 tracking-[0.2em] uppercase">
                                        <Play size={12} fill="currentColor" /> RELIVE THE ACCOUNT
                                    </button>

                                    {/* Scroll Decor */}
                                    <Scroll className="absolute -bottom-2 -right-2 text-white/5 rotate-12 group-hover:text-white/10 transition-colors" size={64} />
                                </motion.div>
                            )) : (
                                <div className="flex flex-col items-center justify-center py-24 text-center">
                                    <motion.div
                                        animate={{ y: [0, -10, 0], opacity: [0.2, 0.4, 0.2] }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                    >
                                        <Zap size={64} className="mb-6 text-celestial-gold/40" />
                                    </motion.div>
                                    <p className="text-[12px] font-bold uppercase tracking-[0.4em] text-white/20">The Records are Silent</p>
                                    <p className="text-[11px] text-white/10 italic mt-2">"Thy deeds wait for the stars to align."</p>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="manifest"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="h-full flex flex-col gap-8 max-w-2xl mx-auto"
                        >
                            <div className="space-y-6">
                                <div className="flex items-start gap-4 p-6 rounded-[2rem] bg-celestial-gold/5 border border-celestial-gold/20 shadow-xl">
                                    <Info className="text-celestial-gold shrink-0 mt-1" size={24} />
                                    <div className="text-[12px] leading-relaxed text-celestial-gold/80 italic font-serif">
                                        Offer <strong>50 Essence (EXP)</strong> to synthesize a manifestation. Thy vision shall be woven by Elexa into a celestial cinematic fragment—a window into the potential of this realm.
                                    </div>
                                </div>

                                <div className="relative group">
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Speak thy vision... (e.g., 'A crystalline dragon soaring over Sylvan Glades beneath a blood moon')..."
                                        className="w-full h-40 bg-black/60 border border-white/10 rounded-[2.5rem] p-8 text-[13px] text-white focus:border-crystal-cyan/50 outline-none resize-none placeholder:text-white/10 transition-all font-body leading-relaxed shadow-inner"
                                    />
                                    <div className="absolute bottom-6 right-8 text-[10px] text-white/20 font-bold">
                                        {prompt.length} / 500
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleManifest}
                                    disabled={isWeaving || !prompt || user.exp < 50}
                                    className={`w-full py-5 rounded-[2.5rem] font-bold text-[13px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 relative overflow-hidden font-heading ${isWeaving ? 'bg-white/5 text-white/20' :
                                        !prompt || user.exp < 50 ? 'bg-white/2 text-white/5 cursor-not-allowed border border-white/5' :
                                            'bg-gradient-to-r from-celestial-gold to-orange-400 text-black shadow-[0_10px_40px_rgba(250,204,21,0.2)]'
                                        }`}
                                >
                                    {isWeaving ? <Zap className="animate-spin" /> : <Sparkles />}
                                    {isWeaving ? 'WEAVING DESTINY...' : 'MANIFEST DIVINE VISION'}

                                    {/* Flare Effect */}
                                    {!isWeaving && prompt && user.exp >= 50 && (
                                        <div className="absolute inset-0 bg-white/20 blur-xl translate-x-full group-hover:translate-x-0 transition-transform duration-1000 opacity-0 group-hover:opacity-100" />
                                    )}
                                </motion.button>
                            </div>

                            {/* Manifestation Spheres */}
                            <div className="grid grid-cols-3 gap-4">
                                {['CELESTIAL VIDEO', 'REALM FRAGMENT', 'SPIRIT AVATAR'].map(type => (
                                    <div key={type} className="p-4 border border-white/5 rounded-[1.5rem] text-center bg-white/2 backdrop-blur-sm group hover:border-celestial-gold/20 transition-all">
                                        <span className="text-[8px] text-white/20 block mb-1 font-bold tracking-[0.2em] uppercase">Archetype</span>
                                        <span className="text-[10px] font-bold text-white/60 group-hover:text-celestial-gold transition-colors tracking-widest">{type}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Elexa Narration Area (Floating) */}
            <div className="absolute bottom-6 right-8 max-w-sm p-5 rounded-[2rem] bg-black/90 border border-crystal-cyan/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-crystal-cyan shadow-[0_0_8px_rgba(0,242,255,0.6)] animate-pulse" />
                    <span className="text-[10px] font-bold text-crystal-cyan uppercase tracking-[0.2em] font-heading">Elexa Narrates:</span>
                </div>
                <p className="text-[12px] text-white/60 leading-relaxed font-serif italic">
                    {activeTab === 'chronicles'
                        ? "Every soul leaves a trace upon the Aether. Let us revisit the deeds that have carved thy name into the stars."
                        : "Thy mind is a canvas of infinite potential. Speak what thy soul desires, and I shall weave it into being."}
                </p>
            </div>
        </div>
    );
};

export default NexusView;
