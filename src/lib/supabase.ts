import { createClient, SupabaseClient } from '@supabase/supabase-js';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error(
    'Supabase environment variables are missing. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

// Ensure we only create *one* Supabase client per browser tab to silence
// the "Multiple GoTrueClient instances detected" warning.
declare global {
  // eslint-disable-next-line no-var
  var __supabase__: SupabaseClient | undefined;
}

export const supabase: SupabaseClient =
  globalThis.__supabase__ ??
  createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

// Store on global so the same instance is reused on subsequent imports / HMR reloads.
if (!globalThis.__supabase__) {
  globalThis.__supabase__ = supabase;
}