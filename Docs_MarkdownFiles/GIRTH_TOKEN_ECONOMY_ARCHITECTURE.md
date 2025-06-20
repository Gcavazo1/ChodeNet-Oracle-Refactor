# 🧠 $GIRTH Game Economy & Architecture Summary

## 🎮 In-Game Token Logic Overview

| Action | Earns | Storage Type |
|--------|--------|--------------|
| Tap in game | +1 Girth point | LocalStorage (Godot) |
| Story submission | +1 Girth (every 4h) | Supabase + LocalStorage |
| Other engagement | Varies | Supabase backend |
| "Secure Balance" | Converts to $GIRTH SPL | Solana Blockchain |

### 🏆 Exchange Rate: 1 Girth → 0.000075 $GIRTH (SPL Token)
### 💸 Payout occurs manually via user-triggered "Save & Mint" button

## 🧱 Two-Layer Token System

### 1. 🧪 Soft Balance (Unminted $GIRTH)
- Earned via game and platform interactions
- Stored in Supabase + browser LocalStorage
- Displayed on parent page UI
- Not yet on-chain

**Benefits:**
- Enables batching (fewer tx = lower fees)
- Captcha and abuse filtering possible
- Users can earn before connecting wallet

### 2. 🪙 Hard Balance (Minted SPL Token)
- Stored on-chain in the user's wallet
- **Used to:**
  - Pay for Stable Diffusion AI images
  - Mint NFTs
  - Boost votes in prophecy polls
  - Buy cosmetics, rituals, power-ups
- Created only when user manually mints

## 🔁 Player Session Flow

| Layer | Responsibilities |
|-------|------------------|
| Godot Game | Tracks taps, saves Girth in LocalStorage |
| Parent Web Page | Handles wallet logic (via Wallet Adapter / SolanaConnect), UI, minting button |
| Supabase | Stores earned soft balance, prevents abuse, verifies mint eligibility |
| Solana | Mints or sends SPL tokens from treasury wallet (or program logic) |

## ✅ Core Feature Modules

### 🕹️ balance.ts
```typescript
type UserBalance = {
  wallet: string;
  unmintedGirth: number;
  mintedGirth: number;
  lastMintAt: number;
  lastStoryEntry: number;
};
```
*Stored in Supabase, keyed by wallet address.*

### 🛠 Game Tap Flow
1. Game iframe tracks local Girth
2. On sync or exit, sends delta to parent page
3. Parent POSTs to `/api/update-taps`:
```json
{
  "wallet": "user wallet",
  "delta": 512,
  "sessionID": "uuid"
}
```
4. Backend verifies & updates soft balance:
   ```typescript
   unmintedGirth += delta * 0.000075
   ```

### 📖 Story Builder Flow
1. One entry every 4 hours
2. Requires SIWS auth
3. Backend enforces cooldown and logs
```typescript
backend.updateBalance(wallet, +1);
```

### 🔐 Save & Mint Flow
1. User clicks "Secure Tokens"
2. CAPTCHA prompt (prevent automation)
3. Backend validates + authorizes mint
4. Parent mints from game treasury wallet via SPL transfer
5. Backend updates:
```typescript
mintedGirth += unmintedGirth;
unmintedGirth = 0;
lastMintAt = now();
```

## 🧤 Abuse Prevention Strategies

| Technique | Description |
|-----------|-------------|
| Rate limit "Save & Mint" | One per X minutes |
| CAPTCHA | Before every mint or high-reward action |
| Supabase session logging | Logs all interactions and rewards |
| Device fingerprinting | Detect bots, sybil wallets |
| Randomized reward variation | Optional, to break patterns |
| Skill-based tap zones | Breaks auto-clicking, requires cursor movement |
| Decoy click zones | Trap bots clicking in wrong UI elements |

## 🔮 Future Additions & Systems

| Feature | Description |
|---------|-------------|
| Prestige system | Burn $GIRTH to reset and gain "Ascended Girth Points" |
| NFT unlocks | Mint NFT when user reaches threshold |
| Shrine staking | Stake SPL token in smart contract for yield or boosts |
| Leaderboards | Minted + unminted score per wallet, shown publicly |
| Daily quests | Tracked via Supabase + frontend schedule |
| Cosmetic store | SPL token spent for skins, particles, etc. |

## 🎨 UX Features to Reinforce Value

| UI Feature | Description |
|------------|-------------|
| Toasts | "+0.075 $GIRTH added to soft balance" |
| Tooltips | Warn about non-minted Girth being off-chain only |
| Mint Reminder Button | "Secure Your Tokens" call to action |
| Session Log | Breakdown of how user earned current soft balance |

## 🧠 TL;DR for Implementation Strategy

✅ Use localStorage for fast game-side tap tracking  
✅ Use Supabase to store and verify rewards  
✅ Use Parent Page for wallet actions & minting logic  
✅ Begin with a token treasury wallet, not an on-chain program  
✅ Add Solana program only when necessary (scaling, security)

---

## 📋 Migration Notes from Solana SDK Approach

**OLD:** Godot game directly managed SPL tokens via SDK  
**NEW:** Godot tracks soft balance, parent page handles blockchain  

**OLD:** Direct on-chain transactions from game  
**NEW:** Batched minting via parent page treasury wallet  

**OLD:** Complex wallet management in GDScript  
**NEW:** Simple JavaScript bridge communication  

**Status:** Phase 1 (SDK removal) complete, Phase 2 (bridge testing) pending 