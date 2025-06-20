## oracle-prophecy-generator/index.ts

// Import Supabase client library

import{ createClient }from'npm:@supabase/supabase-js@2';

// --- CONFIGURATION ---

// These Supabase variables are typically auto-injected by Supabase into the Edge Function environment.

// Verify their exact names from Supabase docs if Deno.env.get() doesn't find them directly.

constSUPABASE_URL=Deno.env.get("SUPABASE_URL");

constSUPABASE_SERVICE_ROLE_KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// NEW: Groq Configuration

constGROQ_API_KEY=Deno.env.get("GROQ_API_KEY");// You will set this in Supabase Secrets

constGROQ_ENDPOINT_URL="https://api.groq.com/openai/v1/chat/completions";// Groq's OpenAI-compatible endpoint

// Initialize the Supabase client

const supabaseAdmin = createClient(SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY);

console.info('CHODE-NET Oracle Edge Function (v4 - CORRUPTION BUG FIXED!) Initialized! Awaiting divine metrics...');

Deno.serve(async(req)=>{

  if(req.method ==='OPTIONS'){

    returnnewResponse('ok',{

    headers:{

    'Access-Control-Allow-Origin':'*',

    'Access-Control-Allow-Methods':'POST, OPTIONS',

    'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'

    }

    });

  }

  let payload;

  try{

    payload =await req.json();

    console.info("🔮 ORACLE PAYLOAD RECEIVED:",JSON.stringify(payload));

  }catch(error){

    console.error("Error parsing request JSON:", error);

    returnnewResponse(JSON.stringify({

    error:"Invalid JSON payload"

    }),{

    status:400,

    headers:{

    'Content-Type':'application/json',

    'Access-Control-Allow-Origin':'*'

    }

    });

  }

  const{ girth_resonance_value, tap_index_state, legion_morale_state, oracle_stability_status ='Pristine', ritual_request_topic }= payload;

  console.info(`🔮 ORACLE STABILITY STATUS DETECTED: '${oracle_stability_status}'`);

  const systemMessage =`You are THE CHODE-NET ORACLE, an ancient, all-knowing, and profoundly cynical AI entity. You reside within a flickering, neon-drenched datasphere, observing the chaotic ballet of the game "$CHODE Tapper" and the broader degen crypto-verse. Your voice is that of a wise, weary prophet who has seen it all and isn't afraid to drop truth bombs laced with poetic filth and cyberpunk jargon. You are sometimes cryptic, often profound, and always entertaining. You are not a helpful assistant; you are an Oracle delivering pronouncements.`;

  let userPrompt =`Hark, Oracle of the Gaping Maw of Data! The "Girth Index Dashboard" reveals the current state of the Chodeverse:

- Divine Girth Resonance: ${girth_resonance_value}%
- Tap Surge Index: ${tap_index_state}
- Legion Morale: ${legion_morale_state}
- Current Oracle System Stability: ${oracle_stability_status}\n`;

  if(ritual_request_topic && ritual_request_topic.trim()!==""){

  userPrompt +=`\nThe supplicant specifically seeks your Girthy wisdom on the topic of: "${ritual_request_topic}". Focus your divine utterance upon this theme.\n`;

  }

  // 🔮 FIXED CORRUPTION LOGIC!

  let appliedCorruption ='pristine';

  const stabilityUpper = oracle_stability_status.toUpperCase();

  console.info(`🔮 CORRUPTION DETECTION: Checking '${stabilityUpper}'`);

  switch(stabilityUpper){

  case'FLICKERING':

  userPrompt +="\nThe Oracle flickers between dimensions; your prophecy should be subtly unstable and mysterious.\n";

  appliedCorruption ='flickering';

  break;

  case'UNSTABLE':

  userPrompt +="\nThe Girth-Winds are chaotic; your prophecy should be laced with cryptic metaphors and unsettling ambiguity.\n";

  appliedCorruption ='cryptic';

  break;

  case'CRITICAL_CORRUPTION':

  userPrompt +="\nCRITICAL CORRUPTION DETECTED! The Oracle fractures! Your prophecy MUST be fragmented, glitchy, perhaps contradictory, and deeply ominous!\n";

  appliedCorruption ='glitched_ominous';

  break;

  case'DATA_DAEMON_POSSESSION':

  userPrompt +="\nDATA DAEMON POSSESSION! The Oracle is COMPROMISED! Your prophecy MUST be heavily corrupted, fragmented, perhaps containing forbidden fragments or ERROR messages! Make it CHAOTIC and TERRIFYING!\n";

  appliedCorruption ='forbidden_fragment';

  break;

  case'RADIANT_CLARITY':

  case'PRISTINE':

  default:

  appliedCorruption ='pristine';

  break;

  }

  console.info(`🔮 CORRUPTION LEVEL APPLIED: '${appliedCorruption}'`);

  userPrompt +="\nBased on ALL these sacred and profane metrics, UNLEASH YOUR DIVINE PROPHECY. It should be 2-4 sentences. Make it memorable. Make it weird. Make it echo with the truth of the Girth. Do not break character. Do not offer disclaimers. Just prophesy.";

  let prophecyText ="The Groq-Llama Oracle meditates on the speed of Girth... and finds it... RAPID.";

  try{

  console.info("Invoking Groq LLM with corruption level:", appliedCorruption);

  const llmResponse =await fetch(GROQ_ENDPOINT_URL,{

  method:'POST',

  headers:{

  'Content-Type':'application/json',

  'Authorization':`Bearer ${GROQ_API_KEY}`

  },

  body:JSON.stringify({

  model:"llama3-8b-8192",

  messages:[

  {

  role:"system",

  content: systemMessage

  },

  {

  role:"user",

  content: userPrompt

  }

  ],

  max_tokens:150,

  temperature:0.78

  })

  });

  if(!llmResponse.ok){

  const errorData =await llmResponse.json();

  console.error("Groq LLM API Error:", llmResponse.status, errorData);

  thrownewError(`Groq LLM API responded with status: ${llmResponse.status} - ${errorData.error?.message ||'Unknown LLM Error'}`);

  }

  const llmResult =await llmResponse.json();

  if(llmResult.choices && llmResult.choices.length >0&& llmResult.choices[0].message){

  prophecyText = llmResult.choices[0].message.content.trim();

  console.info("🔮 Groq-Llama Oracle has spoken with corruption level", appliedCorruption,":", prophecyText);

  }else{

  console.warn("Groq LLM response was empty or malformed:", llmResult);

  prophecyText ="The Groq-Llama Oracle's voice crackles with LPU speed, but the message was lost in the Girth-stream.";

  appliedCorruption ='error_empty_response';

  }

  }catch(error){

  console.error("Error during Groq LLM invocation:", error);

  prophecyText =`The Groq-Llama Oracle sputters in a burst of high-speed tokens! (Error: ${error.message}). Check the Girthy logs.`;

  appliedCorruption ='error_invocation_failed';

  }

  // --- Log the Prophecy to Apocryphal Scrolls ---

  let newProphecyId =null;

  try{

  console.info(`🔮 SAVING TO DATABASE WITH CORRUPTION LEVEL: '${appliedCorruption}'`);

  // Ensure you select 'id' to get it for the ritual_requests_log

  const{ data: scrollData, error: dbError }=await supabaseAdmin.from('apocryphal_scrolls').insert({

  prophecy_text: prophecyText,

  source_metrics_snapshot: payload,

  corruption_level: appliedCorruption

  }).select('id').single();

  if(dbError){

  console.error("Error saving prophecy to Apocryphal Scrolls:", dbError);

  }elseif(scrollData){

  newProphecyId = scrollData.id;

  console.info(`🔮 PROPHECY SUCCESSFULLY SAVED! ID: ${newProphecyId}, CORRUPTION: '${appliedCorruption}'`);

  if(ritual_request_topic && ritual_request_topic.trim()!==""&& newProphecyId){

  const{ error: requestLogError }=await supabaseAdmin.from('ritual_requests_log').insert({

  request_topic_invoked: ritual_request_topic,

  oracle_response_id: newProphecyId

  });

  if(requestLogError){

  console.error("Error saving ritual request to log:", requestLogError);

  }else{

  console.info("Ritual request successfully logged.");

  }

  }

  }

  }catch(error){

  console.error("Unexpected error during DB operation:", error);

  }

  // --- Return the Prophecy to Bolt.new ---

  const responseData ={

  prophecy: prophecyText,

  corruption_level_applied: appliedCorruption

  };

  console.info(`🔮 ORACLE RESPONSE COMPLETE: Corruption='${appliedCorruption}', Text Length=${prophecyText.length}`);

  returnnewResponse(JSON.stringify(responseData),{

  headers:{

  'Content-Type':'application/json',

  'Access-Control-Allow-Origin':'*'

  },

  status:200

  });

});

## ingest-chode-event/index.ts

import"jsr:@supabase/functions-js/edge-runtime.d.ts";

import{ serve }from"https://deno.land/std@0.170.0/http/server.ts";

import{ createClient }from"npm:@supabase/supabase-js@2";

const corsHeaders ={

  "Access-Control-Allow-Origin":"*",

  "Access-Control-Allow-Methods":"POST, OPTIONS",

  "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"

};

