import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client backed by the SECRET key (formato moderno
// `sb_secret_...`, rimpiazza la legacy service_role). NON deve mai essere
// importato in un componente client: ha pieni poteri sul DB e bypassa le RLS.
// Usato solo dalle route API (`/api/send-report`, `/api/track-result`) per le scritture.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !secretKey) {
  console.warn(
    "[supabase-admin] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY"
  );
}

export const supabaseAdmin =
  supabaseUrl && secretKey
    ? createClient(supabaseUrl, secretKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;
