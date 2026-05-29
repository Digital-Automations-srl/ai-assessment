import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client backed by the SERVICE ROLE key.
// NON deve mai essere importato in un componente client: la service role
// bypassa le RLS e ha pieni poteri sul DB. Usato solo dalle route API
// (`/api/send-report`, `/api/track-result`) per le scritture.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    "[supabase-admin] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
}

export const supabaseAdmin =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;
