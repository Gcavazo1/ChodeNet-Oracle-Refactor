import React, { useState, useEffect } from 'react';
import { CommunityGirthTracker } from '../../CommunityMetrics/CommunityGirthTracker';
import { useGirthIndexStore } from '../../../lib/girthIndexStore';
import { oracleMetricsService } from '../../../lib/oracleMetricsService';
import { useOracleAnimations } from '../dashboardAnimationsStub';
import { ProphecyChamber } from '../../ProphecyChamber/ProphecyChamber';
import { RitualRequests } from '../../RitualRequests/RitualRequests';
import { ApocryphalScrolls } from '../../ApocryphalScrolls/ApocryphalScrolls';
import { CommunityLoreInput } from '../../CommunityLoreInput/CommunityLoreInput';
import { LoreArchive } from '../../LoreArchive/LoreArchive';
import { useOracleFlowStore, useOracleLoreStore } from '../../../lib/oracleFlowStore';

// Metrics helpers (icons + status)
const getSurgeIcon = (surge: string) => {
  const map: Record<string, string> = {
    FLACCID_DRIZZLE: '💧',
    WEAK_PULSES: '💨',
    STEADY_POUNDING: '🔥',
    FRENZIED_SLAPPING: '⚡',
    MEGA_SURGE: '💥',
    GIGA_SURGE: '🌟',
    ASCENDED_NIRVANA: '✨'
  };
  return map[surge] || '🔥';
};

const getMoraleIcon = (morale: string) => {
  const map: Record<string, string> = {
    SUICIDE_WATCH: '💀',
    DEMORALIZED: '😞',
    DISGRUNTLED: '😠',
    CAUTIOUS: '😐',
    INSPIRED: '😊',
    JUBILANT: '🎉',
    FANATICAL: '🔥',
    ASCENDED: '✨'
  };
  return map[morale] || '😐';
};

const getStabilityIcon = (stability: string) => {
  const map: Record<string, string> = {
    RADIANT_CLARITY: '✨',
    PRISTINE: '🌟',
    CRYPTIC: '🔮',
    FLICKERING: '⚡',
    GLITCHED_OMINOUS: '🔥',
    FORBIDDEN_FRAGMENT: '👹'
  };
  return map[stability] || '🌟';
};

