import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Activity, Crosshair, BarChart2, Layers, Maximize2, Zap, Shield, Sparkles, Network } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LEVEL_THRESHOLDS } from '@/lib/echeron';

// Enhanced Mock Data Generator
const generateData = (timeframe = '15m', count = 60) => {
    let price = 142.50;
    const data = [];
    const volatilityMap = { '1m': 0.8, '15m': 1.5, '1h': 3.0, '4h': 8.0 };
    const volBase = volatilityMap[timeframe] || 1.5;

    for (let i = 0; i < count; i++) {
        const volatility = (Math.random() - 0.5) * volBase;
        const open = price;
        const close = price + volatility;
        const high = Math.max(open, close) + Math.random() * (volBase * 0.2);
        const low = Math.min(open, close) - Math.random() * (volBase * 0.2);
        const volume = Math.floor(Math.random() * 5000 * (volBase / 1.5));

        data.push({ time: i, open, high, low, close, volume });
        price = close;
    }
    return data;
};

export const ChartWindow = () => {
    const [timeframe, setTimeframe] = useState('15m');
    const [data, setData] = useState(() => generateData('15m'));
    const [hoveredData, setHoveredData] = useState(null);
    const [crosshairPos, setCrosshairPos] = useState({ x: 0, y: 0 });
    const [userStats, setUserStats] = useState({ exp: 12500, level: 7 }); // Seeded/Mocked for now
    const [passiveGains, setPassiveGains] = useState(0);
    const containerRef = useRef(null);

    // Regenerate data on timeframe change
    useEffect(() => {
        setData(generateData(timeframe));
    }, [timeframe]);

    // Passive Earning Simulation (The gamification)
    useEffect(() => {
        const interval = setInterval(() => {
            setPassiveGains(prev => prev + 0.15); // Ticks up
            setUserStats(prev => ({ ...prev, exp: prev.exp + 0.15 }));
        }, 3000); // Every 3 seconds
        return () => clearInterval(interval);
    }, []);

    const scales = useMemo(() => {
        const maxPrice = Math.max(...data.map(d => d.high));
        const minPrice = Math.min(...data.map(d => d.low));
        const maxVol = Math.max(...data.map(d => d.volume));
        return { maxPrice, minPrice, priceRange: maxPrice - minPrice, maxVol };
    }, [data]);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const candleWidth = rect.width / data.length;
        const index = Math.min(Math.max(Math.floor(x / candleWidth), 0), data.length - 1);

        setCrosshairPos({ x, y });
        setHoveredData(data[index]);
    };

    const currentPrice = data[data.length - 1].close;
    const prevPrice = data[data.length - 2].close;
    const isUp = currentPrice >= data[0].open; // Trending relative to start

    const nextLevelXP = LEVEL_THRESHOLDS[userStats.level + 1] || (LEVEL_THRESHOLDS[userStats.level] * 2);
    const currentLevelXP = LEVEL_THRESHOLDS[userStats.level] || 0;
    const progressXP = userStats.exp - currentLevelXP;
    const progressTarget = nextLevelXP - currentLevelXP;
    const progressPct = Math.min(100, (progressXP / progressTarget) * 100);

    return (
        <div className="h-full flex flex-col bg-[#0b0c15] relative overflow-hidden text-[#d1d4dc] select-none text-[10px] font-mono border border-white/5">

            {/* XP PROGRESS OVERLAY (The Gamification) */}
            <div className="absolute top-0 left-0 right-0 h-1 z-[100] bg-white/5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                />
            </div>

            {/* Top Toolbar */}
            <div className="flex items-center justify-between p-2 border-b border-white/5 bg-[#131722]/80 backdrop-blur-xl relative z-50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#14F195] to-[#9945FF] flex items-center justify-center p-1 shadow-[0_0_10px_rgba(20,241,149,0.3)] group-hover:shadow-[0_0_15px_rgba(153,69,255,0.5)] transition-all">
                            <Network className="w-full h-full text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-white tracking-tighter">SOL / USDC</span>
                            <span className="text-[8px] text-white/30 uppercase tracking-[0.2em]">Alpha Terminal</span>
                        </div>
                    </div>

                    <div className="flex gap-1 h-6 items-center bg-black/40 p-0.5 rounded-lg border border-white/5">
                        {['1m', '15m', '1h', '4h'].map(tf => (
                            <button
                                key={tf}
                                onClick={() => setTimeframe(tf)}
                                className={cn(
                                    "px-2 h-full rounded-md transition-all text-[9px] font-bold uppercase",
                                    timeframe === tf
                                        ? "bg-purple-600 text-white shadow-lg"
                                        : "text-white/30 hover:text-white/60 hover:bg-white/5"
                                )}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2">
                            <span className="text-[8px] text-white/20 uppercase tracking-widest font-black">Sync XP</span>
                            <span className="text-emerald-400 font-bold">+{passiveGains.toFixed(2)}</span>
                        </div>
                        <div className={cn("text-sm font-black italic tracking-tighter", isUp ? "text-[#089981]" : "text-[#f23645]")}>
                            ${currentPrice.toFixed(2)}
                            <span className="ml-2 text-[9px] not-italic opacity-60">
                                {isUp ? '▲' : '▼'} {Math.abs(((currentPrice - data[0].open) / data[0].open) * 100).toFixed(2)}%
                            </span>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <button className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 border border-transparent hover:border-white/10 transition-all">
                        <Layers size={14} />
                    </button>
                </div>
            </div>

            {/* Chart Area */}
            <div
                ref={containerRef}
                className="flex-1 relative cursor-crosshair group/chart"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredData(null)}
            >
                {/* Visual Glitch/Sync FX */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-grid-white/[0.2] z-0" />

                {/* Horizontal Level Marker */}
                <div className="absolute left-0 w-full border-t border-white/5 pointer-events-none z-10" style={{ top: '50%' }} />

                {/* Grid */}
                <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none opacity-10">
                    <pattern id="chartGrid" width="60" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 60 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#chartGrid)" />
                </svg>

                {/* Candles */}
                <div className="absolute inset-x-0 top-6 bottom-6 flex items-end px-2">
                    {data.map((d, i) => {
                        const isGreen = d.close >= d.open;
                        const height = ((d.high - d.low) / scales.priceRange) * 100;
                        const bodyHeight = Math.max(((Math.abs(d.close - d.open)) / scales.priceRange) * 100, 0.5);
                        const bottom = ((d.low - scales.minPrice) / scales.priceRange) * 100;
                        const bodyBottom = ((Math.min(d.open, d.close) - scales.minPrice) / scales.priceRange) * 100;

                        const volHeight = (d.volume / scales.maxVol) * 20;

                        return (
                            <div key={i} className="flex-1 relative h-full group/candle mx-[1px]">
                                {/* Volume Bar */}
                                <div
                                    className={cn("absolute bottom-0 w-full rounded-t-[1px] transition-all duration-500", isGreen ? "bg-emerald-500/10" : "bg-red-500/10")}
                                    style={{ height: `${volHeight}%` }}
                                />

                                {/* Wick */}
                                <div
                                    className={cn("absolute w-[1px] left-1/2 -translate-x-1/2 rounded-full", isGreen ? "bg-emerald-500" : "bg-red-500")}
                                    style={{ height: `${height}%`, bottom: `${bottom}%` }}
                                />

                                {/* Body */}
                                <div
                                    className={cn("absolute w-full rounded-[1px] shadow-sm transition-colors", isGreen ? "bg-emerald-500" : "bg-red-500")}
                                    style={{ height: `${bodyHeight}%`, bottom: `${bodyBottom}%` }}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Info Text Overlay (Static info) */}
                <div className="absolute bottom-4 left-4 pointer-events-none opacity-20 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Zap size={10} className="text-yellow-500" />
                        <span className="text-[8px] font-black uppercase tracking-[0.3em]">Holographic Downlink Enabled</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Sparkles size={10} className="text-purple-500" />
                        <span className="text-[8px] font-black uppercase tracking-[0.3em]">Neural Persistence: ACTIVE</span>
                    </div>
                </div>

                {/* Crosshair Overlay */}
                {hoveredData && (
                    <AnimatePresence>
                        {/* Horizontal Line */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="absolute left-0 w-full border-t border-dashed border-white/20 pointer-events-none z-20 flex items-center justify-end"
                            style={{ top: crosshairPos.y }}
                        >
                            <span className="bg-[#131722] text-white px-1.5 py-0.5 text-[9px] translate-y-[-50%] border border-white/10 rounded-l mr-[-1px]">
                                ${(scales.minPrice + (scales.priceRange * (1 - (crosshairPos.y / containerRef.current?.clientHeight)))).toFixed(2)}
                            </span>
                        </motion.div>
                        {/* Vertical Line */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="absolute top-0 h-full border-l border-dashed border-white/20 pointer-events-none z-20 flex flex-col justify-end"
                            style={{ left: crosshairPos.x }}
                        >
                            <span className="bg-[#131722] text-white px-1.5 py-0.5 text-[9px] translate-x-[-50%] border border-white/10 rounded-t mb-[-1px]">
                                {timeframe} T-{60 - Math.floor((crosshairPos.x / containerRef.current?.clientWidth) * 60)}
                            </span>
                        </motion.div>

                        {/* Floating Price Tooltip */}
                        <div className="absolute top-4 left-4 flex gap-4 text-[9px] pointer-events-none z-[60] font-mono bg-[#131722]/90 border border-white/5 p-2 rounded-lg backdrop-blur-md shadow-2xl">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-white/30 uppercase text-[7px]">Open</span>
                                <span className="text-white font-bold">{hoveredData.open.toFixed(2)}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-white/30 uppercase text-[7px]">High</span>
                                <span className="text-emerald-400 font-bold">{hoveredData.high.toFixed(2)}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-white/30 uppercase text-[7px]">Low</span>
                                <span className="text-red-400 font-bold">{hoveredData.low.toFixed(2)}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-white/30 uppercase text-[7px]">Close</span>
                                <span className="text-white font-bold">{hoveredData.close.toFixed(2)}</span>
                            </div>
                            <div className="w-px h-6 bg-white/10 mx-1" />
                            <div className="flex flex-col gap-0.5">
                                <span className="text-white/30 uppercase text-[7px]">Volume</span>
                                <span className="text-purple-400 font-bold">{hoveredData.volume.toLocaleString()}</span>
                            </div>
                        </div>
                    </AnimatePresence>
                )}
            </div>

            {/* Watermark/Footer */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <span className="text-[12vw] font-black italic text-white/[0.02] select-none uppercase tracking-tighter">ELEXA</span>
            </div>

            {/* MOON FLIP PROGRESS BAR */}
            <div className="p-3 bg-[#0b0c15] border-t border-white/5 relative z-50">
                <div className="flex justify-between items-end mb-1">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Operation: Flip the Whale</span>
                        <span className="text-lg font-black text-white">$12.4M <span className="text-white/30 text-xs">/ $100.0M</span></span>
                    </div>
                    <div className="text-right">
                        <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest animate-pulse">GAP: $87.6M REQ</span>
                    </div>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative">
                    {/* Target Marker */}
                    <div className="absolute top-0 bottom-0 w-0.5 bg-red-500/50 z-10" style={{ left: '100%' }} />

                    {/* Progress */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '12.4%' }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-purple-600 via-blue-500 to-emerald-400 shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                    />
                </div>
            </div>

            <div className="p-2 border-t border-white/5 bg-[#131722]/50 flex justify-between items-center z-50">
                <div className="flex items-center gap-4 text-[8px] uppercase tracking-widest text-white/30 font-bold">
                    <span className="flex items-center gap-1"><Activity size={10} className="text-blue-500" /> Live Data</span>
                    <span className="flex items-center gap-1"><Crosshair size={10} className="text-purple-500" /> Precision Mode</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[8px] text-emerald-400 font-black glow-emerald">TARGET_LOCKED: A3W...PUMP</span>
                </div>
            </div>
        </div>
    );
};
