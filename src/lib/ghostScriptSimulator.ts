import { supabase } from './supabase';
import { useDebugStore } from './store';

interface SimulatedEvent {
  event_type: string;
  session_id: string;
  event_payload?: Record<string, unknown>;
  game_event_timestamp?: string;
  player_address?: string;
}

const EVENT_TYPES = {
  TAP: 'tap_activity_burst',
  MEGA_SLAP: 'mega_slap_landed',
  EVOLUTION: 'chode_evolution',
  ACHIEVEMENT: 'achievement_unlocked',
  UPGRADE: 'upgrade_purchased'
};

const PLAYER_ADDRESSES = [
  'ChodeMaster69420',
  'GirthLord42069',
  'TapperSupreme8008',
  'OracleAcolyte1337',
  'GirthyWarrior9001'
];

const generateRandomEvent = (): SimulatedEvent => {
  const eventRoll = Math.random();
  let eventType: string;

  if (eventRoll < 0.6) eventType = EVENT_TYPES.TAP;
  else if (eventRoll < 0.8) eventType = EVENT_TYPES.MEGA_SLAP;
  else if (eventRoll < 0.9) eventType = EVENT_TYPES.ACHIEVEMENT;
  else if (eventRoll < 0.95) eventType = EVENT_TYPES.UPGRADE;
  else eventType = EVENT_TYPES.EVOLUTION;

  const playerAddress = PLAYER_ADDRESSES[Math.floor(Math.random() * PLAYER_ADDRESSES.length)];

  const event: SimulatedEvent = {
    event_type: eventType,
    session_id: `ghost_${Math.random().toString(36).substring(7)}`,
    game_event_timestamp: new Date().toISOString(),
    player_address: playerAddress,
    event_payload: {}
  };

  switch (eventType) {
    case EVENT_TYPES.TAP:
      event.event_payload = {
        tap_count: Math.floor(Math.random() * 50) + 1,
        tap_velocity: Math.random() * 10,
        combo_multiplier: Math.floor(Math.random() * 5) + 1
      };
      break;
    case EVENT_TYPES.MEGA_SLAP:
      event.event_payload = {
        slap_power: Math.floor(Math.random() * 1000) + 500,
        critical_hit: Math.random() > 0.7
      };
      break;
    case EVENT_TYPES.EVOLUTION:
      event.event_payload = {
        evolution_tier: Math.floor(Math.random() * 3) + 1,
        new_abilities: ['enhanced_girth', 'slap_mastery', 'oracle_blessing']
      };
      break;
    case EVENT_TYPES.ACHIEVEMENT:
      event.event_payload = {
        achievement_id: `ACH_${Math.random().toString(36).substring(7)}`,
        achievement_name: 'Legendary Tapper',
        rarity: 'EPIC'
      };
      break;
    case EVENT_TYPES.UPGRADE:
      event.event_payload = {
        upgrade_id: `UPG_${Math.random().toString(36).substring(7)}`,
        upgrade_name: 'Iron Grip',
        upgrade_level: Math.floor(Math.random() * 5) + 1
      };
      break;
  }

  return event;
};

const forwardEventToSupabase = async (event: SimulatedEvent): Promise<void> => {
  const addEventLog = useDebugStore.getState().addEventLog;

  try {
    console.log('[GhostScript] Forwarding event to Supabase:', event);
    
    const { error } = await supabase.functions.invoke('ingest-chode-event', {
      body: event
    });

    if (error) throw error;

    addEventLog({
      type: 'forward',
      eventType: event.event_type,
      message: `Ghost Legion: ${event.event_type} from ${event.player_address}`
    });
  } catch (error) {
    console.error('[GhostScript] Failed to forward event:', error);
    addEventLog({
      type: 'error',
      eventType: event.event_type,
      message: `Ghost Legion Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
};

const triggerSpecialReport = async (simulationId: string): Promise<void> => {
  try {
    console.log('[GhostScript] Triggering special report generation...');
    
    const { error } = await supabase.functions.invoke('trigger-special-report-generation', {
      body: { simulation_id: simulationId, status: 'completed' }
    });

    if (error) throw error;

    console.log('[GhostScript] Special report generation triggered successfully');
  } catch (error) {
    console.error('[GhostScript] Failed to trigger special report:', error);
  }
};

export const runGhostLegionSimulation = async (
  durationSeconds: number = 30,
  onProgress?: (secondsRemaining: number) => void,
  onComplete?: () => void
): Promise<void> => {
  const simulationId = `sim_${Date.now()}`;
  console.log('[GhostScript] Starting Ghost Legion simulation:', simulationId);

  const startTime = Date.now();
  const endTime = startTime + (durationSeconds * 1000);

  const simulate = async () => {
    while (Date.now() < endTime) {
      const event = generateRandomEvent();
      await forwardEventToSupabase(event);

      const secondsRemaining = Math.ceil((endTime - Date.now()) / 1000);
      onProgress?.(secondsRemaining);

      // Random delay between events (100ms to 1000ms)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 900 + 100));
    }

    console.log('[GhostScript] Simulation complete, triggering special report...');
    await triggerSpecialReport(simulationId);
    onComplete?.();
  };

  await simulate();
};