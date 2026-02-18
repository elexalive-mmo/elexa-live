import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function MarketChart({ marketData }) {
    // Maintain a history of prices for the chart
    const [candles, setCandles] = useState([]);
    const lastPriceRef = useRef(marketData?.balanceSOL || 100);

    useEffect(() => {
        if (!marketData) return;

        const currentPrice = marketData.balanceSOL || 100;
        const prevPrice = lastPriceRef.current;

        // Add a new candle on every data update
        const newCandle = {
            open: prevPrice,
            close: currentPrice,
            high: Math.max(prevPrice, currentPrice) + (Math.random() * 0.1),
            low: Math.min(prevPrice, currentPrice) - (Math.random() * 0.1)
        };

        setCandles(prev => {
            const next = [...prev, newCandle];
            return next.length > 40 ? next.slice(-40) : next;
        });

        lastPriceRef.current = currentPrice;
    }, [marketData]);

    // Initial dummy data if empty
    useEffect(() => {
        if (candles.length === 0) {
            const init = [];
            let price = marketData?.balanceSOL || 100;
            for (let i = 0; i < 40; i++) {
                const change = (Math.random() - 0.5) * 2;
                init.push({ open: price, close: price + change, high: price + change + 0.5, low: price - 0.5 });
                price += change;
            }
            setCandles(init);
        }
    }, []);

    const currentPrice = marketData?.balanceSOL?.toFixed(4) || "0.0000";
    const isUp = (marketData?.balanceSOL || 0) >= lastPriceRef.current;

    return (
        <div className="w-full h-full bg-[#020205] relative overflow-hidden flex flex-col p-6 font-body">
            {/* Aetheric Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(250,204,21,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

            {/* Header: Solana Stats */}
            <div className="relative z-10 flex justify-between items-end mb-6 border-b border-white/5 pb-4">
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-celestial-gold/40 font-bold tracking-[0.3em] uppercase font-heading">Solana Treasury Pulse</span>
                    <span className={`text-3xl font-bold tracking-tight font-heading ${isUp ? 'text-celestial-gold drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]' : 'text-crystal-cyan'}`}>
                        {currentPrice} <span className="text-xs opacity-40 ml-1 font-body">SOL</span>
                    </span>
                </div>
                <div className={`text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur-3xl border border-white/5 font-heading ${isUp ? 'bg-celestial-gold/10 text-celestial-gold' : 'bg-crystal-cyan/10 text-crystal-cyan'}`}>
                    NETWORK: {marketData?.network?.toUpperCase() || 'SOLANA'}
                </div>
            </div>

            {/* Candle Visualization */}
            <div className="flex-1 flex items-end justify-between gap-[3px] relative z-10 pb-4">
                {candles.map((c, i) => {
                    const isGreen = c.close >= c.open;
                    const min = Math.min(...candles.map(x => x.low));
                    const max = Math.max(...candles.map(x => x.high));
                    const range = (max - min) || 1;

                    const normalize = (val) => ((val - min) / range) * 75 + 15;

                    const top = normalize(Math.max(c.open, c.close));
                    const bottom = normalize(Math.min(c.open, c.close));
                    const high = normalize(c.high);
                    const low = normalize(c.low);
                    const height = Math.max(top - bottom, 2);

                    return (
                        <div key={i} className="flex-1 relative h-full group">
                            {isGreen && i === candles.length - 1 && (
                                <motion.div
                                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-celestial-gold/5 blur-md"
                                />
                            )}
                            <div
                                className={`absolute left-1/2 -translate-x-1/2 w-[1px] opacity-20 ${isGreen ? 'bg-celestial-gold' : 'bg-crystal-cyan'}`}
                                style={{ bottom: `${low}%`, height: `${high - low}%` }}
                            />
                            <div
                                className={`absolute w-full rounded-sm transition-all duration-300 ${isGreen ? 'bg-celestial-gold shadow-[0_0_8px_rgba(250,204,21,0.2)]' : 'bg-crystal-cyan/60'}`}
                                style={{ bottom: `${bottom}%`, height: `${height}%` }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Aetheric Ticker Footer */}
            <div className="text-[8px] text-white/10 font-bold uppercase tracking-[0.2em] mt-auto border-t border-white/5 pt-4 flex justify-between font-heading">
                <span className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-celestial-gold rounded-full animate-pulse" />
                    TREASURY VOL: {marketData?.totalValueUSD?.toFixed(2) || '0.00'}$
                </span>
                <span>SYNC: {new Date().toLocaleTimeString()}</span>
            </div>
        </div>
    );
}
