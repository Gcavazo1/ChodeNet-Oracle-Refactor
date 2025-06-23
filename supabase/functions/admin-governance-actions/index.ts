// ADMIN GOVERNANCE ACTIONS - Handle Admin Controls for AI Poll System
// Manages poll approval, rejection, emergency brake, and configuration updates
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
};
// Initialize Supabase client with service role for full access
const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
/**
 * POLL APPROVAL FUNCTIONS
 */ async function approvePollDraft(adminWallet, data) {
  try {
    // Get the poll draft
    const { data: draft, error: draftError } = await supabaseAdmin.from('poll_drafts').select('*').eq('id', data.draft_id).eq('draft_status', 'pending_approval').single();
    if (draftError || !draft) {
      return {
        success: false,
        error: 'Poll draft not found or not pending approval'
      };
    }
    // Apply any modifications to poll data
    let pollData = draft.poll_data;
    if (data.modifications) {
      pollData = {
        ...pollData,
        ...data.modifications
      };
    }
    // Create the actual poll in oracle_polls table
    const { data: poll, error: pollError } = await supabaseAdmin.from('oracle_polls').insert({
      title: pollData.title,
      description: pollData.description,
      category: pollData.category,
      creator_wallet: 'ai_prophet_agent',
      voting_start: new Date().toISOString(),
      voting_end: new Date(Date.now() + pollData.voting_duration_hours * 60 * 60 * 1000).toISOString(),
      cooldown_hours: pollData.cooldown_hours,
      oracle_commentary: pollData.oracle_commentary,
      ai_generated: true,
      source_decision_id: draft.source_decision_id
    }).select().single();
    if (pollError) {
      return {
        success: false,
        error: 'Failed to create poll: ' + pollError.message
      };
    }
    // Create poll options
    for (const [index, option] of pollData.options.entries()){
      await supabaseAdmin.from('poll_options').insert({
        poll_id: poll.id,
        option_text: option.option_text,
        description: option.description,
        display_order: index + 1,
        metadata: {
          impact_summary: option.impact_summary,
          stakeholder_effects: option.stakeholder_effects,
          ai_generated: true,
          admin_approved: true
        }
      });
    }
    // Update draft status
    await supabaseAdmin.from('poll_drafts').update({
      draft_status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: adminWallet,
      poll_id: poll.id
    }).eq('id', data.draft_id);
    // Update the AI decision to link to the created poll
    await supabaseAdmin.from('ai_decisions').update({
      poll_id: poll.id
    }).eq('id', draft.source_decision_id);
    // Log admin action
    await logAdminAction(adminWallet, 'poll_approved', {
      poll_draft_id: data.draft_id,
      poll_id: poll.id,
      reasoning: data.reasoning,
      modifications_applied: data.modifications ? true : false
    });
    return {
      success: true,
      poll_id: poll.id,
      message: 'Poll approved and created successfully'
    };
  } catch (error) {
    console.error('Error approving poll:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
async function rejectPollDraft(adminWallet, data) {
  try {
    // Update draft status
    const { error: updateError } = await supabaseAdmin.from('poll_drafts').update({
      draft_status: 'rejected',
      rejection_reason: data.reason,
      approved_by: adminWallet
    }).eq('id', data.draft_id).eq('draft_status', 'pending_approval');
    if (updateError) {
      return {
        success: false,
        error: 'Failed to reject poll: ' + updateError.message
      };
    }
    // Log admin action
    await logAdminAction(adminWallet, 'poll_rejected', {
      poll_draft_id: data.draft_id,
      reasoning: data.reason
    });
    return {
      success: true,
      message: 'Poll draft rejected successfully'
    };
  } catch (error) {
    console.error('Error rejecting poll:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
/**
 * EMERGENCY CONTROLS
 */ async function triggerEmergencyBrake(adminWallet, data) {
  try {
    const expiresAt = new Date(Date.now() + data.duration_hours * 60 * 60 * 1000);
    // Update emergency brake status
    const { error: brakeError } = await supabaseAdmin.from('emergency_brake_status').update({
      active: true,
      reason: data.reason,
      duration_hours: data.duration_hours,
      activated_by: adminWallet,
      activated_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      deactivated_at: null,
      deactivated_by: null
    }).eq('id', 1);
    if (brakeError) {
      return {
        success: false,
        error: 'Failed to activate emergency brake: ' + brakeError.message
      };
    }
    // We don't need to update AI agents table as it doesn't exist in this schema
    // Instead, we'll just log the action
    // Log admin action
    await logAdminAction(adminWallet, 'emergency_brake', {
      reason: data.reason,
      duration_hours: data.duration_hours,
      affected_agents: data.affected_agents,
      expires_at: expiresAt.toISOString()
    });
    return {
      success: true,
      message: `Emergency brake activated for ${data.duration_hours} hours`,
      expires_at: expiresAt.toISOString()
    };
  } catch (error) {
    console.error('Error activating emergency brake:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
async function overridePoll(adminWallet, data) {
  try {
    let updateData = {};
    switch(data.action){
      case 'pause':
        updateData.execution_status = 'admin_paused';
        break;
      case 'cancel':
        updateData.execution_status = 'admin_cancelled';
        updateData.voting_end = new Date().toISOString(); // End voting immediately
        break;
      case 'modify':
        if (data.modifications) {
          updateData = {
            ...updateData,
            ...data.modifications
          };
        }
        break;
    }
    // Update the poll
    const { error: pollError } = await supabaseAdmin.from('oracle_polls').update(updateData).eq('id', data.poll_id);
    if (pollError) {
      return {
        success: false,
        error: 'Failed to override poll: ' + pollError.message
      };
    }
    // Log admin action
    await logAdminAction(adminWallet, 'override_used', {
      poll_id: data.poll_id,
      override_action: data.action,
      reasoning: data.reason,
      modifications: data.modifications
    });
    return {
      success: true,
      message: `Poll ${data.action} action applied successfully`
    };
  } catch (error) {
    console.error('Error overriding poll:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
/**
 * CONFIGURATION MANAGEMENT
 */ async function updateGovernanceConfig(adminWallet, data) {
  try {
    // Update or insert governance configuration
    const { error: configError } = await supabaseAdmin.from('ai_governance_config').upsert({
      decision_category: data.category,
      autonomy_level: data.autonomy_level,
      severity_threshold: data.severity_threshold,
      admin_override_window_hours: data.admin_override_window_hours,
      updated_at: new Date().toISOString()
    });
    if (configError) {
      return {
        success: false,
        error: 'Failed to update config: ' + configError.message
      };
    }
    // Log admin action
    await logAdminAction(adminWallet, 'config_updated', {
      config_update: data
    });
    return {
      success: true,
      message: 'Governance configuration updated successfully'
    };
  } catch (error) {
    console.error('Error updating config:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
/**
 * UTILITY FUNCTIONS
 */ async function logAdminAction(adminWallet, actionType, actionData) {
  try {
    await supabaseAdmin.from('admin_governance_log').insert({
      admin_wallet: adminWallet,
      action_type: actionType,
      poll_draft_id: actionData.poll_draft_id || null,
      poll_id: actionData.poll_id || null,
      reasoning: actionData.reasoning || '',
      action_data: actionData
    });
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
}
async function getPendingApprovals() {
  try {
    const { data: pendingDrafts, error } = await supabaseAdmin.from('poll_drafts').select(`
        *,
        ai_decisions!source_decision_id(
          decision_type,
          reasoning,
          confidence_score
        )
      `).eq('draft_status', 'pending_approval').order('created_at', {
      ascending: true
    });
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }
    return {
      success: true,
      pending_approvals: pendingDrafts || []
    };
  } catch (error) {
    console.error('Error getting pending approvals:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
async function getOverrideWindows() {
  try {
    const { data: overrideWindows, error } = await supabaseAdmin.from('admin_override_windows').select(`
        *,
        oracle_polls(
          id,
          title,
          voting_end
        )
      `).eq('override_used', false).gt('admin_override_deadline', new Date().toISOString()).order('admin_override_deadline', {
      ascending: true
    });
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }
    return {
      success: true,
      override_windows: overrideWindows || []
    };
  } catch (error) {
    console.error('Error getting override windows:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
/**
 * MAIN HANDLER
 */ async function handleAdminGovernanceAction(request) {
  const { action, admin_wallet, data } = request;
  // Validate admin wallet (you might want to check against a whitelist)
  if (!admin_wallet) {
    return {
      success: false,
      error: 'Admin wallet address required'
    };
  }
  switch(action){
    case 'approve_poll':
      return await approvePollDraft(admin_wallet, data);
    case 'reject_poll':
      return await rejectPollDraft(admin_wallet, data);
    case 'emergency_brake':
      return await triggerEmergencyBrake(admin_wallet, data);
    case 'override_poll':
      return await overridePoll(admin_wallet, data);
    case 'update_config':
      return await updateGovernanceConfig(admin_wallet, data);
    default:
      return {
        success: false,
        error: 'Unknown action: ' + action
      };
  }
}
/**
 * EDGE FUNCTION HANDLER
 */ serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const action = url.searchParams.get('action');
      if (action === 'pending_approvals') {
        const result = await getPendingApprovals();
        return new Response(JSON.stringify(result), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      } else if (action === 'override_windows') {
        const result = await getOverrideWindows();
        return new Response(JSON.stringify(result), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    }
    if (req.method === 'POST') {
      const requestData = await req.json();
      const result = await handleAdminGovernanceAction(requestData);
      return new Response(JSON.stringify(result), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: result.success ? 200 : 400
      });
    }
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Admin governance action failed'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
