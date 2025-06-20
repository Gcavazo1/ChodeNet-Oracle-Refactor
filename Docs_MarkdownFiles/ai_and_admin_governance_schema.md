## admin_governance_log:

create table public.admin_governance_log (
  id bigserial not null,
  admin_wallet text not null,
  action_type text not null,
  poll_draft_id bigint null,
  poll_id uuid null,
  reasoning text null,
  action_data jsonb null default '{}'::jsonb,
  created_at timestamp with time zone null default now(),
  constraint admin_governance_log_pkey primary key (id),
  constraint admin_governance_log_poll_draft_id_fkey foreign KEY (poll_draft_id) references poll_drafts (id),
  constraint admin_governance_log_poll_id_fkey foreign KEY (poll_id) references oracle_polls (id)
) TABLESPACE pg_default;

create index IF not exists idx_admin_governance_log_admin on public.admin_governance_log using btree (admin_wallet) TABLESPACE pg_default;


create table public.admin_governance_log (
  id bigserial not null,
  admin_wallet text not null,
  action_type text not null,
  poll_draft_id bigint null,
  poll_id uuid null,
  reasoning text null,
  action_data jsonb null default '{}'::jsonb,
  created_at timestamp with time zone null default now(),
  constraint admin_governance_log_pkey primary key (id),
  constraint admin_governance_log_poll_draft_id_fkey foreign KEY (poll_draft_id) references poll_drafts (id),
  constraint admin_governance_log_poll_id_fkey foreign KEY (poll_id) references oracle_polls (id)
) TABLESPACE pg_default;

## ai_decision_context

create table public.ai_decision_context (
  id bigserial not null,
  context_type text not null,
  severity_level integer null,
  data_snapshot jsonb null,
  processed boolean null default false,
  created_at timestamp with time zone null default now(),
  metadata jsonb null,
  constraint ai_decision_context_pkey primary key (id)
) TABLESPACE pg_default;

## ai_decision


