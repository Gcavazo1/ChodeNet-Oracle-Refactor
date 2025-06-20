import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

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
    const requestBody = await req.json();
    const { lore_entry_id, story_text } = requestBody;
    
    if (!lore_entry_id || !story_text) {
      throw new Error('Missing required fields: lore_entry_id and story_text');
    }
    
    console.log(`Starting TTS generation for lore entry: ${lore_entry_id}`);

    // Get ElevenLabs credentials from environment
    const elevenLabsApiKey = Deno.env.get("ELEVENLABS_API_KEY");
    const voiceId = Deno.env.get("ELEVENLABS_VOICE_ID");

    if (!elevenLabsApiKey || !voiceId) {
      throw new Error('Missing ElevenLabs credentials');
    }

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

    if (existingEntry.tts_audio_url) {
      console.log(`Audio already exists for lore entry: ${lore_entry_id}`);
      return new Response(JSON.stringify({
        status: 'already_exists',
        message: 'Audio already generated for this lore entry',
        lore_entry_id: lore_entry_id,
        audio_url: existingEntry.tts_audio_url
      }), {
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    // Update status to indicate TTS is in progress
    await supabaseAdmin.from('chode_lore_entries').update({
      audio_generation_status: 'generating'
    }).eq('id', lore_entry_id);

    // Call ElevenLabs TTS API
    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text: story_text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.2,
          use_speaker_boost: true
        }
      })
    });

    if (!ttsResponse.ok) {
      throw new Error(`ElevenLabs API error: ${ttsResponse.status} ${ttsResponse.statusText}`);
    }

    const audioBytes = new Uint8Array(await ttsResponse.arrayBuffer());
    console.log(`Received audio data: ${audioBytes.length} bytes`);

    // Upload to Supabase Storage
    const fileName = `${lore_entry_id}.mp3`;
    const bucketName = 'oracle-audio-reports';

    console.log(`Uploading to Supabase Storage: ${bucketName}/${fileName}`);

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(`public/${fileName}`, audioBytes, {
        contentType: 'audio/mpeg',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Failed to upload to storage: ${uploadError.message}`);
    }

    console.log(`Upload successful: ${JSON.stringify(uploadData)}`);

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(`public/${fileName}`);
    
    const publicUrl = urlData.publicUrl;
    console.log(`Audio available at: ${publicUrl}`);

    // Update the chode_lore_entries table with the audio URL
    const { error: updateError } = await supabaseAdmin.from('chode_lore_entries').update({
      tts_audio_url: publicUrl,
      audio_generation_status: 'complete'
    }).eq('id', lore_entry_id);

    if (updateError) {
      console.error('Failed to update lore entry status:', updateError);
      throw new Error(`Failed to update lore entry with audio URL: ${updateError.message}`);
    }

    console.log(`Successfully generated TTS for lore entry: ${lore_entry_id}`);
    return new Response(JSON.stringify({
      status: 'success',
      message: 'TTS generation completed successfully',
      lore_entry_id: lore_entry_id,
      audio_url: publicUrl,
      audio_size_bytes: audioBytes.length
    }), {
      headers: { ...cors, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Error in elevenlabs-tts-generator:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      status: 'error'
    }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" }
    });
  }
});
