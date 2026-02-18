import React, { useState, useEffect } from 'react';
import { TerminalWindow, Button, Card } from '@elexa/ui';
import { Send, Activity, ShieldAlert, Cpu } from 'lucide-react';

export default function GatewayPage() {
    const [logs, setLogs] = useState([
        "System Initialized...",
        "Connecting to OpenClaw Agent...",
        "Connection Failed: Agent Offline (Localhost:18789)",
        "Running in Simulation Mode..."
    ]);
    const [input, setInput] = useState("");

    const handleCommand = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        setLogs(prev => [...prev, `> ${input}`, `Elexa: Processing command '${input}'...`]);
        setInput("");
    };

    return (
        <div className="p-6 space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white">Gateway</h1>
                    <p className="text-white/50">Admin Command Center</p>
                </div>
                <div className="flex gap-2">
                    <Badge icon={Activity} label="Offline" color="red" />
                    <Badge icon={Cpu} label="v0.1.0" color="blue" />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Terminal */}
                <div className="lg:col-span-2">
                    <TerminalWindow title="Elexa.OS - OpenClaw Bridge">
                        <div className="space-y-1">
                            {logs.map((log, i) => (
                                <div key={i} className="font-mono text-sm opacity-90">{log}</div>
                            ))}
                        </div>
                    </TerminalWindow>

                    <form onSubmit={handleCommand} className="mt-4 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter command..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-elexa-primary font-mono"
                        />
                        <Button type="submit" variant="primary">
                            <Send size={18} />
                        </Button>
                    </form>
                </div>

                {/* Sidebar Status */}
                <div className="space-y-4">
                    <Card>
                        <h3 className="font-bold text-elexa-accent mb-2">System Status</h3>
                        <div className="space-y-2 text-sm text-white/70">
                            <div className="flex justify-between">
                                <span>World Sync</span>
                                <span className="text-green-400">Active</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Agent</span>
                                <span className="text-red-400">Disconnected</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Treasury</span>
                                <span className="text-yellow-400">0.00 SOL</span>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="font-bold text-elexa-magic mb-2">Council Sovereigns</h3>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between"><span>Arbiter</span> <span className="text-green-400">Aggressive</span></div>
                            <div className="flex justify-between"><span>Sentinel</span> <span className="text-blue-400">Passive</span></div>
                            <div className="flex justify-between"><span>Oracle</span> <span className="text-purple-400">Narrative</span></div>
                            <div className="flex justify-between"><span>Keeper</span> <span className="text-yellow-400">Dip Buy</span></div>
                            <div className="flex justify-between"><span>Void</span> <span className="text-red-400">War Mode</span></div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="font-bold text-white mb-2">Quick Actions</h3>
                        <div className="space-y-2">
                            <Button variant="secondary" className="w-full justify-start text-sm">Force Sync</Button>
                            <Button variant="secondary" className="w-full justify-start text-sm">Update Memories</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

const Badge = ({ icon: Icon, label, color }) => (
    <div className={`flex items-center gap-1 px-2 py-1 rounded bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 text-xs font-bold uppercase`}>
        <Icon size={12} />
        {label}
    </div>
);
