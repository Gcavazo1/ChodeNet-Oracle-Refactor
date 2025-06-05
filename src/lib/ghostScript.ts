import { supabase } from './supabase';
import { useDebugStore } from './store';

interface SimulatedEvent {
  event_type: string;
  session_id: string;
  event_payload?: Record<string, unknown>;
  game_event_timestamp?: string;
}

interface GhostLegionConfig {
  durationSeconds: number;
  playerCount: number;
  eventIntensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  autoTriggerSpecialReport: boolean;
}

const EVENT_TYPES = {
  TAP: 'tap_activity_burst',
  MEGA_SLAP: 'mega_slap_landed',
  EVOLUTION: 'chode_evolution',
  ACHIEVEMENT: 'achievement_unlocked',
  UPGRADE: 'upgrade_purchased'
} as const;

const ACHIEVEMENT_TYPES = [
  'FIRST_BLOOD',
  'MEGA_SLAPPER',
  'GIRTH_MASTER',
  'EVOLUTION_COMPLETE',
  'ORACLE_FAVORITE'
] as const;

const UPGRADE_TYPES = [
  'IRON_GRIP_1',
  'DOUBLE_HANDED_TECHNIQUE',
  'GIRTH_AMPLIFIER',
  'SLAP_RESONANCE',
  'QUANTUM_TAPPING'
] as const;

// Intensity configurations with rate limiting
const INTENSITY_CONFIGS = {
  LOW: { 
    eventsPerSecond: 0.5, 
    tickIntervalMs: 2000,
    maxEventsPerTick: 1,
    description: 'Gentle tapping simulation'
  },
  MEDIUM: { 
    eventsPerSecond: 1.0, 
    tickIntervalMs: 1000,
    maxEventsPerTick: 1,
    description: 'Standard activity simulation'
  },
  HIGH: { 
    eventsPerSecond: 2.0, 
    tickIntervalMs: 500,
    maxEventsPerTick: 1,
    description: 'Intense gameplay simulation'
  },
  EXTREME: { 
    eventsPerSecond: 3.0, 
    tickIntervalMs: 334,
    maxEventsPerTick: 2,
    description: 'Chaos mode simulation'
  }
};

// Rate limiting constants
const MAX_EVENTS_PER_MINUTE = 180; // Prevent overwhelming the system
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute window

export class GhostScript {
  private sessionId: string;
  private isRunning: boolean;
  private simulationTimer: number | null;
  private remainingTime: number;
  private addEventLog: ReturnType<typeof useDebugStore>['addEventLog'];
  private config: GhostLegionConfig;
  private eventsSentInWindow: number = 0;
  private rateLimitWindowStart: number = 0;

  constructor() {
    this.sessionId = crypto.randomUUID();
    this.isRunning = false;
    this.simulationTimer = null;
    this.remainingTime = 0;
    this.addEventLog = useDebugStore.getState().addEventLog;
    this.config = {
      durationSeconds: 30,
      playerCount: 5,
      eventIntensity: 'MEDIUM',
      autoTriggerSpecialReport: true
    };
  }

