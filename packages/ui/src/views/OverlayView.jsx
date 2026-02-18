import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Activity, Users, Shield, TrendingUp, Sparkles } from 'lucide-react';

export const OverlayView = () => {
    const [state, setState] = useState({
        partyHP: 100,
        activeBoss: null,
        world: { currentTile: 1, region: "Trench Lowlands" }
    });
    const [lastEvent, setLastEvent] = useState(null);

    const [userState, setUserState] = useState(null);

    // 📡 Poll for Backend State
    useEffect(() => {
        const sync = async () => {
            try {
                // Fetch World State
                const raidRes = await fetch('http://localhost:3020/api/raid/status');
                const raidData = await raidRes.json();
                setState(raidData);

                // Fetch User/System State (XP)
                const stateRes = await fetch('http://localhost:3020/api/state');
                const stateData = await stateRes.json();
                if (stateData.user) setUserState(stateData.user);

            } catch (e) { /* Kernel offline */ }
        };
        sync();
        const interval = setInterval(sync, 2000);
        return () => clearInterval(interval);
    }, []);

    // Mock events for flair (Twitch extension would actually use a websocket/event source)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (state.activeBoss) {
                setLastEvent({ icon: "⚔️", text: "Party Attacking Boss!", id: Date.now() });
            }
        }, 5000);
        return () => clearTimeout(timer);
    }, [state.activeBoss]);

    // Cleanup last event
    useEffect(() => {
        if (lastEvent) {
            const timer = setTimeout(() => setLastEvent(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [lastEvent]);

    const boss = state.activeBoss;
    const hpPercent = boss ? (boss.hp / boss.maxHp) * 100 : 0;
    const schedule = state.schedule || { status: 'OFFLINE' };

    return (
        <div className="relative w-full h-screen bg-transparent text-white font-sans antialiased overflow-hidden p-8 flex flex-col justify-between select-none">
            {/* TOP CENTER: BOSS HUD & EVENT BANNER */}
            <div className="flex flex-col items-center w-full gap-4">
                <AnimatePresence>
                    {schedule.status === 'LIVE' && (
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-purple-600 px-6 py-1 rounded-full shadow-[0_0_20px_rgba(147,51,234,0.6)] flex items-center gap-2 animate-pulse"
                        >
                            <Sparkles size={14} className="text-yellow-300" />
                            <span className="text-[10px] font-black uppercase tracking-widest">🔴 LIVE EVENT: DOUBLE XP ACTIVE</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {boss && (
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            className="bg-black/60 backdrop-blur-xl border border-red-500/30 rounded-2xl p-4 w-[400px] shadow-[0_0_30px_rgba(239,68,68,0.2)]"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-red-400 font-bold tracking-widest text-xs uppercase flex items-center gap-2">
                                    <Shield size={14} className="animate-pulse" /> BOSS ENCOUNTER
                                </span>
                                <span className="text-white/40 text-[10px]">TILE {boss.tile}</span>
                            </div>
                            <h2 className="text-xl font-black mb-2 tracking-tight">{boss.name.toUpperCase()}</h2>
                            <div className="h-4 bg-white/10 rounded-full overflow-hidden relative">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${hpPercent}%` }}
                                    className="h-full bg-gradient-to-r from-red-600 to-red-400"
                                />
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                                    {boss.hp} / {boss.maxHp} HP
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* CENTER: TAP BUTTON (FOR EXTENSION MODE) */}
            <div className="flex flex-col items-center gap-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        window.open('https://t.me/elexalivemmo', '_blank');
                    }}
                    className="group relative bg-[#6d28d9]/80 backdrop-blur-xl border border-white/20 px-8 py-4 rounded-full flex items-center gap-3 shadow-[0_0_40px_rgba(109,40,217,0.3)] hover:shadow-[0_0_60px_rgba(109,40,217,0.5)] transition-all"
                >
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Zap size={20} className="text-yellow-400 fill-yellow-400 group-hover:animate-bounce" />
                    </div>
                    <div className="text-left">
                        <div className="text-xs text-white/60 font-medium uppercase tracking-widest">Tap to Earn</div>
                        <div className="text-lg font-bold">JOIN THE RAID 💜</div>
                    </div>

                    {/* Pulsing rings */}
                    <div className="absolute inset-0 rounded-full border border-white/10 animate-ping opacity-20" />
                </motion.button>
                <div className="flex flex-col items-center gap-1">
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Verified by Elexa Live // Shield Active</p>
                    {schedule.status === 'UPCOMING' && (
                        <p className="text-[9px] text-purple-400/60 font-mono italic">
                            Next Ritual: {new Date(schedule.event.start).toLocaleString()}
                        </p>
                    )}
                </div>
            </div>

            {/* BOTTOM: STATS BAR */}
            <div className="flex justify-between items-end w-full gap-4">
                {/* Party Stats */}
                <div className="flex gap-4">
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3 flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Party Vitality</span>
                            <div className="flex items-center gap-2">
                                <Users size={14} className="text-blue-400" />
                                <span className="font-bold text-lg">{state.partyHP} HP</span>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Region</span>
                            <div className="flex items-center gap-2 text-blue-400/80">
                                <Activity size={14} />
                                <span className="text-sm font-medium">{state.world.region}</span>
                            </div>
                        </div>
                    </div>

                    {/* XP BAR */}
                    {userState && (
                        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3 flex flex-col justify-center min-w-[200px]">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Elexa Level {userState.level}</span>
                                <span className="text-[10px] text-white/40 font-mono">{userState.exp} XP</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(userState.exp % 1000) / 10}%` }}
                                    className="h-full bg-gradient-to-r from-purple-600 to-blue-500"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Event Feed Ticker */}
                <div className="flex flex-col items-end gap-2">
                    <AnimatePresence>
                        {lastEvent && (
                            <motion.div
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 50, opacity: 0 }}
                                className="bg-blue-600/80 backdrop-blur-md px-4 py-2 rounded-lg flex items-center gap-2 border border-white/20 shadow-lg"
                            >
                                <span>{lastEvent.icon}</span>
                                <span className="text-xs font-bold">{lastEvent.text}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3 flex items-center gap-2">
                        <TrendingUp size={14} className="text-green-400" />
                        <span className="text-xs font-bold text-white/60">WORLD PROGRESS: <span className="text-white">TILE {state.world.currentTile}/100</span></span>
                    </div>
                </div>
            </div>

            {/* PREMIUM SCANLINE & CRT FX LAYER */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Horizontal Scanlines */}
                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
                {/* RGB Shift Illusion */}
                <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(90deg,rgba(255,0,0,0.4),rgba(0,255,0,0.2),rgba(0,0,255,0.4))] bg-[length:3px_100%]" />
                {/* CRT Vignette */}
                <div className="absolute inset-0 shadow-[inner_0_0_100px_rgba(0,0,0,0.5)] bg-radial-gradient" />
                {/* Subtle Grain */}
                <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .bg-radial-gradient {
                    background: radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.4) 100%);
                }
                @keyframes pulse-glow {
                    0%, 100% { filter: drop-shadow(0 0 10px rgba(147,51,234,0.4)); }
                    50% { filter: drop-shadow(0 0 20px rgba(147,51,234,0.8)); }
                }
                .animate-glow {
                    animation: pulse-glow 2s infinite ease-in-out;
                }
            `}} />
        </div>
    );
};

export default OverlayView;
