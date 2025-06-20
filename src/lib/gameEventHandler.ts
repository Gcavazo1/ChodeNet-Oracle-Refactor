import { supabase } from './supabase';

export interface GameEvent {
  event_type: string;
  session_id: string;
  event_payload?: Record<string, unknown>;
  timestamp_utc?: string;
}

// Define a more specific type for game event data
interface GameEventData {
  event_type?: string;
  type?: string;
  session_id?: string;
  timestamp_utc?: string;
  event_payload?: {
    action?: string;
    player_address?: string;
    player_state?: {
      current_girth?: number;
      total_mega_slaps?: number;
      total_giga_slaps?: number;
      current_giga_slap_streak?: number;
      iron_grip_lvl1_purchased?: boolean;
      soft_girth_balance?: number;
      lifetime_girth_earned?: number;
      session_id?: string;
    };
    session_id?: string;
  };
}

// 🔧 Store reference to game iframe for sending responses
let gameIframe: HTMLIFrameElement | null = null;

// 🔧 Store current session ID for filtering responses
let currentSessionId: string | null = null;

// 🔧 Store subscription for cleanup
let responseSubscription: ReturnType<typeof supabase.channel> | null = null;

// 🔧 Set game iframe reference and start response listening
export function setGameIframe(iframe: HTMLIFrameElement): void {
  gameIframe = iframe;
  console.log('🎮 [IFRAME] Game iframe reference set for state responses');
  startResponseListener();
}

// 🔧 Send message back to game
function sendMessageToGame(message: Record<string, unknown>): void {
  if (!gameIframe || !gameIframe.contentWindow) {
    console.warn('⚠️ [IFRAME] Cannot send message to game - iframe not available');
    return;
  }

  try {
    console.log('📤 [GAME] Sending response to game:', message);
    gameIframe.contentWindow.postMessage(JSON.stringify(message), '*');
  } catch (error) {
    console.error('❌ [GAME] Failed to send message to game:', error);
  }
}

// 🔧 NEW: Start listening for backend response events
function startResponseListener(): void {
  if (responseSubscription) {
    console.log('🔄 [SUBSCRIPTION] Response listener already active');
    return;
  }

  console.log('🎧 [SUBSCRIPTION] Starting backend response listener...');
  
  responseSubscription = supabase
    .channel('game-responses')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'live_game_events',
        filter: 'event_type=in.(player_state_load_response,player_state_save_response)'
      },
      (payload) => {
        console.log('📥 [SUBSCRIPTION] Backend response received:', payload);
        handleBackendResponse(payload.new);
      }
    )
    .subscribe((status) => {
      console.log('🎧 [SUBSCRIPTION] Response listener status:', status);
    });
}

// 🔧 NEW: Handle backend response events
function handleBackendResponse(eventData: GameEventData): void {
  console.log('🔄 [RESPONSE] Processing backend response:', {
    event_type: eventData.event_type,
    session_id: eventData.session_id,
    has_payload: !!eventData.event_payload
  });

  // Filter responses for current session if we have one
  if (currentSessionId && eventData.session_id !== currentSessionId) {
    console.log('🚫 [RESPONSE] Ignoring response for different session:', {
      current: currentSessionId,
      received: eventData.session_id
    });
    return;
  }

  // Send response to game
  const responseMessage = {
    type: eventData.event_type,
    payload: eventData.event_payload || {},
    timestamp: eventData.timestamp_utc || new Date().toISOString(),
    session_id: eventData.session_id
  };

  console.log('📤 [RESPONSE] Forwarding response to game:', responseMessage.type);
  sendMessageToGame(responseMessage);
}

// 🔧 Export function to set current session for filtering
export function setCurrentSessionId(sessionId: string): void {
  currentSessionId = sessionId;
  console.log('🔧 [SESSION] Current session ID set:', sessionId);
}

// 🔧 Export function to cleanup subscription
export function stopResponseListener(): void {
  if (responseSubscription) {
    console.log('🛑 [SUBSCRIPTION] Stopping response listener');
    responseSubscription.unsubscribe();
    responseSubscription = null;
  }
}

