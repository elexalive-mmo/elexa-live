import React, { useMemo, useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Home, Map, Zap, Terminal, ShoppingBag } from 'lucide-react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';

// Pages
import HomePage from './pages/Home';
import GatewayPage from './pages/Gateway';
import MapPage from './pages/Map';
import TapPage from './pages/TapToEarn';
import UniversePage from './pages/Universe';
import LoginPage from './pages/Login';
import SoulSwapPage from './pages/SoulSwap';

// Custom Game Link Component
const NavItem = ({ to, icon: Icon, label }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <Link to={to} className={`relative group flex items-center justify-center p-3 transition-all ${isActive ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}>
            <div className={`absolute inset-0 bg-gradient-to-t from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`} />
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 shadow-[0_0_10px_#f59e0b] transform scale-x-0 group-hover:scale-x-100 transition-transform ${isActive ? 'scale-x-100' : ''}`} />
            <div className="flex flex-col items-center gap-1 z-10">
                <Icon size={24} className={`drop-shadow-lg ${isActive ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : ''}`} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</span>
            </div>
        </Link>
    );
};

const GameMasterContext = createContext({ isGM: false, toggleGM: () => { } });

export const useGameMaster = () => useContext(GameMasterContext);

const GM_TOGGLE_STYLE = "fixed top-4 right-4 z-[200] flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full cursor-pointer hover:bg-white/10 transition-all";

const LayoutWrapper = ({ children }) => {
    const { isGM, toggleGM } = useGameMaster();

    return (
        <div className="fixed inset-0 bg-[#030014] text-white font-sans selection:bg-amber-500/30 selection:text-amber-100 overflow-hidden">
            {/* GM Toggle */}
            <button onClick={toggleGM} className={GM_TOGGLE_STYLE}>
                <div className={`w-2 h-2 rounded-full ${isGM ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-300">
                    {isGM ? 'GM OVERRIDE' : 'PLAYER VIEW'}
                </span>
            </button>

            {/* Cinematic Layers (Dimmed in GM Mode) */}
            <div className={`absolute inset-0 z-50 pointer-events-none transition-opacity duration-700 ${isGM ? 'opacity-20' : 'opacity-100'}`}>
                {/* 1. Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,#000_150%)]" />
                {/* 2. Scanlines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[60] bg-[length:100%_2px,3px_100%] pointer-events-none" />
                {/* 3. Hex Overlay (Subtle) */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                {/* 4. Border Frame (Web3 Gaming Feel) */}
                <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-white/10 rounded-tl-3xl" />
                <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-white/10 rounded-tr-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-white/10 rounded-bl-3xl" />
                <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-white/10 rounded-br-3xl" />
            </div>

            {/* GM Matrix Overlay */}
            {isGM && (
                <div className="absolute inset-0 z-40 pointer-events-none font-mono text-[10px] text-green-500/20 p-8 overflow-hidden">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="whitespace-nowrap animate-pulse" style={{ animationDuration: `${Math.random() * 2 + 1}s` }}>
                            {`0x${Math.random().toString(16).substr(2, 40)}... SYSTEM.Override(AUTH_LEVEL_9) ... AB${Math.random().toString(16).substr(2, 4)}`}
                        </div>
                    ))}
                </div>
            )}

            {/* Main Content Area - Full Screen */}
            <main className="w-full h-full relative z-10 overflow-y-auto custom-scrollbar">
                {children}
            </main>

            {/* Bottom Nav - Floating HUD Style */}
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]">
                <div className="bg-black/80 backdrop-blur-xl border border-white/10 px-8 py-2 rounded-full shadow-[0_0_50px_rgba(0,0,0,0.8)] flex gap-8 items-center relative">
                    {/* Glow effect behind nav */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-amber-900/20 to-transparent blur-xl -z-10" />

                    <NavItem to="/" icon={Home} label="Hub" />
                    <NavItem to="/universe" icon={Layout} label="Realms" />
                    <NavItem to="/map" icon={Map} label="Map" />
                    <NavItem to="/market" icon={ShoppingBag} label="Swap" />
                    <NavItem to="/gateway" icon={Terminal} label="Link" />
                    <NavItem to="/tap" icon={Zap} label="Tap" />
                </div>
            </nav>
        </div>
    );
};

export default function App() {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const endpoint = 'https://api.devnet.solana.com';
    const [isGM, setIsGM] = useState(false); // Global GM Mode State

    const toggleGM = () => setIsGM(prev => !prev);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <GameMasterContext.Provider value={{ isGM, toggleGM }}>
                        <Router>
                            <Routes>
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="*" element={
                                    <LayoutWrapper>
                                        <Routes>
                                            <Route path="/" element={<HomePage />} />
                                            <Route path="/universe" element={<UniversePage />} />
                                            <Route path="/map" element={<MapPage />} />
                                            <Route path="/market" element={<SoulSwapPage />} />
                                            <Route path="/tap" element={<TapPage />} />
                                            <Route path="/gateway" element={<GatewayPage />} />
                                        </Routes>
                                    </LayoutWrapper>
                                } />
                            </Routes>
                        </Router>
                    </GameMasterContext.Provider>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
