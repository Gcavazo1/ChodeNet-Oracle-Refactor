import React from 'react'
import { 
  Database, Clock, Users, Gauge, TrendingUp, BarChart3, Activity,
  TestTube, Layers, Radio, Play, Pause, RotateCcw, Eye, EyeOff,
  ToggleLeft, ToggleRight
} from 'lucide-react'

interface SystemMetrics {
  totalEvents: number
  eventsLastHour: number
  activeConnections: number
  avgResponseTime: number
  errorRate: number
  uptime: string
  demoDataPercentage: number
  realDataSources: number
}

interface DemoDataStatus {
  totalComponents: number
  demoEnabled: number
  realDataEnabled: number
  mixedMode: number
  lastDemoInjection: Date | null
  demoEventsCount: number
}

interface AdminConfig {
  demoDataGlobal: {
    masterSwitch: boolean
    showDemoIndicators: boolean
    autoRefreshDemo: boolean
    demoRefreshInterval: number
    demoDataQuality: 'basic' | 'rich' | 'cinematic'
  }
  componentDemoModes: {
    smartAlertsBar: boolean
    liveEventFeed: boolean
    oracleMetrics: boolean
    communityData: boolean
    leaderboards: boolean
    oraclePolls: boolean
    loreSystem: boolean
    gameEvents: boolean
  }
}

interface Props {
  systemMetrics: SystemMetrics
  demoDataStatus: DemoDataStatus
  adminConfig: AdminConfig
  updateAdminConfig: (updates: Partial<AdminConfig>) => void
  toggleAllDemoModes: (enabled: boolean) => void
  setDemoDataStatus: React.Dispatch<React.SetStateAction<DemoDataStatus>>
  injectDemoAlert: (type: 'prophecy' | 'legendary' | 'corruption' | 'community') => Promise<void>
  injectDemoEvent: (eventType: 'girth_milestone' | 'legendary_slap' | 'oracle_response') => Promise<void>
}

