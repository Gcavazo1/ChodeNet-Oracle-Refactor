import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: cors
    });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({
      error: "Method not allowed"
    }), {
      status: 405,
      headers: {
        ...cors,
        "Content-Type": "application/json"
      }
    });
  }
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
    const { lore_entry_id, story_text } = await req.json();
    if (!lore_entry_id || !story_text) {
      return new Response(JSON.stringify({
        error: "lore_entry_id and story_text required"
      }), {
        status: 400,
        headers: {
          ...cors,
          "Content-Type": "application/json"
        }
      });
    }
    console.log(`🎵 Starting TTS generation for lore entry: ${lore_entry_id}`);
    // Get ElevenLabs credentials from environment
    const elevenlabsApiKey = Deno.env.get("ELEVENLABS_API_KEY");
    const elevenlabsVoiceId = Deno.env.get("ELEVENLABS_VOICE_ID");
    if (!elevenlabsApiKey) {
      console.log("🎵 ELEVENLABS_API_KEY not configured, skipping audio generation");
      await supabase.from("chode_lore_entries").update({
        audio_generation_status: "skipped"
      }).eq("id", lore_entry_id);
      return new Response(JSON.stringify({
        success: true,
        message: "Audio generation skipped (no API key)",
        audio_url: null
      }), {
        status: 200,
        headers: {
          ...cors,
          "Content-Type": "application/json"
        }
      });
    }
    if (!elevenlabsVoiceId) {
      throw new Error('ELEVENLABS_VOICE_ID not configured');
    }
    // Update status to indicate TTS is in progress
    await supabase.from('chode_lore_entries').update({
      audio_generation_status: 'processing'
    }).eq('id', lore_entry_id);
    // Call ElevenLabs TTS API
    console.log('🎵 Calling ElevenLabs TTS API...');
    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenlabsVoiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenlabsApiKey
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
      const errorText = await ttsResponse.text();
      throw new Error(`ElevenLabs TTS API error: ${ttsResponse.status} ${ttsResponse.statusText} - ${errorText}`);
    }
    // Get the audio stream
    const audioArrayBuffer = await ttsResponse.arrayBuffer();
    const audioBytes = new Uint8Array(audioArrayBuffer);
    console.log(`🎵 Received audio data: ${audioBytes.length} bytes`);
    // Upload to Supabase Storage
    const fileName = `lore_${lore_entry_id}.mp3`;
    const bucketName = 'oracle-audio-reports';
    console.log(`🎵 Uploading to Supabase Storage: ${bucketName}/${fileName}`);
    const { data: uploadData, error: uploadError } = await supabase.storage.from(bucketName).upload(`public/lore/${fileName}`, audioBytes, {
      contentType: 'audio/mpeg',
      upsert: true
    });
    if (uploadError) {
      console.error('🎵 Upload error:', uploadError);
      throw new Error(`Failed to upload audio to storage: ${uploadError.message}`);
    }
    console.log('🎵 Upload successful:', uploadData);
    // Get the public URL
    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(`public/lore/${fileName}`);
    const publicUrl = urlData.publicUrl;
    console.log(`🎵 Audio available at: ${publicUrl}`);
    // Update the chode_lore_entries table with the audio URL
    const { error: updateError } = await supabase.from('chode_lore_entries').update({
      tts_audio_url: publicUrl,
      audio_generation_status: 'complete'
    }).eq('id', lore_entry_id);
    if (updateError) {
      throw new Error(`Failed to update lore entry with audio URL: ${updateError.message}`);
    }
    console.log(`✅ Successfully generated TTS for lore entry: ${lore_entry_id}`);
    return new Response(JSON.stringify({
      success: true,
      message: 'TTS generation completed successfully',
      lore_entry_id: lore_entry_id,
      audio_url: publicUrl,
      audio_size_bytes: audioBytes.length
    }), {
      headers: {
        ...cors,
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    console.error('❌ Error in generate-lore-audio:', error);
    // Try to update the lore entry status to failed
    try {
      const requestBody = await req.clone().json();
      if (requestBody.lore_entry_id) {
        const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
        await supabase.from('chode_lore_entries').update({
          audio_generation_status: 'failed'
        }).eq('id', requestBody.lore_entry_id);
        console.log(`🎵 Updated lore entry ${requestBody.lore_entry_id} status to failed`);
      }
    } catch (updateError) {
      console.error('❌ Failed to update lore entry status to failed:', updateError);
    }
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      error_type: error.name || 'UnknownError'
    }), {
      headers: {
        ...cors,
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
});