async function forwardEventToSupabase(gameEventData: GameEventData): Promise<void> {
  // Extract event type and session ID from either format
  const eventType = gameEventData.event_type || gameEventData.type;
  const sessionId = gameEventData.session_id || gameEventData.event_payload?.session_id;
  
  console.log('📤 [SUPABASE] Starting event forward to Supabase:', {
    event_type: eventType,
    session_id: sessionId,
    has_payload: !!gameEventData.event_payload,
    payload_keys: gameEventData.event_payload ? Object.keys(gameEventData.event_payload) : [],
    timestamp: gameEventData.timestamp_utc
  });

  try {
    // Handle state save/load requests with unified player-state-manager function
    if (eventType === 'player_state_save') {
      console.log('💾 [STATE] Handling player state save request via player-state-manager');
      
      const { data, error } = await supabase.functions.invoke('player-state-manager', {
        body: {
          session_id: sessionId,
          player_address: gameEventData.event_payload?.player_address || null,
          action: 'save',
          player_state: gameEventData.event_payload?.player_state
        }
      });

      if (error) {
        console.error('❌ [STATE] Error saving player state:', error);
        throw error;
      }

      console.log('✅ [STATE] Player state saved successfully:', data);
      
      // 💰 BALANCE REFRESH: If soft balance was updated, trigger Oracle UI refresh
      if (data.soft_balance_updated) {
        console.log('💰 [STATE] Soft balance was updated - triggering Oracle UI refresh');
        
        // Extract wallet address from the game event
        const walletAddress = gameEventData.event_payload?.player_address;
        
        if (walletAddress) {
          // Add small delay to ensure database is updated
          setTimeout(async () => {
            try {
              console.log('💰 [STATE] Refreshing balance for wallet:', walletAddress);
              
              // Use our new edge function instead of direct database queries
              const softBalance = gameEventData.event_payload?.player_state?.soft_girth_balance || 0;
              const lifetimeEarned = gameEventData.event_payload?.player_state?.lifetime_girth_earned || 0;
              
              console.log('🔄 [STATE] Updating balance via edge function:', {
                wallet: walletAddress,
                softBalance,
                lifetimeEarned
              });
              
              const { data: balanceData, error: balanceError } = await supabase.functions.invoke('update-balance', {
                body: {
                  wallet_address: walletAddress,
                  soft_balance: softBalance,
                  lifetime_earned: lifetimeEarned
                }
              });
              
              if (balanceError) {
                console.error('❌ [STATE] Failed to update balance:', balanceError);
                // Fall back to local state
                const localFallbackBalance = {
                  soft_balance: softBalance,
                  hard_balance: 0,
                  lifetime_earned: lifetimeEarned,
                  lifetime_minted: 0,
                  last_mint_at: null
                };
                
                console.log('⚠️ [STATE] Using local fallback after edge function error:', localFallbackBalance);
                
                window.dispatchEvent(new CustomEvent('balanceUpdated', {
                  detail: localFallbackBalance
                }));
                
                window.dispatchEvent(new CustomEvent('gameStateUpdated', {
                  detail: {
                    ...gameEventData.event_payload?.player_state,
                    wallet_address: walletAddress
                  }
                }));
                return;
              }
              
              console.log('✅ [STATE] Balance updated successfully:', balanceData);
              
              // Use the returned balance data
              const refreshedBalance = balanceData.balance;
              
              // Dispatch custom event to notify UI components
              const balanceEvent = new CustomEvent('balanceUpdated', {
                detail: refreshedBalance
              });
              window.dispatchEvent(balanceEvent);
              
              // Dispatch game state update event
              const gameStateEvent = new CustomEvent('gameStateUpdated', {
                detail: {
                  ...gameEventData.event_payload?.player_state,
                  wallet_address: walletAddress
                }
              });
              window.dispatchEvent(gameStateEvent);
              
            } catch (refreshError) {
              console.error('❌ [STATE] Failed to refresh Oracle balance:', refreshError);
              
              // Improved fallback: Always try to use the local state data first
              const localPlayerState = gameEventData?.event_payload?.player_state;
              if (localPlayerState && typeof localPlayerState.soft_girth_balance === 'number') {
                const localFallbackBalance = {
                  soft_balance: localPlayerState.soft_girth_balance,
                  hard_balance: 0, // unknown locally – keep zero
                  lifetime_earned: localPlayerState.lifetime_girth_earned ?? 0,
                  lifetime_minted: 0,
                  last_mint_at: null
                };

                console.warn('⚠️ [STATE] Using local fallback balance update:', localFallbackBalance);

                window.dispatchEvent(new CustomEvent('balanceUpdated', {
                  detail: localFallbackBalance
                }));

                window.dispatchEvent(new CustomEvent('gameStateUpdated', {
                  detail: { type: 'balance_sync_fallback', balance: localFallbackBalance }
                }));
              } else {
                // If all else fails, try SIWSManager as last resort
                try {
                  const { SIWSManager } = await import('../services/siws');
                  const siws = SIWSManager.getInstance();
                  const fallbackBalance = await siws.refreshBalance();
                  
                  if (fallbackBalance) {
                    console.log('💰 [STATE] Fallback balance refresh successful:', fallbackBalance);
                    window.dispatchEvent(new CustomEvent('balanceUpdated', {
                      detail: fallbackBalance
                    }));
                  }
                } catch (fallbackError) {
                  console.error('❌ [STATE] All balance refresh methods failed:', fallbackError);
                }
              }
            }
          }, 500); // 500ms delay to ensure database consistency
        } else {
          console.warn('⚠️ [STATE] No wallet address found in game event - cannot refresh balance');
        }
      }
      
      // Send confirmation back to game (matching expected format)
      const saveConfirmation = {
        type: 'player_state_save_response',
        event_payload: {
          success: data.success,
          message: data.message,
          player_identifier: data.player_identifier,
          is_anonymous: data.is_anonymous,
          saved_at: data.saved_at,
          soft_balance_updated: data.soft_balance_updated
        },
        timestamp: new Date().toISOString(),
        session_id: sessionId
      };
      sendMessageToGame(saveConfirmation);

    } else if (eventType === 'player_state_load_request') {
      console.log('📥 [STATE] Handling player state load request via player-state-manager');
      
      const { data, error } = await supabase.functions.invoke('player-state-manager', {
        body: {
          session_id: sessionId,
          player_address: gameEventData.event_payload?.player_address || null,
          action: 'load'
        }
      });

      if (error) {
        console.error('❌ [STATE] Error loading player state:', error);
        throw error;
      }

      console.log('✅ [STATE] Player state loaded successfully:', data);
      
      // Send state data back to game (matching Godot's expected format)
      const stateResponse = {
        type: 'player_state_load_response',
        event_payload: {
          success: data.state_found || false,
          message: data.message,
          state_found: data.state_found || false,
          player_state: data.player_state || {},
          is_new_player: !data.state_found,
          last_updated: data.last_updated,
          player_identifier: data.player_identifier,
          is_anonymous: data.is_anonymous
        },
        timestamp: new Date().toISOString(),
        session_id: sessionId
      };
      sendMessageToGame(stateResponse);

    } else if (eventType === 'player_state_migration') {
      const { session_id, player_address } = gameEventData.event_payload ?? {}
      if (session_id && player_address) {
        // Fire-and-forget – the game will receive a state_load_response later
        supabase.functions.invoke('migrate-player-state', {
          body: {
            anonymous_session_id: session_id,
            wallet_address: player_address,
          },
        }).then(({ error }) => {
          if (error) console.error('Migration error:', error)
        })
      }
    } else {
      // Handle all other events normally
      const { data, error } = await supabase.functions.invoke('ingest-chode-event', {
        body: {
          session_id: sessionId,
          event_type: eventType,
          event_payload: gameEventData.event_payload,
          timestamp_utc: gameEventData.timestamp_utc,
          game_event_timestamp: gameEventData.timestamp_utc,
          player_address: gameEventData.event_payload?.player_address || ""
        }
      });

      console.log('📤 [SUPABASE] Invoking Supabase edge function:', {
        function_name: 'ingest-chode-event',
        event_type: eventType,
        session_id: sessionId,
        timestamp: gameEventData.timestamp_utc,
        payload_size: JSON.stringify(gameEventData.event_payload || {}).length
      });

      if (error) {
        console.error('❌ [SUPABASE] Error forwarding event:', error);
        throw error;
      }

      console.log('✅ [SUPABASE] Event successfully forwarded to Supabase:', {
        event_type: eventType,
        session_id: sessionId,
        response_data: data,
        timestamp: gameEventData.timestamp_utc
      });
    }

  } catch (error) {
    console.error('❌ [SUPABASE] Failed to forward event to Supabase:', {
      event_type: eventType,
      error: error instanceof Error ? error.message : String(error),
      timestamp: gameEventData.timestamp_utc
    });
    
    throw error;
  }
}