export const SystemMetrics: React.FC<Props> = ({
  systemMetrics,
  demoDataStatus,
  adminConfig,
  updateAdminConfig,
  toggleAllDemoModes,
  setDemoDataStatus,
  injectDemoAlert,
  injectDemoEvent
}) => {
  return (
    <>
      {/* System Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="liquid-glass-intense rounded-2xl p-6 border border-electric-blue/30 metrics-card">
          <div className="flex items-center justify-between mb-4">
            <Database className="w-8 h-8 text-electric-blue" />
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">{systemMetrics.totalEvents.toLocaleString()}</div>
          <div className="text-gray-400 text-sm">Total Events</div>
        </div>

        <div className="liquid-glass-intense rounded-2xl p-6 border border-cyber-gold/30 metrics-card">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-cyber-gold" />
            <BarChart3 className="w-5 h-5 text-cyber-gold" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">{systemMetrics.eventsLastHour}</div>
          <div className="text-gray-400 text-sm">Events (Last Hour)</div>
        </div>

        <div className="liquid-glass-intense rounded-2xl p-6 border border-green-500/30 metrics-card">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-green-400" />
            <Activity className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">{systemMetrics.activeConnections}</div>
          <div className="text-gray-400 text-sm">Active Connections</div>
        </div>

        <div className="liquid-glass-intense rounded-2xl p-6 border border-purple-500/30 metrics-card">
          <div className="flex items-center justify-between mb-4">
            <Gauge className="w-8 h-8 text-purple-400" />
            <span className={`text-sm px-2 py-1 rounded-full ${
              systemMetrics.errorRate < 1 ? 'status-good' :
              systemMetrics.errorRate < 5 ? 'status-fair' :
              'status-poor'
            }`}>
              {systemMetrics.errorRate < 1 ? 'Good' : systemMetrics.errorRate < 5 ? 'Fair' : 'Poor'}
            </span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{systemMetrics.avgResponseTime}ms</div>
          <div className="text-gray-400 text-sm">Avg Response Time</div>
        </div>
      </div>

      {/* Demo Data Status Overview */}
      <div className="mb-8">
        <div className="liquid-glass-intense rounded-3xl p-6 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-6">
            <TestTube className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Demo Data Control Center</h2>
            <div className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
              adminConfig.demoDataGlobal?.masterSwitch 
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
            }`}>
              {adminConfig.demoDataGlobal?.masterSwitch ? 'Demo Mode Active' : 'Production Mode'}
            </div>
          </div>

          {/* Demo Data Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="liquid-glass rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center justify-between mb-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <span className="text-lg font-bold text-white">{demoDataStatus.demoEnabled}</span>
              </div>
              <div className="text-sm text-gray-400">Components in Demo</div>
            </div>
            
            <div className="liquid-glass rounded-xl p-4 border border-green-500/20">
              <div className="flex items-center justify-between mb-2">
                <Radio className="w-5 h-5 text-green-400" />
                <span className="text-lg font-bold text-white">{demoDataStatus.realDataEnabled}</span>
              </div>
              <div className="text-sm text-gray-400">Real Data Sources</div>
            </div>
            
            <div className="liquid-glass rounded-xl p-4 border border-cyber-gold/20">
              <div className="flex items-center justify-between mb-2">
                <Gauge className="w-5 h-5 text-cyber-gold" />
                <span className="text-lg font-bold text-white">{systemMetrics.demoDataPercentage.toFixed(0)}%</span>
              </div>
              <div className="text-sm text-gray-400">Demo Percentage</div>
            </div>
            
            <div className="liquid-glass rounded-xl p-4 border border-electric-blue/20">
              <div className="flex items-center justify-between mb-2">
                <TestTube className="w-5 h-5 text-electric-blue" />
                <span className="text-lg font-bold text-white">{demoDataStatus.demoEventsCount}</span>
              </div>
              <div className="text-sm text-gray-400">Demo Events Injected</div>
            </div>
          </div>

          {/* Global Demo Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 liquid-glass rounded-xl border border-white/10">
              <div>
                <h3 className="text-white font-medium mb-1">Master Demo Switch</h3>
                <p className="text-gray-400 text-sm">Global override for all demo data systems</p>
              </div>
              <button
                onClick={() => updateAdminConfig({ 
                  demoDataGlobal: { 
                    ...adminConfig.demoDataGlobal, 
                    masterSwitch: !adminConfig.demoDataGlobal?.masterSwitch 
                  } 
                })}
                className="flex items-center toggle-button"
              >
                {adminConfig.demoDataGlobal?.masterSwitch ? (
                  <ToggleRight className="w-8 h-8 text-purple-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-500" />
                )}
              </button>
            </div>

            {/* Quick Demo Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => toggleAllDemoModes(true)}
                className="p-3 liquid-glass rounded-xl border border-purple-500/30 hover:border-purple-500/50 transition-colors flex items-center gap-2 text-sm text-white"
              >
                <Play className="w-4 h-4" />
                Enable All
              </button>
              
              <button
                onClick={() => toggleAllDemoModes(false)}
                className="p-3 liquid-glass rounded-xl border border-gray-500/30 hover:border-gray-500/50 transition-colors flex items-center gap-2 text-sm text-white"
              >
                <Pause className="w-4 h-4" />
                Disable All
              </button>
              
              <button
                onClick={() => setDemoDataStatus(prev => ({ 
                  ...prev, 
                  demoEventsCount: 0, 
                  lastDemoInjection: null 
                }))}
                className="p-3 liquid-glass rounded-xl border border-cyber-gold/30 hover:border-cyber-gold/50 transition-colors flex items-center gap-2 text-sm text-white"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Stats
              </button>
              
              <button
                onClick={() => updateAdminConfig({ 
                  demoDataGlobal: { 
                    ...adminConfig.demoDataGlobal, 
                    showDemoIndicators: !adminConfig.demoDataGlobal?.showDemoIndicators 
                  } 
                })}
                className="p-3 liquid-glass rounded-xl border border-electric-blue/30 hover:border-electric-blue/50 transition-colors flex items-center gap-2 text-sm text-white"
              >
                {adminConfig.demoDataGlobal?.showDemoIndicators ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {adminConfig.demoDataGlobal?.showDemoIndicators ? 'Hide' : 'Show'} Indicators
              </button>
            </div>
          </div>

          {/* Demo Data Quality Control */}
          <div className="mt-6 p-4 liquid-glass rounded-xl border border-white/10">
            <h3 className="text-white font-medium mb-3">Demo Data Quality</h3>
            <div className="space-y-2">
              {['basic', 'rich', 'cinematic'].map((quality) => (
                <label key={quality} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="demoQuality"
                    value={quality}
                    checked={adminConfig.demoDataGlobal?.demoDataQuality === quality}
                    onChange={(e) => updateAdminConfig({ 
                      demoDataGlobal: { 
                        ...adminConfig.demoDataGlobal, 
                        demoDataQuality: e.target.value as 'basic' | 'rich' | 'cinematic'
                      } 
                    })}
                    className="w-4 h-4 text-purple-400"
                  />
                  <span className="text-white text-sm capitalize">{quality}</span>
                  <span className="text-gray-400 text-xs">
                    {quality === 'basic' && '(Simple events)'}
                    {quality === 'rich' && '(Detailed events)'}
                    {quality === 'cinematic' && '(Full Oracle responses)'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Quick Demo Injection */}
          <div className="mt-6 space-y-3">
            <h3 className="text-white font-medium">Quick Demo Injection</h3>
            <div className="space-y-2">
              <div className="text-xs text-gray-400 mb-2">SmartAlerts Demo:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => injectDemoAlert('prophecy')}
                  className="p-2 liquid-glass rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-colors text-xs text-white"
                  disabled={!adminConfig.demoDataGlobal?.masterSwitch}
                >
                  🔮 Prophecy
                </button>
                <button
                  onClick={() => injectDemoAlert('legendary')}
                  className="p-2 liquid-glass rounded-lg border border-yellow-500/30 hover:border-yellow-500/50 transition-colors text-xs text-white"
                  disabled={!adminConfig.demoDataGlobal?.masterSwitch}
                >
                  ⚡ Legendary
                </button>
                <button
                  onClick={() => injectDemoAlert('corruption')}
                  className="p-2 liquid-glass rounded-lg border border-red-500/30 hover:border-red-500/50 transition-colors text-xs text-white"
                  disabled={!adminConfig.demoDataGlobal?.masterSwitch}
                >
                  🌀 Corruption
                </button>
                <button
                  onClick={() => injectDemoAlert('community')}
                  className="p-2 liquid-glass rounded-lg border border-green-500/30 hover:border-green-500/50 transition-colors text-xs text-white"
                  disabled={!adminConfig.demoDataGlobal?.masterSwitch}
                >
                  👥 Community
                </button>
              </div>
              
              <div className="text-xs text-gray-400 mb-2 mt-4">LiveEventFeed Demo:</div>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => injectDemoEvent('girth_milestone')}
                  className="p-2 liquid-glass rounded-lg border border-electric-blue/30 hover:border-electric-blue/50 transition-colors text-xs text-white"
                  disabled={!adminConfig.demoDataGlobal?.masterSwitch}
                >
                  💪 Girth Milestone
                </button>
                <button
                  onClick={() => injectDemoEvent('legendary_slap')}
                  className="p-2 liquid-glass rounded-lg border border-cyber-gold/30 hover:border-cyber-gold/50 transition-colors text-xs text-white"
                  disabled={!adminConfig.demoDataGlobal?.masterSwitch}
                >
                  👋 Legendary Slap
                </button>
                <button
                  onClick={() => injectDemoEvent('oracle_response')}
                  className="p-2 liquid-glass rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-colors text-xs text-white"
                  disabled={!adminConfig.demoDataGlobal?.masterSwitch}
                >
                  🔮 Oracle Response
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 