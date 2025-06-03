import { supabase } from './supabase';
import { useDebugStore } from './store';

interface SimulatedEvent {
  event_type: string;
  session_id: string;
  event_payload?: Record<string, unknown>;
  game_event_timestamp?: string;
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

export class GhostScript {
  private sessionId: string;
  private isRunning: boolean;
  private simulationTimer: number | null;
  private remainingTime: number;
  private addEventLog: ReturnType<typeof useDebugStore>['addEventLog'];

  constructor() {
    this.sessionId = crypto.randomUUID();
    this.isRunning = false;
    this.simulationTimer = null;
    this.remainingTime = 0;
    this.addEventLog = useDebugStore.getState().addEventLog;
  }

  private async forwardEventToSupabase(eventData: SimulatedEvent): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('ingest-chode-event', {
        body: eventData
      });

      if (error) throw error;

      this.addEventLog({
        type: 'forward',
        eventType: eventData.event_type,
        message: `Simulated ${eventData.event_type} forwarded successfully`
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

    if (eventType < 0.6) { // 60% chance for basic tap
      return {
        event_type: EVENT_TYPES.TAP,
        session_id: this.sessionId,
        event_payload: {
          tap_count: Math.floor(Math.random() * 10) + 1,
          tap_velocity: Math.random() * 100
        },
        game_event_timestamp: now
      };
    } else if (eventType < 0.8) { // 20% chance for mega slap
      return {
        event_type: EVENT_TYPES.MEGA_SLAP,
        session_id: this.sessionId,
        event_payload: {
          power_level: Math.floor(Math.random() * 1000) + 500,
          combo_multiplier: Math.floor(Math.random() * 5) + 1
        },
        game_event_timestamp: now
      };
    } else if (eventType < 0.9) { // 10% chance for achievement
      return {
        event_type: EVENT_TYPES.ACHIEVEMENT,
        session_id: this.sessionId,
        event_payload: {
          achievement_type: ACHIEVEMENT_TYPES[Math.floor(Math.random() * ACHIEVEMENT_TYPES.length)],
          timestamp: now
        },
        game_event_timestamp: now
      };
    } else if (eventType < 0.95) { // 5% chance for upgrade
      return {
        event_type: EVENT_TYPES.UPGRADE,
        session_id: this.sessionId,
        event_payload: {
          upgrade_type: UPGRADE_TYPES[Math.floor(Math.random() * UPGRADE_TYPES.length)],
          cost: Math.floor(Math.random() * 1000) + 100
        },
        game_event_timestamp: now
      };
    } else { // 5% chance for evolution
      return {
        event_type: EVENT_TYPES.EVOLUTION,
        session_id: this.sessionId,
        event_payload: {
          evolution_level: Math.floor(Math.random() * 5) + 1,
          power_increase: Math.floor(Math.random() * 500) + 100
        },
        game_event_timestamp: now
      };
    }
  }

  private async simulationTick(): Promise<void> {
    if (!this.isRunning) return;

    const event = this.generateRandomEvent();
    await this.forwardEventToSupabase(event);

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
      const { error } = await supabase.functions.invoke('trigger-special-report-generation', {
        body: {
          simulation_id: this.sessionId,
          status: 'completed'
        }
      });

      if (error) throw error;

      this.addEventLog({
        type: 'forward',
        eventType: 'simulation_complete',
        message: 'Simulation completed, Special Report generation triggered'
      });
    } catch (error) {
      console.error('GhostScript: Failed to trigger special report:', error);
      this.addEventLog({
        type: 'error',
        eventType: 'simulation_complete',
        message: `Failed to trigger Special Report: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  public startSimulation(durationSeconds: number = 30): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.remainingTime = durationSeconds;
    this.sessionId = crypto.randomUUID();

    console.log('GhostScript: Starting simulation session:', this.sessionId);
    this.addEventLog({
      type: 'forward',
      eventType: 'simulation_start',
      message: `Starting Ghost Legion simulation (${durationSeconds}s)`
    });

    this.simulationTimer = window.setInterval(() => this.simulationTick(), 1000);
  }

  public getRemainingTime(): number {
    return this.remainingTime;
  }

  public isSimulationRunning(): boolean {
    return this.isRunning;
  }
}