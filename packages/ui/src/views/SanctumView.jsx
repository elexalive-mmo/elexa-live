import React, { useEffect, useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SanctumViewport } from '../components/Sanctum/SanctumViewport';
import { WalletConsole } from '../components/Sanctum/WalletConsole';
import { SanctumHUD } from '../components/Sanctum/SanctumHUD';
import { ElexaContext } from '../App';
import { Loader2 } from 'lucide-react';

export const SanctumView = ({ onExit }) => {
    const { userStats } = useContext(ElexaContext);
    const [loading, setLoading] = useState(true);
    const [sanctumConfig, setSanctumConfig] = useState(null);

    useEffect(() => {
        const loadSanctum = async () => {
            try {
                const res = await fetch(`http://localhost:3020/api/user/sanctum/load?userId=${userStats?.username || 'guest'}`);
                const data = await res.json();
                if (data.success) {
                    setSanctumConfig(data.config);
                }
            } catch (e) {
                console.warn("[Sanctum] Load failed, using defaults");
            } finally {
                setTimeout(() => setLoading(false), 1500); // Dramatic entrance
            }
        };

        loadSanctum();
    }, [userStats?.username]);

    const handleSave = async () => {
        try {
            const res = await fetch('http://localhost:3020/api/user/sanctum/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userStats?.username || 'guest',
                    config: sanctumConfig
                })
            });
            const data = await res.json();
            if (data.success) {
                console.log("[Sanctum] Saved successfully");
            }
        } catch (e) {
            console.error("[Sanctum] Sync failed");
        }
    };

    return (
        <AnimatePresence>
            {loading ? (
                <motion.div
                    key="loader"
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="mb-8"
                    >
                        <Loader2 size={64} className="text-purple-500 opacity-20" />
                    </motion.div>
                    <motion.h1
                        initial={{ letterSpacing: '0.1em' }}
                        animate={{ letterSpacing: '1em' }}
                        className="text-white text-xs font-black uppercase blur-[1px] opacity-40 ml-4"
                    >
                        Sanctum Syncing
                    </motion.h1>
                </motion.div>
            ) : (
                <motion.div
                    key="sanctum"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative w-full h-[100vh] overflow-hidden bg-black"
                >
                    {/* Layer 0: The 3D Metaverse World */}
                    <SanctumViewport
                        userStats={userStats}
                        sanctumConfig={sanctumConfig}
                    />

                    {/* Layer 1: Wallet Console */}
                    <WalletConsole userStats={userStats} />

                    {/* Layer 2: HUD & Overlays */}
                    <SanctumHUD
                        onExit={onExit}
                        onSave={handleSave}
                        sanctumConfig={sanctumConfig}
                        setSanctumConfig={setSanctumConfig}
                    />

                    {/* Ambient Glow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none" />
                </motion.div>
            )}
        </AnimatePresence>
    );
};
