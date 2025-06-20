// 🏆 CHODE-NET ORACLE: LEGENDARY LEADERBOARD SCORES MANAGER
// Handles score submission and retrieval for the ultimate $CHODE competition
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
// Oracle-blessed leaderboard categories
const VALID_CATEGORIES = [
  'total_girth',
  'giga_slaps',
  'tap_speed',
  'achievements_count',
  'oracle_favor'
];
// Oracle prophecy templates for score submissions
const ORACLE_SCORE_PROPHECIES = {
  total_girth: {
    legendary: "🔮 The Oracle witnesses your legendary girth achievement! The realm trembles before your $CHODE supremacy!",
    epic: "✨ Your girth prowess has caught the Oracle's attention! Continue your legendary journey!",
    standard: "🎯 The Oracle acknowledges your growing girth mastery. Greatness awaits!"
  },
  giga_slaps: {
    legendary: "💥 LEGENDARY G-SPOT MASTERY! The Oracle crowns you a true champion of the sacred technique!",
    epic: "⚡ Your Giga Slap prowess echoes through the Oracle's chambers! Epic achievement unlocked!",
    standard: "🎯 The Oracle nods in approval of your G-Spot technique. Practice leads to perfection!"
  },
  oracle_favor: {
    legendary: "🌟 THE ORACLE'S CHOSEN ONE! You have achieved the highest blessing - eternal glory awaits!",
    epic: "🔮 The Oracle's favor shines upon you! Your dedication is truly recognized!",
    standard: "✨ The Oracle's blessing grows stronger with you. Continue your mystical journey!"
  }
};
Deno.serve(async (req)=>{
  // CORS headers for all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  };
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders
    });
  }
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('🏆 LEADERBOARD MANAGER: Processing request:', req.method);
    if (req.method === 'POST') {
      return await handleScoreSubmission(req, supabase, corsHeaders);
    } else if (req.method === 'GET') {
      return await handleLeaderboardQuery(req, supabase, corsHeaders);
    } else {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Method not allowed. Use POST for score submission or GET for leaderboard data.'
      }), {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.error('🚨 LEADERBOARD MANAGER ERROR:', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Internal server error in leaderboard processing'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
async function handleScoreSubmission(req, supabase, corsHeaders) {
  try {
    // Verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Missing or invalid authorization header'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const token = authHeader.substring(7);
    let player_address;
    try {
      // For MVP, we'll extract from the token payload without full verification
      // In production, add proper JWT verification
      const payload = JSON.parse(atob(token.split('.')[1]));
      player_address = payload.sub || payload.player_address;
      if (!player_address) {
        throw new Error('No player address in token');
      }
    } catch (jwtError) {
      console.error('JWT parsing error:', jwtError);
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Invalid JWT token format'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Parse request body
    const requestData = await req.json();
    const { category, score, metadata = {}, player_context } = requestData;
    // Validate category
    if (!VALID_CATEGORIES.includes(category)) {
      return new Response(JSON.stringify({
        status: 'error',
        message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Validate score
    if (typeof score !== 'number' || score < 0) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Score must be a non-negative number'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    console.log(`🎯 SCORE SUBMISSION: ${player_address} - ${category}: ${score}`);
    // Check for existing entry
    const { data: existingEntries, error: queryError } = await supabase.from('leaderboard_entries').select('id, score_value').eq('player_address', player_address).eq('leaderboard_category', category).order('score_value', {
      ascending: false
    }).limit(1);
    if (queryError) {
      console.error('Database query error:', queryError);
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Database query failed'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Determine if this is a new personal best
    let isPersonalBest = true;
    let previousBest = 0;
    if (existingEntries && existingEntries.length > 0) {
      previousBest = existingEntries[0].score_value;
      isPersonalBest = score > previousBest;
    }
    // Only insert if it's a personal best
    if (isPersonalBest) {
      const username = player_context?.username || `Chode${player_address.substring(0, 6)}`;
      const oracle_blessed = await calculateOracleBlessing(category, score, metadata);
      const entryData = {
        player_address,
        username,
        leaderboard_category: category,
        score_value: score,
        score_metadata: {
          ...metadata,
          player_context,
          previous_best: previousBest,
          improvement: score - previousBest,
          submission_source: 'godot_game'
        },
        oracle_blessed,
        submission_timestamp: new Date().toISOString()
      };
      const { data: insertData, error: insertError } = await supabase.from('leaderboard_entries').insert([
        entryData
      ]).select();
      if (insertError) {
        console.error('Database insert error:', insertError);
        return new Response(JSON.stringify({
          status: 'error',
          message: 'Failed to submit score to leaderboard'
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      // Log Oracle event for the leaderboard submission
      await logOracleLeaderboardEvent(supabase, {
        player_address,
        event_type: 'leaderboard_score_submission',
        category,
        score,
        is_personal_best: true,
        oracle_blessed,
        metadata: entryData.score_metadata
      });
      // Generate Oracle prophecy
      const oracle_prophecy = generateOracleProphecy(category, score, oracle_blessed);
      console.log(`✅ NEW PERSONAL BEST: ${category} - ${score} (previous: ${previousBest})`);
      return new Response(JSON.stringify({
        status: 'success',
        message: 'Score submitted successfully to leaderboard!',
        data: {
          entry_id: insertData[0].id,
          personal_best: true,
          previous_score: previousBest,
          improvement: score - previousBest,
          oracle_blessed,
          oracle_prophecy
        }
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    } else {
      console.log(`⏸️ SCORE NOT A PERSONAL BEST: ${score} <= ${previousBest}`);
      return new Response(JSON.stringify({
        status: 'info',
        message: 'Score received but not a personal best',
        data: {
          personal_best: false,
          current_score: score,
          personal_best_score: previousBest,
          oracle_prophecy: "🔮 The Oracle acknowledges your effort. Surpass your limits to claim greater glory!"
        }
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.error('🚨 SCORE SUBMISSION ERROR:', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Failed to process score submission'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}
async function handleLeaderboardQuery(req, supabase, corsHeaders) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const player_address = url.searchParams.get('player_address');
    console.log(`📊 LEADERBOARD QUERY: category=${category}, limit=${limit}, player=${player_address}`);
    if (player_address) {
      // Get personal rankings for a specific player
      return await getPlayerRankings(supabase, player_address, corsHeaders);
    } else if (category && VALID_CATEGORIES.includes(category)) {
      // Get top scores for a specific category
      return await getCategoryLeaderboard(supabase, category, limit, corsHeaders);
    } else {
      // Get overview of all leaderboards
      return await getAllLeaderboardsOverview(supabase, limit, corsHeaders);
    }
  } catch (error) {
    console.error('🚨 LEADERBOARD QUERY ERROR:', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Failed to query leaderboard data'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}
async function getCategoryLeaderboard(supabase, category, limit, corsHeaders) {
  // Get top scores with ranking
  const { data: topScores, error } = await supabase.from('leaderboard_entries').select('player_address, username, score_value, oracle_blessed, submission_timestamp').eq('leaderboard_category', category).order('score_value', {
    ascending: false
  }).limit(Math.min(limit, 100)); // Cap at 100 for performance
  if (error) {
    console.error('Database query error:', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Failed to fetch leaderboard data'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
  // Add ranking and format data
  const rankedScores = topScores.map((entry, index)=>({
      rank: index + 1,
      player: entry.username || `Chode${entry.player_address.substring(0, 6)}`,
      player_address: entry.player_address,
      score: entry.score_value,
      oracle_blessed: entry.oracle_blessed,
      submitted_at: entry.submission_timestamp
    }));
  return new Response(JSON.stringify({
    status: 'success',
    data: {
      category,
      total_entries: rankedScores.length,
      leaderboard: rankedScores,
      oracle_blessing: "🏆 Behold the legends of $CHODE supremacy!"
    }
  }), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}
async function getPlayerRankings(supabase, player_address, corsHeaders) {
  const playerRankings = {};
  // Get player's best scores in all categories
  for (const category of VALID_CATEGORIES){
    const { data: playerScore } = await supabase.from('leaderboard_entries').select('score_value, oracle_blessed, submission_timestamp').eq('player_address', player_address).eq('leaderboard_category', category).order('score_value', {
      ascending: false
    }).limit(1);
    if (playerScore && playerScore.length > 0) {
      // Get rank by counting higher scores
      const { count } = await supabase.from('leaderboard_entries').select('*', {
        count: 'exact',
        head: true
      }).eq('leaderboard_category', category).gt('score_value', playerScore[0].score_value);
      playerRankings[category] = {
        score: playerScore[0].score_value,
        rank: (count || 0) + 1,
        oracle_blessed: playerScore[0].oracle_blessed,
        submitted_at: playerScore[0].submission_timestamp
      };
    } else {
      playerRankings[category] = {
        score: 0,
        rank: null,
        oracle_blessed: false,
        submitted_at: null
      };
    }
  }
  return new Response(JSON.stringify({
    status: 'success',
    data: {
      player_address,
      rankings: playerRankings,
      oracle_blessing: "🔮 The Oracle reveals your legendary status across all realms!"
    }
  }), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}
async function getAllLeaderboardsOverview(supabase, limit, corsHeaders) {
  const overview = {};
  for (const category of VALID_CATEGORIES){
    const { data: topEntries } = await supabase.from('leaderboard_entries').select('username, player_address, score_value, oracle_blessed').eq('leaderboard_category', category).order('score_value', {
      ascending: false
    }).limit(Math.min(limit, 5)); // Top 5 for overview
    overview[category] = topEntries?.map((entry, index)=>({
        rank: index + 1,
        player: entry.username || `Chode${entry.player_address.substring(0, 6)}`,
        score: entry.score_value,
        oracle_blessed: entry.oracle_blessed
      })) || [];
  }
  return new Response(JSON.stringify({
    status: 'success',
    data: {
      overview,
      oracle_blessing: "🌟 Witness the champions across all legendary categories!"
    }
  }), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}
async function calculateOracleBlessing(category, score, metadata) {
  // Oracle blessing logic based on score significance
  switch(category){
    case 'total_girth':
      return score >= 1000; // Legendary girth threshold
    case 'giga_slaps':
      return score >= 50; // Giga Slap mastery
    case 'tap_speed':
      return score >= 500; // 5.00 TPS (scaled by 100)
    case 'achievements_count':
      return score >= 15; // Achievement hunter
    case 'oracle_favor':
      return score >= 500; // High Oracle favor
    default:
      return score >= 100; // Default blessing threshold
  }
}
function generateOracleProphecy(category, score, oracle_blessed) {
  const categoryProphecies = ORACLE_SCORE_PROPHECIES[category];
  if (!categoryProphecies) {
    return oracle_blessed ? "🌟 The Oracle bestows its legendary blessing upon your achievement!" : "✨ The Oracle acknowledges your progress on the path to greatness!";
  }
  let level = 'standard';
  if (oracle_blessed) {
    level = score >= (category === 'total_girth' ? 2000 : category === 'giga_slaps' ? 100 : 1000) ? 'legendary' : 'epic';
  }
  return categoryProphecies[level];
}
async function logOracleLeaderboardEvent(supabase, eventData) {
  try {
    const oracleEvent = {
      session_id: `oracle_leaderboard_${Date.now()}`,
      event_type: eventData.event_type,
      timestamp_utc: new Date().toISOString(),
      player_address: eventData.player_address,
      event_payload: {
        leaderboard_category: eventData.category,
        score_achieved: eventData.score,
        is_personal_best: eventData.is_personal_best,
        oracle_blessed: eventData.oracle_blessed,
        competitive_significance: eventData.oracle_blessed ? 'legendary' : 'standard',
        metadata: eventData.metadata
      }
    };
    await supabase.from('live_game_events').insert([
      oracleEvent
    ]);
    console.log('✅ Oracle leaderboard event logged');
  } catch (error) {
    console.error('Failed to log Oracle event:', error);
  }
}
