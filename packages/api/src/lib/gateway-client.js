const WebSocket = require('ws');

class GatewayClient {
    constructor() {
        this.ws = null;
        this.url = process.env.GATEWAY_URL || 'ws://127.0.0.1:18789';
        this.token = process.env.GATEWAY_TOKEN;
        this.isConnected = false;
        this.reconnectInterval = 5000;
    }

    connect() {
        if (!this.token) {
            console.warn('[Gateway] No GATEWAY_TOKEN found. Skipping connection.');
            return;
        }

        console.log(`[Gateway] Connecting to ${this.url}...`);
        this.ws = new WebSocket(this.url, {
            headers: {
                'x-claw-token': this.token
            }
        });

        this.ws.on('open', () => {
            console.log('[Gateway] Connected to OpenClaw API.');
            this.isConnected = true;
        });

        this.ws.on('message', (data) => {
            try {
                const msg = JSON.parse(data);
                this.handleMessage(msg);
            } catch (e) {
                console.error('[Gateway] Parse error:', e.message);
            }
        });

        this.ws.on('close', () => {
            if (this.isConnected) {
                console.warn('[Gateway] Disconnected. Attempting background reconnect...');
            }
            this.isConnected = false;
            setTimeout(() => this.connect(), this.reconnectInterval);
        });

        this.ws.on('error', (err) => {
            if (this.isConnected) {
                console.error('[Gateway] Error:', err.message);
            }
        });
    }

    handleMessage(msg) {
        // Handle incoming gateway messages (e.g. Discord chat)
        console.log('[Gateway] Received:', msg.type);
    }

    send(payload) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(payload));
        } else {
            console.warn('[Gateway] Cannot send, not connected.');
        }
    }

    // Send content to a specific channel via Gateway
    async dispatch(platform, targetId, message) {
        this.send({
            type: 'dispatch',
            platform,
            targetId,
            message
        });
    }
}

const gatewayClient = new GatewayClient();
module.exports = { gatewayClient };
