import { supabase } from './supabase';
import { useDebugStore } from './store';

export interface GameEvent {
  event_type: string;
  session_id: string;
  event_payload?: Record<string, unknown>;
  timestamp_utc?: string;
}

/**
 * Forwards a game event to the Supabase Edge Function
 */
async function forwardEventToSupabase(gameEventData: GameEvent): Promise<void> {
  const addEventLog = useDebugStore.getState().addEventLog;

  try {
    // Add UTC timestamp if not provided
    const eventWithTimestamp = {
      ...gameEventData,
      timestamp_utc: gameEventData.timestamp_utc || new Date().toISOString()
    };

    console.log('Oracle Page: Forwarding to Supabase ingest-chode-event:', {
      url: 'https://errgidlsmozmfnsoyxvw.supabase.co/functions/v1/ingest-chode-event',
      payload: eventWithTimestamp
    });

    const { data, error } = await supabase.functions.invoke('ingest-chode-event', {
      body: eventWithTimestamp
    });

    if (error) {
      console.error('Oracle Page: Error forwarding event to Supabase:', error.message);
      addEventLog({
        type: 'error',
        eventType: gameEventData.event_type,
        message: `Failed to forward event: ${error.message}`
      });
      return;
    }

    console.info('Oracle Page: Event successfully forwarded to Supabase. Response:', data);
    addEventLog({
      type: 'forward',
      eventType: gameEventData.event_type,
      message: `Successfully forwarded ${gameEventData.event_type} event`
    });
  } catch (error) {
    console.error('Oracle Page: Failed to forward event:', error);
    addEventLog({
      type: 'error',
      eventType: gameEventData.event_type,
      message: `Failed to forward event: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

/**
 * Validates the structure of a game event
 */
function isValidGameEvent(data: unknown): data is GameEvent {
  if (!data || typeof data !== 'object') return false;

  const event = data as Partial<GameEvent>;
  
  return (
    typeof event.event_type === 'string' &&
    typeof event.session_id === 'string' &&
    (event.event_payload === undefined || typeof event.event_payload === 'object') &&
    (event.timestamp_utc === undefined || typeof event.timestamp_utc === 'string')
  );
}

/**
 * Handles incoming game events from the iframe
 */
export function receiveGameEvent(event: MessageEvent): void {
  const addEventLog = useDebugStore.getState().addEventLog;

  console.log('Oracle Page: Raw message received from iframe:', event.data, 'from origin:', event.origin);

  // Whitelist of allowed origins
  const ALLOWED_ORIGINS = [
    'http://localhost:5173',  // Local development
    'http://localhost:3000',  // Alternative local port
    'https://chode-tapper-demo.netlify.app'  // Production URL
  ];

  // Verify origin
  if (!ALLOWED_ORIGINS.includes(event.origin)) {
    console.warn('Oracle Page: Received message from unauthorized origin:', event.origin);
    addEventLog({
      type: 'error',
      eventType: 'unknown',
      message: `Unauthorized origin: ${event.origin}`
    });
    return;
  }

  // Parse and validate event data
  let parsedData: unknown;
  try {
    parsedData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    console.log('Oracle Page: Parsed game event:', parsedData);
  } catch (error) {
    console.error('Oracle Page: Failed to parse game event JSON:', error, 'Raw data:', event.data);
    addEventLog({
      type: 'error',
      eventType: 'unknown',
      message: 'Failed to parse event data'
    });
    return;
  }

  // Validate event structure
  if (!isValidGameEvent(parsedData)) {
    console.warn('Oracle Page: Received malformed game event structure:', parsedData);
    addEventLog({
      type: 'error',
      eventType: 'unknown',
      message: 'Invalid event structure'
    });
    return;
  }

  console.log('Oracle Page: Valid game event received:', parsedData);
  addEventLog({
    type: 'receive',
    eventType: parsedData.event_type,
    message: `Received ${parsedData.event_type} event`
  });

  // Forward valid event to Supabase
  forwardEventToSupabase(parsedData);
}

/**
 * Sets up the game event listener
 */
export function setupGameEventListener(): () => void {
  console.log('Oracle Page: Setting up game event listener');
  const handler = (event: MessageEvent) => receiveGameEvent(event);
  window.addEventListener('message', handler, false);
  
  // Return cleanup function
  return () => window.removeEventListener('message', handler, false);
}