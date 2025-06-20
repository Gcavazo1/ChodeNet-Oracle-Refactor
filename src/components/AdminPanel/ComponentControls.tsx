import React from 'react'
import { 
  Settings, ToggleLeft, ToggleRight, Sliders, Clock, 
  Bell, Zap, Palette, Volume2, VolumeX, AlertTriangle,
  Layers, TestTube, Radio
} from 'lucide-react'

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

interface Props {
  adminConfig: AdminConfig
  updateAdminConfig: (updates: Partial<AdminConfig>) => void
}

export const ComponentControls: React.FC<Props> = ({
  adminConfig,
  updateAdminConfig
}) => {
  const componentLabels = {
    smartAlertsBar: 'SmartAlerts Bar',
    liveEventFeed: 'Live Event Feed',
    oracleMetrics: 'Oracle Metrics',
    communityData: 'Community Data',
    leaderboards: 'Leaderboards',
    oraclePolls: 'Oracle Polls',
    loreSystem: 'Lore System',
    gameEvents: 'Game Events'
  }

  const smartAlertsConfig = adminConfig.smartAlertsConfig || {
    enableAnimations: true,
    enableSounds: false,
    pauseOnHover: true,
    maxConcurrentAlerts: 3,
    oracleResponseEnabled: true,
    alertDuration: 5000,
    enableCorruptionEffects: true,
    enableLegendaryGlow: true,
    enableProphecyParticles: true,
    communityMilestoneThreshold: 100,
    alertDisplayPosition: 'top' as const,
    alertStyle: 'full' as const,
    enableDebugMode: false,
    enableManualDismiss: true,
    enableAutoAdvance: true,
    autoAdvanceDelay: 7000,
    enableGlobalMute: false,
    enableHapticFeedback: false,
    enableCustomSounds: false,
    customSoundVolume: 50,
    enableAlertHistory: true,
    alertHistoryLimit: 50,
    enableSmartFiltering: true,
    smartFilterSensitivity: 'medium' as const,
    enablePerformanceThrottling: true,
    throttleThreshold: 10,
    enableAlertCategories: true,
    categoryPriorityLevels: {
      prophecy: 5,
      legendary: 4,
      corruption: 5,
      community: 2,
      milestone: 3,
      achievement: 1
    }
  }

  return (
    <>
      {/* Component-Specific Demo Controls */}
      <div className="mb-8">
        <div className="liquid-glass-intense rounded-3xl p-6 border border-electric-blue/30">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-electric-blue" />
            <h2 className="text-xl font-bold text-white">Component Demo Controls</h2>
            <div className="ml-auto text-sm text-gray-400">
              {Object.values(adminConfig.componentDemoModes || {}).filter(Boolean).length} / {Object.keys(componentLabels).length} Active
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(componentLabels).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between p-4 liquid-glass rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    adminConfig.componentDemoModes?.[key as keyof typeof adminConfig.componentDemoModes] 
                      ? 'bg-purple-400' 
                      : 'bg-gray-600'
                  }`} />
                  <span className="text-white font-medium">{label}</span>
                </div>
                <button
                  onClick={() => updateAdminConfig({
                    componentDemoModes: {
                      ...adminConfig.componentDemoModes,
                      [key]: !adminConfig.componentDemoModes?.[key as keyof typeof adminConfig.componentDemoModes]
                    }
                  })}
                  className="flex items-center toggle-button"
                >
                  {adminConfig.componentDemoModes?.[key as keyof typeof adminConfig.componentDemoModes] ? (
                    <ToggleRight className="w-6 h-6 text-purple-400" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-500" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SmartAlerts Configuration Panel */}
      <div className="mb-8">
        <div className="liquid-glass-intense rounded-3xl p-6 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">SmartAlerts Configuration</h2>
            <div className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
              adminConfig.componentDemoModes?.smartAlertsBar 
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
            }`}>
              {adminConfig.componentDemoModes?.smartAlertsBar ? 'Demo Active' : 'Demo Disabled'}
            </div>
          </div>

          {/* Core Alert Settings */}
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Core Alert Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 liquid-glass rounded-xl border border-white/10">
                  <div>
                    <h4 className="text-white font-medium mb-1">Enable Animations</h4>
                    <p className="text-gray-400 text-sm">Visual effects and transitions</p>
                  </div>
                  <button
                    onClick={() => updateAdminConfig({
                      smartAlertsConfig: {
                        ...smartAlertsConfig,
                        enableAnimations: !smartAlertsConfig.enableAnimations
                      }
                    })}
                    className="flex items-center toggle-button"
                  >
                    {smartAlertsConfig.enableAnimations ? (
                      <ToggleRight className="w-6 h-6 text-purple-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-500" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 liquid-glass rounded-xl border border-white/10">
                  <div>
                    <h4 className="text-white font-medium mb-1">Enable Sounds</h4>
                    <p className="text-gray-400 text-sm">Audio notifications</p>
                  </div>
                  <button
                    onClick={() => updateAdminConfig({
                      smartAlertsConfig: {
                        ...smartAlertsConfig,
                        enableSounds: !smartAlertsConfig.enableSounds
                      }
                    })}
                    className="flex items-center toggle-button"
                  >
                    {smartAlertsConfig.enableSounds ? (
                      <Volume2 className="w-6 h-6 text-purple-400" />
                    ) : (
                      <VolumeX className="w-6 h-6 text-gray-500" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 liquid-glass rounded-xl border border-white/10">
                  <div>
                    <h4 className="text-white font-medium mb-1">Oracle Responses</h4>
                    <p className="text-gray-400 text-sm">AI-generated Oracle comments</p>
                  </div>
                  <button
                    onClick={() => updateAdminConfig({
                      smartAlertsConfig: {
                        ...smartAlertsConfig,
                        oracleResponseEnabled: !smartAlertsConfig.oracleResponseEnabled
                      }
                    })}
                    className="flex items-center toggle-button"
                  >
                    {smartAlertsConfig.oracleResponseEnabled ? (
                      <ToggleRight className="w-6 h-6 text-purple-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-500" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 liquid-glass rounded-xl border border-white/10">
                  <div>
                    <h4 className="text-white font-medium mb-1">Pause on Hover</h4>
                    <p className="text-gray-400 text-sm">Pause animations when hovering</p>
                  </div>
                  <button
                    onClick={() => updateAdminConfig({
                      smartAlertsConfig: {
                        ...smartAlertsConfig,
                        pauseOnHover: !smartAlertsConfig.pauseOnHover
                      }
                    })}
                    className="flex items-center toggle-button"
                  >
                    {smartAlertsConfig.pauseOnHover ? (
                      <ToggleRight className="w-6 h-6 text-purple-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Performance & Throttling */}
            <div>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Performance Throttling
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 liquid-glass rounded-xl border border-white/10">
                  <div>
                    <h4 className="text-white font-medium mb-1">Performance Throttling</h4>
                    <p className="text-gray-400 text-sm">Limit resource usage during high activity</p>
                  </div>
                  <button
                    onClick={() => updateAdminConfig({
                      smartAlertsConfig: {
                        ...smartAlertsConfig,
                        enablePerformanceThrottling: !smartAlertsConfig.enablePerformanceThrottling
                      }
                    })}
                    className="flex items-center toggle-button"
                  >
                    {smartAlertsConfig.enablePerformanceThrottling ? (
                      <ToggleRight className="w-6 h-6 text-green-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-500" />
                    )}
                  </button>
                </div>

                <div className="p-4 liquid-glass rounded-xl border border-white/10">
                  <label className="block text-white font-medium mb-2">
                    Max Concurrent Alerts: {smartAlertsConfig.maxConcurrentAlerts}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={smartAlertsConfig.maxConcurrentAlerts}
                    onChange={(e) => updateAdminConfig({
                      smartAlertsConfig: {
                        ...smartAlertsConfig,
                        maxConcurrentAlerts: parseInt(e.target.value)
                      }
                    })}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>

                <div className="p-4 liquid-glass rounded-xl border border-white/10">
                  <label className="block text-white font-medium mb-2">
                    Alert Duration: {(smartAlertsConfig.alertDuration / 1000).toFixed(1)}s
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="10000"
                    step="500"
                    value={smartAlertsConfig.alertDuration}
                    onChange={(e) => updateAdminConfig({
                      smartAlertsConfig: {
                        ...smartAlertsConfig,
                        alertDuration: parseInt(e.target.value)
                      }
                    })}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1s</span>
                    <span>10s</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Effects */}
            <div>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Visual Effects
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 liquid-glass rounded-xl border border-white/10">
                  <div>
                    <h4 className="text-white font-medium mb-1">Corruption Effects</h4>
                    <p className="text-gray-400 text-sm">Glitch and distortion</p>
                  </div>
                  <button
                    onClick={() => updateAdminConfig({
                      smartAlertsConfig: {
                        ...smartAlertsConfig,
                        enableCorruptionEffects: !smartAlertsConfig.enableCorruptionEffects
                      }
                    })}
                    className="flex items-center toggle-button"
                  >
                    {smartAlertsConfig.enableCorruptionEffects ? (
                      <ToggleRight className="w-6 h-6 text-red-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-500" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 liquid-glass rounded-xl border border-white/10">
                  <div>
                    <h4 className="text-white font-medium mb-1">Legendary Glow</h4>
                    <p className="text-gray-400 text-sm">Golden aura effects</p>
                  </div>
                  <button
                    onClick={() => updateAdminConfig({
                      smartAlertsConfig: {
                        ...smartAlertsConfig,
                        enableLegendaryGlow: !smartAlertsConfig.enableLegendaryGlow
                      }
                    })}
                    className="flex items-center toggle-button"
                  >
                    {smartAlertsConfig.enableLegendaryGlow ? (
                      <ToggleRight className="w-6 h-6 text-yellow-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-500" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 liquid-glass rounded-xl border border-white/10">
                  <div>
                    <h4 className="text-white font-medium mb-1">Prophecy Particles</h4>
                    <p className="text-gray-400 text-sm">Mystical particle effects</p>
                  </div>
                  <button
                    onClick={() => updateAdminConfig({
                      smartAlertsConfig: {
                        ...smartAlertsConfig,
                        enableProphecyParticles: !smartAlertsConfig.enableProphecyParticles
                      }
                    })}
                    className="flex items-center toggle-button"
                  >
                    {smartAlertsConfig.enableProphecyParticles ? (
                      <ToggleRight className="w-6 h-6 text-purple-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Alert Style Configuration */}
            <div>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Alert Display Style
              </h3>
              <div className="space-y-3">
                <div className="p-4 liquid-glass rounded-xl border border-white/10">
                  <label className="block text-white font-medium mb-3">Alert Style</label>
                  <div className="space-y-2">
                    {['minimal', 'full', 'cinematic'].map((style) => (
                      <label key={style} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="alertStyle"
                          value={style}
                          checked={smartAlertsConfig.alertStyle === style}
                          onChange={(e) => updateAdminConfig({
                            smartAlertsConfig: {
                              ...smartAlertsConfig,
                              alertStyle: e.target.value as 'minimal' | 'full' | 'cinematic'
                            }
                          })}
                          className="w-4 h-4 text-purple-400"
                        />
                        <span className="text-white text-sm capitalize">{style}</span>
                        <span className="text-gray-400 text-xs">
                          {style === 'minimal' && '(Text only)'}
                          {style === 'full' && '(Text + effects)'}
                          {style === 'cinematic' && '(Full immersion)'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-4 liquid-glass rounded-xl border border-white/10">
                  <label className="block text-white font-medium mb-3">Display Position</label>
                  <div className="space-y-2">
                    {['top', 'bottom'].map((position) => (
                      <label key={position} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="alertPosition"
                          value={position}
                          checked={smartAlertsConfig.alertDisplayPosition === position}
                          onChange={(e) => updateAdminConfig({
                            smartAlertsConfig: {
                              ...smartAlertsConfig,
                              alertDisplayPosition: e.target.value as 'top' | 'bottom'
                            }
                          })}
                          className="w-4 h-4 text-purple-400"
                        />
                        <span className="text-white text-sm capitalize">{position}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Debug & Advanced */}
            <div>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Debug & Advanced
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 liquid-glass rounded-xl border border-white/10">
                  <div>
                    <h4 className="text-white font-medium mb-1">Debug Mode</h4>
                    <p className="text-gray-400 text-sm">Show detailed logging</p>
                  </div>
                  <button
                    onClick={() => updateAdminConfig({
                      smartAlertsConfig: {
                        ...smartAlertsConfig,
                        enableDebugMode: !smartAlertsConfig.enableDebugMode
                      }
                    })}
                    className="flex items-center toggle-button"
                  >
                    {smartAlertsConfig.enableDebugMode ? (
                      <ToggleRight className="w-6 h-6 text-red-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-500" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 liquid-glass rounded-xl border border-white/10">
                  <div>
                    <h4 className="text-white font-medium mb-1">Smart Filtering</h4>
                    <p className="text-gray-400 text-sm">AI-powered alert relevance</p>
                  </div>
                  <button
                    onClick={() => updateAdminConfig({
                      smartAlertsConfig: {
                        ...smartAlertsConfig,
                        enableSmartFiltering: !smartAlertsConfig.enableSmartFiltering
                      }
                    })}
                    className="flex items-center toggle-button"
                  >
                    {smartAlertsConfig.enableSmartFiltering ? (
                      <ToggleRight className="w-6 h-6 text-electric-blue" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 