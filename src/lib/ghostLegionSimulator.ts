import { v4 as uuidv4 } from 'uuid';

export interface SimulationConfig {
  durationSeconds: number;
  eventFrequencyMs: number;
  sessionCount: number;
  eventTypes: {
    tap_activity_burst: number;
    mega_slap_landed: number;
    chode_evolution: number;
    achievement_unlocked: number;
  };
}

export interface SimulationStats {
  eventsGenerated: number;
  eventsByType: Record<string, number>;
  activeSessionIds: string[];
  startTime: Date | null;
  endTime: Date | null;
}

export const defaultConfig: SimulationConfig = {
  durationSeconds: 60,
  eventFrequencyMs: 250,
  sessionCount: 5,
  eventTypes: {
    tap_activity_burst: 0.7,
    mega_slap_landed: 0.2,
    chode_evolution: 0.05,
    achievement_unlocked: 0.05,
  },
};

const evolutionTiers = [
  'Micro Chode',
  'Macro Chode',
  'Giga Chode',
  'Tera Chode',
  'Peta Chode',
  'Quantum Chode',
];

const achievements = [
  { id: 'FIRST_SLAP', name: 'First Blood' },
  { id: 'SLAP_MASTER', name: 'Slap Master' },
  { id: 'GIRTH_LORD', name: 'Girth Lord' },
  { id: 'TAP_KING', name: 'Tap King' },
  { id: 'EVOLUTION_COMPLETE', name: 'Final Form' },
];

export class GhostLegionSimulator {
  private config: SimulationConfig;
  private sessions: string[];
  private stats: SimulationStats;
  private intervalId: number | null = null;
  private onEvent: (event: any) => void;
  private onProgress: (progress: number) => void;
  private onStats: (stats: SimulationStats) => void;

  constructor(
    config: SimulationConfig,
    onEvent: (event: any) => void,
    onProgress: (progress: number) => void,
    onStats: (stats: SimulationStats) => void
  ) {
    this.config = config;
    this.onEvent = onEvent;
    this.onProgress = onProgress;
    this.onStats = onStats;
    this.sessions = Array.from({ length: config.sessionCount }, () => uuidv4());
    this.stats = {
      eventsGenerated: 0,
      eventsByType: {
        tap_activity_burst: 0,
        mega_slap_landed: 0,
        chode_evolution: 0,
        achievement_unlocked: 0,
      },
      activeSessionIds: this.sessions,
      startTime: null,
      endTime: null,
    };
  }

  private getRandomSession(): string {
    return this.sessions[Math.floor(Math.random() * this.sessions.length)];
  }

  private getEventType(): string {
    const rand = Math.random();
    let cumulative = 0;
    
    for (const [type, probability] of Object.entries(this.config.eventTypes)) {
      cumulative += probability;
      if (rand <= cumulative) return type;
    }
    
    return 'tap_activity_burst'; // Default fallback
  }

  private generateEventPayload(eventType: string): any {
    switch (eventType) {
      case 'tap_activity_burst':
        return { tap_count: Math.floor(Math.random() * 51) + 50 };
      case 'mega_slap_landed':
        return { slap_power_girth: Math.floor(Math.random() * 301) + 200 };
      case 'chode_evolution':
        return { new_tier_name: evolutionTiers[Math.floor(Math.random() * evolutionTiers.length)] };
      case 'achievement_unlocked':
        const achievement = achievements[Math.floor(Math.random() * achievements.length)];
        return { achievement_id: achievement.id, achievement_name: achievement.name };
      default:
        return {};
    }
  }

  private generateEvent(): void {
    const eventType = this.getEventType();
    const event = {
      session_id: this.getRandomSession(),
      event_type: eventType,
      timestamp_utc: new Date().toISOString(),
      event_payload: this.generateEventPayload(eventType),
    };

    this.stats.eventsGenerated++;
    this.stats.eventsByType[eventType]++;
    this.onEvent(event);
    this.onStats({ ...this.stats });
  }

  start(): void {
    if (this.intervalId !== null) return;

    this.stats.startTime = new Date();
    this.stats.endTime = null;
    
    const totalEvents = Math.floor((this.config.durationSeconds * 1000) / this.config.eventFrequencyMs);
    let eventCount = 0;

    this.intervalId = window.setInterval(() => {
      this.generateEvent();
      eventCount++;
      
      const progress = (eventCount / totalEvents) * 100;
      this.onProgress(progress);

      if (eventCount >= totalEvents) {
        this.stop();
      }
    }, this.config.eventFrequencyMs);
  }

  stop(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
      this.stats.endTime = new Date();
      this.onStats({ ...this.stats });
      this.onProgress(100);
    }
  }

  isRunning(): boolean {
    return this.intervalId !== null;
  }
}