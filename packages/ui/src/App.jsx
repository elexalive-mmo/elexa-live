import { useState, useEffect, createContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// HUD Components
import { GamificationLayer } from './components/HUD/GamificationLayer';
import { NavShell } from './components/NavShell';
import CombatOverlay from './components/HUD/CombatOverlay';

// Views — Core
import { ElexaOSView } from './views/ElexaOSView';
import { CommunitySphere3D } from './components/three/CommunitySphere';
import { RoomView } from './views/RoomView';
import { InnerCircleView } from './views/InnerCircleView';
import { SphereView } from './views/SphereView';
import { SkillsView } from './views/SkillsView';
import { SanctumView } from './views/SanctumView';
import { AuthGate } from './views/AuthGate';
import { OverlayView } from './views/OverlayView';

// Views — Newly Routed (ex-orphans)
import Tap2Earn from './views/Tap2Earn';
import TownView from './views/TownView';
import BestiaryView from './views/BestiaryView';
import ManifestationHub from './views/ManifestationHub';
import WorldIntelView from './views/WorldIntelView';

// Metaverse Awakening
import { MapView } from './views/MapView';
import { TileView } from './views/TileView';
import { LobbyView } from './views/LobbyView';
import { WorldMapView } from './views/WorldMapView';

// Solana
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';

export const ElexaContext = createContext();

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.')
    ? `${window.location.protocol}//${window.location.hostname}:3020`
    : window.location.origin;

function App() {
    const network = WalletAdapterNetwork.Mainnet;
    const endpoint = clusterApiUrl(network);
    const wallets = [];

    const [view, setView] = useState('os');
    const [isConnected, setIsConnected] = useState(false);
    const [userStats, setUserStats] = useState({ exp: 0, level: 1, rank: 'Novice' });
    const [expBalance, setExpBalance] = useState(0);
    const [gameState, setGameState] = useState({ elexamonPool: [] });
    const [worldState, setWorldState] = useState({ currentTile: 1, partyHP: 100 });
    const [activeBoss, setActiveBoss] = useState(null); // Raid Boss State
    const [partyState, setPartyState] = useState(null); // New Party System
    const [raidState, setRaidState] = useState(null);   // New Raid System
    const [bgFlash, setBgFlash] = useState(null);
    const gameRef = useRef();

    const isOverlay = window.location.pathname === '/overlay';

    // ── Real-Time WebSocket Sync (Charts/Treasury) ──
    useEffect(() => {
        let socket;
        let reconnectTimeout;

        const connect = () => {
            const wsUrl = API_BASE.replace('http', 'ws') + '/ws';
            console.log(`[WebSocket] Connecting to ${wsUrl}...`);
            socket = new WebSocket(wsUrl);

            socket.onopen = () => {
                console.log('[WebSocket] Connection established.');
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'MARKET_UPDATE') {
                        setWorldState(prev => ({
                            ...prev,
                            market: data.payload.treasury
                        }));
                    }
                } catch (e) {
                    console.error('[WebSocket] Message Parse Error:', e.message);
                }
            };

            socket.onclose = () => {
                console.warn('[WebSocket] Disconnected. Retrying in 3s...');
                reconnectTimeout = setTimeout(connect, 3000);
            };

            socket.onerror = (err) => {
                console.error('[WebSocket] Error detected. Closing...');
                socket.close();
            };
        };

        connect();
        return () => {
            if (socket) socket.close();
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
        };
    }, []);

    // ── 15-Minute World Herald Sync ──
    useEffect(() => {
        const syncWorld = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/state`);
                const data = await res.json();
                if (data.user) {
                    setUserStats(data.user);
                    setExpBalance(data.user.exp || 0);
                }
                if (data.elexamonPool) {
                    setGameState({ elexamonPool: data.elexamonPool });
                }
                if (data.world) {
                    setWorldState(prev => ({ ...prev, ...data.world }));
                }
                if (data.activeBoss) {
                    setActiveBoss(data.activeBoss);
                }
            } catch (e) {
                console.warn('[Herald] World Sync Delayed');
            }
        };

        syncWorld();
        const interval = setInterval(syncWorld, 15 * 60 * 1000); // 15 Minutes
        return () => clearInterval(interval);
    }, []);

    // ── Action Handler — Wired to Backend ──
    const triggerAnim = (text, type) => gameRef.current?.trigger(text, type);

    const handleAction = async (type, cost, payload) => {
        console.log(`[ACTION] ${type}`, payload);
        triggerAnim(`⚡ ${type}`, 'success');

        try {
            // Trigger background flash
            setBgFlash(type === 'buys' ? 'cyan' : 'purple');
            setTimeout(() => setBgFlash(null), 1000);

            const res = await fetch(`${API_BASE}/api/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userStats.citizenAddress || userStats.username || 'guest',
                    action: type,
                    amount: cost || 0,
                    details: payload || {}
                })
            });
            const data = await res.json();
            if (data.user) {
                setUserStats(data.user);
                setExpBalance(data.user.exp || data.exp || expBalance);
            }
            if (data.world) {
                setWorldState(data.world);
            }
            if (data.boss) {
                setActiveBoss(data.boss); // Atomic Boss Update
            }
            if (data.reward) {
                triggerAnim(`🎁 ${data.reward.label || 'Reward!'}`, 'loot');
            }
            return data; // Return for component usage
        } catch (e) {
            console.warn('[Action] Backend unreachable — action logged locally');
            return null;
        }
    };

    const handleConnect = (address) => {
        setIsConnected(true);
        if (address) {
            setUserStats(prev => ({ ...prev, citizenAddress: address }));
            setView('os'); // Default to high-fidelity OS after login
        }
    };

    // ── View Renderer ──
    const renderView = () => {
        switch (view) {
            case 'os':
                return <ElexaOSView onAction={handleAction} userExp={userStats.exp} />;
            case 'sphere':
                return <CommunitySphere3D userStats={userStats} />;
            case 'tap':
                return <Tap2Earn />;
            case 'town':
                return <TownView />;
            case 'bestiary':
                return <BestiaryView />;
            case 'room':
                return <RoomView ledger={{ ...userStats, submitAction: handleAction }} onExit={() => setView('os')} onEnterCircle={() => setView('circle')} />;
            case 'circle':
                return <SphereView onNavigate={setView} />;
            case 'skills':
                return <SkillsView onExit={() => setView('circle')} user={userStats} />;
            case 'home':
                return <SanctumView onExit={() => setView('os')} />;
            case 'manifest':
                return <ManifestationHub user={userStats} gameState={gameState} onAction={handleAction} />;
            case 'world-intel':
                return <WorldIntelView user={userStats} worldState={userStats?.world || {}} onAction={handleAction} />;
            case 'world-map':
                return <WorldMapView currentTile={worldState.currentTile || 1} onNavigate={setView} />;
            case 'map':
                return <MapView onTileArrive={() => setView('tile')} />;
            case 'tile':
                return <TileView citizenAddress={userStats.citizenAddress || 'Anonymous'} activeBoss={activeBoss} />;
            case 'lobby':
                return <LobbyView user={userStats} />;
            default:
                return <ElexaOSView onAction={handleAction} userExp={userStats.exp} />;
        }
    };

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets}>
                <WalletModalProvider>
                    <ElexaContext.Provider value={{ isConnected, setIsConnected, triggerAnim, userStats, handleAction, partyState, raidState }}>
                        <GamificationLayer ref={gameRef} />

                        <div className={`bg-aurora min-h-screen text-white font-sans antialiased overflow-hidden selection:bg-purple-500/30 transition-colors duration-1000 ${bgFlash === 'cyan' ? 'brightness-125 saturate-150' : bgFlash === 'purple' ? 'brightness-110 hue-rotate-15' : ''}`}>
                            <AnimatePresence mode="wait">
                                {isOverlay ? (
                                    <OverlayView key="overlay" />
                                ) : !isConnected ? (
                                    <AuthGate key="auth" onConnect={handleConnect} />
                                ) : (
                                    <motion.div
                                        key="live"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="relative w-full h-screen pt-14"
                                    >
                                        {/* Active View */}
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={view}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -8 }}
                                                transition={{ duration: 0.2 }}
                                                className="w-full h-full"
                                            >
                                                {renderView()}
                                            </motion.div>
                                        </AnimatePresence>

                                        {/* Combat Layer — cinematic boss battles */}
                                        {activeBoss && activeBoss.hp > 0 && (
                                            <CombatOverlay
                                                activeBoss={activeBoss}
                                                partyHP={worldState?.partyHP || 100}
                                                storyFeed={worldState?.storyFeed || []}
                                                user={userStats}
                                                onAction={handleAction}
                                            />
                                        )}

                                        {/* Navigation Shell */}
                                        <NavShell
                                            activeView={view}
                                            onNavigate={setView}
                                            userStats={userStats}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </ElexaContext.Provider>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

export default App;
