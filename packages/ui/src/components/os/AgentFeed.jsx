import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, TrendingUp, Search, Radio, Scale, Lightbulb, Zap, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const AgentIcon = ({ agent }) => {
    let icon = <Brain size={14} className="text-white/60" />;
    let color = "bg-white/10 border-white/20";

    if (agent.includes('Moderator')) { icon = <Shield size={14} className="text-blue-400" />; color = "bg-blue-500/10 border-blue-500/20"; }
    else if (agent.includes('Economist')) { icon = <Scale size={14} className="text-green-400" />; color = "bg-green-500/10 border-green-500/20"; }
    else if (agent.includes('Scout')) { icon = <Search size={14} className="text-orange-400" />; color = "bg-orange-500/10 border-orange-500/20"; }
    else if (agent.includes('Guide')) { icon = <Lightbulb size={14} className="text-yellow-400" />; color = "bg-yellow-500/10 border-yellow-500/20"; }
    else if (agent.includes('ClipSmith')) { icon = <Radio size={14} className="text-red-400" />; color = "bg-red-500/10 border-red-500/20"; }
    else if (agent.includes('Signal')) { icon = <Zap size={14} className="text-purple-400" />; color = "bg-purple-500/10 border-purple-500/20"; }

    return (
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", color)}>
            {icon}
        </div>
    );
};

export const AgentFeed = ({ maxItems = 6 }) => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch('http://localhost:3020/api/events');
                const data = await res.json();
                setEvents(data.slice(-maxItems).reverse());
            } catch (e) {
                // Silent fail for smooth UI
            }
        };

        fetchEvents();
        const interval = setInterval(fetchEvents, 3000);
        return () => clearInterval(interval);
    }, [maxItems]);

    return (
        <div className="h-full flex flex-col bg-black/40 backdrop-blur-md overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-purple-500/10 to-transparent z-10 pointer-events-none" />

            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {events.map((evt, i) => (
                        <motion.div
                            key={`${evt.source}-${evt.timestamp}-${i}`} // Ensure unique key
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-xl p-3 flex gap-3 group transition-colors cursor-default"
                        >
                            <div className="flex-shrink-0 pt-0.5">
                                <AgentIcon agent={evt.source} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="font-bold text-xs text-white/90 truncate">{evt.source}</span>
                                    <span className="text-[9px] font-mono text-white/30">{new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-[8px] h-4 py-0 px-1 border-white/10 text-white/50 bg-white/[0.02]">
                                        {evt.type}
                                    </Badge>
                                </div>
                                <p className="text-[11px] text-white/70 leading-relaxed font-medium">
                                    {evt.message}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {events.length === 0 && (
                    <div className="h-40 flex flex-col items-center justify-center text-white/20">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        >
                            <Brain size={24} className="mb-2 opacity-50" />
                        </motion.div>
                        <span className="text-[10px] uppercase tracking-widest font-mono">Connecting to Council...</span>
                    </div>
                )}
            </div>
        </div>
    );
};
