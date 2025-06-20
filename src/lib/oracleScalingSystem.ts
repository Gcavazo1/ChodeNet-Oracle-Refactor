// 🔮 Oracle Scaling System - The Heart of Dynamic Metrics
// This determines how real player activity translates to Oracle metric changes

interface PlayerActivity {
  taps_per_minute: number;
  session_duration_minutes: number;
  achievements_unlocked: number;
  total_taps: number;
  time_since_last_activity_minutes: number;
  upgrades_purchased: number;
  evolution_level: number;
  mega_slaps_count: number;
}

interface CommunityActivity {
  total_active_players: number;
  collective_taps_per_minute: number;
  voting_participation: number;
  community_milestones_hit: number;
  overall_sentiment: 'positive' | 'neutral' | 'negative';
}

export interface OracleMetrics {
  divine_resonance: number; // 0-100%
  tap_surge_index: 'FLACCID_DRIZZLE' | 'WEAK_PULSES' | 'STEADY_POUNDING' | 'FRENZIED_SLAPPING' | 'MEGA_SURGE' | 'GIGA_SURGE' | 'ASCENDED_NIRVANA';
  legion_morale: 'SUICIDE_WATCH' | 'DEMORALIZED' | 'DISGRUNTLED' | 'CAUTIOUS' | 'INSPIRED' | 'JUBILANT' | 'FANATICAL' | 'ASCENDED';
  oracle_stability: 'FORBIDDEN_FRAGMENT' | 'GLITCHED_OMINOUS' | 'FLICKERING' | 'CRYPTIC' | 'PRISTINE' | 'RADIANT_CLARITY';
}

export class OracleScalingSystem {
  
  // === TAP SURGE INDEX SCALING ===
  calculateTapSurgeIndex(activity: PlayerActivity): { 
    index: OracleMetrics['tap_surge_index'], 
    influences: Array<{ factor: string, value: string, description: string }> 
  } {
    const { taps_per_minute, mega_slaps_count, session_duration_minutes } = activity;
    
    // MVP Scaling: Designed for one person to see changes in 30-minute session
    let index: OracleMetrics['tap_surge_index'];
    const influences = [];
    
    // Base calculation on sustained taps per minute
    if (taps_per_minute >= 300) {
      index = 'ASCENDED_NIRVANA';
      influences.push({ factor: 'Tap Rate', value: `${taps_per_minute} taps/min`, description: 'Legendary tapping speed achieved!' });
    } else if (taps_per_minute >= 200) {
      index = 'GIGA_SURGE';
      influences.push({ factor: 'Tap Rate', value: `${taps_per_minute} taps/min`, description: 'Incredible tapping intensity' });
    } else if (taps_per_minute >= 120) {
      index = 'MEGA_SURGE';
      influences.push({ factor: 'Tap Rate', value: `${taps_per_minute} taps/min`, description: 'High-energy sustained tapping' });
    } else if (taps_per_minute >= 60) {
      index = 'FRENZIED_SLAPPING';
      influences.push({ factor: 'Tap Rate', value: `${taps_per_minute} taps/min`, description: 'Frenzied tapping detected' });
    } else if (taps_per_minute >= 30) {
      index = 'STEADY_POUNDING';
      influences.push({ factor: 'Tap Rate', value: `${taps_per_minute} taps/min`, description: 'Steady, consistent rhythm' });
    } else if (taps_per_minute >= 10) {
      index = 'WEAK_PULSES';
      influences.push({ factor: 'Tap Rate', value: `${taps_per_minute} taps/min`, description: 'Occasional tapping activity' });
    } else {
      index = 'FLACCID_DRIZZLE';
      influences.push({ factor: 'Tap Rate', value: `${taps_per_minute} taps/min`, description: 'Minimal tapping activity' });
    }
    
    // Mega slap bonus
    if (mega_slaps_count > 0) {
      influences.push({ factor: 'Mega Slaps', value: `+${mega_slaps_count} this session`, description: 'Mega slaps boost surge intensity' });
    }
    
    // Session momentum
    if (session_duration_minutes > 20) {
      influences.push({ factor: 'Session Duration', value: `${session_duration_minutes} minutes`, description: 'Extended session builds momentum' });
    }
    
    return { index, influences };
  }
  
