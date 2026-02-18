import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles, Fingerprint, Network } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const navigate = useNavigate();
    const [isConnecting, setIsConnecting] = useState(false);
    const { connected, publicKey } = useWallet();
    const { setVisible } = useWalletModal();

    const handleWalletConnect = () => {
        if (!connected) {
            setVisible(true);
        } else {
            console.log("Wallet already connected:", publicKey?.toString());
            onConnect();
        }
    };

    const onConnect = () => {
        setIsConnecting(true);
        setTimeout(() => {
            navigate('/home');
        }, 1500);
    };

    return (
        <div className="relative min-h-screen w-full bg-black flex items-center justify-center overflow-hidden font-sans">
            {/* 1. Video Background (The Gates) */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0 grayscale-[50%] brightness-[0.6]"
            >
                <source src="/assets/backgrounds/gates.mp4" type="video/mp4" />
            </video>

            {/* Failsafe Overlay (in case video fails) */}
            <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none" />

            {/* Content Card - Translucent Glass */}
            <div className="relative z-10 w-full max-w-sm px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="bg-black/20 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
                >
                    {/* Inner Glow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="mb-6">
                            {/* Logo / Title */}
                            <h1 className="text-4xl font-black tracking-[0.2em] text-white/90 mb-1 drop-shadow-md">
                                ELEXA
                            </h1>
                            <h1 className="text-4xl font-black tracking-[0.2em] text-white/90 mb-4 drop-shadow-md">
                                LIVE
                            </h1>
                            <p className="text-[9px] uppercase tracking-[0.4em] text-white/50 font-bold">
                                CITIZEN IDENTITY PORTAL
                            </p>
                        </div>

                        <button
                            onClick={connected ? onConnect : handleWalletConnect}
                            disabled={isConnecting}
                            className="group relative w-full py-4 rounded-full bg-[#1a1a1a]/80 border border-white/10 hover:border-purple-500/50 hover:bg-purple-900/40 transition-all duration-300"
                        >
                            <div className="flex flex-col items-center gap-1">
                                <Fingerprint className={`text-purple-400 group-hover:text-purple-300 transition-colors ${isConnecting ? 'animate-pulse' : ''}`} size={24} />
                                <span className="text-[10px] font-bold tracking-[0.2em] text-white uppercase mt-1">
                                    {isConnecting ? "SYNCHRONIZING..." : (connected ? "ENTER SIMULATION" : "CONNECT IDENTITY")}
                                </span>
                            </div>
                        </button>

                        <div className="flex justify-center gap-3 mt-6">
                            <PlatformIcon icon={<Network size={14} />} label="X" />
                            <PlatformIcon icon={<Shield size={14} />} label="Discord" />
                            <PlatformIcon icon={<Sparkles size={14} />} label="Telegram" />
                        </div>

                        <p className="mt-6 text-[8px] text-white/30 uppercase tracking-[0.2em]">
                            ENTER AS WANDERER
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

const PlatformIcon = ({ icon, label }) => (
    <div className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 cursor-pointer transition-all text-white/40 hover:text-white/80" title={label}>
        {icon}
    </div>
);
