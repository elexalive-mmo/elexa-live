---
description: How to deploy the Elexa Live Anchor Program
---

# Deploying Elexa Live Program

## Prerequisites
- Solana CLI installed and configured
- Anchor CLI installed
- Wallet with SOL (Devnet or Mainnet)

## 1. Environment Setup
Select your cluster:
```bash
solana config set --url devnet
# OR
solana config set --url mainnet-beta
```

## 2. Build the Program
Ensure the code compiles and artifacts are generated.
**Option A: Local Anchor (If installed)**
```bash
// turbo
anchor build
```

**Option B: Docker (Recommended)**
```bash
docker run --rm -v $(pwd):/workdir -w /workdir backpackapp/build:v0.29.0 anchor build
```
*Note: Ensure your `Anchor.toml` workspace paths are correct relative to the container.*

## 3. Get Program ID
If this is a fresh deploy, get the program ID from the keypair:
```bash
solana address -k target/deploy/elexa_world-keypair.json
```
*Update `lib.rs` and `Anchor.toml` with this new ID if it differs from the current one.*

## 4. Deploy
Deploy the program to the cluster.
```bash
anchor deploy --provider.cluster devnet
```

## 5. Verify Deployment
Check the program logs and account info.
```bash
solana program show <PROGRAM_ID>
```

## 6. Initialize Global State
Run the initialization script (or test) to set up the GlobalWorld PDA.
```bash
anchor run init-world
```
*Note: Ensure `Anchor.toml` has the `init-world` script defined or run the specific test file.*
