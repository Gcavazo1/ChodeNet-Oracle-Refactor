### 1. Authentication Flow & SIWS Implementation

# 🧠 $GIRTH Profile System & SIWS Authentication Spec

## Overview

This document outlines the architecture and logic flow for player identity, profile management, and wallet authentication for the CHODE Tapper game and its connected Oracle dashboard. It is designed for developers working within the ecosystem, including those contributing to Godot, Supabase, and the Oracle frontend/backend layers.

---

## 🎯 Goals

* Support anonymous play + seamless wallet claim (SIWS)
* Maintain two-layer token system: soft balance (off-chain) and hard balance ($GIRTH SPL token)
* Store player profiles and game state in Supabase
* Minimize complexity inside the Godot iframe; offload logic to Oracle and backend

---

## 🔐 Authentication Flow (SIWS)

### Entry Points

* All wallet logic handled by **Oracle page**
* Game remains **wallet-agnostic** and communicates via JSBridge

### Anonymous Flow

1. Player loads game → LocalStorage initialized
2. Game generates unique `sessionID`
3. Player taps and interacts → deltas pushed to Oracle
4. Oracle stores deltas in Supabase tied to `sessionID`

### Transition to Authenticated

1. Player connects wallet (SIWS)
2. Oracle detects existing anonymous session (`sessionID`)
3. Prompt shown: "Claim Your Progress?"
4. If confirmed:
   * Supabase links `sessionID` data to new wallet-based `PlayerProfile`
   * Session data merged to `PlayerGameState`

### Authenticated Flow

* Oracle checks for valid Supabase session on load
* Wallet-connected sessions persist via Supabase JWT
* All future delta + mint events tied to wallet address

---

## 🧾 Supabase Schema

### `PlayerProfile`

```ts
wallet: string;
username?: string;
avatarUrl?: string;
createdAt: string;
lastSeenAt: string;
linkedSessionIDs: string[];
```

### `PlayerGameState`

```ts
wallet: string;
unmintedGirth: number;
mintedGirth: number;
totalTaps: number;
upgradesOwned: string[];
lastMintAt: string;
lastStoryEntry: string;
```

---

## 🧱 Token Layers

### Soft Balance (Off-Chain)

* Tracked via Supabase and LocalStorage
* Accumulated through taps, story submissions, etc.
* Validated and stored using backend endpoints:
  * `/api/update-taps`
  * `/api/story-submit`
* Minted via: `/api/mint-girth`

### Hard Balance (On-Chain)

* Stored in Solana wallet as SPL token
* Minted from treasury wallet → player
* Used for:
  * AI-generated images
  * NFT mints
  * Cosmetics, rituals
  * Boosted voting

---

## 🧠 Key Backend Endpoints

### `/api/update-taps`

* Input: `wallet | sessionID`, `delta`, `timestamp`
* Increments unmintedGirth (soft balance)
* Validates bot protection (rate limit, fingerprint)

### `/api/story-submit`

* Requires SIWS auth
* Checks lastStoryEntry timestamp (4h cooldown)
* Adds +1 Girth to soft balance

### `/api/mint-girth`

* Requires SIWS auth
* Performs CAPTCHA
* Transfers SPL from treasury → wallet
* Resets unmintedGirth, updates mintedGirth

### `/api/merge-session-to-wallet`

* Input: `sessionID`, `wallet`
* Moves all anonymous soft balance to wallet profile
* Links session to PlayerProfile

---

## 🧩 Edge Cases

### Returning Players

* Check for existing session via JWT
* Auto-load profile + game state

### Multi-device Play

* Game state synced via Supabase
* Auth session persisted via Supabase session token

### Abuse Prevention

* CAPTCHA before mint or high-reward actions
* Rate limit `mint-girth` (e.g., 1 per 5m)
* Fingerprint check to detect bots/sybil wallets

---

## 🛠 Next Tasks

