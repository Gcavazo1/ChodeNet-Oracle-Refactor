import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
Deno.serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    // Initialize Supabase client with service role key to bypass RLS
    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    const { wallet_address, soft_balance, lifetime_earned } = await req.json();
    if (!wallet_address) {
      return new Response(JSON.stringify({
        error: "Wallet address is required"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    console.log(`🔄 [UPDATE-BALANCE] Processing request for wallet: ${wallet_address}`);
    // 1. Get or create user profile
    let userProfileId = null;
    // First check if profile exists
    const { data: existingProfile, error: profileError } = await supabaseAdmin.from("user_profiles").select("id").eq("wallet_address", wallet_address).single();
    if (profileError) {
      if (profileError.code === "PGRST116") {
        console.log(`🆕 [UPDATE-BALANCE] Creating new user profile for wallet: ${wallet_address}`);
        // Create new profile
        const { data: newProfile, error: createError } = await supabaseAdmin.from("user_profiles").insert({
          wallet_address,
          last_login_at: new Date().toISOString(),
          total_sessions: 1,
          oracle_relationship: "novice",
          profile_completion: 20
        }).select("id").single();
        if (createError) {
          console.error(`❌ [UPDATE-BALANCE] Failed to create user profile:`, createError);
          return new Response(JSON.stringify({
            error: "Failed to create user profile",
            details: createError.message
          }), {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json"
            }
          });
        }
        userProfileId = newProfile.id;
        console.log(`✅ [UPDATE-BALANCE] Created user profile with ID: ${userProfileId}`);
      } else {
        console.error(`❌ [UPDATE-BALANCE] Error looking up user profile:`, profileError);
        return new Response(JSON.stringify({
          error: "Failed to lookup user profile",
          details: profileError.message
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }
    } else {
      userProfileId = existingProfile.id;
      console.log(`✅ [UPDATE-BALANCE] Found existing user profile with ID: ${userProfileId}`);
    }
    // 2. Update or create girth balance
    const { data: existingBalance, error: balanceError } = await supabaseAdmin.from("girth_balances").select("id, soft_balance, lifetime_earned").eq("user_profile_id", userProfileId).single();
    if (balanceError && balanceError.code !== "PGRST116") {
      console.error(`❌ [UPDATE-BALANCE] Error looking up girth balance:`, balanceError);
      return new Response(JSON.stringify({
        error: "Failed to lookup girth balance",
        details: balanceError.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    let balanceData;
    if (!existingBalance) {
      // Create new balance record
      const { data: newBalance, error: createBalanceError } = await supabaseAdmin.from("girth_balances").insert({
        user_profile_id: userProfileId,
        soft_balance: soft_balance || 0,
        hard_balance: 0,
        lifetime_earned: lifetime_earned || soft_balance || 0,
        lifetime_minted: 0,
        updated_at: new Date().toISOString()
      }).select("*").single();
      if (createBalanceError) {
        console.error(`❌ [UPDATE-BALANCE] Failed to create girth balance:`, createBalanceError);
        return new Response(JSON.stringify({
          error: "Failed to create girth balance",
          details: createBalanceError.message
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }
      balanceData = newBalance;
      console.log(`✅ [UPDATE-BALANCE] Created new girth balance record`);
    } else {
      // Update existing balance if values provided
      if (soft_balance !== undefined || lifetime_earned !== undefined) {
        const updates = {
          updated_at: new Date().toISOString()
        };
        if (soft_balance !== undefined) {
          updates.soft_balance = soft_balance;
        }
        if (lifetime_earned !== undefined) {
          updates.lifetime_earned = lifetime_earned;
        }
        const { data: updatedBalance, error: updateError } = await supabaseAdmin.from("girth_balances").update(updates).eq("id", existingBalance.id).select("*").single();
        if (updateError) {
          console.error(`❌ [UPDATE-BALANCE] Failed to update girth balance:`, updateError);
          return new Response(JSON.stringify({
            error: "Failed to update girth balance",
            details: updateError.message
          }), {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json"
            }
          });
        }
        balanceData = updatedBalance;
        console.log(`✅ [UPDATE-BALANCE] Updated existing girth balance`);
      } else {
        // No update needed, just return existing data
        balanceData = existingBalance;
        console.log(`ℹ️ [UPDATE-BALANCE] No balance update needed, returning existing data`);
      }
    }
    // 3. Return the balance data
    return new Response(JSON.stringify({
      success: true,
      user_profile_id: userProfileId,
      wallet_address,
      balance: {
        soft_balance: parseFloat(balanceData.soft_balance) || 0,
        hard_balance: parseFloat(balanceData.hard_balance) || 0,
        lifetime_earned: parseFloat(balanceData.lifetime_earned) || 0,
        lifetime_minted: parseFloat(balanceData.lifetime_minted) || 0,
        last_mint_at: balanceData.last_mint_at
      },
      updated_at: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("❌ [UPDATE-BALANCE] Unexpected error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      details: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
