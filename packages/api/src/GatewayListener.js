const WebSocket = require('ws');

/**
 * ═══════════════════════════════════════════════════════════
 * GATEWAY LISTENER — Omnichannel Event Sync
 * ═══════════════════════════════════════════════════════════
 * Connects to the OpenClaw Gateway to sync platform events
 */
class GatewayListener {
    constructor(gatewayUrl, token, actionsCallback) {
        this.gatewayUrl = gatewayUrl;
        this.token = token;
        this.actionsCallback = actionsCallback;
        this.ws = null;
        this.reconnectInterval = 5000;
        this.maxRetries = 3;
        this.retryCount = 0;
        this.heartbeatInterval = null;
    }

    connect() {
        const baseUrl = this.gatewayUrl.replace('localhost', '127.0.0.1');

        this.ws = new WebSocket(baseUrl, {
            headers: {
                'x-claw-token': this.token,
                'Origin': 'http://localhost'
            }
        });

        this.ws.on('open', () => {
            console.log('[GatewayListener] Connected!');
            this.retryCount = 0; // Reset on successful connection
            if (this.onConnect) this.onConnect();

            // Start Heartbeat to prevent Code 1000 (Idle Timeout)
            this.startHeartbeat();
        });

        this.ws.on('pong', () => {
            // Native pong received
        });

        this.ws.on('message', (data) => {
            try {
                const msg = JSON.parse(data);
                this.handleMessage(msg);
            } catch (e) {
                console.error('[GatewayListener] Parse error:', e);
            }
        });

        this.ws.on('close', (code, reason) => {
            console.log(`[GatewayListener] Disconnected. Code: ${code}, Reason: ${reason}`);
            this.stopHeartbeat();

            if (this.onDisconnect) this.onDisconnect();

            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                const delay = this.reconnectInterval * this.retryCount;
                console.log(`[GatewayListener] Retry ${this.retryCount}/${this.maxRetries} in ${delay / 1000}s...`);
                setTimeout(() => this.connect(), delay);
            } else {
                console.log('[GatewayListener] Max retries reached. Staying offline. Start the gateway to reconnect.');
            }
        });

        this.ws.on('error', (err) => {
            console.error('[GatewayListener] Error:', err.message);
        });
    }

    handleMessage(msg) {
        // Map Gateway events to elexaOS Actions
        if (msg.type === 'message.create') {
            const platform = msg.provider; // twitch, discord, etc.
            const user = msg.author.username;
            const content = msg.content;

            // Construct action payload
            const action = {
                userId: user,
                action: `${platform}_message`, // e.g., twitch_message
                amount: platform === 'twitch' ? 10 : 5,
                details: content
            };

            this.actionsCallback(action);
        }
    }

    startHeartbeat() {
        this.stopHeartbeat();

        // Initial ping to convert connection to 'active'
        setTimeout(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: 'ping' }));
            }
        }, 1000);

        this.heartbeatInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: 'ping' }));
            }
        }, 5000); // 5s interval (aggressive keep-alive)
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
}

module.exports = GatewayListener;