* [ ] Implement `PlayerProfile` + `PlayerGameState` schema
* [ ] Create backend endpoint for session merge
* [ ] Display live balance & auth status in Oracle UI
* [ ] Hook up bridge event from game to parent for sync
* [ ] Enable SIWS & minting flow

---

## 🧠 Notes for Expansion

* Add staking contract integration (`Shrine of Eternal Girth`)
* Daily quests + cooldowns (track in Supabase)
* Profile NFT optional future feature
* Social login support via Supabase or OAuth
* Achievements or badges can be NFTs

---


**Where authentication happens:**

* **Exclusively in Oracle parent page**
  Reasoning: Game iframe should remain wallet-agnostic for security. Parent page handles:
  * Wallet connection via Phantom/Backpack
  * SIWS (Sign-In with Solana) signature requests
  * Session management via Supabase Auth

**Anonymous → Authenticated Transition:**

Diagram

Code

Copy

Download

```
sequenceDiagram
    Anonymous User->>Game: Accumulates soft balance
    Game->>LocalStorage: Store session progress
    User->>Oracle: Clicks "Connect Wallet"
    Oracle->>Wallet: SIWS request (nonce + message)
    Wallet->>Oracle: Signed message
    Oracle->>Supabase: Verify signature + create JWT
    Supabase->>Oracle: Auth session + user UUID
    Oracle->>Game: Bridge message: "merge_session"
    Game->>Supabase: POST anonymous_state (localStorage data)
    Supabase->>DB: Merge soft_balance + progress to user UUID
    Game->>LocalStorage: Clear anonymous state
```

**Session Persistence Strategy:**

* **Short-term** : JWT in `httpOnly` cookies (24h expiry)
* **Long-term** : Refresh tokens with 30-day expiry
* **Critical security** : Store wallet nonces in Supabase table:
  **sql**

  Copy

  Download

```
  CREATE TABLE auth_nonces (
    wallet_address TEXT PRIMARY KEY,
    nonce TEXT,
    expires_at TIMESTAMPTZ
  );
```

### 2. Profile Architecture

**Data Segmentation:**

| **Profile Data** (Supabase) | **Game State** (Supabase) | **On-Chain**   |
| --------------------------------- | ------------------------------- | -------------------- |
| - username (unique)               | - soft_balance                  | - $GIRTH SPL balance |
| - avatar_hash (IPFS CID)          | - slap_count                    | - Achievement NFTs   |
| - connected_wallets[]             | - last_story_time               | - Cosmetic NFTs      |
| - social_links                    | - upgrades                      |                      |
| - preferences                     | - active_rituals                |                      |
| - NFT_cache (JSONB)               | - mint_cooldowns                |                      |

**Cross-Device Sync:**

* **Real-time sync** : Use Supabase Realtime for critical balance updates
* **Conflict resolution** :
  **javascript**

  Copy

  Download

```
  // When game state diverges
  const mergeStrategy = (serverState, localState) => {
    // Prefer server for balances, local for progress
    return {
      soft_balance: Math.max(serverState.soft_balance, localState.soft_balance),
      slap_count: localState.slap_count // More recent activity
    }
  };
```

**Wallet Management:**

Diagram

Code

Copy

Download

```
erDiagram
    USERS ||--o{ WALLETS : has
    USERS {
        UUID id PK
        TIMESTAMP created_at
    }
    WALLETS {
        TEXT address PK
        UUID user_id FK
        BOOLEAN is_primary
    }
```

* Primary wallet for minting $GIRTH
* Secondary wallets for NFT display only
* Wallet rotation via re-signing flow

### 3. Blockchain Integration Strategy

**On-Chain Data Policy:**

* **Store on-chain** :
* $GIRTH token balances (SPL)
* Soulbound Achievement NFTs
* Tradeable cosmetic NFTs
* **Keep off-chain** :
* Usernames (Supabase)
* Game progress (Supabase)
* Social features

**NFT Integration Flow:**

Diagram

Code

Copy

Download

