import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const { wallet_address, updates } = await req.json();
    if (!wallet_address) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Wallet address is required'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }
    // Convert camelCase frontend fields to snake_case database fields
    const dbUpdates = {};
    if (updates.displayName !== undefined) {
      dbUpdates.display_name = updates.displayName;
    }
    if (updates.username !== undefined) {
      dbUpdates.username = updates.username;
    }
    if (updates.bio !== undefined) {
      dbUpdates.bio = updates.bio;
    }
    if (updates.avatarUrl !== undefined) {
      dbUpdates.avatar_url = updates.avatarUrl;
    }
    if (updates.socialLinks !== undefined) {
      dbUpdates.social_links = updates.socialLinks;
    }
    // Add updated_at timestamp
    dbUpdates.updated_at = new Date().toISOString();
    console.log('Updating profile for wallet:', wallet_address);
    console.log('Database updates:', dbUpdates);
    // Update the user profile
    const { data: updatedProfile, error: updateError } = await supabaseAdmin.from('user_profiles').update(dbUpdates).eq('wallet_address', wallet_address).select().single();
    if (updateError) {
      console.error('Error updating profile:', updateError);
      return new Response(JSON.stringify({
        success: false,
        error: updateError.message
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }
    if (!updatedProfile) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Profile not found'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 404
      });
    }
    console.log('Profile updated successfully:', updatedProfile);
    return new Response(JSON.stringify({
      success: true,
      profile: updatedProfile,
      message: 'Profile updated successfully'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in update-user-profile:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
