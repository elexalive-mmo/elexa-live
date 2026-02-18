import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Sprite Theater — The Divine Lineup
 * Renders characters as high-fantasy spirits with Celestial Solana styling.
 */
const SpriteTheater = ({ party = [] }) => {
    const [actionTick, setActionTick] = useState(0);

    // Trigger a "Jump" for the whole party when someone acts
    useEffect(() => {
        setActionTick(t => t + 1);
    }, [party]);

    // Default mock party if none provided
    const displayParty = party.length > 0 ? party : [
        { name: 'Cloud Archer', role: 'Dancer', hp: 100, maxHp: 100, sprite: '✨', level: 42, rank: 'ELITE' },
        { name: 'Crystal Guard', role: 'Knight', hp: 85, maxHp: 100, sprite: '🛡️', level: 38, rank: 'ELITE' },
        { name: 'Elexa Prime', role: 'Summoner', hp: 50, maxHp: 100, sprite: '🤖', level: 111, rank: 'DIVINE' },
    ];

    return (
        <div className="w-full h-full flex items-end justify-center gap-16 pb-8">
            {displayParty.map((char, i) => (
                <motion.div
                    key={char.name}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{
                        opacity: 1,
                        x: 0,
                        y: actionTick > 0 ? [0, -25, 0] : 0
                    }}
                    transition={{
                        x: { delay: i * 0.15 },
                        y: { duration: 0.4, ease: 'easeOut' }
                    }}
                    className="relative flex flex-col items-center group"
                >
                    {/* Character Aetheric Shadow */}
                    <div className="absolute bottom-1 w-16 h-6 bg-black/60 rounded-[100%] blur-xl opacity-40 group-hover:bg-celestial-gold/20 transition-all duration-1000" />

                    {/* Animated Spirit (High-Fantasy Lineup) */}
                    <motion.div
                        animate={{
                            scale: [1, 1.02, 1],
                            y: [0, -5, 0]
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 3 + (i * 0.2),
                            ease: 'easeInOut'
                        }}
                        className="text-7xl mb-4 relative z-10 drop-shadow-[0_0_25px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_0_35px_rgba(250,204,21,0.4)] transition-all duration-700"
                    >
                        {char.sprite || '👤'}
                    </motion.div>

                    {/* Sacred Status Tablet */}
                    <div className="bg-black/60 backdrop-blur-3xl px-6 py-4 rounded-[2rem] border border-white/5 flex flex-col items-center gap-2 min-w-[160px] shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden group-hover:border-celestial-gold/20 transition-all duration-500">
                        {/* Divine Resonance Glow */}
                        <AnimatePresence>
                            <motion.div
                                key={actionTick}
                                initial={{ opacity: 1, scale: 0.8 }}
                                animate={{ opacity: 0, scale: 2 }}
                                className="absolute inset-0 bg-celestial-gold/10 pointer-events-none"
                            />
                        </AnimatePresence>

                        <div className="flex justify-between items-center w-full mb-1 border-b border-white/5 pb-2">
                            <span className="text-[10px] font-bold text-celestial-gold uppercase tracking-[0.2em] font-heading">Lvl {char.level}</span>
                            <span className="text-[8px] font-bold text-white/10 uppercase tracking-[0.4em] font-heading">{char.role || 'Citadel'}</span>
                        </div>

                        <div className="text-[13px] font-bold text-white uppercase tracking-[0.1em] font-heading w-full text-center group-hover:text-celestial-gold transition-colors">
                            {char.name}
                        </div>

                        {/* Conviction (HP) Bar */}
                        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5 mt-1 shadow-inner">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(char.hp / char.maxHp) * 100}%` }}
                                className={`h-full bg-gradient-to-r ${char.hp < 30 ? 'from-red-500 to-orange-400 shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'from-aetheric-purple to-crystal-cyan shadow-[0_0_10px_rgba(168,85,247,0.4)]'}`}
                            />
                        </div>

                        {/* Rank Insignia */}
                        <div className="absolute -top-3 -right-3 bg-gradient-to-br from-celestial-gold to-orange-400 text-black text-[9px] font-bold px-3 py-1 rounded-full shadow-[0_5px_15px_rgba(250,204,21,0.3)] transform rotate-6 border border-white/20 font-heading">
                            {char.rank?.replace('_', ' ') || 'ELITE'}
                        </div>
                    </div>

                    {/* Aetheric Pulse (Solana Blink Hook) */}
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            const blinkUrl = `https://solana.com/blink?party=${char.name}`;
                            window.open(`https://twitter.com/intent/tweet?text=The Constellation of ${char.name} has aligned in Elexa.live! Join the Celestial Raid: ${blinkUrl}`, '_blank');
                        }}
                        className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-celestial-gold text-black text-[10px] font-bold px-4 py-2 rounded-full whitespace-nowrap cursor-pointer shadow-[0_10px_30px_rgba(250,204,21,0.4)] font-heading tracking-widest uppercase"
                    >
                        Manifest Blink ⚡
                    </motion.div>
                </motion.div>
            ))}
        </div>
    );
};

export default SpriteTheater;
