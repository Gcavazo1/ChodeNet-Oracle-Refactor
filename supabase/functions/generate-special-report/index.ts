import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.170.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SpecialReportRequest {
  trigger_reason?: string;
  girth_index_snapshot?: any;
  automated_trigger?: boolean;
  trigger_timestamp?: string;
  force_regenerate?: boolean;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting Special Report generation...');

    // Parse request body
    const requestBody: SpecialReportRequest = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current girth index values and recent prophecies for context
    const { data: girthData, error: girthError } = await supabase
      .from('girth_index_current_values')
      .select('*')
      .single();

    if (girthError) {
      console.error('Error fetching girth data:', girthError);
      // Continue with default values if girth data fails
    }

    // Fix: Use correct table name 'apocryphal_scrolls' instead of 'prophecies'
    const { data: recentProphecies, error: prophecyError } = await supabase
      .from('apocryphal_scrolls')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (prophecyError) {
      console.error('Error fetching recent prophecies:', prophecyError);
      // Continue without prophecies if this fails
    }

    const { data: recentEvents, error: eventsError } = await supabase
      .from('live_game_events')
      .select('*')
      .order('game_event_timestamp', { ascending: false })
      .limit(50);

    if (eventsError) {
      console.error('Error fetching recent events:', eventsError);
      // Continue without events if this fails
    }

    // Calculate summary stats
    const totalEvents = recentEvents?.length || 0;
    const eventTypes = recentEvents?.reduce((acc: any, event: any) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {});

    // Determine report severity and type
    const severity = determineSeverity(girthData, requestBody.trigger_reason);
    const reportType = determineReportType(severity, requestBody.trigger_reason);

    // Generate special report using OpenAI-compatible API
    const reportContent = await generateSpecialReport({
      triggerReason: requestBody.trigger_reason || 'Scheduled Weekly Report',
      girthIndex: girthData,
      recentProphecies: recentProphecies || [],
      activitySummary: {
        totalEvents,
        eventTypes,
        timeframe: '30 minutes'
      },
      severity,
      reportType
    });

    // Store the special report
    const { data: reportRecord, error: insertError } = await supabase
      .from('special_reports')
      .insert({
        title: reportContent.title,
        content: reportContent.content,
        trigger_reason: requestBody.trigger_reason || 'Scheduled Report',
        severity_level: severity,
        report_type: reportType,
        girth_index_snapshot: girthData,
        activity_summary: { totalEvents, eventTypes },
        automated_trigger: requestBody.automated_trigger || false,
        audio_generated: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to store special report: ${insertError.message}`);
    }

    console.log(`Special Report generated: ${reportRecord.id}`);

    // Generate audio if ElevenLabs API is available
    let audioUrl = null;
    try {
      audioUrl = await generateAudio(reportContent.content, reportRecord.id);
      
      if (audioUrl) {
        await supabase
          .from('special_reports')
          .update({ 
            audio_url: audioUrl, 
            audio_generated: true 
          })
          .eq('id', reportRecord.id);
      }
    } catch (audioError) {
      console.error('Audio generation failed:', audioError);
      // Continue without audio - report is still valid
    }

    return new Response(
      JSON.stringify({
        success: true,
        report: {
          id: reportRecord.id,
          title: reportContent.title,
          content: reportContent.content,
          severity: severity,
          audioUrl: audioUrl,
          createdAt: reportRecord.created_at
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Special Report generation error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
})

function determineSeverity(girthData: any, triggerReason?: string): string {
  if (!girthData) return 'MEDIUM';
  
  const { divine_girth_resonance, oracle_stability_status, legion_morale } = girthData;
  
  if (oracle_stability_status === 'CRITICAL_CORRUPTION' || 
      divine_girth_resonance <= 5 || 
      legion_morale === 'SUICIDE_WATCH') {
    return 'CRITICAL';
  }
  
  if (oracle_stability_status === 'UNSTABLE' || 
      divine_girth_resonance <= 15 || 
      legion_morale === 'DEMORALIZED') {
    return 'HIGH';
  }
  
  if (divine_girth_resonance >= 85 || 
      oracle_stability_status === 'RADIANT_CLARITY') {
    return 'CELEBRATION';
  }
  
  return 'MEDIUM';
}

function determineReportType(severity: string, triggerReason?: string): string {
  if (triggerReason?.includes('Emergency')) return 'EMERGENCY_ALERT';
  if (triggerReason?.includes('Weekly') || triggerReason?.includes('Scheduled')) return 'WEEKLY_DIGEST';
  if (severity === 'CRITICAL') return 'CRISIS_REPORT';
  if (severity === 'CELEBRATION') return 'VICTORY_PROCLAMATION';
  return 'STATUS_UPDATE';
}

async function generateSpecialReport(context: any): Promise<{title: string, content: string}> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    // Return a fallback report instead of throwing error
    console.warn('OpenAI API key not configured, generating fallback report');
    return {
      title: `Oracle Status Report - ${context.severity}`,
      content: `The Oracle speaks without external AI assistance:\n\nCurrent State: ${context.severity}\nTrigger: ${context.triggerReason}\nActivity: ${context.activitySummary.totalEvents} events processed\n\nThe cosmic algorithms continue their eternal dance, even when the external AI oracles remain silent. Trust in the CHODE, for it is eternal.`
    };
  }

  const prompt = createReportPrompt(context);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are the ChodeNet Oracle, a mystical AI entity that provides cryptic yet insightful reports on the cosmic balance of the $CHODE token ecosystem. Your reports blend technical analysis with mystical prophecy, always maintaining the sacred balance between enlightenment and entertainment.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.8
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${result.error?.message || 'Unknown error'}`);
    }

    const content = result.choices[0]?.message?.content || 'The Oracle remains silent...';
    
    // Extract title from content or generate one
    const lines = content.split('\n').filter(line => line.trim());
    const title = lines[0]?.replace(/^#+\s*/, '') || `Special Oracle Report - ${context.severity}`;
    
    return {
      title: title.substring(0, 200), // Limit title length
      content: content
    };
  } catch (apiError) {
    console.error('OpenAI API call failed:', apiError);
    // Return fallback report
    return {
      title: `Oracle Emergency Report - ${context.severity}`,
      content: `The Oracle's connection to the external AI realm has been severed, but the wisdom flows nonetheless:\n\nCurrent State: ${context.severity}\nTrigger: ${context.triggerReason}\nActivity: ${context.activitySummary.totalEvents} events in ${context.activitySummary.timeframe}\n\nEven when the digital spirits are silent, the CHODE endures. The Legion must remain vigilant.`
    };
  }
}

