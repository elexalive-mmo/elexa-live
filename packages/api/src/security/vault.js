/**
 * ELEXA LIVE - VAULT (SECURE WALLET ENCRYPTION)
 * "Five Passkeys, Zero Leaks."
 * 
 * Logic:
 * - Uses AES-256nd to encrypt/decrypt Council wallet JSONs.
 * - Requires COUNCIL_MASTER_KEY environment variable.
 */

const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');

const ALGORITHM = 'aes-256-cbc';
const VAULT_DIR = path.join(__dirname, '../../data/vault');
const MASTER_KEY = process.env.COUNCIL_MASTER_KEY || 'elexa_dev_fallback_key_DO_NOT_USE_IN_PROD';

class Vault {
    constructor() {
        fs.ensureDirSync(VAULT_DIR);
    }

    /**
     * Encrypt and save a wallet.
     */
    async storeWallet(agentId, walletData) {
        const key = this.deriveKey(MASTER_KEY);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        const data = JSON.stringify(walletData);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const payload = {
            iv: iv.toString('hex'),
            data: encrypted
        };

        const filePath = path.join(VAULT_DIR, `${agentId}.vault`);
        await fs.writeJson(filePath, payload);
        console.log(`[Vault] 🔒 Wallet for ${agentId} secured in the abyss.`);
    }

    /**
     * Decrypt and load a wallet.
     */
    async loadWallet(agentId) {
        const filePath = path.join(VAULT_DIR, `${agentId}.vault`);
        if (!fs.existsSync(filePath)) return null;

        const payload = await fs.readJson(filePath);
        const key = this.deriveKey(MASTER_KEY);
        const iv = Buffer.from(payload.iv, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

        let decrypted = decipher.update(payload.data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return JSON.parse(decrypted);
    }

    deriveKey(input) {
        // Simple hash for derivation (In prod, use PBKDF2 with salt)
        return crypto.createHash('sha256').update(input).digest();
    }
}

module.exports = { vault: new Vault() };
