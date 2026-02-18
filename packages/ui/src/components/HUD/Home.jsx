import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ElexamonPet } from './ElexamonPet';
import { ElexaMonitor } from './ElexaMonitor';
import { LiveFeed } from './LiveFeed';

export const Home = ({ onExit, gameState }) => {
    const [wallColor, setWallColor] = useState('#2c1a0e');
    const [furniture, setFurniture] = useState([]);
    const canvasRef = useRef(null);

    // Initial Load (Mock)
    useEffect(() => {
        const saved = localStorage.getItem('emberhaven_home');
        if (saved) {
            const data = JSON.parse(saved);
            setWallColor(data.wallColor || '#2c1a0e');
            setFurniture(data.items || []);
        } else {
            // Default Setup
            setFurniture([
                { id: 1, type: 'pet-bed', x: 200, y: 300 },
                { id: 2, type: 'monitor', x: 400, y: 150 },
                { id: 3, type: 'pet', x: 220, y: 280 } // Emberling starts near bed
            ]);
        }
    }, []);

    const handleSave = () => {
        const config = { wallColor, items: furniture };
        localStorage.setItem('emberhaven_home', JSON.stringify(config));
        // TODO: In Phase 16, sync to Solana via API
        console.log('Saved to local storage:', config);
        alert('Home Layout Saved! (Local MVP)');
    };

    const addItem = (type) => {
        setFurniture([...furniture, {
            id: Date.now(),
            type,
            x: 100 + Math.random() * 50,
            y: 100 + Math.random() * 50
        }]);
    };

    const updatePosition = (id, x, y) => {
        setFurniture(prev => prev.map(item =>
            item.id === id ? { ...item, x, y } : item
        ));
    };

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
            {/* Toolbar */}
            <div className="absolute top-4 left-4 z-50 flex gap-2">
                <button onClick={onExit} className="p-2 bg-black/50 rounded-full text-white hover:bg-black/80 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <div className="p-2 bg-black/50 rounded-lg flex items-center gap-2">
                    <input
                        type="color"
                        value={wallColor}
                        onChange={(e) => setWallColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
                    />
                    <span className="text-xs text-white/70">Wall Color</span>
                </div>
            </div>

            <div className="absolute top-4 right-4 z-50 flex gap-2">
                <button onClick={() => addItem('pet-bed')} className="p-2 bg-orange-600/80 rounded-lg text-white text-xs hover:bg-orange-500 transition-all">
                    + Bed
                </button>
                <button onClick={() => addItem('monitor')} className="p-2 bg-cyan-600/80 rounded-lg text-white text-xs hover:bg-cyan-500 transition-all">
                    + Monitor
                </button>
                <button onClick={() => addItem('pet')} className="p-2 bg-red-600/80 rounded-lg text-white text-xs hover:bg-red-500 transition-all">
                    + Emberling
                </button>
                <button onClick={handleSave} className="p-2 bg-green-600/80 rounded-lg text-white hover:bg-green-500 transition-all">
                    <Save size={20} />
                </button>
            </div>

            {/* Room Canvas */}
            <div
                ref={canvasRef}
                className="relative w-full max-w-4xl aspect-video rounded-xl shadow-2xl border-4 border-orange-900/50 overflow-hidden transition-colors duration-500"
                style={{ backgroundColor: wallColor }}
            >
                {/* Floor Texture Overlay */}
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-overlay"></div>

                {/* Live Feed Overlay */}
                <LiveFeed />

                {furniture.map(item => (
                    <DraggableItem
                        key={item.id}
                        item={item}
                        onDragEnd={updatePosition}
                        containerRef={canvasRef}
                        gameState={gameState}
                    />
                ))}
            </div>

            <div className="absolute bottom-4 text-center text-white/30 text-xs">
                Drag items to customize your den. Logic: React + Framer Motion.
            </div>
        </div>
    );
};

const DraggableItem = ({ item, onDragEnd, containerRef, gameState }) => {
    return (
        <motion.div
            drag
            dragConstraints={containerRef}
            dragMomentum={false}
            onDragEnd={(e, info) => {
                const rect = e.target.getBoundingClientRect();
                const containerRect = containerRef.current.getBoundingClientRect();
                onDragEnd(item.id, rect.left - containerRect.left, rect.top - containerRect.top);
            }}
            initial={{ x: item.x, y: item.y }}
            className="absolute cursor-move group"
        >
            {item.type === 'pet' && <ElexamonPet />}
            {item.type === 'monitor' && <ElexaMonitor data={gameState} />}
            {item.type === 'pet-bed' && (
                <div className="w-24 h-16 bg-orange-800 rounded-lg border-2 border-orange-600 shadow-lg relative">
                    <div className="absolute inset-2 bg-orange-900/50 rounded flex items-center justify-center text-[10px] text-orange-300/50 uppercase">
                        Cozy Nest
                    </div>
                </div>
            )}

            {/* Selection Ring */}
            <div className="absolute -inset-2 border-2 border-white/0 group-hover:border-white/20 rounded-lg transition-all pointer-events-none"></div>
        </motion.div>
    );
};
