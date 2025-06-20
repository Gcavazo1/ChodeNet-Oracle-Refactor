import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertTriangle, Settings, Play, Pause, RotateCcw, Eye, Calendar, TrendingUp, Users, MessageSquare, Target, Zap, Bell, ChevronRight, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PollCompletionEvent {
  id: string;
  poll_id: string;
  completion_data: {
    poll_id: string;
    completed_at: string;
    total_votes: number;
    winner_option_id: string;
    final_vote_counts: Array<{
      option_id: string;
      text: string;
      votes: number;
    }>;
  };
  processing_status: string;
  ai_analysis_started_at: string | null;
  ai_analysis_completed_at: string | null;
  admin_review_required: boolean;
  admin_reviewed_at: string | null;
  admin_reviewed_by: string | null;
  implementation_started_at: string | null;
  implementation_completed_at: string | null;
  implementation_notes: string | null;
  created_at: string;
  updated_at: string;
  poll_title?: string;
  poll_category?: string;
}

interface ImplementationTask {
  id: string;
  poll_title: string;
  task_title: string;
  priority_level: 'low' | 'medium' | 'high' | 'critical';
  complexity_estimate: 'simple' | 'moderate' | 'complex';
  status: string;
  days_pending: number;
  assigned_to: string | null;
}

interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  read_status: boolean;
  action_required: boolean;
  created_at: string;
  data?: any;
}

interface PollCompletionMetrics {
  total_completed_polls: number;
  pending_analysis: number;
  awaiting_admin_review: number;
  implementation_in_progress: number;
  completed_successfully: number;
  average_completion_time_hours: number;
  unread_admin_notifications: number;
  critical_notifications: number;
}

