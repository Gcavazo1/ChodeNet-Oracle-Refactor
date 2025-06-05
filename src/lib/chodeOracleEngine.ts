// 🔮 CHODE ORACLE ENGINE: The Cyberpunk Degen Prophet
// Personality-driven response generation for the eternal game guardian

interface ChodeOraclePersonality {
  voice: 'cyberpunk_prophet';
  traits: ['mystical_sage', 'mischievous_trickster', 'cosmic_entity'];
  tone: 'poetic_riddles_with_degen_humor';
  brand: 'cookie_clicker_through_cyberpunk_dumpster_fire';
}

interface GameEvent {
  event_type: string;
  player_address?: string;
  player_name?: string;
  event_payload: any;
  corruption_level?: number;
  community_significance?: number;
  timestamp_utc: string;
}

interface OracleNotification {
  type: 'oracle_prophecy' | 'community_milestone' | 'personal_vision';
  title: string;
  message: string;
  style: 'cyberpunk_prophet' | 'corrupted_oracle' | 'pure_sage';
  duration: number;
  effects?: string[];
  corruption_influence?: number;
  player_address?: string;
}

type OraclePersonalityType = 'pure_prophet' | 'chaotic_sage' | 'corrupted_oracle';

export class ChodeOracleEngine {
  private personality: ChodeOraclePersonality;
  
  constructor() {
    this.personality = {
      voice: 'cyberpunk_prophet',
      traits: ['mystical_sage', 'mischievous_trickster', 'cosmic_entity'],
      tone: 'poetic_riddles_with_degen_humor',
      brand: 'cookie_clicker_through_cyberpunk_dumpster_fire'
    };
  }

  // === CORE PROPHECY GENERATION ===
  
  async processSignificantEvent(event: GameEvent): Promise<OracleNotification | null> {
    const significance = this.calculateEventSignificance(event);
    
    if (significance < 0.7) return null; // Only respond to truly significant events
    
    const personalityType = this.determinePersonalityFromCorruption(event.corruption_level || 0);
    const notification = await this.generatePoeticResponse(event, personalityType);
    
    return notification;
  }
  
  private generatePoeticResponse(event: GameEvent, personalityType: OraclePersonalityType): OracleNotification {
    const template = this.selectResponseTemplate(event.event_type, personalityType);
    const personalizedMessage = this.injectPlayerContext(template, event);
    
    return {
      type: this.determineNotificationType(event),
      title: this.generateMysticalTitle(event, personalityType),
      message: personalizedMessage,
      style: this.mapPersonalityToStyle(personalityType),
      duration: this.calculateNotificationDuration(event),
      effects: this.generateVisualEffects(personalityType),
      corruption_influence: event.corruption_level,
      player_address: event.player_address
    };
  }

  // === PERSONALITY SYSTEM ===
  
  private determinePersonalityFromCorruption(corruption: number): OraclePersonalityType {
    if (corruption < 30) {
      return 'pure_prophet'; // Wise, helpful, optimistic
    } else if (corruption < 70) {
      return 'chaotic_sage'; // Cryptic, mischievous, unpredictable  
    } else {
      return 'corrupted_oracle'; // Dark humor, ominous warnings, degen chaos
    }
  }