function isValidGameEvent(data: unknown): data is GameEvent {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const event = data as Record<string, unknown>;
  
  // Handle both 'event_type' (regular events) and 'type' (state events) formats
  const hasEventType = typeof event.event_type === 'string';
  const hasType = typeof event.type === 'string';
  const hasSessionId = typeof event.session_id === 'string';
  const hasValidPayload = event.event_payload === undefined || typeof event.event_payload === 'object';
  
  // For state events, we need to extract session_id from event_payload
  if (hasType && !hasSessionId && event.event_payload && typeof event.event_payload === 'object') {
    const payload = event.event_payload as Record<string, unknown>;
    return typeof payload.session_id === 'string' && hasValidPayload;
  }
  
  return (hasEventType || hasType) && hasSessionId && hasValidPayload;
}

export function receiveGameEvent(event: MessageEvent): void {
  try {
    console.log('📥 [HANDLER] Raw message received from iframe:', {
      data: typeof event.data === 'string' ? event.data.substring(0, 100) + '...' : event.data,
      origin: event.origin,
      source: event.source ? 'Window' : 'null',
      timestamp: new Date().toISOString()
    });

    // Handle different message formats
    let gameEventData: GameEventData;
    
    if (typeof event.data === 'string') {
      try {
        gameEventData = JSON.parse(event.data);
      } catch {
        console.warn('⚠️ [HANDLER] Failed to parse message as JSON:', event.data);
        return;
      }
    } else if (typeof event.data === 'object') {
      gameEventData = event.data;
    } else {
      console.warn('⚠️ [HANDLER] Received unknown message format:', typeof event.data);
      return;
    }

    // Validate origin (allow localhost for development)
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://your-production-domain.com' // Update for production
    ];
    
    if (!allowedOrigins.includes(event.origin)) {
      console.warn('⚠️ [HANDLER] Message from unauthorized origin:', event.origin);
      return;
    }

    console.log('✅ [HANDLER] Origin validated - processing message...');

    // Extract event type and session ID for logging
    const eventType = gameEventData?.event_type || gameEventData?.type;
    const sessionId = gameEventData?.session_id || gameEventData?.event_payload?.session_id;
    
    console.log('🔄 [HANDLER] Successfully parsed game event:', {
      data_type: typeof gameEventData,
      is_object: typeof gameEventData === 'object',
      keys: typeof gameEventData === 'object' ? Object.keys(gameEventData) : [],
      event_type: eventType,
      session_id: sessionId
    });

    // Validate game event structure
    if (!isValidGameEvent(gameEventData)) {
      console.warn('⚠️ [HANDLER] Invalid game event structure:', gameEventData);
      return;
    }

    console.log('✅ [HANDLER] Valid game event received - forwarding:', {
      event_type: eventType,
      session_id: sessionId,
      has_payload: !!gameEventData.event_payload,
      timestamp: gameEventData.timestamp_utc
    });

    // 🔧 Set current session ID for response filtering
    if (sessionId) {
      setCurrentSessionId(sessionId);
    }

    // Check for state-related events that need special handling
    if (eventType === 'player_state_load_request' || eventType === 'player_state_save') {
      console.log('🔧 [STATE] Processing state request:', eventType);
    }

    // Forward to backend
    forwardEventToSupabase(gameEventData);

  } catch (error) {
    console.error('❌ [HANDLER] Error processing game event:', error);
  }
}

export function setupGameEventListener(): () => void {
  console.log('🎧 [HANDLER] Setting up game event listener...');
  
  const handler = (event: MessageEvent) => {
    receiveGameEvent(event);
  };

  window.addEventListener('message', handler);
  console.log('✅ [HANDLER] Game event listener established');

  // Return cleanup function
  return () => {
    console.log('🛑 [HANDLER] Removing game event listener');
    window.removeEventListener('message', handler);
    stopResponseListener();
  };
}