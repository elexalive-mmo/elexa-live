/**
 * ═══════════════════════════════════════════════════════════════
 * PINATA SERVICE ELEXA
 * ═══════════════════════════════════════════════════════════════
 * 
 * IPFS Gateway for storing:
 * 1. Elexamon Images (PNG)
 * 2. Elexamon Metadata (JSON)
 * 
 * Uses Axios for REST API interaction.
 */
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Credentials from .env
const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;

const PINATA_API = 'https://api.pinata.cloud';

/**
 * Helper to get headers based on available auth method
 */
function getHeaders(isMultipart = false) {
    const headers = {};

    if (PINATA_JWT) {
        headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else if (PINATA_API_KEY && PINATA_API_SECRET) {
        headers['pinata_api_key'] = PINATA_API_KEY;
        headers['pinata_secret_api_key'] = PINATA_API_SECRET;
    } else {
        throw new Error('[Pinata] No credentials found in .env');
    }

    // Axios + Form Data handles multipart boundaries automatically if we don't set Content-Type manually here
    // But for JSON it's application/json
    return headers;
}

class PinataService {

    /**
     * Test connection to Pinata API
     */
    async testConnection() {
        try {
            const res = await axios.get(`${PINATA_API}/data/testAuthentication`, {
                headers: getHeaders()
            });
            console.log('[Pinata] Connection Verified:', res.data.message);
            return true;
        } catch (err) {
            console.error('[Pinata] Connection Failed:', err.response?.data || err.message);
            return false;
        }
    }

    /**
     * Upload JSON metadata to IPFS
     * @param {object} metadata - JSON object
     * @param {string} name - Name for the file in Pinata
     */
    async uploadJSON(metadata, name) {
        try {
            const data = JSON.stringify({
                pinataOptions: {
                    cidVersion: 1
                },
                pinataMetadata: {
                    name: name || `metadata_${Date.now()}.json`
                },
                pinataContent: metadata
            });

            const res = await axios.post(`${PINATA_API}/pinning/pinJSONToIPFS`, data, {
                headers: {
                    ...getHeaders(),
                    'Content-Type': 'application/json'
                }
            });

            console.log(`[Pinata] JSON Uploaded: ${res.data.IpfsHash}`);
            return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
        } catch (err) {
            console.error('[Pinata] JSON Upload Failed:', err.response?.data || err.message);
            throw err;
        }
    }

    /**
     * Upload File (Image) to IPFS
     * @param {string} filePath - Absolute path to file
     */
    async uploadFile(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        try {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(filePath));

            const metadata = JSON.stringify({
                name: path.basename(filePath)
            });
            formData.append('pinataMetadata', metadata);

            const options = JSON.stringify({
                cidVersion: 1
            });
            formData.append('pinataOptions', options);

            const res = await axios.post(`${PINATA_API}/pinning/pinFileToIPFS`, formData, {
                headers: {
                    ...getHeaders(true),
                    ...formData.getHeaders()
                },
                maxBodyLength: Infinity
            });

            console.log(`[Pinata] File Uploaded: ${res.data.IpfsHash}`);
            return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
        } catch (err) {
            console.error('[Pinata] File Upload Failed:', err.response?.data || err.message);
            throw err;
        }
    }
}

module.exports = new PinataService();
