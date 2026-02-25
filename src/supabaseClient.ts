import { createClient } from '@supabase/supabase-js';

// Read from Vercel-style public env vars, with Vite fallbacks for local dev.
// On Vercel, set both NEXT_PUBLIC_* (per requirement) and mirror them as VITE_* if needed.
const env = import.meta.env as unknown as {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
};

const supabaseUrl =
  env.NEXT_PUBLIC_SUPABASE_URL ||
  env.VITE_SUPABASE_URL ||
  'https://jgykslzahnmrstewvgry.supabase.co';

const supabaseAnonKey =
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_jersFWj_FOumc07wpeQe4Q_n-E6ktK4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
