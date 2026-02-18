# Environmental Security Strategy

## The Core Principle: "Need to Know"

We separate the system into three security tiers to ensure that if the Website is compromised, the Agent's brain and the Treasury's keys remain safe.

### Tier 1: The Brain (OpenClaw Agent)
*   **Where it lives:** The Local Machine / Secure Server.
*   **What it knows:** Everything.
*   **Critical Secrets:** Social Logins, AI Keys, Admin Tokens.
*   **Risk Level:** EXTREME. Never expose these to the frontend.

### Tier 2: The Hand (Sync Service / Backend)
*   **Where it lives:** `packages/agent-sync` (Node.js Service).
*   **What it knows:** Private Keys for *transaction signing*.
*   **Critical Secrets:** `WALLET_PRIVATE_KEY`.
*   **Risk Level:** HIGH. Kept in `.env` only on the secure server.

### Tier 3: The Face (Web App / TTE)
*   **Where it lives:** `apps/site` (User's Browser).
*   **What it knows:** Public Identifiers only.
*   **Critical Secrets:** NONE.
*   **Risk Level:** LOW.
*   **Restriction:** The frontend code builds *only* variables starting with `VITE_`. Even if your `.env` contains private keys, the build tool (Vite) intentionally ignores them unless they have the prefix.

## Workflow
1.  **Local Dev:** Copy `.env.example` to `.env`. Fill in all keys.
2.  **Deployment (Vercel):** ONLY add the `VITE_` variables to the Vercel Project Settings. Do NOT add the Private Keys or Agent Tokens there.
3.  **Deployment (Agent Server):** Add the full set of keys to the secure runtime environment.

## Key Rotation
If `WALLET_PRIVATE_KEY` or `OPENCLAW_ADMIN_TOKEN` is suspected compromised:
1.  Generate new key/token immediately.
2.  Update `.env` locally.
3.  Restart `agent-sync` service.
