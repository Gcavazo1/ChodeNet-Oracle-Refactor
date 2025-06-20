import React, { useState, useEffect } from 'react';
import { MessageCircle, Brain, TrendingUp, AlertTriangle, CheckCircle, Clock, Settings, Eye, Users, BarChart3, Target, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ServiceOraclePoll } from '../../services/oracleReferendumService';

interface OracleCommentaryPageProps {
  selectedPoll: ServiceOraclePoll | null;
}

interface OracleCommentaryData {
  id: string;
  poll_id: string;
  analysis_content: string;
  ai_analysis: {
    decision_summary: string;
    implementation_strategy: {
      tasks: Array<{
        task: string;
        timeline: string;
        complexity: string;
        dependencies: string[];
      }>;
    };
    voting_analysis: {
      winner_option: string;
      margin_of_victory: number;
      voting_patterns: any;
    };
    risk_assessment: {
      implementation_risks: string[];
      mitigation_strategies: string[];
      impact_analysis: string;
    };
  };
  implementation_status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'requires_admin_review';
  priority_level: 'low' | 'medium' | 'high' | 'critical';
  complexity_estimate: 'simple' | 'moderate' | 'complex';
  created_at: string;
  admin_notes?: string;
}

export const OracleCommentaryPage: React.FC<OracleCommentaryPageProps> = ({ selectedPoll }) => {
  const [commentary, setCommentary] = useState<OracleCommentaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [allCommentaries, setAllCommentaries] = useState<OracleCommentaryData[]>([]);

  // Load commentary for selected poll
  useEffect(() => {
    const loadCommentary = async () => {
      if (!selectedPoll) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('oracle_commentary')
          .select('*')
          .eq('poll_id', selectedPoll.id)
          .single();

        if (error) {
          console.error('Error loading commentary:', error);
          setCommentary(null);
        } else {
          setCommentary(data);
        }
      } catch (err) {
        console.error('Commentary loading error:', err);
        setCommentary(null);
      } finally {
        setLoading(false);
      }
    };

    loadCommentary();
  }, [selectedPoll]);

  // Load all recent commentaries
  useEffect(() => {
    const loadAllCommentaries = async () => {
      try {
        const { data, error } = await supabase
          .from('oracle_commentary')
          .select(`
            *,
            oracle_polls:poll_id (
              title,
              category,
              voting_end
            )
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error loading all commentaries:', error);
        } else {
          setAllCommentaries(data || []);
        }
      } catch (err) {
        console.error('All commentaries loading error:', err);
      }
    };

    loadAllCommentaries();
  }, []);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'high': return <TrendingUp className="w-4 h-4 text-orange-400" />;
      case 'medium': return <Target className="w-4 h-4 text-yellow-400" />;
      case 'low': return <Clock className="w-4 h-4 text-green-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'in_progress': return <Settings className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'requires_admin_review': return <Eye className="w-4 h-4 text-purple-400" />;
      case 'cancelled': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'text-green-400';
      case 'moderate': return 'text-yellow-400';
      case 'complex': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (!selectedPoll) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <MessageCircle className="w-16 h-16 mx-auto text-purple-400 mb-4" />
          <h2 className="text-2xl font-bold text-white">Oracle Commentary System</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            The AI Arbiter Agent analyzes completed polls and provides comprehensive implementation guidance. 
            Select a poll to view its AI-generated analysis and implementation roadmap.
          </p>
        </div>

        {/* Recent Commentaries Overview */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Recent AI Analysis
          </h3>
          
          <div className="grid gap-4">
            {allCommentaries.map((commentary) => (
              <div
                key={commentary.id}
                className="p-4 bg-slate-800/60 border border-white/10 rounded-xl hover:bg-slate-700/60 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-white line-clamp-1">
                    {(commentary as any).oracle_polls?.title || 'Unknown Poll'}
                  </h4>
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(commentary.priority_level)}
                    {getStatusIcon(commentary.implementation_status)}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Priority:</span>
                    <span className="ml-2 font-medium text-white capitalize">{commentary.priority_level}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className="ml-2 font-medium text-white capitalize">
                      {commentary.implementation_status.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Complexity:</span>
                    <span className={`ml-2 font-medium capitalize ${getComplexityColor(commentary.complexity_estimate)}`}>
                      {commentary.complexity_estimate}
                    </span>
                  </div>
                </div>
                
                <p className="mt-3 text-sm text-gray-300 line-clamp-2">
                  {commentary.ai_analysis?.decision_summary || 'Analysis pending...'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400">Loading Oracle commentary...</p>
        </div>
      </div>
    );
  }

  if (!commentary) {
    return (
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <Brain className="w-16 h-16 mx-auto text-gray-600" />
          <h3 className="text-xl font-semibold text-white">No AI Analysis Available</h3>
          <p className="text-gray-400 max-w-lg mx-auto">
            This poll has not been processed by the AI Arbiter Agent yet. Commentary will be available once the poll is completed and analyzed.
          </p>
        </div>
        
        <div className="p-6 bg-slate-800/40 border border-white/10 rounded-xl text-left max-w-2xl mx-auto">
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            Analysis Timeline
          </h4>
          <div className="space-y-2 text-sm text-gray-300">
            <p>• Polls are analyzed within 15 minutes of completion</p>
            <p>• AI Arbiter Agent runs automatically every 15 minutes</p>
            <p>• Implementation roadmaps are generated using LLaMA AI</p>
            <p>• Critical decisions require admin review before implementation</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">AI Analysis & Implementation</h2>
          <p className="text-gray-300">Comprehensive poll analysis by the AI Arbiter Agent</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {getPriorityIcon(commentary.priority_level)}
            <span className="text-sm font-medium text-white capitalize">{commentary.priority_level} Priority</span>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusIcon(commentary.implementation_status)}
            <span className="text-sm font-medium text-white capitalize">
              {commentary.implementation_status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Analysis Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-4 bg-slate-800/60 border border-white/10 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Voting Analysis</span>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-gray-300">
              Winner: <span className="text-white font-medium">{commentary.ai_analysis?.voting_analysis?.winner_option || 'N/A'}</span>
            </p>
            <p className="text-gray-300">
              Margin: <span className="text-white font-medium">{commentary.ai_analysis?.voting_analysis?.margin_of_victory || 0}%</span>
            </p>
          </div>
        </div>
        
        <div className="p-4 bg-slate-800/60 border border-white/10 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">Complexity</span>
          </div>
          <div className="space-y-1 text-sm">
            <p className={`font-medium capitalize ${getComplexityColor(commentary.complexity_estimate)}`}>
              {commentary.complexity_estimate}
            </p>
            <p className="text-gray-400 text-xs">Implementation difficulty</p>
          </div>
        </div>
        
        <div className="p-4 bg-slate-800/60 border border-white/10 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-white">Analysis Date</span>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-white font-medium">
              {new Date(commentary.created_at).toLocaleDateString()}
            </p>
            <p className="text-gray-400 text-xs">
              {new Date(commentary.created_at).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Decision Summary */}
      <div className="p-6 bg-gradient-to-br from-purple-900/30 to-slate-800/60 border border-purple-400/30 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          AI Decision Summary
        </h3>
        <p className="text-gray-200 leading-relaxed">
          {commentary.ai_analysis?.decision_summary || commentary.analysis_content}
        </p>
      </div>

      {/* Implementation Strategy */}
      {commentary.ai_analysis?.implementation_strategy?.tasks && commentary.ai_analysis.implementation_strategy.tasks.length > 0 && (
        <div className="p-6 bg-slate-800/60 border border-white/10 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Implementation Roadmap
          </h3>
          
          <div className="space-y-4">
            {commentary.ai_analysis.implementation_strategy.tasks.map((task, index) => (
              <div key={index} className="p-4 bg-slate-700/40 border border-white/5 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-white">{task.task}</h4>
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                    {task.timeline}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                  <div>
                    <span className="text-gray-400">Complexity:</span>
                    <span className="ml-2 text-white">{task.complexity}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Dependencies:</span>
                    <span className="ml-2 text-white">{task.dependencies?.length || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Assessment */}
      {commentary.ai_analysis?.risk_assessment && (
        <div className="p-6 bg-red-900/20 border border-red-400/30 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Risk Assessment
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-white mb-3">Implementation Risks</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                {commentary.ai_analysis.risk_assessment.implementation_risks?.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-white mb-3">Mitigation Strategies</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                {commentary.ai_analysis.risk_assessment.mitigation_strategies?.map((strategy, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    {strategy}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {commentary.ai_analysis.risk_assessment.impact_analysis && (
            <div className="mt-6 p-4 bg-slate-800/40 rounded-lg">
              <h4 className="font-medium text-white mb-2">Impact Analysis</h4>
              <p className="text-sm text-gray-300">
                {commentary.ai_analysis.risk_assessment.impact_analysis}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Admin Notes */}
      {commentary.admin_notes && (
        <div className="p-6 bg-cyan-900/20 border border-cyan-400/30 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Admin Notes
          </h3>
          <p className="text-gray-200 leading-relaxed">
            {commentary.admin_notes}
          </p>
        </div>
      )}
    </div>
  );
}; 