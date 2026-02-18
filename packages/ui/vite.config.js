import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [
            react(),
            nodePolyfills({
                // To exclude specific polyfills, add them to this list.
                exclude: [
                    'fs', // Excludes the polyfill for `fs` and `node:fs`.
                ],
                // Whether to polyfill `node:` protocol imports.
                protocolImports: true,
            }),
        ],
        define: {
            // Expose env vars to the client
            'TWITCH_CLIENT_ID': JSON.stringify(env.TWITCH_CLIENT_ID),
        },
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
        server: {
            port: 5173,
            host: true
        }
    }
})
