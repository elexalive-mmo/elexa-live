/**
 * ═══════════════════════════════════════════════════════════
 * WEBSOCKET BROADCAST SERVER — Real-Time Pulse
 * ═══════════════════════════════════════════════════════════
 *
 * Pushes live events to all connected clients:
 * - Game state changes (party HP, XP, bosses)
 * - World events (encounters, raids, lore drops)
 * - Economy pulses (treasury, market sentiment)
 * - Agent actions (orchestration results)
 *
 * Usage:
 *   const { wsBroadcast } = require('./lib/ws-broadcast');
 *   wsBroadcast.init(server); // Pass the HTTP server
 *   wsBroadcast.send('world_event', { ... });
 */

const WebSocket = require('ws');

class WSBroadcast {
    constructor() {
        this.wss = null;
        this.clients = new Set();
        this.eventLog = [];     // Rolling buffer of last 50 events
        this.maxLogSize = 50;
    }

    /**
     * Initialize WebSocket server on the same HTTP server
     */
    init(httpServer) {
        this.wss = new WebSocket.Server({ server: httpServer, path: '/ws' });

        this.wss.on('connection', (ws, req) => {
            this.clients.add(ws);
            const ip = req.socket.remoteAddress;
            console.log(`[WS] Client connected (${this.clients.size} total) from ${ip}`);

            // Send current state snapshot on connect
            ws.send(JSON.stringify({
                type: 'connected',
                payload: {
                    clientCount: this.clients.size,
                    recentEvents: this.eventLog.slice(-10),
                    serverTime: new Date().toISOString(),
                    version: '0.0.8'
                }
            }));

            // Handle incoming messages from clients
            ws.on('message', (raw) => {
                try {
                    const msg = JSON.parse(raw);
                    this.handleClientMessage(ws, msg);
                } catch (e) {
                    console.warn('[WS] Invalid message:', e.message);
                }
            });

            ws.on('close', () => {
                this.clients.delete(ws);
                console.log(`[WS] Client disconnected (${this.clients.size} remaining)`);
            });

            ws.on('error', (err) => {
                console.warn('[WS] Client error:', err.message);
                this.clients.delete(ws);
            });
        });

        console.log(`⚡ WebSocket broadcast ready on /ws`);
        return this;
    }

    /**
     * Handle messages from clients (actions, pings)
     */
    handleClientMessage(ws, msg) {
        switch (msg.type) {
            case 'ping':
                ws.send(JSON.stringify({ type: 'pong', ts: Date.now() }));
                break;
            case 'action':
                // Client-originated actions go through the REST API,
                // but we can echo confirmation back via WS
                ws.send(JSON.stringify({
                    type: 'action_ack',
                    payload: { action: msg.action, received: true }
                }));
                break;
            default:
                break;
        }
    }

    /**
     * Broadcast an event to ALL connected clients
     */
    send(eventType, payload = {}) {
        const event = {
            type: eventType,
            payload,
            ts: Date.now(),
            serverTime: new Date().toISOString()
        };

        // Buffer the event
        this.eventLog.push(event);
        if (this.eventLog.length > this.maxLogSize) {
            this.eventLog.shift();
        }

        // Broadcast to all alive clients
        const message = JSON.stringify(event);
        let sent = 0;
        for (const client of this.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
                sent++;
            }
        }

        return sent;
    }

    /**
     * Send to a specific client (e.g., personal notifications)
     */
    sendTo(ws, eventType, payload = {}) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: eventType,
                payload,
                ts: Date.now()
            }));
        }
    }

    /**
     * Convenience: Broadcast game state update
     */
    pushState(gameState) {
        return this.send('state_update', gameState);
    }

    /**
     * Convenience: Broadcast a world event (boss spawn, lore drop, etc.)
     */
    pushWorldEvent(event) {
        return this.send('world_event', event);
    }

    /**
     * Convenience: Broadcast economy pulse
     */
    pushEconomyPulse(economyData) {
        return this.send('economy_pulse', economyData);
    }

    /**
     * Convenience: Broadcast agent action result
     */
    pushAgentAction(agentId, action, result) {
        return this.send('agent_action', { agentId, action, result });
    }

    /**
     * Convenience: Broadcast encounter notification
     */
    pushEncounter(userId, encounter) {
        return this.send('encounter', { userId, encounter });
    }

    /**
     * Get stats
     */
    getStats() {
        return {
            connectedClients: this.clients.size,
            eventsSent: this.eventLog.length,
            lastEvent: this.eventLog[this.eventLog.length - 1] || null
        };
    }
}

// Singleton
const wsBroadcast = new WSBroadcast();

module.exports = { wsBroadcast, WSBroadcast };