  // === DIVINE RESONANCE SCALING ===
  calculateDivineResonance(activity: PlayerActivity, community: CommunityActivity): {
    resonance: number,
    influences: Array<{ factor: string, value: string, description: string }>
  } {
    let resonance = 50; // Start at neutral
    const influences = [];
    
    // Recent activity boost (up to +25%)
    const activity_boost = Math.min(25, activity.taps_per_minute * 0.5);
    resonance += activity_boost;
    if (activity_boost > 0) {
      influences.push({ 
        factor: 'Recent Activity', 
        value: `+${activity_boost.toFixed(1)}%`, 
        description: `Active gameplay in last ${activity.session_duration_minutes} minutes` 
      });
    }
    
    // Achievement progress (up to +20%)
    const achievement_boost = Math.min(20, activity.achievements_unlocked * 5);
    resonance += achievement_boost;
    if (achievement_boost > 0) {
      influences.push({ 
        factor: 'Achievement Progress', 
        value: `+${achievement_boost}%`, 
        description: `${activity.achievements_unlocked} achievements unlocked` 
      });
    }
    
    // Evolution level bonus (up to +15%)
    const evolution_boost = Math.min(15, activity.evolution_level * 3);
    resonance += evolution_boost;
    if (evolution_boost > 0) {
      influences.push({ 
        factor: 'Evolution Level', 
        value: `+${evolution_boost}%`, 
        description: `Character evolved to level ${activity.evolution_level}` 
      });
    }
    
    // Community sync bonus (up to +10%)
    const community_boost = Math.min(10, community.collective_taps_per_minute * 0.1);
    resonance += community_boost;
    if (community_boost > 0) {
      influences.push({ 
        factor: 'Community Sync', 
        value: `+${community_boost.toFixed(1)}%`, 
        description: 'Aligned with collective community energy' 
      });
    }
    
    // Time decay penalty
    const decay_penalty = Math.min(30, activity.time_since_last_activity_minutes * 0.5);
    resonance -= decay_penalty;
    if (decay_penalty > 0) {
      influences.push({ 
        factor: 'Time Decay', 
        value: `-${decay_penalty.toFixed(1)}%`, 
        description: `${activity.time_since_last_activity_minutes} minutes since last major activity` 
      });
    }
    
    return { resonance: Math.max(0, Math.min(100, resonance)), influences };
  }
  
