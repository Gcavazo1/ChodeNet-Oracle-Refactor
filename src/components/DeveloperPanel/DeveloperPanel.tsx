import React, { useState, useEffect } from 'react';
import { type StabilityStatus } from '../../lib/types';
import { GhostScript } from '../../lib/ghostScript';
import { Play, Square, Settings, Users, Clock, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { oracleBackend } from '../../lib/oracleBackendIntegration';
import './DeveloperPanel.css';

interface DeveloperPanelProps {
  girthResonance: number;
  tapSurgeIndex: string;
  legionMorale: string;
  stabilityStatus: StabilityStatus;
  onGirthChange: (value: number) => void;
  onTapSurgeChange: (value: string) => void;
  onMoraleChange: (value: string) => void;
  onStabilityChange: (value: StabilityStatus) => void;
}

interface GhostLegionConfig {
  durationSeconds: number;
  playerCount: number;
  eventIntensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  autoTriggerSpecialReport: boolean;
}

interface SystemStatus {
  supabaseConfigured: boolean;
  rateLimitStatus: 'OK' | 'WARNING' | 'CRITICAL';
  lastAggregationTime: Date | null;
}

const TAP_SURGE_OPTIONS = [
  'FLACCID_DRIZZLE',
  'WEAK_PULSES',
  'STEADY_POUNDING',
  'FRENZIED_SLAPPING',
  'MEGA_SURGE',
  'GIGA_SURGE',
  'ASCENDED_NIRVANA'
];

const LEGION_MORALE_OPTIONS = [
  'SUICIDE_WATCH',
  'DEMORALIZED',
  'DISGRUNTLED',
  'CAUTIOUS',
  'INSPIRED',
  'JUBILANT',
  'FANATICAL',
  'ASCENDED'
];

const STABILITY_OPTIONS = [
  'RADIANT_CLARITY',
  'PRISTINE',
  'FLICKERING',
  'UNSTABLE',
  'CRITICAL_CORRUPTION',
  'DATA_DAEMON_POSSESSION'
];

const INTENSITY_CONFIGS = {
  LOW: { eventsPerSecond: 0.5, description: 'Gentle tapping simulation' },
  MEDIUM: { eventsPerSecond: 1, description: 'Standard activity simulation' },
  HIGH: { eventsPerSecond: 2, description: 'Intense gameplay simulation' },
  EXTREME: { eventsPerSecond: 5, description: 'Chaos mode simulation' }
};

export const DeveloperPanel: React.FC<DeveloperPanelProps> = ({
  girthResonance,
  tapSurgeIndex,
  legionMorale,
  stabilityStatus,
  onGirthChange,
  onTapSurgeChange,
  onMoraleChange,
  onStabilityChange
}) => {
  const [ghostScript] = useState(() => new GhostScript());
  const [simulationStatus, setSimulationStatus] = useState<string>('');
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    supabaseConfigured: false,
    rateLimitStatus: 'OK',
    lastAggregationTime: null
  });
  const [ghostConfig, setGhostConfig] = useState<GhostLegionConfig>({
    durationSeconds: 30,
    playerCount: 5,
    eventIntensity: 'MEDIUM',
    autoTriggerSpecialReport: true
  });
  const [rateLimitStatus, setRateLimitStatus] = useState({
    eventsInWindow: 0,
    maxEvents: 180,
    windowResetIn: 60
  });
  const [oracleTestResult, setOracleTestResult] = useState<any>(null);
  const [testingOracle, setTestingOracle] = useState(false);
  
  useEffect(() => {
    let statusInterval: number;
    
    if (ghostScript.isSimulationRunning()) {
      statusInterval = window.setInterval(() => {
        const remaining = ghostScript.getRemainingTime();
        setRemainingTime(remaining);
        
        if (remaining > 0) {
          const minutes = Math.floor(remaining / 60);
          const seconds = remaining % 60;
          const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
          
          setSimulationStatus(`👻 Ghost Legion Active - ${timeStr} remaining`);
        } else {
          setSimulationStatus('Simulation Complete. Oracle is now Pondering a Special Report...');
          setRemainingTime(0);
          clearInterval(statusInterval);
        }
      }, 1000);
    }

    return () => {
      if (statusInterval) clearInterval(statusInterval);
    };
  }, [ghostScript]);

  // System status monitoring
  useEffect(() => {
    const checkSystemStatus = () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const rateLimitStatus = ghostScript.getRateLimitStatus();
      let rateLimitLevel: 'OK' | 'WARNING' | 'CRITICAL' = 'OK';
      
      if (rateLimitStatus.eventsInWindow > rateLimitStatus.maxEvents * 0.8) {
        rateLimitLevel = 'WARNING';
      }
      if (rateLimitStatus.eventsInWindow >= rateLimitStatus.maxEvents) {
        rateLimitLevel = 'CRITICAL';
      }

      setSystemStatus({
        supabaseConfigured: !!(supabaseUrl && anonKey),
        rateLimitStatus: rateLimitLevel,
        lastAggregationTime: new Date() // This would be updated from actual API calls
      });
    };

    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [ghostScript]);

  const handleTapSurgeChange = (value: string) => {
    console.log('[DevPanel] Tap Surge Index changed to:', value);
    onTapSurgeChange(value);
  };

  const handleMoraleChange = (value: string) => {
    console.log('[DevPanel] Legion Morale changed to:', value);
    onMoraleChange(value);
  };

  const handleStabilityChange = (value: StabilityStatus) => {
    console.log('[DevPanel] Oracle Stability changed to:', value);
    onStabilityChange(value);
  };

  const handleGhostLegionClick = () => {
    if (!ghostScript.isSimulationRunning()) {
      console.log('[DevPanel] Starting Ghost Legion with config:', ghostConfig);
      ghostScript.startSimulation(ghostConfig.durationSeconds, {
        playerCount: ghostConfig.playerCount,
        eventIntensity: ghostConfig.eventIntensity,
        autoTriggerSpecialReport: ghostConfig.autoTriggerSpecialReport
      });
      setRemainingTime(ghostConfig.durationSeconds);
    } else {
      console.log('[DevPanel] Stopping Ghost Legion simulation');
      ghostScript.stopSimulation();
      setSimulationStatus('Simulation stopped manually');
      setRemainingTime(0);
    }
  };

  const handleTriggerAggregation = async () => {
    try {
      setSimulationStatus('Triggering manual aggregation...');
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('VITE_SUPABASE_URL environment variable not configured');
      }
      
      const response = await fetch(`${supabaseUrl}/functions/v1/aggregate-game-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          trigger_type: 'manual_dev_panel',
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        setSimulationStatus(`✅ Aggregation complete! Processed ${result.eventsProcessed || 0} events`);
        setTimeout(() => setSimulationStatus(''), 3000);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to trigger aggregation:', error);
      setSimulationStatus(`❌ Aggregation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setSimulationStatus(''), 3000);
    }
  };

  const isSimulationRunning = ghostScript.isSimulationRunning();
  const progressPercentage = ghostConfig.durationSeconds > 0 
    ? ((ghostConfig.durationSeconds - remainingTime) / ghostConfig.durationSeconds) * 100 
    : 0;

  // === ORACLE TESTING ===
  const testOracleIntegration = async () => {
    setTestingOracle(true);
    setOracleTestResult(null);
    
    try {
      console.log('🔮 Testing Oracle backend integration...');
      
      const sessionId = 'test_session_' + Date.now();
      const result = await oracleBackend.processPlayerSession(sessionId);
      
      setOracleTestResult(result);
      
      if (result.success) {
        console.log('✅ Oracle integration test successful!');
        console.log('📊 Calculated metrics:', result.metrics);
        console.log('🔍 Influence details:', result.influences);
      } else {
        console.error('❌ Oracle integration test failed');
      }
      
    } catch (error) {
      console.error('🔮 Oracle test error:', error);
      setOracleTestResult({
        success: false,
        error: error.message,
        metrics: null,
        influences: null
      });
    } finally {
      setTestingOracle(false);
    }
  };

  return (
    <div className="dev-panel">
      <div className="dev-panel-header">
        <h2>Developer Controls</h2>
        <div className="panel-status">ORACLE SIMULATION CONTROLS</div>
      </div>

      {/* System Status Display */}
      <div className="system-status-section">
        <div className="status-indicators">
          <div className={`status-indicator ${systemStatus.supabaseConfigured ? 'status-ok' : 'status-error'}`}>
            {systemStatus.supabaseConfigured ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            <span>Supabase: {systemStatus.supabaseConfigured ? 'Connected' : 'Not Configured'}</span>
          </div>
          <div className={`status-indicator status-${systemStatus.rateLimitStatus.toLowerCase()}`}>
            {systemStatus.rateLimitStatus === 'OK' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            <span>Rate Limit: {systemStatus.rateLimitStatus}</span>
          </div>
        </div>
      </div>
      
      {/* Ghost Legion Simulation Controls */}
      <div className="ghost-legion-section">
        <div className="section-header">
          <h3>👻 Ghost Legion Simulator</h3>
          <button 
            className="config-button"
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            title="Configure simulation parameters"
          >
            <Settings size={16} />
          </button>
        </div>

        {isConfigOpen && (
          <div className="ghost-config">
            <div className="config-row">
              <label>
                <Clock size={16} />
                Duration (seconds):
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={ghostConfig.durationSeconds}
                  onChange={(e) => setGhostConfig(prev => ({ 
                    ...prev, 
                    durationSeconds: parseInt(e.target.value) || 30 
                  }))}
                />
              </label>
            </div>
            
            <div className="config-row">
              <label>
                <Users size={16} />
                Simulated Players:
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={ghostConfig.playerCount}
                  onChange={(e) => setGhostConfig(prev => ({ 
                    ...prev, 
                    playerCount: parseInt(e.target.value) || 5 
                  }))}
                />
              </label>
            </div>
            
            <div className="config-row">
              <label>
                <Zap size={16} />
                Intensity:
                <select
                  value={ghostConfig.eventIntensity}
                  onChange={(e) => setGhostConfig(prev => ({ 
                    ...prev, 
                    eventIntensity: e.target.value as any 
                  }))}
                >
                  {Object.entries(INTENSITY_CONFIGS).map(([key, config]) => (
                    <option key={key} value={key}>
                      {key} - {config.description}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            
            <div className="config-row">
              <label>
                <input
                  type="checkbox"
                  checked={ghostConfig.autoTriggerSpecialReport}
                  onChange={(e) => setGhostConfig(prev => ({ 
                    ...prev, 
                    autoTriggerSpecialReport: e.target.checked 
                  }))}
                />
                Auto-trigger Special Report after simulation
              </label>
            </div>
          </div>
        )}

        <div className="ghost-controls">
          <button 
            className={`ghost-button ${isSimulationRunning ? 'running' : 'ready'}`}
            onClick={handleGhostLegionClick}
            disabled={false}
          >
            {isSimulationRunning ? (
              <>
                <Square size={20} />
                Stop Ghost Legion
              </>
            ) : (
              <>
                <Play size={20} />
                Deploy Ghost Legion ({ghostConfig.durationSeconds}s)
              </>
            )}
          </button>

          <button 
            className="aggregate-button"
            onClick={handleTriggerAggregation}
            disabled={isSimulationRunning}
            title="Manually trigger processing of live events"
          >
            <Zap size={16} />
            Process Events Now
          </button>
        </div>

        {isSimulationRunning && (
          <div className="simulation-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="progress-text">
              {Math.round(progressPercentage)}% complete - {remainingTime}s remaining
            </div>
            <div className="rate-limit-status">
              {(() => {
                const rateLimitStatus = ghostScript.getRateLimitStatus();
                return `Events: ${rateLimitStatus.eventsInWindow}/${rateLimitStatus.maxEvents} | Window resets in: ${rateLimitStatus.windowResetIn}s`;
              })()}
            </div>
          </div>
        )}

        {simulationStatus && (
          <div className="simulation-status">
            {simulationStatus}
          </div>
        )}
      </div>

      {/* Manual Girth Index Controls */}
      <div className="controls-container">
        <div className="control-group">
          <label htmlFor="girth-resonance">Divine Girth Resonance (%): {girthResonance}</label>
          <div className="slider-container">
            <input
              type="range"
              id="girth-resonance"
              min="0"
              max="100"
              value={girthResonance}
              onChange={(e) => onGirthChange(parseInt(e.target.value))}
              className="cyber-slider"
            />
            <div className="slider-buttons">
              <button onClick={() => onGirthChange(Math.max(0, girthResonance - 10))}>-10</button>
              <button onClick={() => onGirthChange(Math.min(100, girthResonance + 10))}>+10</button>
            </div>
          </div>
        </div>
        
        <div className="control-group">
          <label>Tap Surge Index:</label>
          <div className="button-grid">
            {TAP_SURGE_OPTIONS.map((option) => (
              <button
                key={option}
                className={`state-button ${tapSurgeIndex === option ? 'active' : ''}`}
                onClick={() => handleTapSurgeChange(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        
        <div className="control-group">
          <label>Legion Morale:</label>
          <div className="button-grid">
            {LEGION_MORALE_OPTIONS.map((option) => (
              <button
                key={option}
                className={`state-button ${legionMorale === option ? 'active' : ''}`}
                onClick={() => handleMoraleChange(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        
        <div className="control-group">
          <label>Oracle System Stability:</label>
          <div className="button-grid">
            {STABILITY_OPTIONS.map((option) => (
              <button
                key={option}
                className={`state-button ${stabilityStatus === option ? 'active' : ''}`}
                onClick={() => handleStabilityChange(option as StabilityStatus)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* === ORACLE TESTING SECTION === */}
      <div className="dev-section">
        <div className="section-header">
          <h3>🔮 Oracle Backend Integration</h3>
          <div className="section-description">
            Test the real Oracle scaling system with live database data
          </div>
        </div>
        
        <div className="oracle-test-controls">
          <button 
            onClick={testOracleIntegration}
            disabled={testingOracle}
            className={`action-btn ${testingOracle ? 'loading' : ''}`}
          >
            {testingOracle ? '🔮 Calculating...' : '🔮 Test Oracle Integration'}
          </button>
        </div>
        
        {oracleTestResult && (
          <div className={`oracle-test-results ${oracleTestResult.success ? 'success' : 'error'}`}>
            <div className="result-header">
              <span className={`status-icon ${oracleTestResult.success ? 'success' : 'error'}`}>
                {oracleTestResult.success ? '✅' : '❌'}
              </span>
              <span className="result-title">
                {oracleTestResult.success ? 'Oracle Integration Successful' : 'Oracle Test Failed'}
              </span>
            </div>
            
            {oracleTestResult.success ? (
              <div className="metrics-display">
                <div className="metric-row">
                  <span className="metric-label">Divine Resonance:</span>
                  <span className="metric-value">{oracleTestResult.metrics.divine_resonance}%</span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Tap Surge:</span>
                  <span className="metric-value">{oracleTestResult.metrics.tap_surge_index}</span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Legion Morale:</span>
                  <span className="metric-value">{oracleTestResult.metrics.legion_morale}</span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Oracle Stability:</span>
                  <span className="metric-value">{oracleTestResult.metrics.oracle_stability}</span>
                </div>
                
                {oracleTestResult.influences?.player_activity && (
                  <div className="activity-summary">
                    <div className="summary-title">Activity Data:</div>
                    <div className="activity-stats">
                      🎯 {oracleTestResult.influences.player_activity.taps_per_minute} taps/min • 
                      🏆 {oracleTestResult.influences.player_activity.achievements_unlocked} achievements • 
                      👥 {oracleTestResult.influences.community_activity?.total_active_players || 0} active players
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="error-display">
                <div className="error-message">{oracleTestResult.error}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};