```
flowchart TB
    GameEvent -->|Bridge| Oracle
    Oracle -->|Wallet| NFTValidation
    subgraph Solana
        NFTValidation --> Metaplex
        Metaplex -->|NFT Metadata| Oracle
    end
    Oracle --> Supabase[NFT Cache in Supabase]
    Supabase -->|Realtime| Game[Update Game Display]
```

**Transaction Signing Scope:**

* **Parent page exclusively handles** :

1. $GIRTH minting (SPL transfer)
2. NFT purchases (on-chain marketplace)
3. Profile picture generation (payment tx)
4. Staking authorizations

* **Game requests via bridge messages** :
  **json**

  Copy

  Download

```
  {
    "type": "mint_request",
    "amount": 150,
    "captcha_token": "abc123"
  }
```

### Critical Implementation Packages

1. **SIWS Verification Kit** :
   **bash**

   Copy

   Download

```
   npm install @solana/web3.js @supabase/supabase-js siws
```

   Verification workflow:
   **javascript**

   Copy

   Download

```
   // Supabase Edge Function
   const { verify } = require('siws')
   const message = {
     domain: "girth.game",
     address: walletAddress,
     nonce: await getNonce(walletAddress),
     statement: "Sign to access GirthGame"
   }
   if (await verify(message, signature)) {
     await createJWT(walletAddress)
   }
```

1. **Anti-Abuse Systems** :

* **Sybil detection** :
  **sql**

  Copy

  Download

  ``    SELECT COUNT(*)       FROM mint_events       WHERE ip = :ip       AND time > NOW() - INTERVAL '1 day'    ``
* **Minting cooldown** :
  **javascript**

  Copy

  Download

  ```
   // Edge Function
   const lastMint = await supabase
     .from('profiles')
     .select('last_mint')
     .eq('id', userID)

  if (Date.now() - lastMint < MIN_MINT_INTERVAL) {
     throw new Error('Cooldown active')
   }
  ```

1. **State Sync Flow** :
   **typescript**

   Copy

   Download

```
   // Godot Bridge
   func _on_sync_requested():
       var state = {
           "slaps": slap_counter,
           "soft_balance": unminted_girth
       }
       JavaScriptBridge.eval(
           "parent.postMessage({type: 'STATE_SYNC', payload: $0}, '*')",
           [JSON.stringify(state)]
       )
```

### Security Hardening

1. **Bridge Communication** :
   **javascript**

   Copy

   Download

```
   // Oracle page
   window.addEventListener('message', (e) => {
     if (e.origin !== 'https://game.girth.xyz') return
     // Validate message structure
     if (!e.data.type || !e.data.payload) return
   })
```

1. **Minting Protection** :

* CAPTCHA required before mint tx
* Treasury wallet rate limiting
* SPL transfer validation:
  **rust**

  Copy

  Download

  ```
  // Anchor program
  fn validate_mint(ctx: Context<MintGirth>) -> Result<()> {
      require!(ctx.accounts.treasury.amount >= ctx.amount, GirthError::InsufficientFunds);
      require!(clock.unix_timestamp - ctx.accounts.user.last_mint > 24*60*60, GirthError::Cooldown);
      Ok(())
  }
  ```

### Recommended Architecture Summary

* **Auth Flow** : SIWS exclusively in parent → JWT sessions → Anonymous state merging
* **Profile Structure** :
* Supabase for mutable data
* Solana for financial/NFT assets
* IPFS for avatar storage
* **BlockchainOps** :
* On-chain: $GIRTH transfers & NFTs
* Off-chain: All game state
* **Anti-Abuse** :
* Multi-layered cooldowns
* CAPTCHA gate
* Treasury safeguards

This design enables:

1. Seamless anonymous-to-web3 onboarding
2. Secure token minting with compliance safeguards
3. Real-time cross-device profile sync
4. Minimal blockchain friction while maintaining web2 UX
5. Extensible NFT integration for future features
