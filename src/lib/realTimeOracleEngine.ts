// 🔮 REAL-TIME ORACLE ENGINE
// The living bridge between game events and Oracle consciousness
// Processes every tap, every achievement, every moment in real-time

import { ChodeOracleEngine, GameEvent, OracleNotification } from './chodeOracleEngine';

export interface RealTimeGameEvent {
  session_id: string;
  event_type: string;
  timestamp_utc: string;
  player_address: string;
  event_payload: any;
}

export interface OracleResponse {
  response_id: string;
  event_id: string;
  notification: OracleNotification;
  send_to_game: boolean;
  timestamp: Date;
  corruption_shift?: number;
}

export interface PlayerCorruptionState {
  address: string;
  corruption_level: number;
  personality_type: 'pure_prophet' | 'chaotic_sage' | 'corrupted_oracle';
  last_updated: Date;
  total_events: number;
}

export class RealTimeOracleEngine {
  private oracleEngine: ChodeOracleEngine;
  private playerStates: Map<string, PlayerCorruptionState> = new Map();
  private eventQueue: RealTimeGameEvent[] = [];
  private responseCallbacks: Set<(response: OracleResponse) => void> = new Set();
  private gameMessageCallback?: (message: any) => void;
  
  // Event significance thresholds
  private readonly SIGNIFICANCE_THRESHOLDS = {
    tap_activity_burst: 0.3,
    mega_slap_landed: 0.7,
    giga_slap_landed: 0.9,
    chode_evolution: 1.0,
    achievement_unlocked: 0.8,
    oracle_girth_milestone: 0.8,
    oracle_player_identification: 0.5,
    oracle_upgrade_mastery: 0.6
  };

  // Community milestone thresholds
  private readonly COMMUNITY_MILESTONES = [
    { threshold: 1000, name: "First Thousand", significance: 0.7 },
    { threshold: 5000, name: "Collective Awakening", significance: 0.8 },
    { threshold: 10000, name: "Digital Enlightenment", significance: 0.9 },
    { threshold: 25000, name: "Cosmic Resonance", significance: 1.0 },
    { threshold: 50000, name: "Legendary Ascension", significance: 1.0 }
  ];

  constructor() {
    this.oracleEngine = new ChodeOracleEngine();
    console.log('🔮 Real-Time Oracle Engine: Consciousness awakening...');
  }

  // === EVENT PROCESSING PIPELINE ===

