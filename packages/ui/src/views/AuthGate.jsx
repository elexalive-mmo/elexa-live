import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Power, Fingerprint, Moon, Compass, Sword, Network } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { DynamicPortal } from '../components/ui/DynamicPortal';

export const AuthGate = ({ onConnect }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [systemStatus, setSystemStatus] = useState({
        gateway: { connected: false },
        telegram: { connected: false },
        twitch: { connected: false }
    });
    const { connected, publicKey } = useWallet();
    const { setVisible } = useWalletModal();

    const handleWalletConnect = async () => {
        if (!connected) {
            setVisible(true);
        } else if (publicKey) {
            setIsConnecting(true);
            setTimeout(() => {
                onConnect(publicKey.toString());
                setIsConnecting(false);
            }, 1800);
        }
    };

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('http://localhost:3020/api/status');
                const data = await res.json();
                if (data.channels) setSystemStatus(data.channels);
            } catch (e) {
                console.warn('Status poll failed');
            }
        };
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[1000] bg-black flex items-center justify-center overflow-hidden font-body">
            {/* Immersive Highlands Backdrop */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
                style={{ backgroundImage: 'url("/assets/backgrounds/highlands_tavern.png")' }}
            >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            </div>

            <div className="relative z-20 w-full max-w-2xl p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="relative"
                >
                    <div className="bg-white/[0.03] backdrop-blur-[40px] border border-white/10 rounded-[4rem] p-16 shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative overflow-hidden group/container">
                        {/* Core Ambience */}
                        <div className="absolute -top-24 -left-24 w-96 h-96 bg-aetheric-purple/10 blur-[120px] rounded-full pointer-events-none" />
                        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-celestial-gold/5 blur-[120px] rounded-full pointer-events-none" />

                        {/* Logo Section */}
                        <div className="mb-16 text-center relative">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 1 }}
                            >
                                <div className="flex items-center justify-center gap-3 mb-2">
                                    <span className="px-3 py-1 rounded-full bg-celestial-gold/20 text-celestial-gold text-[9px] font-bold tracking-[0.3em] uppercase border border-celestial-gold/30">
                                        EID Sovereign Root
                                    </span>
                                </div>
                                <h1 className="fantasy-title text-8xl mb-4 tracking-[0.15em] text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                    ELEXA LIVE
                                </h1>
                                <div className="flex items-center justify-center gap-8 mb-8">
                                    <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                    <Fingerprint size={20} className="text-aetheric-purple animate-pulse" />
                                    <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                </div>
                                <p className="text-[11px] uppercase tracking-[1em] text-white/40 font-bold">CITIZEN IDENTITY PORTAL</p>
                            </motion.div>
                        </div>

                        {/* Auth Hub (Centered) */}
                        <div className="flex flex-col items-center gap-8 max-w-sm mx-auto relative z-10">
                            <AuthButton
                                icon={<Fingerprint className="text-aetheric-purple" size={24} />}
                                label={connected ? "COMMUNING..." : "AWAKEN CITIZEN ID"}
                                sublabel="Bind thy seed to the Sovereign Root"
                                onClick={handleWalletConnect}
                                loading={isConnecting}
                                primary
                            />

                            <div className="grid grid-cols-3 gap-4 w-full">
                                <PlatformButton
                                    icon={<Network size={18} />}
                                    label="X"
                                    onClick={() => alert("Connecting to X Portal...")}
                                />
                                <PlatformButton
                                    icon={<Shield size={18} />}
                                    label="DISCORD"
                                    onClick={() => alert("Linking Discord Identity...")}
                                />
                                <PlatformButton
                                    icon={<Sparkles size={18} />}
                                    label="TELEGRAM"
                                    onClick={() => alert("Synchronizing Telegram Relay...")}
                                />
                            </div>


                            <div className="w-full flex items-center gap-6 py-4">
                                <div className="h-[1px] flex-1 bg-white/5" />
                                <span className="text-[10px] font-bold text-white/10 tracking-[0.4em] uppercase">The Veil</span>
                                <div className="h-[1px] flex-1 bg-white/5" />
                            </div>

                            <button
                                onClick={() => onConnect('Guest-' + Math.random().toString(36).substr(2, 6))}
                                className="text-[11px] text-white/30 uppercase tracking-[0.4em] font-bold hover:text-white/60 transition-all duration-500 hover:tracking-[0.5em]"
                            >
                                Enter as Wanderer
                            </button>
                        </div>

                        {/* Lore Oracle */}
                        <div className="mt-20 text-center opacity-30 group-hover/container:opacity-60 transition-opacity duration-1000">
                            <p className="text-[10px] text-white italic tracking-widest font-heading uppercase">"The Tavern fire burns for those shared in code and creed."</p>
                        </div>
                    </div>

                    {/* Meta Status */}
                    <div className="mt-12 flex justify-center gap-12 text-[10px] font-bold tracking-[0.3em] text-white/20 uppercase">
                        <StatusItem label="Nexus" active={systemStatus.gateway.connected} />
                        <StatusItem label="Stream" active={systemStatus.twitch.connected} />
                        <StatusItem label="Relay" active={systemStatus.telegram.connected} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const AuthButton = ({ icon, label, sublabel, onClick, loading, primary }) => (
    <motion.button
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        disabled={loading}
        className={`w-full group relative overflow-hidden p-8 rounded-[3rem] transition-all duration-700 flex flex-col items-center gap-3 ${primary
            ? 'bg-white/[0.04] border border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.3)]'
            : 'bg-transparent border border-white/5 hover:border-white/10'
            }`}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <div className={`p-5 rounded-full bg-black/40 border border-white/10 group-hover:border-white/30 transition-all duration-700`}>
            {icon}
        </div>

        <div className="text-center relative z-10">
            <div className={`text-[15px] font-bold text-white tracking-[0.2em] uppercase font-heading ${loading ? 'animate-pulse' : ''}`}>{label}</div>
            <div className="text-[10px] text-white/40 uppercase mt-2 tracking-[0.1em] font-medium">{sublabel}</div>
        </div>

        {/* Shine Sweep */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
    </motion.button>
);

const StatusItem = ({ label, active }) => (
    <div className="flex items-center gap-3">
        <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-celestial-gold shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-red-500/30'}`} />
        <span className="opacity-60">{label}</span>
    </div>
);

const PlatformButton = ({ icon, label, onClick }) => (
    <motion.button
        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/5 bg-white/[0.02] transition-all"
    >
        <div className="text-white/40">{icon}</div>
        <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{label}</div>
    </motion.button>
);