  private async forwardEventToSupabase(eventData: SimulatedEvent): Promise<void> {
    // Rate limiting check
    const now = Date.now();
    if (now - this.rateLimitWindowStart > RATE_LIMIT_WINDOW_MS) {
      // Reset rate limit window
      this.rateLimitWindowStart = now;
      this.eventsSentInWindow = 0;
    }

    if (this.eventsSentInWindow >= MAX_EVENTS_PER_MINUTE) {
      console.warn('GhostScript: Rate limit reached, skipping event');
      this.addEventLog({
        type: 'error',
        eventType: eventData.event_type,
        message: 'Rate limit reached - event skipped to prevent system overload'
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('ingest-chode-event', {
        body: eventData
      });

      if (error) throw error;

      this.eventsSentInWindow++;
      this.addEventLog({
        type: 'forward',
        eventType: eventData.event_type,
        message: `Simulated ${eventData.event_type} forwarded successfully (${this.eventsSentInWindow}/${MAX_EVENTS_PER_MINUTE})`
      });
    } catch (error) {
      console.error('GhostScript: Failed to forward event:', error);
      this.addEventLog({
        type: 'error',
        eventType: eventData.event_type,
        message: `Failed to forward simulated event: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  private generateRandomEvent(): SimulatedEvent {
    const now = new Date().toISOString();
    const eventType = Math.random();

    // Generate a session ID from the pool of simulated players
    const playerIndex = Math.floor(Math.random() * this.config.playerCount);
    const simulatedSessionId = `${this.sessionId}_player_${playerIndex}`;

    if (eventType < 0.6) { // 60% chance for basic tap
      return {
        event_type: EVENT_TYPES.TAP,
        session_id: simulatedSessionId,
        event_payload: {
          tap_count: Math.floor(Math.random() * 50) + 10, // 10-60 taps per burst
          tap_velocity: Math.random() * 100,
          intensity_modifier: this.config.eventIntensity
        },
        game_event_timestamp: now
      };
    } else if (eventType < 0.8) { // 20% chance for mega slap
      return {
        event_type: EVENT_TYPES.MEGA_SLAP,
        session_id: simulatedSessionId,
        event_payload: {
          power_level: Math.floor(Math.random() * 1000) + 500,
          combo_multiplier: Math.floor(Math.random() * 5) + 1,
          slap_power_girth: Math.floor(Math.random() * 500) + 200
        },
        game_event_timestamp: now
      };
    } else if (eventType < 0.9) { // 10% chance for achievement
      return {
        event_type: EVENT_TYPES.ACHIEVEMENT,
        session_id: simulatedSessionId,
        event_payload: {
          achievement_type: ACHIEVEMENT_TYPES[Math.floor(Math.random() * ACHIEVEMENT_TYPES.length)],
          achievement_id: `simulated_${ACHIEVEMENT_TYPES[Math.floor(Math.random() * ACHIEVEMENT_TYPES.length)]}`,
          timestamp: now
        },
        game_event_timestamp: now
      };
    } else if (eventType < 0.95) { // 5% chance for upgrade
      return {
        event_type: EVENT_TYPES.UPGRADE,
        session_id: simulatedSessionId,
        event_payload: {
          upgrade_type: UPGRADE_TYPES[Math.floor(Math.random() * UPGRADE_TYPES.length)],
          upgrade_id: `simulated_${UPGRADE_TYPES[Math.floor(Math.random() * UPGRADE_TYPES.length)]}`,
          cost: Math.floor(Math.random() * 1000) + 100
        },
        game_event_timestamp: now
      };
    } else { // 5% chance for evolution
      return {
        event_type: EVENT_TYPES.EVOLUTION,
        session_id: simulatedSessionId,
        event_payload: {
          evolution_level: Math.floor(Math.random() * 5) + 1,
          power_increase: Math.floor(Math.random() * 500) + 100,
          new_tier: Math.floor(Math.random() * 6) + 1,
          new_tier_name: `Simulated Tier ${Math.floor(Math.random() * 6) + 1}`
        },
        game_event_timestamp: now
      };
    }
  }

  private async simulationTick(): Promise<void> {
    if (!this.isRunning) return;

    const intensityConfig = INTENSITY_CONFIGS[this.config.eventIntensity];
    
    // Generate multiple events per tick for higher intensities
    for (let i = 0; i < intensityConfig.maxEventsPerTick; i++) {
      const event = this.generateRandomEvent();
      await this.forwardEventToSupabase(event);
    }

    this.remainingTime--;
    if (this.remainingTime <= 0) {
      await this.endSimulation();
    }
  }

  private async endSimulation(): Promise<void> {
    this.isRunning = false;
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }

    try {
      if (this.config.autoTriggerSpecialReport) {
        const { error } = await supabase.functions.invoke('generate-special-report', {
          body: {
            trigger_reason: 'Ghost Legion Simulation Cycle Ended',
            simulation_id: this.sessionId,
            intensity: this.config.eventIntensity,
            events_sent: this.eventsSentInWindow
          }
        });

        if (error) throw error;

        this.addEventLog({
          type: 'forward',
          eventType: 'simulation_complete',
          message: 'Simulation completed, Special Report generation triggered'
        });
      } else {
        this.addEventLog({
          type: 'forward',
          eventType: 'simulation_complete',
          message: 'Simulation completed (Special Report auto-trigger disabled)'
        });
      }
    } catch (error) {
      console.error('GhostScript: Failed to trigger special report:', error);
      this.addEventLog({
        type: 'error',
        eventType: 'simulation_complete',
        message: `Failed to trigger Special Report: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  public startSimulation(durationSeconds: number = 30, config?: Partial<GhostLegionConfig>): void {
    if (this.isRunning) return;

    // Update configuration
    if (config) {
      this.config = { ...this.config, ...config, durationSeconds };
    } else {
      this.config.durationSeconds = durationSeconds;
    }

    this.isRunning = true;
    this.remainingTime = durationSeconds;
    this.sessionId = crypto.randomUUID();
    this.eventsSentInWindow = 0;
    this.rateLimitWindowStart = Date.now();

    const intensityConfig = INTENSITY_CONFIGS[this.config.eventIntensity];

    console.log('GhostScript: Starting simulation session:', this.sessionId);
    console.log('GhostScript: Configuration:', {
      ...this.config,
      tickInterval: intensityConfig.tickIntervalMs,
      eventsPerTick: intensityConfig.maxEventsPerTick
    });
    
    this.addEventLog({
      type: 'forward',
      eventType: 'simulation_start',
      message: `Starting Ghost Legion simulation (${durationSeconds}s, ${this.config.eventIntensity} intensity, ${this.config.playerCount} players)`
    });

    this.simulationTimer = window.setInterval(() => this.simulationTick(), intensityConfig.tickIntervalMs);
  }

  public getRemainingTime(): number {
    return this.remainingTime;
  }

  public isSimulationRunning(): boolean {
    return this.isRunning;
  }

  public stopSimulation(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.remainingTime = 0;
    
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }

    console.log('GhostScript: Simulation stopped manually');
    this.addEventLog({
      type: 'forward',
      eventType: 'simulation_stop',
      message: 'Ghost Legion simulation stopped manually'
    });
  }

  public getCurrentConfig(): GhostLegionConfig {
    return { ...this.config };
  }

  public getRateLimitStatus(): { eventsInWindow: number; maxEvents: number; windowResetIn: number } {
    const now = Date.now();
    const windowResetIn = Math.max(0, RATE_LIMIT_WINDOW_MS - (now - this.rateLimitWindowStart));
    
    return {
      eventsInWindow: this.eventsSentInWindow,
      maxEvents: MAX_EVENTS_PER_MINUTE,
      windowResetIn: Math.ceil(windowResetIn / 1000) // Convert to seconds
    };
  }

  public getIntensityConfig(intensity: keyof typeof INTENSITY_CONFIGS) {
    return INTENSITY_CONFIGS[intensity];
  }
}