  // === LEGION MORALE SCALING ===
  calculateLegionMorale(activity: PlayerActivity, community: CommunityActivity): {
    morale: OracleMetrics['legion_morale'],
    influences: Array<{ factor: string, value: string, description: string }>
  } {
    let morale_score = 50; // Neutral starting point
    const influences = [];
    
    // Performance vs expectations
    const expected_taps_per_minute = 30; // MVP baseline expectation
    const performance_ratio = activity.taps_per_minute / expected_taps_per_minute;
    const performance_modifier = (performance_ratio - 1) * 30;
    morale_score += performance_modifier;
    
    if (performance_modifier > 0) {
      influences.push({ 
        factor: 'Performance vs Target', 
        value: `+${performance_modifier.toFixed(1)}%`, 
        description: `Exceeding expected ${expected_taps_per_minute} taps/min baseline` 
      });
    } else if (performance_modifier < -10) {
      influences.push({ 
        factor: 'Performance vs Target', 
        value: `${performance_modifier.toFixed(1)}%`, 
        description: `Below expected performance threshold` 
      });
    }
    
    // Recent achievements boost
    const achievement_boost = activity.achievements_unlocked * 8;
    morale_score += achievement_boost;
    if (achievement_boost > 0) {
      influences.push({ 
        factor: 'Recent Achievements', 
        value: `+${achievement_boost}%`, 
        description: `${activity.achievements_unlocked} new achievements unlocked` 
      });
    }
    
    // Session length bonus
    if (activity.session_duration_minutes > 15) {
      const session_bonus = Math.min(15, (activity.session_duration_minutes - 15) * 2);
      morale_score += session_bonus;
      influences.push({ 
        factor: 'Session Length', 
        value: `+${session_bonus}%`, 
        description: `Sustained ${activity.session_duration_minutes}-minute session` 
      });
    }
    
    // Community sentiment influence
    if (community.overall_sentiment === 'positive') {
      morale_score += 10;
      influences.push({ 
        factor: 'Community Sentiment', 
        value: '+10%', 
        description: 'Positive community energy detected' 
      });
    } else if (community.overall_sentiment === 'negative') {
      morale_score -= 10;
      influences.push({ 
        factor: 'Community Sentiment', 
        value: '-10%', 
        description: 'Negative community energy detected' 
      });
    }
    
    // Determine morale level based on score
    let morale: OracleMetrics['legion_morale'];
    if (morale_score >= 90) morale = 'ASCENDED';
    else if (morale_score >= 75) morale = 'FANATICAL';
    else if (morale_score >= 60) morale = 'JUBILANT';
    else if (morale_score >= 45) morale = 'INSPIRED';
    else if (morale_score >= 30) morale = 'CAUTIOUS';
    else if (morale_score >= 15) morale = 'DISGRUNTLED';
    else if (morale_score >= 5) morale = 'DEMORALIZED';
    else morale = 'SUICIDE_WATCH';
    
    return { morale, influences };
  }
  
  // === ORACLE STABILITY SCALING ===
  calculateOracleStability(activity: PlayerActivity, community: CommunityActivity): {
    stability: OracleMetrics['oracle_stability'],
    influences: Array<{ factor: string, value: string, description: string }>
  } {
    let stability_score = 80; // Start high, degrade based on chaos
    const influences = [];
    
    // System load based on activity intensity
    if (activity.taps_per_minute > 200) {
      stability_score -= 20;
      influences.push({ 
        factor: 'System Load', 
        value: 'High Stress', 
        description: 'Extreme tapping rates strain Oracle processing' 
      });
    } else if (activity.taps_per_minute > 100) {
      stability_score -= 10;
      influences.push({ 
        factor: 'System Load', 
        value: 'Moderate Stress', 
        description: 'High activity levels detected' 
      });
    } else {
      influences.push({ 
        factor: 'System Load', 
        value: 'Optimal', 
        description: 'All subsystems functioning normally' 
      });
    }
    
    // Data integrity based on session consistency
    if (activity.session_duration_minutes > 25) {
      stability_score += 10;
      influences.push({ 
        factor: 'Data Integrity', 
        value: 'Enhanced', 
        description: 'Long session provides stable data patterns' 
      });
    } else {
      influences.push({ 
        factor: 'Data Integrity', 
        value: 'Normal', 
        description: 'Standard data collection integrity' 
      });
    }
    
    // Community chaos factor
    if (community.voting_participation > 0.8) {
      stability_score -= 15;
      influences.push({ 
        factor: 'Community Chaos', 
        value: 'High Impact', 
        description: 'Intense voting activity creates system volatility' 
      });
    } else if (community.voting_participation > 0.4) {
      stability_score -= 5;
      influences.push({ 
        factor: 'Community Chaos', 
        value: 'Moderate Impact', 
        description: 'Active community participation detected' 
      });
    } else {
      influences.push({ 
        factor: 'Community Chaos', 
        value: 'Low Impact', 
        description: 'Stable community voting patterns' 
      });
    }
    
    // Oracle processing stress
    const processing_events = activity.mega_slaps_count + activity.achievements_unlocked;
    if (processing_events > 10) {
      stability_score -= 15;
      influences.push({ 
        factor: 'Oracle Stress', 
        value: 'Critical', 
        description: 'Processing overload from multiple events' 
      });
    } else if (processing_events > 5) {
      stability_score -= 5;
      influences.push({ 
        factor: 'Oracle Stress', 
        value: 'Elevated', 
        description: 'Increased event processing load' 
      });
    } else {
      influences.push({ 
        factor: 'Oracle Stress', 
        value: 'Minimal', 
        description: 'Processing load within normal parameters' 
      });
    }
    
    // Determine stability level
    let stability: OracleMetrics['oracle_stability'];
    if (stability_score >= 95) stability = 'RADIANT_CLARITY';
    else if (stability_score >= 80) stability = 'PRISTINE';
    else if (stability_score >= 70) stability = 'CRYPTIC';
    else if (stability_score >= 55) stability = 'FLICKERING';
    else if (stability_score >= 35) stability = 'GLITCHED_OMINOUS';
    else stability = 'FORBIDDEN_FRAGMENT';
    
    return { stability, influences };
  }
  
