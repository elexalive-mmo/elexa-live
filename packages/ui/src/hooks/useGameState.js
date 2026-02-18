import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * ═══════════════════════════════════════════════════════════
 * useGameState — Real-Time Game State Hook
 * ═══════════════════════════════════════════════════════════
 *
 * Connects to the server via WebSocket for real-time pushes.
 * Falls back to HTTP polling if WS is unavailable.
 *
 * Returns: { state, events, isLive, send, lastEvent }
 */

const API_BASE = 'http://localhost:3020';
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const WS_URL = `${protocol}//${window.location.hostname}:3020/ws`; // Direct to backend
const POLL_INTERVAL = 5000;    // HTTP fallback polling
const RECONNECT_DELAY = 3000;  // WS reconnect delay
const MAX_EVENTS = 50;         // Keep last 50 events

export function useGameState() {
    const [state, setState] = useState({
        user: { exp: 0, level: 1, rank: 'Novice', tile: 1 },
        party: [],
        world: {},
        economy: {},
        events: [],
        system: { version: '0.0.8', health: 'connecting' }
    });
    const [events, setEvents] = useState([]);
    const [isLive, setIsLive] = useState(false);
    const [lastEvent, setLastEvent] = useState(null);
    const wsRef = useRef(null);
    const reconnectTimer = useRef(null);
    const pollTimer = useRef(null);

    // ── HTTP Fetch (initial state + fallback) ──
    const fetchState = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/state`);
            const data = await res.json();
            setState(prev => ({
                ...prev,
                user: { ...prev.user, ...(data.user || {}) },
                world: { ...prev.world, ...(data.world || {}) },
                economy: { ...prev.economy, ...(data.economy || {}) },
                system: { ...prev.system, ...(data.system || {}) },
                party: data.party || prev.party
            }));
            return data;
        } catch (e) {
            console.warn('[GameState] HTTP fallback — server unreachable');
            return null;
        }
    }, []);

    // ── WebSocket Connection ──
    const connectWS = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        try {
            const ws = new WebSocket(WS_URL);

            ws.onopen = () => {
                console.log('[GameState] ⚡ WebSocket connected');
                setIsLive(true);
                setState(prev => ({
                    ...prev,
                    system: { ...prev.system, health: 'optimal' }
                }));

                // Stop HTTP polling — WS is live
                if (pollTimer.current) {
                    clearInterval(pollTimer.current);
                    pollTimer.current = null;
                }

                // Start WS heartbeat
                const ping = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'ping' }));
                    }
                }, 15000);
                ws._pingInterval = ping;
            };

            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    handleWSMessage(msg);
                } catch (e) {
                    console.warn('[GameState] Bad WS message');
                }
            };

            ws.onclose = () => {
                console.log('[GameState] WebSocket disconnected — falling back to HTTP');
                setIsLive(false);
                if (ws._pingInterval) clearInterval(ws._pingInterval);

                // Fall back to HTTP polling
                startPolling();

                // Schedule reconnect
                reconnectTimer.current = setTimeout(connectWS, RECONNECT_DELAY);
            };

            ws.onerror = () => {
                ws.close();
            };

            wsRef.current = ws;
        } catch (e) {
            console.warn('[GameState] WS not available — using HTTP');
            startPolling();
        }
    }, []);

    // ── Handle WS Messages ──
    const handleWSMessage = useCallback((msg) => {
        setLastEvent(msg);

        switch (msg.type) {
            case 'connected':
                // Server sends initial state snapshot
                if (msg.payload?.recentEvents) {
                    setEvents(msg.payload.recentEvents);
                }
                break;

            case 'state_update':
                setState(prev => ({
                    ...prev,
                    user: { ...prev.user, ...(msg.payload?.user || {}) },
                    world: { ...prev.world, ...(msg.payload?.world || {}) }
                }));
                pushEvent(msg);
                break;

            case 'world_event':
                pushEvent(msg);
                break;

            case 'encounter':
                pushEvent(msg);
                break;

            case 'economy_pulse':
                setState(prev => ({
                    ...prev,
                    economy: msg.payload || prev.economy
                }));
                pushEvent(msg);
                break;

            case 'agent_action':
                pushEvent(msg);
                break;

            case 'pong':
                // Heartbeat response — connection alive
                break;

            default:
                pushEvent(msg);
                break;
        }
    }, []);

    // ── Event Buffer ──
    const pushEvent = useCallback((event) => {
        setEvents(prev => {
            const next = [...prev, event];
            return next.length > MAX_EVENTS ? next.slice(-MAX_EVENTS) : next;
        });
    }, []);

    // ── HTTP Polling Fallback ──
    const startPolling = useCallback(() => {
        if (pollTimer.current) return;
        pollTimer.current = setInterval(fetchState, POLL_INTERVAL);
    }, [fetchState]);

    // ── Send Action (convenience wrapper) ──
    const send = useCallback(async (action, cost = 0, payload = {}) => {
        try {
            const res = await fetch(`${API_BASE}/api/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: state.user?.username || 'guest',
                    action,
                    amount: cost,
                    details: payload
                })
            });
            return await res.json();
        } catch (e) {
            console.warn('[GameState] Action failed:', e.message);
            return { success: false, error: 'offline' };
        }
    }, [state.user]);

    // ── Lifecycle ──
    useEffect(() => {
        // Initial HTTP fetch
        fetchState();

        // Try WebSocket
        connectWS();

        return () => {
            if (wsRef.current) wsRef.current.close();
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
            if (pollTimer.current) clearInterval(pollTimer.current);
        };
    }, [fetchState, connectWS]);

    return { state, events, isLive, send, lastEvent };
}
