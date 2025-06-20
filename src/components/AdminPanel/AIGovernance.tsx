import React from 'react'
import { 
  Shield, AlertTriangle, StopCircle, CheckCircle, XCircle,
  Clock, Lock, Unlock, Eye, Settings, RefreshCw, Zap,
  Brain, Activity, Target, Users, Calendar, Bell
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

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

interface Props {
  aiGovernanceStatus: AIGovernanceStatus
  loadAIGovernanceStatus: () => Promise<void>
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
)

export const AIGovernance: React.FC<Props> = ({
  aiGovernanceStatus,
  loadAIGovernanceStatus
}) => {
  const toggleEmergencyBrake = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-governance-actions', {
        body: {
          action: 'toggle_emergency_brake',
          active: !aiGovernanceStatus.emergencyBrakeActive
        }
      })
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }
      
      if (data?.success) {
        alert(aiGovernanceStatus.emergencyBrakeActive 
          ? 'Emergency brake deactivated - AI systems resumed'
          : 'Emergency brake activated - All AI systems halted')
        await loadAIGovernanceStatus()
      } else {
        alert('Failed to toggle emergency brake: ' + (data?.error || 'Unknown error'))
      }

    } catch (error) {
      console.error('Error toggling emergency brake:', error)
      alert('Failed to toggle emergency brake: ' + (error as Error).message)
    }
  }

  const openOverrideWindow = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-governance-actions', {
        body: {
          action: 'open_override_window',
          duration_minutes: 30
        }
      })
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }
      
      if (data?.success) {
        alert('Admin override window opened for 30 minutes')
        await loadAIGovernanceStatus()
      } else {
        alert('Failed to open override window: ' + (data?.error || 'Unknown error'))
      }

    } catch (error) {
      console.error('Error opening override window:', error)
      alert('Failed to open override window: ' + (error as Error).message)
    }
  }

  const approveDecision = async (approvalId: string, approve: boolean) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-governance-actions', {
        body: {
          action: 'review_approval',
          approval_id: approvalId,
          approved: approve
        }
      })
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }
      
      if (data?.success) {
        alert(approve ? 'Decision approved successfully' : 'Decision rejected')
        await loadAIGovernanceStatus()
      } else {
        alert('Failed to process approval: ' + (data?.error || 'Unknown error'))
      }

    } catch (error) {
      console.error('Error processing approval:', error)
      alert('Failed to process approval: ' + (error as Error).message)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 border-red-500/30'
      case 'high': return 'text-orange-400 border-orange-500/30'
      case 'medium': return 'text-yellow-400 border-yellow-500/30'
      case 'low': return 'text-green-400 border-green-500/30'
      default: return 'text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="mb-8">
      <div className="liquid-glass-intense rounded-3xl p-6 border border-red-500/30">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-red-400" />
          <h2 className="text-xl font-bold text-white">AI Governance Control System</h2>
          <div className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
            aiGovernanceStatus.systemHealthStatus === 'healthy'
              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
              : aiGovernanceStatus.systemHealthStatus === 'warning'
              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {aiGovernanceStatus.systemHealthStatus.toUpperCase()}
          </div>
        </div>

        {/* Emergency Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className={`liquid-glass rounded-xl p-4 border ${
            aiGovernanceStatus.emergencyBrakeActive 
              ? 'border-red-500/50 bg-red-500/5' 
              : 'border-white/10'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <StopCircle className={`w-5 h-5 ${
                  aiGovernanceStatus.emergencyBrakeActive ? 'text-red-400' : 'text-gray-400'
                }`} />
                <span className="text-white font-medium">Emergency Brake</span>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                aiGovernanceStatus.emergencyBrakeActive
                  ? 'bg-red-500/20 text-red-300'
                  : 'bg-green-500/20 text-green-300'
              }`}>
                {aiGovernanceStatus.emergencyBrakeActive ? 'ACTIVE' : 'INACTIVE'}
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              {aiGovernanceStatus.emergencyBrakeActive 
                ? 'All AI systems are currently halted'
                : 'AI systems operating normally'
              }
            </p>
            <button
              onClick={toggleEmergencyBrake}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                aiGovernanceStatus.emergencyBrakeActive
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30 hover:border-green-500/50'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30 hover:border-red-500/50'
              }`}
            >
              {aiGovernanceStatus.emergencyBrakeActive ? (
                <>
                  <Unlock className="w-4 h-4 inline mr-2" />
                  Release Emergency Brake
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 inline mr-2" />
                  Activate Emergency Brake
                </>
              )}
            </button>
          </div>

          <div className={`liquid-glass rounded-xl p-4 border ${
            aiGovernanceStatus.overrideWindowOpen 
              ? 'border-yellow-500/50 bg-yellow-500/5' 
              : 'border-white/10'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className={`w-5 h-5 ${
                  aiGovernanceStatus.overrideWindowOpen ? 'text-yellow-400' : 'text-gray-400'
                }`} />
                <span className="text-white font-medium">Admin Override</span>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                aiGovernanceStatus.overrideWindowOpen
                  ? 'bg-yellow-500/20 text-yellow-300'
                  : 'bg-gray-500/20 text-gray-300'
              }`}>
                {aiGovernanceStatus.overrideWindowOpen ? 'OPEN' : 'CLOSED'}
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              {aiGovernanceStatus.overrideWindowOpen 
                ? `Expires: ${aiGovernanceStatus.overrideWindowEndsAt?.toLocaleTimeString()}`
                : 'Temporarily bypass approval requirements'
              }
            </p>
            <button
              onClick={openOverrideWindow}
              disabled={aiGovernanceStatus.overrideWindowOpen}
              className="w-full px-4 py-2 rounded-lg font-medium transition-colors bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:border-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4 inline mr-2" />
              Open Override Window
            </button>
          </div>
        </div>

        {/* AI Agents Status */}
        <div className="mb-6">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Agents Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(aiGovernanceStatus.aiAgentsActive).map(([agent, active]) => (
              <div key={agent} className="liquid-glass rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${
                    active && !aiGovernanceStatus.emergencyBrakeActive 
                      ? 'bg-green-400' 
                      : 'bg-gray-600'
                  }`} />
                  <span className="text-white text-sm font-medium capitalize">{agent}</span>
                </div>
                <div className="text-xs text-gray-400">
                  {active && !aiGovernanceStatus.emergencyBrakeActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Pending Approvals ({aiGovernanceStatus.pendingApprovals.length})
            </h3>
            <button
              onClick={loadAIGovernanceStatus}
              className="p-2 liquid-glass rounded-lg border border-electric-blue/30 hover:border-electric-blue/50 transition-colors text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          
          {aiGovernanceStatus.pendingApprovals.length === 0 ? (
            <div className="liquid-glass rounded-xl p-4 border border-white/10 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-gray-400">No pending approvals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {aiGovernanceStatus.pendingApprovals.map((approval) => (
                <div key={approval.id} className="liquid-glass rounded-xl p-4 border border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">{approval.title}</span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(approval.priority)}`}>
                          {approval.priority.toUpperCase()}
                        </div>
                        {approval.requires_admin_approval && (
                          <div className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            ADMIN REQUIRED
                          </div>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{approval.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {approval.created_at.toLocaleDateString()}
                        </span>
                        <span className="capitalize">{approval.type.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => approveDecision(approval.id, false)}
                        className="p-2 liquid-glass rounded-lg border border-red-500/30 hover:border-red-500/50 transition-colors text-red-400"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => approveDecision(approval.id, true)}
                        className="p-2 liquid-glass rounded-lg border border-green-500/30 hover:border-green-500/50 transition-colors text-green-400"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Governance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="liquid-glass rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-electric-blue" />
              <span className="text-white font-medium">Total</span>
            </div>
            <div className="text-lg font-bold text-white">{aiGovernanceStatus.governanceMetrics.totalDecisions}</div>
            <div className="text-xs text-gray-400">Decisions</div>
          </div>

          <div className="liquid-glass rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-white font-medium">Auto</span>
            </div>
            <div className="text-lg font-bold text-white">{aiGovernanceStatus.governanceMetrics.autoApproved}</div>
            <div className="text-xs text-gray-400">Approved</div>
          </div>

          <div className="liquid-glass rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-medium">Manual</span>
            </div>
            <div className="text-lg font-bold text-white">{aiGovernanceStatus.governanceMetrics.manuallyApproved}</div>
            <div className="text-xs text-gray-400">Reviewed</div>
          </div>

          <div className="liquid-glass rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-white font-medium">Rejected</span>
            </div>
            <div className="text-lg font-bold text-white">{aiGovernanceStatus.governanceMetrics.rejected}</div>
            <div className="text-xs text-gray-400">Decisions</div>
          </div>

          <div className="liquid-glass rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <span className="text-white font-medium">Override</span>
            </div>
            <div className="text-lg font-bold text-white">{aiGovernanceStatus.governanceMetrics.emergencyOverrides}</div>
            <div className="text-xs text-gray-400">Emergency</div>
          </div>
        </div>
      </div>
    </div>
  )
} 