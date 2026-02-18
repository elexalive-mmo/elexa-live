import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import WorldMonitor from '../components/MilestoneMeter';
import { TwitchEmbed } from '../components/TwitchEmbed';

export default function HomePage() {
    const [theme, setTheme] = useState('dark');

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    const isLight = theme === 'light';

    return (
        <div className={`h-screen w-full font-sans overflow-hidden flex flex-col relative transition-colors duration-500 ${isLight ? 'bg-slate-50 text-slate-900 selection:bg-blue-200' : 'bg-[#050510] text-white selection:bg-cyan-500/30'}`}>

            {/* Ambient Background Glows */}
            <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] blur-[150px] pointer-events-none transition-colors duration-1000 ${isLight ? 'bg-blue-300/40' : 'bg-purple-900/20'}`} />
            <div className={`absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] blur-[150px] pointer-events-none transition-colors duration-1000 ${isLight ? 'bg-emerald-300/40' : 'bg-blue-900/20'}`} />

            {/* Top Bar - Tech HUD Style */}
            <div className={`h-16 border-b flex items-center justify-between px-8 backdrop-blur-md z-50 relative transition-colors ${isLight ? 'bg-white/70 border-slate-200' : 'bg-black/40 border-white/5'}`}>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className={`text-[10px] font-black tracking-[0.4em] uppercase ${isLight ? 'text-blue-600' : 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]'}`}>Elexa.Live</span>
                        <span className={`text-[8px] font-mono tracking-widest ${isLight ? 'text-slate-400' : 'text-white/30'}`}>v0.9.3 // BETA</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={`p-2 rounded-full transition-all ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-amber-500' : 'bg-white/10 hover:bg-white/20 text-blue-300'}`}
                    >
                        {isLight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>

                    <div className={`h-8 w-[1px] ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />

                    <div className="flex flex-col items-end">
                        <span className={`text-[10px] font-mono uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Market</span>
                        <span className={`text-sm font-black font-mono ${isLight ? 'text-slate-800' : 'text-white'}`}>$145.20</span>
                    </div>
                </div>
            </div>

            {/* Main Grid - Cleaned & Focused */}
            <div className="flex-1 grid grid-cols-12 gap-8 p-8 overflow-hidden relative z-10">

                {/* Left Col - Twitch Stream (Larger) */}
                <div className="col-span-12 lg:col-span-7 flex flex-col h-full gap-4 relative z-20">
                    <div className={`flex-1 rounded-2xl overflow-hidden border shadow-2xl transition-all ${isLight ? 'bg-white border-slate-200 shadow-slate-200' : 'bg-black border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]'}`}>
                        <TwitchEmbed />
                    </div>
                </div>

                {/* Right Col - World Monitor (Front & Center) */}
                <div className="col-span-12 lg:col-span-5 h-full flex flex-col relative z-20 pb-12">
                    <div className="flex-1 h-full">
                        <WorldMonitor theme={theme} />
                    </div>
                </div>

            </div>

            {/* Clean Footer (Artifacts Removed) */}
            <div className={`h-8 text-[10px] flex justify-center items-center font-mono tracking-widest pointer-events-none ${isLight ? 'text-slate-300' : 'text-white/10'}`}>
                SERVER TIME: {new Date().toISOString()} // ZONE 1
            </div>

        </div >
    );
}
