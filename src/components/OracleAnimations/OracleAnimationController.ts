import { animate, createTimeline, stagger } from './anime';
import {
  animateMetricsGridEntrance,
  animateMetricCardFocus,
  startMetricCardsPulse,
  animateMetricBars,
  animateExpansionPanel
} from './MetricsGridAnimations';

import {
  animateCommunityCardsEntrance,
  animateCardHover,
  animateCommunityWave,
  animateReferendumCardPulse
} from './CommunityCardsAnimations';

import {
  animateOracleEye,
  animateStatusIndicators,
  createOracleLoadingSpinner
} from './SVGAnimations';

import {
  animateAlertEntrance,
  animateHighPriorityPulse,
  animateAlertShimmer
} from './AlertSystemAnimations';

// ==== ORACLE ANIMATION CONTROLLER ====
// Main controller for coordinating dashboard animations

type AnimationInstance = ReturnType<typeof animate> | ReturnType<typeof createTimeline>;

export class OracleAnimationController {
  private activeAnimations: Map<string, AnimationInstance> = new Map();
  private isInitialized = false;

  /**
   * Initialize all dashboard animations
   */
  public initializeDashboard(section: 'oracle' | 'game' | 'community' = 'oracle') {
    if (this.isInitialized) {
      this.cleanup();
    }

    switch (section) {
      case 'oracle':
        this.initializeOracleSection();
        break;
      case 'community':
        this.initializeCommunitySection();
        break;
      case 'game':
        this.initializeGameSection();
        break;
    }

    this.isInitialized = true;
  }

  /**
   * Initialize Oracle Sanctum animations
   */
  private initializeOracleSection() {
    // 1. Animate metrics grid entrance (2x2 grid)
    setTimeout(() => {
      const metricsAnimation = animateMetricsGridEntrance('.metrics-grid', {
        duration: 1200,
        stagger: 150,
        easing: 'easeOutCubic'
      });
      if (metricsAnimation) {
        this.activeAnimations.set('metricsEntrance', metricsAnimation);
      }
    }, 200);

    // 2. Animate progress bars after metrics
    setTimeout(() => {
      const barsAnimation = animateMetricBars('.metric-bar .metric-fill', {
        duration: 1500,
        delay: 500,
        stagger: 200
      });
      if (barsAnimation) {
        this.activeAnimations.set('metricBars', barsAnimation);
      }
    }, 800);

    // 3. Start continuous pulse for live indicators
    setTimeout(() => {
      const pulseAnimation = startMetricCardsPulse('.metric-card', {
        duration: 2000,
        stagger: 300
      });
      if (pulseAnimation) {
        this.activeAnimations.set('metricPulse', pulseAnimation);
      }
    }, 1500);

    // 4. Animate status indicators
    setTimeout(() => {
      const statusAnimation = animateStatusIndicators('.live-indicator .pulse-dot', 'processing', {
        duration: 1500,
        loop: true
      });
      if (statusAnimation) {
        this.activeAnimations.set('statusIndicators', statusAnimation);
      }
    }, 1000);

    // 5. Setup metric card interactions
    this.setupMetricCardInteractions();

    // 6. Initialize alert system animations
    this.initializeAlertSystem();
  }

  /**
   * Initialize Community Nexus animations
   */
  private initializeCommunitySection() {
    // 1. Animate community cards entrance
    setTimeout(() => {
      const cardsAnimation = animateCommunityCardsEntrance('.community-nexus .grid', {
        duration: 1000,
        stagger: 200,
        easing: 'easeOutCubic'
      });
      if (cardsAnimation) {
        this.activeAnimations.set('communityEntrance', cardsAnimation);
      }
    }, 200);

    // 2. Special pulse for Referendum card
    setTimeout(() => {
      const referendumCard = document.querySelector('[class*="referendum"]') as HTMLElement | null;
      if (referendumCard) {
        const referendumPulse = animateReferendumCardPulse(referendumCard, 'medium', {
          duration: 3000
        });
        if (referendumPulse) {
          this.activeAnimations.set('referendumPulse', referendumPulse);
        }
      }
    }, 1500);

    // 3. Community wave effect
    setTimeout(() => {
      const waveAnimation = animateCommunityWave('.community-nexus .grid', {
        duration: 1000,
        stagger: 150
      });
      if (waveAnimation) {
        this.activeAnimations.set('communityWave', waveAnimation);
      }
    }, 2000);
  }

  /**
   * Initialize Game Feed animations
   */
  private initializeGameSection() {
    // Initialize any game-specific animations here
    // This could include animations for the game iframe, player profile panel, etc.
  }

