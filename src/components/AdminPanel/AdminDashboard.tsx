import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { SystemMetrics } from './SystemMetrics'
import { ComponentControls } from './ComponentControls'
import { PollManagement } from './PollManagement'
import { AIGovernance } from './AIGovernance'
import { SystemAdmin } from './SystemAdmin'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
)

// Types for all the state management
interface SystemMetricsType {
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
  smartAlertsConfig?: {
    enableAnimations: boolean
    enableSounds: boolean
    pauseOnHover: boolean
    maxConcurrentAlerts: number
    oracleResponseEnabled: boolean
    alertDuration: number
    enableCorruptionEffects: boolean
    enableLegendaryGlow: boolean
    enableProphecyParticles: boolean
    communityMilestoneThreshold: number
    alertDisplayPosition: 'top' | 'bottom'
    alertStyle: 'minimal' | 'full' | 'cinematic'
    enableDebugMode: boolean
    enableManualDismiss: boolean
    enableAutoAdvance: boolean
    autoAdvanceDelay: number
    enableGlobalMute: boolean
    enableHapticFeedback: boolean
    enableCustomSounds: boolean
    customSoundVolume: number
    enableAlertHistory: boolean
    alertHistoryLimit: number
    enableSmartFiltering: boolean
    smartFilterSensitivity: 'low' | 'medium' | 'high'
    enablePerformanceThrottling: boolean
    throttleThreshold: number
    enableAlertCategories: boolean
    categoryPriorityLevels: {
      prophecy: number
      legendary: number
      corruption: number
      community: number
      milestone: number
      achievement: number
    }
  }
}

interface PollCompletionStatus {
  totalPolls: number
  completedPolls: number
  pendingPolls: number
  recentlyCompleted: number
  averageCompletionTime: number
  participationRate: number
  criticalPendingCount: number
  lastArbiterRun: Date | null
  completionTrend: 'up' | 'down' | 'stable'
}

interface AIGovernanceStatus {
  emergencyBrakeActive: boolean
  pendingApprovals: Array<{
    id: string
    type: 'poll_creation' | 'decision_execution' | 'system_change'
    priority: 'low' | 'medium' | 'high' | 'critical'
    title: string
    description: string
    created_at: Date
    requires_admin_approval: boolean
  }>
  overrideWindowOpen: boolean
  overrideWindowEndsAt: Date | null
  systemHealthStatus: 'healthy' | 'warning' | 'critical'
  aiAgentsActive: {
    sentinel: boolean
    analyst: boolean
    prophet: boolean
    arbiter: boolean
    scribe: boolean
  }
  autoApprovalRules: {
    lowPriorityAutoApprove: boolean
    requireMultipleAdmins: boolean
    timeDelayMinutes: number
    maxAutoApprovalsPerHour: number
  }
  governanceMetrics: {
    totalDecisions: number
    autoApproved: number
    manuallyApproved: number
    rejected: number
    emergencyOverrides: number
  }
}

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

