import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { PublicKey } from 'https://esm.sh/@solana/web3.js@1.95.2';
import nacl from 'https://esm.sh/tweetnacl@1.0.3';
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    console.log('🔐 SIWS Verification Request received');
    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    if (req.method !== 'POST') {
      console.log('❌ Method not allowed:', req.method);
      return new Response(JSON.stringify({
        error: 'Method not allowed'
      }), {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error('❌ Invalid JSON in request body:', error);
      return new Response(JSON.stringify({
        error: 'Invalid JSON in request body'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const { message, signature, wallet_address, user_agent, session_metadata } = requestBody;
    // Validate required fields
    if (!message || !signature || !wallet_address) {
      console.log('❌ Missing required fields');
      return new Response(JSON.stringify({
        error: 'Missing required fields: message, signature, wallet_address'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    console.log(`🔐 SIWS Verification Request for wallet: ${wallet_address}`);
    // Step 1: Verify the SIWS message signature
    try {
      const publicKey = new PublicKey(wallet_address);
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = new Uint8Array(signature);
      console.log('🔍 Verifying signature...');
      const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKey.toBytes());
      if (!isValid) {
        console.log(`❌ Invalid signature for wallet: ${wallet_address}`);
        return new Response(JSON.stringify({
          error: 'Invalid signature'
        }), {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      console.log(`✅ Signature verified for wallet: ${wallet_address}`);
    } catch (error) {
      console.error('❌ Error verifying signature:', error);
      return new Response(JSON.stringify({
        error: 'Signature verification failed',
        details: error.message
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Step 2: Extract nonce from SIWS message for validation
    const nonceMatch = message.match(/Nonce: ([a-f0-9-]+)/i);
    if (!nonceMatch) {
      console.log('❌ Invalid SIWS message format - missing nonce');
      return new Response(JSON.stringify({
        error: 'Invalid SIWS message format - missing nonce'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const nonce = nonceMatch[1];
    console.log('📝 Extracted nonce from SIWS message');
    // Step 3: Get or create user profile
    let userProfile;
    console.log('👤 Checking for existing user profile...');
    const { data: existingProfile, error: profileError } = await supabaseAdmin.from('user_profiles').select('*').eq('wallet_address', wallet_address).single();
    if (existingProfile) {
      // Update existing profile
      console.log('📝 Updating existing profile...');
      const { data: updatedProfile, error: updateError } = await supabaseAdmin.from('user_profiles').update({
        last_login_at: new Date().toISOString(),
        total_sessions: existingProfile.total_sessions + 1,
        updated_at: new Date().toISOString()
      }).eq('wallet_address', wallet_address).select().single();
      if (updateError) {
        console.error('❌ Error updating user profile:', updateError);
        throw updateError;
      }
      userProfile = updatedProfile;
      console.log(`👤 Updated existing profile for wallet: ${wallet_address}`);
    } else {
      // Create new profile
      console.log('✨ Creating new profile...');
      const { data: newProfile, error: createError } = await supabaseAdmin.from('user_profiles').insert({
        wallet_address,
        last_login_at: new Date().toISOString(),
        total_sessions: 1,
        oracle_relationship: 'novice',
        profile_completion: 20 // Base completion for wallet connection
      }).select().single();
      if (createError) {
        console.error('❌ Error creating user profile:', createError);
        throw createError;
      }
      userProfile = newProfile;
      console.log(`✨ Created new profile for wallet: ${wallet_address}`);
      // Initialize girth balance for new user
      console.log('💰 Initializing girth balance...');
      const { error: balanceError } = await supabaseAdmin.from('girth_balances').insert({
        user_profile_id: userProfile.id,
        soft_balance: 0.0,
        hard_balance: 0.0,
        lifetime_earned: 0.0,
        lifetime_minted: 0.0
      });
      if (balanceError) {
        console.error('❌ Error initializing girth balance:', balanceError);
      } else {
        console.log(`💰 Initialized girth balance for user: ${userProfile.id}`);
      }
      // Initialize oracle shards for new user
      console.log('🔷 Initializing oracle shards...');
      const { error: shardsError } = await supabaseAdmin.from('oracle_shards').insert({
        user_profile_id: userProfile.id,
        balance: 0,
        lifetime_earned: 0
      });
      if (shardsError) {
        console.error('❌ Error initializing oracle shards:', shardsError);
      } else {
        console.log(`🔷 Initialized oracle shards for user: ${userProfile.id}`);
      }
    }
    // Step 4: Create wallet session
    console.log('🎫 Creating wallet session...');
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 day session
    ;
    const { data: session, error: sessionError } = await supabaseAdmin.from('wallet_sessions').insert({
      user_profile_id: userProfile.id,
      session_token: sessionToken,
      wallet_address,
      siws_message: message,
      siws_signature: JSON.stringify(signature),
      siws_nonce: nonce,
      expires_at: expiresAt.toISOString(),
      last_active_at: new Date().toISOString(),
      ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: user_agent || req.headers.get('user-agent') || 'unknown'
    }).select().single();
    if (sessionError) {
      console.error('❌ Error creating wallet session:', sessionError);
      throw sessionError;
    }
    console.log(`🎫 Created session for user: ${userProfile.id}`);
    // 🚨 MIGRATION LOGIC REMOVED 🚨
    // This logic has been extracted to its own dedicated 'migrate-player-state'
    // edge function to create a more robust and explicit migration flow,
    // triggered by the client after authentication is complete.
    const migrationStatus = null;
    // Step 6: Get current girth balance
    console.log('💰 Fetching girth balance...');
    const { data: girthBalance } = await supabaseAdmin.from('girth_balances').select('*').eq('user_profile_id', userProfile.id).single();
    // Step 7: Get current oracle shards
    console.log('🔷 Fetching oracle shards...');
    const { data: oracleShards } = await supabaseAdmin.from('oracle_shards').select('*').eq('user_profile_id', userProfile.id).single();
    // Return successful authentication response
    const response = {
      success: true,
      user_profile: {
        id: userProfile.id,
        wallet_address: userProfile.wallet_address,
        username: userProfile.username,
        display_name: userProfile.display_name,
        oracle_relationship: userProfile.oracle_relationship,
        profile_completion: userProfile.profile_completion || 20,
        total_sessions: userProfile.total_sessions,
        created_at: userProfile.created_at,
        last_login_at: userProfile.last_login_at
      },
      session: {
        session_token: session.session_token,
        expires_at: session.expires_at,
        created_at: session.created_at
      },
      girth_balance: girthBalance ? {
        soft_balance: parseFloat(girthBalance.soft_balance || '0'),
        hard_balance: parseFloat(girthBalance.hard_balance || '0'),
        lifetime_earned: parseFloat(girthBalance.lifetime_earned || '0'),
        lifetime_minted: parseFloat(girthBalance.lifetime_minted || '0'),
        last_mint_at: girthBalance.last_mint_at
      } : null,
      oracle_shards: oracleShards ? {
        balance: parseInt(oracleShards.balance || '0'),
        lifetime_earned: parseInt(oracleShards.lifetime_earned || '0'),
        last_earn_at: oracleShards.last_earn_at,
        last_spend_at: oracleShards.last_spend_at
      } : null,
      migration_status: migrationStatus
    };
    console.log(`🎉 SIWS authentication successful for wallet: ${wallet_address}`);
    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('❌ Error in SIWS verification:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error during SIWS verification',
      details: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
