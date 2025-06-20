# 🎮 GAME SOFT BALANCE SYNC PROTOCOL - WALLET-FIRST ARCHITECTURE
**$CHODE Tapper ↔ Oracle Backend - Secure Token Economy**

---

## 🚨 CRITICAL ARCHITECTURAL CHANGE: WALLET-FIRST APPROACH

### **FUNDAMENTAL SECURITY PRINCIPLE:**
**Anonymous users CANNOT accumulate soft balance or sync to Oracle**

**Why this change is critical:**
- 🛡️ **Prevents Sybil Attacks**: Anonymous sessions could enable unlimited token farming
- 💰 **Protects Economic Value**: Soft balance represents real SPL tokens
- 🔐 **Ensures Identity Verification**: All token accumulation tied to verified wallets
- ⚖️ **Regulatory Compliance**: Clear ownership and audit trail for token value

---

## 📊 CURRENT SYSTEM STATUS (UPDATED ARCHITECTURE)

### ✅ **WORKING CORRECTLY:**
- **JavaScript Bridge**: Oracle ↔ Game communication pipeline
- **Event Ingestion**: Real-time game events for authenticated users
- **Oracle Metrics**: Dashboard displaying authenticated user data
- **SIWS Authentication**: Wallet connection and session management
- **Offline Gaming**: Anonymous users can play without sync

### 🔄 **ARCHITECTURAL CHANGES:**
- **Anonymous Users**: Offline gaming only, no sync capabilities
- **Authenticated Users**: Full Oracle features and token accumulation
- **Sync Requirement**: Wallet connection mandatory for any backend operations
- **Clear UX**: "Connect Wallet to Sync Progress & Earn $GIRTH" messaging

---

## 🔧 WALLET-FIRST SYNC ARCHITECTURE

### **ANONYMOUS USER FLOW (Offline Only):**
```
🎮 Game loads → Play offline → Local progress only
    ↓ (No sync capabilities)
💡 "Connect Wallet to Sync Progress & Earn $GIRTH"
    ↓ (Clear call-to-action)
🚫 Sync buttons disabled → No token accumulation
```

### **AUTHENTICATED USER FLOW (Oracle Features):**
```
🔐 Wallet connected → SIWS authentication complete
    ↓ (Identity verified)
🎮 Game state syncs → Real-time Oracle communication
    ↓ (Secure token earning)
💰 Soft balance accumulates → Verified $GIRTH tokens
    ↓ (When ready)
🪙 Mint to hard balance → Spendable SPL tokens
```

---

## 🎯 SECURE SOFT BALANCE SYNC PROTOCOL

### **Phase 1: Wallet Authentication (Required)**
```typescript
// SIWS verification required before any sync operations
{
  wallet_address: "verified_solana_address",
  signature: "signed_message_proof",
  session_metadata: {
    authenticated: true,
    verification_timestamp: "2025-01-15T10:30:00Z"
  }
}

// ✅ Only authenticated users can proceed to sync
// 🚫 Anonymous users blocked from all token operations
```

### **Phase 2: Authenticated Game Events**
```typescript
// Game events (authenticated users only)
{
  session_id: "authenticated_session_123",
  wallet_address: "verified_wallet", // Required field
  event_type: "tap_burst", 
  event_payload: {
    tap_count: 50,
    girth_earned: 25,
    session_taps: 1500
  },
  timestamp_utc: "2025-01-15T10:30:00Z"
}

// ✅ Insert into live_game_events table
// ✅ Update soft balance for verified wallet
// ✅ Full audit trail maintained
```

### **Phase 3: Secure State Management**
```typescript
// player-state-manager function (authenticated only)
POST /functions/v1/player-state-manager
{
  session_id: "authenticated_session_123",
  player_address: "verified_wallet", // Required for all operations
  action: "save",
  player_state: {
    current_girth: 150,
    total_mega_slaps: 12,
    total_giga_slaps: 3,
    iron_grip_lvl1_purchased: true
  }
}

// ✅ Upserts to player_states table with wallet verification
// ✅ Links to user_profiles for authenticated users
// ✅ Enables soft balance accumulation
```

---

## 🛡️ SECURITY & ANTI-ABUSE MEASURES

### **Wallet-Based Identity Verification:**
- Every sync operation requires valid wallet signature
- One wallet = one identity (prevents multi-accounting)
- Solana wallet creation has natural friction and cost
- Rate limiting applied per wallet address

### **Economic Protection:**
- Zero anonymous token accumulation possible
- All soft balance tied to verified wallet ownership
- Treasury protection from sybil farming
- Clear regulatory compliance path

### **Technical Safeguards:**
- SIWS signature verification for all operations
- Wallet-based session management
- Comprehensive audit trails
- Anti-bot detection for authenticated users

---

## 🎮 GODOT GAME INTEGRATION

### **Anonymous Mode (Default State):**
```gdscript
# In StateManager.gd
func can_trigger_manual_sync() -> bool:
    # Sync only available for authenticated users
    return is_authenticated_player and oracle_connected

func save_game_state_consolidated() -> bool:
    if not is_authenticated_player:
        print("StateManager: 🚫 Sync requires wallet authentication")
        return false
    # Proceed with authenticated sync
```

