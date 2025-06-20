import React from 'react'
import { 
  Settings, Download, Upload, RefreshCw, Database, 
  Trash2, FileText, Terminal, Bug, Activity, Zap,
  HardDrive, Network, Cpu, MemoryStick, Code
} from 'lucide-react'

interface SystemStats {
  memoryUsage: number
  cpuUsage: number
  storageUsed: number
  networkLatency: number
  uptime: string
  activeConnections: number
  databaseConnections: number
  cacheHitRate: number
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
  systemStats: SystemStats
  adminConfig: AdminConfig
  refreshSystemMetrics: () => Promise<void>
  exportConfiguration: () => void
  importConfiguration: (config: Partial<AdminConfig>) => void
  clearSystemCache: () => Promise<void>
  runSystemDiagnostics: () => Promise<void>
}

export const SystemAdmin: React.FC<Props> = ({
  systemStats,
  adminConfig,
  refreshSystemMetrics,
  exportConfiguration,
  importConfiguration,
  clearSystemCache,
  runSystemDiagnostics
}) => {
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string)
        importConfiguration(config)
        alert('Configuration imported successfully')
      } catch (error) {
        alert('Failed to import configuration: Invalid JSON format')
      }
    }
    reader.readAsText(file)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage < 50) return 'text-green-400'
    if (percentage < 80) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getUsageBarColor = (percentage: number) => {
    if (percentage < 50) return 'from-green-500 to-green-400'
    if (percentage < 80) return 'from-yellow-500 to-yellow-400'
    return 'from-red-500 to-red-400'
  }

  return (
    <>
      {/* System Performance Overview */}
      <div className="mb-8">
        <div className="liquid-glass-intense rounded-3xl p-6 border border-electric-blue/30">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-electric-blue" />
            <h2 className="text-xl font-bold text-white">System Performance</h2>
            <button
              onClick={refreshSystemMetrics}
              className="ml-auto p-2 liquid-glass rounded-lg border border-electric-blue/30 hover:border-electric-blue/50 transition-colors text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="liquid-glass rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="w-4 h-4 text-electric-blue" />
                <span className="text-white font-medium">CPU Usage</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${getUsageBarColor(systemStats.cpuUsage)} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${systemStats.cpuUsage}%` }}
                    />
                  </div>
                </div>
                <span className={`text-sm font-medium ${getUsageColor(systemStats.cpuUsage)}`}>
                  {systemStats.cpuUsage.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="liquid-glass rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <MemoryStick className="w-4 h-4 text-purple-400" />
                <span className="text-white font-medium">Memory</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${getUsageBarColor(systemStats.memoryUsage)} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${systemStats.memoryUsage}%` }}
                    />
                  </div>
                </div>
                <span className={`text-sm font-medium ${getUsageColor(systemStats.memoryUsage)}`}>
                  {systemStats.memoryUsage.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="liquid-glass rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <HardDrive className="w-4 h-4 text-cyber-gold" />
                <span className="text-white font-medium">Storage</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${getUsageBarColor(systemStats.storageUsed)} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${systemStats.storageUsed}%` }}
                    />
                  </div>
                </div>
                <span className={`text-sm font-medium ${getUsageColor(systemStats.storageUsed)}`}>
                  {systemStats.storageUsed.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="liquid-glass rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Network className="w-4 h-4 text-green-400" />
                <span className="text-white font-medium">Network</span>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{systemStats.networkLatency}ms</div>
                <div className="text-xs text-gray-400">Latency</div>
              </div>
            </div>
          </div>

          {/* Connection Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="liquid-glass rounded-xl p-4 border border-white/10 text-center">
              <div className="text-lg font-bold text-white">{systemStats.activeConnections}</div>
              <div className="text-sm text-gray-400">Active Connections</div>
            </div>
            
            <div className="liquid-glass rounded-xl p-4 border border-white/10 text-center">
              <div className="text-lg font-bold text-white">{systemStats.databaseConnections}</div>
              <div className="text-sm text-gray-400">DB Connections</div>
            </div>
            
            <div className="liquid-glass rounded-xl p-4 border border-white/10 text-center">
              <div className="text-lg font-bold text-white">{systemStats.cacheHitRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-400">Cache Hit Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* System Administration Tools */}
      <div className="mb-8">
        <div className="liquid-glass-intense rounded-3xl p-6 border border-cyber-gold/30">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-cyber-gold" />
            <h2 className="text-xl font-bold text-white">System Administration</h2>
          </div>

          {/* Configuration Management */}
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Configuration Management
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={exportConfiguration}
                  className="p-4 liquid-glass rounded-xl border border-green-500/30 hover:border-green-500/50 transition-colors flex items-center gap-3 text-white"
                >
                  <Download className="w-5 h-5 text-green-400" />
                  <div className="text-left">
                    <div className="font-medium">Export Configuration</div>
                    <div className="text-sm text-gray-400">Download current admin settings</div>
                  </div>
                </button>

                <label className="p-4 liquid-glass rounded-xl border border-blue-500/30 hover:border-blue-500/50 transition-colors flex items-center gap-3 text-white cursor-pointer">
                  <Upload className="w-5 h-5 text-blue-400" />
                  <div className="text-left">
                    <div className="font-medium">Import Configuration</div>
                    <div className="text-sm text-gray-400">Upload and apply settings</div>
                  </div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* System Maintenance */}
            <div>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Database className="w-4 h-4" />
                System Maintenance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={clearSystemCache}
                  className="p-4 liquid-glass rounded-xl border border-yellow-500/30 hover:border-yellow-500/50 transition-colors flex items-center gap-3 text-white"
                >
                  <Trash2 className="w-5 h-5 text-yellow-400" />
                  <div className="text-left">
                    <div className="font-medium">Clear Cache</div>
                    <div className="text-sm text-gray-400">Free up memory</div>
                  </div>
                </button>

                <button
                  onClick={runSystemDiagnostics}
                  className="p-4 liquid-glass rounded-xl border border-purple-500/30 hover:border-purple-500/50 transition-colors flex items-center gap-3 text-white"
                >
                  <Bug className="w-5 h-5 text-purple-400" />
                  <div className="text-left">
                    <div className="font-medium">Run Diagnostics</div>
                    <div className="text-sm text-gray-400">System health check</div>
                  </div>
                </button>

                <button
                  onClick={refreshSystemMetrics}
                  className="p-4 liquid-glass rounded-xl border border-electric-blue/30 hover:border-electric-blue/50 transition-colors flex items-center gap-3 text-white"
                >
                  <RefreshCw className="w-5 h-5 text-electric-blue" />
                  <div className="text-left">
                    <div className="font-medium">Refresh Metrics</div>
                    <div className="text-sm text-gray-400">Update system stats</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => window.open('/admin/logs', '_blank')}
                  className="p-3 liquid-glass rounded-xl border border-gray-500/30 hover:border-gray-500/50 transition-colors flex items-center gap-2 text-sm text-white"
                >
                  <Terminal className="w-4 h-4" />
                  View Logs
                </button>
                
                <button
                  onClick={() => window.open('/admin/database', '_blank')}
                  className="p-3 liquid-glass rounded-xl border border-blue-500/30 hover:border-blue-500/50 transition-colors flex items-center gap-2 text-sm text-white"
                >
                  <Database className="w-4 h-4" />
                  Database
                </button>
                
                <button
                  onClick={() => window.open('/admin/api-docs', '_blank')}
                  className="p-3 liquid-glass rounded-xl border border-green-500/30 hover:border-green-500/50 transition-colors flex items-center gap-2 text-sm text-white"
                >
                  <Code className="w-4 h-4" />
                  API Docs
                </button>
                
                <button
                  onClick={() => window.open('/admin/monitoring', '_blank')}
                  className="p-3 liquid-glass rounded-xl border border-purple-500/30 hover:border-purple-500/50 transition-colors flex items-center gap-2 text-sm text-white"
                >
                  <Activity className="w-4 h-4" />
                  Monitoring
                </button>
              </div>
            </div>

            {/* System Information */}
            <div>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                System Information
              </h3>
              <div className="liquid-glass rounded-xl p-4 border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400 mb-1">Uptime</div>
                    <div className="text-white font-medium">{systemStats.uptime}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Environment</div>
                    <div className="text-white font-medium">Production</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Version</div>
                    <div className="text-white font-medium">Oracle v2.1.0</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Build</div>
                    <div className="text-white font-medium">{new Date().toISOString().split('T')[0]}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 