create table public.ai_decisions (
  id bigserial not null,
  decision_type text not null,
  decision_title text not null,
  decision_description text not null,
  reasoning text not null,
  confidence_score integer not null,
  severity_level integer not null,
  data_sources jsonb null default '{}'::jsonb,
  poll_id uuid null,
  created_at timestamp with time zone null default now(),
  processed_at timestamp with time zone null,
  autonomy_level text null default 'admin_notified'::text,
  admin_action_required boolean null default false,
  governance_classification jsonb null default '{}'::jsonb,
  context_id bigint null,
  requires_vote boolean null default true,
  executed boolean null default false,
  constraint ai_decisions_pkey primary key (id),
  constraint ai_decisions_context_id_fkey foreign KEY (context_id) references ai_decision_context (id),
  constraint ai_decisions_poll_id_fkey foreign KEY (poll_id) references oracle_polls (id),
  constraint ai_decisions_confidence_score_check check (
    (
      (confidence_score >= 1)
      and (confidence_score <= 10)
    )
  ),
  constraint ai_decisions_severity_level_check check (
    (
      (severity_level >= 1)
      and (severity_level <= 10)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_ai_decisions_type on public.ai_decisions using btree (decision_type) TABLESPACE pg_default;

create index IF not exists idx_ai_decisions_severity on public.ai_decisions using btree (severity_level) TABLESPACE pg_default;

## ai_governance_config


create table public.ai_governance_config (
  id bigserial not null,
  decision_category text not null,
  autonomy_level text not null,
  severity_threshold integer not null,
  admin_override_window_hours integer null default 24,
  requires_admin_approval boolean null default false,
  emergency_bypass_allowed boolean null default true,
  config_json jsonb null default '{}'::jsonb,
  active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint ai_governance_config_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_ai_governance_config_category on public.ai_governance_config using btree (decision_category) TABLESPACE pg_default;

create index IF not exists idx_ai_governance_config_active on public.ai_governance_config using btree (active) TABLESPACE pg_default;

## admin_override_windows


create table public.admin_override_windows (
  id bigserial not null,
  poll_id uuid not null,
  admin_override_deadline timestamp with time zone not null,
  override_used boolean null default false,
  override_action text null,
  override_reason text null,
  override_by text null,
  created_at timestamp with time zone null default now(),
  constraint admin_override_windows_pkey primary key (id),
  constraint admin_override_windows_poll_id_fkey foreign KEY (poll_id) references oracle_polls (id)
) TABLESPACE pg_default;

create index IF not exists idx_admin_override_deadline on public.admin_override_windows using btree (admin_override_deadline) TABLESPACE pg_default;

## emergency_brake_status


create table public.emergency_brake_status (
  id bigserial not null,
  active boolean null default false,
  reason text null,
  duration_hours integer null default 24,
  activated_at timestamp with time zone null,
  activated_by text null,
  expires_at timestamp with time zone null,
  deactivated_at timestamp with time zone null,
  deactivated_by text null,
  constraint emergency_brake_status_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_emergency_brake_active on public.emergency_brake_status using btree (active) TABLESPACE pg_default;

## oracle_polls

create table public.oracle_polls (
  id uuid not null default extensions.uuid_generate_v4 (),
  title text not null,
  description text not null,
  category text not null,
  ai_generated boolean null default true,
  voting_start timestamp with time zone not null,
  voting_end timestamp with time zone not null,
  oracle_shards_reward integer not null default 10,
  girth_reward_pool integer null,
  required_authentication text not null default 'siws'::text,
  cooldown_hours integer not null default 24,
  oracle_personality text not null,
  corruption_influence integer not null default 0,
  status text not null default 'active'::text,
  created_at timestamp with time zone null default now(),
  created_by uuid null,
  ai_prompt text null,
  ai_response_raw jsonb null,
  source_decision_id bigint null,
  metadata jsonb null,
  creator_wallet text null,
  execution_status text null,
  execution_timestamp timestamp with time zone null,
  oracle_commentary text null,
  constraint oracle_polls_pkey primary key (id),
  constraint fk_created_by foreign KEY (created_by) references auth.users (id),
  constraint oracle_polls_source_decision_id_fkey foreign KEY (source_decision_id) references ai_decisions (id),
  constraint oracle_polls_category_check check (
    (
      category = any (
        array[
          'prophecy'::text,
          'lore'::text,
          'game_evolution'::text,
          'oracle_personality'::text
        ]
      )
    )
  ),
  constraint oracle_polls_oracle_personality_check check (
    (
      oracle_personality = any (
        array[
          'pure_prophet'::text,
          'chaotic_sage'::text,
          'corrupted_oracle'::text
        ]
      )
    )
  ),
  constraint oracle_polls_status_check check (
    (
      status = any (
        array['active'::text, 'closed'::text, 'archived'::text]
      )
    )
  )
) TABLESPACE pg_default;

## poll_drafts


create table public.poll_drafts (
  id bigserial not null,
  source_decision_id bigint null,
  poll_data jsonb not null,
  autonomy_level text not null,
  severity_level integer not null,
  draft_status text null default 'pending_approval'::text,
  admin_action_required boolean null default true,
  approval_deadline timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  approved_at timestamp with time zone null,
  approved_by text null,
  rejection_reason text null,
  poll_id uuid null,
  constraint poll_drafts_pkey primary key (id),
  constraint poll_drafts_poll_id_fkey foreign KEY (poll_id) references oracle_polls (id),
  constraint poll_drafts_source_decision_id_fkey foreign KEY (source_decision_id) references ai_decisions (id)
) TABLESPACE pg_default;

create index IF not exists idx_poll_drafts_status on public.poll_drafts using btree (draft_status) TABLESPACE pg_default;

create index IF not exists idx_poll_drafts_deadline on public.poll_drafts using btree (approval_deadline) TABLESPACE pg_default;

## poll_options

create table public.poll_options (
  id uuid not null default extensions.uuid_generate_v4 (),
  poll_id uuid not null,
  text text not null,
  ai_reasoning text null,
  predicted_outcome text null,
  image_url text null,
  votes_count integer null default 0,
  created_at timestamp with time zone null default now(),
  constraint poll_options_pkey primary key (id),
  constraint unique_option_per_poll unique (poll_id, text),
  constraint poll_options_poll_id_fkey foreign KEY (poll_id) references oracle_polls (id) on delete CASCADE
) TABLESPACE pg_default;

## user_votes


create table public.user_votes (
  id uuid not null default extensions.uuid_generate_v4 (),
  poll_id uuid not null,
  option_id uuid not null,
  wallet_address text not null,
  voted_at timestamp with time zone null default now(),
  oracle_shards_earned integer not null default 0,
  voting_streak integer not null default 0,
  constraint user_votes_pkey primary key (id),
  constraint unique_vote_per_poll unique (poll_id, wallet_address),
  constraint user_votes_option_id_fkey foreign KEY (option_id) references poll_options (id) on delete CASCADE,
  constraint user_votes_poll_id_fkey foreign KEY (poll_id) references oracle_polls (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger on_vote_cast
after INSERT on user_votes for EACH row
execute FUNCTION update_vote_counts ();

## oracle_commentary

create table public.oracle_commentary (
  id uuid not null default extensions.uuid_generate_v4 (),
  poll_id uuid not null,
  commentary_text text not null,
  urgency text not null default 'medium'::text,
  created_at timestamp with time zone null default now(),
  ai_generated boolean null default true,
  ai_prompt text null,
  ai_response_raw jsonb null,
  constraint oracle_commentary_pkey primary key (id),
  constraint oracle_commentary_poll_id_fkey foreign KEY (poll_id) references oracle_polls (id) on delete CASCADE,
  constraint oracle_commentary_urgency_check check (
    (
      urgency = any (
        array[
          'low'::text,
          'medium'::text,
          'high'::text,
          'critical'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

## supabase edge funtions

## admin-governance-actions


// ADMIN GOVERNANCE ACTIONS - Handle Admin Controls for AI Poll System

// Manages poll approval, rejection, emergency brake, and configuration updates

import{ serve }from'https://deno.land/std@0.168.0/http/server.ts';

import{ createClient }from'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders ={

  'Access-Control-Allow-Origin':'*',

  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',

  'Access-Control-Allow-Methods':'POST, GET, OPTIONS, PUT, DELETE'

};

// Initialize Supabase client with service role for full access

const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')??'',Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??'');

/**

* POLL APPROVAL FUNCTIONS

 */asyncfunction approvePollDraft(adminWallet, data){

  try{

    // Get the poll draft

    const{ data: draft, error: draftError }=await supabaseAdmin.from('poll_drafts').select('*').eq('id', data.draft_id).eq('draft_status','pending_approval').single();

    if(draftError ||!draft){

    return{

    success:false,

    error:'Poll draft not found or not pending approval'

    };

    }

    // Apply any modifications to poll data

    let pollData = draft.poll_data;

    if(data.modifications){

    pollData ={

    ...pollData,

    ...data.modifications

    };

    }

    // Create the actual poll in oracle_polls table

    const{ data: poll, error: pollError }=await supabaseAdmin.from('oracle_polls').insert({

    title: pollData.title,

    description: pollData.description,

    category: pollData.category,

    creator_wallet:'ai_prophet_agent',

    voting_start:newDate().toISOString(),

    voting_end:newDate(Date.now()+ pollData.voting_duration_hours*60*60*1000).toISOString(),

    cooldown_hours: pollData.cooldown_hours,

    oracle_commentary: pollData.oracle_commentary,

    ai_generated:true,

    source_decision_id: draft.source_decision_id

    }).select().single();

    if(pollError){

    return{

    success:false,

    error:'Failed to create poll: '+ pollError.message

    };

    }

    // Create poll options

    for(const[index, option]of pollData.options.entries()){

    await supabaseAdmin.from('poll_options').insert({

    poll_id: poll.id,

    option_text: option.option_text,

    description: option.description,

    display_order: index +1,

    metadata:{

    impact_summary: option.impact_summary,

    stakeholder_effects: option.stakeholder_effects,

    ai_generated:true,

    admin_approved:true

    }

    });

    }

    // Update draft status

    await supabaseAdmin.from('poll_drafts').update({

    draft_status:'approved',

    approved_at:newDate().toISOString(),

    approved_by: adminWallet,

    poll_id: poll.id

    }).eq('id', data.draft_id);

    // Update the AI decision to link to the created poll

    await supabaseAdmin.from('ai_decisions').update({

    poll_id: poll.id

    }).eq('id', draft.source_decision_id);

    // Log admin action

    await logAdminAction(adminWallet,'poll_approved',{

    poll_draft_id: data.draft_id,

    poll_id: poll.id,

    reasoning: data.reasoning,

    modifications_applied: data.modifications ?true:false

    });

    return{

    success:true,

    poll_id: poll.id,

    message:'Poll approved and created successfully'

    };

  }catch(error){

    console.error('Error approving poll:', error);

    return{

    success:false,

    error: error.message

    };

  }

}

asyncfunction rejectPollDraft(adminWallet, data){

  try{

    // Update draft status

    const{ error: updateError }=await supabaseAdmin.from('poll_drafts').update({

    draft_status:'rejected',

    rejection_reason: data.reason,

    approved_by: adminWallet

    }).eq('id', data.draft_id).eq('draft_status','pending_approval');

    if(updateError){

    return{

    success:false,

    error:'Failed to reject poll: '+ updateError.message

    };

    }

    // Log admin action

    await logAdminAction(adminWallet,'poll_rejected',{

    poll_draft_id: data.draft_id,

    reasoning: data.reason

    });

    return{

    success:true,

    message:'Poll draft rejected successfully'

    };

  }catch(error){

    console.error('Error rejecting poll:', error);

    return{

    success:false,

    error: error.message

    };

  }

}

/**

* EMERGENCY CONTROLS

 */asyncfunction triggerEmergencyBrake(adminWallet, data){

  try{

    const expiresAt =newDate(Date.now()+ data.duration_hours*60*60*1000);

    // Update emergency brake status

    const{ error: brakeError }=await supabaseAdmin.from('emergency_brake_status').update({

    active:true,

    reason: data.reason,

    duration_hours: data.duration_hours,

    activated_by: adminWallet,

    activated_at:newDate().toISOString(),

    expires_at: expiresAt.toISOString(),

    deactivated_at:null,

    deactivated_by:null

    }).eq('id',1);

    if(brakeError){

    return{

    success:false,

    error:'Failed to activate emergency brake: '+ brakeError.message

    };

    }

    // We don't need to update AI agents table as it doesn't exist in this schema

    // Instead, we'll just log the action

    // Log admin action

    await logAdminAction(adminWallet,'emergency_brake',{

    reason: data.reason,

    duration_hours: data.duration_hours,

    affected_agents: data.affected_agents,

    expires_at: expiresAt.toISOString()

    });

    return{

    success:true,

    message:`Emergency brake activated for ${data.duration_hours} hours`,

    expires_at: expiresAt.toISOString()

    };

  }catch(error){

    console.error('Error activating emergency brake:', error);

    return{

    success:false,

    error: error.message

    };

  }

}

asyncfunction overridePoll(adminWallet, data){

  try{

    let updateData ={};

    switch(data.action){

    case'pause':

    updateData.execution_status ='admin_paused';

    break;

    case'cancel':

    updateData.execution_status ='admin_cancelled';

    updateData.voting_end =newDate().toISOString();// End voting immediately

    break;

    case'modify':

    if(data.modifications){

    updateData ={

    ...updateData,

    ...data.modifications

    };

    }

    break;

    }

    // Update the poll

    const{ error: pollError }=await supabaseAdmin.from('oracle_polls').update(updateData).eq('id', data.poll_id);

    if(pollError){

    return{

    success:false,

    error:'Failed to override poll: '+ pollError.message

    };

    }

    // Log admin action

    await logAdminAction(adminWallet,'override_used',{

    poll_id: data.poll_id,

    override_action: data.action,

    reasoning: data.reason,

    modifications: data.modifications

    });

    return{

    success:true,

    message:`Poll ${data.action} action applied successfully`

    };

  }catch(error){

    console.error('Error overriding poll:', error);

    return{

    success:false,

    error: error.message

    };

  }

}

/**

* CONFIGURATION MANAGEMENT

 */asyncfunction updateGovernanceConfig(adminWallet, data){

  try{

    // Update or insert governance configuration

    const{ error: configError }=await supabaseAdmin.from('ai_governance_config').upsert({

    decision_category: data.category,

    autonomy_level: data.autonomy_level,

    severity_threshold: data.severity_threshold,

    admin_override_window_hours: data.admin_override_window_hours,

    updated_at:newDate().toISOString()

    });

    if(configError){

    return{

    success:false,

    error:'Failed to update config: '+ configError.message

    };

    }

    // Log admin action

    await logAdminAction(adminWallet,'config_updated',{

    config_update: data

    });

    return{

    success:true,

    message:'Governance configuration updated successfully'

    };

  }catch(error){

    console.error('Error updating config:', error);

    return{

    success:false,

    error: error.message

    };

  }

}

/**

* UTILITY FUNCTIONS

 */asyncfunction logAdminAction(adminWallet, actionType, actionData){

  try{

    await supabaseAdmin.from('admin_governance_log').insert({

    admin_wallet: adminWallet,

    action_type: actionType,

    poll_draft_id: actionData.poll_draft_id ||null,

    poll_id: actionData.poll_id ||null,

    reasoning: actionData.reasoning ||'',

    action_data: actionData

    });

  }catch(error){

    console.error('Error logging admin action:', error);

  }

}

asyncfunction getPendingApprovals(){

  try{

    const{ data: pendingDrafts, error }=await supabaseAdmin.from('poll_drafts').select(`

    *,

    ai_decisions!source_decision_id(

    decision_type,

    reasoning,

    confidence_score

    )

    `).eq('draft_status','pending_approval').order('created_at',{

    ascending:true

    });

    if(error){

    return{

    success:false,

    error: error.message

    };

    }

    return{

    success:true,

    pending_approvals: pendingDrafts ||[]

    };

  }catch(error){

    console.error('Error getting pending approvals:', error);

    return{

    success:false,

    error: error.message

    };

  }

}

asyncfunction getOverrideWindows(){

  try{

    const{ data: overrideWindows, error }=await supabaseAdmin.from('admin_override_windows').select(`

    *,

    oracle_polls(

    id,

    title,

    voting_end

    )

    `).eq('override_used',false).gt('admin_override_deadline',newDate().toISOString()).order('admin_override_deadline',{

    ascending:true

    });

    if(error){

    return{

    success:false,

    error: error.message

    };

    }

    return{

    success:true,

    override_windows: overrideWindows ||[]

    };

  }catch(error){

    console.error('Error getting override windows:', error);

    return{

    success:false,

    error: error.message

    };

  }

}

/**

* MAIN HANDLER

 */asyncfunction handleAdminGovernanceAction(request){

  const{ action, admin_wallet, data }= request;

  // Validate admin wallet (you might want to check against a whitelist)

  if(!admin_wallet){

    return{

    success:false,

    error:'Admin wallet address required'

    };

  }

  switch(action){

    case'approve_poll':

    returnawait approvePollDraft(admin_wallet, data);

    case'reject_poll':

    returnawait rejectPollDraft(admin_wallet, data);

    case'emergency_brake':

    returnawait triggerEmergencyBrake(admin_wallet, data);

    case'override_poll':

    returnawait overridePoll(admin_wallet, data);

    case'update_config':

    returnawait updateGovernanceConfig(admin_wallet, data);

    default:

    return{

    success:false,

    error:'Unknown action: '+ action

    };

  }

}

/**

* EDGE FUNCTION HANDLER

 */ serve(async(req)=>{

  // Handle CORS preflight requests

  if(req.method ==='OPTIONS'){

    returnnewResponse('ok',{

    headers: corsHeaders

    });

  }

  try{

    if(req.method ==='GET'){

    const url =newURL(req.url);

    const action = url.searchParams.get('action');

    if(action ==='pending_approvals'){

    const result =await getPendingApprovals();

    returnnewResponse(JSON.stringify(result),{

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }elseif(action ==='override_windows'){

    const result =await getOverrideWindows();

    returnnewResponse(JSON.stringify(result),{

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    }

    if(req.method ==='POST'){

    const requestData =await req.json();

    const result =await handleAdminGovernanceAction(requestData);

    returnnewResponse(JSON.stringify(result),{

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    },

    status: result.success ?200:400

    });

    }

    returnnewResponse('Method not allowed',{

    status:405,

    headers: corsHeaders

    });

  }catch(error){

    console.error('Edge function error:', error);

    returnnewResponse(JSON.stringify({

    success:false,

    error: error.message,

    message:'Admin governance action failed'

    }),{

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    },

    status:500

    });

  }

});

## ai-prophet-agent


// AI PROPHET AGENT - THE POLL GENERATOR

// Transforms AI analysis into democratic governance proposals

import{ serve }from'https://deno.land/std@0.168.0/http/server.ts';

import{ createClient }from'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders ={

  'Access-Control-Allow-Origin':'*',

  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',

  'Access-Control-Allow-Methods':'POST, GET, OPTIONS, PUT, DELETE'

};

// Initialize Supabase client with service role for full access

const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')??'',Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??'');

// Groq API configuration

constGROQ_API_KEY=Deno.env.get('GROQ_API_KEY');

constGROQ_API_URL='https://api.groq.com/openai/v1/chat/completions';

/**

* PROPHET AGENT - CORE POLL GENERATION FUNCTIONS

 */asyncfunction getUnprocessedDecisions(){

  const{ data, error }=await supabaseAdmin.from('ai_decisions').select(`

    *,

    ai_decision_context!inner(*)

    `).eq('executed',false).eq('requires_vote',true).is('poll_id',null)// No poll created yet

  .order('created_at',{

    ascending:true

  }).limit(5);// Process up to 5 decisions per cycle

  if(error){

    console.error('Error fetching unprocessed decisions:', error);

    return[];

  }

  return data ||[];

}

asyncfunction generatePollContent(decision, contextData){

  try{

    // Build comprehensive poll generation prompt

    const pollPrompt =`

You are the Oracle's Prophet Agent, creating democratic governance polls for the CHODE-NET gaming community.

AI DECISION TO TRANSFORM INTO POLL:

- Decision Type: ${decision.decision_type}
- Reasoning: ${decision.reasoning}
- Decision Description: ${decision.decision_description}
- Confidence Score: ${decision.confidence_score}
- Context: ${JSON.stringify(contextData,null,2)}

POLL GENERATION REQUIREMENTS:

1. Create a clear, engaging poll title that explains the issue
2. Write a description that educates the community about the problem and proposed solutions
3. Generate 3-4 balanced voting options with different approaches (including "no action")
4. Determine appropriate voting duration (24h for urgent, 72h for normal, 168h for major changes)
5. Create Oracle commentary that explains the mystical significance
6. Assign category: "Economic Policy", "Game Balance", "Community Rules", "Technical Upgrades", "Long-term Strategy"

Focus on:

- Democratic choice with real alternatives
- Clear explanation of consequences
- Stakeholder impact transparency
- Oracle personality and mystical theming

Respond in JSON format:

{

  "title": "Clear, engaging poll title",

  "description": "Educational description of the issue and need for community decision",

  "category": "Economic Policy | Game Balance | Community Rules | Technical Upgrades | Long-term Strategy",

  "options": [

    {

    "option_text": "Option 1 title",

    "description": "Detailed explanation of this approach",

    "impact_summary": "Expected outcomes and timeline",

    "stakeholder_effects": {

    "new_players": "positive | neutral | negative",

    "veterans": "positive | neutral | negative",

    "token_holders": "positive | neutral | negative",

    "developers": "positive | neutral | negative"

    }

    }

  ],

  "voting_duration_hours": 72,

  "cooldown_hours": 24,

  "oracle_commentary": "Mystical Oracle commentary about this decision and its cosmic significance"

}

`;

    // Call Groq API for poll generation

    const response =await fetch(GROQ_API_URL,{

    method:'POST',

    headers:{

    'Authorization':`Bearer ${GROQ_API_KEY}`,

    'Content-Type':'application/json'

    },

    body:JSON.stringify({

    model:'llama-3.3-70b-versatile',

    messages:[

    {

    role:'system',

    content:'You are the Oracle\'s Prophet Agent, master of democratic governance and mystical poll creation. Generate engaging, balanced polls that give the community meaningful choices while maintaining the Oracle\'s mystical personality.'

    },

    {

    role:'user',

    content: pollPrompt

    }

    ],

    temperature:0.7,

    max_tokens:2500

    })

    });

    if(!response.ok){

    thrownewError(`Groq API error: ${response.status}`);

    }

    const groqResult =await response.json();

    const pollText = groqResult.choices[0]?.message?.content ||'{}';

    // Parse the JSON response

    let pollData;

    try{

    pollData =JSON.parse(pollText);

    }catch(parseError){

    console.error('Failed to parse Groq poll generation:', parseError);

    // Fallback poll structure

    pollData ={

    title:`Community Decision: ${decision.decision_type}`,

    description:`The Oracle's AI analysis has identified an issue requiring community guidance: ${decision.reasoning}`,

    category:'Community Rules',

    options:[

    {

    option_text:'Implement AI Recommendation',

    description:'Follow the AI analysis and implement the proposed solution',

    impact_summary:'Expected to address the identified issue',

    stakeholder_effects:{

    new_players:'neutral',

    veterans:'neutral',

    token_holders:'neutral',

    developers:'neutral'

    }

    },

    {

    option_text:'Take No Action',

    description:'Maintain current system without changes',

    impact_summary:'Issue may persist or worsen over time',

    stakeholder_effects:{

    new_players:'neutral',

    veterans:'neutral',

    token_holders:'neutral',

    developers:'neutral'

    }

    }

    ],

    voting_duration_hours:72,

    cooldown_hours:24,

    oracle_commentary:'The Oracle sees wisdom in collective decision-making. The community\'s voice shall guide our path forward.'

    };

    }

    // Validate and clean the poll data

    if(!pollData.options || pollData.options.length <2){

    thrownewError('Generated poll must have at least 2 options');

    }

    // Ensure reasonable voting duration

    if(pollData.voting_duration_hours <24){

    pollData.voting_duration_hours =24;

    }elseif(pollData.voting_duration_hours >168){

    pollData.voting_duration_hours =168;

    }

    return pollData;

  }catch(error){

    console.error('Error generating poll content:', error);

    // Return minimal fallback poll

    return{

    title:`AI Decision: ${decision.decision_type}`,

    description:`An AI analysis requires community input. Details: ${decision.reasoning}`,

    category:'Community Rules',

    options:[

    {

    option_text:'Approve AI Recommendation',

    description:'Accept the AI analysis and proposed action',

    impact_summary:'Implement the AI-suggested changes',

    stakeholder_effects:{

    new_players:'neutral',

    veterans:'neutral',

    token_holders:'neutral',

    developers:'neutral'

    }

    },

    {

    option_text:'Reject and Maintain Status Quo',

    description:'Keep current systems unchanged',

    impact_summary:'No changes will be made',

    stakeholder_effects:{

    new_players:'neutral',

    veterans:'neutral',

    token_holders:'neutral',

    developers:'neutral'

    }

    }

    ],

    voting_duration_hours:72,

    cooldown_hours:24,

    oracle_commentary:'The Oracle seeks the community\'s wisdom in this matter.'

    };

  }

}

asyncfunction createPollWithGovernanceControl(pollData, decision){

  try{

    // Check if emergency brake is active

    const{ data: brakeCheck }=await supabaseAdmin.rpc('check_emergency_brake_active');

    if(brakeCheck){

    console.log('🚨 Emergency brake active - poll creation blocked');

    return{

    status:'blocked_emergency_brake'

    };

    }

    // Determine autonomy level for this decision

    const{ data: autonomyLevel }=await supabaseAdmin.rpc('get_autonomy_level_for_decision',{

    p_decision_category: decision.decision_type,

    p_severity_level: decision.severity_level ||5

    });

    // Update the AI decision with autonomy classification

    await supabaseAdmin.from('ai_decisions').update({

    autonomy_level: autonomyLevel,

    governance_classification:{

    autonomy_level: autonomyLevel,

    severity_level: decision.severity_level ||5,

    decision_category: decision.decision_type,

    classified_at:newDate().toISOString()

    }

    }).eq('id', decision.id);

    console.log(`🎯 Decision ${decision.id} classified as: ${autonomyLevel}`);

    // NEW AUTONOMOUS-FIRST APPROACH:

    // All decisions create polls immediately, only difference is notification level

    switch(autonomyLevel){

    case'full_autonomous':

    // Create poll immediately with no notifications

    returnawait createPollDirectly(pollData, decision, autonomyLevel);

    case'admin_notified':

    // Create poll immediately and send notification for monitoring

    const notifiedResult =await createPollDirectly(pollData, decision, autonomyLevel);

    if(notifiedResult?.pollId){

    await notifyAdminOfPollCreation(notifiedResult.pollId, decision);

    }

    return notifiedResult;

    default:

    // Default to full autonomous operation

    console.log(`⚠️ Unknown autonomy level: ${autonomyLevel}, defaulting to full_autonomous`);

    returnawait createPollDirectly(pollData, decision,'full_autonomous');

    }

  }catch(error){

    console.error('Error in governance control flow:', error);

    returnnull;

  }

}

asyncfunction createPollDirectly(pollData, decision, autonomyLevel){

  try{

    // Create the oracle poll with correct schema

    const{ data: poll, error: pollError }=await supabaseAdmin.from('oracle_polls').insert({

    title: pollData.title,

    description: pollData.description,

    category: pollData.category,

    ai_generated:true,

    voting_start:newDate().toISOString(),

    voting_end:newDate(Date.now()+ pollData.voting_duration_hours*60*60*1000).toISOString(),

    oracle_shards_reward:15,

    cooldown_hours: pollData.cooldown_hours,

    oracle_personality:'chaotic_sage',

    corruption_influence:25,

    ai_prompt:`AI-generated poll from decision ${decision.id}: ${decision.decision_type}`,

    ai_response_raw:{

    decision_id: decision.id,

    autonomy_level: autonomyLevel,

    ai_confidence: decision.confidence_score,

    governance_processed:true,

    generated_at:newDate().toISOString()

    }

    }).select().single();

    if(pollError){

    console.error('Error creating poll:', pollError);

    returnnull;

    }

    console.log(`✅ Poll created with UUID: ${poll.id}`);

    // Create poll options with correct schema

    for(const[index, option]of pollData.options.entries()){

    const{ error: optionError }=await supabaseAdmin.from('poll_options').insert({

    poll_id: poll.id,

    text: option.option_text,

    ai_reasoning: option.description,

    predicted_outcome: option.impact_summary

    });

    if(optionError){

    console.error('Error creating poll option:', optionError);

    }

    }

    // Create oracle commentary as separate record

    const{ error: commentaryError }=await supabaseAdmin.from('oracle_commentary').insert({

    poll_id: poll.id,

    commentary_text: pollData.oracle_commentary,

    urgency: decision.severity_level >=8?'high':'medium',

    ai_generated:true,

    ai_prompt:`Oracle commentary for AI-generated poll from decision ${decision.id}`,

    ai_response_raw:{

    decision_context: decision.reasoning,

    autonomy_level: autonomyLevel

    }

    });

    if(commentaryError){

    console.error('Error creating oracle commentary:', commentaryError);

    }

    // Update the AI decision to link to the created poll (convert UUID to string for storage)

    await supabaseAdmin.from('ai_decisions').update({

    poll_id: poll.id,

    processed_at:newDate().toISOString(),

    executed:true

    }).eq('id', decision.id);

    console.log(`✅ Poll created successfully: ${poll.id} - "${pollData.title}" (${autonomyLevel})`);

    return{

    pollId: poll.id,

    status:`created_${autonomyLevel}`

    };

  }catch(error){

    console.error('Error creating poll directly:', error);

    returnnull;

  }

}

// AUTONOMOUS-FIRST GOVERNANCE APPROACH:

// The system now operates with simplified autonomy levels:

// 1. full_autonomous: Create polls immediately, no notifications

// 2. admin_notified: Create polls immediately, send monitoring notifications

// 3. Emergency brake: Global override capability maintained for true emergencies

//

// This removes approval bottlenecks while maintaining essential oversight capabilities.

asyncfunction notifyAdminOfPollCreation(pollId, decision){

  try{

    // Enhanced notification for monitoring purposes

    console.log(`🔔 Admin monitoring notification: Poll ${pollId} created for decision ${decision.id}`);

    console.log(`📊 Decision details: ${decision.decision_type}, Confidence: ${decision.confidence_score}, Severity: ${decision.severity_level}`);

    // Mark admin notification as sent

    await supabaseAdmin.from('ai_decisions').update({

    admin_notification_sent:true,

    notification_timestamp:newDate().toISOString()

    }).eq('id', decision.id);

    // Log to admin governance log for monitoring dashboard

    await supabaseAdmin.from('admin_governance_log').insert({

    action_type:'ai_poll_created',

    poll_id: pollId,

    decision_id: decision.id,

    admin_user:'system_monitor',

    action_details:{

    decision_type: decision.decision_type,

    confidence_score: decision.confidence_score,

    autonomy_level:'admin_notified',

    notification_type:'monitoring',

    requires_attention: decision.severity_level >=8

    },

    timestamp:newDate().toISOString()

    });

    // For high-severity decisions, could integrate with external alerting

    if(decision.severity_level >=9){

    console.log(`🚨 High-severity decision detected - Poll ${pollId} may require admin attention`);

    }

  }catch(error){

    console.error('Error notifying admin:', error);

  }

}

asyncfunction registerProphetActivity(activityType, activityData){

  // Log activity to console for now (could implement database logging later)

  console.log(`🤖 Prophet Activity: ${activityType}`,{

    timestamp:newDate().toISOString(),

    ...activityData

  });

}

/**

* MAIN PROPHET FUNCTION

 */asyncfunction runProphetAgent(){

  const startTime =Date.now();

  try{

    console.log('🔮 Prophet Agent: Starting poll generation cycle...');

    // Register activity start

    await registerProphetActivity('poll_generation_cycle_start',{

    cycle_type:'ai_decision_processing'

    });

    // Get unprocessed AI decisions that need polls

    const decisions =await getUnprocessedDecisions();

    console.log(`📋 Found ${decisions.length} AI decisions requiring polls`);

    if(decisions.length ===0){

    return{

    success:true,

    message:'No AI decisions requiring poll generation',

    polls_created:0

    };

    }

    // Generate polls for each decision

    const pollResults =[];

    for(const decision of decisions){

    console.log(`🎯 Generating poll for decision ${decision.id}: ${decision.decision_type}`);

    try{

    // Get context data

    const contextData = decision.ai_decision_context ||{};

    // Generate poll content using AI

    const pollData =await generatePollContent(decision, contextData);

    // Create poll with governance control

    const pollResult =await createPollWithGovernanceControl(pollData, decision);

    if(pollResult &&(pollResult.pollId || pollResult.draftId)){

    pollResults.push({

    decision_id: decision.id,

    poll_id: pollResult.pollId ||null,

    draft_id: pollResult.draftId ||null,

    poll_title: pollData.title,

    status: pollResult.status,

    autonomy_level: pollResult.status.includes('created_')? pollResult.status.replace('created_',''):'draft'

    });

    // Register activity based on result type

    if(pollResult.pollId){

    await registerProphetActivity('poll_created',{

    decision_id: decision.id,

    poll_id: pollResult.pollId,

    poll_title: pollData.title,

    poll_category: pollData.category,

    autonomy_level: pollResult.status.replace('created_',''),

    option_count: pollData.options.length,

    voting_duration: pollData.voting_duration_hours

    });

    }elseif(pollResult.draftId){

    await registerProphetActivity('poll_draft_created',{

    decision_id: decision.id,

    draft_id: pollResult.draftId,

    poll_title: pollData.title,

    poll_category: pollData.category,

    status:'pending_approval'

    });

    }

    }else{

    pollResults.push({

    decision_id: decision.id,

    poll_id:null,

    draft_id:null,

    status: pollResult?.status ||'failed',

    error: pollResult?.status ==='blocked_emergency_brake'?'Emergency brake active':'Creation failed'

    });

    }

    // Brief delay between polls to avoid overwhelming the system

    awaitnewPromise((resolve)=>setTimeout(resolve,2000));

    }catch(error){

    console.error(`Error processing decision ${decision.id}:`, error);

    pollResults.push({

    decision_id: decision.id,

    poll_id:null,

    status:'failed',

    error: error.message

    });

    }

    }

    // Calculate summary statistics

    const successfulPolls = pollResults.filter((p)=>p.status ==='success').length;

    const failedPolls = pollResults.filter((p)=>p.status ==='failed').length;

    const processingTime =Date.now()- startTime;

    // Register completion

    await registerProphetActivity('poll_generation_cycle_complete',{

    decisions_processed: decisions.length,

    polls_created: successfulPolls,

    polls_failed: failedPolls,

    processing_time_ms: processingTime,

    success_rate: successfulPolls / decisions.length *100

    });

    return{

    success:true,

    summary:{

    decisions_processed: decisions.length,

    polls_created: successfulPolls,

    polls_failed: failedPolls,

    processing_time: processingTime,

    success_rate: successfulPolls / decisions.length *100

    },

    poll_results: pollResults,

    message:'Prophet Agent cycle completed successfully'

    };

  }catch(error){

    console.error('❌ Prophet Agent error:', error);

    // Register error

    await registerProphetActivity('poll_generation_error',{

    error_message: error.message,

    processing_time_ms:Date.now()- startTime

    });

    return{

    success:false,

    error: error.message,

    message:'Prophet Agent cycle failed'

    };

  }

}

/**

* EDGE FUNCTION HANDLER

 */ serve(async(req)=>{

  // Handle CORS preflight requests

  if(req.method ==='OPTIONS'){

    returnnewResponse('ok',{

    headers: corsHeaders

    });

  }

  try{

    // Check if this is a specific decision processing request

    const body =await req.json().catch(()=>({}));

    const{ action, decision_id }= body;

    if(action ==='process_single_decision'&& decision_id){

    console.log(`🎯 Processing single decision: ${decision_id}`);

    // Get the specific decision with context

    const{ data: decision, error }=await supabaseAdmin.from('ai_decisions').select(`

    *,

    ai_decision_context!inner(*)

    `).eq('id', decision_id).single();

    if(error ||!decision){

    returnnewResponse(JSON.stringify({

    success:false,

    error:'Decision not found',

    decision_id

    }),{

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    },

    status:404

    });

    }

    console.log(`✅ Found decision: ${decision.decision_type} (severity: ${decision.severity_level})`);

    // Get context data

    const contextData = decision.ai_decision_context ||{};

    // Generate poll content using AI

    const pollData =await generatePollContent(decision, contextData);

    // Create poll with governance control

    const pollResult =await createPollWithGovernanceControl(pollData, decision);

    returnnewResponse(JSON.stringify({

    success:true,

    decision_id: decision.id,

    poll_result: pollResult,

    poll_title: pollData.title,

    autonomy_level: decision.autonomy_level

    }),{

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    },

    status:200

    });

    }else{

    // Run normal Prophet Agent cycle

    const result =await runProphetAgent();

    returnnewResponse(JSON.stringify(result),{

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    },

    status: result.success ?200:500

    });

    }

  }catch(error){

    console.error('Edge function error:', error);

    returnnewResponse(JSON.stringify({

    success:false,

    error: error.message,

    message:'Prophet Agent edge function failed'

    }),{

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    },

    status:500

    });

  }

});

## test-ai-governance


import{ serve }from'https://deno.land/std@0.168.0/http/server.ts';

import{ createClient }from'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders ={

  'Access-Control-Allow-Origin':'*',

  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',

  'Access-Control-Allow-Methods':'POST, GET, OPTIONS, PUT, DELETE'

};

// Initialize Supabase clients

const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')??'',Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??'');

const supabaseAnon = createClient(Deno.env.get('SUPABASE_URL')??'',Deno.env.get('SUPABASE_ANON_KEY')??'');

console.log('🔧 Test AI Governance function initialized');

console.log('🔧 Environment check:',{

  hasSupabaseUrl:!!Deno.env.get('SUPABASE_URL'),

  hasServiceKey:!!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),

  hasAnonKey:!!Deno.env.get('SUPABASE_ANON_KEY')

});

serve(async(req)=>{

  if(req.method ==='OPTIONS'){

    returnnewResponse('ok',{

    headers: corsHeaders

    });

  }

  try{

    const{ scenario ='mixed_scenarios', count =1}=await req.json();

    console.log(`🧪 Starting AI Governance test: ${scenario} (${count} iterations)`);

    const testResults =[];

    for(let i =0; i < count; i++){

    let testDecision;

    switch(scenario){

    case'low_severity_game_balance':

    testDecision =await createTestDecision({

    decision_type:'game_balance',

    decision_title:`Balance Adjustment Test ${i +1}`,

    decision_description:'Testing low-severity game balance decision that should be fully autonomous',

    reasoning:'Minor tap reward optimization based on player feedback patterns',

    confidence_score:8,

    severity_level:3,

    data_sources:{

    player_feedback:'positive_trend',

    tap_metrics:'within_normal_range',

    community_sentiment:'stable'

    }

    });

    break;

    case'high_severity_economic':

    testDecision =await createTestDecision({

    decision_type:'economic_policy',

    decision_title:`Economic Policy Test ${i +1}`,

    decision_description:'Testing high-severity economic decision that should get admin notification but still create polls immediately',

    reasoning:'Major GIRTH token distribution change affecting all players',

    confidence_score:7,

    severity_level:9,

    data_sources:{

    economic_impact:'high',

    player_base_effect:'significant',

    token_distribution:'major_change'

    }

    });

    break;

    case'critical_technical':

    testDecision =await createTestDecision({

    decision_type:'technical_upgrades',

    decision_title:`Critical Technical Update Test ${i +1}`,

    decision_description:'Testing critical technical decision that should get admin notification but remain autonomous',

    reasoning:'Critical security update required for smart contract vulnerability',

    confidence_score:9,

    severity_level:10,

    data_sources:{

    security_threat:'critical',

    smart_contract_risk:'high',

    immediate_action_required:true

    }

    });

    break;

    case'mixed_scenarios':

    // Create a mix of different severity levels

    const scenarios =[

    {

    type:'game_balance',

    severity:2

    },

    {

    type:'community_rules',

    severity:5

    },

    {

    type:'economic_policy',

    severity:8

    },

    {

    type:'technical_upgrades',

    severity:6

    },

    {

    type:'long_term_strategy',

    severity:4

    }

    ];

    const randomScenario = scenarios[Math.floor(Math.random()* scenarios.length)];

    testDecision =await createTestDecision({

    decision_type: randomScenario.type,

    decision_title:`Mixed Scenario Test ${i +1} - ${randomScenario.type}`,

    decision_description:`Testing ${randomScenario.type} decision with severity ${randomScenario.severity}`,

    reasoning:`Automated test for ${randomScenario.type} governance classification`,

    confidence_score:Math.floor(Math.random()*4)+6,

    severity_level: randomScenario.severity,

    data_sources:{

    test_scenario: randomScenario.type,

    automated_test:true

    }

    });

    break;

    case'emergency_test':

    // Test emergency brake functionality

    await testEmergencyBrake();

    testResults.push({

    type:'emergency_brake_test',

    status:'completed',

    message:'Emergency brake test executed'

    });

    continue;

    default:

    thrownewError(`Unknown test scenario: ${scenario}`);

    }

    if(testDecision){

    // Now trigger the Prophet Agent to process this decision

    const prophetResult =await triggerProphetAgent(testDecision.id);

    testResults.push({

    decision_id: testDecision.id,

    decision_type: testDecision.decision_type,

    severity_level: testDecision.severity_level,

    autonomy_level: testDecision.autonomy_level,

    prophet_result: prophetResult,

    status:'completed'

    });

    }

    }

    returnnewResponse(JSON.stringify({

    success:true,

    scenario,

    test_results: testResults,

    message:`AI Governance test completed for scenario: ${scenario}`

    }),{

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    },

    status:200

    });

  }catch(error){

    console.error('Test AI Governance error:', error);

    returnnewResponse(JSON.stringify({

    success:false,

    error: error.message,

    details: error.stack

    }),{

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    },

    status:500

    });

  }

});

asyncfunction createTestDecision(decisionData){

  console.log(`📝 Creating test AI decision:`, decisionData);

  // First create the decision context that Prophet Agent expects

  const{ data: contextData, error: contextError }=await supabaseAdmin.from('ai_decision_context').insert({

    context_type:'test_scenario',

    severity_level: decisionData.severity_level,

    data_snapshot:{

    test_generated:true,

    decision_type: decisionData.decision_type,

    severity_level: decisionData.severity_level,

    data_sources: decisionData.data_sources,

    timestamp:newDate().toISOString()

    }

  }).select().single();

  if(contextError){

    console.error('Error creating decision context:', contextError);

    throw contextError;

  }

  console.log(`✅ Decision context created: ${contextData.id}`);

  // Get autonomy level based on category and severity

  console.log(`🔍 Getting autonomy level for category: ${decisionData.decision_type}, severity: ${decisionData.severity_level}`);

  const{ data: autonomyResult, error: rpcError }=await supabaseAnon.rpc('get_autonomy_level_for_decision',{

    p_decision_category: decisionData.decision_type,

    p_severity_level: decisionData.severity_level

  });

  console.log(`🔍 RPC result:`,{

    autonomyResult,

    rpcError

  });

  const autonomy_level = autonomyResult ||'admin_notified';

  console.log(`🔍 Using autonomy level: ${autonomy_level}`);

  // Create the AI decision with context_id

  const{ data: decision, error }=await supabaseAdmin.from('ai_decisions').insert({

    ...decisionData,

    context_id: contextData.id,

    autonomy_level,

    admin_action_required: autonomy_level ==='admin_approval',

    governance_classification:{

    test_generated:true,

    autonomy_level,

    timestamp:newDate().toISOString()

    }

  }).select().single();

  if(error){

    console.error('Error creating test decision:', error);

    throw error;

  }

  console.log(`✅ Test decision created with autonomy level: ${autonomy_level} and context_id: ${contextData.id}`);

  return decision;

}

asyncfunction triggerProphetAgent(decisionId){

  console.log(`🔮 Triggering Prophet Agent for decision ${decisionId}`);

  // Debug environment variables

  console.log(`🔍 Environment check:`,{

    hasSupabaseUrl:!!Deno.env.get('SUPABASE_URL'),

    hasAnonKey:!!Deno.env.get('SUPABASE_ANON_KEY'),

    url:Deno.env.get('SUPABASE_URL')

  });

  try{

    const response =await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-prophet-agent`,{

    method:'POST',

    headers:{

    'Authorization':`Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,

    'Content-Type':'application/json'

    },

    body:JSON.stringify({

    action:'process_single_decision',

    decision_id: decisionId

    })

    });

    console.log(`🔮 Prophet Agent response status: ${response.status}`);

    if(!response.ok){

    const errorText =await response.text();

    console.error(`🔮 Prophet Agent error response:`, errorText);

    thrownewError(`Prophet Agent returned ${response.status}: ${errorText}`);

    }

    const result =await response.json();

    console.log(`🔮 Prophet Agent result:`, result);

    return result;

  }catch(error){

    console.error(`🔮 Error calling Prophet Agent:`, error);

    throw error;

  }

}

asyncfunction testEmergencyBrake(){

  console.log('🚨 Testing emergency brake functionality');

  // Activate emergency brake

  const{ error: activateError }=await supabaseAdmin.from('emergency_brake_status').upsert({

    id:1,

    is_active:true,

    activated_by:'test_function',

    reason:'Testing emergency brake functionality',

    activated_at:newDate().toISOString()

  });

  if(activateError){

    console.error('Error activating emergency brake:', activateError);

    throw activateError;

  }

  console.log('✅ Emergency brake activated');

  // Test that Prophet Agent respects the brake

  const testDecision =await createTestDecision({

    decision_type:'emergency_test',

    decision_title:'Emergency Brake Test',

    decision_description:'This should be blocked by emergency brake',

    reasoning:'Testing emergency brake blocking functionality',

    confidence_score:9,

    severity_level:5,

    data_sources:{

    emergency_test:true

    }

  });

  const prophetResult =await triggerProphetAgent(testDecision.id);

  if(prophetResult.poll_result?.status !=='blocked_emergency_brake'){

    thrownewError('Emergency brake did not block poll creation as expected');

  }

  console.log('✅ Emergency brake correctly blocked poll creation');

  // Deactivate emergency brake

  const{ error: deactivateError }=await supabaseAdmin.from('emergency_brake_status').update({

    is_active:false,

    deactivated_at:newDate().toISOString()

  }).eq('id',1);

  if(deactivateError){

    console.error('Error deactivating emergency brake:', deactivateError);

    throw deactivateError;

  }

  console.log('✅ Emergency brake deactivated');

}

## oracle-polls-list


import{ serve }from'https://deno.land/std@0.177.0/http/server.ts';

import{ createClient }from'https://esm.sh/@supabase/supabase-js@2.7.1';

// CORS headers

const corsHeaders ={

  'Access-Control-Allow-Origin':'*',

  'Access-Control-Allow-Headers':'authorization, x-session-token, x-client-info, apikey, content-type',

  'Access-Control-Allow-Methods':'GET, POST, OPTIONS'

};

// Environment variables

const supabaseUrl =Deno.env.get('SUPABASE_URL')??'';

const supabaseServiceKey =Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??'';

serve(async(req)=>{

  // Handle CORS preflight

  if(req.method ==='OPTIONS'){

    returnnewResponse('ok',{

    headers: corsHeaders

    });

  }

  try{

    console.log('📋 Oracle Polls List Request received');

    // Initialize Supabase

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for authentication token (optional for listing)

    const sessionToken = req.headers.get('x-session-token');

    let authenticatedWallet =null;

    if(sessionToken){

    try{

    const{ data: session, error: sessionError }=await supabase.from('wallet_sessions').select('wallet_address, expires_at').eq('session_token', sessionToken).gt('expires_at',newDate().toISOString()).single();

    if(!sessionError && session){

    authenticatedWallet = session.wallet_address;

    console.log('✅ Authenticated user:', authenticatedWallet);

    }

    }catch(error){

    console.log('⚠️ Session validation failed, proceeding as anonymous');

    }

    }

    // Fetch polls with options

    const{ data: polls, error: pollsError }=await supabase.from('oracle_polls').select(`

    id,

    title,

    description,

    category,

    ai_generated,

    voting_start,

    voting_end,

    oracle_shards_reward,

    girth_reward_pool,

    required_authentication,

    cooldown_hours,

    oracle_personality,

    corruption_influence,

    status,

    created_at,

    created_by,

    ai_prompt,

    ai_response_raw,

    options:poll_options(

    id,

    poll_id,

    text,

    ai_reasoning,

    predicted_outcome,

    image_url,

    votes_count,

    created_at

    )

    `).order('created_at',{

    ascending:false

    });

    if(pollsError){

    console.error('❌ Error fetching polls:', pollsError);

    returnnewResponse(JSON.stringify({

    error:'Failed to fetch polls'

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    console.log('✅ Found', polls?.length ||0,'polls');

    // Fetch user votes if authenticated

    let userVotes =[];

    if(authenticatedWallet){

    const{ data: votes, error: votesError }=await supabase.from('user_votes').select('poll_id, option_id, voted_at, oracle_shards_earned, voting_streak').eq('wallet_address', authenticatedWallet);

    if(!votesError && votes){

    userVotes = votes;

    console.log('✅ Found', userVotes.length,'user votes');

    }

    }

    // Format polls with user vote data

    const formattedPolls =(polls ||[]).map((poll)=>{

    const userVote = userVotes.find((vote)=>vote.poll_id === poll.id);

    return{

    ...poll,

    voting_start:newDate(poll.voting_start),

    voting_end:newDate(poll.voting_end),

    created_at:newDate(poll.created_at),

    user_vote: userVote ?{

    option_id: userVote.option_id,

    voted_at:newDate(userVote.voted_at),

    oracle_shards_earned: userVote.oracle_shards_earned,

    voting_streak: userVote.voting_streak

    }:null,

    options:(poll.options ||[]).map((opt)=>({

    ...opt,

    created_at:newDate(opt.created_at)

    }))

    };

    });

    returnnewResponse(JSON.stringify({

    polls: formattedPolls

    }),{

    status:200,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

  }catch(error){

    console.error('❌ List polls error:', error);

    returnnewResponse(JSON.stringify({

    error:'Internal server error'

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

  }

});

## oracle-vote


import{ serve }from'https://deno.land/std@0.177.0/http/server.ts';

import{ createClient }from'https://esm.sh/@supabase/supabase-js@2.7.1';

// CORS headers

const corsHeaders ={

  'Access-Control-Allow-Origin':'*',

  'Access-Control-Allow-Headers':'authorization, x-session-token, x-client-info, apikey, content-type',

  'Access-Control-Allow-Methods':'POST, OPTIONS'

};

// Environment variables

const supabaseUrl =Deno.env.get('SUPABASE_URL')??'';

const supabaseServiceKey =Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??'';

serve(async(req)=>{

  // Handle CORS preflight

  if(req.method ==='OPTIONS'){

    returnnewResponse('ok',{

    headers: corsHeaders

    });

  }

  if(req.method !=='POST'){

    returnnewResponse(JSON.stringify({

    error:'Method not allowed'

    }),{

    status:405,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

  }

  try{

    console.log('🗳️ Oracle Vote Request received');

    // Parse request body as JSON

    let requestBody =null;

    try{

    requestBody =await req.json();

    }catch(err){

    console.error('❌ Error parsing request JSON via req.json():', err);

    // Fallback: attempt to read as text then parse

    const raw =await req.text();

    console.log('📋 Raw request body (text fallback):', raw);

    if(raw && raw.trim()){

    try{

    requestBody =JSON.parse(raw);

    }catch(parseErr){

    console.error('❌ Failed to parse request body JSON:', parseErr);

    }

    }

    }

    if(!requestBody){

    returnnewResponse(JSON.stringify({

    error:'Request body is required'

    }),{

    status:400,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    const{ action, pollId, optionId, walletAddress }= requestBody;

    console.log('🗳️ Request data:',{

    action,

    pollId,

    optionId,

    walletAddress

    });

    if(!pollId ||!walletAddress){

    returnnewResponse(JSON.stringify({

    error:'pollId and walletAddress are required'

    }),{

    status:400,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    // For voting, optionId is also required

    if(action !=='check_cooldown'&&!optionId){

    returnnewResponse(JSON.stringify({

    error:'optionId is required for voting'

    }),{

    status:400,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    // Get session token

    const sessionToken = req.headers.get('x-session-token');

    if(!sessionToken){

    returnnewResponse(JSON.stringify({

    error:'Session token required'

    }),{

    status:401,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    // Initialize Supabase

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate session

    const{ data: session, error: sessionError }=await supabase.from('wallet_sessions').select('wallet_address, expires_at').eq('session_token', sessionToken).gt('expires_at',newDate().toISOString()).single();

    if(sessionError ||!session){

    returnnewResponse(JSON.stringify({

    error:'Invalid or expired session'

    }),{

    status:401,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    console.log('✅ Session validated for wallet:', session.wallet_address);

    // Check if user can vote on this poll (24h cooldown per poll)

    const{ data: cooldownCheck, error: cooldownError }=await supabase.rpc('can_user_vote_on_poll',{

    p_wallet_address: session.wallet_address,

    p_poll_id: pollId

    }).single();

    if(cooldownError){

    console.error('❌ Error checking vote cooldown:', cooldownError);

    returnnewResponse(JSON.stringify({

    error:'Error checking vote eligibility'

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    // If this is just a cooldown check, return the status

    if(action ==='check_cooldown'){

    console.log('🕐 Cooldown check requested for:',{

    pollId,

    wallet: session.wallet_address

    });

    returnnewResponse(JSON.stringify({

    success:true,

    cooldown:{

    can_vote: cooldownCheck.can_vote,

    last_vote_at: cooldownCheck.last_vote_at,

    cooldown_expires_at: cooldownCheck.cooldown_expires_at,

    hours_remaining: cooldownCheck.hours_remaining

    }

    }),{

    status:200,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    // For actual voting, check cooldown and proceed if allowed

    if(!cooldownCheck.can_vote){

    console.log('🕐 User in cooldown period:',{

    wallet: session.wallet_address,

    pollId,

    hoursRemaining: cooldownCheck.hours_remaining,

    lastVoteAt: cooldownCheck.last_vote_at,

    cooldownExpiresAt: cooldownCheck.cooldown_expires_at

    });

    returnnewResponse(JSON.stringify({

    error:`You must wait ${Math.ceil(cooldownCheck.hours_remaining)} more hours before voting on this poll again`,

    cooldown:{

    can_vote:false,

    last_vote_at: cooldownCheck.last_vote_at,

    cooldown_expires_at: cooldownCheck.cooldown_expires_at,

    hours_remaining: cooldownCheck.hours_remaining

    }

    }),{

    status:400,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    console.log('✅ Vote eligibility confirmed for poll:', pollId);

    // Get poll details

    const{ data: poll, error: pollError }=await supabase.from('oracle_polls').select('*').eq('id', pollId).single();

    if(pollError ||!poll){

    returnnewResponse(JSON.stringify({

    error:'Poll not found'

    }),{

    status:404,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    // Check if poll is still active

    const now =newDate();

    const votingEnd =newDate(poll.voting_end);

    if(now > votingEnd){

    returnnewResponse(JSON.stringify({

    error:'Voting period has ended'

    }),{

    status:400,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    // Verify option exists

    const{ data: option, error: optionError }=await supabase.from('poll_options').select('id').eq('id', optionId).eq('poll_id', pollId).single();

    if(optionError ||!option){

    returnnewResponse(JSON.stringify({

    error:'Invalid option selected'

    }),{

    status:400,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    // Get current voting streak

    const{ data: userVotes, error: streakError }=await supabase.from('user_votes').select('voting_streak').eq('wallet_address', session.wallet_address).order('voted_at',{

    ascending:false

    }).limit(1);

    const currentStreak =!streakError && userVotes?.[0]?.voting_streak ||0;

    const newStreak = currentStreak +1;

    // Calculate rewards

    const baseReward = poll.oracle_shards_reward ||25;

    const streakBonus =Math.min(newStreak *2,50);

    const totalShards = baseReward + streakBonus;

    // Record vote using the new cooldown-aware function

    const{ data: voteResult, error: voteError }=await supabase.rpc('record_poll_vote',{

    p_wallet_address: session.wallet_address,

    p_poll_id: pollId,

    p_option_id: optionId,

    p_oracle_shards_earned: totalShards,

    p_voting_streak: newStreak

    }).single();

    if(voteError ||!voteResult.success){

    console.error('❌ Error recording vote:', voteError || voteResult.error_message);

    returnnewResponse(JSON.stringify({

    error: voteResult?.error_message ||'Failed to record vote'

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    console.log('✅ Vote recorded:',{

    voteId: voteResult.vote_id,

    previousVoteId: voteResult.previous_vote_id,

    isVoteChange:!!voteResult.previous_vote_id

    });

    // Update option vote count

    const{ error: updateError }=await supabase.rpc('increment_option_votes',{

    option_id: optionId

    });

    if(updateError){

    console.error('❌ Error updating vote count:', updateError);

    }

    // Update Oracle Shards balance

    const{ error: shardsError }=await supabase.rpc('increment_oracle_shards',{

    wallet_addr: session.wallet_address,

    amount: totalShards

    });

    if(shardsError){

    console.error('❌ Error updating Oracle Shards:', shardsError);

    }

    console.log('✅ Vote recorded successfully:',{

    pollId,

    optionId,

    wallet: session.wallet_address,

    shards: totalShards,

    streak: newStreak,

    isVoteChange:!!voteResult.previous_vote_id

    });

    const commentaryText = voteResult.previous_vote_id ?`The Oracle notes your change of heart. +${totalShards} Oracle Shards earned! Voting streak: ${newStreak}`:`The Oracle acknowledges your choice. +${totalShards} Oracle Shards earned! Voting streak: ${newStreak}`;

    returnnewResponse(JSON.stringify({

    success:true,

    vote:{

    id: voteResult.vote_id,

    poll_id: pollId,

    option_id: optionId,

    wallet_address: session.wallet_address,

    voted_at:newDate(),

    oracle_shards_earned: totalShards,

    voting_streak: newStreak,

    is_vote_change:!!voteResult.previous_vote_id,

    previous_vote_id: voteResult.previous_vote_id

    },

    oracle_commentary:{

    commentary_text: commentaryText,

    urgency:'low'

    }

    }),{

    status:200,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

  }catch(error){

    console.error('❌ Vote error:', error);

    returnnewResponse(JSON.stringify({

    error:'Internal server error'

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

  }

});
