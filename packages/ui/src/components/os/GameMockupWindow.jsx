import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Target, Zap, Rocket, Crosshair } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const GameMockupWindow = () => {
    return (
        <div className="relative w-full h-full bg-black overflow-hidden group">
            {/* HUD / World Perspective Mockup */}
            <div className="absolute inset-0 bg-[#0a0a0f]">
                {/* 3D Grid floor effect */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(168,85,247,0.05)_100%)]" />
                <div className="absolute bottom-0 w-full h-32 bg-[linear-gradient(transparent,rgba(16,185,129,0.05))] perspective-1000 rotate-x-60 translate-z-[-100px]"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />

                {/* Central Focus Pointer */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="relative"
                    >
                        <Crosshair className="w-12 h-12 text-purple-500/40" />
                        <div className="absolute inset-0 rounded-full border border-purple-500/20 animate-ping" />
                    </motion.div>
                </div>

                {/* Simulated Scanned Entities */}
                <motion.div
                    animate={{ x: [100, 110, 100], y: [150, 140, 150] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute border border-emerald-500/30 bg-emerald-500/5 p-2 rounded flex flex-col gap-1"
                >
                    <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-500/20 text-emerald-400 text-[6px] h-3 px-1 border-none">FRIENDLY</Badge>
                        <span className="text-[8px] text-white/60 font-black">Elexa_Drone_01</span>
                    </div>
                </motion.div>

                <motion.div
                    animate={{ x: [300, 280, 300], y: [80, 90, 80] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute border border-red-500/30 bg-red-500/5 p-2 rounded flex flex-col gap-1"
                >
                    <div className="flex items-center gap-2">
                        <Badge className="bg-red-500/20 text-red-400 text-[6px] h-3 px-1 border-none">HOSTILE</Badge>
                        <span className="text-[8px] text-white/60 font-black">Void_Wraith_LVL42</span>
                    </div>
                    <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-2/3 h-full bg-red-500" />
                    </div>
                </motion.div>
            </div>

            {/* In-Game HUD Overlays */}
            <div className="absolute inset-0 p-4 pointer-events-none flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Rocket className="w-3 h-3 text-purple-400" />
                            <span className="text-[9px] font-black text-white/80 uppercase tracking-widest italic">World_Seed // Phase_03</span>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <span className="text-[10px] font-black text-emerald-400 italic">LOCATION: NEON_CITADEL</span>
                        <span className="text-[7px] text-white/20 uppercase tracking-[0.2em] mt-1">Sector 7G // High Density</span>
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <div className="bg-black/60 border border-white/5 px-4 py-2 rounded-t-xl backdrop-blur-3xl flex gap-6">
                        <div className="flex flex-col items-center">
                            <span className="text-[7px] text-white/20 uppercase tracking-widest font-black">Ammo</span>
                            <span className="text-sm font-black text-white italic">∞</span>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="flex flex-col items-center">
                            <span className="text-[7px] text-white/20 uppercase tracking-widest font-black">Mana</span>
                            <span className="text-sm font-black text-blue-400 italic">100%</span>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="flex flex-col items-center">
                            <span className="text-[7px] text-white/20 uppercase tracking-widest font-black">Cast</span>
                            <Zap className="w-4 h-4 text-yellow-500 group-hover:scale-110 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Scanlines Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />
        </div>
    );
};
