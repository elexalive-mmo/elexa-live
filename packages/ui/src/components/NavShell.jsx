import { motion } from 'framer-motion';
import { Home, Monitor, Globe, BookOpen, Shield, Swords, Zap, MessageSquare } from 'lucide-react';
import ExperienceBar from './ui/ExperienceBar';

const NAV_ITEMS = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'os', label: 'ElexaOS', icon: Monitor },
    { id: 'world-map', label: 'World Map', icon: Globe },
    { id: 'bestiary', label: 'Bestiary', icon: BookOpen },
    { id: 'town', label: 'Guild Hall', icon: Shield },
    { id: 'room', label: 'Room', icon: MessageSquare },
    { id: 'tap', label: 'Battle', icon: Swords },
];

export const NavShell = ({ activeView, onNavigate, userStats = {} }) => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-[9998] h-12 flex items-center justify-between px-4
                        bg-[#0a0a12]/90 backdrop-blur-xl border-b border-white/[0.06]"
            style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>

            {/* Brand */}
            <button onClick={() => onNavigate('home')} className="flex items-center gap-2 shrink-0 group">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center
                                shadow-[0_0_12px_rgba(168,85,247,0.4)] group-hover:shadow-[0_0_18px_rgba(168,85,247,0.6)] transition-shadow">
                    <span className="text-white text-xs font-black">E</span>
                </div>
                <span className="text-white/90 text-sm font-bold tracking-wide hidden sm:inline">ELEXA LIVE</span>
            </button>

            {/* Nav Items */}
            <div className="flex items-center gap-0.5">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    return (
                        <motion.button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            whileTap={{ scale: 0.95 }}
                            className={`
                                relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide uppercase transition-all duration-200
                                ${isActive
                                    ? 'bg-white/[0.08] text-cyan-300'
                                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                                }
                            `}
                        >
                            <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="hidden md:inline">{item.label}</span>

                            {isActive && (
                                <motion.div
                                    layoutId="nav-indicator"
                                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-cyan-400 rounded-full"
                                    style={{ boxShadow: '0 0 8px rgba(0,242,255,0.5)' }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Right Side — LIVE Indicator */}
            <div className="flex items-center gap-6 shrink-0">
                <div className="hidden lg:block w-48">
                    <ExperienceBar
                        currentXp={userStats.exp || 0}
                        nextLevelXp={userStats.nextLevelXp || 1000}
                        level={userStats.level || 1}
                        rank={userStats.rank || 'Observer'}
                    />
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"
                        style={{ boxShadow: '0 0 6px rgba(74,222,128,0.8)' }} />
                    <span className="text-green-400 text-[10px] font-bold tracking-wider">LIVE</span>
                </div>
            </div>
        </nav>
    );
};

export default NavShell;