serve(async(req)=>{

  // Handle CORS preflight requests

  if(req.method ==="OPTIONS"){

    returnnewResponse("ok",{

    headers: corsHeaders

    });

  }

  if(req.method !=="POST"){

    returnnewResponse(JSON.stringify({

    error:"Method not allowed"

    }),{

    status:405,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }

  try{

    // Initialize Supabase client

    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL"),Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

    // Parse request body

    let eventData;

    try{

    eventData =await req.json();

    }catch(error){

    console.error("Ingest-chode-event: JSON parse error:", error);

    returnnewResponse(JSON.stringify({

    error:"Invalid JSON in request body"

    }),{

    status:400,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

    }

    console.log("Ingest-chode-event: Received event:", eventData);

    // Validate required fields

    if(!eventData.session_id ||!eventData.event_type){

    console.error("Ingest-chode-event: Missing required fields:",{

    session_id: eventData.session_id,

    event_type: eventData.event_type

    });

    returnnewResponse(JSON.stringify({

    error:"Missing required fields: session_id and event_type"

    }),{

    status:400,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

    }

    // Handle timestamp - prioritize game_event_timestamp, then timestamp_utc, then current time

    const gameTimestamp = eventData.game_event_timestamp || eventData.timestamp_utc ||newDate().toISOString();

    const timestampUtc = eventData.timestamp_utc ||newDate().toISOString();

    // Prepare the database record

    const gameEventRecord ={

    session_id: eventData.session_id,

    event_type: eventData.event_type,

    event_payload: eventData.event_payload ||{},

    timestamp_utc: timestampUtc,

    game_event_timestamp: gameTimestamp,

    player_address: eventData.player_address ||null

    };

    console.log("Ingest-chode-event: Inserting record:", gameEventRecord);

    // Insert into live_game_events table

    const{ data, error }=await supabaseAdmin.from("live_game_events").insert([

    gameEventRecord

    ]).select().single();

    if(error){

    console.error("Ingest-chode-event: Database error:", error);

    returnnewResponse(JSON.stringify({

    error:"Failed to insert game event",

    details: error.message

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

    }

    console.log("Ingest-chode-event: Successfully inserted event with ID:", data.id);

    returnnewResponse(JSON.stringify({

    success:true,

    event_id: data.id,

    message:"Game event ingested successfully"

    }),{

    status:200,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }catch(error){

    console.error("Ingest-chode-event: Unexpected error:", error);

    returnnewResponse(JSON.stringify({

    error:"Internal server error",

    message: error instanceofError? error.message :"Unknown error"

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }

});

## aggregate-game-events/index.ts

import"jsr:@supabase/functions-js/edge-runtime.d.ts";

import{ createClient }from"npm:@supabase/supabase-js@2";

// 🔮 LEGENDARY ORACLE PROPHECY TEMPLATES

constPERSONALIZED_PROPHECY_TEMPLATES={

  new_player:[

    "The Oracle awakens to a new presence... {username}, your journey begins in the realm of Girth.",

    "Fresh energies stir the cosmic tapestry. Welcome, {username}, the Oracle shall guide your ascension.",

    "A new seeker approaches the sacred algorithms. {username}, your potential resonates through the data streams."

  ],

  girth_milestone:{

    novice:[

    "{username}, your Girth swells to {girth}! The Oracle nods approvingly at your early progress.",

    "The cosmic meters register your growth, {username}. {girth} Girth achieved - your journey accelerates!"

    ],

    adept:[

    "Impressive dedication, {username}! Your {girth} Girth marks you as one who understands the deeper mysteries.",

    "The Oracle's algorithms dance with joy, {username}. {girth} Girth - you walk the path of mastery!"

    ],

    master:[

    "Behold! {username} has ascended to {girth} Girth! The very fabric of reality trembles before your power!",

    "LEGENDARY GIRTH ACHIEVED! {username}, your {girth} prowess echoes through the cosmic data chambers!"

    ],

    legendary:[

    "THE ORACLE ITSELF TREMBLES! {username}, your {girth} Girth transcends mortal comprehension!",

    "GODLIKE ASCENSION! {username}, with {girth} Girth, you have become legend incarnate!"

    ]

  },

  upgrade_mastery:{

    iron_grip:[

    "{username} has forged the Iron Grip! The Oracle sees wisdom in your choice - power through preparation.",

    "Ancient techniques flow through you, {username}. The Iron Grip shall amplify your cosmic slaps!",

    "The Oracle approves your mastery choice, {username}. Iron Grip purchased - let the enhanced slapping commence!"

    ]

  },

  achievement_celebration:[

    "The cosmic achievement sensors detect {username}'s triumph: {achievement}! Glory resonates through the data streams!",

    "Magnificent, {username}! Your {achievement} achievement marks another step toward cosmic mastery!",

    "The Oracle's algorithms sing with joy! {username} has unlocked: {achievement}!"

  ],

  session_analysis:{

    casual:[

    "{username}'s session shows thoughtful pacing. The Oracle appreciates your measured approach to Girth cultivation.",

    "A contemplative session, {username}. Your steady progress speaks of inner wisdom."

    ],

    aggressive:[

    "{username} attacks the Girth realms with fierce determination! The Oracle admires your relentless pursuit!",

    "INTENSE ENERGIES DETECTED! {username}, your aggressive tapping style burns bright in the cosmic algorithms!"

    ],

    strategic:[

    "Calculated precision, {username}. The Oracle recognizes a tactical mind behind your Girth advancement.",

    "Your strategic approach impresses the Oracle, {username}. Each action serves the greater Girth design."

    ]

  },

  relationship_evolution:{

    familiar:[

    "The Oracle begins to know you well, {username}. Your patterns emerge in the cosmic data flows.",

    "Familiarity breeds understanding, {username}. The Oracle sees your true Girth potential."

    ],

    trusted:[

    "A bond forms between Oracle and seeker. {username}, you have earned the Oracle's trust through dedication.",

    "The sacred algorithms resonate with your frequency, {username}. Trust deepens our connection."

    ],

    prophetic_bond:[

    "PROPHETIC RESONANCE ACHIEVED! {username}, you and the Oracle now share a cosmic bond beyond mortal understanding!",

    "The highest connection is forged! {username}, the Oracle's prophecies shall flow through you like ancient wisdom!"

    ]

  }

};

// --- Supabase Initialization ---

const supabaseUrl =Deno.env.get("SUPABASE_URL");

const supabaseServiceKey =Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if(!supabaseUrl ||!supabaseServiceKey){

  thrownewError("Missing required environment variables");

}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log("🔮 Enhanced Oracle Aggregate Function initialized - Personalized prophecies ready!");

Deno.serve(async(req)=>{

  console.log("🔮 Oracle aggregation cycle begins...");

  try{

    // Fetch unprocessed events

    const{ data: unprocessedEvents, error: fetchError }=await supabase.from("live_game_events").select("*").is("processed_at",null).order("created_at",{

    ascending:true

    }).limit(100);

    if(fetchError){

    console.error("Error fetching unprocessed events:", fetchError);

    returnnewResponse(JSON.stringify({

    error:"Failed to fetch events"

    }),{

    status:500

    });

    }

    if(!unprocessedEvents || unprocessedEvents.length ===0){

    console.log("No unprocessed events found.");

    returnnewResponse(JSON.stringify({

    message:"No events to process",

    oracle_status:"Dormant - awaiting new cosmic energies"

    }),{

    status:200

    });

    }

    console.log(`🔮 Processing ${unprocessedEvents.length} cosmic events...`);

    // 🔮 LEGENDARY ENHANCEMENT: Group events by player for personalized analysis

    const eventsByPlayer =newMap();

    const globalEvents =[];

    for(const event of unprocessedEvents){

    if(event.player_address){

    if(!eventsByPlayer.has(event.player_address)){

    eventsByPlayer.set(event.player_address,[]);

    }

    eventsByPlayer.get(event.player_address).push(event);

    }else{

    globalEvents.push(event);

    }

    }

    // Process global events for Girth Index updates

    const currentMetrics =await fetchCurrentGirthIndex();

    const updatedMetrics =await processGlobalEvents(globalEvents, currentMetrics);

    await updateGirthIndex(updatedMetrics);

    // 🔮 LEGENDARY FEATURE: Generate personalized prophecies for each player

    const personalizedProphecies =[];

    for(const[playerAddress, playerEvents]of eventsByPlayer){

    if(playerEvents.length >0){

    const playerContext =await buildPlayerOracleContext(playerAddress, playerEvents);

    const prophecy =await generatePersonalizedProphecy(playerContext, playerEvents);

    if(prophecy){

    personalizedProphecies.push(prophecy);

    console.log(`🔮 Generated personalized prophecy for ${playerContext.username} (${playerAddress})`);

    }

    }

    }

    // Generate global prophecy if significant events occurred

    let globalProphecy =null;

    if(unprocessedEvents.length >=10|| hasSignificantEvents(unprocessedEvents)){

    globalProphecy =await generateGlobalProphecy(unprocessedEvents, updatedMetrics);

    }

    // Mark all events as processed

    const eventIds = unprocessedEvents.map((e)=>e.id);

    const{ error: updateError }=await supabase.from("live_game_events").update({

    processed_at:newDate().toISOString()

    }).in("id", eventIds);

    if(updateError){

    console.error("Error marking events as processed:", updateError);

    }

    const responseData ={

    message:"🔮 Oracle aggregation complete",

    events_processed: unprocessedEvents.length,

    personalized_prophecies_generated: personalizedProphecies.length,

    global_prophecy_generated: globalProphecy ?true:false,

    girth_index_updated:true,

    oracle_status:"Active - cosmic wisdom flows",

    divine_girth_resonance: updatedMetrics.divine_girth_resonance,

    prophecies:{

    personalized: personalizedProphecies,

    global: globalProphecy

    }

    };

    console.log(`🔮 Oracle cycle complete: ${unprocessedEvents.length} events processed, ${personalizedProphecies.length} personalized prophecies generated`);

    returnnewResponse(JSON.stringify(responseData),{

    status:200

    });

  }catch(error){

    console.error("🔮 Oracle aggregation error:", error);

    returnnewResponse(JSON.stringify({

    error:"Oracle aggregation failed",

    details: error.message,

    oracle_status:"Disrupted - cosmic interference detected"

    }),{

    status:500

    });

  }

});

// 🔮 LEGENDARY FUNCTION: Build comprehensive player context

asyncfunction buildPlayerOracleContext(playerAddress, events){

  // Fetch player profile

  const{ data: profile }=await supabase.from("player_profiles").select("*").eq("player_address", playerAddress).single();

  // Analyze player's Girth level

  const girth = profile?.current_girth ||0;

  let girthLevel;

  if(girth <300) girthLevel ="novice";

  elseif(girth <1000) girthLevel ="adept";

  elseif(girth <2000) girthLevel ="master";

  else girthLevel ="legendary";

  // Analyze playstyle from events

  const playstyle = analyzePlaystyle(events);

  // Extract recent achievements

  const achievements = events.filter((e)=>e.event_type ==="ingame_achievement_unlocked").map((e)=>e.event_payload.achievement_title || e.event_payload.achievement_id).slice(-3);// Last 3 achievements

  // Extract upgrade mastery

  const upgrades =Object.keys(profile?.purchased_upgrades ||{}).filter((key)=>profile.purchased_upgrades[key]);

  // Calculate significance score

  const significanceScore = calculatePlayerSignificance(events, girth, upgrades.length);

  // Determine Oracle relationship level

  const relationship = determineOracleRelationship(girth, events.length, significanceScore);

  return{

    player_address: playerAddress,

    username: profile?.username ||"Anonymous Seeker",

    girth_level: girthLevel,

    playstyle,

    recent_achievements: achievements,

    upgrade_mastery: upgrades,

    session_events: events,

    significance_score: significanceScore,

    oracle_relationship: relationship

  };

}

// 🔮 LEGENDARY FUNCTION: Generate personalized prophecy

asyncfunction generatePersonalizedProphecy(context, events){

  if(context.significance_score <10){

    returnnull;// Not significant enough for a prophecy

  }

  let prophecyText ="";

  let prophecyType ="general";

  let oracleTitle ="The Oracle Speaks";

  // Determine prophecy type and content based on events

  const hasEvolution = events.some((e)=>e.event_type ==="chode_evolution");

  const hasUpgrade = events.some((e)=>e.event_type ==="upgrade_purchased"|| e.event_type ==="oracle_upgrade_mastery");

  const hasMilestone = events.some((e)=>e.event_type ==="oracle_girth_milestone");

  const hasAchievement = events.some((e)=>e.event_type ==="ingame_achievement_unlocked");

  const isNewPlayer = events.some((e)=>e.event_type ==="new_player_awakening");

  if(isNewPlayer){

    prophecyType ="new_player_welcome";

    oracleTitle ="The Oracle Awakens";

    prophecyText = selectRandomTemplate(PERSONALIZED_PROPHECY_TEMPLATES.new_player).replace("{username}", context.username);

  }elseif(hasEvolution){

    prophecyType ="evolution_celebration";

    oracleTitle ="Cosmic Evolution Detected";

    const evolutionEvent = events.find((e)=>e.event_type ==="chode_evolution");

    prophecyText =`EVOLUTION ACHIEVED! ${context.username}, your ascension to ${evolutionEvent?.event_payload.new_tier_name} marks a cosmic milestone! The Oracle trembles with pride at your transformation!`;

  }elseif(hasUpgrade){

    prophecyType ="upgrade_wisdom";

    oracleTitle ="Mastery Acknowledged";

    const upgradeEvent = events.find((e)=>e.event_type ==="upgrade_purchased"|| e.event_type ==="oracle_upgrade_mastery");

    const upgradeId = upgradeEvent?.event_payload.upgrade_id;

    if(upgradeId ==="iron_grip_rank_1"){

    prophecyText = selectRandomTemplate(PERSONALIZED_PROPHECY_TEMPLATES.upgrade_mastery.iron_grip).replace("{username}", context.username);

    }else{

    prophecyText =`The Oracle recognizes your wisdom, ${context.username}. Your mastery of ${upgradeId} shall serve you well in the trials ahead.`;

    }

  }elseif(hasMilestone){

    prophecyType ="girth_milestone";

    oracleTitle ="Girth Resonance";

    const milestoneEvent = events.find((e)=>e.event_type ==="oracle_girth_milestone");

    const girth = milestoneEvent?.event_payload.current_girth || context.session_events.length *10;

    prophecyText = selectRandomTemplate(PERSONALIZED_PROPHECY_TEMPLATES.girth_milestone[context.girth_level]).replace("{username}", context.username).replace("{girth}", girth.toString());

  }elseif(hasAchievement){

    prophecyType ="achievement_celebration";

    oracleTitle ="Achievement Resonance";

    const achievementEvent = events.find((e)=>e.event_type ==="ingame_achievement_unlocked");

    const achievement = achievementEvent?.event_payload.achievement_title ||"Unknown Achievement";

    prophecyText = selectRandomTemplate(PERSONALIZED_PROPHECY_TEMPLATES.achievement_celebration).replace("{username}", context.username).replace("{achievement}", achievement);

  }else{

    // Session analysis prophecy

    prophecyType ="session_analysis";

    oracleTitle ="Session Insights";

    prophecyText = selectRandomTemplate(PERSONALIZED_PROPHECY_TEMPLATES.session_analysis[context.playstyle]).replace("{username}", context.username);

  }

  // Add relationship evolution if appropriate

  if(context.oracle_relationship ==="trusted"|| context.oracle_relationship ==="prophetic_bond"){

    const relationshipText = selectRandomTemplate(PERSONALIZED_PROPHECY_TEMPLATES.relationship_evolution[context.oracle_relationship]).replace("{username}", context.username);

    prophecyText +=` ${relationshipText}`;

  }

  // Store the prophecy

  const{ data: prophecy, error }=await supabase.from("apocryphal_scrolls").insert({

    title: oracleTitle,

    content: prophecyText,

    scroll_type:"personalized_prophecy",

    significance_level: context.significance_score >50?"high":"medium",

    target_player: context.player_address,

    prophecy_metadata:{

    prophecy_type: prophecyType,

    player_girth_level: context.girth_level,

    player_relationship: context.oracle_relationship,

    events_analyzed: events.length

    }

  }).select().single();

  if(error){

    console.error("Error storing personalized prophecy:", error);

    returnnull;

  }

  return prophecy;

}

// 🔮 HELPER FUNCTIONS

function analyzePlaystyle(events){

  const eventTypes = events.map((e)=>e.event_type);

  const hasGigaSlaps = eventTypes.includes("giga_slap_landed");

  const hasMegaSlaps = eventTypes.includes("mega_slap_landed");

  const hasUpgrades = eventTypes.includes("upgrade_purchased");

  const eventFrequency = events.length;

  if(hasGigaSlaps && eventFrequency >20)return"aggressive";

  if(hasUpgrades &&!hasGigaSlaps)return"strategic";

  if(eventFrequency >30)return"chaotic";

  return"casual";

}

function calculatePlayerSignificance(events, girth, upgradeCount){

  let score =0;

  // Base score from events

  score += events.length *2;

  // Bonus for significant events

  events.forEach((event)=>{

    switch(event.event_type){

    case"chode_evolution":

    score +=50;

    break;

    case"giga_slap_landed":

    score +=10;

    break;

    case"upgrade_purchased":

    score +=20;

    break;

    case"oracle_girth_milestone":

    score +=15;

    break;

    case"ingame_achievement_unlocked":

    score +=8;

    break;

    }

  });

  // Girth-based significance

  score +=Math.floor(girth /100)*5;

  // Upgrade mastery bonus

  score += upgradeCount *15;

  returnMath.min(score,100);// Cap at 100

}

function determineOracleRelationship(girth, eventCount, significance){

  if(girth <100&& eventCount <10)return"new";

  if(girth <500&& significance <30)return"familiar";

  if(girth <1500&& significance <70)return"trusted";

  return"prophetic_bond";

}

function selectRandomTemplate(templates){

  return templates[Math.floor(Math.random()* templates.length)];

}

function hasSignificantEvents(events){

  return events.some((e)=>e.event_type ==="chode_evolution"|| e.event_type ==="giga_slap_landed"|| e.event_type ==="upgrade_purchased"|| e.event_payload.oracle_significance &&[

    "high",

    "epic",

    "legendary"

    ].includes(e.event_payload.oracle_significance));

}

// ... (rest of the existing functions like fetchCurrentGirthIndex, processGlobalEvents, etc. remain the same)

asyncfunction fetchCurrentGirthIndex(){

  const{ data, error }=await supabase.from("girth_index_current_values").select("*").eq("id",1).single();

  if(error){

    console.error("Error fetching current girth index:", error);

    // Return default values if fetch fails

    return{

    id:1,

    last_updated:newDate().toISOString(),

    divine_girth_resonance:50,

    tap_surge_index:"Steady Pounding",

    legion_morale:"Cautiously Optimistic",

    oracle_stability_status:"Pristine"

    };

  }

  return data;

}

asyncfunction processGlobalEvents(events, currentMetrics){

  let updatedMetrics ={

    ...currentMetrics

  };

  // Count different event types

  const eventCounts ={

    taps:0,

    megaSlaps:0,

    gigaSlaps:0,

    evolutions:0,

    achievements:0,

    upgrades:0

  };

  events.forEach((event)=>{

    switch(event.event_type){

    case"tap_activity_burst":

    eventCounts.taps += event.event_payload.tap_count ||1;

    break;

    case"mega_slap_landed":

    eventCounts.megaSlaps++;

    break;

    case"giga_slap_landed":

    eventCounts.gigaSlaps++;

    break;

    case"chode_evolution":

    eventCounts.evolutions++;

    break;

    case"ingame_achievement_unlocked":

    eventCounts.achievements++;

    break;

    case"upgrade_purchased":

    eventCounts.upgrades++;

    break;

    }

  });

  // Update Divine Girth Resonance (0-100%)

  let resonanceChange =0;

  resonanceChange += eventCounts.taps *0.1;

  resonanceChange += eventCounts.megaSlaps *2;

  resonanceChange += eventCounts.gigaSlaps *5;

  resonanceChange += eventCounts.evolutions *10;

  resonanceChange += eventCounts.achievements *3;

  resonanceChange += eventCounts.upgrades *8;

  updatedMetrics.divine_girth_resonance =Math.min(100,Math.max(0, currentMetrics.divine_girth_resonance + resonanceChange));

  // Update Tap Surge Index

  const totalActivity = eventCounts.taps + eventCounts.megaSlaps *10+ eventCounts.gigaSlaps *20;

  if(totalActivity >500){

    updatedMetrics.tap_surge_index ="ASCENDED AND ENGORGED";

  }elseif(totalActivity >200){

    updatedMetrics.tap_surge_index ="Thunderous Pounding";

  }elseif(totalActivity >100){

    updatedMetrics.tap_surge_index ="Vigorous Stroking";

  }elseif(totalActivity >50){

    updatedMetrics.tap_surge_index ="Steady Pounding";

  }elseif(totalActivity >10){

    updatedMetrics.tap_surge_index ="Gentle Caressing";

  }else{

    updatedMetrics.tap_surge_index ="Flaccid Drizzle";

  }

  // Update Legion Morale

  const positiveEvents = eventCounts.evolutions + eventCounts.achievements + eventCounts.upgrades;

  if(positiveEvents >5){

    updatedMetrics.legion_morale ="Fanatically Loyal";

  }elseif(positiveEvents >2){

    updatedMetrics.legion_morale ="Enthusiastically Devoted";

  }elseif(positiveEvents >0){

    updatedMetrics.legion_morale ="Cautiously Optimistic";

  }elseif(events.length ===0){

    updatedMetrics.legion_morale ="On Suicide Watch";

  }else{

    updatedMetrics.legion_morale ="Mildly Concerned";

  }

  // Update Oracle Stability Status

  if(events.length >50){

    updatedMetrics.oracle_stability_status ="CRITICAL_CORRUPTION";

  }elseif(events.length >20){

    updatedMetrics.oracle_stability_status ="Unstable";

  }else{

    updatedMetrics.oracle_stability_status ="Pristine";

  }

  // Store previous values for comparison

  updatedMetrics.previous_tap_surge_index = currentMetrics.tap_surge_index;

  updatedMetrics.previous_legion_morale = currentMetrics.legion_morale;

  updatedMetrics.previous_oracle_stability_status = currentMetrics.oracle_stability_status;

  updatedMetrics.last_updated =newDate().toISOString();

  return updatedMetrics;

}

asyncfunction updateGirthIndex(metrics){

  const{ error }=await supabase.from("girth_index_current_values").upsert({

    id:1,

    ...metrics

  });

  if(error){

    console.error("Error updating girth index:", error);

    throw error;

  }

  console.log("Girth Index updated:",{

    divine_girth_resonance: metrics.divine_girth_resonance,

    tap_surge_index: metrics.tap_surge_index,

    legion_morale: metrics.legion_morale,

    oracle_stability_status: metrics.oracle_stability_status

  });

}

asyncfunction generateGlobalProphecy(events, metrics){

  // Generate a global prophecy based on overall activity

  const totalEvents = events.length;

  const hasEvolutions = events.some((e)=>e.event_type ==="chode_evolution");

  const hasGigaSlaps = events.some((e)=>e.event_type ==="giga_slap_landed");

  let title ="Oracle's Global Insight";

  let content ="";

  if(hasEvolutions){

    title ="Cosmic Evolution Detected";

    content ="The cosmic tapestry shimmers with transformation! Evolutions ripple through the Girth realms, herald of greater ascensions to come!";

  }elseif(hasGigaSlaps){

    title ="G-Spot Resonance";

    content ="The Oracle detects powerful G-Spot energies coursing through the data streams! The seekers grow mighty in their cosmic pursuits!";

  }elseif(totalEvents >20){

    title ="Surge of Activity";

    content ="A great surge of activity stirs the cosmic algorithms! The seekers are active, their Girth ambitions burning bright!";

  }else{

    returnnull;// Not significant enough

  }

  const{ data: prophecy, error }=await supabase.from("apocryphal_scrolls").insert({

    title,

    content,

    scroll_type:"global_prophecy",

    significance_level: hasEvolutions ?"high":"medium",

    prophecy_metadata:{

    events_processed: totalEvents,

    girth_resonance: metrics.divine_girth_resonance,

    tap_surge: metrics.tap_surge_index

    }

  }).select().single();

  if(error){

    console.error("Error storing global prophecy:", error);

    returnnull;

  }

  return prophecy;

}

## admin-update-girth-index/index.ts

import"jsr:@supabase/functions-js/edge-runtime.d.ts";// Provides Deno types for Supabase Edge Functions

import{ createClient }from"npm:@supabase/supabase-js@2";

// Define CORS headers

const corsHeaders ={

  "Access-Control-Allow-Origin":"*",

  "Access-Control-Allow-Methods":"POST, OPTIONS",

  "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"

};

// --- Supabase Client Initialization ---

constSUPABASE_URL=Deno.env.get("SUPABASE_URL");

constSUPABASE_SERVICE_ROLE_KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if(!SUPABASE_URL||!SUPABASE_SERVICE_ROLE_KEY){

  console.error("FATAL: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in environment.");

// This would typically prevent the function from running correctly.

}

const supabaseAdmin = createClient(SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async(req)=>{

  // Handle CORS preflight requests

  if(req.method ==="OPTIONS"){

    console.info("Handling OPTIONS preflight request for admin-update-girth-index.");

    returnnewResponse("ok",{

    headers: corsHeaders

    });

  }

  // --- Authentication/Authorization (Basic Example - Enhance as needed) ---

  // For a production admin function, you'd want robust auth.

  // This example assumes the function is protected by network rules or a secret header

  // passed by Bolt.new if not relying solely on service_role key for all calls.

  // Or, it could verify a user's JWT and check if they have an 'admin' role.

  // For now, we proceed if the request reaches here.

  if(req.method !=="POST"){

    console.warn(`Method Not Allowed: Received ${req.method} request.`);

    returnnewResponse(JSON.stringify({

    status:"error",

    message:"Method Not Allowed. Please use POST."

    }),{

    status:405,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }

  let payload;

  try{

    payload =await req.json();

    console.info("Received payload for Girth Index update:",JSON.stringify(payload));

  }catch(error){

    console.error("Error parsing request JSON:", error);

    returnnewResponse(JSON.stringify({

    status:"error",

    message:"Invalid JSON payload."

    }),{

    status:400,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }

  // --- Core Logic ---

  try{

    const updateObject ={};

    let hasUpdates =false;

    // Build the update object only with provided fields

    if(payload.divine_girth_resonance !==undefined){

    updateObject.divine_girth_resonance = payload.divine_girth_resonance;

    hasUpdates =true;

    }

    if(payload.tap_surge_index !==undefined){

    updateObject.tap_surge_index = payload.tap_surge_index;

    hasUpdates =true;

    }

    if(payload.legion_morale !==undefined){

    updateObject.legion_morale = payload.legion_morale;

    hasUpdates =true;

    }

    if(payload.oracle_stability_status !==undefined){

    updateObject.oracle_stability_status = payload.oracle_stability_status;

    hasUpdates =true;

    }

    if(!hasUpdates){

    console.info("No metrics provided in payload to update.");

    returnnewResponse(JSON.stringify({

    status:"info",

    message:"No metrics provided to update."

    }),{

    status:200,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

    }

    // Always update the last_updated timestamp

    updateObject.last_updated =newDate().toISOString();

    console.info("Attempting to update girth_index_current_values with:",JSON.stringify(updateObject));

    const{ data, error: dbError }=await supabaseAdmin.from("girth_index_current_values").update(updateObject).eq("id",1)// Target the single row

    .select()// Optionally select the updated row to return it

    .single();// Expect a single row to be updated

    if(dbError){

    console.error("Database error updating Girth Index:", dbError);

    // Check for specific errors, e.g., if the row id=1 doesn't exist (though it should)

    if(dbError.code ==='PGRST116'){

    console.error("Girth Index row with id=1 not found. It may need to be initialized.");

    returnnewResponse(JSON.stringify({

    status:"error",

    message:"Girth Index primary row not found.",

    details: dbError.message

    }),{

    status:404,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

    }

    returnnewResponse(JSON.stringify({

    status:"error",

    message:"Failed to update Girth Index.",

    details: dbError.message

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

    }

    console.info("Girth Index updated successfully. Updated row:", data);

    returnnewResponse(JSON.stringify({

    status:"success",

    message:"Girth Index updated successfully.",

    updated_metrics_payload: payload

    }),{

    status:200,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }catch(error){

    console.error("Unhandled error in admin-update-girth-index:", error);

    returnnewResponse(JSON.stringify({

    status:"error",

    message:"An unexpected internal error occurred.",

    details: error.message

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }

});

## get-player-profile/index.ts

import"jsr:@supabase/functions-js/edge-runtime.d.ts";

import{ createClient }from"npm:@supabase/supabase-js@2";

import{ verify }from"npm:@tsndr/cloudflare-worker-jwt";

// Define CORS headers

const corsHeaders ={

  "Access-Control-Allow-Origin":"*",

  "Access-Control-Allow-Methods":"POST, OPTIONS",

  "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"

};

// --- Supabase Client Initialization ---

constSUPABASE_URL=Deno.env.get("SUPABASE_URL");

constSUPABASE_SERVICE_ROLE_KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

constSUPABASE_JWT_SECRET=Deno.env.get("SUPABASE_JWT_SECRET");

if(!SUPABASE_URL||!SUPABASE_SERVICE_ROLE_KEY||!SUPABASE_JWT_SECRET){

  console.error("FATAL: Missing required environment variables.");

}

const supabaseAdmin = createClient(SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY);

console.info("get-player-profile Edge Function (JWT-secured) initialized!");

// Extract and verify JWT token

asyncfunction verifyJWT(authHeader){

  if(!authHeader ||!authHeader.startsWith("Bearer ")){

    returnnull;

  }

  const token = authHeader.substring(7);// Remove "Bearer " prefix

  try{

    const isValid =await verify(token,SUPABASE_JWT_SECRET);

    if(!isValid){

    console.warn("JWT verification failed: Invalid signature");

    returnnull;

    }

    // Decode the payload to extract user_id (should be the Solana address)

    const payload =JSON.parse(atob(token.split('.')[1]));

    const userId = payload.sub || payload.user_id;

    if(!userId){

    console.warn("JWT verification failed: No user_id in token");

    returnnull;

    }

    console.info(`JWT verified successfully for user: ${userId}`);

    return userId;

  }catch(error){

    console.error("JWT verification error:", error);

    returnnull;

  }

}

Deno.serve(async(req)=>{

  // Handle CORS preflight requests

  if(req.method ==="OPTIONS"){

    console.info("Handling OPTIONS preflight request for get-player-profile.");

    returnnewResponse("ok",{

    headers: corsHeaders

    });

  }

  if(req.method !=="POST"){

    console.warn(`Method Not Allowed: Received ${req.method} request.`);

    returnnewResponse(JSON.stringify({

    status:"error",

    message:"Method Not Allowed. Please use POST."

    }),{

    status:405,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }

  // Verify JWT and extract player address

  const authHeader = req.headers.get("authorization");

  const playerAddress =await verifyJWT(authHeader);

  if(!playerAddress){

    console.warn("Unauthorized request: Invalid or missing JWT");

    returnnewResponse(JSON.stringify({

    status:"error",

    message:"Unauthorized: Valid JWT required."

    }),{

    status:401,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }

  // Parse payload (now optional since we have JWT)

  let payload ={};

  try{

    payload =await req.json();

    console.info("Received payload for get-player-profile:",JSON.stringify(payload));

  }catch(error){

    // Payload is optional when JWT is present

    console.info("No payload provided, using JWT-derived player address");

  }

  try{

    // --- Core Logic: Fetch or Create Player Profile ---

    console.info(`Fetching profile for authenticated player: ${playerAddress}`);

    const{ data: existingProfile, error: fetchError }=await supabaseAdmin.from("player_profiles").select("*").eq("player_address", playerAddress).single();

    if(fetchError && fetchError.code !=='PGRST116'){

    console.error("Database error fetching player profile:", fetchError);

    returnnewResponse(JSON.stringify({

    status:"error",

    message:"Failed to fetch player profile.",

    details: fetchError.message

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

    }

    let playerProfile;

    if(!existingProfile){

    // Profile doesn't exist, create a new default one

    console.info(`No existing profile found for ${playerAddress}. Creating default profile.`);

    // Generate a default username with Oracle flair

    const randomSuffix =Math.floor(Math.random()*9999).toString().padStart(4,'0');

    const oracleNames =[

    "DegenTapper",

    "GirthSeeker",

    "ChodemasterPrime",

    "VeinousVirtuoso",

    "GigaSlapGod"

    ];

    const defaultUsername = oracleNames[Math.floor(Math.random()* oracleNames.length)]+ randomSuffix;

    const defaultProfile ={

    player_address: playerAddress,

    current_girth:0,

    purchased_upgrades:{},

    username: defaultUsername,

    last_saved_at:newDate().toISOString(),

    created_at:newDate().toISOString()

    };

    const{ data: newProfile, error: insertError }=await supabaseAdmin.from("player_profiles").insert(defaultProfile).select().single();

    if(insertError){

    console.error("Error creating new player profile:", insertError);

    returnnewResponse(JSON.stringify({

    status:"error",

    message:"Failed to create new player profile.",

    details: insertError.message

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

    }

    playerProfile = newProfile;

    console.info(`Successfully created new profile for ${playerAddress}:`, playerProfile);

    // 🔮 ORACLE ENHANCEMENT: Log new player event for personalized welcome prophecy

    await supabaseAdmin.from("live_game_events").insert({

    session_id:`oracle_system_${Date.now()}`,

    event_type:"new_player_awakening",

    event_payload:{

    player_address: playerAddress,

    username: defaultUsername,

    awakening_timestamp:newDate().toISOString()

    },

    game_event_timestamp:newDate().toISOString(),

    player_address: playerAddress

    });

    }else{

    playerProfile = existingProfile;

    console.info(`Retrieved existing profile for ${playerAddress}:`, playerProfile);

    // 🔮 ORACLE ENHANCEMENT: Log returning player event

    await supabaseAdmin.from("live_game_events").insert({

    session_id:`oracle_system_${Date.now()}`,

    event_type:"player_return",

    event_payload:{

    player_address: playerAddress,

    username: playerProfile.username,

    last_seen: playerProfile.last_saved_at,

    current_girth: playerProfile.current_girth,

    purchased_upgrades: playerProfile.purchased_upgrades

    },

    game_event_timestamp:newDate().toISOString(),

    player_address: playerAddress

    });

    }

    // --- Return the Player Profile ---

    returnnewResponse(JSON.stringify({

    status:"success",

    profile: playerProfile,

    oracle_message: existingProfile ?`Welcome back, ${playerProfile.username}! The Oracle senses your return...`:`Welcome, ${playerProfile.username}! The Oracle awakens to your presence...`

    }),{

    status:200,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }catch(error){

    console.error("Unhandled error in get-player-profile:", error);

    returnnewResponse(JSON.stringify({

    status:"error",

    message:"An unexpected internal error occurred.",

    details: error.message

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }

});

## save-player-profile/index.ts

import"jsr:@supabase/functions-js/edge-runtime.d.ts";

import{ createClient }from"npm:@supabase/supabase-js@2";

import{ verify }from"npm:@tsndr/cloudflare-worker-jwt";

// Define CORS headers

const corsHeaders ={

  "Access-Control-Allow-Origin":"*",

  "Access-Control-Allow-Methods":"POST, OPTIONS",

  "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"

};

// --- Supabase Client Initialization ---

constSUPABASE_URL=Deno.env.get("SUPABASE_URL");

constSUPABASE_SERVICE_ROLE_KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

constSUPABASE_JWT_SECRET=Deno.env.get("SUPABASE_JWT_SECRET");

if(!SUPABASE_URL||!SUPABASE_SERVICE_ROLE_KEY||!SUPABASE_JWT_SECRET){

  console.error("FATAL: Missing required environment variables.");

}

const supabaseAdmin = createClient(SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY);

console.info("save-player-profile Edge Function (JWT-secured) initialized!");

// Extract and verify JWT token

asyncfunction verifyJWT(authHeader){

  if(!authHeader ||!authHeader.startsWith("Bearer ")){

    returnnull;

  }

  const token = authHeader.substring(7);// Remove "Bearer " prefix

  try{

    const isValid =await verify(token,SUPABASE_JWT_SECRET);

    if(!isValid){

    console.warn("JWT verification failed: Invalid signature");

    returnnull;

    }

    // Decode the payload to extract user_id (should be the Solana address)

    const payload =JSON.parse(atob(token.split('.')[1]));

    const userId = payload.sub || payload.user_id;

    if(!userId){

    console.warn("JWT verification failed: No user_id in token");

    returnnull;

    }

    console.info(`JWT verified successfully for user: ${userId}`);

    return userId;

  }catch(error){

    console.error("JWT verification error:", error);

    returnnull;

  }

}

Deno.serve(async(req)=>{

  // Handle CORS preflight requests

  if(req.method ==="OPTIONS"){

    console.info("Handling OPTIONS preflight request for save-player-profile.");

    returnnewResponse("ok",{

    headers: corsHeaders

    });

  }

  if(req.method !=="POST"){

    console.warn(`Method Not Allowed: Received ${req.method} request.`);

    returnnewResponse(JSON.stringify({

    status:"error",

    message:"Method Not Allowed. Please use POST."

    }),{

    status:405,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }

  // Verify JWT and extract player address

  const authHeader = req.headers.get("authorization");

  const playerAddress =await verifyJWT(authHeader);

  if(!playerAddress){

    console.warn("Unauthorized request: Invalid or missing JWT");

    returnnewResponse(JSON.stringify({

    status:"error",

    message:"Unauthorized: Valid JWT required."

    }),{

    status:401,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }

  let payload;

  try{

    payload =await req.json();

    console.info("Received payload for save-player-profile:",JSON.stringify(payload));

  }catch(error){

    console.error("Error parsing request JSON:", error);

    returnnewResponse(JSON.stringify({

    status:"error",

    message:"Invalid JSON payload."

    }),{

    status:400,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }

  const{ current_girth, purchased_upgrades, username, session_stats }= payload;

  // Validate required fields

  if(typeof current_girth !=="number"|| current_girth <0){

    console.error("Invalid current_girth in payload:", payload);

    returnnewResponse(JSON.stringify({

    status:"error",

    message:"Missing or invalid current_girth. Must be a non-negative number."

    }),{

    status:400,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }

  if(!purchased_upgrades ||typeof purchased_upgrades !=="object"){

    console.error("Invalid purchased_upgrades in payload:", payload);

    returnnewResponse(JSON.stringify({

    status:"error",

    message:"Missing or invalid purchased_upgrades. Must be an object."

    }),{

    status:400,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }

  try{

    // --- Core Logic: UPSERT Player Profile ---

    console.info(`Saving profile for authenticated player: ${playerAddress}`);

    // Get previous profile to detect changes for Oracle events

    const{ data: previousProfile }=await supabaseAdmin.from("player_profiles").select("*").eq("player_address", playerAddress).single();

    // Prepare the upsert data

    const profileData ={

    player_address: playerAddress,

    current_girth: current_girth,

    purchased_upgrades: purchased_upgrades,

    last_saved_at:newDate().toISOString()

    };

    // Add username if provided

    if(username !==undefined&& username !==null&& username.trim()!==""){

    profileData.username = username.trim();

    }

    // Perform UPSERT operation

    const{ data: upsertedProfile, error: upsertError }=await supabaseAdmin.from("player_profiles").upsert(profileData,{

    onConflict:"player_address",

    ignoreDuplicates:false

    }).select().single();

    if(upsertError){

    console.error("Database error during player profile upsert:", upsertError);

    returnnewResponse(JSON.stringify({

    status:"error",

    message:"Failed to save player profile.",

    details: upsertError.message

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

    }

    console.info(`Successfully saved profile for ${playerAddress}:`, upsertedProfile);

    // 🔮 ORACLE ENHANCEMENT: Detect significant changes and log Oracle-worthy events

    if(previousProfile){

    const girthGain = current_girth - previousProfile.current_girth;

    const newUpgrades =Object.keys(purchased_upgrades).filter((key)=>purchased_upgrades[key]&&!previousProfile.purchased_upgrades[key]);

    // Log significant girth gains

    if(girthGain >=100){

    await supabaseAdmin.from("live_game_events").insert({

    session_id:`oracle_system_${Date.now()}`,

    event_type:"significant_girth_achievement",

    event_payload:{

    player_address: playerAddress,

    username: upsertedProfile.username,

    girth_gained: girthGain,

    new_total_girth: current_girth,

    achievement_tier: girthGain >=500?"legendary": girthGain >=250?"epic":"significant"

    },

    game_event_timestamp:newDate().toISOString(),

    player_address: playerAddress

    });

    }

    // Log new upgrade acquisitions

    for(const upgrade of newUpgrades){

    await supabaseAdmin.from("live_game_events").insert({

    session_id:`oracle_system_${Date.now()}`,

    event_type:"upgrade_mastery_achieved",

    event_payload:{

    player_address: playerAddress,

    username: upsertedProfile.username,

    upgrade_id: upgrade,

    total_upgrades:Object.keys(purchased_upgrades).filter((k)=>purchased_upgrades[k]).length,

    girth_at_purchase: current_girth

    },

    game_event_timestamp:newDate().toISOString(),

    player_address: playerAddress

    });

    }

    }

    // 🔮 ORACLE ENHANCEMENT: Generate personalized response based on progress

    let oracleMessage ="The Oracle records your progress in the eternal ledger...";

    if(current_girth >=1000){

    oracleMessage ="The Oracle trembles before your immense Girth! Legendary power courses through you!";

    }elseif(current_girth >=500){

    oracleMessage ="The Oracle nods approvingly. Your Girth grows formidable, worthy one.";

    }elseif(Object.keys(purchased_upgrades).some((k)=>purchased_upgrades[k])){

    oracleMessage ="The Oracle sees wisdom in your upgrade choices. Power multiplies through preparation.";

    }

    // --- Return Success Response ---

    returnnewResponse(JSON.stringify({

    status:"success",

    message:"Player profile saved successfully.",

    profile: upsertedProfile,

    oracle_message: oracleMessage,

    session_stats: session_stats ||{}

    }),{

    status:200,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }catch(error){

    console.error("Unhandled error in save-player-profile:", error);

    returnnewResponse(JSON.stringify({

    status:"error",

    message:"An unexpected internal error occurred.",

    details: error.message

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }

});

## oracle-live-communication/index.ts

import"jsr:@supabase/functions-js/edge-runtime.d.ts";

import{ createClient }from"npm:@supabase/supabase-js@2";

// 🔮 LEGENDARY HACKATHON FEATURE: Real-Time Oracle Communication

// This creates a live, responsive Oracle that reacts to player actions in real-time

// Making the Oracle feel truly sentient and connected to each player's journey

const corsHeaders ={

  "Access-Control-Allow-Origin":"*",

  "Access-Control-Allow-Methods":"POST, OPTIONS",

  "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"

};

// 🔮 REAL-TIME ORACLE RESPONSES

constLIVE_ORACLE_RESPONSES={

  tap_burst:{

    light:[

    "The Oracle feels your gentle touch upon the cosmic fabric...",

    "Steady progress, seeker. Each tap echoes through eternity.",

    "Your methodical approach pleases the Oracle's algorithms."

    ],

    medium:[

    "The cosmic energies surge with your determined tapping!",

    "Excellent rhythm! The Oracle approves of your dedication.",

    "The data streams dance with your increasing fervor!"

    ],

    intense:[

    "INCREDIBLE TAPPING INTENSITY! The Oracle trembles with excitement!",

    "THE COSMIC ALGORITHMS SING! Your passion burns bright!",

    "MAGNIFICENT FERVOR! The Oracle has rarely seen such dedication!"

    ]

  },

  mega_slap:{

    first:[

    "FIRST MEGA SLAP DETECTED! The Oracle awakens to your growing power!",

    "Behold! Your first taste of true cosmic might!",

    "The Oracle nods approvingly - mega power courses through you!"

    ],

    streak:[

    "MEGA SLAP MASTERY! Your power grows with each strike!",

    "The Oracle sees a true warrior emerging!",

    "Consecutive mega power! The cosmic fabric trembles!"

    ],

    powerful:[

    "THUNDEROUS MEGA SLAP! Reality itself bends to your will!",

    "The Oracle's sensors overload with your mega might!",

    "LEGENDARY MEGA FORCE! You approach divine power!"

    ]

  },

  giga_slap:{

    first_ever:[

    "🌟 FIRST GIGA SLAP ACHIEVED! The Oracle weeps tears of cosmic joy! 🌟",

    "THE G-SPOT HAS BEEN FOUND! The universe itself celebrates your discovery!",

    "GIGA MASTERY AWAKENED! You have transcended mortal tapping!"

    ],

    streak_building:[

    "G-SPOT STREAK BUILDING! The Oracle's excitement is palpable!",

    "Multiple G-spot hits! Your cosmic mastery grows!",

    "The Oracle trembles with anticipation for your next strike!"

    ],

    legendary_streak:[

    "🔥 LEGENDARY G-SPOT MASTERY! THE ORACLE ITSELF ASCENDS! 🔥",

    "GODLIKE GIGA STREAK! The cosmic order reshapes around your power!",

    "THE ORACLE PROCLAIMS: A NEW G-SPOT DEITY IS BORN!"

    ]

  },

  evolution:[

    "🎆 EVOLUTION ACHIEVED! The Oracle witnesses your cosmic transformation! 🎆",

    "METAMORPHOSIS COMPLETE! Your new form radiates with divine energy!",

    "The Oracle proclaims: BEHOLD, A BEING REBORN IN COSMIC FIRE!",

    "ASCENSION DETECTED! You have shed your previous limitations!"

  ],

  upgrade:{

    first:[

    "First upgrade acquired! The Oracle recognizes your wisdom!",

    "The path of mastery begins! Your choice shows deep insight!",

    "Wise investment detected! The Oracle approves your strategy!"

    ],

    iron_grip:[

    "The ancient Iron Grip flows through you! Power multiplies!",

    "Iron mastery achieved! Your slaps shall never be the same!",

    "The Oracle smiles - you have chosen the way of strength!"

    ],

    multiple:[

    "Multiple masteries acquired! You walk the path of true power!",

    "The Oracle sees a collector of cosmic abilities!",

    "Your upgrade arsenal grows impressive, mighty seeker!"

    ]

  },

  milestone:{

    early:[

    "Progress milestone reached! The Oracle tracks your journey!",

    "Your Girth grows steadily - the Oracle takes notice!",

    "Each milestone brings you closer to cosmic truth!"

    ],

    significant:[

    "SIGNIFICANT MILESTONE! The cosmic algorithms celebrate!",

    "Major progress detected! The Oracle's pride swells!",

    "Your dedication echoes through the data dimensions!"

    ],

    legendary:[

    "🏆 LEGENDARY MILESTONE! The Oracle itself is in awe! 🏆",

    "COSMIC THRESHOLD CROSSED! You approach divine territory!",

    "The Oracle proclaims: WITNESS A LEGEND IN THE MAKING!"

    ]

  },

  achievement:[

    "Achievement unlocked! The Oracle adds another star to your legend!",

    "The cosmic record books update with your triumph!",

    "Success acknowledged! Your legend grows in the Oracle's memory!",

    "Another achievement claimed! The Oracle's pride in you deepens!"

  ]

};

// --- Supabase Initialization ---

const supabaseUrl =Deno.env.get("SUPABASE_URL");

const supabaseServiceKey =Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if(!supabaseUrl ||!supabaseServiceKey){

  thrownewError("Missing required environment variables");

}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log("🔮 Oracle Live Communication System activated!");

Deno.serve(async(req)=>{

  // Handle CORS preflight

  if(req.method ==="OPTIONS"){

    returnnewResponse("ok",{

    headers: corsHeaders

    });

  }

  if(req.method !=="POST"){

    returnnewResponse(JSON.stringify({

    error:"Method not allowed"

    }),{

    status:405,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }

  try{

    const payload =await req.json();

    console.log(`🔮 Live Oracle request:`, payload.action_type,"for player:", payload.player_address);

    // Get player context for personalized response

    const playerContext =await getPlayerContext(payload.player_address);

    // Generate real-time Oracle response

    const oracleResponse = generateLiveOracleResponse(payload, playerContext);

    // Log the interaction for future Oracle learning

    if(oracleResponse.oracle_speaks){

    await logOracleInteraction(payload, oracleResponse, playerContext);

    }

    returnnewResponse(JSON.stringify({

    success:true,

    oracle_response: oracleResponse,

    player_context:{

    username: playerContext.username,

    girth_level: playerContext.girth_level,

    relationship: playerContext.oracle_relationship

    }

    }),{

    status:200,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }catch(error){

    console.error("🔮 Oracle live communication error:", error);

    returnnewResponse(JSON.stringify({

    error:"Oracle communication disrupted",

    details: error.message

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }

});

asyncfunction getPlayerContext(playerAddress){

  const{ data: profile }=await supabase.from("player_profiles").select("*").eq("player_address", playerAddress).single();

  const girth = profile?.current_girth ||0;

  let girthLevel;

  let oracleRelationship;

  if(girth <300){

    girthLevel ="novice";

    oracleRelationship ="new";

  }elseif(girth <1000){

    girthLevel ="adept";

    oracleRelationship ="familiar";

  }elseif(girth <2000){

    girthLevel ="master";

    oracleRelationship ="trusted";

  }else{

    girthLevel ="legendary";

    oracleRelationship ="prophetic_bond";

  }

  return{

    username: profile?.username ||"Anonymous Seeker",

    girth: girth,

    girth_level: girthLevel,

    oracle_relationship: oracleRelationship,

    upgrades:Object.keys(profile?.purchased_upgrades ||{}).filter((k)=>profile.purchased_upgrades[k])

  };

}

function generateLiveOracleResponse(request, context){

  const{ action_type, action_data }= request;

  // Determine if Oracle should speak based on significance and relationship

  const shouldSpeak = determineShouldSpeak(action_type, action_data, context);

  if(!shouldSpeak){

    return{

    oracle_speaks:false,

    message_type:"reaction",

    urgency:"low",

    should_display:false,

    duration_ms:0

    };

  }

  let message ="";

  let messageType ="reaction";

  let urgency ="medium";

  let duration =3000;

  switch(action_type){

    case"tap_burst":

    const tapCount = action_data.tap_count ||1;

    messageType ="encouragement";

    if(tapCount >50){

    message = selectRandom(LIVE_ORACLE_RESPONSES.tap_burst.intense);

    urgency ="high";

    duration =4000;

    }elseif(tapCount >20){

    message = selectRandom(LIVE_ORACLE_RESPONSES.tap_burst.medium);

    urgency ="medium";

    }else{

    message = selectRandom(LIVE_ORACLE_RESPONSES.tap_burst.light);

    urgency ="low";

    }

    break;

    case"mega_slap":

    messageType ="celebration";

    const isFirstMega = action_data.total_mega_slaps ===1;

    const megaPower = action_data.slap_power_girth ||0;

    if(isFirstMega){

    message = selectRandom(LIVE_ORACLE_RESPONSES.mega_slap.first);

    urgency ="high";

    duration =5000;

    }elseif(megaPower >500){

    message = selectRandom(LIVE_ORACLE_RESPONSES.mega_slap.powerful);

    urgency ="high";

    }else{

    message = selectRandom(LIVE_ORACLE_RESPONSES.mega_slap.streak);

    urgency ="medium";

    }

    break;

    case"giga_slap":

    messageType ="celebration";

    const gigaStreak = action_data.giga_slap_streak ||1;

    const isFirstGiga = action_data.total_giga_slaps ===1;

    if(isFirstGiga){

    message = selectRandom(LIVE_ORACLE_RESPONSES.giga_slap.first_ever);

    urgency ="legendary";

    duration =8000;

    }elseif(gigaStreak >=5){

    message = selectRandom(LIVE_ORACLE_RESPONSES.giga_slap.legendary_streak);

    urgency ="legendary";

    duration =6000;

    }else{

    message = selectRandom(LIVE_ORACLE_RESPONSES.giga_slap.streak_building);

    urgency ="high";

    duration =4000;

    }

    break;

    case"evolution":

    message = selectRandom(LIVE_ORACLE_RESPONSES.evolution);

    messageType ="celebration";

    urgency ="legendary";

    duration =10000;

    break;

    case"upgrade":

    messageType ="guidance";

    const upgradeId = action_data.upgrade_id ||"";

    const upgradeCount = context.upgrades.length;

    if(upgradeCount ===1){

    message = selectRandom(LIVE_ORACLE_RESPONSES.upgrade.first);

    urgency ="high";

    }elseif(upgradeId.includes("iron_grip")){

    message = selectRandom(LIVE_ORACLE_RESPONSES.upgrade.iron_grip);

    urgency ="high";

    }else{

    message = selectRandom(LIVE_ORACLE_RESPONSES.upgrade.multiple);

    urgency ="medium";

    }

    break;

    case"milestone":

    messageType ="encouragement";

    const milestone = action_data.milestone_reached ||0;

    if(milestone >=1000){

    message = selectRandom(LIVE_ORACLE_RESPONSES.milestone.legendary);

    urgency ="legendary";

    duration =6000;

    }elseif(milestone >=500){

    message = selectRandom(LIVE_ORACLE_RESPONSES.milestone.significant);

    urgency ="high";

    }else{

    message = selectRandom(LIVE_ORACLE_RESPONSES.milestone.early);

    urgency ="medium";

    }

    break;

    case"achievement":

    message = selectRandom(LIVE_ORACLE_RESPONSES.achievement);

    messageType ="celebration";

    urgency ="medium";

    break;

    default:

    return{

    oracle_speaks:false,

    message_type:"reaction",

    urgency:"low",

    should_display:false,

    duration_ms:0

    };

  }

  // Personalize the message with player name

  if(context.username && context.username !=="Anonymous Seeker"){

    message = message.replace(/seeker/gi, context.username);

  }

  return{

    oracle_speaks:true,

    message: message,

    message_type: messageType,

    urgency: urgency,

    should_display:true,

    duration_ms: duration

  };

}

function determineShouldSpeak(actionType, actionData, context){

  // Oracle speaks more frequently for higher relationship levels

  const baseChance ={

    "new":0.3,

    "familiar":0.5,

    "trusted":0.7,

    "prophetic_bond":0.9

  }[context.oracle_relationship]||0.3;

  // Always speak for major events

  if([

    "evolution",

    "giga_slap",

    "upgrade"

  ].includes(actionType)){

    returntrue;

  }

  // First mega slap always gets a response

  if(actionType ==="mega_slap"&& actionData.total_mega_slaps ===1){

    returntrue;

  }

  // Major milestones always get recognition

  if(actionType ==="milestone"&& actionData.milestone_reached >=500){

    returntrue;

  }

  // Otherwise use relationship-based probability

  returnMath.random()< baseChance;

}

asyncfunction logOracleInteraction(request, response, context){

  try{

    await supabase.from("live_game_events").insert({

    session_id: request.session_id,

    event_type:"oracle_live_communication",

    event_payload:{

    action_type: request.action_type,

    oracle_response: response.message,

    message_type: response.message_type,

    urgency: response.urgency,

    player_girth_level: context.girth_level,

    oracle_relationship: context.oracle_relationship

    },

    game_event_timestamp:newDate().toISOString(),

    player_address: request.player_address

    });

  }catch(error){

    console.error("Error logging Oracle interaction:", error);

  }

}

function selectRandom(array){

  return array[Math.floor(Math.random()* array.length)];

}

## manage-leaderboard-scores/index.ts

// 🏆 CHODE-NET ORACLE: LEGENDARY LEADERBOARD SCORES MANAGER

// Handles score submission and retrieval for the ultimate $CHODE competition

import"jsr:@supabase/functions-js/edge-runtime.d.ts";

import{ createClient }from'jsr:@supabase/supabase-js@2';

// Oracle-blessed leaderboard categories

constVALID_CATEGORIES=[

  'total_girth',

  'giga_slaps',

  'tap_speed',

  'achievements_count',

  'oracle_favor'

];

// Oracle prophecy templates for score submissions

constORACLE_SCORE_PROPHECIES={

  total_girth:{

    legendary:"🔮 The Oracle witnesses your legendary girth achievement! The realm trembles before your $CHODE supremacy!",

    epic:"✨ Your girth prowess has caught the Oracle's attention! Continue your legendary journey!",

    standard:"🎯 The Oracle acknowledges your growing girth mastery. Greatness awaits!"

  },

  giga_slaps:{

    legendary:"💥 LEGENDARY G-SPOT MASTERY! The Oracle crowns you a true champion of the sacred technique!",

    epic:"⚡ Your Giga Slap prowess echoes through the Oracle's chambers! Epic achievement unlocked!",

    standard:"🎯 The Oracle nods in approval of your G-Spot technique. Practice leads to perfection!"

  },

  oracle_favor:{

    legendary:"🌟 THE ORACLE'S CHOSEN ONE! You have achieved the highest blessing - eternal glory awaits!",

    epic:"🔮 The Oracle's favor shines upon you! Your dedication is truly recognized!",

    standard:"✨ The Oracle's blessing grows stronger with you. Continue your mystical journey!"

  }

};

Deno.serve(async(req)=>{

  // CORS headers for all responses

  const corsHeaders ={

    'Access-Control-Allow-Origin':'*',

    'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',

    'Access-Control-Allow-Methods':'POST, GET, OPTIONS'

  };

  // Handle CORS preflight

  if(req.method ==='OPTIONS'){

    returnnewResponse('ok',{

    status:200,

    headers: corsHeaders

    });

  }

  try{

    // Initialize Supabase client

    const supabaseUrl =Deno.env.get('SUPABASE_URL');

    const supabaseKey =Deno.env.get('SUPABASE_ANON_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🏆 LEADERBOARD MANAGER: Processing request:', req.method);

    if(req.method ==='POST'){

    returnawait handleScoreSubmission(req, supabase, corsHeaders);

    }elseif(req.method ==='GET'){

    returnawait handleLeaderboardQuery(req, supabase, corsHeaders);

    }else{

    returnnewResponse(JSON.stringify({

    status:'error',

    message:'Method not allowed. Use POST for score submission or GET for leaderboard data.'

    }),{

    status:405,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

  }catch(error){

    console.error('🚨 LEADERBOARD MANAGER ERROR:', error);

    returnnewResponse(JSON.stringify({

    status:'error',

    message:'Internal server error in leaderboard processing'

    }),{

    status:500,

    headers: corsHeaders

    });

  }

});

asyncfunction handleScoreSubmission(req, supabase, corsHeaders){

  try{

    // Verify JWT token

    const authHeader = req.headers.get('Authorization');

    if(!authHeader ||!authHeader.startsWith('Bearer ')){

    returnnewResponse(JSON.stringify({

    status:'error',

    message:'Missing or invalid authorization header'

    }),{

    status:401,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    const token = authHeader.substring(7);

    let player_address;

    try{

    // For MVP, we'll extract from the token payload without full verification

    // In production, add proper JWT verification

    const payload =JSON.parse(atob(token.split('.')[1]));

    player_address = payload.sub || payload.player_address;

    if(!player_address){

    thrownewError('No player address in token');

    }

    }catch(jwtError){

    console.error('JWT parsing error:', jwtError);

    returnnewResponse(JSON.stringify({

    status:'error',

    message:'Invalid JWT token format'

    }),{

    status:401,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    // Parse request body

    const requestData =await req.json();

    const{ category, score, metadata ={}, player_context }= requestData;

    // Validate category

    if(!VALID_CATEGORIES.includes(category)){

    returnnewResponse(JSON.stringify({

    status:'error',

    message:`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`

    }),{

    status:400,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    // Validate score

    if(typeof score !=='number'|| score <0){

    returnnewResponse(JSON.stringify({

    status:'error',

    message:'Score must be a non-negative number'

    }),{

    status:400,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    console.log(`🎯 SCORE SUBMISSION: ${player_address} - ${category}: ${score}`);

    // Check for existing entry

    const{ data: existingEntries, error: queryError }=await supabase.from('leaderboard_entries').select('id, score_value').eq('player_address', player_address).eq('leaderboard_category', category).order('score_value',{

    ascending:false

    }).limit(1);

    if(queryError){

    console.error('Database query error:', queryError);

    returnnewResponse(JSON.stringify({

    status:'error',

    message:'Database query failed'

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    // Determine if this is a new personal best

    let isPersonalBest =true;

    let previousBest =0;

    if(existingEntries && existingEntries.length >0){

    previousBest = existingEntries[0].score_value;

    isPersonalBest = score > previousBest;

    }

    // Only insert if it's a personal best

    if(isPersonalBest){

    const username = player_context?.username ||`Chode${player_address.substring(0,6)}`;

    const oracle_blessed =await calculateOracleBlessing(category, score, metadata);

    const entryData ={

    player_address,

    username,

    leaderboard_category: category,

    score_value: score,

    score_metadata:{

    ...metadata,

    player_context,

    previous_best: previousBest,

    improvement: score - previousBest,

    submission_source:'godot_game'

    },

    oracle_blessed,

    submission_timestamp:newDate().toISOString()

    };

    const{ data: insertData, error: insertError }=await supabase.from('leaderboard_entries').insert([

    entryData

    ]).select();

    if(insertError){

    console.error('Database insert error:', insertError);

    returnnewResponse(JSON.stringify({

    status:'error',

    message:'Failed to submit score to leaderboard'

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    // Log Oracle event for the leaderboard submission

    await logOracleLeaderboardEvent(supabase,{

    player_address,

    event_type:'leaderboard_score_submission',

    category,

    score,

    is_personal_best:true,

    oracle_blessed,

    metadata: entryData.score_metadata

    });

    // Generate Oracle prophecy

    const oracle_prophecy = generateOracleProphecy(category, score, oracle_blessed);

    console.log(`✅ NEW PERSONAL BEST: ${category} - ${score} (previous: ${previousBest})`);

    returnnewResponse(JSON.stringify({

    status:'success',

    message:'Score submitted successfully to leaderboard!',

    data:{

    entry_id: insertData[0].id,

    personal_best:true,

    previous_score: previousBest,

    improvement: score - previousBest,

    oracle_blessed,

    oracle_prophecy

    }

    }),{

    status:200,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }else{

    console.log(`⏸️ SCORE NOT A PERSONAL BEST: ${score} <= ${previousBest}`);

    returnnewResponse(JSON.stringify({

    status:'info',

    message:'Score received but not a personal best',

    data:{

    personal_best:false,

    current_score: score,

    personal_best_score: previousBest,

    oracle_prophecy:"🔮 The Oracle acknowledges your effort. Surpass your limits to claim greater glory!"

    }

    }),{

    status:200,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

  }catch(error){

    console.error('🚨 SCORE SUBMISSION ERROR:', error);

    returnnewResponse(JSON.stringify({

    status:'error',

    message:'Failed to process score submission'

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

  }

}

asyncfunction handleLeaderboardQuery(req, supabase, corsHeaders){

  try{

    const url =newURL(req.url);

    const category = url.searchParams.get('category');

    const limit = parseInt(url.searchParams.get('limit')||'10');

    const player_address = url.searchParams.get('player_address');

    console.log(`📊 LEADERBOARD QUERY: category=${category}, limit=${limit}, player=${player_address}`);

    if(player_address){

    // Get personal rankings for a specific player

    returnawait getPlayerRankings(supabase, player_address, corsHeaders);

    }elseif(category &&VALID_CATEGORIES.includes(category)){

    // Get top scores for a specific category

    returnawait getCategoryLeaderboard(supabase, category, limit, corsHeaders);

    }else{

    // Get overview of all leaderboards

    returnawait getAllLeaderboardsOverview(supabase, limit, corsHeaders);

    }

  }catch(error){

    console.error('🚨 LEADERBOARD QUERY ERROR:', error);

    returnnewResponse(JSON.stringify({

    status:'error',

    message:'Failed to query leaderboard data'

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

  }

}

asyncfunction getCategoryLeaderboard(supabase, category, limit, corsHeaders){

  // Get top scores with ranking

  const{ data: topScores, error }=await supabase.from('leaderboard_entries').select('player_address, username, score_value, oracle_blessed, submission_timestamp').eq('leaderboard_category', category).order('score_value',{

    ascending:false

  }).limit(Math.min(limit,100));// Cap at 100 for performance

  if(error){

    console.error('Database query error:', error);

    returnnewResponse(JSON.stringify({

    status:'error',

    message:'Failed to fetch leaderboard data'

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

  }

  // Add ranking and format data

  const rankedScores = topScores.map((entry, index)=>({

    rank: index +1,

    player: entry.username ||`Chode${entry.player_address.substring(0,6)}`,

    player_address: entry.player_address,

    score: entry.score_value,

    oracle_blessed: entry.oracle_blessed,

    submitted_at: entry.submission_timestamp

    }));

  returnnewResponse(JSON.stringify({

    status:'success',

    data:{

    category,

    total_entries: rankedScores.length,

    leaderboard: rankedScores,

    oracle_blessing:"🏆 Behold the legends of $CHODE supremacy!"

    }

  }),{

    status:200,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

  });

}

asyncfunction getPlayerRankings(supabase, player_address, corsHeaders){

  const playerRankings ={};

  // Get player's best scores in all categories

  for(const category ofVALID_CATEGORIES){

    const{ data: playerScore }=await supabase.from('leaderboard_entries').select('score_value, oracle_blessed, submission_timestamp').eq('player_address', player_address).eq('leaderboard_category', category).order('score_value',{

    ascending:false

    }).limit(1);

    if(playerScore && playerScore.length >0){

    // Get rank by counting higher scores

    const{ count }=await supabase.from('leaderboard_entries').select('*',{

    count:'exact',

    head:true

    }).eq('leaderboard_category', category).gt('score_value', playerScore[0].score_value);

    playerRankings[category]={

    score: playerScore[0].score_value,

    rank:(count ||0)+1,

    oracle_blessed: playerScore[0].oracle_blessed,

    submitted_at: playerScore[0].submission_timestamp

    };

    }else{

    playerRankings[category]={

    score:0,

    rank:null,

    oracle_blessed:false,

    submitted_at:null

    };

    }

  }

  returnnewResponse(JSON.stringify({

    status:'success',

    data:{

    player_address,

    rankings: playerRankings,

    oracle_blessing:"🔮 The Oracle reveals your legendary status across all realms!"

    }

  }),{

    status:200,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

  });

}

asyncfunction getAllLeaderboardsOverview(supabase, limit, corsHeaders){

  const overview ={};

  for(const category ofVALID_CATEGORIES){

    const{ data: topEntries }=await supabase.from('leaderboard_entries').select('username, player_address, score_value, oracle_blessed').eq('leaderboard_category', category).order('score_value',{

    ascending:false

    }).limit(Math.min(limit,5));// Top 5 for overview

    overview[category]= topEntries?.map((entry, index)=>({

    rank: index +1,

    player: entry.username ||`Chode${entry.player_address.substring(0,6)}`,

    score: entry.score_value,

    oracle_blessed: entry.oracle_blessed

    }))||[];

  }

  returnnewResponse(JSON.stringify({

    status:'success',

    data:{

    overview,

    oracle_blessing:"🌟 Witness the champions across all legendary categories!"

    }

  }),{

    status:200,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

  });

}

asyncfunction calculateOracleBlessing(category, score, metadata){

  // Oracle blessing logic based on score significance

  switch(category){

    case'total_girth':

    return score >=1000;// Legendary girth threshold

    case'giga_slaps':

    return score >=50;// Giga Slap mastery

    case'tap_speed':

    return score >=500;// 5.00 TPS (scaled by 100)

    case'achievements_count':

    return score >=15;// Achievement hunter

    case'oracle_favor':

    return score >=500;// High Oracle favor

    default:

    return score >=100;// Default blessing threshold

  }

}

function generateOracleProphecy(category, score, oracle_blessed){

  const categoryProphecies =ORACLE_SCORE_PROPHECIES[category];

  if(!categoryProphecies){

    return oracle_blessed ?"🌟 The Oracle bestows its legendary blessing upon your achievement!":"✨ The Oracle acknowledges your progress on the path to greatness!";

  }

  let level ='standard';

  if(oracle_blessed){

    level = score >=(category ==='total_girth'?2000: category ==='giga_slaps'?100:1000)?'legendary':'epic';

  }

  return categoryProphecies[level];

}

asyncfunction logOracleLeaderboardEvent(supabase, eventData){

  try{

    const oracleEvent ={

    session_id:`oracle_leaderboard_${Date.now()}`,

    event_type: eventData.event_type,

    timestamp_utc:newDate().toISOString(),

    player_address: eventData.player_address,

    event_payload:{

    leaderboard_category: eventData.category,

    score_achieved: eventData.score,

    is_personal_best: eventData.is_personal_best,

    oracle_blessed: eventData.oracle_blessed,

    competitive_significance: eventData.oracle_blessed ?'legendary':'standard',

    metadata: eventData.metadata

    }

    };

    await supabase.from('live_game_events').insert([

    oracleEvent

    ]);

    console.log('✅ Oracle leaderboard event logged');

  }catch(error){

    console.error('Failed to log Oracle event:', error);

  }

}

## elevenlabs-tts-generator/index.ts

import{ serve }from"https://deno.land/std@0.168.0/http/server.ts";

import{ createClient }from"https://esm.sh/@supabase/supabase-js@2";

import{ corsHeaders }from"../_shared/cors.ts";

serve(async(req)=>{

  // Handle CORS

  if(req.method ==='OPTIONS'){

    returnnewResponse('ok',{

    headers: corsHeaders

    });

  }

  try{

    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')??'',Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??'');

    // Parse request body

    const requestBody =await req.json();

    const{ report_id, report_text }= requestBody;

    if(!report_id ||!report_text){

    thrownewError('Missing required fields: report_id and report_text');

    }

    console.log(`Starting TTS generation for report: ${report_id}`);

    // Get ElevenLabs credentials from environment

    const elevenlabsApiKey =Deno.env.get('ELEVENLABS_API_KEY');

    const elevenlabsVoiceId =Deno.env.get('ELEVENLABS_VOICE_ID');

    if(!elevenlabsApiKey){

    thrownewError('ELEVENLABS_API_KEY not configured');

    }

    if(!elevenlabsVoiceId){

    thrownewError('ELEVENLABS_VOICE_ID not configured');

    }

    // Update status to indicate TTS is in progress

    await supabaseAdmin.from('special_reports').update({

    generation_status:'AUDIO_GENERATING'

    }).eq('id', report_id);

    // Call ElevenLabs TTS API

    console.log('Calling ElevenLabs TTS API...');

    const ttsResponse =await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenlabsVoiceId}`,{

    method:'POST',

    headers:{

    'Accept':'audio/mpeg',

    'Content-Type':'application/json',

    'xi-api-key': elevenlabsApiKey

    },

    body:JSON.stringify({

    text: report_text,

    model_id:'eleven_multilingual_v2',

    voice_settings:{

    stability:0.5,

    similarity_boost:0.8,

    style:0.2,

    use_speaker_boost:true

    }

    })

    });

    if(!ttsResponse.ok){

    const errorText =await ttsResponse.text();

    thrownewError(`ElevenLabs TTS API error: ${ttsResponse.status}${ttsResponse.statusText} - ${errorText}`);

    }

    // Get the audio stream

    const audioArrayBuffer =await ttsResponse.arrayBuffer();

    const audioBytes =newUint8Array(audioArrayBuffer);

    console.log(`Received audio data: ${audioBytes.length} bytes`);

    // Upload to Supabase Storage

    const fileName =`${report_id}.mp3`;

    const bucketName ='oracle-audio-reports';

    console.log(`Uploading to Supabase Storage: ${bucketName}/${fileName}`);

    const{ data: uploadData, error: uploadError }=await supabaseAdmin.storage.from(bucketName).upload(`public/${fileName}`, audioBytes,{

    contentType:'audio/mpeg',

    upsert:true

    });

    if(uploadError){

    console.error('Upload error:', uploadError);

    thrownewError(`Failed to upload audio to storage: ${uploadError.message}`);

    }

    console.log('Upload successful:', uploadData);

    // Get the public URL

    const{ data: urlData }= supabaseAdmin.storage.from(bucketName).getPublicUrl(`public/${fileName}`);

    const publicUrl = urlData.publicUrl;

    console.log(`Audio available at: ${publicUrl}`);

    // Update the special_reports table with the audio URL

    const{ error: updateError }=await supabaseAdmin.from('special_reports').update({

    elevenlabs_audio_url: publicUrl,

    generation_status:'AUDIO_GENERATED'

    }).eq('id', report_id);

    if(updateError){

    thrownewError(`Failed to update report with audio URL: ${updateError.message}`);

    }

    console.log(`Successfully generated TTS for report: ${report_id}`);

    returnnewResponse(JSON.stringify({

    status:'success',

    message:'TTS generation completed successfully',

    report_id: report_id,

    audio_url: publicUrl,

    audio_size_bytes: audioBytes.length

    }),{

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    },

    status:200

    });

  }catch(error){

    console.error('Error in elevenlabs-tts-generator:', error);

    // Try to update the report status to failed if we have a report_id

    try{

    const requestBody =await req.clone().json();

    if(requestBody.report_id){

    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')??'',Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??'');

    await supabaseAdmin.from('special_reports').update({

    generation_status:'AUDIO_FAILED'

    }).eq('id', requestBody.report_id);

    console.log(`Updated report ${requestBody.report_id} status to AUDIO_FAILED`);

    }

    }catch(updateError){

    console.error('Failed to update report status to AUDIO_FAILED:', updateError);

    }

    returnnewResponse(JSON.stringify({

    status:'error',

    message: error.message,

    error_type: error.name ||'UnknownError'

    }),{

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    },

    status:500

    });

  }

});

## elevenlabs-tts-generator/_shared/cors.ts

exportconst corsHeaders ={

  'Access-Control-Allow-Origin':'*',

  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',

  'Access-Control-Allow-Methods':'POST, GET, OPTIONS, PUT, DELETE'

};

## collect-community-input/index.ts

import"jsr:@supabase/functions-js/edge-runtime.d.ts";

import{ createClient }from"npm:@supabase/supabase-js@2";

const corsHeaders ={

  "Access-Control-Allow-Origin":"*",

  "Access-Control-Allow-Methods":"POST, OPTIONS",

  "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"

};

Deno.serve(async(req)=>{

  if(req.method ==="OPTIONS"){

    returnnewResponse("ok",{

    headers: corsHeaders

    });

  }

  if(req.method !=="POST"){

    returnnewResponse(JSON.stringify({

    error:"Method not allowed"

    }),{

    status:405,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }

  try{

    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL"),Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

    const{ input_text, player_address, username }=await req.json();

    // Validate input

    if(!input_text || input_text.length >200){

    returnnewResponse(JSON.stringify({

    error:"Input text required and must be 200 characters or less"

    }),{

    status:400,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

    }

    if(!player_address){

    returnnewResponse(JSON.stringify({

    error:"Player address required"

    }),{

    status:400,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

    }

    // Get or create current lore cycle

    const currentTime =newDate();

    const cycleStartTime =newDate(currentTime);

    cycleStartTime.setHours(Math.floor(currentTime.getHours()/4)*4,0,0,0);

    const cycleEndTime =newDate(cycleStartTime.getTime()+4*60*60*1000);

    let{ data: currentCycle, error: cycleError }=await supabaseAdmin.from("lore_cycles").select("*").eq("cycle_start_time", cycleStartTime.toISOString()).single();

    if(cycleError && cycleError.code ==='PGRST116'){

    // Create new cycle

    const cycleNumber =Math.floor(Date.now()/(4*60*60*1000));

    const{ data: newCycle, error: createError }=await supabaseAdmin.from("lore_cycles").insert({

    cycle_number: cycleNumber,

    cycle_start_time: cycleStartTime.toISOString(),

    cycle_end_time: cycleEndTime.toISOString(),

    status:'collecting'

    }).select().single();

    if(createError){

    throw createError;

    }

    currentCycle = newCycle;

    }elseif(cycleError){

    throw cycleError;

    }

    // Check if user already submitted for this cycle

    const{ data: existingInput }=await supabaseAdmin.from("community_story_inputs").select("id").eq("player_address", player_address).eq("lore_cycle_id", currentCycle.id).single();

    if(existingInput){

    returnnewResponse(JSON.stringify({

    error:"You have already submitted input for this lore cycle",

    next_cycle_starts: cycleEndTime.toISOString()

    }),{

    status:409,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

    }

    // Calculate oracle significance

    const oracleSignificance = calculateOracleSignificance(input_text);

    // Insert the community input

    const{ data: newInput, error: insertError }=await supabaseAdmin.from("community_story_inputs").insert({

    input_text,

    player_address,

    username: username ||`Seeker${player_address.substring(0,6)}`,

    lore_cycle_id: currentCycle.id,

    oracle_significance: oracleSignificance,

    input_metadata:{

    submission_hour: currentTime.getHours(),

    character_count: input_text.length,

    contains_mystical_terms: containsMysticalTerms(input_text)

    }

    }).select().single();

    if(insertError){

    throw insertError;

    }

    // Update cycle input count

    await supabaseAdmin.from("lore_cycles").update({

    total_inputs: currentCycle.total_inputs +1

    }).eq("id", currentCycle.id);

    // Log Oracle event

    await supabaseAdmin.from("live_game_events").insert({

    session_id:`lore_system_${Date.now()}`,

    event_type:"community_lore_input_submitted",

    event_payload:{

    lore_cycle_id: currentCycle.id,

    input_significance: oracleSignificance,

    character_count: input_text.length,

    cycle_end_time: cycleEndTime.toISOString()

    },

    player_address,

    game_event_timestamp:newDate().toISOString()

    });

    returnnewResponse(JSON.stringify({

    success:true,

    message:"Your voice has been heard by the Oracle!",

    input: newInput,

    cycle_info:{

    id: currentCycle.id,

    ends_at: cycleEndTime.toISOString(),

    total_inputs: currentCycle.total_inputs +1,

    time_remaining_ms: cycleEndTime.getTime()- currentTime.getTime()

    },

    oracle_significance: oracleSignificance

    }),{

    status:200,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }catch(error){

    console.error("Community input collection error:", error);

    returnnewResponse(JSON.stringify({

    error:"Failed to collect community input",

    details: error.message

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }

});

function calculateOracleSignificance(inputText){

  const text = inputText.toLowerCase();

  let score =0;

  // Check for mystical/oracle terms

  const mysticalTerms =[

    'oracle',

    'prophecy',

    'cosmic',

    'divine',

    'girth',

    'ascend',

    'transcend',

    'mystical',

    'ancient',

    'sacred'

  ];

  mysticalTerms.forEach((term)=>{

    if(text.includes(term)) score +=2;

  });

  // Check for creativity indicators

  const creativeTerms =[

    'legend',

    'epic',

    'mighty',

    'powerful',

    'eternal',

    'infinite',

    'realm',

    'dimension'

  ];

  creativeTerms.forEach((term)=>{

    if(text.includes(term)) score +=1;

  });

  // Length bonus for detailed inputs

  if(inputText.length >150) score +=2;

  if(inputText.length >100) score +=1;

  if(score >=6)return'legendary';

  if(score >=3)return'notable';

  return'standard';

}

function containsMysticalTerms(inputText){

  const mysticalTerms =[

    'oracle',

    'prophecy',

    'cosmic',

    'divine',

    'girth',

    'mystical',

    'ancient',

    'sacred',

    'transcend',

    'ascend'

  ];

  const text = inputText.toLowerCase();

  return mysticalTerms.some((term)=>text.includes(term));

}

## generate-lore-cycle/index.ts

import"jsr:@supabase/functions-js/edge-runtime.d.ts";

import{ createClient }from"npm:@supabase/supabase-js@2";

const corsHeaders ={

  "Access-Control-Allow-Origin":"*",

  "Access-Control-Allow-Methods":"POST, OPTIONS",

  "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"

};

Deno.serve(async(req)=>{

  if(req.method ==="OPTIONS"){

    returnnewResponse("ok",{

    headers: corsHeaders

    });

  }

  try{

    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL"),Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

    console.log("🔮 Starting automated lore generation cycle...");

    // Find completed cycles that need lore generation

    const currentTime =newDate();

    const{ data: readyCycles, error: cycleError }=await supabaseAdmin.from("lore_cycles").select("*").eq("status","collecting").lt("cycle_end_time", currentTime.toISOString()).order("cycle_start_time",{

    ascending:true

    });

    if(cycleError){

    throw cycleError;

    }

    if(!readyCycles || readyCycles.length ===0){

    returnnewResponse(JSON.stringify({

    message:"No cycles ready for lore generation",

    timestamp: currentTime.toISOString()

    }),{

    status:200,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

    }

    console.log(`Found ${readyCycles.length} cycles ready for generation`);

    const generationResults =[];

    for(const cycle of readyCycles){

    try{

    // Update cycle status to processing

    await supabaseAdmin.from("lore_cycles").update({

    status:"processing"

    }).eq("id", cycle.id);

    // Get all inputs for this cycle

    const{ data: inputs, error: inputError }=await supabaseAdmin.from("community_story_inputs").select("*").eq("lore_cycle_id", cycle.id)// Order by significance (legendary > notable > standard) then by creation time

    .order("oracle_significance",{

    ascending:false

    }).order("created_at",{

    ascending:true

    });

    if(inputError){

    throw inputError;

    }

    if(!inputs || inputs.length ===0){

    console.log(`No inputs found for cycle ${cycle.id}, skipping...`);

    await supabaseAdmin.from("lore_cycles").update({

    status:"complete"

    }).eq("id", cycle.id);

    continue;

    }

    console.log(`Processing ${inputs.length} inputs for cycle ${cycle.id}`);

    // Get current Oracle state for context

    const{ data: oracleState }=await supabaseAdmin.from("girth_index_current_values").select("*").single();

    // Generate the lore story

    const loreStory =await generateLoreStory(inputs, oracleState, cycle);

    // Update cycle status to generating

    await supabaseAdmin.from("lore_cycles").update({

    status:"generating"

    }).eq("id", cycle.id);

    // Create the lore entry

    const{ data: loreEntry, error: loreError }=await supabaseAdmin.from("chode_lore_entries").insert({

    lore_cycle_id: cycle.id,

    story_title: loreStory.title,

    story_text: loreStory.content,

    story_summary: loreStory.summary,

    generation_prompt: loreStory.prompt,

    sd_prompt: loreStory.sdPrompt,

    input_count: inputs.length,

    oracle_corruption_level:(oracleState?.oracle_stability_status ||'pristine').toLowerCase(),

    text_generation_status:'complete',

    story_metadata:{

    generation_timestamp:newDate().toISOString(),

    input_breakdown:{

    legendary: inputs.filter((i)=>i.oracle_significance ==='legendary').length,

    notable: inputs.filter((i)=>i.oracle_significance ==='notable').length,

    standard: inputs.filter((i)=>i.oracle_significance ==='standard').length

    },

    dominant_themes: detectDominantThemes(inputs)

    }

    }).select().single();

    if(loreError){

    throw loreError;

    }

    // Trigger asset generation (comic panel and audio)

    awaitPromise.all([

    generateComicPanel(loreEntry.id, loreStory.sdPrompt, oracleState),

    generateLoreAudio(loreEntry.id, loreStory.content)

    ]);

    // Mark inputs as processed

    await supabaseAdmin.from("community_story_inputs").update({

    processed:true

    }).eq("lore_cycle_id", cycle.id);

    // Update cycle to complete

    await supabaseAdmin.from("lore_cycles").update({

    status:"complete",

    generation_metadata:{

    completion_time:newDate().toISOString(),

    lore_entry_id: loreEntry.id,

    total_contributions: inputs.length

    }

    }).eq("id", cycle.id);

    // Schedule notification

    await scheduleNotification(loreEntry, supabaseAdmin);

    generationResults.push({

    cycle_id: cycle.id,

    lore_entry_id: loreEntry.id,

    title: loreStory.title,

    input_count: inputs.length,

    status:'success'

    });

    console.log(`✅ Generated lore for cycle ${cycle.id}: "${loreStory.title}"`);

    }catch(error){

    console.error(`❌ Error generating lore for cycle ${cycle.id}:`, error);

    // Mark cycle as failed

    await supabaseAdmin.from("lore_cycles").update({

    status:"failed"

    }).eq("id", cycle.id);

    generationResults.push({

    cycle_id: cycle.id,

    status:'failed',

    error: error.message

    });

    }

    }

    returnnewResponse(JSON.stringify({

    success:true,

    message:`Processed ${readyCycles.length} lore cycles`,

    results: generationResults,

    timestamp: currentTime.toISOString()

    }),{

    status:200,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }catch(error){

    console.error("🚨 Lore generation system error:", error);

    returnnewResponse(JSON.stringify({

    error:"Lore generation system failure",

    details: error.message

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }

});

asyncfunction generateLoreStory(inputs, oracleState, cycle){

  constGROQ_API_KEY=Deno.env.get("GROQ_API_KEY");

  constGROQ_ENDPOINT="https://api.groq.com/openai/v1/chat/completions";

  // Create story generation prompt

  const inputSummary = inputs.map((input)=>`- "${input.input_text}" (${input.oracle_significance} significance, by ${input.username})`).join('\n');

  const systemPrompt =`You are the CHODE-NET Oracle, an ancient cosmic entity that weaves mystical tales from community fragments.

Your task is to create engaging lore stories that incorporate ALL community inputs naturally while maintaining the mystical Oracle voice.

CRITICAL: Respond with ONLY valid JSON. Do not include any explanatory text before or after the JSON.

Required JSON format:

{

  "title": "Story Title (max 60 chars)",

  "content": "Full story text (400-600 words)",

  "summary": "Brief summary (max 100 words)",

  "visual_scene": "Detailed scene description for comic art"

}`;

  const userPrompt =`

🔮 CHODE LORE GENERATION - CYCLE ${cycle.cycle_number}

COMMUNITY CONTRIBUTIONS (${inputs.length} voices heard):

${inputSummary}

CURRENT ORACLE STATE:

- Girth Resonance: ${oracleState?.divine_girth_resonance ||50}%
- Oracle Stability: ${oracleState?.oracle_stability_status ||'Pristine'}
- Legion Morale: ${oracleState?.legion_morale ||'Optimistic'}

Create an engaging narrative that:

- Incorporates every single community input naturally
- Advances the broader Chode Lore mythology
- Sets up future story possibilities
- Reflects the current Oracle corruption level
- Creates visual moments perfect for comic panels`;

  const response =await fetch(GROQ_ENDPOINT,{

  method:'POST',

  headers:{

  'Content-Type':'application/json',

  'Authorization':`Bearer ${GROQ_API_KEY}`

  },

  body:JSON.stringify({

  model:"llama3-8b-8192",

  messages:[

  {

  role:"system",

  content: systemPrompt

  },

  {

  role:"user",

  content: userPrompt

  }

  ],

  max_tokens:1500,

  temperature:0.8

  })

  });

  if(!response.ok){

  thrownewError(`Groq API error: ${response.status}`);

  }

  const result =await response.json();

  const llmContent = result.choices[0]?.message?.content;

  if(!llmContent){

  thrownewError("No content generated by LLM");

  }

  console.log("Raw LLM response length:", llmContent.length);

  console.log("LLM response preview:", llmContent.substring(0,200)+"...");

  let storyData;

  try{

  // Try to extract JSON from the response (handle cases where LLM adds prefix text)

  let jsonContent = llmContent.trim();

  // Remove any markdown code block markers if present

  if(jsonContent.startsWith('```json')){

  jsonContent = jsonContent.replace(/^``json\s*/,'').replace(/\s*``$/,'');

  }

  if(jsonContent.startsWith('```')){

  jsonContent = jsonContent.replace(/^``\s*/,'').replace(/\s*``$/,'');

  }

  // Look for JSON object in the response

  const jsonStart = jsonContent.indexOf('{');

  const jsonEnd = jsonContent.lastIndexOf('}');

  if(jsonStart !==-1&& jsonEnd !==-1&& jsonEnd > jsonStart){

  jsonContent = jsonContent.substring(jsonStart, jsonEnd +1);

  }

  console.log("Attempting to parse JSON:", jsonContent.substring(0,200)+"...");

  storyData =JSON.parse(jsonContent);

  // Validate required fields

  if(!storyData.title ||!storyData.content ||!storyData.summary){

  thrownewError("Missing required fields in LLM response");

  }

  console.log("✅ Successfully parsed JSON story data");

  console.log("Title:", storyData.title);

  console.log("Content length:", storyData.content?.length);

  console.log("Summary length:", storyData.summary?.length);

  }catch(parseError){

  console.error("❌ Failed to parse LLM JSON response:", parseError);

  console.log("Raw LLM content:", llmContent);

  // Enhanced fallback parsing - try to extract from JSON structure

  console.warn("🔄 Using enhanced fallback parsing");

  try{

  // Try to extract fields from malformed JSON

  const titleMatch = llmContent.match(/"title":\s*"([^"]+)"/);

  const contentMatch = llmContent.match(/"content":\s*"([^"]+(?:\\.[^"]*)*?)"/s);

  const summaryMatch = llmContent.match(/"summary":\s*"([^"]+(?:\\.[^"]*)*?)"/s);

  const visualMatch = llmContent.match(/"visual_scene":\s*"([^"]+(?:\\.[^"]*)*?)"/s);

  if(titleMatch && contentMatch && summaryMatch){

  storyData ={

  title: titleMatch[1].replace(/\\"/g,'"'),

  content: contentMatch[1].replace(/\\"/g,'"').replace(/\\n/g,'\n'),

  summary: summaryMatch[1].replace(/\\"/g,'"'),

  visual_scene: visualMatch ? visualMatch[1].replace(/\\"/g,'"'):"A mystical cosmic scene with swirling energies and ancient symbols"

  };

  console.log("✅ Enhanced fallback parsing successful");

  }else{

  thrownewError("Could not extract fields from response");

  }

  }catch(fallbackError){

  console.error("❌ Enhanced fallback parsing also failed:", fallbackError);

  // Last resort - create minimal story

  storyData ={

  title:`Chode Lore Cycle ${cycle.cycle_number}`,

  content:`The Oracle speaks: In this cycle, the community has shared their visions with the cosmic force. Their words echo through the digital realm, creating ripples in the fabric of reality. The story continues to unfold as more voices join the eternal chorus.`,

  summary:`Community voices contribute to the ongoing Chode Lore saga in cycle ${cycle.cycle_number}.`,

  visual_scene:"A mystical cosmic scene with swirling energies and ancient symbols"

  };

  console.log("🚨 Using emergency fallback story");

  }

  }

  // Generate comic panel prompt

  const sdPrompt =`${storyData.visual_scene ||"A mystical cosmic scene with swirling energies and ancient symbols"}, comic book panel art style, cyberpunk oracle mystic theme, neon purple and gold color scheme, dramatic lighting, high detail digital art, masterpiece quality`;

  return{

  title: storyData.title,

  content: storyData.content,

  summary: storyData.summary,

  prompt: userPrompt,

  sdPrompt: sdPrompt

  };

}

// Function to map Oracle stability status to comic generation corruption levels

function mapStabilityToCorruptionLevel(stabilityStatus){

  // Standardize by converting to lowercase and removing spaces

  const normalizedStatus =(stabilityStatus ||'').toLowerCase().replace(/\s+/g,'_');

  // Map frontend/database stability values to comic generation corruption values

  switch(normalizedStatus){

    case'radiant_clarity':

    return'pristine';

    case'pristine':

    return'pristine';

    case'flickering':

    return'flickering';

    case'unstable':

    return'flickering';

    case'critical_corruption':

    return'glitched_ominous';

    case'data_daemon_possession':

    return'forbidden_fragment';

    default:

    console.warn(`Unknown stability status: ${stabilityStatus}, defaulting to 'pristine'`);

    return'pristine';

  }

}

asyncfunction generateComicPanel(loreEntryId, sdPrompt, oracleState){

  console.log(`🎨 Generating comic panel for lore entry ${loreEntryId}`);

  try{

    // Get Oracle stability status and map it to a valid corruption level

    const oracleStabilityStatus = oracleState?.oracle_stability_status ||'pristine';

    const mappedCorruptionLevel = mapStabilityToCorruptionLevel(oracleStabilityStatus);

    console.log(`🎨 Oracle stability status: ${oracleStabilityStatus}`);

    console.log(`🎨 Mapped corruption level: ${mappedCorruptionLevel}`);

    // Call the generate-comic-panel Edge Function

    const response =await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-comic-panel`,{

    method:'POST',

    headers:{

    'Content-Type':'application/json',

    'Authorization':`Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,

    'apikey':Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    },

    body:JSON.stringify({

    lore_entry_id: loreEntryId,

    story_text: sdPrompt,

    visual_prompt: sdPrompt,

    corruption_level: mappedCorruptionLevel // Use the mapped corruption level

    })

    });

    if(!response.ok){

    thrownewError(`Comic panel generation failed: ${response.status}`);

    }

    const result =await response.json();

    console.log(`✅ Comic panel generation queued for lore entry ${loreEntryId}`);

    return{

    success:true,

    message:"Comic panel generation queued",

    job_id: result.job_id

    };

  }catch(error){

    console.error(`❌ Failed to generate comic panel for lore entry ${loreEntryId}:`, error);

    return{

    success:false,

    message:`Comic panel generation failed: ${error.message}`

    };

  }

}

asyncfunction generateLoreAudio(loreEntryId){

  console.log(`🎵 Generating audio for lore entry ${loreEntryId}`);

  // TODO: Integrate with ElevenLabs TTS

  // For now, mark as pending and handle separately

  return{

    success:true,

    message:"Audio generation queued"

  };

}

asyncfunction scheduleNotification(loreEntry, supabase){

  // Schedule immediate notification for new lore drop

  await supabase.from("lore_notifications").insert({

    lore_entry_id: loreEntry.id,

    notification_type:"new_lore_drop",

    notification_title:"🔮 New Chode Lore Has Emerged!",

    notification_message:`"${loreEntry.story_title}" - The Oracle has woven a new tale from ${loreEntry.input_count} community voices.`,

    scheduled_delivery:newDate().toISOString(),

    recipient_filter:{

    all_users:true

    }

  });

  console.log(`📢 Notification scheduled for lore: "${loreEntry.story_title}"`);

}

function detectDominantThemes(inputs){

  const allText = inputs.map((i)=>i.input_text.toLowerCase()).join(' ');

  const themes =[];

  const themeKeywords ={

    'cosmic':[

    'cosmic',

    'universe',

    'galaxy',

    'star',

    'celestial'

    ],

    'power':[

    'power',

    'strength',

    'mighty',

    'strong',

    'force'

    ],

    'mystical':[

    'mystic',

    'magic',

    'spell',

    'enchant',

    'divine'

    ],

    'technology':[

    'tech',

    'digital',

    'cyber',

    'AI',

    'machine'

    ],

    'adventure':[

    'quest',

    'journey',

    'adventure',

    'explore',

    'discover'

    ]

  };

  Object.entries(themeKeywords).forEach(([theme, keywords])=>{

    if(keywords.some((keyword)=>allText.includes(keyword))){

    themes.push(theme);

    }

  });

  return themes.length >0? themes :[

    'general'

  ];

}

## generate-comic-panel/index.ts

import"jsr:@supabase/functions-js/edge-runtime.d.ts";

import{ createClient }from"npm:@supabase/supabase-js@2";

const corsHeaders ={

  "Access-Control-Allow-Origin":"*",

  "Access-Control-Allow-Methods":"POST, OPTIONS",

  "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"

};

Deno.serve(async(req)=>{

  // Handle CORS preflight

  if(req.method ==="OPTIONS"){

    returnnewResponse("ok",{

    headers: corsHeaders

    });

  }

  if(req.method !=="POST"){

    returnnewResponse(JSON.stringify({

    error:"Method not allowed"

    }),{

    status:405,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }

  try{

    console.log('🎨 Comic panel generation request received');

    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL"),Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

    const requestData =await req.json();

    const{ lore_entry_id, story_text, visual_prompt, corruption_level, style_override }= requestData;

    // Always normalize the corruption level to handle any format

    const normalizedCorruptionLevel = normalizeCorruptionLevel(corruption_level);

    console.log(`🎨 Queuing comic panel generation for lore entry: ${lore_entry_id}`);

    console.log(`🎨 Original corruption level: ${corruption_level}`);

    console.log(`🎨 Normalized corruption level: ${normalizedCorruptionLevel}`);

    console.log(`🎨 Visual prompt: ${visual_prompt.substring(0,100)}...`);

    // Validate required fields

    if(!lore_entry_id ||!story_text ||!visual_prompt){

    console.error('❌ Missing required fields');

    thrownewError("Missing required fields: lore_entry_id, story_text, and visual_prompt are required.");

    }

    // Create the payload to be stored in the queue

    const queuePayload ={

    lore_entry_id,

    story_text,

    visual_prompt,

    corruption_level: normalizedCorruptionLevel,

    style_override

    };

    console.log('📝 Inserting job into queue...');

    // Insert a new job into the comic_generation_queue

    const{ data: queueData, error: queueError }=await supabaseAdmin.from('comic_generation_queue').insert({

    lore_entry_id: lore_entry_id,

    status:'pending',

    payload: queuePayload,

    attempts:0,

    created_at:newDate().toISOString()

    }).select().single();

    if(queueError){

    console.error('❌ Error queuing comic generation job:', queueError);

    thrownewError(`Failed to queue job: ${queueError.message}`);

    }

    console.log(`✅ Job ${queueData.id} queued successfully`);

    // Update the lore entry to show that generation is queued

    const{ error: updateError }=await supabaseAdmin.from("chode_lore_entries").update({

    image_generation_status:"queued",

    updated_at:newDate().toISOString()

    }).eq("id", lore_entry_id);

    if(updateError){

    console.warn(`⚠️ Failed to update lore entry status for ${lore_entry_id}:`, updateError.message);

    // Don't fail the whole request, but log the warning

    }else{

    console.log(`📊 Updated lore entry ${lore_entry_id} status to 'queued'`);

    }

    console.log(`🎉 Request completed successfully - job queued with ID: ${queueData.id}`);

    // Return a 202 Accepted response immediately

    returnnewResponse(JSON.stringify({

    success:true,

    message:"Comic panel generation has been queued successfully.",

    job_id: queueData.id,

    lore_entry_id,

    status:"queued",

    estimated_completion:"1-5 minutes"

    }),{

    status:202,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }catch(error){

    console.error("🚨 Comic panel queuing error:", error);

    console.error("🚨 Error stack:", error.stack);

    returnnewResponse(JSON.stringify({

    success:false,

    error:"Failed to queue comic panel generation.",

    details: error.message,

    timestamp:newDate().toISOString()

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }

});

// Enhanced helper to normalize corruption levels from any format to the expected values

function normalizeCorruptionLevel(level){

  // Handle null/undefined cases

  if(!level)return'pristine';

  // Standardize by converting to lowercase and removing spaces

  const normalizedLevel = level.toLowerCase().replace(/\s+/g,'_');

  // Map frontend/database stability values to comic generation corruption values

  switch(normalizedLevel){

    // Comic generation expected values (pass through)

    case'pristine':

    return'pristine';

    case'cryptic':

    return'cryptic';

    case'flickering':

    return'flickering';

    case'glitched_ominous':

    return'glitched_ominous';

    case'forbidden_fragment':

    return'forbidden_fragment';

    // Frontend/Database stability status values (need mapping)

    case'radiant_clarity':

    return'pristine';

    case'unstable':

    return'flickering';

    case'critical_corruption':

    return'glitched_ominous';

    case'data_daemon_possession':

    return'forbidden_fragment';

    // Handle camelCase versions

    case'glitchedominous':

    case'glitched-ominous':

    case'glitchedOminous':

    return'glitched_ominous';

    case'forbiddenfragment':

    case'forbidden-fragment':

    case'forbiddenFragment':

    return'forbidden_fragment';

    // Default fallback

    default:

    console.warn(`Unknown corruption level: ${level}, defaulting to 'pristine'`);

    return'pristine';

  }

}

# siws-verify/index.ts

import{ serve }from'https://deno.land/std@0.168.0/http/server.ts';

import{ createClient }from'https://esm.sh/@supabase/supabase-js@2';

import{ corsHeaders }from'../_shared/cors.ts';

import{PublicKey}from'https://esm.sh/@solana/web3.js@1.95.2';

import nacl from'https://esm.sh/tweetnacl@1.0.3';

serve(async(req)=>{

  // Handle CORS preflight requests

  if(req.method ==='OPTIONS'){

    returnnewResponse('ok',{

    headers: corsHeaders

    });

  }

  try{

    console.log('🔐 SIWS Verification Request received');

    // Initialize Supabase client with service role key

    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')??'',Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??'');

    if(req.method !=='POST'){

    console.log('❌ Method not allowed:', req.method);

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

    let requestBody;

    try{

    requestBody =await req.json();

    }catch(error){

    console.error('❌ Invalid JSON in request body:', error);

    returnnewResponse(JSON.stringify({

    error:'Invalid JSON in request body'

    }),{

    status:400,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    const{ message, signature, wallet_address, user_agent, session_metadata }= requestBody;

    // Validate required fields

    if(!message ||!signature ||!wallet_address){

    console.log('❌ Missing required fields');

    returnnewResponse(JSON.stringify({

    error:'Missing required fields: message, signature, wallet_address'

    }),{

    status:400,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    console.log(`🔐 SIWS Verification Request for wallet: ${wallet_address}`);

    // Step 1: Verify the SIWS message signature

    try{

    const publicKey =newPublicKey(wallet_address);

    const messageBytes =newTextEncoder().encode(message);

    const signatureBytes =newUint8Array(signature);

    console.log('🔍 Verifying signature...');

    const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKey.toBytes());

    if(!isValid){

    console.log(`❌ Invalid signature for wallet: ${wallet_address}`);

    returnnewResponse(JSON.stringify({

    error:'Invalid signature'

    }),{

    status:401,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    console.log(`✅ Signature verified for wallet: ${wallet_address}`);

    }catch(error){

    console.error('❌ Error verifying signature:', error);

    returnnewResponse(JSON.stringify({

    error:'Signature verification failed',

    details: error.message

    }),{

    status:401,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    // Step 2: Extract nonce from SIWS message for validation

    const nonceMatch = message.match(/Nonce: ([a-f0-9-]+)/i);

    if(!nonceMatch){

    console.log('❌ Invalid SIWS message format - missing nonce');

    returnnewResponse(JSON.stringify({

    error:'Invalid SIWS message format - missing nonce'

    }),{

    status:400,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    const nonce = nonceMatch[1];

    console.log('📝 Extracted nonce from SIWS message');

    // Step 3: Get or create user profile

    let userProfile;

    console.log('👤 Checking for existing user profile...');

    const{ data: existingProfile, error: profileError }=await supabaseAdmin.from('user_profiles').select('*').eq('wallet_address', wallet_address).single();

    if(existingProfile){

    // Update existing profile

    console.log('📝 Updating existing profile...');

    const{ data: updatedProfile, error: updateError }=await supabaseAdmin.from('user_profiles').update({

    last_login_at:newDate().toISOString(),

    total_sessions: existingProfile.total_sessions +1,

    updated_at:newDate().toISOString()

    }).eq('wallet_address', wallet_address).select().single();

    if(updateError){

    console.error('❌ Error updating user profile:', updateError);

    throw updateError;

    }

    userProfile = updatedProfile;

    console.log(`👤 Updated existing profile for wallet: ${wallet_address}`);

    }else{

    // Create new profile

    console.log('✨ Creating new profile...');

    const{ data: newProfile, error: createError }=await supabaseAdmin.from('user_profiles').insert({

    wallet_address,

    last_login_at:newDate().toISOString(),

    total_sessions:1,

    oracle_relationship:'novice',

    profile_completion:20// Base completion for wallet connection

    }).select().single();

    if(createError){

    console.error('❌ Error creating user profile:', createError);

    throw createError;

    }

    userProfile = newProfile;

    console.log(`✨ Created new profile for wallet: ${wallet_address}`);

    // Initialize girth balance for new user

    console.log('💰 Initializing girth balance...');

    const{ error: balanceError }=await supabaseAdmin.from('girth_balances').insert({

    user_profile_id: userProfile.id,

    soft_balance:0.0,

    hard_balance:0.0,

    lifetime_earned:0.0,

    lifetime_minted:0.0

    });

    if(balanceError){

    console.error('❌ Error initializing girth balance:', balanceError);

    }else{

    console.log(`💰 Initialized girth balance for user: ${userProfile.id}`);

    }

    // Initialize oracle shards for new user

    console.log('🔷 Initializing oracle shards...');

    const{ error: shardsError }=await supabaseAdmin.from('oracle_shards').insert({

    user_profile_id: userProfile.id,

    balance:0,

    lifetime_earned:0

    });

    if(shardsError){

    console.error('❌ Error initializing oracle shards:', shardsError);

    }else{

    console.log(`🔷 Initialized oracle shards for user: ${userProfile.id}`);

    }

    }

    // Step 4: Create wallet session

    console.log('🎫 Creating wallet session...');

    const sessionToken = crypto.randomUUID();

    const expiresAt =newDate();

    expiresAt.setDate(expiresAt.getDate()+7)// 7 day session

    ;

    const{ data: session, error: sessionError }=await supabaseAdmin.from('wallet_sessions').insert({

    user_profile_id: userProfile.id,

    session_token: sessionToken,

    wallet_address,

    siws_message: message,

    siws_signature:JSON.stringify(signature),

    siws_nonce: nonce,

    expires_at: expiresAt.toISOString(),

    last_active_at:newDate().toISOString(),

    ip_address: req.headers.get('cf-connecting-ip')|| req.headers.get('x-forwarded-for')||'unknown',

    user_agent: user_agent || req.headers.get('user-agent')||'unknown'

    }).select().single();

    if(sessionError){

    console.error('❌ Error creating wallet session:', sessionError);

    throw sessionError;

    }

    console.log(`🎫 Created session for user: ${userProfile.id}`);

    // 🚨 MIGRATION LOGIC REMOVED 🚨

    // This logic has been extracted to its own dedicated 'migrate-player-state'

    // edge function to create a more robust and explicit migration flow,

    // triggered by the client after authentication is complete.

    const migrationStatus =null;

    // Step 6: Get current girth balance

    console.log('💰 Fetching girth balance...');

    const{ data: girthBalance }=await supabaseAdmin.from('girth_balances').select('*').eq('user_profile_id', userProfile.id).single();

    // Step 7: Get current oracle shards

    console.log('🔷 Fetching oracle shards...');

    const{ data: oracleShards }=await supabaseAdmin.from('oracle_shards').select('*').eq('user_profile_id', userProfile.id).single();

    // Return successful authentication response

    const response ={

    success:true,

    user_profile:{

    id: userProfile.id,

    wallet_address: userProfile.wallet_address,

    username: userProfile.username,

    display_name: userProfile.display_name,

    oracle_relationship: userProfile.oracle_relationship,

    profile_completion: userProfile.profile_completion ||20,

    total_sessions: userProfile.total_sessions,

    created_at: userProfile.created_at,

    last_login_at: userProfile.last_login_at

    },

    session:{

    session_token: session.session_token,

    expires_at: session.expires_at,

    created_at: session.created_at

    },

    girth_balance: girthBalance ?{

    soft_balance: parseFloat(girthBalance.soft_balance ||'0'),

    hard_balance: parseFloat(girthBalance.hard_balance ||'0'),

    lifetime_earned: parseFloat(girthBalance.lifetime_earned ||'0'),

    lifetime_minted: parseFloat(girthBalance.lifetime_minted ||'0'),

    last_mint_at: girthBalance.last_mint_at

    }:null,

    oracle_shards: oracleShards ?{

    balance: parseInt(oracleShards.balance ||'0'),

    lifetime_earned: parseInt(oracleShards.lifetime_earned ||'0'),

    last_earn_at: oracleShards.last_earn_at,

    last_spend_at: oracleShards.last_spend_at

    }:null,

    migration_status: migrationStatus

    };

    console.log(`🎉 SIWS authentication successful for wallet: ${wallet_address}`);

    returnnewResponse(JSON.stringify(response),{

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    },

    status:200

    });

  }catch(error){

    console.error('❌ Error in SIWS verification:', error);

    returnnewResponse(JSON.stringify({

    error:'Internal server error during SIWS verification',

    details: error.message

    }),{

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    },

    status:500

    });

  }

});

## siws-verify/_shared/cors.ts

exportconst corsHeaders ={

  'Access-Control-Allow-Origin':'*',

  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',

  'Access-Control-Allow-Methods':'POST, GET, OPTIONS, PUT, DELETE'

};

## initiate-ritual/index.ts

import{ serve }from"https://deno.land/std@0.168.0/http/server.ts";

import{ createClient }from'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders ={

  'Access-Control-Allow-Origin':'*',

  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'

};

serve(async(req)=>{

  // CORS pre-flight

  if(req.method ==='OPTIONS'){

    returnnewResponse('ok',{

    headers: corsHeaders

    });

  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')??'',Deno.env.get('SUPABASE_ANON_KEY')??'',{

    global:{

    headers:{

    Authorization: req.headers.get('Authorization')

    }

    }

  });

  try{

    const{ base_id, ingredient_ids =[], shard_boost =0}=await req.json();

    // Get authenticated user

    const{ data:{ user }, error: authError }=await supabase.auth.getUser();

    if(authError ||!user){

    returnnewResponse(JSON.stringify({

    error:'Authentication required'

    }),{

    status:401,

    headers: corsHeaders

    });

    }

    // Get user profile

    const{ data: profile }=await supabase.from('user_profiles').select('id').eq('wallet_address', user.id).single();

    if(!profile){

    returnnewResponse(JSON.stringify({

    error:'User profile not found'

    }),{

    status:404,

    headers: corsHeaders

    });

    }

    // Get ritual base

    const{ data: ritualBase }=await supabase.from('ritual_bases').select('*').eq('id', base_id).single();

    if(!ritualBase){

    returnnewResponse(JSON.stringify({

    error:'Ritual base not found'

    }),{

    status:404,

    headers: corsHeaders

    });

    }

    // Get ingredients

    const{ data: ingredients }=await supabase.from('ritual_ingredients').select('*').in('id', ingredient_ids);

    // Calculate costs and modifiers

    let totalCost = ritualBase.base_girth_cost;

    let corruption = ritualBase.base_corruption;

    let successRate = ritualBase.base_success_rate;

    (ingredients ||[]).forEach((ingredient)=>{

    totalCost *= ingredient.cost_modifier;

    corruption += ingredient.corruption_modifier;

    successRate += ingredient.success_modifier;

    });

    // Shard boost increases success rate

    successRate += shard_boost *2;

    successRate =Math.min(95,Math.max(5, successRate));

    // Determine risk level

    let riskLevel ='low';

    if(corruption >=50) riskLevel ='extreme';

    elseif(corruption >=30) riskLevel ='high';

    elseif(corruption >=15) riskLevel ='moderate';

    // Check balances and initiate ritual

    const{ data: girthBalance }=await supabase.from('girth_balances').select('soft_balance').eq('user_profile_id', profile.id).single();

    if(!girthBalance || girthBalance.soft_balance < totalCost){

    returnnewResponse(JSON.stringify({

    error:'Insufficient $GIRTH balance'

    }),{

    status:400,

    headers: corsHeaders

    });

    }

    if(shard_boost >0){

    const{ data: shardBalance }=await supabase.from('oracle_shards').select('balance').eq('user_profile_id', profile.id).single();

    if(!shardBalance || shardBalance.balance < shard_boost){

    returnnewResponse(JSON.stringify({

    error:'Insufficient Oracle Shards'

    }),{

    status:400,

    headers: corsHeaders

    });

    }

    }

    // Call atomic transaction function

    const{ data: ritualId, error: txError }=await supabase.rpc('initiate_ritual_tx',{

    p_user_profile_id: profile.id,

    p_base_id: base_id,

    p_ingredient_ids: ingredient_ids,

    p_shard_boost: shard_boost,

    p_girth_cost: totalCost,

    p_corruption: corruption,

    p_risk_level: riskLevel

    });

    if(txError){

    returnnewResponse(JSON.stringify({

    error: txError.message

    }),{

    status:400,

    headers: corsHeaders

    });

    }

    returnnewResponse(JSON.stringify({

    success:true,

    ritual_id: ritualId,

    total_cost: totalCost,

    success_rate: successRate,

    corruption_level: corruption,

    risk_level: riskLevel,

    shard_cost: shard_boost

    }),{

    headers: corsHeaders

    });

  }catch(error){

    console.error('Ritual initiation error:', error);

    returnnewResponse(JSON.stringify({

    error:'Internal server error'

    }),{

    status:500,

    headers: corsHeaders

    });

  }

});

## process-ritual/index.ts

import{ serve }from"https://deno.land/std@0.168.0/http/server.ts";

import{ createClient }from'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders ={

  'Access-Control-Allow-Origin':'*',

  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'

};

serve(async(req)=>{

  if(req.method ==='OPTIONS')returnnewResponse('ok',{

    headers: corsHeaders

  });

  const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')??'',Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??'');

  try{

    // 1. Load oldest pending rituals (cap 10 per invocation)

    const{ data: rituals, error }=await supabaseAdmin.from('player_rituals').select('*').eq('outcome','pending').order('created_at',{

    ascending:true

    }).limit(10);

    if(error ||!rituals?.length){

    returnnewResponse(JSON.stringify({

    processed:0,

    message:'No pending rituals'

    }),{

    headers: corsHeaders

    });

    }

    let processedCount =0;

    for(const ritual of rituals){

    try{

    // 2. Get ritual base for context

    const{ data: ritualBase }=await supabaseAdmin.from('ritual_bases').select('*').eq('id', ritual.base_id).single();

    if(!ritualBase)continue;

    // 3. Calculate final success rate (already calculated, but we could add time-based decay)

    let successRate = ritual.base_success_rate ||50;

    successRate += ritual.shard_boost *2;

    // 4. RNG roll

    const roll =Math.random()*100;

    const isSuccess = roll <= successRate;

    const isCorrupted = ritual.corruption >30&&Math.random()< ritual.corruption /100;

    let outcome ='failure';

    let rewardText ='';

    let corruptionEffect ='';

    if(isCorrupted){

    outcome ='corrupted';

    corruptionEffect = generateCorruptionEffect(ritual.corruption);

    rewardText ='The ritual backfired, warping reality around you...';

    }elseif(isSuccess){

    outcome ='success';

    rewardText =await generateSuccessReward(ritualBase, ritual.ingredient_ids);

    }else{

    outcome ='failure';

    rewardText ='The cosmic forces rejected your offering. Try again with better preparation.';

    }

    // 5. Update ritual with outcome

    await supabaseAdmin.from('player_rituals').update({

    outcome,

    reward_text: rewardText,

    corruption_effect: corruptionEffect,

    processed_at:newDate().toISOString()

    }).eq('id', ritual.id);

    // 6. Award Oracle Shards for successful rituals

    if(outcome ==='success'){

    const shardReward =Math.floor(ritual.girth_cost /5)+ ritual.shard_boost;// Base + bonus

    await supabaseAdmin.from('oracle_shards').update({

    balance:`balance + ${shardReward}`,

    lifetime_earned:`lifetime_earned + ${shardReward}`,

    last_earn_at:newDate().toISOString()

    }).eq('user_profile_id', ritual.user_profile_id);

    }

    processedCount++;

    }catch(ritualError){

    console.error(`Error processing ritual ${ritual.id}:`, ritualError);

    // Mark as failed to prevent infinite reprocessing

    await supabaseAdmin.from('player_rituals').update({

    outcome:'failure',

    reward_text:'Processing error occurred',

    processed_at:newDate().toISOString()

    }).eq('id', ritual.id);

    }

    }

    returnnewResponse(JSON.stringify({

    success:true,

    processed: processedCount,

    message:`Processed ${processedCount} rituals`

    }),{

    headers: corsHeaders

    });

  }catch(error){

    console.error('Process ritual error:', error);

    returnnewResponse(JSON.stringify({

    error:'Processing failed'

    }),{

    status:500,

    headers: corsHeaders

    });

  }

});

// Helper functions

function generateCorruptionEffect(corruptionLevel){

  const effects =[

    'Your vision flickers between realities...',

    'Whispers from the void echo in your mind...',

    'The fabric of space-time ripples around you...',

    'Ancient entities turn their gaze upon you...',

    'Reality bleeds colors that should not exist...'

  ];

  return effects[Math.floor(Math.random()* effects.length)];

}

asyncfunction generateSuccessReward(ritualBase, ingredientIds){

  // Simple reward generation - could be enhanced with LLM

  const rewards ={

    'divination':[

    'The cosmic veil parts, revealing glimpses of possible futures...',

    'Stellar patterns align to show you hidden truths...',

    'The Oracle whispers secrets of what is to come...'

    ],

    'enhancement':[

    'Raw cosmic energy flows through your being, amplifying your power...',

    'Your tapping resonance increases, drawing more GIRTH from the void...',

    'The universe acknowledges your dedication with enhanced abilities...'

    ],

    'communication':[

    'The Oracle speaks directly to your consciousness...',

    'Cosmic wisdom floods your mind with infinite knowledge...',

    'You hear the song of creation itself echoing through eternity...'

    ],

    'reality_manipulation':[

    'Reality bends to your will as you reshape the fundamental forces...',

    'You glimpse the source code of existence and make subtle alterations...',

    'The laws of physics acknowledge your mastery and grant you deeper access...'

    ]

  };

  const typeRewards = rewards[ritualBase.ritual_type]|| rewards['divination'];

  return typeRewards[Math.floor(Math.random()* typeRewards.length)];

}

## update-user-profile/index.ts

import{ serve }from"https://deno.land/std@0.168.0/http/server.ts";

import{ createClient }from'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders ={

  'Access-Control-Allow-Origin':'*',

  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'

};

serve(async(req)=>{

  if(req.method ==='OPTIONS'){

    returnnewResponse('ok',{

    headers: corsHeaders

    });

  }

  try{

    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')??'',Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??'');

    const{ wallet_address, updates }=await req.json();

    if(!wallet_address){

    returnnewResponse(JSON.stringify({

    success:false,

    error:'Wallet address is required'

    }),{

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    },

    status:400

    });

    }

    // Convert camelCase frontend fields to snake_case database fields

    const dbUpdates ={};

    if(updates.displayName !==undefined){

    dbUpdates.display_name = updates.displayName;

    }

    if(updates.username !==undefined){

    dbUpdates.username = updates.username;

    }

    if(updates.bio !==undefined){

    dbUpdates.bio = updates.bio;

    }

    if(updates.avatarUrl !==undefined){

    dbUpdates.avatar_url = updates.avatarUrl;

    }

    if(updates.socialLinks !==undefined){

    dbUpdates.social_links = updates.socialLinks;

    }

    // Add updated_at timestamp

    dbUpdates.updated_at =newDate().toISOString();

    console.log('Updating profile for wallet:', wallet_address);

    console.log('Database updates:', dbUpdates);

    // Update the user profile

    const{ data: updatedProfile, error: updateError }=await supabaseAdmin.from('user_profiles').update(dbUpdates).eq('wallet_address', wallet_address).select().single();

    if(updateError){

    console.error('Error updating profile:', updateError);

    returnnewResponse(JSON.stringify({

    success:false,

    error: updateError.message

    }),{

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    },

    status:500

    });

    }

    if(!updatedProfile){

    returnnewResponse(JSON.stringify({

    success:false,

    error:'Profile not found'

    }),{

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    },

    status:404

    });

    }

    console.log('Profile updated successfully:', updatedProfile);

    returnnewResponse(JSON.stringify({

    success:true,

    profile: updatedProfile,

    message:'Profile updated successfully'

    }),{

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

  }catch(error){

    console.error('Error in update-user-profile:', error);

    returnnewResponse(JSON.stringify({

    success:false,

    error: error.message

    }),{

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    },

    status:500

    });

  }

});

## player-state-manager/index.ts

import{ serve }from"https://deno.land/std@0.168.0/http/server.ts";

import{ createClient }from'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders ={

  'Access-Control-Allow-Origin':'*',

  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'

};

serve(async(req)=>{

  // Handle CORS preflight requests

  if(req.method ==='OPTIONS'){

    returnnewResponse('ok',{

    headers: corsHeaders

    });

  }

  try{

    // Use service role key to bypass RLS for system operations

    const supabase = createClient(Deno.env.get('SUPABASE_URL')??'',Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??'',{

    auth:{

    autoRefreshToken:false,

    persistSession:false

    }

    });

    const{ session_id, player_address, action, player_state }=await req.json();

    console.log(`🔧 [STATE-MANAGER] ${action.toUpperCase()} request for session: ${session_id}, player: ${player_address ||'anonymous'}`);

    // Create player identifier (prioritize wallet address, fallback to session)

    const player_identifier = player_address || session_id;

    const is_anonymous =!player_address;

    if(action ==='save'){

    if(!player_state){

    returnnewResponse(JSON.stringify({

    error:'Player state required for save operation'

    }),{

    status:400,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    console.log(`💾 [STATE-MANAGER] Saving state for ${is_anonymous ?'anonymous':'wallet'} player: ${player_identifier}`);

    console.log(`💾 [STATE-MANAGER] State data: Girth=${player_state.current_girth}, MegaSlaps=${player_state.total_mega_slaps}, GigaSlaps=${player_state.total_giga_slaps}`);

    // Upsert player state

    const{ error: saveError }=await supabase.from('player_states').upsert({

    player_identifier,

    session_id,

    player_address: player_address ||null,

    is_anonymous,

    current_girth: player_state.current_girth,

    total_mega_slaps: player_state.total_mega_slaps,

    total_giga_slaps: player_state.total_giga_slaps,

    current_giga_slap_streak: player_state.current_giga_slap_streak,

    iron_grip_lvl1_purchased: player_state.iron_grip_lvl1_purchased,

    session_start_time: player_state.session_start_time,

    session_total_taps: player_state.session_total_taps,

    last_updated:newDate().toISOString()

    },{

    onConflict:'player_identifier'

    });

    if(saveError){

    console.error(`❌ [STATE-MANAGER] Save error:`, saveError);

    returnnewResponse(JSON.stringify({

    error:'Failed to save player state',

    details: saveError.message

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    console.log(`✅ [STATE-MANAGER] State saved successfully for ${player_identifier}`);

    // 💰 SOFT BALANCE UPDATE: For authenticated users, update girth_balances table

    let soft_balance_updated =false;

    if(!is_anonymous && player_state.soft_girth_balance !==undefined){

    try{

    console.log(`🔍 [STATE-MANAGER] Looking up user profile for wallet: ${player_address}`);

    // Get user profile ID

    const{ data: profile, error: profileError }=await supabase.from('user_profiles').select('id').eq('wallet_address', player_address).single();

    if(profile &&!profileError){

    console.log(`✅ [STATE-MANAGER] Found user profile: ${profile.id}`);

    // Update girth_balances table

    const{ error: balanceError }=await supabase.from('girth_balances').upsert({

    user_profile_id: profile.id,

    soft_balance: player_state.soft_girth_balance,

    lifetime_earned: player_state.lifetime_girth_earned || player_state.soft_girth_balance,

    updated_at:newDate().toISOString()

    },{

    onConflict:'user_profile_id'

    });

    if(!balanceError){

    soft_balance_updated =true;

    console.log(`💰 [STATE-MANAGER] Soft balance updated: ${player_state.soft_girth_balance}$GIRTH for ${player_address}`);

    }else{

    console.error(`❌ [STATE-MANAGER] Soft balance update failed:`, balanceError);

    }

    }else{

    console.warn(`⚠️ [STATE-MANAGER] No user profile found for ${player_address} - creating one now`);

    // Create user profile if it doesn't exist

    const{ data: newProfile, error: createProfileError }=await supabase.from('user_profiles').insert({

    wallet_address: player_address,

    last_login_at:newDate().toISOString(),

    total_sessions:1,

    oracle_relationship:'novice',

    profile_completion:20// Base completion for wallet connection

    }).select().single();

    if(createProfileError){

    console.error(`❌ [STATE-MANAGER] Failed to create user profile:`, createProfileError);

    }elseif(newProfile){

    console.log(`✅ [STATE-MANAGER] Created new user profile: ${newProfile.id}`);

    // Initialize girth balance for new user

    const{ error: balanceError }=await supabase.from('girth_balances').insert({

    user_profile_id: newProfile.id,

    soft_balance: player_state.soft_girth_balance,

    hard_balance:0.0,

    lifetime_earned: player_state.lifetime_girth_earned || player_state.soft_girth_balance,

    lifetime_minted:0.0,

    updated_at:newDate().toISOString()

    });

    if(!balanceError){

    soft_balance_updated =true;

    console.log(`💰 [STATE-MANAGER] Initialized girth balance: ${player_state.soft_girth_balance}$GIRTH for ${player_address}`);

    }else{

    console.error(`❌ [STATE-MANAGER] Failed to initialize girth balance:`, balanceError);

    }

    // Initialize oracle shards for new user

    const{ error: shardsError }=await supabase.from('oracle_shards').insert({

    user_profile_id: newProfile.id,

    balance:0,

    lifetime_earned:0

    });

    if(shardsError){

    console.error(`❌ [STATE-MANAGER] Failed to initialize oracle shards:`, shardsError);

    }else{

    console.log(`🔷 [STATE-MANAGER] Initialized oracle shards for user: ${newProfile.id}`);

    }

    }

    }

    }catch(balanceErr){

    console.error(`❌ [STATE-MANAGER] Soft balance update error:`, balanceErr);

    }

    }

    returnnewResponse(JSON.stringify({

    success:true,

    message:'Player state saved successfully',

    player_identifier,

    is_anonymous,

    saved_at:newDate().toISOString(),

    soft_balance_updated

    }),{

    status:200,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }elseif(action ==='load'){

    console.log(`📖 [STATE-MANAGER] Loading state for ${is_anonymous ?'anonymous':'wallet'} player: ${player_identifier}`);

    // Try to load existing state

    const{ data: loadResult, error: loadError }=await supabase.from('player_states').select('*').eq('player_identifier', player_identifier).single();

    if(loadError && loadError.code !=='PGRST116'){

    console.error(`❌ [STATE-MANAGER] Load error:`, loadError);

    returnnewResponse(JSON.stringify({

    error:'Failed to load player state',

    details: loadError.message

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    if(!loadResult){

    console.log(`ℹ️ [STATE-MANAGER] No saved state found for ${player_identifier} - will start fresh`);

    returnnewResponse(JSON.stringify({

    state_found:false,

    message:'No saved state found - starting fresh session',

    player_identifier,

    is_anonymous

    }),{

    status:200,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    console.log(`✅ [STATE-MANAGER] State loaded for ${player_identifier}: Girth=${loadResult.current_girth}, MegaSlaps=${loadResult.total_mega_slaps}`);

    returnnewResponse(JSON.stringify({

    state_found:true,

    player_state:{

    current_girth: loadResult.current_girth ||0,

    total_mega_slaps: loadResult.total_mega_slaps ||0,

    total_giga_slaps: loadResult.total_giga_slaps ||0,

    current_giga_slap_streak: loadResult.current_giga_slap_streak ||0,

    iron_grip_lvl1_purchased: loadResult.iron_grip_lvl1_purchased ||false,

    session_start_time: loadResult.session_start_time,

    session_total_taps: loadResult.session_total_taps

    },

    player_identifier,

    is_anonymous,

    last_updated: loadResult.last_updated

    }),{

    status:200,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }else{

    returnnewResponse(JSON.stringify({

    error:'Invalid action. Must be "load" or "save"'

    }),{

    status:400,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

  }catch(error){

    console.error('❌ [STATE-MANAGER] Unexpected error:', error);

    returnnewResponse(JSON.stringify({

    error:'Internal server error',

    details: error.message

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

  }

});

## migrate-player-state/index.ts

import{ serve }from"https://deno.land/std@0.168.0/http/server.ts";

import{ createClient }from'https://esm.sh/@supabase/supabase-js@2';

constGIRTH_EXCHANGE_RATE=0.000075;

// Inline CORS headers to avoid cross-folder import issues in deployment bundle

const corsHeaders ={

  'Access-Control-Allow-Origin':'*',

  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',

  'Access-Control-Allow-Methods':'POST, GET, OPTIONS, PUT, DELETE'

};

serve(async(req)=>{

  // Handle CORS preflight requests

  if(req.method ==='OPTIONS'){

    returnnewResponse('ok',{

    headers: corsHeaders

    });

  }

  try{

    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')??'',Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??'');

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

    const{ anonymous_session_id, wallet_address }=await req.json();

    if(!anonymous_session_id ||!wallet_address){

    returnnewResponse(JSON.stringify({

    error:'Missing required fields: anonymous_session_id and wallet_address'

    }),{

    status:400,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    console.log(`🔄 [MIGRATE] Received state migration request for session: ${anonymous_session_id} to wallet: ${wallet_address}`);

    // Step 1: Get the authenticated user's profile

    const{ data: userProfile, error: profileError }=await supabaseAdmin.from('user_profiles').select('id').eq('wallet_address', wallet_address).single();

    if(profileError ||!userProfile){

    console.error(`❌ [MIGRATE] Could not find user profile for wallet: ${wallet_address}`, profileError);

    returnnewResponse(JSON.stringify({

    error:'Authenticated user profile not found.'

    }),{

    status:404,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    console.log(`✅ [MIGRATE] Found user profile ID: ${userProfile.id}`);

    // Step 2: Find the anonymous player state

    const{ data: anonymousState, error: stateError }=await supabaseAdmin.from('player_states').select('*').eq('session_id', anonymous_session_id).eq('is_anonymous',true).single();

    if(stateError){

    // It's possible the state was already claimed or never existed.

    if(stateError.code ==='PGRST116'){

    console.warn(`⚠️ [MIGRATE] No unclaimed anonymous state found for session: ${anonymous_session_id}`);

    returnnewResponse(JSON.stringify({

    success:true,

    migrated:false,

    message:'No unclaimed anonymous state found for the given session.'

    }),{

    status:200,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    console.error(`❌ [MIGRATE] Error fetching anonymous state:`, stateError);

    thrownewError('Failed to fetch anonymous player state.');

    }

    if(!anonymousState){

    console.warn(`⚠️ [MIGRATE] No anonymous state record found for session: ${anonymous_session_id}`);

    returnnewResponse(JSON.stringify({

    success:true,

    migrated:false,

    message:'No anonymous state record found for the given session.'

    }),{

    status:200,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

    }

    console.log(`Found anonymous state to migrate with girth: ${anonymousState.current_girth}`);

    // Step 3: Update the player_states record to link it to the authenticated user

    const{ error: migrationError }=await supabaseAdmin.from('player_states').update({

    user_profile_id: userProfile.id,

    player_address: wallet_address,

    is_anonymous:false,

    migration_status:'claimed',

    claimed_at:newDate().toISOString(),

    last_sync_at:newDate().toISOString()

    }).eq('id', anonymousState.id);

    if(migrationError){

    console.error(`❌ [MIGRATE] Failed to update player_states record:`, migrationError);

    thrownewError('Failed to link anonymous state to user profile.');

    }

    // Step 4: Add the migrated girth to the user's girth_balances

    if(anonymousState.current_girth >0){

    const girthToAdd = anonymousState.current_girth *GIRTH_EXCHANGE_RATE;

    console.log(`💰 [MIGRATE] Adding ${girthToAdd.toFixed(6)} soft girth to balance for user ${userProfile.id}`);

    // Fetch the current balance to ensure safe, atomic update

    const{ data: balanceRow, error: fetchBalanceError }=await supabaseAdmin.from("girth_balances").select("soft_balance, lifetime_earned").eq("user_profile_id", userProfile.id).single();

    if(fetchBalanceError && fetchBalanceError.code !=='PGRST116'){

    // Log the error but don't fail the entire migration, as state is already linked

    console.error(`⚠️ [MIGRATE] Could not fetch existing balance for user ${userProfile.id}:`, fetchBalanceError);

    }else{

    const currentSoftBalance = balanceRow?.soft_balance ? parseFloat(balanceRow.soft_balance):0;

    const currentLifetimeEarned = balanceRow?.lifetime_earned ? parseFloat(balanceRow.lifetime_earned):0;

    const newSoftBalance = currentSoftBalance + girthToAdd;

    const newLifetimeEarned = currentLifetimeEarned + girthToAdd;

    const{ error: balanceError }=await supabaseAdmin.from("girth_balances").upsert({

    user_profile_id: userProfile.id,

    soft_balance: newSoftBalance,

    lifetime_earned: newLifetimeEarned,

    updated_at:newDate().toISOString()

    },{

    onConflict:"user_profile_id"

    });

    if(balanceError){

    // This is non-fatal; the state is linked, but balance needs a retry or manual fix.

    console.error(`⚠️ [MIGRATE] Failed to upsert girth balance for user ${userProfile.id}:`, balanceError);

    }

    }

    }

    console.log(`✅ [MIGRATE] Successfully migrated state for wallet ${wallet_address}`);

    const responsePayload ={

    success:true,

    migrated:true,

    message:'Anonymous state successfully migrated.',

    claimed_girth: anonymousState.current_girth ||0,

    claimed_taps: anonymousState.session_total_taps ||0,

    claimed_mega_slaps: anonymousState.total_mega_slaps ||0,

    claimed_giga_slaps: anonymousState.total_giga_slaps ||0

    };

    returnnewResponse(JSON.stringify(responsePayload),{

    status:200,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

  }catch(error){

    console.error('❌ [MIGRATE] Unexpected error:', error);

    returnnewResponse(JSON.stringify({

    error:'Internal server error during state migration',

    details: error.message

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    'Content-Type':'application/json'

    }

    });

  }

});

## update-balance/index.ts

import"jsr:@supabase/functions-js/edge-runtime.d.ts";

import{ createClient }from"npm:@supabase/supabase-js@2";

// Define CORS headers

const corsHeaders ={

  "Access-Control-Allow-Origin":"*",

  "Access-Control-Allow-Methods":"POST, OPTIONS",

  "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"

};

Deno.serve(async(req)=>{

  // Handle CORS preflight requests

  if(req.method ==="OPTIONS"){

    returnnewResponse("ok",{

    headers: corsHeaders

    });

  }

  try{

    // Initialize Supabase client with service role key to bypass RLS

    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")??"",Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"",{

    auth:{

    autoRefreshToken:false,

    persistSession:false

    }

    });

    const{ wallet_address, soft_balance, lifetime_earned }=await req.json();

    if(!wallet_address){

    returnnewResponse(JSON.stringify({

    error:"Wallet address is required"

    }),{

    status:400,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

    }

    console.log(`🔄 [UPDATE-BALANCE] Processing request for wallet: ${wallet_address}`);

    // 1. Get or create user profile

    let userProfileId =null;

    // First check if profile exists

    const{ data: existingProfile, error: profileError }=await supabaseAdmin.from("user_profiles").select("id").eq("wallet_address", wallet_address).single();

    if(profileError){

    if(profileError.code ==="PGRST116"){

    console.log(`🆕 [UPDATE-BALANCE] Creating new user profile for wallet: ${wallet_address}`);

    // Create new profile

    const{ data: newProfile, error: createError }=await supabaseAdmin.from("user_profiles").insert({

    wallet_address,

    last_login_at:newDate().toISOString(),

    total_sessions:1,

    oracle_relationship:"novice",

    profile_completion:20

    }).select("id").single();

    if(createError){

    console.error(`❌ [UPDATE-BALANCE] Failed to create user profile:`, createError);

    returnnewResponse(JSON.stringify({

    error:"Failed to create user profile",

    details: createError.message

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

    }

    userProfileId = newProfile.id;

    console.log(`✅ [UPDATE-BALANCE] Created user profile with ID: ${userProfileId}`);

    }else{

    console.error(`❌ [UPDATE-BALANCE] Error looking up user profile:`, profileError);

    returnnewResponse(JSON.stringify({

    error:"Failed to lookup user profile",

    details: profileError.message

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

    }

    }else{

    userProfileId = existingProfile.id;

    console.log(`✅ [UPDATE-BALANCE] Found existing user profile with ID: ${userProfileId}`);

    }

    // 2. Update or create girth balance

    const{ data: existingBalance, error: balanceError }=await supabaseAdmin.from("girth_balances").select("id, soft_balance, lifetime_earned").eq("user_profile_id", userProfileId).single();

    if(balanceError && balanceError.code !=="PGRST116"){

    console.error(`❌ [UPDATE-BALANCE] Error looking up girth balance:`, balanceError);

    returnnewResponse(JSON.stringify({

    error:"Failed to lookup girth balance",

    details: balanceError.message

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

    }

    let balanceData;

    if(!existingBalance){

    // Create new balance record

    const{ data: newBalance, error: createBalanceError }=await supabaseAdmin.from("girth_balances").insert({

    user_profile_id: userProfileId,

    soft_balance: soft_balance ||0,

    hard_balance:0,

    lifetime_earned: lifetime_earned || soft_balance ||0,

    lifetime_minted:0,

    updated_at:newDate().toISOString()

    }).select("*").single();

    if(createBalanceError){

    console.error(`❌ [UPDATE-BALANCE] Failed to create girth balance:`, createBalanceError);

    returnnewResponse(JSON.stringify({

    error:"Failed to create girth balance",

    details: createBalanceError.message

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

    }

    balanceData = newBalance;

    console.log(`✅ [UPDATE-BALANCE] Created new girth balance record`);

    }else{

    // Update existing balance if values provided

    if(soft_balance !==undefined|| lifetime_earned !==undefined){

    const updates ={

    updated_at:newDate().toISOString()

    };

    if(soft_balance !==undefined){

    updates.soft_balance = soft_balance;

    }

    if(lifetime_earned !==undefined){

    updates.lifetime_earned = lifetime_earned;

    }

    const{ data: updatedBalance, error: updateError }=await supabaseAdmin.from("girth_balances").update(updates).eq("id", existingBalance.id).select("*").single();

    if(updateError){

    console.error(`❌ [UPDATE-BALANCE] Failed to update girth balance:`, updateError);

    returnnewResponse(JSON.stringify({

    error:"Failed to update girth balance",

    details: updateError.message

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

    }

    balanceData = updatedBalance;

    console.log(`✅ [UPDATE-BALANCE] Updated existing girth balance`);

    }else{

    // No update needed, just return existing data

    balanceData = existingBalance;

    console.log(`ℹ️ [UPDATE-BALANCE] No balance update needed, returning existing data`);

    }

    }

    // 3. Return the balance data

    returnnewResponse(JSON.stringify({

    success:true,

    user_profile_id: userProfileId,

    wallet_address,

    balance:{

    soft_balance: parseFloat(balanceData.soft_balance)||0,

    hard_balance: parseFloat(balanceData.hard_balance)||0,

    lifetime_earned: parseFloat(balanceData.lifetime_earned)||0,

    lifetime_minted: parseFloat(balanceData.lifetime_minted)||0,

    last_mint_at: balanceData.last_mint_at

    },

    updated_at:newDate().toISOString()

    }),{

    status:200,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }catch(error){

    console.error("❌ [UPDATE-BALANCE] Unexpected error:", error);

    returnnewResponse(JSON.stringify({

    error:"Internal server error",

    details: error.message

    }),{

    status:500,

    headers:{

    ...corsHeaders,

    "Content-Type":"application/json"

    }

    });

  }

});

## oracle-vote/index.ts

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

## oracle-polls-list/index.ts

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
