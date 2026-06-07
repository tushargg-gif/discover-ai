import { createClient } from "@supabase/supabase-js";

/**
 * Shared Supabase client for the Next.js app (read-only, anon key).
 *
 * Browser-exposed env vars must be prefixed with NEXT_PUBLIC_. We fall back to
 * the unprefixed names so the same .env.local works for the data scripts too.
 */
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
