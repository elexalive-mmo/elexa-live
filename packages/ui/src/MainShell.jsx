import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthGate } from './views/AuthGate';
import { SphereView } from './views/SphereView';
import { RoomView } from './views/RoomView';
import { InnerCircleView } from './views/InnerCircleView';
import { ElexaOSView } from './views/ElexaOSView';
import { GamificationLayer } from './components/HUD/GamificationLayer';
import { cn } from './lib/utils';

export const MainShell = () => {
    const [view, setView] = useState('sphere');
    const [isConnected, setIsConnected] = useState(false);
    const [exp, setExp] = useState(12500);
    const gameRef = useRef();

    const submitAction = (action, amount) => {
        gameRef.current?.trigger(`+${amount} EXP`, amount > 400 ? 'levelup' : 'exp');
        setExp(prev => prev + amount);
    };

    return (
        <div className="min-h-screen bg-[#050508] text-white font-sans antialiased">
            <AnimatePresence mode="wait">
                {!isConnected ? <AuthGate key="auth" onConnect={() => setIsConnected(true)} /> : (
                    <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-screen w-screen overflow-hidden">
                        <GamificationLayer ref={gameRef} />
                        <AnimatePresence mode="wait">
                            {view === 'sphere' && <SphereView onEnterRoom={() => setView('room')} isConnected={isConnected} exp={exp} />}
                            {view === 'room' && <RoomView onExit={() => setView('sphere')} onEnterCircle={() => setView('circle')} ledger={{ exp, submitAction }} />}
                            {view === 'circle' && <InnerCircleView onExit={() => setView('sphere')} userStats={{ level: 7, rank: 'Navigator', exp }} />}
                            {view === 'os' && <ElexaOSView />}
                        </AnimatePresence>
                        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[2000] flex gap-2 bg-black/40 backdrop-blur-xl border border-white/10 p-1 rounded-full shadow-2xl">
                            <Nav active={view === 'sphere'} label="Sphere" onClick={() => setView('sphere')} />
                            <Nav active={view === 'room'} label="Room" onClick={() => setView('room')} />
                            <Nav active={view === 'circle'} label="Circle" onClick={() => setView('circle')} />
                            <Nav active={view === 'os'} label="ElexaOS" onClick={() => setView('os')} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Nav = ({ active, label, onClick }) => (
    <button onClick={onClick} className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", active ? "bg-purple-600 text-white" : "text-white/40 hover:text-white/80")}>{label}</button>
);
