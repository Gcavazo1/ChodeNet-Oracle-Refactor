# 📡 $GIRTH Soft-Balance Game Sync Spec

> **Purpose** – Define the precise message formats, timing rules, and backend endpoints that let the Godot game (HTML5 iframe) keep the *soft* $GIRTH balance in-sync with Supabase **without** ever touching the player's wallet.

---

## 1. High-Level Flow

```mermaid
sequenceDiagram
    Godot ➜ Oracle: postMessage(GameEvent JSON)
    Oracle ➜ Supabase Edge: `ingest-chode-event`  (HTTP POST)
    Edge FN ➜ DB: insert live_game_events  +  ⚙️ update `girth_balances`
    Edge FN ➜ Oracle: HTTP 200 JSON w/ event_id
    Oracle ➜ Godot: postMessage(balance_update)
```

* **Soft balance lives in Postgres** (`girth_balances.soft_balance`).
* **Game is stateless regarding wallets** – it only knows a `session_id` plus optional `player_address` if the wallet has been attached during play.
* **Oracle parent page** converts raw game deltas into REST calls; no database credentials are ever exposed in the iframe.

---

## 2. Event Types That Earn $GIRTH

| Event | Sent From Game | Primary Metric | Exchange | Notes |
|-------|----------------|----------------|----------|-------|
| `tap_activity_burst` | every ≈15 s OR 200 taps | `tap_count` | `tap_count × 0.000075` | Core idle clicks |
| `mega_slap_burst` | on mega-slap batches | `slap_count` *or* `total_girth_gained` | prefer `total_girth_gained` else `slap_count × 0.000075` | Upgraded tap |
| `giga_slap_burst` | on giga-slap batches | `slap_count` *or* `total_girth_gained` | same rule | Highest tier |

> **Important** – If the game supplies `total_girth_gained` that value is trusted; otherwise the backend falls back to the deterministic exchange-rate.

---

## 3. Message Schema (Game ➜ Oracle)

```jsonc
{
  "session_id": "7fa7d7aa-b113-4d1e-9d18-7f5b7f21cebb",
  "event_type": "tap_activity_burst",
  "timestamp_utc": "2025-02-12T18:33:21.442Z",
  "player_address": "GJz…Z3wM",        // nullable – empty for anonymous
  "event_payload": {
    "tap_count": 200,
    "batch_duration_seconds": 15,
    "avg_taps_per_second": 13.3,
    "peak_taps_per_second": 18.0,
    "session_total_taps": 6420,
    "current_girth": 107.85
  }
}
```

### Field Rules
1. `session_id` – UUID **generated once per page-load** and reused for all events.
2. `player_address` – **only** populated after wallet connect; backend treats missing value as "anonymous".
3. `timestamp_utc` – ISO 8601 in UTC. If omitted, Oracle will add it.
4. `event_payload` – See table above per event_type.

---

## 4. Backend Logic (inside `ingest-chode-event`)

```ts
if (hasWallet && isBurstEvent(event_type)) {
  const earned = calcGirthEarned(event_payload);
  applyGirthEarning(profile_id, earned); // updates girth_balances
}
```

* **Exchange Rate Constant** – `0.000075` $GIRTH per tap/slap (declared as `GIRTH_EXCHANGE_RATE`).
* Anonymous sessions **do not** touch `girth_balances`; the delta will be merged later during the *session-claim* flow.

---

## 5. Oracle ➜ Game Balance Push

After a successful edge-function call, Oracle dispatches **one** of the following messages back to the iframe:

```ts
interface BalanceUpdateMsg {
  type: 'soft_balance_update';
  payload: {
    soft_balance: number;   // current server-side soft balance
    delta: number;          // what was just added (for VFX)
  };
}
```

*The Oracle component reads `soft_balance` from the JSON response (or via Realtime change feed) and merges it with the React state that powers the in-game HUD overlay.*

---

## 6. Game-Side Responsibilities

1. **Batch intelligently** – favour 10–20 s bursts; avoid spamming tiny payloads.
2. **Never send wallet operations** – just include `player_address` when known.
3. **Prepare for `soft_balance_update` messages** so the HUD can animate gains in real-time.
4. **Persist anonymous progress locally** – the backend will only track it once a wallet is linked.

---

## 7. Security & Abuse Counter-Measures

* Edge function recalculates earnings server-side; client-supplied numbers can't inflate balance.
* All balance writes require a valid `user_profile_id` → row-level-security guards the `girth_balances` table.
* Cool-down & CAPTCHA are enforced **during minting** (`process-girth-mint`) – *not* during soft accrual.

---

## 8. Future Endpoints

| Endpoint | Purpose | Status |
|----------|---------|--------|
| `process-girth-mint` | convert `soft_balance` → SPL tokens | ⏳ drafting |
| `quest-reward` | daily quests, polls, RNG events → soft balance increments | ❇️ planned |
| `merge-session-to-wallet` | claim anonymous session data | ✅ spec'd |

---

## 9. Implementation Checklist (Backend)

- [x] `girth_balances` table + RLS
- [x] **ingest-chode-event** updated with `GIRTH_EXCHANGE_RATE` logic
- [ ] Realtime channel trigger to broadcast balance changes
- [ ] Dedicated helper edge function `quest-reward`
- [ ] Minting pipeline (`process-girth-mint`)

---

### 👾 That's everything a game-side developer needs to wire the soft-balance sync. Ship it! 🚀 