export const PollManagement: React.FC = () => {
  const [completionEvents, setCompletionEvents] = useState<PollCompletionEvent[]>([]);
  const [implementationTasks, setImplementationTasks] = useState<ImplementationTask[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [completionMetrics, setCompletionMetrics] = useState<PollCompletionMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'tasks' | 'notifications'>('overview');
  const [processingPoll, setProcessingPoll] = useState<string | null>(null);

  useEffect(() => {
    loadEnhancedPollData();
  }, []);

  const loadEnhancedPollData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCompletionEvents(),
        loadImplementationTasks(),
        loadAdminNotifications(),
        loadCompletionMetrics()
      ]);
    } catch (error) {
      console.error('Failed to load enhanced poll data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompletionEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('poll_completion_events')
        .select(`
          *,
          oracle_polls!inner(
            title,
            category
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const eventsWithPollInfo = data?.map(event => ({
        ...event,
        poll_title: event.oracle_polls?.title,
        poll_category: event.oracle_polls?.category
      })) || [];

      setCompletionEvents(eventsWithPollInfo);
    } catch (error) {
      console.error('Failed to load completion events:', error);
    }
  };

  const loadImplementationTasks = async () => {
    try {
      const { data, error } = await supabase.rpc('get_pending_implementation_tasks');
      
      if (error) throw error;
      setImplementationTasks(data || []);
    } catch (error) {
      console.error('Failed to load implementation tasks:', error);
    }
  };

  const loadAdminNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('read_status', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAdminNotifications(data || []);
    } catch (error) {
      console.error('Failed to load admin notifications:', error);
    }
  };

  const loadCompletionMetrics = async () => {
    try {
      const { data, error } = await supabase.rpc('get_poll_completion_metrics');
      
      if (error) throw error;
      setCompletionMetrics(data);
    } catch (error) {
      console.error('Failed to load completion metrics:', error);
    }
  };

  const triggerPollCompletion = async (pollId: string) => {
    setProcessingPoll(pollId);
    try {
      const { data, error } = await supabase.functions.invoke('poll-completion-trigger', {
        body: { poll_id: pollId }
      });

      if (error) throw error;
      
      console.log('Poll completion triggered:', data);
      await loadEnhancedPollData();
    } catch (error) {
      console.error('Failed to trigger poll completion:', error);
      alert('Failed to trigger poll completion processing');
    } finally {
      setProcessingPoll(null);
    }
  };

  const updateCompletionStatus = async (eventId: string, newStatus: string, notes?: string) => {
    try {
      const { data, error } = await supabase.rpc('update_poll_completion_status', {
        completion_event_id: eventId,
        new_status: newStatus,
        admin_wallet: 'admin_user', // Replace with actual admin wallet
        notes: notes || null
      });

      if (error) throw error;
      
      await loadEnhancedPollData();
    } catch (error) {
      console.error('Failed to update completion status:', error);
      alert('Failed to update completion status');
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      const { data, error } = await supabase.rpc('mark_admin_notification_read', {
        notification_id: notificationId,
        admin_wallet: 'admin_user' // Replace with actual admin wallet
      });

      if (error) throw error;
      
      await loadAdminNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_analysis':
      case 'analysis_in_progress':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'analysis_complete':
      case 'implementation_planning':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'awaiting_admin_review':
        return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'implementation_approved':
      case 'implementation_in_progress':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      case 'implementation_complete':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'implementation_failed':
      case 'cancelled':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'high':
        return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'low':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Poll Completion Management Header */}
      <div className="liquid-glass-intense rounded-3xl p-6 border border-electric-blue/30">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-6 h-6 text-electric-blue" />
          <h2 className="text-xl font-bold text-white">Enhanced Poll Completion Management</h2>
          <div className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
            completionMetrics?.critical_notifications ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
          }`}>
            {completionMetrics?.critical_notifications || 0} Critical
          </div>
        </div>

        {/* Metrics Overview */}
        {completionMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 liquid-glass rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-400">Total Completed</div>
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">{completionMetrics.total_completed_polls}</div>
            </div>
            
            <div className="p-4 liquid-glass rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-400">Pending Analysis</div>
                <Clock className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-yellow-400">{completionMetrics.pending_analysis}</div>
            </div>
            
            <div className="p-4 liquid-glass rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-400">Admin Review</div>
                <AlertTriangle className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-orange-400">{completionMetrics.awaiting_admin_review}</div>
            </div>
            
            <div className="p-4 liquid-glass rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-400">Avg. Time (hrs)</div>
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-400">{completionMetrics.average_completion_time_hours || 0}</div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'events', label: 'Completion Events', icon: Calendar },
            { id: 'tasks', label: 'Implementation Tasks', icon: Settings },
            { id: 'notifications', label: 'Admin Notifications', icon: Bell }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-electric-blue border-electric-blue'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === 'notifications' && adminNotifications.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                  {adminNotifications.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-electric-blue" />
                  <span>Quick Actions</span>
                </h3>
                
                <button
                  onClick={() => triggerPollCompletion('manual-trigger')}
                  disabled={processingPoll !== null}
                  className="w-full p-4 liquid-glass rounded-xl border border-electric-blue/30 hover:border-electric-blue/50 text-left transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Trigger Poll Completion Check</div>
                      <div className="text-sm text-gray-400">Manually check for recently ended polls</div>
                    </div>
                    <Play className="w-5 h-5 text-electric-blue" />
                  </div>
                </button>
                
                <button
                  onClick={loadEnhancedPollData}
                  disabled={loading}
                  className="w-full p-4 liquid-glass rounded-xl border border-white/10 hover:border-white/20 text-left transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Refresh All Data</div>
                      <div className="text-sm text-gray-400">Reload completion events, tasks, and notifications</div>
                    </div>
                    <RotateCcw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
                  </div>
                </button>
              </div>

              {/* Recent Activity */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-electric-blue" />
                  <span>Recent Activity</span>
                </h3>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {completionEvents.slice(0, 5).map(event => (
                    <div key={event.id} className="p-3 liquid-glass rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm font-medium text-white truncate">
                          {event.poll_title || 'Unknown Poll'}
                        </div>
                        <div className="text-xs text-gray-400">{formatTimeAgo(event.created_at)}</div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(event.processing_status)}`}>
                        {event.processing_status.replace(/_/g, ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Poll Completion Events</h3>
              <button
                onClick={loadCompletionEvents}
                className="text-sm text-electric-blue hover:text-white flex items-center space-x-1"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {completionEvents.map(event => (
                <div key={event.id} className="p-4 liquid-glass rounded-xl border border-white/10 hover:border-white/20 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-medium text-white mb-1">{event.poll_title || 'Unknown Poll'}</div>
                      <div className="text-sm text-gray-400">
                        Total Votes: {event.completion_data.total_votes} • Completed: {formatTimeAgo(event.created_at)}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(event.processing_status)}`}>
                      {event.processing_status.replace(/_/g, ' ')}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    {event.ai_analysis_completed_at && (
                      <div className="flex items-center space-x-1 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>AI Analysis Complete</span>
                      </div>
                    )}
                    {event.admin_review_required && !event.admin_reviewed_at && (
                      <div className="flex items-center space-x-1 text-orange-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Admin Review Required</span>
                      </div>
                    )}
                    {event.implementation_completed_at && (
                      <div className="flex items-center space-x-1 text-blue-400">
                        <Target className="w-4 h-4" />
                        <span>Implementation Complete</span>
                      </div>
                    )}
                  </div>
                  
                  {event.processing_status === 'awaiting_admin_review' && (
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={() => updateCompletionStatus(event.id, 'implementation_approved')}
                        className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                      >
                        Approve Implementation
                      </button>
                      <button
                        onClick={() => updateCompletionStatus(event.id, 'cancelled', 'Rejected by admin')}
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Implementation Tasks</h3>
              <button
                onClick={loadImplementationTasks}
                className="text-sm text-electric-blue hover:text-white flex items-center space-x-1"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {implementationTasks.map(task => (
                <div key={task.id} className="p-4 liquid-glass rounded-xl border border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-white">{task.task_title}</div>
                      <div className="text-sm text-gray-400">Poll: {task.poll_title}</div>
                    </div>
                    <div className="flex space-x-2">
                      <div className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(task.priority_level)}`}>
                        {task.priority_level}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(task.status)}`}>
                        {task.status}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-400">
                      Complexity: {task.complexity_estimate} • Pending: {task.days_pending} days
                    </div>
                    {task.assigned_to && (
                      <div className="text-blue-400">Assigned: {task.assigned_to}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Admin Notifications</h3>
              <button
                onClick={loadAdminNotifications}
                className="text-sm text-electric-blue hover:text-white flex items-center space-x-1"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {adminNotifications.map(notification => (
                <div key={notification.id} className="p-4 liquid-glass rounded-xl border border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="font-medium text-white">{notification.title}</div>
                        <div className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(notification.urgency)}`}>
                          {notification.urgency}
                        </div>
                        {notification.action_required && (
                          <div className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs border border-orange-400/30">
                            Action Required
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-300">{notification.message}</div>
                      <div className="text-xs text-gray-400 mt-1">{formatTimeAgo(notification.created_at)}</div>
                    </div>
                    
                    <button
                      onClick={() => markNotificationRead(notification.id)}
                      className="ml-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  
                  {notification.data?.poll_id && (
                    <div className="mt-3 flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <div className="text-sm text-gray-400">Related Poll: {notification.data.poll_id}</div>
                      <button className="text-xs text-electric-blue hover:text-white flex items-center space-x-1">
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 