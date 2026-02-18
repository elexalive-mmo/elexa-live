import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Map as MapIcon, Sparkles } from 'lucide-react';

export const SphereView = ({ onNavigate }) => {
    const [bookOpen, setBookOpen] = useState(false);

    const handleOpenBook = () => {
        setBookOpen(true);
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center font-serif text-amber-100 overflow-hidden">
            {/* Background - Library */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: "url('/assets/backgrounds/library.png')" }}
            >
                <div className="absolute inset-0 bg-black/60" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">

                <h1 className="text-4xl md:text-6xl font-black tracking-widest text-amber-500 mb-8 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                    THE ARCHIVES
                </h1>

                {/* The Mystic Book */}
                <div className="relative group cursor-pointer" onClick={handleOpenBook}>
                    <div className="relative w-[300px] h-[400px] md:w-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-2xl border-4 border-amber-900/50 hover:scale-105 transition-transform duration-500 bg-[#0a0a0a]">
                        {bookOpen ? (
                            <div className="w-full h-full bg-[#1a1612] p-6 flex flex-col items-center justify-center gap-6 relative">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-10" />

                                <h2 className="text-2xl text-amber-500 font-bold border-b border-amber-500/30 pb-2">CHOOSE YOUR PATH</h2>

                                <button
                                    onClick={(e) => { e.stopPropagation(); onNavigate('tap'); }}
                                    className="w-full py-4 px-6 bg-amber-900/40 border border-amber-500/30 rounded hover:bg-amber-800/50 flex items-center justify-between group/btn"
                                >
                                    <span className="flex items-center gap-3">
                                        <MapIcon className="text-amber-400" />
                                        <span className="font-bold tracking-widest">WORLD MAP</span>
                                    </span>
                                    <Sparkles className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-opacity text-amber-300" />
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); onNavigate('skills'); }}
                                    className="w-full py-4 px-6 bg-purple-900/30 border border-purple-500/30 rounded hover:bg-purple-800/50 flex items-center justify-between group/btn"
                                >
                                    <span className="flex items-center gap-3">
                                        <BookOpen className="text-purple-400" />
                                        <span className="font-bold tracking-widest">SKILLS & LORE</span>
                                    </span>
                                    <Sparkles className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-opacity text-purple-300" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <video
                                    autoPlay loop muted playsInline
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                                >
                                    <source src="/assets/backgrounds/book.mp4" type="video/mp4" />
                                </video>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-amber-200/80 text-xl font-bold tracking-[0.5em] bg-black/40 px-6 py-2 rounded-full backdrop-blur-sm border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
                                        OPEN
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {!bookOpen && (
                    <p className="mt-8 text-amber-200/40 text-sm tracking-widest animate-pulse">
                        TOUCH THE GRIMOIRE TO REVEAL KNOWLEDGE
                    </p>
                )}
            </div>
        </div>
    );
};
