import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import './AIStatusDashboard.css';

interface AIAgent {
  id: number;
  agent_type: string;
  agent_name: string;
  status: string;
  last_activity: string;
  performance_metrics: any;
  config: any;
}

interface SystemHealth {
  id: number;
  overall_health_score: number;
  agent_health_scores: any;
  recent_decision_count: number;
  successful_executions: number;
  failed_executions: number;
  performance_metrics: any;
  snapshot_timestamp: string;
}

interface AIDecision {
  id: number;
  decision_type: string;
  reasoning: string;
  confidence_score: number;
  executed: boolean;
  execution_timestamp: string;
  success_score: number;
  created_at: string;
  poll_id: number;
}

interface LearningPattern {
  id: number;
  pattern_type: string;
  description: string;
  confidence: number;
  recommended_improvements: string[];
  identified_at: string;
}

interface EcosystemMetric {
  id: number;
  metric_type: string;
  metric_value: number;
  metadata: any;
  timestamp: string;
  data_source: string;
}

const AIStatusDashboard: React.FC = () => {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [recentDecisions, setRecentDecisions] = useState<AIDecision[]>([]);
  const [learningPatterns, setLearningPatterns] = useState<LearningPattern[]>([]);
  const [recentMetrics, setRecentMetrics] = useState<EcosystemMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'decisions' | 'learning' | 'metrics'>('overview');

  // Real-time subscriptions
  useEffect(() => {
    fetchAllData();
    
    // Set up real-time subscriptions
    const agentsSubscription = supabase
      .channel('ai_agents_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ai_agents' },
        () => fetchAgents()
      )
      .subscribe();

    const healthSubscription = supabase
      .channel('system_health_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'system_health_snapshots' },
        () => fetchSystemHealth()
      )
      .subscribe();

    const decisionsSubscription = supabase
      .channel('ai_decisions_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'ai_decisions' },
        () => fetchRecentDecisions()
      )
      .subscribe();

    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchAllData();
    }, 30000);

    return () => {
      agentsSubscription.unsubscribe();
      healthSubscription.unsubscribe();
      decisionsSubscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchAgents(),
        fetchSystemHealth(),
        fetchRecentDecisions(),
        fetchLearningPatterns(),
        fetchRecentMetrics()
      ]);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching AI status data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgents = async () => {
    const { data, error } = await supabase
      .from('ai_agents')
      .select('*')
      .order('last_activity', { ascending: false });
    
    if (!error && data) {
      setAgents(data);
    }
  };

  const fetchSystemHealth = async () => {
    const { data, error } = await supabase
      .from('system_health_snapshots')
      .select('*')
      .order('snapshot_timestamp', { ascending: false })
      .limit(1)
      .single();
    
    if (!error && data) {
      setSystemHealth(data);
    }
  };

  const fetchRecentDecisions = async () => {
    const { data, error } = await supabase
      .from('ai_decisions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (!error && data) {
      setRecentDecisions(data);
    }
  };

  const fetchLearningPatterns = async () => {
    const { data, error } = await supabase
      .from('ai_learning_patterns')
      .select('*')
      .order('identified_at', { ascending: false })
      .limit(5);
    
    if (!error && data) {
      setLearningPatterns(data);
    }
  };

  const fetchRecentMetrics = async () => {
    const { data, error } = await supabase
      .from('ecosystem_metrics')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(20);
    
    if (!error && data) {
      setRecentMetrics(data);
    }
  };

  const getAgentIcon = (agentType: string): string => {
    const icons = {
      'sentinel': '🔍',
      'analyst': '🧠',
      'prophet': '🔮',
      'arbiter': '⚖️',
      'scribe': '📚'
    };
    return icons[agentType as keyof typeof icons] || '🤖';
  };

  const getAgentDescription = (agentType: string): string => {
    const descriptions = {
      'sentinel': 'Ecosystem Monitoring & Anomaly Detection',
      'analyst': 'Deep Analysis & Pattern Recognition',
      'prophet': 'Democratic Poll Generation',
      'arbiter': 'Decision Execution & Implementation',
      'scribe': 'Learning & System Optimization'
    };
    return descriptions[agentType as keyof typeof descriptions] || 'AI Agent';
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      'active': '#10b981', // green
      'inactive': '#f59e0b', // yellow
      'error': '#ef4444', // red
      'processing': '#3b82f6' // blue
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  const getHealthColor = (score: number): string => {
    if (score >= 0.8) return '#10b981'; // green
    if (score >= 0.6) return '#f59e0b'; // yellow
    if (score >= 0.4) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const triggerAgent = async (agentType: string) => {
    try {
      const functionMap = {
        'sentinel': 'ai-ecosystem-monitor',
        'analyst': 'ai-analyst-agent',
        'prophet': 'ai-prophet-agent',
        'arbiter': 'ai-arbiter-agent',
        'scribe': 'ai-scribe-agent'
      };

      const functionName = functionMap[agentType as keyof typeof functionMap];
      if (!functionName) return;

      const { data, error } = await supabase.functions.invoke(functionName);
      
      if (error) {
        console.error(`Error triggering ${agentType} agent:`, error);
      } else {
        console.log(`${agentType} agent triggered successfully:`, data);
        // Refresh data after triggering
        setTimeout(() => fetchAllData(), 2000);
      }
    } catch (error) {
      console.error(`Failed to trigger ${agentType} agent:`, error);
    }
  };

  if (isLoading) {
    return (
      <div className="ai-status-dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading AI Democratic Governor Status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-status-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h2>🧠 AI Democratic Governor</h2>
          <div className="header-stats">
            <div className="stat">
              <span className="stat-label">System Health</span>
              <span 
                className="stat-value"
                style={{ color: getHealthColor(systemHealth?.overall_health_score || 0) }}
              >
                {((systemHealth?.overall_health_score || 0) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Active Agents</span>
              <span className="stat-value">
                {agents.filter(a => a.status === 'active').length}/{agents.length}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Last Update</span>
              <span className="stat-value">{formatTimeAgo(lastUpdate.toISOString())}</span>
            </div>
          </div>
        </div>
        <button className="refresh-btn" onClick={fetchAllData}>
          🔄 Refresh
        </button>
      </div>

      <div className="dashboard-tabs">
        {(['overview', 'agents', 'decisions', 'learning', 'metrics'] as const).map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="ai-pipeline">
              <h3>🔄 Autonomous Democratic Pipeline</h3>
              <div className="pipeline-flow">
                {agents.map((agent, index) => (
                  <div key={agent.id} className="pipeline-step">
                    <div className={`agent-node ${agent.status}`}>
                      <div className="agent-icon">{getAgentIcon(agent.agent_type)}</div>
                      <div className="agent-name">{agent.agent_type}</div>
                      <div className="agent-status" style={{ color: getStatusColor(agent.status) }}>
                        {agent.status}
                      </div>
                    </div>
                    {index < agents.length - 1 && <div className="pipeline-arrow">→</div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="overview-grid">
              <div className="overview-card">
                <h4>📊 Recent Activity</h4>
                <div className="activity-list">
                  {recentDecisions.slice(0, 3).map(decision => (
                    <div key={decision.id} className="activity-item">
                      <span className="activity-type">{decision.decision_type}</span>
                      <span className="activity-time">{formatTimeAgo(decision.created_at)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overview-card">
                <h4>🎯 System Performance</h4>
                <div className="performance-stats">
                  <div className="perf-stat">
                    <span>Decisions Made</span>
                    <span>{systemHealth?.recent_decision_count || 0}</span>
                  </div>
                  <div className="perf-stat">
                    <span>Success Rate</span>
                    <span>
                      {systemHealth && systemHealth.successful_executions + systemHealth.failed_executions > 0
                        ? ((systemHealth.successful_executions / (systemHealth.successful_executions + systemHealth.failed_executions)) * 100).toFixed(1)
                        : '0'
                      }%
                    </span>
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <h4>🧠 Learning Insights</h4>
                <div className="insights-list">
                  {learningPatterns.slice(0, 2).map(pattern => (
                    <div key={pattern.id} className="insight-item">
                      <span className="insight-type">{pattern.pattern_type}</span>
                      <span className="insight-confidence">{(pattern.confidence * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="agents-tab">
            <div className="agents-grid">
              {agents.map(agent => (
                <div key={agent.id} className={`agent-card ${agent.status}`}>
                  <div className="agent-header">
                    <div className="agent-icon-large">{getAgentIcon(agent.agent_type)}</div>
                    <div className="agent-info">
                      <h4>{agent.agent_type.charAt(0).toUpperCase() + agent.agent_type.slice(1)} Agent</h4>
                      <p>{getAgentDescription(agent.agent_type)}</p>
                    </div>
                    <div className="agent-status-indicator" style={{ backgroundColor: getStatusColor(agent.status) }}>
                      {agent.status}
                    </div>
                  </div>
                  
                  <div className="agent-details">
                    <div className="detail-row">
                      <span>Last Activity:</span>
                      <span>{formatTimeAgo(agent.last_activity)}</span>
                    </div>
                    {agent.performance_metrics && (
                      <div className="detail-row">
                        <span>Performance:</span>
                        <span>{(agent.performance_metrics.success_rate * 100 || 0).toFixed(1)}%</span>
                      </div>
                    )}
                  </div>

                  <button 
                    className="trigger-agent-btn"
                    onClick={() => triggerAgent(agent.agent_type)}
                  >
                    🚀 Trigger Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'decisions' && (
          <div className="decisions-tab">
            <h3>🎯 AI Decisions & Executions</h3>
            <div className="decisions-list">
              {recentDecisions.map(decision => (
                <div key={decision.id} className="decision-card">
                  <div className="decision-header">
                    <span className="decision-type">{decision.decision_type}</span>
                    <span className="decision-confidence">{(decision.confidence_score * 100).toFixed(0)}% confidence</span>
                    <span className={`execution-status ${decision.executed ? 'executed' : 'pending'}`}>
                      {decision.executed ? '✅ Executed' : '⏳ Pending'}
                    </span>
                  </div>
                  <div className="decision-reasoning">
                    {decision.reasoning.substring(0, 200)}...
                  </div>
                  <div className="decision-footer">
                    <span>Created: {formatTimeAgo(decision.created_at)}</span>
                    {decision.executed && decision.success_score && (
                      <span>Success: {(decision.success_score * 100).toFixed(0)}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'learning' && (
          <div className="learning-tab">
            <h3>🧠 AI Learning Patterns</h3>
            <div className="patterns-list">
              {learningPatterns.map(pattern => (
                <div key={pattern.id} className="pattern-card">
                  <div className="pattern-header">
                    <span className="pattern-type">{pattern.pattern_type}</span>
                    <span className="pattern-confidence">{(pattern.confidence * 100).toFixed(0)}% confidence</span>
                  </div>
                  <div className="pattern-description">
                    {pattern.description}
                  </div>
                  <div className="pattern-improvements">
                    <strong>Recommended Improvements:</strong>
                    <ul>
                      {pattern.recommended_improvements.slice(0, 3).map((improvement, index) => (
                        <li key={index}>{improvement}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="pattern-footer">
                    Identified: {formatTimeAgo(pattern.identified_at)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="metrics-tab">
            <h3>📊 Ecosystem Metrics</h3>
            <div className="metrics-grid">
              {recentMetrics.reduce((acc, metric) => {
                if (!acc[metric.metric_type]) {
                  acc[metric.metric_type] = [];
                }
                acc[metric.metric_type].push(metric);
                return acc;
              }, {} as Record<string, EcosystemMetric[]>)}
              {Object.entries(
                recentMetrics.reduce((acc, metric) => {
                  if (!acc[metric.metric_type]) {
                    acc[metric.metric_type] = [];
                  }
                  acc[metric.metric_type].push(metric);
                  return acc;
                }, {} as Record<string, EcosystemMetric[]>)
              ).map(([metricType, metrics]) => (
                <div key={metricType} className="metric-card">
                  <h4>{metricType.replace(/_/g, ' ').toUpperCase()}</h4>
                  <div className="metric-value">
                    {metrics[0]?.metric_value.toFixed(3)}
                  </div>
                  <div className="metric-trend">
                    {metrics.length > 1 && (
                      <span className={metrics[0].metric_value > metrics[1].metric_value ? 'trend-up' : 'trend-down'}>
                        {metrics[0].metric_value > metrics[1].metric_value ? '📈' : '📉'}
                      </span>
                    )}
                  </div>
                  <div className="metric-source">
                    Source: {metrics[0]?.data_source}
                  </div>
                  <div className="metric-time">
                    {formatTimeAgo(metrics[0]?.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIStatusDashboard; 