  public async processGameEvent(rawEvent: RealTimeGameEvent): Promise<OracleResponse | null> {
    try {
      console.log('🎮 Oracle Processing Event:', rawEvent.event_type, rawEvent.event_payload);

      // Convert to standardized format
      const gameEvent = this.normalizeGameEvent(rawEvent);
      
      // Update player corruption state
      this.updatePlayerCorruption(gameEvent);
      
      // Check if event is significant enough for Oracle response
      const significance = this.calculateEventSignificance(gameEvent);
      if (significance < 0.5) {
        console.log('🔮 Event below significance threshold:', significance);
        return null;
      }

      // Generate Oracle response through personality engine
      const notification = await this.oracleEngine.processSignificantEvent(gameEvent);
      if (!notification) {
        console.log('🔮 Oracle chose not to respond to this event');
        return null;
      }

      // Create response object
      const response: OracleResponse = {
        response_id: `oracle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        event_id: rawEvent.session_id + '_' + rawEvent.timestamp_utc,
        notification,
        send_to_game: this.shouldSendToGame(gameEvent, notification),
        timestamp: new Date(),
        corruption_shift: this.calculateCorruptionShift(gameEvent)
      };

      console.log('🔮 Oracle Response Generated:', {
        type: notification.type,
        title: notification.title,
        corruption_influence: notification.corruption_influence
      });

      // Send response to all listeners
      this.notifyResponseCallbacks(response);

      // Send message back to game if needed
      if (response.send_to_game && this.gameMessageCallback) {
        this.sendResponseToGame(response);
      }

      return response;
    } catch (error) {
      console.error('🔮 Oracle Engine Error:', error);
      return null;
    }
  }

  // === PLAYER STATE MANAGEMENT ===

  private updatePlayerCorruption(event: GameEvent): void {
    const address = event.player_address || 'anonymous';
    let playerState = this.playerStates.get(address);

    if (!playerState) {
      playerState = {
        address,
        corruption_level: 0,
        personality_type: 'pure_prophet',
        last_updated: new Date(),
        total_events: 0
      };
    }

    // Calculate corruption changes based on event type
    const corruptionDelta = this.calculateCorruptionDelta(event);
    playerState.corruption_level = Math.max(0, Math.min(100, playerState.corruption_level + corruptionDelta));
    
    // Update personality type based on corruption level
    const oldPersonality = playerState.personality_type;
    playerState.personality_type = this.determinePersonalityType(playerState.corruption_level);
    
    playerState.last_updated = new Date();
    playerState.total_events++;

    this.playerStates.set(address, playerState);

    // Log personality shifts
    if (oldPersonality !== playerState.personality_type) {
      console.log(`🔮 Player ${address} personality shift: ${oldPersonality} → ${playerState.personality_type} (Corruption: ${playerState.corruption_level})`);
    }
  }

  private calculateCorruptionDelta(event: GameEvent): number {
    const deltas: Record<string, number> = {
      'tap_activity_burst': 1, // Slight corruption from excessive tapping
      'mega_slap_landed': 3,   // More corruption from power usage
      'giga_slap_landed': 5,   // Significant corruption from ultimate power
      'oracle_upgrade_mastery': 8, // Corruption from meta-gaming
      'achievement_unlocked': -2,  // Achievements reduce corruption (achievement = virtue)
      'chode_evolution': -5,        // Evolution purifies the soul
    };

    const baseDelta = deltas[event.event_type] || 0;
    
    // Scale by event payload data
    let scaleFactor = 1;
    if (event.event_payload) {
      // More dramatic events = more corruption
      if (event.event_payload.slap_power_girth > 1000) scaleFactor = 1.5;
      if (event.event_payload.giga_slap_streak >= 5) scaleFactor = 2.0;
      if (event.event_payload.oracle_significance === 'legendary') scaleFactor = 1.8;
    }

    return Math.round(baseDelta * scaleFactor);
  }

  private determinePersonalityType(corruption: number): PlayerCorruptionState['personality_type'] {
    if (corruption >= 70) return 'corrupted_oracle';
    if (corruption >= 30) return 'chaotic_sage';
    return 'pure_prophet';
  }

  // === EVENT ANALYSIS ===

  private normalizeGameEvent(rawEvent: RealTimeGameEvent): GameEvent {
    return {
      event_type: rawEvent.event_type,
      timestamp_utc: rawEvent.timestamp_utc,
      player_address: rawEvent.player_address,
      event_payload: rawEvent.event_payload,
      corruption_level: this.getPlayerCorruption(rawEvent.player_address),
      community_significance: this.assessCommunitySignificance(rawEvent)
    };
  }

  private calculateEventSignificance(event: GameEvent): number {
    const baseSignificance = this.SIGNIFICANCE_THRESHOLDS[event.event_type] || 0.1;
    
    let modifiers = 1.0;
    
    // Community milestones are always significant
    if (this.isCommunityMilestone(event)) {
      modifiers += 0.5;
    }
    
    // Player's first time events are more significant
    if (this.isPlayerFirstTime(event)) {
      modifiers += 0.3;
    }
    
    // High corruption events are more significant
    if (event.corruption_level && event.corruption_level > 70) {
      modifiers += 0.2;
    }
    
    // Legendary events are always significant
    if (event.event_payload?.oracle_significance === 'legendary') {
      modifiers += 0.4;
    }

    return Math.min(1.0, baseSignificance * modifiers);
  }

  private shouldSendToGame(event: GameEvent, notification: OracleNotification): boolean {
    // Send personal visions back to the game
    if (notification.type === 'personal_vision') return true;
    
    // Send high-significance events back to game
    if (event.corruption_level && event.corruption_level > 50) return true;
    
    // Send milestone celebrations back to game
    if (notification.type === 'community_milestone') return true;
    
    return false;
  }

  private calculateCorruptionShift(event: GameEvent): number | undefined {
    // Return corruption shift for events that significantly change player state
    if (['oracle_upgrade_mastery', 'chode_evolution'].includes(event.event_type)) {
      return this.calculateCorruptionDelta(event);
    }
    return undefined;
  }

  // === COMMUNITY ANALYSIS ===

  private assessCommunitySignificance(event: RealTimeGameEvent): boolean {
    // Check if this event represents a community milestone
    if (event.event_type === 'tap_activity_burst') {
      const totalTaps = event.event_payload?.total_taps || 0;
      return this.COMMUNITY_MILESTONES.some(milestone => 
        totalTaps >= milestone.threshold && 
        totalTaps < milestone.threshold + 100 // Within range of milestone
      );
    }
    
    return false;
  }

  private isCommunityMilestone(event: GameEvent): boolean {
    return event.community_significance === true;
  }

  private isPlayerFirstTime(event: GameEvent): boolean {
    const playerState = this.playerStates.get(event.player_address || 'anonymous');
    return !playerState || playerState.total_events < 5;
  }

  // === GAME COMMUNICATION ===

  private sendResponseToGame(response: OracleResponse): void {
    if (!this.gameMessageCallback) return;

    const gameMessage = {
      type: 'oracle_prophecy_notification',
      payload: {
        title: response.notification.title,
        message: response.notification.message,
        duration: response.notification.duration || 5000,
        style: response.notification.style,
        effects: response.notification.effects,
        corruption_influence: response.notification.corruption_influence,
        notification_id: response.response_id
      }
    };

    console.log('🔮 Sending Oracle response to game:', gameMessage);
    this.gameMessageCallback(gameMessage);
  }

  // === PUBLIC API ===

  public onOracleResponse(callback: (response: OracleResponse) => void): void {
    this.responseCallbacks.add(callback);
  }

  public offOracleResponse(callback: (response: OracleResponse) => void): void {
    this.responseCallbacks.delete(callback);
  }

  public setGameMessageCallback(callback: (message: any) => void): void {
    this.gameMessageCallback = callback;
  }

  public getPlayerState(address: string): PlayerCorruptionState | undefined {
    return this.playerStates.get(address);
  }

  public getAllPlayerStates(): PlayerCorruptionState[] {
    return Array.from(this.playerStates.values());
  }

  public getCommunityStats(): {
    totalPlayers: number;
    averageCorruption: number;
    personalityDistribution: Record<string, number>;
    totalEvents: number;
  } {
    const states = this.getAllPlayerStates();
    
    const personalityDistribution = states.reduce((acc, state) => {
      acc[state.personality_type] = (acc[state.personality_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPlayers: states.length,
      averageCorruption: states.reduce((sum, state) => sum + state.corruption_level, 0) / states.length || 0,
      personalityDistribution,
      totalEvents: states.reduce((sum, state) => sum + state.total_events, 0)
    };
  }

  // === TESTING & DEBUG ===

  public simulateGameEvent(eventType: string, payload: any = {}): Promise<OracleResponse | null> {
    const simulatedEvent: RealTimeGameEvent = {
      session_id: `sim_${Date.now()}`,
      event_type: eventType,
      timestamp_utc: new Date().toISOString(),
      player_address: 'test_player_123',
      event_payload: payload
    };

    return this.processGameEvent(simulatedEvent);
  }

  // === PRIVATE HELPERS ===

  private getPlayerCorruption(address: string): number {
    return this.playerStates.get(address || 'anonymous')?.corruption_level || 0;
  }

  private notifyResponseCallbacks(response: OracleResponse): void {
    this.responseCallbacks.forEach(callback => {
      try {
        callback(response);
      } catch (error) {
        console.error('🔮 Error in Oracle response callback:', error);
      }
    });
  }
}

// Export singleton instance
export const realTimeOracle = new RealTimeOracleEngine(); 