  /**
   * Setup metric card click interactions
   */
  private setupMetricCardInteractions() {
    const metricCards = document.querySelectorAll('.metric-card');
    
    metricCards.forEach(card => {
      const cardEl = card as HTMLElement;
      cardEl.addEventListener('click', () => {
        const focusAnimation = animateMetricCardFocus(cardEl, {
          duration: 600,
          easing: 'easeOutBack'
        });
        
        if (focusAnimation) {
          this.activeAnimations.set(`metricFocus-${card.id || 'unknown'}`, focusAnimation);
        }

        // Handle expansion panel if it exists
        const isExpanded = cardEl.classList.contains('expanded');
        const panelElement = document.querySelector('.metric-expansion-panel') as HTMLElement | null;
        let expansionAnimation;
        if (panelElement) {
          expansionAnimation = animateExpansionPanel(panelElement, !isExpanded);
        }
        
        if (expansionAnimation) {
          this.activeAnimations.set('expansionPanel', expansionAnimation);
        }
      });
    });
  }

  /**
   * Initialize alert system animations
   */
  private initializeAlertSystem() {
    // Animate existing alerts
    setTimeout(() => {
      const alertsAnimation = animateAlertEntrance('.smart-alerts-bar .alert-item', {
        duration: 600,
        stagger: 100,
        easing: 'easeOutBack'
      });
      if (alertsAnimation) {
        this.activeAnimations.set('alertsEntrance', alertsAnimation);
      }
    }, 300);

    // Start high priority pulse
    setTimeout(() => {
      const highPriorityPulse = animateHighPriorityPulse(
        '.alert-item[data-priority="high"], .alert-item[data-priority="critical"]',
        'high',
        { duration: 1500 }
      );
      if (highPriorityPulse) {
        this.activeAnimations.set('highPriorityPulse', highPriorityPulse);
      }
    }, 1000);

    // Start subtle shimmer effect
    setTimeout(() => {
      const shimmerAnimation = animateAlertShimmer('.alert-item', {
        duration: 2000,
        stagger: 200
      });
      if (shimmerAnimation) {
        this.activeAnimations.set('alertShimmer', shimmerAnimation);
      }
    }, 1500);
  }

  /**
   * Trigger Oracle Eye animation based on state
   */
  public animateOracleEyeState(state: 'awakening' | 'active' | 'corrupted' | 'sleeping' = 'active') {
    const eyeAnimation = animateOracleEye('.oracle-eye, .oracle-avatar', state, {
      duration: 2000,
      easing: 'easeInOutSine',
      loop: state !== 'awakening'
    });

    if (eyeAnimation) {
      this.activeAnimations.set('oracleEye', eyeAnimation);
    }
  }

  /**
   * Create wave effect across all visible cards
   */
  public triggerDashboardWave() {
    // Metrics wave
    const metricsWave = animateMetricsGridEntrance('.metrics-grid', {
      duration: 800,
      stagger: 100
    });

    // Community wave (if visible)
    const communityWave = animateCommunityWave('.community-nexus .grid', {
      duration: 1000,
      stagger: 150
    });

    if (metricsWave) {
      this.activeAnimations.set('dashboardWave-metrics', metricsWave);
    }
    if (communityWave) {
      this.activeAnimations.set('dashboardWave-community', communityWave);
    }
  }

  /**
   * Create loading state with spinner
   */
  public showLoadingState(containerSelector: string) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const spinner = createOracleLoadingSpinner(container, {
      duration: 2000,
      loop: true
    });

    if (spinner) {
      this.activeAnimations.set('loadingSpinner', spinner);
    }
  }

  /**
   * Hide loading state
   */
  public hideLoadingState() {
    const spinner = this.activeAnimations.get('loadingSpinner');
    if (spinner) {
      spinner.pause();
      this.activeAnimations.delete('loadingSpinner');
      
      // Remove spinner elements
      const spinners = document.querySelectorAll('.oracle-spinner, svg[class*="spinner"]');
      spinners.forEach(s => s.remove());
    }
  }

  /**
   * Pause all animations
   */
  public pauseAll() {
    this.activeAnimations.forEach(animation => {
      animation.pause();
    });
  }

  /**
   * Resume all animations
   */
  public resumeAll() {
    this.activeAnimations.forEach(animation => {
      animation.play();
    });
  }

  /**
   * Cleanup all animations
   */
  public cleanup() {
    this.activeAnimations.forEach(animation => {
      animation.pause();
    });
    this.activeAnimations.clear();
    this.isInitialized = false;
  }

  /**
   * Get animation status
   */
  public getStatus() {
    return {
      initialized: this.isInitialized,
      activeAnimations: Array.from(this.activeAnimations.keys()),
      animationCount: this.activeAnimations.size
    };
  }
}

// Export singleton instance
export const oracleAnimations = new OracleAnimationController(); 