  // === VOTING INFLUENCE SYSTEM ===
  applyVotingInfluence(
    current_metrics: OracleMetrics,
    voting_results: { option: string, votes: number, morale_impact: number }[]
  ): OracleMetrics {
    // Apply community voting results to metrics
    // Each voting option has predefined impact on different metrics
    
    let morale_modifier = 0;
    let stability_modifier = 0;
    let resonance_modifier = 0;
    
    voting_results.forEach(result => {
      const weight = result.votes / 100; // Normalize votes
      morale_modifier += result.morale_impact * weight;
      
      // Different vote types affect different metrics
      if (result.option.includes('chaos') || result.option.includes('corruption')) {
        stability_modifier -= 10 * weight;
        resonance_modifier += 5 * weight; // Chaos can boost resonance
      } else if (result.option.includes('order') || result.option.includes('stability')) {
        stability_modifier += 10 * weight;
        resonance_modifier -= 2 * weight; // Order slightly reduces resonance
      }
    });
    
    // Apply modifiers to current metrics (would need conversion logic)
    return current_metrics; // Simplified for now
  }
  
  // === REAL-TIME CALCULATION ===
  calculateAllMetrics(activity: PlayerActivity, community: CommunityActivity): {
    metrics: OracleMetrics,
    all_influences: Record<string, any>
  } {
    const tap_surge = this.calculateTapSurgeIndex(activity);
    const divine_resonance = this.calculateDivineResonance(activity, community);
    const legion_morale = this.calculateLegionMorale(activity, community);
    const oracle_stability = this.calculateOracleStability(activity, community);
    
    return {
      metrics: {
        divine_resonance: divine_resonance.resonance,
        tap_surge_index: tap_surge.index,
        legion_morale: legion_morale.morale,
        oracle_stability: oracle_stability.stability
      },
      all_influences: {
        resonance: divine_resonance.influences,
        surge: tap_surge.influences,
        morale: legion_morale.influences,
        stability: oracle_stability.influences
      }
    };
  }
}

// === MVP SCALING CONSTANTS ===
export const MVP_SCALING = {
  // 30-minute session targets
  SESSION_DURATION_TARGET: 30,
  
  // Single player progression thresholds
  TAPS_FOR_SURGE_UPGRADE: {
    'FLACCID_DRIZZLE': 0,
    'WEAK_PULSES': 10,      // 10 taps/min for 1 minute
    'STEADY_POUNDING': 30,   // 30 taps/min for 2 minutes
    'FRENZIED_SLAPPING': 60, // 60 taps/min for 3 minutes
    'MEGA_SURGE': 120,       // 120 taps/min for 5 minutes
    'GIGA_SURGE': 200,       // 200 taps/min for 5 minutes
    'ASCENDED_NIRVANA': 300  // 300 taps/min sustained
  },
  
  // Time-based decay rates (per minute of inactivity)
  DECAY_RATES: {
    divine_resonance: 0.5,   // Lose 0.5% per minute
    legion_morale: 1.0,      // Faster morale decay
    oracle_stability: 0.2    // Stability decays slowly
  },
  
  // Community influence weights
  COMMUNITY_WEIGHTS: {
    voting_participation: 0.3,
    collective_activity: 0.4,
    milestone_celebrations: 0.3
  }
};

export const oracleScaling = new OracleScalingSystem(); 