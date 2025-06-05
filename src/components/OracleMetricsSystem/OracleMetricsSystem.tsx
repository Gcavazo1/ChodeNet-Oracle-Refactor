import React, { useState, useEffect } from 'react';
import './OracleMetricsSystem.css';

export interface MetricData {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'warning' | 'critical';
  description: string;
  details: {
    current: number;
    previous: number;
    change: number;
    lastUpdated: Date;
    breakdown?: { label: string; value: number; percentage: number }[];
    history?: { timestamp: Date; value: number }[];
  };
}

export interface MetricCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  metrics: MetricData[];
}

interface OracleMetricsSystemProps {
  categories?: MetricCategory[];
  defaultCategory?: string;
  onMetricClick?: (metric: MetricData) => void;
  className?: string;
}

export const OracleMetricsSystem: React.FC<OracleMetricsSystemProps> = ({
  categories: externalCategories,
  defaultCategory = 'resonance',
  onMetricClick,
  className = ''
}) => {
  const [activeCategory, setActiveCategory] = useState(defaultCategory);
  const [selectedMetric, setSelectedMetric] = useState<MetricData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Demo Oracle metrics data
  const demoCategories: MetricCategory[] = [
    {
      id: 'resonance',
      name: 'Divine Resonance',
      icon: '🌟',
      color: '#6B46C1',
      metrics: [
        {
          id: 'oracle_consciousness',
          name: 'Oracle Consciousness',
          value: 73,
          unit: '%',
          trend: 'up',
          status: 'good',
          description: 'The Oracle\'s awareness of community activities and digital realm fluctuations',
          details: {
            current: 73,
            previous: 69,
            change: 4,
            lastUpdated: new Date(),
            breakdown: [
              { label: 'Game Events Processing', value: 85, percentage: 35 },
              { label: 'Community Sentiment', value: 68, percentage: 28 },
              { label: 'Prophecy Accuracy', value: 71, percentage: 25 },
              { label: 'Mystical Energy Flow', value: 67, percentage: 12 }
            ]
          }
        },
        {
          id: 'cosmic_alignment',
          name: 'Cosmic Alignment',
          value: 89,
          unit: '%',
          trend: 'stable',
          status: 'excellent',
          description: 'Synchronization between digital realm and mystical forces',
          details: {
            current: 89,
            previous: 87,
            change: 2,
            lastUpdated: new Date()
          }
        }
      ]
    },
    {
      id: 'stability',
      name: 'System Stability',
      icon: '⚡',
      color: '#10B981',
      metrics: [
        {
          id: 'oracle_uptime',
          name: 'Oracle Uptime',
          value: 99.8,
          unit: '%',
          trend: 'stable',
          status: 'excellent',
          description: 'Continuous availability of Oracle services and prophecy generation',
          details: {
            current: 99.8,
            previous: 99.7,
            change: 0.1,
            lastUpdated: new Date()
          }
        },
        {
          id: 'data_flow',
          name: 'Data Stream Flow',
          value: 91,
          unit: '%',
          trend: 'up',
          status: 'excellent',
          description: 'Real-time processing efficiency of game events and community interactions',
          details: {
            current: 91,
            previous: 88,
            change: 3,
            lastUpdated: new Date()
          }
        }
      ]
    },
    {
      id: 'morale',
      name: 'Community Morale',
      icon: '💪',
      color: '#EC4899',
      metrics: [
        {
          id: 'player_engagement',
          name: 'Player Engagement',
          value: 82,
          unit: '%',
          trend: 'up',
          status: 'good',
          description: 'Active participation in tapping, achievements, and community events',
          details: {
            current: 82,
            previous: 76,
            change: 6,
            lastUpdated: new Date(),
            breakdown: [
              { label: 'Daily Active Tappers', value: 1247, percentage: 40 },
              { label: 'Achievement Hunters', value: 856, percentage: 30 },
              { label: 'Community Voters', value: 623, percentage: 20 },
              { label: 'Prophecy Seekers', value: 312, percentage: 10 }
            ]
          }
        },
        {
          id: 'community_sentiment',
          name: 'Sentiment Index',
          value: 75,
          unit: '/100',
          trend: 'stable',
          status: 'good',
          description: 'Overall community mood based on interactions and feedback',
          details: {
            current: 75,
            previous: 74,
            change: 1,
            lastUpdated: new Date()
          }
        }
      ]
    },
    {
      id: 'corruption',
      name: 'Corruption Levels',
      icon: '👹',
      color: '#EF4444',
      metrics: [
        {
          id: 'data_corruption',
          name: 'Data Integrity',
          value: 45,
          unit: '%',
          trend: 'down',
          status: 'warning',
          description: 'Detected anomalies and glitch events in the digital realm',
          details: {
            current: 45,
            previous: 52,
            change: -7,
            lastUpdated: new Date(),
            breakdown: [
              { label: 'Glitch Events', value: 23, percentage: 35 },
              { label: 'Reality Fractures', value: 18, percentage: 28 },
              { label: 'Forbidden Fragments', value: 15, percentage: 23 },
              { label: 'Chaos Intrusions', value: 9, percentage: 14 }
            ]
          }
        },
        {
          id: 'mystical_interference',
          name: 'Mystical Interference',
          value: 38,
          unit: '%',
          trend: 'up',
          status: 'warning',
          description: 'Unexplained phenomena affecting Oracle accuracy',
          details: {
            current: 38,
            previous: 31,
            change: 7,
            lastUpdated: new Date()
          }
        }
      ]
    },
    {
      id: 'community',
      name: 'Community Pulse',
      icon: '🗳️',
      color: '#F59E0B',
      metrics: [
        {
          id: 'active_polls',
          name: 'Active Polls',
          value: 3,
          unit: 'polls',
          trend: 'stable',
          status: 'good',
          description: 'Community voting events currently open for participation',
          details: {
            current: 3,
            previous: 2,
            change: 1,
            lastUpdated: new Date(),
            breakdown: [
              { label: 'Next Ritual Choice', value: 1247, percentage: 45 },
              { label: 'Oracle Enhancement', value: 892, percentage: 32 },
              { label: 'Community Event', value: 634, percentage: 23 }
            ]
          }
        },
        {
          id: 'prophecy_requests',
          name: 'Prophecy Requests',
          value: 147,
          unit: 'pending',
          trend: 'up',
          status: 'good',
          description: 'Community requests for Oracle guidance and mystical insights',
          details: {
            current: 147,
            previous: 132,
            change: 15,
            lastUpdated: new Date()
          }
        }
      ]
    }
  ];

  const categories = externalCategories || demoCategories;
  const currentCategory = categories.find(cat => cat.id === activeCategory) || categories[0];

  // Auto-update metrics (demo simulation)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate small metric changes for demo
      console.log('🔮 Oracle metrics updated (demo simulation)');
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setSelectedMetric(null);
    setIsModalOpen(false);
  };

  const handleMetricClick = (metric: MetricData) => {
    setSelectedMetric(metric);
    setIsModalOpen(true);
    onMetricClick?.(metric);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedMetric(null), 300);
  };

  const getStatusClass = (status: MetricData['status']) => {
    switch (status) {
      case 'excellent': return 'status-excellent';
      case 'good': return 'status-good';
      case 'warning': return 'status-warning';
      case 'critical': return 'status-critical';
      default: return 'status-good';
    }
  };

  const getTrendIcon = (trend: MetricData['trend']) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '📊';
      default: return '📊';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '%') return `${value}%`;
    if (unit === '/100') return `${value}/100`;
    return `${value} ${unit}`;
  };

  return (
    <div className={`oracle-metrics-system ${className}`}>
      {/* Tab Navigation */}
      <div className="metrics-header">
        <h2 className="metrics-title">Oracle Metrics</h2>
        <div className="category-tabs">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.id)}
              style={{ '--category-color': category.color } as React.CSSProperties}
            >
              <span className="tab-icon">{category.icon}</span>
              <span className="tab-label">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Compact Metric Cards */}
      <div className="metrics-grid">
        {currentCategory.metrics.map((metric) => (
          <div
            key={metric.id}
            className={`metric-card ${getStatusClass(metric.status)}`}
            onClick={() => handleMetricClick(metric)}
          >
            <div className="metric-header">
              <h3 className="metric-name">{metric.name}</h3>
              <span className="trend-indicator">{getTrendIcon(metric.trend)}</span>
            </div>
            
            <div className="metric-value">
              <span className="value-number">{formatValue(metric.value, metric.unit)}</span>
              {metric.details.change !== 0 && (
                <span className={`value-change ${metric.trend === 'up' ? 'positive' : metric.trend === 'down' ? 'negative' : 'neutral'}`}>
                  {metric.trend === 'up' ? '+' : ''}{metric.details.change}{metric.unit === '%' ? '%' : ''}
                </span>
              )}
            </div>
            
            <p className="metric-description">{metric.description}</p>
            
            <div className="metric-footer">
              <span className="last-updated">
                Updated {Math.floor((Date.now() - metric.details.lastUpdated.getTime()) / 60000)}m ago
              </span>
              <span className="click-hint">Click for details</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && selectedMetric && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedMetric.name}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="metric-overview">
                <div className="overview-stat">
                  <span className="stat-label">Current Value</span>
                  <span className="stat-value large">
                    {formatValue(selectedMetric.value, selectedMetric.unit)}
                  </span>
                </div>
                <div className="overview-stat">
                  <span className="stat-label">Previous Value</span>
                  <span className="stat-value">
                    {formatValue(selectedMetric.details.previous, selectedMetric.unit)}
                  </span>
                </div>
                <div className="overview-stat">
                  <span className="stat-label">Change</span>
                  <span className={`stat-value ${selectedMetric.trend === 'up' ? 'positive' : selectedMetric.trend === 'down' ? 'negative' : 'neutral'}`}>
                    {selectedMetric.trend === 'up' ? '+' : ''}{selectedMetric.details.change}{selectedMetric.unit === '%' ? '%' : ''}
                  </span>
                </div>
              </div>

              <div className="metric-description-full">
                <h3>About This Metric</h3>
                <p>{selectedMetric.description}</p>
              </div>

              {selectedMetric.details.breakdown && (
                <div className="metric-breakdown">
                  <h3>Breakdown</h3>
                  <div className="breakdown-items">
                    {selectedMetric.details.breakdown.map((item, index) => (
                      <div key={index} className="breakdown-item">
                        <div className="breakdown-info">
                          <span className="breakdown-label">{item.label}</span>
                          <span className="breakdown-value">{item.value.toLocaleString()}</span>
                        </div>
                        <div className="breakdown-bar">
                          <div 
                            className="breakdown-fill" 
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="breakdown-percentage">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="metric-status">
                <h3>Status</h3>
                <div className={`status-indicator ${getStatusClass(selectedMetric.status)}`}>
                  <span className="status-icon">
                    {selectedMetric.status === 'excellent' ? '🟢' :
                     selectedMetric.status === 'good' ? '🟡' :
                     selectedMetric.status === 'warning' ? '🟠' : '🔴'}
                  </span>
                  <span className="status-text">
                    {selectedMetric.status.charAt(0).toUpperCase() + selectedMetric.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 