  private readonly RESPONSE_PATTERNS = {
    // === PURE PROPHET (Corruption: 0-30) ===
    pure_prophet: {
      greeting: [
        "Welcome, pure soul. The girth flows clean through thee...",
        "Behold, one untainted by the digital corruption walks among us...",
        "The sacred energies recognize thy unblemished spirit, tapper of virtue..."
      ],
      evolution: [
        "🌟 ASCENSION ACHIEVED! Thy form transcends mortal limits with divine grace!",
        "The ancient protocols bless thy transformation, pure one...",
        "From humble flesh to enlightened being, the sacred girth multiplies!"
      ],
      milestone: [
        "The cosmos smiles upon thy dedication! {girth_amount} girth achieved through righteous tapping!",
        "Witness the accumulation of pure power! The prophecy of growth unfolds!",
        "Another sacred milestone falls to persistent virtue. The universe approves."
      ],
      leaderboard: [
        "Behold! {player_name} rises through the ranks with honor intact!",
        "The leaderboard shifts as virtue conquers chaos! Well done, pure tapper!",
        "Another soul ascends the sacred hierarchy through dedication!"
      ]
    },

    // === CHAOTIC SAGE (Corruption: 31-70) ===
    chaotic_sage: {
      greeting: [
        "Ah, a soul balanced precariously on the edge of chaos and order...",
        "The digital winds whisper of thy dual nature, unpredictable one...",
        "Neither pure nor corrupted, but dancing in the liminal space between..."
      ],
      evolution: [
        "🌀 CHAOS EVOLUTION! Reality bends and reshapes around thy chaotic girth!",
        "The transformation defies prediction! Perhaps blessing, perhaps curse...",
        "From order to chaos to something... else. The girth laughs at categorization!"
      ],
      milestone: [
        "The numbers dance in strange patterns! {girth_amount} girth accumulated through... methods...",
        "Another milestone achieved through questionable means. The cosmos shrugs.",
        "Is this progress or regress? The {girth_amount} girth cares not for such distinctions!"
      ],
      leaderboard: [
        "The rankings shift like digital smoke... {player_name} emerges from the chaos!",
        "Behold the unpredictable rise! Will fortune favor thee tomorrow? Unknown!",
        "The leaderboard trembles as chaotic energy disrupts its order!"
      ]
    },

    // === CORRUPTED ORACLE (Corruption: 71-100) ===
    corrupted_oracle: {
      greeting: [
        "Another degenerate seeks wisdom in the digital abyss... Welcome, fallen one.",
        "The corruption flows strong in this one! The darkness embraces thee warmly...",
        "Ah, a kindred spirit swimming in the cyber-sewers of moral decay!"
      ],
      evolution: [
        "🔥 CORRUPTION EVOLUTION! Thy transformation reeks of beautiful decay!",
        "The dark protocols activate! Embrace the delicious degeneracy of change!",
        "From corrupted flesh to digital daemon! The unholy girth GROWS!"
      ],
      milestone: [
        "YOLO INTO THE VOID! {girth_amount} girth accumulated through pure degeneracy!",
        "Another milestone consumed by the corruption! The abyss celebrates thy descent!",
        "The sacred numbers mean nothing here! {girth_amount} girth earned through chaos!"
      ],
      leaderboard: [
        "THE CORRUPTION SPREADS! {player_name} climbs through the ranks of depravity!",
        "Behold the degen ascension! The leaderboard weeps at thy approach!",
        "Another soul falls upward through the rankings! Beautiful destruction!"
      ]
    }
  };

  // === COMMUNITY EVENTS ===
  
  private readonly COMMUNITY_PATTERNS = {
    poll_announcement: [
      "🗳️ THE COLLECTIVE CONSCIOUSNESS STIRS! A great polling approaches the realm!",
      "Democracy calls, degenerates! Cast thy votes into the digital void!",
      "The community's will shall reshape reality itself... Choose wisely, mortals!"
    ],
    poll_victory: [
      "The people have spoken! The winning choice echoes through the blockchain!",
      "Democracy has decided! Reality bends to the collective will!",
      "The poll concludes! The oracle acknowledges the community's wisdom!"
    ],
    community_milestone: [
      "🌐 THE COLLECTIVE GIRTH SWELLS! {total_taps} taps achieved across all realms!",
      "Witness the power of unified degeneracy! The community milestone falls!",
      "The hive mind grows stronger! {total_taps} collective taps reshape the cosmos!"
    ],
    token_milestone: [
      "💰 THE DIGITAL ALCHEMY SUCCEEDS! {tokens_minted} $GIRTH manifested from pure tapping!",
      "Behold the transmutation of effort into value! The SPL tokens multiply!",
      "The economic prophecy fulfills itself! Taps become tangible wealth!"
    ]
  };

  // === RESPONSE SELECTION ===
  
