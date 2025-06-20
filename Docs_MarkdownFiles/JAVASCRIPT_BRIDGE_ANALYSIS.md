# 🔍 COMPREHENSIVE JAVASCRIPT BRIDGE ANALYSIS
## 10-Day Debugging Deep Dive - Final Solution & Lessons Learned

---

## 🎉 FINAL WORKING SOLUTION (2025)

After 10+ days of deep debugging, architectural refactoring, and systematic testing, we have achieved **full, robust, bidirectional communication** between the Oracle parent (React) and the Godot HTML5 game, both in docked (iframe) and undocked (popout window) modes.

### 🚀 **Key Fixes & Architectural Changes**

#### 1. **Callback Assignment - The Only Working Pattern**
- Use `JavaScriptBridge.create_callback(Callable(self, "_on_message_received"))` in Godot
- Assign it **directly** to `window.godotCallback` using the window interface
- **Keep a reference** to the callback in GDScript to prevent garbage collection

**Godot (OracleBridge.gd):**
```gdscript
# In OracleBridge.gd singleton
var _message_callback = null

func _setup_javascript_bridge():
    print("OracleBridge: 🔧 Setting up JavaScriptBridge callback...")
    _message_callback = JavaScriptBridge.create_callback(Callable(self, "_on_message_received"))
    var window = JavaScriptBridge.get_interface("window")
    if not window:
        push_error("OracleBridge: ❌ Failed to get window interface")
        return
    window.godotCallback = _message_callback
    var verify_result = JavaScriptBridge.eval("typeof window.godotCallback")
    print("OracleBridge: 🔍 Callback type verification: ", verify_result)
    JavaScriptBridge.eval("console.log('[OracleBridge] ✅ Callback assigned - Type:', typeof window.godotCallback);")
    print("OracleBridge: ✅ JavaScriptBridge callback setup complete using proven pattern")
```

#### 2. **Singleton Refactor for Clean Separation**
- **All JavaScriptBridge logic was moved out of Global.gd** (which had grown to 1300+ lines)
- Created a new `OracleBridge.gd` singleton dedicated to all JS bridge, message parsing, and Oracle communication
- Result: Clean, modular, testable architecture

#### 3. **Robust Undocked Window Communication**
- The React Oracle parent now injects a full communication bridge into the undocked window
- Wallet status and Oracle messages are forwarded from parent → undocked window → game iframe
- Game events are forwarded back from undocked window → parent
- Both docked and undocked modes now have **identical, real-time communication**

**Undocked Window Bridge (injected by React):**
```js
// In undocked window HTML
window.addEventListener('message', function(event) {
  if (event.source !== window.opener) return;
  // Parse and forward wallet/oracle messages to game iframe
  // ...
});
function sendWalletStatusToGame() {
  // ...
  gameIframe.contentWindow.postMessage(JSON.stringify(walletMessage), '*');
}
```

#### 4. **Web Shell Message Forwarding**
- The custom web shell (`custom_web_shell.html`) now has a single, clean message listener
- Forwards all parent messages to Godot via `window.godotCallback`

**Web Shell:**
```js
window.addEventListener('message', function(event) {
  // ...
  if (typeof window.godotCallback === 'function') {
    window.godotCallback(event.data);
  }
});
```

---

## 🏆 **RESULT: FULLY FUNCTIONAL ORACLE ↔ GODOT COMMUNICATION**
- **Wallet status**: Connect/disconnect events reach the game in both docked and undocked modes
- **Oracle events**: All Oracle messages, state persistence, and game events flow bidirectionally
- **No more callback timing or garbage collection issues**
- **No more message loss or infinite loops**
- **Clean, maintainable, and extensible architecture**

---

## 📝 **Lessons Learned**

1. **Follow Official Patterns**: The only reliable way to expose a callback to browser JS is via `JavaScriptBridge.create_callback` and direct assignment to `window.godotCallback`.
2. **Keep Callback References**: Always keep a reference to the callback in GDScript to prevent garbage collection.
3. **Separation of Concerns**: Splitting bridge logic into its own singleton (OracleBridge.gd) makes debugging and maintenance vastly easier.
4. **Bidirectional Communication Requires Both Sides**: The parent page must actively forward wallet and Oracle messages to undocked windows, not just iframes.
5. **Minimalism Wins**: Remove all redundant message listeners and dead code. One clear path for messages is best.
6. **Test Both Docked and Undocked**: Always verify both iframe and popout window modes for full feature parity.
7. **Iterative Debugging**: Systematic, minimal test cases and step-by-step restoration of features is the fastest way to a robust solution.

---

## ✅ **RECOMMENDED PATTERN (2025+)**

- Use a dedicated singleton for all JS bridge logic
- Assign callback with `window.godotCallback = ...` via the window interface
- Keep callback reference in GDScript
- Forward wallet and Oracle messages to both docked and undocked game windows
- Use a single, minimal message listener in the web shell

---

## 🏁 **This document now reflects the final, working solution for Oracle ↔ Godot communication.** 