function createReportPrompt(context: any): string {
  const { triggerReason, girthIndex, recentProphecies, activitySummary, severity, reportType } = context;
  
  return `
Generate a mystical Oracle Special Report with the following context:

**TRIGGER REASON:** ${triggerReason}
**SEVERITY LEVEL:** ${severity}
**REPORT TYPE:** ${reportType}

**CURRENT GIRTH INDEX STATE:**
- Divine Girth Resonance: ${girthIndex?.divine_girth_resonance || 'Unknown'}%
- Tap Surge Index: ${girthIndex?.tap_surge_index || 'Unknown'}
- Legion Morale: ${girthIndex?.legion_morale || 'Unknown'}
- Oracle Stability: ${girthIndex?.oracle_stability_status || 'Unknown'}

**RECENT ACTIVITY:**
- Total Events: ${activitySummary.totalEvents}
- Event Types: ${JSON.stringify(activitySummary.eventTypes)}
- Recent Prophecies: ${recentProphecies.length} prophecies generated

**INSTRUCTIONS:**
1. Create an engaging title that reflects the severity and nature of the report
2. Write in the mystical voice of the ChodeNet Oracle
3. Include analysis of the current state and recent activity
4. Provide insights, warnings, or celebrations as appropriate
5. End with actionable guidance for the Legion
6. Keep it between 500-1000 words
7. Use dramatic but not overly verbose language
8. Include references to the cosmic balance and the sacred $CHODE

Format as markdown with clear sections.
`;
}

async function generateAudio(content: string, reportId: string): Promise<string | null> {
  const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
  const voiceId = Deno.env.get('ELEVENLABS_VOICE_ID') || 'EXAVITQu4vr4xnSDxMaL'; // Default to a dramatic voice
  
  if (!elevenLabsApiKey) {
    console.log('ElevenLabs API key not found, skipping audio generation');
    return null;
  }

  // Clean content for audio (remove markdown formatting)
  const cleanContent = content
    .replace(/#+\s*/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove code formatting
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey
      },
      body: JSON.stringify({
        text: cleanContent,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBlob = await response.arrayBuffer();
    
    // In a real implementation, you'd upload this to Supabase storage
    // For now, we'll return a placeholder URL
    // TODO: Implement actual file upload to Supabase storage
    
    console.log(`Audio generated for report ${reportId}, size: ${audioBlob.byteLength} bytes`);
    return `generated-audio-${reportId}.mp3`; // Placeholder URL
    
  } catch (error) {
    console.error('ElevenLabs audio generation failed:', error);
    return null;
  }
} 