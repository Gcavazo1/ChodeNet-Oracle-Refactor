import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

async function generateGoogleTTS(text: string) {
  const googleCredentials = Deno.env.get("GOOGLE_APPLICATION_CREDENTIALS");
  if (!googleCredentials) {
    throw new Error('Missing Google Cloud credentials');
  }

  // Parse service account JSON
  const credentials = JSON.parse(googleCredentials);

  // Create JWT header
  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: credentials.private_key_id
  };

  // Create JWT claim set
  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  // Encode JWT parts
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedClaimSet = btoa(JSON.stringify(claimSet));

  // Create JWT signature input
  const signatureInput = `${encodedHeader}.${encodedClaimSet}`;

  // Convert PEM key to binary
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = credentials.private_key
    .replace(pemHeader, '')
    .replace(pemFooter, '')
    .replace(/\s/g, '');
  
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  // Import private key
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(signatureInput)
  );

  // Create final JWT
  const jwt = `${signatureInput}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`;

  // Get access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(`Failed to get Google Cloud access token: ${errorText}`);
  }

  const { access_token } = await tokenResponse.json();

  // Make TTS API request
  const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: 'en-US',
        name: 'en-US-Neural2-F',
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        pitch: -2,
        speakingRate: 0.9
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Cloud TTS API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const { audioContent } = await response.json();
  return Uint8Array.from(atob(audioContent), c => c.charCodeAt(0));
}

async function generateElevenLabsTTS(text: string, voiceId: string, apiKey: string) {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.2,
        use_speaker_boost: true
      }
    })
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('ELEVENLABS_QUOTA_EXCEEDED');
    }
    throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }
  
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" }
    });
  }

  try {
    // Parse request body
    const { lore_entry_id, story_text } = await req.json();
    if (!lore_entry_id || !story_text) {
      throw new Error('Missing required fields: lore_entry_id and story_text');
    }

    console.log(`Starting TTS generation for lore entry: ${lore_entry_id}`);
    
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if audio already exists
    const { data: existingEntry, error: checkError } = await supabaseAdmin
      .from('chode_lore_entries')
      .select('tts_audio_url, audio_generation_status')
      .eq('id', lore_entry_id)
      .single();

    if (checkError) {
      throw new Error(`Failed to check existing entry: ${checkError.message}`);
    }

    if (existingEntry?.tts_audio_url) {
      return new Response(JSON.stringify({
        status: 'already_exists',
        message: 'Audio already generated for this lore entry',
        lore_entry_id,
        audio_url: existingEntry.tts_audio_url
      }), {
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    // Update status to indicate TTS is in progress
    await supabaseAdmin
      .from('chode_lore_entries')
      .update({ audio_generation_status: 'generating' })
      .eq('id', lore_entry_id);

    let audioBytes: Uint8Array;
    let provider = 'elevenlabs';

    try {
      // Try ElevenLabs first
      const elevenLabsApiKey = Deno.env.get("ELEVENLABS_API_KEY");
      const voiceId = Deno.env.get("ELEVENLABS_VOICE_ID");
      
      if (!elevenLabsApiKey || !voiceId) {
        throw new Error('Missing ElevenLabs credentials');
      }

      audioBytes = await generateElevenLabsTTS(story_text, voiceId, elevenLabsApiKey);
      console.log('Successfully generated audio with ElevenLabs');
    } catch (error) {
      if (error.message === 'ELEVENLABS_QUOTA_EXCEEDED') {
        console.log('ElevenLabs quota exceeded, falling back to Google Cloud TTS');
        try {
          audioBytes = await generateGoogleTTS(story_text);
          provider = 'google';
          console.log('Successfully generated audio with Google Cloud TTS');
        } catch (googleError) {
          console.error('Google Cloud TTS fallback also failed:', googleError);
          throw googleError;
        }
      } else {
        throw error;
      }
    }

    console.log(`Received audio data: ${audioBytes.length} bytes from ${provider}`);

    // Upload to Supabase Storage
    const fileName = `${lore_entry_id}.mp3`;
    const bucketName = 'oracle-audio-reports';
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from(bucketName)
      .upload(`public/${fileName}`, audioBytes, {
        contentType: 'audio/mpeg',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Failed to upload to storage: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin
      .storage
      .from(bucketName)
      .getPublicUrl(`public/${fileName}`);

    const publicUrl = urlData.publicUrl;
    console.log(`Audio available at: ${publicUrl}`);

    // Update the chode_lore_entries table with the audio URL
    const { error: updateError } = await supabaseAdmin
      .from('chode_lore_entries')
      .update({
        tts_audio_url: publicUrl,
        audio_generation_status: 'complete',
        tts_provider: provider
      })
      .eq('id', lore_entry_id);

    if (updateError) {
      throw new Error(`Failed to update lore entry with audio URL: ${updateError.message}`);
    }

    console.log(`✅ Successfully generated TTS for lore entry: ${lore_entry_id}`);

    return new Response(JSON.stringify({
      status: 'success',
      message: 'TTS generation completed successfully',
      lore_entry_id,
      audio_url: publicUrl,
      audio_size_bytes: audioBytes.length,
      provider
    }), {
      headers: { ...cors, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Error in tts-generator:', error);
    
    // Update status to failed
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    
    try {
      await supabaseAdmin
        .from('chode_lore_entries')
        .update({
          audio_generation_status: 'failed',
          audio_generation_error: error.message
        })
        .eq('id', lore_entry_id);
    } catch (updateError) {
      console.error('Failed to update error status:', updateError);
    }

    return new Response(JSON.stringify({
      error: error.message,
      status: 'error'
    }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" }
    });
  }
});
