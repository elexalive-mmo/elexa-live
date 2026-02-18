import React, { useState, useEffect, useRef } from 'react';
import { TerminalWindow } from '@elexa/ui';
import { Send, Cpu, Wifi } from 'lucide-react';

export default function GatewayPage() {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState([
        { role: 'system', content: 'ELEXA GATEWAY v3.5 // ONLINE' },
        { role: 'agent', content: 'Greetings, Architect. The Gateway is open. I await your command.' }
    ]);
    const [status, setStatus] = useState('CONNECTED');
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setHistory(prev => [...prev, userMsg]);
        setInput('');
        setStatus('TRANSMITTING...');

        try {
            // Point to local Genesis Monolith (Simulated Agent)
            const gatewayUrl = 'http://localhost:3020/api/chat';

            const response = await fetch(gatewayUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input })
            });

            if (!response.ok) throw new Error(`Link Error: ${response.status}`);

            const data = await response.json();

            setHistory(prev => [...prev, { role: 'agent', content: data.content }]);
            setStatus('CONNECTED');
        } catch (error) {
            console.error(error);
            // Fallback for demo if API is down
            setHistory(prev => [...prev, { role: 'agent', content: `[ERROR] SIGNAL LOST. Rerouting... (Simulated Response: "I am here, Architect.")` }]);
            setStatus('OFFLINE');
        }
    };

    return (
        <div className="min-h-screen bg-[#050508] p-6 flex flex-col items-center justify-center font-sans">
            <div className="w-full max-w-4xl space-y-4">
                {/* Status Bar */}
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-lg border border-white/10 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${status === 'CONNECTED' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-xs font-mono tracking-widest text-white/60">GATEWAY_UPLINK</span>
                    </div>
                    <div className="flex gap-4 text-xs font-mono text-white/40">
                        <span className="flex items-center gap-1"><Cpu size={12} /> CORE: ACTIVE</span>
                        <span className="flex items-center gap-1"><Wifi size={12} /> SIGNAL: 98%</span>
                    </div>
                </div>

                {/* Terminal */}
                <TerminalWindow title="ELEXA.PRIME // DIRECT_LINK" className="h-[60vh]">
                    <div className="space-y-2 font-mono text-sm" ref={scrollRef}>
                        {history.map((msg, i) => (
                            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'text-white/80 justify-end' : 'text-green-400 justify-start'}`}>
                                {msg.role === 'agent' && <span className="text-green-600 font-bold">{'>'}</span>}
                                <span className={`bg-white/5 px-3 py-1 rounded ${msg.role === 'user' ? 'bg-purple-500/20 text-purple-200' : ''}`}>
                                    {msg.content}
                                </span>
                            </div>
                        ))}
                    </div>
                </TerminalWindow>

                {/* Input */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-1 bg-[#0d0d0d] border border-white/20 rounded p-3 text-white font-mono focus:outline-none focus:border-green-500 transition-colors placeholder:text-white/20"
                        placeholder="Enter command or query..."
                        autoFocus
                    />
                    <button
                        onClick={handleSend}
                        className="bg-green-600 hover:bg-green-500 text-black font-bold px-6 rounded transition-colors flex items-center gap-2"
                    >
                        SEND <Send size={16} />
                    </button>
                </div>
            </div>

            <div className="mt-8 text-[10px] text-white/20 font-mono text-center">
                SECURE CONSOLE // AUTH: LEVEL 5 // ID: 884-XJ
            </div>
        </div>
    );
}