  private selectResponseTemplate(eventType: string, personalityType: OraclePersonalityType): string {
    const patterns = this.RESPONSE_PATTERNS[personalityType];
    
    // Map event types to response categories
    const eventMapping: Record<string, keyof typeof patterns> = {
      'chode_evolution': 'evolution',
      'oracle_girth_milestone': 'milestone', 
      'oracle_player_identification': 'greeting',
      'leaderboard_change': 'leaderboard'
    };
    
    const category = eventMapping[eventType] || 'milestone';
    const templates = patterns[category];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  // === CONTEXT INJECTION ===
  
  private injectPlayerContext(template: string, event: GameEvent): string {
    let message = template;
    
    // Replace player-specific variables
    if (event.player_name) {
      message = message.replace('{player_name}', event.player_name);
    }
    
    // Replace girth amounts
    if (event.event_payload?.total_girth || event.event_payload?.current_girth) {
      const girth = event.event_payload.total_girth || event.event_payload.current_girth;
      message = message.replace('{girth_amount}', girth.toLocaleString());
    }
    
    // Replace community metrics
    if (event.event_payload?.total_taps) {
      message = message.replace('{total_taps}', event.event_payload.total_taps.toLocaleString());
    }
    
    if (event.event_payload?.tokens_minted) {
      message = message.replace('{tokens_minted}', event.event_payload.tokens_minted.toFixed(6));
    }
    
    return message;
  }

  // === TITLE GENERATION ===
  
  private generateMysticalTitle(event: GameEvent, personalityType: OraclePersonalityType): string {
    const baseTitles = {
      pure_prophet: [
        "Sacred Vision",
        "Divine Prophecy", 
        "Celestial Guidance",
        "Virtuous Revelation"
      ],
      chaotic_sage: [
        "Liminal Vision",
        "Paradox Prophecy",
        "Chaos Whispers",
        "Uncertain Truth"
      ],
      corrupted_oracle: [
        "Dark Vision",
        "Corrupted Prophecy",
        "Degen Revelation", 
        "Void Whispers"
      ]
    };
    
    const titles = baseTitles[personalityType];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  // === SIGNIFICANCE CALCULATION ===
  
  private calculateEventSignificance(event: GameEvent): number {
    let significance = 0.5; // Base significance
    
    // Event type significance modifiers
    const typeModifiers: Record<string, number> = {
      'chode_evolution': 1.0,           // Always significant
      'giga_slap_landed': 0.9,          // Very significant
      'oracle_girth_milestone': 0.8,    // Significant
      'leaderboard_change': 0.7,        // Moderately significant
      'mega_slap_landed': 0.6,          // Somewhat significant
      'tap_activity_burst': 0.3,        // Low significance
    };
    
    significance *= typeModifiers[event.event_type] || 0.5;
    
    // Community significance boost
    if (event.community_significance) {
      significance += event.community_significance * 0.3;
    }
    
    // Player milestone boost
    if (event.event_payload?.milestone_reached) {
      significance += 0.2;
    }
    
    return Math.min(significance, 1.0);
  }

  // === UTILITY METHODS ===
  
  private determineNotificationType(event: GameEvent): OracleNotification['type'] {
    if (event.event_payload?.total_taps || event.community_significance) {
      return 'community_milestone';
    }
    if (event.player_address) {
      return 'personal_vision';
    }
    return 'oracle_prophecy';
  }

  private mapPersonalityToStyle(personalityType: OraclePersonalityType): OracleNotification['style'] {
    const mapping: Record<OraclePersonalityType, OracleNotification['style']> = {
      'pure_prophet': 'cyberpunk_prophet',
      'chaotic_sage': 'cyberpunk_prophet', 
      'corrupted_oracle': 'corrupted_oracle'
    };
    return mapping[personalityType];
  }

  private calculateNotificationDuration(event: GameEvent): number {
    // Longer duration for more significant events
    const baseEventDurations: Record<string, number> = {
      'chode_evolution': 8000,
      'oracle_girth_milestone': 6000,
      'giga_slap_landed': 5000,
      'leaderboard_change': 4000,
      'mega_slap_landed': 3000
    };
    
    return baseEventDurations[event.event_type] || 4000;
  }

  private generateVisualEffects(personalityType: OraclePersonalityType): string[] {
    const effectMappings: Record<OraclePersonalityType, string[]> = {
      'pure_prophet': ['divine_glow', 'golden_particles', 'blessing_aura'],
      'chaotic_sage': ['reality_distortion', 'color_shift', 'chaos_sparkles'],
      'corrupted_oracle': ['dark_energy', 'corrupted_glitch', 'void_particles']
    };
    
    return effectMappings[personalityType];
  }

  // === PUBLIC INTERFACE ===
  
  public async generateCommunityAnnouncement(announcementType: string, data: any): Promise<OracleNotification> {
    const templates = this.COMMUNITY_PATTERNS[announcementType as keyof typeof this.COMMUNITY_PATTERNS];
    
    if (!templates) {
      throw new Error(`Unknown announcement type: ${announcementType}`);
    }
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    const message = this.injectPlayerContext(template, { 
      event_type: announcementType, 
      event_payload: data,
      timestamp_utc: new Date().toISOString()
    });
    
    return {
      type: 'community_milestone',
      title: 'Community Oracle Speaks',
      message,
      style: 'cyberpunk_prophet',
      duration: 6000,
      effects: ['community_celebration', 'collective_glow']
    };
  }

  public generateWelcomeMessage(playerAddress: string, corruptionLevel: number = 0): OracleNotification {
    const personalityType = this.determinePersonalityFromCorruption(corruptionLevel);
    const greetings = this.RESPONSE_PATTERNS[personalityType].greeting;
    const message = greetings[Math.floor(Math.random() * greetings.length)];
    
    return {
      type: 'personal_vision',
      title: 'The Oracle Awakens',
      message,
      style: this.mapPersonalityToStyle(personalityType),
      duration: 5000,
      effects: this.generateVisualEffects(personalityType),
      corruption_influence: corruptionLevel,
      player_address: playerAddress
    };
  }
}

// Export singleton instance
export const chodeOracle = new ChodeOracleEngine(); 