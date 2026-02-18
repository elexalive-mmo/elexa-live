import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

export const AgentStatus = () => {
    const [agents, setAgents] = useState([]);
    const [prime, setPrime] = useState(null);

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const res = await fetch('http://localhost:3020/api/agents/status');
                const data = await res.json();
                setAgents(data.agents || []);
                setPrime(data.prime || null);
            } catch (e) {
                console.error('Failed to fetch agent status', e);
            }
        };
        fetchAgents();
        const interval = setInterval(fetchAgents, 5000);
        return () => clearInterval(interval);
    }, []);

    const statusColors = {
        online: 'bg-green-500/20 text-green-400 border-green-500/30',
        active: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        idle: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        offline: 'bg-red-500/20 text-red-400 border-red-500/30'
    };

    return (
        <div className="p-4 space-y-4">
            {/* Prime Status */}
            {prime && (
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl">{prime.icon}</div>
                        <div className="flex-1">
                            <div className="font-bold text-lg">{prime.name}</div>
                            <div className="text-sm text-white/60">The Anchor</div>
                        </div>
                        <Badge className={statusColors[prime.status] || statusColors.online}>
                            {prime.status?.toUpperCase()}
                        </Badge>
                    </div>
                    {prime.signal && (
                        <div className="mt-2 text-xs text-purple-400">Signal: {prime.signal}</div>
                    )}
                </div>
            )}

            {/* Agent Grid */}
            <div className="grid grid-cols-2 gap-3">
                {agents.map((agent) => (
                    <motion.div
                        key={agent.id}
                        whileHover={{ scale: 1.02 }}
                        className={cn(
                            "p-3 rounded-lg border backdrop-blur-sm",
                            statusColors[agent.status] || statusColors.online
                        )}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">{agent.icon}</span>
                            <div className="flex-1">
                                <div className="font-semibold text-sm">{agent.name}</div>
                                <div className="text-xs text-white/50">{agent.lastAction}</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <Badge variant="outline" className="text-xs">
                                {agent.status}
                            </Badge>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

