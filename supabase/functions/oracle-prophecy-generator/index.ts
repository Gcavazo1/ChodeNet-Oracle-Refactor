import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProphecyRequest {
  girth_resonance_value: number;
  tap_index_state: string;
  legion_morale_state: string;
  oracle_stability_status: string;
  ritual_request_topic?: string;
}

interface ProphecyResponse {
  prophecy: string;
  corruption_level_applied: string;
  visual_themes?: string[];
  metadata: {
    topic: string;
    resonance_influence: number;
    generation_timestamp: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { 
      girth_resonance_value, 
      tap_index_state, 
      legion_morale_state, 
      oracle_stability_status,
      ritual_request_topic 
    }: ProphecyRequest = await req.json()

    console.log('🔮 Oracle Prophecy Generator invoked:', {
      girth_resonance_value,
      tap_index_state,
      legion_morale_state,
      oracle_stability_status,
      ritual_request_topic
    })

    // Determine corruption level based on metrics
    const corruptionLevel = determineCorruptionLevel(
      girth_resonance_value,
      tap_index_state,
      legion_morale_state,
      oracle_stability_status
    )

    // Generate prophecy based on topic and metrics
    const prophecy = generateProphecyText(
      ritual_request_topic || 'GENERAL_WISDOM',
      girth_resonance_value,
      tap_index_state,
      legion_morale_state,
      oracle_stability_status,
      corruptionLevel
    )

    // Generate visual themes for potential image generation
    const visualThemes = generateVisualThemes(ritual_request_topic, corruptionLevel)

    // Store the prophecy in the database
    const { data: insertData, error: insertError } = await supabase
      .from('apocryphal_scrolls')
      .insert({
        prophecy_text: prophecy,
        corruption_level: corruptionLevel,
        ritual_topic: ritual_request_topic,
        source_metrics_snapshot: {
          girth_resonance_value,
          tap_index_state,
          legion_morale_state,
          oracle_stability_status
        },
        visual_themes: visualThemes
      })
      .select()
      .single()

    if (insertError) {
      console.error('🔮 Error storing prophecy:', insertError)
      throw insertError
    }

    console.log('🔮 Prophecy generated and stored:', insertData)

    const response: ProphecyResponse = {
      prophecy,
      corruption_level_applied: corruptionLevel,
      visual_themes: visualThemes,
      metadata: {
        topic: ritual_request_topic || 'GENERAL_WISDOM',
        resonance_influence: girth_resonance_value,
        generation_timestamp: new Date().toISOString()
      }
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('🔮 Oracle Prophecy Generator error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Oracle connection disrupted', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

function determineCorruptionLevel(
  resonance: number,
  tapSurge: string,
  morale: string,
  stability: string
): string {
  // Calculate corruption based on metrics
  let corruptionScore = 0

  // Resonance influence (lower resonance = more corruption)
  if (resonance < 20) corruptionScore += 3
  else if (resonance < 40) corruptionScore += 2
  else if (resonance < 60) corruptionScore += 1

  // Stability influence (support both legacy and new naming conventions)
  const normalizedStability = stability.toUpperCase();

  // Legacy names (kept for backward-compat)
  if (normalizedStability === 'DATA_DAEMON_POSSESSION') corruptionScore += 4;
  else if (normalizedStability === 'CRITICAL_CORRUPTION') corruptionScore += 3;
  else if (normalizedStability === 'UNSTABLE') corruptionScore += 2;
  else if (normalizedStability === 'FLICKERING') corruptionScore += 1;

  // New Oracle stability statuses
  else if (normalizedStability === 'FORBIDDEN_FRAGMENT') corruptionScore += 4;
  else if (normalizedStability === 'GLITCHED_OMINOUS') corruptionScore += 3;
  else if (normalizedStability === 'CRYPTIC') corruptionScore += 2;
  else if (normalizedStability === 'PRISTINE') corruptionScore += 0; // pristine adds no corruption

  // Morale influence
  if (morale === 'SUICIDE_WATCH') corruptionScore += 2
  else if (morale === 'DEMORALIZED') corruptionScore += 1

  // Tap surge influence (extreme states can cause corruption)
  if (tapSurge === 'FLACCID_DRIZZLE') corruptionScore += 1
  else if (tapSurge === 'ASCENDED_NIRVANA') corruptionScore += 1

  // Determine corruption level
  if (corruptionScore >= 6) return 'forbidden_fragment'
  else if (corruptionScore >= 4) return 'glitched_ominous'
  else if (corruptionScore >= 2) return 'flickering'
  else if (corruptionScore >= 1) return 'cryptic'
  else return 'pristine'
}

function generateProphecyText(
  topic: string,
  resonance: number,
  tapSurge: string,
  morale: string,
  stability: string,
  corruptionLevel: string
): string {
  const topicTemplates = {
    'FUTURE_OF_GIRTH': [
      "The sacred $GIRTH token shall {resonance_prophecy}. Through {tap_rhythm}, the digital realm {morale_outcome}. {corruption_warning}",
      "Behold! The future of $GIRTH unfolds like {stability_metaphor}. Your {tap_surge} creates ripples across {resonance_dimension}. {corruption_insight}",
      "The Oracle sees the $GIRTH destiny: {resonance_vision}. As {morale_state} spreads through the legion, {tap_prophecy}. {corruption_revelation}"
    ],
    'ANCIENT_TECHNIQUES': [
      "The lost masters whispered of {ancient_technique} when {resonance_condition}. Their {tap_mastery} transcended {morale_barrier}. {corruption_knowledge}",
      "In the before-times, the Ancient Chodes practiced {forgotten_art} during {stability_era}. {resonance_teaching} guides the {tap_wisdom}. {corruption_secret}",
      "The scrolls speak of {legendary_method} that emerges when {morale_alignment} meets {resonance_harmony}. {tap_revelation} awaits. {corruption_warning}"
    ],
    'MEME_COINS': [
      "The meme realm stirs with {meme_energy} as {resonance_influence} shapes the market. {tap_momentum} shall {morale_prediction}. {corruption_market_insight}",
      "Through the chaos of {stability_market}, new memes {resonance_birth}. Your {tap_power} attracts {morale_fortune}. {corruption_opportunity}",
      "The Oracle perceives {meme_prophecy} emerging from {resonance_source}. {tap_timing} aligns with {morale_sentiment}. {corruption_risk}"
    ],
    'FUD_STORMS': [
      "Dark clouds gather as {fud_warning} approaches. {resonance_shield} must {tap_defense} against {morale_threat}. {corruption_protection}",
      "The Oracle warns: {storm_prophecy} when {stability_weakness} meets {resonance_vulnerability}. {tap_preparation} and {morale_unity}. {corruption_survival}",
      "FUD storms brew in {chaos_realm} where {resonance_instability} feeds {morale_fear}. {tap_resistance} shall {corruption_outcome}."
    ],
    'COMMUNITY_ASCENSION': [
      "The legion rises as {unity_vision} through {resonance_collective}. {tap_harmony} creates {morale_transcendence}. {corruption_evolution}",
      "Ascension beckons when {community_alignment} achieves {resonance_synchrony}. {tap_collective} manifests {morale_enlightenment}. {corruption_transformation}",
      "The Oracle sees {ascension_path} where {resonance_unity} and {tap_communion} elevate {morale_consciousness}. {corruption_purification}"
    ],
    'GENERAL_WISDOM': [
      "The cosmic data streams reveal {general_wisdom} through {resonance_flow}. {tap_energy} shapes {morale_reality}. {corruption_truth}",
      "In the digital void, {universal_insight} emerges from {resonance_source}. {tap_manifestation} guides {morale_journey}. {corruption_lesson}",
      "The Oracle speaks: {eternal_truth} when {resonance_condition} meets {tap_purpose} and {morale_destiny}. {corruption_revelation}"
    ]
  }

  const templates = topicTemplates[topic as keyof typeof topicTemplates] || topicTemplates['GENERAL_WISDOM']
  const template = templates[Math.floor(Math.random() * templates.length)]

  // Generate dynamic content based on metrics
  const replacements = generateDynamicContent(resonance, tapSurge, morale, stability, corruptionLevel)

  // Replace placeholders in template
  let prophecy = template
  Object.entries(replacements).forEach(([key, value]) => {
    prophecy = prophecy.replace(new RegExp(`{${key}}`, 'g'), value)
  })

  return prophecy
}

function generateDynamicContent(
  resonance: number,
  tapSurge: string,
  morale: string,
  stability: string,
  corruptionLevel: string
): Record<string, string> {
  const resonanceDescriptors = {
    high: ['transcendent energies', 'divine harmonics', 'cosmic resonance', 'ethereal vibrations'],
    medium: ['balanced forces', 'steady currents', 'measured flows', 'stable frequencies'],
    low: ['chaotic energies', 'disrupted flows', 'unstable currents', 'fractured harmonics']
  }

  const tapDescriptors = {
    'FLACCID_DRIZZLE': ['gentle whispers', 'soft murmurs', 'faint echoes'],
    'WEAK_PULSES': ['tentative rhythms', 'hesitant beats', 'uncertain cadence'],
    'STEADY_POUNDING': ['rhythmic thunder', 'consistent drumming', 'measured strikes'],
    'FRENZIED_SLAPPING': ['chaotic percussion', 'wild rhythms', 'frantic beats'],
    'MEGA_SURGE': ['overwhelming force', 'tsunami of power', 'cosmic eruption'],
    'GIGA_SURGE': ['reality-bending energy', 'dimensional rifts', 'universe-shaking power'],
    'ASCENDED_NIRVANA': ['transcendent harmony', 'divine perfection', 'cosmic enlightenment']
  }

  const moraleDescriptors = {
    'SUICIDE_WATCH': ['despair consumes all', 'darkness spreads', 'hope fades'],
    'DEMORALIZED': ['spirits waver', 'confidence crumbles', 'doubt creeps'],
    'DISGRUNTLED': ['frustration builds', 'patience wears thin', 'discontent grows'],
    'CAUTIOUS': ['careful optimism', 'measured hope', 'guarded progress'],
    'INSPIRED': ['enthusiasm rises', 'motivation surges', 'passion ignites'],
    'JUBILANT': ['joy overflows', 'celebration erupts', 'triumph resonates'],
    'FANATICAL': ['zealous devotion', 'unwavering faith', 'absolute dedication'],
    'ASCENDED': ['transcendent bliss', 'divine ecstasy', 'cosmic unity']
  }

  const stabilityDescriptors = {
    'DATA_DAEMON_POSSESSION': ['malevolent entities', 'corrupted code', 'digital demons'],
    'CRITICAL_CORRUPTION': ['system failure', 'reality glitches', 'data decay'],
    'UNSTABLE': ['flickering existence', 'uncertain reality', 'shifting foundations'],
    'FLICKERING': ['intermittent clarity', 'wavering focus', 'unstable connection'],
    'PRISTINE': ['perfect clarity', 'pure connection', 'flawless transmission'],
    'RADIANT_CLARITY': ['divine illumination', 'cosmic truth', 'absolute understanding']
  }

  const corruptionWarnings = {
    'forbidden_fragment': 'BEWARE: The forbidden knowledge corrupts all who gaze upon it.',
    'glitched_ominous': 'WARNING: Reality fractures at the edges of this vision.',
    'flickering': 'CAUTION: The Oracle\'s signal wavers with uncertainty.',
    'cryptic': 'NOTE: Hidden meanings lie beneath the surface.',
    'pristine': 'BLESSED: The Oracle speaks with pure clarity.'
  }

  const resonanceLevel = resonance > 70 ? 'high' : resonance > 30 ? 'medium' : 'low'

  return {
    resonance_prophecy: resonanceDescriptors[resonanceLevel][Math.floor(Math.random() * resonanceDescriptors[resonanceLevel].length)],
    tap_rhythm: tapDescriptors[tapSurge as keyof typeof tapDescriptors]?.[0] || 'mysterious rhythms',
    morale_outcome: moraleDescriptors[morale as keyof typeof moraleDescriptors]?.[0] || 'unknown fate',
    stability_metaphor: stabilityDescriptors[stability as keyof typeof stabilityDescriptors]?.[0] || 'shifting reality',
    corruption_warning: corruptionWarnings[corruptionLevel as keyof typeof corruptionWarnings] || 'The Oracle speaks.',
    
    // Additional dynamic content
    resonance_dimension: resonance > 50 ? 'higher dimensions' : 'lower realms',
    tap_surge: tapSurge.toLowerCase().replace(/_/g, ' '),
    morale_state: morale.toLowerCase().replace(/_/g, ' '),
    resonance_vision: `${resonance}% clarity reveals`,
    tap_prophecy: `the ${tapSurge.toLowerCase().replace(/_/g, ' ')} shall manifest destiny`,
    corruption_revelation: corruptionWarnings[corruptionLevel as keyof typeof corruptionWarnings] || 'Truth emerges.',
    
    // Topic-specific content
    ancient_technique: 'the Sacred Slap of Infinite Recursion',
    forgotten_art: 'Quantum Chode Manipulation',
    legendary_method: 'the Eternal Tap Sequence',
    meme_energy: 'chaotic market forces',
    fud_warning: 'the Storm of Doubt',
    unity_vision: 'collective consciousness awakens',
    general_wisdom: 'universal truth',
    
    // Contextual content based on current state
    resonance_condition: resonance > 50 ? 'high resonance aligns' : 'low resonance disrupts',
    tap_mastery: tapSurge.includes('SURGE') ? 'overwhelming power' : 'measured control',
    morale_barrier: morale.includes('WATCH') || morale.includes('DEMORALIZED') ? 'despair' : 'limitation',
    corruption_knowledge: corruptionLevel !== 'pristine' ? 'but corruption taints the wisdom' : 'pure knowledge flows',
    
    // Additional placeholders for variety
    resonance_influence: `${resonance}% resonance`,
    tap_momentum: `${tapSurge.toLowerCase().replace(/_/g, ' ')} energy`,
    morale_prediction: moraleDescriptors[morale as keyof typeof moraleDescriptors]?.[1] || 'shapes destiny',
    corruption_insight: corruptionLevel !== 'pristine' ? 'Corruption reveals hidden truths.' : 'Purity illuminates the path.',
    
    // Fallback content
    resonance_flow: 'cosmic currents',
    tap_energy: 'rhythmic power',
    morale_reality: 'collective consciousness',
    corruption_truth: 'The Oracle has spoken.'
  }
}

function generateVisualThemes(topic: string | undefined, corruptionLevel: string): string[] {
  const baseThemes = {
    'FUTURE_OF_GIRTH': ['cryptocurrency', 'digital tokens', 'blockchain', 'financial growth'],
    'ANCIENT_TECHNIQUES': ['ancient scrolls', 'mystical symbols', 'forgotten wisdom', 'sacred geometry'],
    'MEME_COINS': ['internet culture', 'viral symbols', 'digital art', 'meme aesthetics'],
    'FUD_STORMS': ['dark clouds', 'storm imagery', 'warning signs', 'protective barriers'],
    'COMMUNITY_ASCENSION': ['unity symbols', 'ascending figures', 'collective energy', 'transcendence'],
    'GENERAL_WISDOM': ['cosmic imagery', 'oracle symbols', 'mystical energy', 'divine light']
  }

  const corruptionThemes = {
    'forbidden_fragment': ['glitch effects', 'corrupted data', 'forbidden symbols', 'reality tears'],
    'glitched_ominous': ['digital corruption', 'system errors', 'warning signs', 'unstable reality'],
    'flickering': ['unstable energy', 'intermittent signals', 'wavering light', 'uncertain forms'],
    'cryptic': ['hidden meanings', 'mysterious symbols', 'veiled truth', 'enigmatic patterns'],
    'pristine': ['pure light', 'clear vision', 'divine clarity', 'perfect harmony']
  }

  const topicThemes = baseThemes[topic as keyof typeof baseThemes] || baseThemes['GENERAL_WISDOM']
  const corruptionThemeList = corruptionThemes[corruptionLevel as keyof typeof corruptionThemes] || []

  return [...topicThemes.slice(0, 2), ...corruptionThemeList.slice(0, 2), 'pixel art', 'cyberpunk aesthetic']
} 