import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// These must match the names you set in Vercel / .env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env
  .VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  const missing = [
    !SUPABASE_URL ? "VITE_SUPABASE_URL" : null,
    !SUPABASE_PUBLISHABLE_KEY ? "VITE_SUPABASE_PUBLISHABLE_KEY" : null,
  ]
    .filter(Boolean)
    .join(", ");
  throw new Error(`Missing Supabase environment variables: ${missing}`);
}

// Guard localStorage if running during SSR
const canUseStorage = typeof window !== "undefined" && !!window.localStorage;

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: canUseStorage ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
