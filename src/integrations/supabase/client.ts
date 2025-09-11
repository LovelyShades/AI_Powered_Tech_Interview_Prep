import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string; // 👈 changed

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables");
}

// If this might run during SSR, guard localStorage:
const canUseStorage = typeof window !== "undefined" && !!window.localStorage;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: canUseStorage ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
});