### **UI State Management:**
```gdscript
# In MainMenuManager.gd
func _update_button_states():
    if not wallet_connected:
        save_button.text = "CONNECT WALLET TO SYNC"
        save_button.disabled = true
        load_button.text = "CONNECT WALLET TO SYNC" 
        load_button.disabled = true
    else:
        # Normal sync functionality for authenticated users
        if not oracle_ready:
            save_button.text = "ORACLE OFFLINE"
            save_button.disabled = true
        elif not sync_available:
            var remaining = StateManager.get_sync_cooldown_remaining()
            save_button.text = "COOLDOWN (%ds)" % remaining
            save_button.disabled = true
        else:
            save_button.text = "SAVE TO ORACLE"
            save_button.disabled = false
```

---

## 🧪 TESTING PROTOCOL (WALLET-FIRST)

### **Test 1: Anonymous User Restrictions** 🚫
```bash
# Start game without wallet connection
Game loads → Anonymous mode active

# Attempt sync operations
Click "Save to Oracle" → Button shows "CONNECT WALLET TO SYNC"
Verify: No backend calls made
Result: Anonymous users properly blocked from sync
```

### **Test 2: Authenticated User Sync** ✅
```bash
# Connect wallet and authenticate
Wallet connection → SIWS verification → Authenticated state

# Test sync operations
Generate girth → Click "Save to Oracle" → Backend sync
Verify: player_state_save event with wallet_address
Result: Authenticated sync working correctly
```

### **Test 3: Token Accumulation Security** 🔐
```bash
# Verify token earning restrictions
Anonymous user → Play game → No soft balance accumulation
Authenticated user → Play game → Soft balance increases
Verify: Only authenticated users can earn token value
Result: Economic security maintained
```

---

## 📊 SUCCESS METRICS

### **Security Metrics:**
- **Anonymous Sync Attempts**: 0% success rate (properly blocked)
- **Authenticated Sync Success**: >95% for verified wallets
- **Sybil Attack Prevention**: 0% anonymous token accumulation

### **User Experience Metrics:**
- **Anonymous Engagement**: High offline gameplay retention
- **Wallet Connection Rate**: Anonymous → Authenticated conversion
- **Sync Reliability**: Consistent state persistence for authenticated users

### **Economic Integrity:**
- **Token Security**: 100% of soft balance tied to verified wallets
- **Treasury Protection**: No unauthorized token claims
- **Audit Compliance**: Full traceability for all token operations

---

## 🚨 IMPLEMENTATION CHECKLIST

### **IMMEDIATE (Game UI Updates):**
- ✅ Update sync button text for anonymous users
- ✅ Disable sync functionality without wallet connection
- ✅ Show clear "Connect Wallet" messaging
- ✅ Maintain offline gaming experience

### **BACKEND (Security Enforcement):**
- ✅ Verify wallet_address required for all sync operations
- ✅ Block anonymous users from token accumulation
- ✅ Enhance SIWS verification for sync endpoints
- ✅ Update error messages for unauthorized attempts

### **TESTING (Verification):**
- ✅ Test anonymous user restrictions
- ✅ Verify authenticated user functionality
- ✅ Confirm economic security measures
- ✅ Validate UI/UX messaging clarity

---

## 🎯 NEXT STEPS

1. **Deploy Wallet-First UI**: Update game to show wallet requirements
2. **Test Security**: Verify no anonymous token accumulation possible
3. **Enhance SIWS Flow**: Streamline wallet connection experience
4. **Monitor Metrics**: Track anonymous → authenticated conversion rates
5. **Optimize UX**: Improve wallet connection call-to-action messaging

**This wallet-first architecture ensures economic security, prevents sybil attacks, and maintains regulatory compliance while providing an excellent user experience for both anonymous and authenticated users.**

---

*Document generated automatically – keep updated as implementation evolves.*

---

## 🛠️ CHANGE LOG

### 2025-06-14 – Frontend Fallback Balance Refresh
- **Issue**: After successful `player_state_save`, Oracle UI did not update soft balance until full page refresh.
- **Root Cause**: `gameEventHandler.ts` attempted to query `user_profiles` → `girth_balances` but returned 406 when no `user_profiles` row existed for the wallet, aborting UI refresh.
- **Fix Implemented**: Added a *local fallback* in `gameEventHandler.ts` which, on failure to refresh from Supabase, dispatches `balanceUpdated` and `gameStateUpdated` events using the `soft_girth_balance` contained in the just-saved `player_state` payload. This guarantees immediate UI refresh even if backend look-ups fail.
- **File Modified**: `src/lib/gameEventHandler.ts` (see `⚠️ Using local fallback balance update` log line).
- **Next Steps**: Ensure SIWS verification always inserts corresponding `user_profiles` rows so the primary balance refresh path succeeds, and consider extending `player-state-manager` response to include the updated balance to remove any extra queries.

--- 