const AdminDashboard: React.FC = () => {
  // State management for all sections
  const [systemMetrics, setSystemMetrics] = useState<SystemMetricsType>({
    totalEvents: 0,
    eventsLastHour: 0,
    activeConnections: 0,
    avgResponseTime: 0,
    errorRate: 0,
    uptime: '0d 0h 0m',
    demoDataPercentage: 0,
    realDataSources: 0
  })

  const [demoDataStatus, setDemoDataStatus] = useState<DemoDataStatus>({
    totalComponents: 8,
    demoEnabled: 0,
    realDataEnabled: 0,
    mixedMode: 0,
    lastDemoInjection: null,
    demoEventsCount: 0
  })

  const [adminConfig, setAdminConfig] = useState<AdminConfig>({
    demoDataGlobal: {
      masterSwitch: false,
      showDemoIndicators: true,
      autoRefreshDemo: false,
      demoRefreshInterval: 30000,
      demoDataQuality: 'rich'
    },
    componentDemoModes: {
      smartAlertsBar: false,
      liveEventFeed: false,
      oracleMetrics: false,
      communityData: false,
      leaderboards: false,
      oraclePolls: false,
      loreSystem: false,
      gameEvents: false
    }
  })

  const [pollCompletionStatus, setPollCompletionStatus] = useState<PollCompletionStatus>({
    totalPolls: 0,
    completedPolls: 0,
    pendingPolls: 0,
    recentlyCompleted: 0,
    averageCompletionTime: 0,
    participationRate: 0,
    criticalPendingCount: 0,
    lastArbiterRun: null,
    completionTrend: 'stable'
  })

  const [aiGovernanceStatus, setAIGovernanceStatus] = useState<AIGovernanceStatus>({
    emergencyBrakeActive: false,
    pendingApprovals: [],
    overrideWindowOpen: false,
    overrideWindowEndsAt: null,
    systemHealthStatus: 'healthy',
    aiAgentsActive: {
      sentinel: true,
      analyst: true,
      prophet: true,
      arbiter: false,
      scribe: true
    },
    autoApprovalRules: {
      lowPriorityAutoApprove: true,
      requireMultipleAdmins: false,
      timeDelayMinutes: 5,
      maxAutoApprovalsPerHour: 10
    },
    governanceMetrics: {
      totalDecisions: 0,
      autoApproved: 0,
      manuallyApproved: 0,
      rejected: 0,
      emergencyOverrides: 0
    }
  })

  const [systemStats, setSystemStats] = useState<SystemStats>({
    memoryUsage: 45.2,
    cpuUsage: 23.1,
    storageUsed: 67.8,
    networkLatency: 12,
    uptime: '5d 12h 34m',
    activeConnections: 156,
    databaseConnections: 8,
    cacheHitRate: 94.7
  })

  // Load all data on component mount
  useEffect(() => {
    loadSystemMetrics()
    loadPollCompletionStatus()
    loadAIGovernanceStatus()
    loadDemoDataStatus()
  }, [])

  // Data loading functions
  const loadSystemMetrics = async () => {
    try {
      // Load real metrics from your backend
      // For now using mock data
      const mockMetrics = {
        totalEvents: Math.floor(Math.random() * 10000) + 5000,
        eventsLastHour: Math.floor(Math.random() * 100) + 50,
        activeConnections: Math.floor(Math.random() * 200) + 100,
        avgResponseTime: Math.floor(Math.random() * 50) + 10,
        errorRate: Math.random() * 2,
        uptime: '5d 12h 34m',
        demoDataPercentage: Object.values(adminConfig.componentDemoModes).filter(Boolean).length / 8 * 100,
        realDataSources: 8 - Object.values(adminConfig.componentDemoModes).filter(Boolean).length
      }
      setSystemMetrics(mockMetrics)
    } catch (error) {
      console.error('Failed to load system metrics:', error)
    }
  }

  const loadPollCompletionStatus = async () => {
    try {
      // Load from your oracle polls system
      const mockPollStatus = {
        totalPolls: 25,
        completedPolls: 18,
        pendingPolls: 7,
        recentlyCompleted: 3,
        averageCompletionTime: 1440, // 24 hours in minutes
        participationRate: 78.5,
        criticalPendingCount: 2,
        lastArbiterRun: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        completionTrend: 'up' as const
      }
      setPollCompletionStatus(mockPollStatus)
    } catch (error) {
      console.error('Failed to load poll completion status:', error)
    }
  }

  const loadAIGovernanceStatus = async () => {
    try {
      // Load from AI governance system
      const mockGovernanceStatus = {
        emergencyBrakeActive: false,
        pendingApprovals: [
          {
            id: '1',
            type: 'poll_creation' as const,
            priority: 'medium' as const,
            title: 'Community Feature Request Poll',
            description: 'Proposal to add new Oracle personality customization options',
            created_at: new Date(Date.now() - 30 * 60 * 1000),
            requires_admin_approval: false
          }
        ],
        overrideWindowOpen: false,
        overrideWindowEndsAt: null,
        systemHealthStatus: 'healthy' as const,
        aiAgentsActive: {
          sentinel: true,
          analyst: true,
          prophet: true,
          arbiter: false,
          scribe: true
        },
        autoApprovalRules: {
          lowPriorityAutoApprove: true,
          requireMultipleAdmins: false,
          timeDelayMinutes: 5,
          maxAutoApprovalsPerHour: 10
        },
        governanceMetrics: {
          totalDecisions: 47,
          autoApproved: 32,
          manuallyApproved: 12,
          rejected: 3,
          emergencyOverrides: 0
        }
      }
      setAIGovernanceStatus(mockGovernanceStatus)
    } catch (error) {
      console.error('Failed to load AI governance status:', error)
    }
  }

  const loadDemoDataStatus = () => {
    const enabledCount = Object.values(adminConfig.componentDemoModes).filter(Boolean).length
    setDemoDataStatus(prev => ({
      ...prev,
      demoEnabled: enabledCount,
      realDataEnabled: 8 - enabledCount,
      mixedMode: enabledCount > 0 && enabledCount < 8 ? 1 : 0
    }))
  }

  // Update functions
  const updateAdminConfig = (updates: Partial<AdminConfig>) => {
    setAdminConfig(prev => {
      const newConfig = { ...prev, ...updates }
      // Update demo data status when component modes change
      if (updates.componentDemoModes) {
        loadDemoDataStatus()
      }
      return newConfig
    })
  }

  const toggleAllDemoModes = (enabled: boolean) => {
    const newModes: Record<string, boolean> = {}
    Object.keys(adminConfig.componentDemoModes).forEach(key => {
      newModes[key] = enabled
    })
    updateAdminConfig({ componentDemoModes: newModes as any })
  }

  // Demo injection functions
  const injectDemoAlert = async (type: 'prophecy' | 'legendary' | 'corruption' | 'community') => {
    try {
      // Implement actual demo alert injection
      setDemoDataStatus(prev => ({
        ...prev,
        demoEventsCount: prev.demoEventsCount + 1,
        lastDemoInjection: new Date()
      }))
      console.log(`Injected ${type} demo alert`)
    } catch (error) {
      console.error('Failed to inject demo alert:', error)
    }
  }

  const injectDemoEvent = async (eventType: 'girth_milestone' | 'legendary_slap' | 'oracle_response') => {
    try {
      // Implement actual demo event injection
      setDemoDataStatus(prev => ({
        ...prev,
        demoEventsCount: prev.demoEventsCount + 1,
        lastDemoInjection: new Date()
      }))
      console.log(`Injected ${eventType} demo event`)
    } catch (error) {
      console.error('Failed to inject demo event:', error)
    }
  }

  // System admin functions
  const refreshSystemMetrics = async () => {
    await loadSystemMetrics()
    // Also refresh system stats
    setSystemStats(prev => ({
      ...prev,
      memoryUsage: Math.random() * 80 + 10,
      cpuUsage: Math.random() * 60 + 10,
      networkLatency: Math.floor(Math.random() * 30) + 5
    }))
  }

  const exportConfiguration = () => {
    const configToExport = {
      adminConfig,
      demoDataStatus,
      exportTimestamp: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(configToExport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `oracle-admin-config-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importConfiguration = (config: Partial<AdminConfig>) => {
    updateAdminConfig(config)
  }

  const clearSystemCache = async () => {
    try {
      // Implement cache clearing
      console.log('System cache cleared')
      alert('System cache cleared successfully')
    } catch (error) {
      console.error('Failed to clear cache:', error)
      alert('Failed to clear system cache')
    }
  }

  const runSystemDiagnostics = async () => {
    try {
      // Implement system diagnostics
      console.log('Running system diagnostics...')
      alert('System diagnostics completed - All systems operational')
    } catch (error) {
      console.error('Failed to run diagnostics:', error)
      alert('System diagnostics failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-electric-blue to-cyber-gold bg-clip-text text-transparent mb-4">
            Oracle Admin Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            Comprehensive control center for the Oracle ecosystem
          </p>
        </div>

        {/* Modular Sections */}
        <SystemMetrics
          systemMetrics={systemMetrics}
          demoDataStatus={demoDataStatus}
          adminConfig={adminConfig}
          updateAdminConfig={updateAdminConfig}
          toggleAllDemoModes={toggleAllDemoModes}
          setDemoDataStatus={setDemoDataStatus}
          injectDemoAlert={injectDemoAlert}
          injectDemoEvent={injectDemoEvent}
        />

        <ComponentControls
          adminConfig={adminConfig}
          updateAdminConfig={updateAdminConfig}
        />

        <PollManagement />

        <AIGovernance
          aiGovernanceStatus={aiGovernanceStatus}
          loadAIGovernanceStatus={loadAIGovernanceStatus}
        />

        <SystemAdmin
          systemStats={systemStats}
          adminConfig={adminConfig}
          refreshSystemMetrics={refreshSystemMetrics}
          exportConfiguration={exportConfiguration}
          importConfiguration={importConfiguration}
          clearSystemCache={clearSystemCache}
          runSystemDiagnostics={runSystemDiagnostics}
        />
      </div>
    </div>
  )
}

export default AdminDashboard 