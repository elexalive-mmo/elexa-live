import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Check, X, Clock } from 'lucide-react';

export const ConfirmationQueue = () => {
    const [queue, setQueue] = useState([]);

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const res = await fetch('http://localhost:3020/api/confirm/queue');
                const data = await res.json();
                setQueue(data || []);
            } catch (e) {
                console.error('Failed to fetch confirmation queue', e);
            }
        };
        fetchQueue();
        const interval = setInterval(fetchQueue, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleDecision = async (id, decision) => {
        try {
            await fetch(`http://localhost:3020/api/confirm/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ decision })
            });
            setQueue(queue.filter(item => item.id !== id));
        } catch (e) {
            console.error('Failed to confirm', e);
        }
    };

    if (queue.length === 0) {
        return (
            <div className="p-4 text-center text-white/40 text-sm">
                No pending confirmations
            </div>
        );
    }

    return (
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            <AnimatePresence>
                {queue.map((item) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="w-4 h-4 text-yellow-400" />
                                    <span className="text-sm font-semibold text-yellow-400">
                                        Pending Approval
                                    </span>
                                </div>
                                <div className="text-white font-medium mb-1">{item.goal}</div>
                                {item.synthesis?.agents && (
                                    <div className="text-xs text-white/60 mb-2">
                                        Agents: {item.synthesis.agents.map(a => a.agent).join(', ')}
                                    </div>
                                )}
                                {item.synthesis?.risk && (
                                    <Badge variant="outline" className="text-xs">
                                        Risk: {(item.synthesis.risk * 100).toFixed(0)}%
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={() => handleDecision(item.id, 'approve')}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDecision(item.id, 'reject')}
                                className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                                <X className="w-4 h-4 mr-1" />
                                Reject
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

