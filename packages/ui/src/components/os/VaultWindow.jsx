import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Package, Lock, Info, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RARITY } from '@/lib/echeron';
import { cn } from '@/lib/utils';

export const VaultWindow = () => {
    const [inventory, setInventory] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchInventory = async () => {
        try {
            // Hardcoded user 'justin' for now as per logic
            const res = await fetch('http://localhost:3020/api/user/justin');
            if (res.ok) {
                const data = await res.json();
                setInventory(data.inventory || []);
            }
        } catch (e) {
            console.error("Failed to fetch inventory:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
        const interval = setInterval(fetchInventory, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full flex flex-col bg-black/40 backdrop-blur-md relative overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {loading ? (
                    <div className="h-full flex items-center justify-center animate-pulse opacity-20">
                        <Box size={40} />
                    </div>
                ) : inventory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                        <Lock size={48} />
                        <div className="space-y-1">
                            <p className="text-xs font-mono uppercase tracking-widest">Vault Empty</p>
                            <p className="text-[10px]">Awaiting data fragments...</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-3">
                        {inventory.map((item, i) => {
                            const rarity = RARITY[item.rarity] || RARITY.COMMON;
                            return (
                                <motion.button
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.02 }}
                                    onClick={() => setSelectedItem(item)}
                                    className={cn(
                                        "aspect-square rounded-xl border flex items-center justify-center relative group transition-all",
                                        "bg-white/[0.03] border-white/10 hover:bg-white/[0.08]",
                                        selectedItem === item && "border-white/40 ring-1 ring-white/20"
                                    )}
                                    style={{
                                        borderColor: selectedItem === item ? rarity.color : undefined,
                                        boxShadow: selectedItem === item ? `0 0 15px ${rarity.color}40` : undefined
                                    }}
                                >
                                    <Package
                                        size={24}
                                        style={{ color: rarity.color }}
                                        className={cn(item.rarity === 'LEGENDARY' && "animate-pulse")}
                                    />

                                    {/* Rarity Indicator Dot */}
                                    <div
                                        className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full shadow-sm"
                                        style={{ backgroundColor: rarity.color }}
                                    />

                                    {/* Tooltip on hover */}
                                    <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-transparent via-white/5 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform" />
                                </motion.button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Selection Detail Panel */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="absolute inset-x-0 bottom-0 bg-[#0a0a0f]/95 border-t border-white/10 p-4 z-20 backdrop-blur-xl"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                                    {selectedItem.label}
                                    {selectedItem.rarity === 'LEGENDARY' && <Sparkles size={14} className="text-orange-400" />}
                                </h3>
                                <p className="text-[10px] font-mono uppercase tracking-tighter" style={{ color: RARITY[selectedItem.rarity].color }}>
                                    {selectedItem.rarity} Artifact
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="text-white/20 hover:text-white/60 transition-colors"
                            >
                                <Info size={16} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[11px] text-white/50 leading-relaxed italic">
                                "{selectedItem.type === 'xp' ? `Synthesized ${selectedItem.value} energy units into the neural core.` : `A unique data structure harvested from the digital ether.`}"
                            </p>
                            <div className="flex justify-between items-center text-[9px] font-mono text-white/20 pt-2 border-t border-white/5">
                                <span>ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                                <span>ACQUIRED: {new Date(selectedItem.acquired).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer / Stats Summary */}
            <div className="p-3 border-t border-white/5 bg-white/[0.02] flex justify-between items-center text-[10px] text-white/30 font-mono">
                <span>DATABASE_FRAGMENTS: {inventory.length}</span>
                <span className="text-purple-400">VAULT_ENCRYPTED</span>
            </div>
        </div>
    );
};
