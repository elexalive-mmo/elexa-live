import React from 'react';
import { motion } from 'framer-motion';

export const DynamicPortal = () => {
    return (
        <div className="absolute inset-0 overflow-hidden bg-[#020205]">
            {/* Celestial Nebula Glow */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.45, 0.3],
                    rotate: [0, 5, 0]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vw] h-[140vh] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0%,rgba(59,130,246,0.08)_40%,transparent_70%)]"
            />

            {/* Aetheric Rings */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border border-celestial-gold/5 rounded-full blur-[1px]"
            />
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-aetheric-purple/10 rounded-full blur-[2px]"
            />

            {/* Celestial Particles (Stars/Mana) */}
            {[...Array(40)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        x: Math.random() * 100 + "%",
                        y: Math.random() * 100 + "%",
                        opacity: Math.random() * 0.3,
                        scale: Math.random() * 1.5
                    }}
                    animate={{
                        opacity: [0.1, 0.5, 0.1],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: Math.random() * 5 + 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className={`absolute w-0.5 h-0.5 rounded-full blur-[0.5px] ${i % 3 === 0 ? 'bg-celestial-gold' : 'bg-white'}`}
                />
            ))}

            {/* Deep Horizon Glow */}
            <div className="absolute bottom-0 left-0 right-0 h-[50vh] bg-gradient-to-t from-aetheric-purple/10 via-transparent to-transparent pointer-events-none" />

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
        </div>
    );
};