export const OracleSection: React.FC = () => {
  const animations = useOracleAnimations();

  // Core girth metrics
  const {
    girthResonance = 50,
    tapSurgeIndex = 'STEADY_POUNDING',
    legionMorale = 'CAUTIOUS',
    stabilityStatus = 'PRISTINE',
    updateMetrics
  } = useGirthIndexStore();

  // Enhanced metrics state (copied from original)
  const [enhancedMetrics, setEnhancedMetrics] = useState({
    categories: [] as any[],
    isLiveMode: false,
    lastUpdate: new Date(),
    isLoading: true,
    error: null as string | null
  });

  // Local UI state
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
  const [metricInfluences, setMetricInfluences] = useState<any>(null);
  const [loadingInfluences, setLoadingInfluences] = useState(false);
  const [judgesPanelVisible, setJudgesPanelVisible] = useState(false);

  // Subscribe to enhanced metrics service
  useEffect(() => {
    const unsubscribe = oracleMetricsService.subscribe((cats) => {
      setEnhancedMetrics((prev) => ({
        ...prev,
        categories: cats,
        isLoading: false,
        lastUpdate: new Date(),
        isLiveMode: !(oracleMetricsService as any).config?.demoMode
      }));
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  const getMetricValue = (metricType: string) => {
    if (enhancedMetrics.categories.length) {
      const category: any = enhancedMetrics.categories.find(
        (c) => c.id === metricType || c.name.toLowerCase().includes(metricType)
      );
      if (category && category.metrics.length) {
        const primary = category.metrics[0];

        let formattedValue: string | number = primary.value;
        // Legacy behaviour: round resonance to 2 decimals for nicer display
        if (metricType === 'resonance') {
          if (typeof primary.value === 'number') {
            formattedValue = primary.value.toFixed(2);
          } else if (typeof primary.value === 'string' && primary.value.includes('.')) {
            formattedValue = parseFloat(primary.value).toFixed(2);
          }
        }

        return {
          value: `${formattedValue}${primary.unit || ''}`,
          status: enhancedMetrics.isLiveMode ? 'LIVE' : 'ENHANCED'
        };
      }
    }

    const fallback: Record<string, { value: string; status: string }> = {
      resonance: { value: `${girthResonance.toFixed(2)}%`, status: 'BASIC' },
      surge: { value: tapSurgeIndex.replace(/_/g, ' '), status: 'BASIC' },
      morale: { value: legionMorale.replace(/_/g, ' '), status: 'BASIC' },
      stability: { value: stabilityStatus.replace(/_/g, ' '), status: 'BASIC' }
    };
    return fallback[metricType] || { value: 'N/A', status: 'BASIC' };
  };

  // Load detailed influence breakdown (ported from legacy)
  const getMetricInfluences = async (metricType: string) => {
    setLoadingInfluences(true);
    setMetricInfluences(null);

    try {
      if (enhancedMetrics.categories.length) {
        const category: any = enhancedMetrics.categories.find(
          (c) => c.id === metricType || c.name.toLowerCase().includes(metricType)
        );
        if (category && category.metrics.length) {
          const primary = category.metrics[0];
          let calcVal: string | number = primary.value;
          if (metricType === 'resonance') {
            if (typeof primary.value === 'number') calcVal = primary.value.toFixed(2);
            else if (typeof primary.value === 'string' && primary.value.includes('.')) calcVal = parseFloat(primary.value).toFixed(2);
          }

          const influences = {
            calculated_value: `${calcVal}${primary.unit || ''}`,
            primary_influences:
              primary.details?.breakdown?.map((item: any) => ({
                factor: item.label,
                value: `${item.value}${primary.unit || ''}`,
                description: `Contributing ${item.percentage}% to overall ${category.name.toLowerCase()}`
              })) || [],
            next_threshold: `Next milestone at ${Math.ceil((primary.value + 10) / 10) * 10}${primary.unit || ''}`,
            data_source: enhancedMetrics.isLiveMode ? 'Real-time Oracle data' : 'Demo data',
            last_updated: enhancedMetrics.lastUpdate.toLocaleTimeString()
          };
          setMetricInfluences(influences);
          return;
        }
      }

      // fallback
      setMetricInfluences({
        calculated_value: getMetricValue(metricType).value,
        primary_influences: [],
        next_threshold: 'Unknown'
      });
    } catch (err) {
      console.error('Failed to load influences:', err);
      setMetricInfluences({
        calculated_value: getMetricValue(metricType).value,
        primary_influences: [],
        next_threshold: 'Unknown'
      });
    } finally {
      setLoadingInfluences(false);
    }
  };

  const handleMetricClick = async (metric: string) => {
    setExpandedMetric(expandedMetric === metric ? null : metric);
    if (expandedMetric === metric) return;
    await getMetricInfluences(metric);
  };

  const { prophecyActiveTab, switchToProphecyTab } = useOracleFlowStore();
  const { loreActiveTab, switchToLoreTab } = useOracleLoreStore();

  return (
    <div className="section-content oracle-sanctum">
      {/* ROW 1: Oracle Metrics */}
      <div className="oracle-modal-row">
        <div className="oracle-modal metrics-modal">
          <div className="modal-header">
            <h3>🔮 Oracle Metrics (ENHANCED)</h3>
            <div className="metrics-status-bar">
              <div className={`live-indicator ${enhancedMetrics.isLiveMode ? 'live' : 'demo'}`}>
                <span className="pulse-dot"></span>
                {enhancedMetrics.isLiveMode ? 'LIVE DATA' : 'DEMO MODE'}
              </div>
              <div className="status-details">
                <span className="last-update">Updated: {enhancedMetrics.lastUpdate.toLocaleTimeString()}</span>
                {enhancedMetrics.isLoading && <span className="loading-indicator">⟳ Loading...</span>}
                {enhancedMetrics.error && <span className="error-indicator">⚠ {enhancedMetrics.error}</span>}
              </div>
            </div>
          </div>

          <div className="metrics-grid">
            {/* Resonance */}
            <div
              className={`oracle-metric-card${expandedMetric === 'resonance' ? ' expanded' : ''}`}
              onClick={(e) => {
                handleMetricClick('resonance');
                animations.createMetricCardRipple(e.currentTarget, e.clientX, e.clientY);
              }}
              onMouseEnter={(e) => animations.animateMetricCardFocus(e.currentTarget)}
              onMouseLeave={(e) => animations.animateMetricCardBlur(e.currentTarget)}
            >
              <div className="oracle-metric-content">
                <div className="metric-label">
                  Divine Resonance
                  <span className={`metric-status-badge ${getMetricValue('resonance').status.toLowerCase()}`}>{getMetricValue('resonance').status}</span>
                </div>
                <div className="metric-value primary">{getMetricValue('resonance').value}</div>
                <div className="metric-bar">
                  <div className="metric-fill resonance" style={{ width: `${girthResonance}%` }} />
                </div>
                <div className="metric-expand-hint">Click for enhanced details</div>
              </div>
            </div>

            {/* Surge */}
            <div
              className={`oracle-metric-card${expandedMetric === 'surge' ? ' expanded' : ''}`}
              onClick={(e) => {
                handleMetricClick('surge');
                animations.createMetricCardRipple(e.currentTarget, e.clientX, e.clientY);
              }}
              onMouseEnter={(e) => animations.animateMetricCardFocus(e.currentTarget)}
              onMouseLeave={(e) => animations.animateMetricCardBlur(e.currentTarget)}
            >
              <div className="oracle-metric-content">
                <div className="metric-label">
                  Tap Surge
                  <span className={`metric-status-badge ${getMetricValue('surge').status.toLowerCase()}`}>{getMetricValue('surge').status}</span>
                </div>
                <div className="metric-value surge">{getMetricValue('surge').value}</div>
                <div className="metric-status">{getSurgeIcon(tapSurgeIndex)}</div>
                <div className="metric-expand-hint">Click for enhanced details</div>
              </div>
            </div>

            {/* Morale */}
            <div
              className={`oracle-metric-card${expandedMetric === 'morale' ? ' expanded' : ''}`}
              onClick={(e) => {
                handleMetricClick('morale');
                animations.createMetricCardRipple(e.currentTarget, e.clientX, e.clientY);
              }}
              onMouseEnter={(e) => animations.animateMetricCardFocus(e.currentTarget)}
              onMouseLeave={(e) => animations.animateMetricCardBlur(e.currentTarget)}
            >
              <div className="oracle-metric-content">
                <div className="metric-label">
                  Legion Morale
                  <span className={`metric-status-badge ${getMetricValue('morale').status.toLowerCase()}`}>{getMetricValue('morale').status}</span>
                </div>
                <div className="metric-value morale">{getMetricValue('morale').value}</div>
                <div className="metric-status">{getMoraleIcon(legionMorale)}</div>
                <div className="metric-expand-hint">Click for enhanced details</div>
              </div>
            </div>

            {/* Stability */}
            <div
              className={`oracle-metric-card${expandedMetric === 'stability' ? ' expanded' : ''}`}
              onClick={(e) => {
                handleMetricClick('stability');
                animations.createMetricCardRipple(e.currentTarget, e.clientX, e.clientY);
              }}
              onMouseEnter={(e) => animations.animateMetricCardFocus(e.currentTarget)}
              onMouseLeave={(e) => animations.animateMetricCardBlur(e.currentTarget)}
            >
              <div className="oracle-metric-content">
                <div className="metric-label">
                  Oracle Stability
                  <span className={`metric-status-badge ${getMetricValue('stability').status.toLowerCase()}`}>{getMetricValue('stability').status}</span>
                </div>
                <div className="metric-value stability">{getMetricValue('stability').value}</div>
                <div className="metric-status">{getStabilityIcon(stabilityStatus)}</div>
                <div className="metric-expand-hint">Click for enhanced details</div>
              </div>
            </div>
          </div>

          {/* Expanded Metric View */}
          {expandedMetric && (
            <div className="metric-expansion-panel">
              <div className="expansion-header">
                <h4>🔍 {expandedMetric.charAt(0).toUpperCase() + expandedMetric.slice(1)} Analysis</h4>
                <button className="close-expansion" onClick={() => setExpandedMetric(null)}>✕</button>
              </div>

              {loadingInfluences ? (
                <div className="expansion-content">
                  <div className="loading-influences">
                    <div className="cosmic-spinner">🔮</div>
                    <p>Oracle analyzing influences...</p>
                  </div>
                </div>
              ) : !metricInfluences ? (
                <div className="expansion-content">
                  <div className="no-influences">
                    <p>No influence data available</p>
                  </div>
                </div>
              ) : (
                <div className="expansion-content">
                  <div className="current-state">
                    <div className="state-title">Current State</div>
                    <div className="state-value">{metricInfluences.calculated_value}</div>
                  </div>

                  <div className="influences-section">
                    <h5>Active Influences</h5>
                    <div className="influences-list">
                      {metricInfluences.primary_influences && metricInfluences.primary_influences.length > 0 ? (
                        metricInfluences.primary_influences.map((inf: any, idx: number) => (
                          <div key={idx} className="influence-item">
                            <div className="influence-header">
                              <span className="influence-factor">{inf.factor}</span>
                              <span className="influence-value">{inf.value}</span>
                            </div>
                            <div className="influence-description">{inf.description}</div>
                          </div>
                        ))
                      ) : (
                        <div className="no-influences-message">
                          <p>🔮 No active influences detected. The Oracle awaits player activity...</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="threshold-section">
                    <h5>Next Threshold</h5>
                    <div className="threshold-item">
                      <div className="threshold-name">{metricInfluences.next_threshold || 'Unknown'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Community girth tracker under metrics */}
          <div className="mt-6">
            <CommunityGirthTracker />
          </div>
        </div>
      </div>

      {/* ROW 2: Prophecy & Lore Systems (side-by-side) */}
      <div className="oracle-modal-row">
              {/* === PROPHECY MODAL === */}
              <div className="oracle-modal prophecy-modal">
                <div className="modal-header">
                  <h3>⚡ Oracle Prophecy System</h3>
                  <div className="prophecy-tabs">
                    <button 
                      className={`gradient-hover-tab${prophecyActiveTab === 'ritual' ? ' active' : ''}`}
                      onClick={() => switchToProphecyTab('ritual')}
                    >
                      <span className="tab-content">🎯 Ritual Requests</span>
                    </button>
                    <button 
                      className={`gradient-hover-tab${prophecyActiveTab === 'chamber' ? ' active' : ''}`}
                      onClick={() => switchToProphecyTab('chamber')}
                    >
                      <span className="tab-content">🔮 Prophecy Chamber</span>
                    </button>
                    <button 
                      className={`gradient-hover-tab${prophecyActiveTab === 'scrolls' ? ' active' : ''}`}
                      onClick={() => switchToProphecyTab('scrolls')}
                    >
                      <span className="tab-content">📜 Scrolls Feed</span>
                    </button>
                    <button 
                      className="gradient-hover-tab"
                      onClick={() => {
                        const event = new CustomEvent('openRitualLab');
                        window.dispatchEvent(event);
                      }}
                    >
                      <span className="tab-content">⚗️ Ritual Lab</span>
                    </button>
                  </div>
                </div>
                
                <div className="prophecy-content">
                  {prophecyActiveTab === 'ritual' && (
                    <RitualRequests />
                  )}
                  
                  {prophecyActiveTab === 'chamber' && (
                    <ProphecyChamber />
                  )}
                  
                  {prophecyActiveTab === 'scrolls' && (
                    <ApocryphalScrolls />
                  )}
                </div>
              </div>

              {/* === LORE MODAL === */}
              <div className="oracle-modal lore-modal">
                <div className="modal-header">
                  <h3>📖 Oracle Lore System</h3>
                  <div className="prophecy-tabs">
                    <button
                      className={`gradient-hover-tab${loreActiveTab === 'lore' ? ' active' : ''}`}
                      onClick={() => switchToLoreTab('lore')}
                    >
                      <span className="tab-content">📝 Lore Input</span>
                    </button>
                    <button
                      className={`gradient-hover-tab${loreActiveTab === 'archive' ? ' active' : ''}`}
                      onClick={() => switchToLoreTab('archive')}
                    >
                      <span className="tab-content">📚 Lore Archive</span>
                    </button>
                  </div>
                </div>

                <div className="prophecy-content">
                  {loreActiveTab === 'lore' && (
                    <CommunityLoreInput />
                  )}
                  {loreActiveTab === 'archive' && (
                    <LoreArchive />
                  )}
                </div>
              </div>
            </div>

      {/* ROW 3: Judges Panel */}
      <div className="oracle-modal-row mt-8">
        <div className="oracle-modal judges-modal">
          <div
            className="modal-header judges-header"
            onClick={() => setJudgesPanelVisible((v) => !v)}
            style={{ cursor: 'pointer' }}
          >
            <h3>⚖️ Judges Control Panel</h3>
            <button className="collapse-toggle">{judgesPanelVisible ? '▼ Hide' : '▶ Show'}</button>
          </div>

          {judgesPanelVisible && (
            <div className="judges-content p-4 bg-slate-900/70 rounded-b-xl">
              <div className="compact-metrics-controls space-y-4">
                <div className="control-row grid md:grid-cols-2 gap-4">
                  <div className="control-group flex flex-col">
                    <label className="mb-1">Resonance: {girthResonance}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={girthResonance}
                      onChange={(e) => updateMetrics({ girthResonance: parseInt(e.target.value) })}
                      className="compact-slider"
                    />
                  </div>

                  <div className="control-group flex flex-col">
                    <label className="mb-1">Tap Surge</label>
                    <select
                      value={tapSurgeIndex}
                      onChange={(e) => updateMetrics({ tapSurgeIndex: e.target.value as any })}
                      className="compact-select"
                    >
                      {['FLACCID_DRIZZLE','WEAK_PULSES','STEADY_POUNDING','FRENZIED_SLAPPING','MEGA_SURGE','GIGA_SURGE','ASCENDED_NIRVANA'].map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="control-row grid md:grid-cols-2 gap-4">
                  <div className="control-group flex flex-col">
                    <label className="mb-1">Legion Morale</label>
                    <select
                      value={legionMorale}
                      onChange={(e) => updateMetrics({ legionMorale: e.target.value as any })}
                      className="compact-select"
                    >
                      {['SUICIDE_WATCH','DEMORALIZED','DISGRUNTLED','CAUTIOUS','INSPIRED','JUBILANT','FANATICAL','ASCENDED'].map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="control-group flex flex-col">
                    <label className="mb-1">Oracle Stability</label>
                    <select
                      value={stabilityStatus}
                      onChange={(e) => updateMetrics({ stabilityStatus: e.target.value as any })}
                      className="compact-select"
                    >
                      {['RADIANT_CLARITY','PRISTINE','CRYPTIC','FLICKERING','GLITCHED_OMINOUS','FORBIDDEN_FRAGMENT'].map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 